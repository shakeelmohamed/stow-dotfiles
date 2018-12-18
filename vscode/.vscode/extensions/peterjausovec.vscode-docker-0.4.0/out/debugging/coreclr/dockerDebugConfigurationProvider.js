"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
class DockerDebugConfigurationProvider {
    constructor(debugSessionManager, dockerManager, fsProvider, osProvider, netCoreProjectProvider, prerequisite) {
        this.debugSessionManager = debugSessionManager;
        this.dockerManager = dockerManager;
        this.fsProvider = fsProvider;
        this.osProvider = osProvider;
        this.netCoreProjectProvider = netCoreProjectProvider;
        this.prerequisite = prerequisite;
    }
    provideDebugConfigurations(folder, token) {
        return [
            {
                name: 'Docker: Launch .NET Core (Preview)',
                type: 'docker-coreclr',
                request: 'launch',
                preLaunchTask: 'build',
                dockerBuild: {},
                dockerRun: {}
            }
        ];
    }
    resolveDebugConfiguration(folder, debugConfiguration, token) {
        return vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('debugCoreClr', async () => await this.resolveDockerDebugConfiguration(folder, debugConfiguration));
    }
    static resolveFolderPath(folderPath, folder) {
        return folderPath.replace(/\$\{workspaceFolder\}/gi, folder.uri.fsPath);
    }
    async resolveDockerDebugConfiguration(folder, debugConfiguration) {
        if (!folder) {
            throw new Error('No workspace folder is associated with debugging.');
        }
        const prerequisiteSatisfied = await this.prerequisite.checkPrerequisite();
        if (!prerequisiteSatisfied) {
            return undefined;
        }
        const appFolder = this.inferAppFolder(folder, debugConfiguration);
        const resolvedAppFolder = DockerDebugConfigurationProvider.resolveFolderPath(appFolder, folder);
        const appProject = await this.inferAppProject(debugConfiguration, resolvedAppFolder);
        const resolvedAppProject = DockerDebugConfigurationProvider.resolveFolderPath(appProject, folder);
        const appName = path.basename(resolvedAppProject, '.csproj');
        const os = debugConfiguration && debugConfiguration.dockerRun && debugConfiguration.dockerRun.os
            ? debugConfiguration.dockerRun.os
            : 'Linux';
        const appOutput = await this.inferAppOutput(debugConfiguration, os, resolvedAppProject);
        const buildOptions = DockerDebugConfigurationProvider.inferBuildOptions(folder, debugConfiguration, appFolder, resolvedAppFolder, appName);
        const runOptions = DockerDebugConfigurationProvider.inferRunOptions(folder, debugConfiguration, appName, os);
        const result = await this.dockerManager.prepareForLaunch({
            appFolder: resolvedAppFolder,
            appOutput,
            build: buildOptions,
            run: runOptions
        });
        const configuration = this.createConfiguration(debugConfiguration, appFolder, result);
        this.debugSessionManager.startListening();
        return configuration;
    }
    static inferBuildOptions(folder, debugConfiguration, appFolder, resolvedAppFolder, appName) {
        const context = DockerDebugConfigurationProvider.inferContext(folder, resolvedAppFolder, debugConfiguration);
        const resolvedContext = DockerDebugConfigurationProvider.resolveFolderPath(context, folder);
        let dockerfile = debugConfiguration && debugConfiguration.dockerBuild && debugConfiguration.dockerBuild.dockerfile
            ? DockerDebugConfigurationProvider.resolveFolderPath(debugConfiguration.dockerBuild.dockerfile, folder)
            : path.join(appFolder, 'Dockerfile'); // CONSIDER: Omit dockerfile argument if not specified or possibly infer from context.
        dockerfile = DockerDebugConfigurationProvider.resolveFolderPath(dockerfile, folder);
        const args = debugConfiguration && debugConfiguration.dockerBuild && debugConfiguration.dockerBuild.args;
        const labels = (debugConfiguration && debugConfiguration.dockerBuild && debugConfiguration.dockerBuild.labels)
            || DockerDebugConfigurationProvider.defaultLabels;
        const tag = debugConfiguration && debugConfiguration.dockerBuild && debugConfiguration.dockerBuild.tag
            ? debugConfiguration.dockerBuild.tag
            : `${appName.toLowerCase()}:dev`;
        const target = debugConfiguration && debugConfiguration.dockerBuild && debugConfiguration.dockerBuild.target
            ? debugConfiguration.dockerBuild.target
            : 'base'; // CONSIDER: Omit target if not specified, or possibly infer from Dockerfile.
        return {
            args,
            context: resolvedContext,
            dockerfile,
            labels,
            tag,
            target
        };
    }
    static inferRunOptions(folder, debugConfiguration, appName, os) {
        const containerName = debugConfiguration && debugConfiguration.dockerRun && debugConfiguration.dockerRun.containerName
            ? debugConfiguration.dockerRun.containerName
            : `${appName}-dev`; // CONSIDER: Use unique ID instead?
        const env = debugConfiguration && debugConfiguration.dockerRun && debugConfiguration.dockerRun.env;
        const envFiles = debugConfiguration && debugConfiguration.dockerRun && debugConfiguration.dockerRun.envFiles
            ? debugConfiguration.dockerRun.envFiles.map(file => DockerDebugConfigurationProvider.resolveFolderPath(file, folder))
            : undefined;
        const labels = (debugConfiguration && debugConfiguration.dockerRun && debugConfiguration.dockerRun.labels)
            || DockerDebugConfigurationProvider.defaultLabels;
        return {
            containerName,
            env,
            envFiles,
            labels,
            os,
        };
    }
    inferAppFolder(folder, configuration) {
        if (configuration) {
            if (configuration.appFolder) {
                return configuration.appFolder;
            }
            if (configuration.appProject) {
                return path.dirname(configuration.appProject);
            }
        }
        return folder.uri.fsPath;
    }
    async inferAppOutput(configuration, targetOS, resolvedAppProject) {
        if (configuration && configuration.appOutput) {
            return configuration.appOutput;
        }
        const targetPath = await this.netCoreProjectProvider.getTargetPath(resolvedAppProject);
        const relativeTargetPath = this.osProvider.pathNormalize(targetOS, path.relative(path.dirname(resolvedAppProject), targetPath));
        return relativeTargetPath;
    }
    async inferAppProject(configuration, resolvedAppFolder) {
        if (configuration) {
            if (configuration.appProject) {
                return configuration.appProject;
            }
        }
        const files = await this.fsProvider.readDir(resolvedAppFolder);
        const projectFile = files.find(file => path.extname(file) === '.csproj');
        if (projectFile) {
            return path.join(resolvedAppFolder, projectFile);
        }
        throw new Error('Unable to infer the application project file. Set either the `appFolder` or `appProject` property in the Docker debug configuration.');
    }
    static inferContext(folder, resolvedAppFolder, configuration) {
        return configuration && configuration.dockerBuild && configuration.dockerBuild.context
            ? configuration.dockerBuild.context
            : path.normalize(resolvedAppFolder) === path.normalize(folder.uri.fsPath)
                ? resolvedAppFolder // The context defaults to the application folder if it's the same as the workspace folder (i.e. there's no solution folder).
                : path.dirname(resolvedAppFolder); // The context defaults to the application's parent (i.e. solution) folder.
    }
    createLaunchBrowserConfiguration(result) {
        return result.browserUrl
            ? {
                enabled: true,
                args: result.browserUrl,
                windows: {
                    command: 'cmd.exe',
                    args: `/C start ${result.browserUrl}`
                },
                osx: {
                    command: 'open'
                },
                linux: {
                    command: 'xdg-open'
                }
            }
            : {
                enabled: false
            };
    }
    createConfiguration(debugConfiguration, appFolder, result) {
        const launchBrowser = this.createLaunchBrowserConfiguration(result);
        return {
            name: debugConfiguration.name,
            type: 'coreclr',
            request: 'launch',
            program: result.program,
            args: result.programArgs.join(' '),
            cwd: result.programCwd,
            launchBrowser,
            pipeTransport: {
                pipeCwd: result.pipeCwd,
                pipeProgram: result.pipeProgram,
                pipeArgs: result.pipeArgs,
                debuggerPath: result.debuggerPath,
                quoteArgs: false
            },
            preLaunchTask: debugConfiguration.preLaunchTask,
            sourceFileMap: {
                '/app/Views': path.join(appFolder, 'Views')
            }
        };
    }
}
DockerDebugConfigurationProvider.defaultLabels = { 'com.microsoft.created-by': 'visual-studio-code' };
exports.DockerDebugConfigurationProvider = DockerDebugConfigurationProvider;
exports.default = DockerDebugConfigurationProvider;
//# sourceMappingURL=dockerDebugConfigurationProvider.js.map