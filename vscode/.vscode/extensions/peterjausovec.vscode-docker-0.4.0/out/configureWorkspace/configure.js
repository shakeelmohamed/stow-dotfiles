"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const fse = require("fs-extra");
const gradleParser = require("gradle-to-js/lib/parser");
const path = require("path");
const pomParser = require("pom-parser");
const vscode = require("vscode");
const quickPickWorkspaceFolder_1 = require("../commands/utils/quickPickWorkspaceFolder");
const extensionVariables_1 = require("../extensionVariables");
const async_1 = require("../helpers/async");
const extractRegExGroups_1 = require("../helpers/extractRegExGroups");
const config_utils_1 = require("./config-utils");
const configure_dotnetcore_1 = require("./configure_dotnetcore");
const configure_go_1 = require("./configure_go");
const configure_java_1 = require("./configure_java");
const configure_node_1 = require("./configure_node");
const configure_other_1 = require("./configure_other");
const configure_python_1 = require("./configure_python");
const configure_ruby_1 = require("./configure_ruby");
function getExposeStatements(port) {
    return port ? `EXPOSE ${port}` : '';
}
exports.getExposeStatements = getExposeStatements;
const generatorsByPlatform = new Map();
generatorsByPlatform.set('ASP.NET Core', configure_dotnetcore_1.configureAspDotNetCore);
generatorsByPlatform.set('Go', configure_go_1.configureGo);
generatorsByPlatform.set('Java', configure_java_1.configureJava);
generatorsByPlatform.set('.NET Core Console', configure_dotnetcore_1.configureDotNetCoreConsole);
generatorsByPlatform.set('Node.js', configure_node_1.configureNode);
generatorsByPlatform.set('Python', configure_python_1.configurePython);
generatorsByPlatform.set('Ruby', configure_ruby_1.configureRuby);
generatorsByPlatform.set('Other', configure_other_1.configureOther);
function genDockerFile(serviceNameAndRelativePath, platform, os, port, { cmd, author, version, artifactName }) {
    let generators = generatorsByPlatform.get(platform);
    assert(generators, `Could not find dockerfile generator functions for "${platform}"`);
    if (generators.genDockerFile) {
        let contents = generators.genDockerFile(serviceNameAndRelativePath, platform, os, port, { cmd, author, version, artifactName });
        // Remove multiple empty lines with single empty lines, as might be produced
        // if $expose_statements$ or another template variable is an empty string
        contents = contents.replace(/(\r\n){3}/g, "\r\n\r\n")
            .replace(/(\n){3}/g, "\n\n");
        return contents;
    }
}
function genDockerCompose(serviceNameAndRelativePath, platform, os, port) {
    let generators = generatorsByPlatform.get(platform);
    assert(generators, `Could not find docker compose file generator function for "${platform}"`);
    if (generators.genDockerCompose) {
        return generators.genDockerCompose(serviceNameAndRelativePath, platform, os, port);
    }
}
function genDockerComposeDebug(serviceNameAndRelativePath, platform, os, port, packageInfo) {
    let generators = generatorsByPlatform.get(platform);
    assert(generators, `Could not find docker debug compose file generator function for "${platform}"`);
    if (generators.genDockerComposeDebug) {
        return generators.genDockerComposeDebug(serviceNameAndRelativePath, platform, os, port, packageInfo);
    }
}
function genDockerIgnoreFile(service, platformType, os, port) {
    return `node_modules
npm-debug.log
Dockerfile*
docker-compose*
.dockerignore
.git
.gitignore
.env
*/bin
*/obj
README.md
LICENSE
.vscode`;
}
async function getPackageJson(folderPath) {
    return vscode.workspace.findFiles(new vscode.RelativePattern(folderPath, 'package.json'), null, 1, undefined);
}
function getDefaultPackageInfo() {
    return {
        npmStart: true,
        fullCommand: 'npm start',
        cmd: 'npm start',
        author: 'author',
        version: '0.0.1',
        artifactName: ''
    };
}
async function readPackageJson(folderPath) {
    // open package.json and look for main, scripts start
    const uris = await getPackageJson(folderPath);
    let packageInfo = getDefaultPackageInfo(); //default
    let packagePath;
    if (uris && uris.length > 0) {
        packagePath = uris[0].fsPath;
        const json = JSON.parse(fse.readFileSync(packagePath, 'utf8'));
        if (json.scripts && typeof json.scripts.start === "string") {
            packageInfo.npmStart = true;
            packageInfo.fullCommand = json.scripts.start;
            packageInfo.cmd = 'npm start';
        }
        else if (typeof json.main === "string") {
            packageInfo.npmStart = false;
            packageInfo.fullCommand = 'node' + ' ' + json.main;
            packageInfo.cmd = packageInfo.fullCommand;
        }
        else {
            packageInfo.fullCommand = '';
        }
        if (typeof json.author === "string") {
            packageInfo.author = json.author;
        }
        if (typeof json.version === "string") {
            packageInfo.version = json.version;
        }
    }
    return { packagePath, packageInfo };
}
/**
 * Looks for a pom.xml or build.gradle file, and returns its parsed contents, or else a default package contents if none path
 */
async function readPomOrGradle(folderPath) {
    let pkg = getDefaultPackageInfo(); //default
    let foundPath;
    let pomPath = path.join(folderPath, 'pom.xml');
    let gradlePath = path.join(folderPath, 'build.gradle');
    if (await fse.pathExists(pomPath)) {
        foundPath = pomPath;
        let json = await new Promise((resolve, reject) => {
            // tslint:disable-next-line:no-unsafe-any
            pomParser.parse({
                filePath: pomPath
            }, (error, response) => {
                if (error) {
                    reject(`Failed to parse pom.xml: ${error}`);
                    return;
                }
                resolve(response.pomObject);
            });
        });
        json = json || {};
        if (json.project && json.project.version) {
            pkg.version = json.project.version;
        }
        if (json.project && json.project.artifactid) {
            pkg.artifactName = `target/${json.project.artifactid}-${pkg.version}.jar`;
        }
    }
    else if (await fse.pathExists(gradlePath)) {
        foundPath = gradlePath;
        const json = await gradleParser.parseFile(gradlePath);
        if (json.jar && json.jar.version) {
            pkg.version = json.jar.version;
        }
        else if (json.version) {
            pkg.version = json.version;
        }
        if (json.jar && json.jar.archiveName) {
            pkg.artifactName = `build/libs/${json.jar.archiveName}`;
        }
        else {
            const baseName = json.jar && json.jar.baseName ? json.jar.baseName : json.archivesBaseName || path.basename(folderPath);
            pkg.artifactName = `build/libs/${baseName}-${pkg.version}.jar`;
        }
    }
    return { foundPath, packageInfo: pkg };
}
// Returns the relative path of the project file without the extension
async function findCSProjFile(folderPath) {
    const opt = {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: 'Select Project'
    };
    const projectFiles = await async_1.globAsync('**/*.csproj', { cwd: folderPath });
    if (!projectFiles || !projectFiles.length) {
        throw new Error("No .csproj file could be found. You need a C# project file in the workspace to generate Docker files for the selected platform.");
    }
    if (projectFiles.length > 1) {
        let items = projectFiles.map(p => ({ label: p }));
        let result = await extensionVariables_1.ext.ui.showQuickPick(items, opt);
        return result.label;
    }
    else {
        return projectFiles[0];
    }
}
const DOCKER_FILE_TYPES = {
    'docker-compose.yml': genDockerCompose,
    'docker-compose.debug.yml': genDockerComposeDebug,
    'Dockerfile': genDockerFile,
    '.dockerignore': genDockerIgnoreFile
};
const YES_PROMPT = {
    title: "Yes",
    isCloseAffordance: false
};
const YES_OR_NO_PROMPTS = [
    YES_PROMPT,
    {
        title: "No",
        isCloseAffordance: true
    }
];
async function configure(actionContext, rootFolderPath) {
    if (!rootFolderPath) {
        let folder = await quickPickWorkspaceFolder_1.quickPickWorkspaceFolder('To generate Docker files you must first open a folder or workspace in VS Code.');
        rootFolderPath = folder.uri.fsPath;
    }
    let filesWritten = await configureCore(actionContext, {
        rootPath: rootFolderPath,
        outputFolder: rootFolderPath,
        openDockerFile: true
    });
    // Open the dockerfile (if written)
    try {
        let dockerfile = filesWritten.find(fp => path.basename(fp).toLowerCase() === 'dockerfile');
        if (dockerfile) {
            await vscode.window.showTextDocument(vscode.Uri.file(dockerfile));
        }
    }
    catch (err) {
        // Ignore
    }
}
exports.configure = configure;
async function configureApi(actionContext, options) {
    await configureCore(actionContext, options);
}
exports.configureApi = configureApi;
// tslint:disable-next-line:max-func-body-length // Because of nested functions
async function configureCore(actionContext, options) {
    let properties = actionContext.properties;
    let rootFolderPath = options.rootPath;
    let outputFolder = options.outputFolder;
    const platformType = options.platform || await config_utils_1.quickPickPlatform();
    properties.configurePlatform = platformType;
    let generatorInfo = generatorsByPlatform.get(platformType);
    let os = options.os;
    if (!os && platformType.toLowerCase().includes('.net')) {
        os = await config_utils_1.quickPickOS();
    }
    properties.configureOs = os;
    let port = options.port;
    if (!port && generatorInfo.defaultPort !== undefined) {
        port = await config_utils_1.promptForPort(generatorInfo.defaultPort);
    }
    let targetFramework;
    let serviceNameAndPathRelativeToOutput;
    {
        // Scope serviceNameAndPathRelativeToRoot only to this block of code
        let serviceNameAndPathRelativeToRoot;
        if (platformType.toLowerCase().includes('.net')) {
            let csProjFilePath = await findCSProjFile(rootFolderPath);
            serviceNameAndPathRelativeToRoot = csProjFilePath.slice(0, -'.csproj'.length);
            let csProjFileContents = (await fse.readFile(path.join(rootFolderPath, csProjFilePath))).toString();
            // Extract TargetFramework for version
            [targetFramework] = extractRegExGroups_1.extractRegExGroups(csProjFileContents, /<TargetFramework>(.+)<\/TargetFramework/, ['']);
            properties.packageFileType = '.csproj';
            properties.packageFileSubfolderDepth = getSubfolderDepth(serviceNameAndPathRelativeToRoot);
        }
        else {
            serviceNameAndPathRelativeToRoot = path.basename(rootFolderPath).toLowerCase();
        }
        // We need paths in the Dockerfile to be relative to the output folder, not the root
        serviceNameAndPathRelativeToOutput = path.relative(outputFolder, path.join(rootFolderPath, serviceNameAndPathRelativeToRoot));
        serviceNameAndPathRelativeToOutput = serviceNameAndPathRelativeToOutput.replace(/\\/g, '/');
    }
    let packageInfo = getDefaultPackageInfo();
    if (platformType === 'Java') {
        let foundPomOrGradlePath;
        ({ packageInfo, foundPath: foundPomOrGradlePath } = await readPomOrGradle(rootFolderPath));
        if (foundPomOrGradlePath) {
            properties.packageFileType = path.basename(foundPomOrGradlePath);
            properties.packageFileSubfolderDepth = getSubfolderDepth(foundPomOrGradlePath);
        }
    }
    else {
        let packagePath;
        ({ packagePath, packageInfo } = await readPackageJson(rootFolderPath));
        if (packagePath) {
            properties.packageFileType = 'package.json';
            properties.packageFileSubfolderDepth = getSubfolderDepth(packagePath);
        }
    }
    if (targetFramework) {
        packageInfo.version = targetFramework;
    }
    let filesWritten = [];
    await Promise.all(Object.keys(DOCKER_FILE_TYPES).map(async (fileName) => {
        return createWorkspaceFileIfNotExists(fileName, DOCKER_FILE_TYPES[fileName]);
    }));
    return filesWritten;
    async function createWorkspaceFileIfNotExists(fileName, generatorFunction) {
        const filePath = path.join(outputFolder, fileName);
        let writeFile = false;
        if (await fse.pathExists(filePath)) {
            const response = await vscode.window.showErrorMessage(`"${fileName}" already exists. Would you like to overwrite it?`, ...YES_OR_NO_PROMPTS);
            if (response === YES_PROMPT) {
                writeFile = true;
            }
        }
        else {
            writeFile = true;
        }
        if (writeFile) {
            // Paths in the docker files should be relative to the Dockerfile (which is in the output folder)
            let fileContents = generatorFunction(serviceNameAndPathRelativeToOutput, platformType, os, port, packageInfo);
            if (fileContents) {
                fse.writeFileSync(filePath, fileContents, { encoding: 'utf8' });
                filesWritten.push(filePath);
            }
        }
    }
    function getSubfolderDepth(filePath) {
        let relativeToRoot = path.relative(outputFolder, path.resolve(outputFolder, filePath));
        let matches = relativeToRoot.match(/[\/\\]/g);
        let depth = matches ? matches.length : 0;
        return String(depth);
    }
}
//# sourceMappingURL=configure.js.map