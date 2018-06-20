"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const protocol = require("./omnisharp/protocol");
const serverUtils = require("./omnisharp/utils");
const util = require("./common");
const vscode = require("vscode");
const json_1 = require("./json");
class AssetGenerator {
    constructor(workspaceInfo, workspaceFolder = undefined) {
        if (workspaceFolder) {
            this.workspaceFolder = workspaceFolder;
        }
        else {
            let resourcePath = undefined;
            if (!resourcePath && workspaceInfo.Cake) {
                resourcePath = workspaceInfo.Cake.Path;
            }
            if (!resourcePath && workspaceInfo.ScriptCs) {
                resourcePath = workspaceInfo.ScriptCs.Path;
            }
            if (!resourcePath && workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                resourcePath = workspaceInfo.DotNet.Projects[0].Path;
            }
            if (!resourcePath && workspaceInfo.MsBuild) {
                resourcePath = workspaceInfo.MsBuild.SolutionPath;
            }
            this.workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(resourcePath));
        }
        this.vscodeFolder = path.join(this.workspaceFolder.uri.fsPath, '.vscode');
        this.tasksJsonPath = path.join(this.vscodeFolder, 'tasks.json');
        this.launchJsonPath = path.join(this.vscodeFolder, 'launch.json');
        this.initializeProjectData(workspaceInfo);
    }
    initializeProjectData(workspaceInfo) {
        // TODO: For now, assume the Debug configuration. Eventually, we'll need to revisit
        // this when we allow selecting configurations.
        const configurationName = 'Debug';
        // First, we'll check for .NET Core .csproj projects.
        if (workspaceInfo.MsBuild && workspaceInfo.MsBuild.Projects) {
            const executableMSBuildProjects = protocol.findExecutableMSBuildProjects(workspaceInfo.MsBuild.Projects);
            const targetMSBuildProject = executableMSBuildProjects.length > 0
                ? executableMSBuildProjects[0]
                : undefined;
            if (targetMSBuildProject) {
                this.hasProject = true;
                this.projectPath = path.dirname(targetMSBuildProject.Path);
                this.projectFilePath = targetMSBuildProject.Path;
                this.targetFramework = protocol.findNetCoreAppTargetFramework(targetMSBuildProject).ShortName;
                this.executableName = targetMSBuildProject.AssemblyName + ".dll";
                this.configurationName = configurationName;
                return;
            }
        }
        // Next, we'll try looking for project.json projects.
        const executableProjects = protocol.findExecutableProjectJsonProjects(workspaceInfo.DotNet.Projects, configurationName);
        // TODO: We arbitrarily pick the first executable project that we find. This will need
        // revisiting when we project a "start up project" selector.
        const targetProject = executableProjects.length > 0
            ? executableProjects[0]
            : undefined;
        if (targetProject && targetProject.Frameworks.length > 0) {
            const config = targetProject.Configurations.find(c => c.Name === configurationName);
            if (config) {
                this.hasProject = true;
                this.projectPath = targetProject.Path;
                this.projectFilePath = path.join(targetProject.Path, 'project.json');
                this.targetFramework = targetProject.Frameworks[0].ShortName;
                this.executableName = path.basename(config.CompilationOutputAssemblyFile);
                this.configurationName = configurationName;
            }
        }
        return;
    }
    hasWebServerDependency() {
        // TODO: Update to handle .NET Core projects.
        if (!this.projectFilePath) {
            return false;
        }
        let projectFileText = fs.readFileSync(this.projectFilePath, 'utf8');
        if (path.basename(this.projectFilePath).toLowerCase() === 'project.json') {
            let projectJsonObject;
            try {
                projectJsonObject = json_1.tolerantParse(projectFileText);
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to parse project.json file');
                projectJsonObject = null;
            }
            if (projectJsonObject == null) {
                return false;
            }
            for (let key in projectJsonObject.dependencies) {
                if (key.toLowerCase().startsWith("microsoft.aspnetcore.server")) {
                    return true;
                }
            }
        }
        // Assume that this is an MSBuild project. In that case, look for the 'Sdk="Microsoft.NET.Sdk.Web"' attribute.
        // TODO: Have OmniSharp provide the list of SDKs used by a project and check that list instead.
        return projectFileText.toLowerCase().indexOf('sdk="microsoft.net.sdk.web"') >= 0;
    }
    computeProgramPath() {
        if (!this.hasProject) {
            // If there's no target project data, use a placeholder for the path.
            return '${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll';
        }
        let result = '${workspaceFolder}';
        if (this.projectPath) {
            result = path.join(result, path.relative(this.workspaceFolder.uri.fsPath, this.projectPath));
        }
        result = path.join(result, `bin/${this.configurationName}/${this.targetFramework}/${this.executableName}`);
        return result;
    }
    computeWorkingDirectory() {
        if (!this.hasProject) {
            // If there's no target project data, use a placeholder for the path.
            return '${workspaceFolder}';
        }
        let result = '${workspaceFolder}';
        if (this.projectPath) {
            result = path.join(result, path.relative(this.workspaceFolder.uri.fsPath, this.projectPath));
        }
        return result;
    }
    createLaunchJson(isWebProject) {
        if (!isWebProject) {
            const launchConfigurationsMassaged = indentJsonString(createLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory()));
            const attachConfigurationsMassaged = indentJsonString(createAttachConfiguration());
            return `
[
    ${launchConfigurationsMassaged},
    ${attachConfigurationsMassaged}
]`;
        }
        else {
            const webLaunchConfigurationsMassaged = indentJsonString(createWebLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory()));
            const attachConfigurationsMassaged = indentJsonString(createAttachConfiguration());
            return `
[
    ${webLaunchConfigurationsMassaged},
    ${attachConfigurationsMassaged}
]`;
        }
    }
    createBuildTaskDescription() {
        let buildPath = '';
        if (this.hasProject) {
            buildPath = path.join('${workspaceFolder}', path.relative(this.workspaceFolder.uri.fsPath, this.projectFilePath));
        }
        return {
            label: 'build',
            command: 'dotnet',
            type: 'process',
            args: ['build', util.convertNativePathToPosix(buildPath)],
            problemMatcher: '$msCompile'
        };
    }
    createTasksConfiguration() {
        return {
            version: "2.0.0",
            tasks: [this.createBuildTaskDescription()]
        };
    }
}
exports.AssetGenerator = AssetGenerator;
function createWebLaunchConfiguration(programPath, workingDirectory) {
    return `
{
    "name": ".NET Core Launch (web)",
    "type": "coreclr",
    "request": "launch",
    "preLaunchTask": "build",
    // If you have changed target frameworks, make sure to update the program path.
    "program": "${util.convertNativePathToPosix(programPath)}",
    "args": [],
    "cwd": "${util.convertNativePathToPosix(workingDirectory)}",
    "stopAtEntry": false,
    "internalConsoleOptions": "openOnSessionStart",
    "launchBrowser": {
        "enabled": true,
        "args": "\${auto-detect-url}",
        "windows": {
            "command": "cmd.exe",
            "args": "/C start \${auto-detect-url}"
        },
        "osx": {
            "command": "open"
        },
        "linux": {
            "command": "xdg-open"
        }
    },
    "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
    },
    "sourceFileMap": {
        "/Views": "\${workspaceFolder}/Views"
    }
}`;
}
exports.createWebLaunchConfiguration = createWebLaunchConfiguration;
function createLaunchConfiguration(programPath, workingDirectory) {
    return `
{
    "name": ".NET Core Launch (console)",
    "type": "coreclr",
    "request": "launch",
    "preLaunchTask": "build",
    // If you have changed target frameworks, make sure to update the program path.
    "program": "${util.convertNativePathToPosix(programPath)}",
    "args": [],
    "cwd": "${util.convertNativePathToPosix(workingDirectory)}",
    // For more information about the 'console' field, see https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md#console-terminal-window
    "console": "internalConsole",
    "stopAtEntry": false,
    "internalConsoleOptions": "openOnSessionStart"
}`;
}
exports.createLaunchConfiguration = createLaunchConfiguration;
// AttachConfiguration
function createAttachConfiguration() {
    return `
{
    "name": ".NET Core Attach",
    "type": "coreclr",
    "request": "attach",
    "processId": "\${command:pickProcess}"
}`;
}
exports.createAttachConfiguration = createAttachConfiguration;
function hasAddOperations(operations) {
    return operations.addLaunchJson || operations.addLaunchJson;
}
function getOperations(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return getBuildOperations(generator.tasksJsonPath).then((operations) => __awaiter(this, void 0, void 0, function* () { return getLaunchOperations(generator.launchJsonPath, operations); }));
    });
}
/**
 * Will return old (version=0.1.0) or new (version=2.0.0) tasks. If there are any of them, do not
 * write over the tasks.json.
 */
function getBuildTasks(tasksConfiguration) {
    let result = [];
    const tasksV1 = "0.1.0";
    const tasksV2 = "2.0.0";
    function findBuildTask(version, tasksDescriptions) {
        let buildTask = undefined;
        // Find the old tasks
        if (version === tasksV1 && tasksDescriptions) {
            buildTask = tasksDescriptions.find(td => td.isBuildCommand);
        }
        // Find the new tasks
        else if (version === tasksV2 && tasksDescriptions) {
            buildTask = tasksDescriptions.find(td => td.group === 'build');
        }
        if (buildTask !== undefined) {
            result.push(buildTask);
        }
    }
    findBuildTask(tasksConfiguration.version, tasksConfiguration.tasks);
    if (tasksConfiguration.windows) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.windows.tasks);
    }
    if (tasksConfiguration.osx) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.osx.tasks);
    }
    if (tasksConfiguration.linux) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.linux.tasks);
    }
    return result;
}
function getBuildOperations(tasksJsonPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.exists(tasksJsonPath, exists => {
                if (exists) {
                    fs.readFile(tasksJsonPath, (err, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        const text = buffer.toString();
                        let tasksConfiguration;
                        try {
                            tasksConfiguration = json_1.tolerantParse(text);
                        }
                        catch (error) {
                            vscode.window.showErrorMessage(`Failed to parse tasks.json file`);
                            return resolve({ updateTasksJson: false });
                        }
                        let buildTasks = getBuildTasks(tasksConfiguration);
                        resolve({ updateTasksJson: buildTasks.length === 0 });
                    });
                }
                else {
                    resolve({ addTasksJson: true });
                }
            });
        });
    });
}
function getLaunchOperations(launchJsonPath, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            return fs.exists(launchJsonPath, exists => {
                if (exists) {
                    resolve(operations);
                }
                else {
                    operations.addLaunchJson = true;
                    resolve(operations);
                }
            });
        });
    });
}
var PromptResult;
(function (PromptResult) {
    PromptResult[PromptResult["Yes"] = 0] = "Yes";
    PromptResult[PromptResult["No"] = 1] = "No";
    PromptResult[PromptResult["Disable"] = 2] = "Disable";
})(PromptResult || (PromptResult = {}));
function promptToAddAssets(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const yesItem = { title: 'Yes', result: PromptResult.Yes };
            const noItem = { title: 'Not Now', result: PromptResult.No, isCloseAffordance: true };
            const disableItem = { title: "Don't Ask Again", result: PromptResult.Disable };
            const projectName = path.basename(workspaceFolder.uri.fsPath);
            vscode.window.showWarningMessage(`Required assets to build and debug are missing from '${projectName}'. Add them?`, disableItem, noItem, yesItem)
                .then(selection => resolve(selection.result));
        });
    });
}
function addTasksJsonIfNecessary(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!operations.addTasksJson) {
                return resolve();
            }
            // Read existing Tasks configuration
            const tasksConfigs = vscode.workspace.getConfiguration('tasks');
            let existingTaskConfigs = tasksConfigs.get('tasks');
            const tasksJson = generator.createTasksConfiguration();
            if (existingTaskConfigs) {
                tasksJson['tasks'] = tasksJson['tasks'].concat(existingTaskConfigs);
            }
            const tasksJsonText = JSON.stringify(tasksJson, null, '    ');
            fs.writeFile(generator.tasksJsonPath, tasksJsonText, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
exports.addTasksJsonIfNecessary = addTasksJsonIfNecessary;
function indentJsonString(json, numSpaces = 4) {
    return json.split('\n').map(line => ' '.repeat(numSpaces) + line).join('\n').trim();
}
function addLaunchJsonIfNecessary(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!operations.addLaunchJson) {
                return resolve();
            }
            // Read existing launch configuration
            const launchConfigs = vscode.workspace.getConfiguration('launch');
            let existingLaunchConfigs = launchConfigs.get('configurations');
            const isWebProject = generator.hasWebServerDependency();
            let launchJson = generator.createLaunchJson(isWebProject);
            if (existingLaunchConfigs) {
                let existingLaunchConfigsString = JSON.stringify(existingLaunchConfigs, null, '    ');
                const lastBracket = launchJson.lastIndexOf(']');
                const lastBracketInExistingConfig = existingLaunchConfigsString.lastIndexOf(']');
                const firstBracketInExistingConfig = existingLaunchConfigsString.indexOf('[');
                if (lastBracket !== -1 && lastBracketInExistingConfig !== -1 && firstBracketInExistingConfig !== -1) {
                    launchJson = launchJson.substring(0, lastBracket);
                    existingLaunchConfigsString = existingLaunchConfigsString.substring(firstBracketInExistingConfig + 1, lastBracketInExistingConfig);
                    launchJson = `${launchJson},${existingLaunchConfigsString}]`;
                }
            }
            const configurationsMassaged = indentJsonString(launchJson);
            const launchJsonText = `
{
   // Use IntelliSense to find out which attributes exist for C# debugging
   // Use hover for the description of the existing attributes
   // For further information visit https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md
   "version": "0.2.0",
   "configurations": ${configurationsMassaged}
}`;
            fs.writeFile(generator.launchJsonPath, launchJsonText.trim(), err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
function addAssets(generator, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [
            addTasksJsonIfNecessary(generator, operations),
            addLaunchJsonIfNecessary(generator, operations)
        ];
        return Promise.all(promises);
    });
}
var AddAssetResult;
(function (AddAssetResult) {
    AddAssetResult[AddAssetResult["NotApplicable"] = 0] = "NotApplicable";
    AddAssetResult[AddAssetResult["Done"] = 1] = "Done";
    AddAssetResult[AddAssetResult["Disable"] = 2] = "Disable";
    AddAssetResult[AddAssetResult["Cancelled"] = 3] = "Cancelled";
})(AddAssetResult = exports.AddAssetResult || (exports.AddAssetResult = {}));
function addAssetsIfNecessary(server) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!vscode.workspace.workspaceFolders) {
                return resolve(AddAssetResult.NotApplicable);
            }
            serverUtils.requestWorkspaceInformation(server).then((info) => __awaiter(this, void 0, void 0, function* () {
                // If there are no .NET Core projects, we won't bother offering to add assets.
                if (protocol.containsDotNetCoreProjects(info)) {
                    const generator = new AssetGenerator(info);
                    return getOperations(generator).then(operations => {
                        if (!hasAddOperations(operations)) {
                            return resolve(AddAssetResult.NotApplicable);
                        }
                        promptToAddAssets(generator.workspaceFolder).then(result => {
                            if (result === PromptResult.Disable) {
                                return resolve(AddAssetResult.Disable);
                            }
                            if (result !== PromptResult.Yes) {
                                return resolve(AddAssetResult.Cancelled);
                            }
                            fs.ensureDir(generator.vscodeFolder, err => {
                                addAssets(generator, operations).then(() => resolve(AddAssetResult.Done));
                            });
                        });
                    });
                }
            })).catch(err => reject(err));
        });
    });
}
exports.addAssetsIfNecessary = addAssetsIfNecessary;
function doesAnyAssetExist(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.exists(generator.launchJsonPath, exists => {
                if (exists) {
                    resolve(true);
                }
                else {
                    fs.exists(generator.tasksJsonPath, exists => {
                        resolve(exists);
                    });
                }
            });
        });
    });
}
function deleteAssets(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all([
            util.deleteIfExists(generator.launchJsonPath),
            util.deleteIfExists(generator.tasksJsonPath)
        ]);
    });
}
function shouldGenerateAssets(generator) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            doesAnyAssetExist(generator).then(res => {
                if (res) {
                    const yesItem = { title: 'Yes' };
                    const cancelItem = { title: 'Cancel', isCloseAffordance: true };
                    vscode.window.showWarningMessage('Replace existing build and debug assets?', cancelItem, yesItem)
                        .then(selection => {
                        if (selection === yesItem) {
                            deleteAssets(generator).then(_ => resolve(true));
                        }
                        else {
                            // The user clicked cancel
                            resolve(false);
                        }
                    });
                }
                else {
                    // The assets don't exist, so we're good to go.
                    resolve(true);
                }
            });
        });
    });
}
function generateAssets(server) {
    return __awaiter(this, void 0, void 0, function* () {
        let workspaceInformation = yield serverUtils.requestWorkspaceInformation(server);
        if (protocol.containsDotNetCoreProjects(workspaceInformation)) {
            const generator = new AssetGenerator(workspaceInformation);
            let operations = yield getOperations(generator);
            if (hasAddOperations(operations)) {
                let doGenerateAssets = yield shouldGenerateAssets(generator);
                if (doGenerateAssets) {
                    yield fs.ensureDir(generator.vscodeFolder);
                    yield addAssets(generator, operations);
                }
            }
        }
        else {
            yield vscode.window.showErrorMessage("Could not locate .NET Core project. Assets were not generated.");
        }
    });
}
exports.generateAssets = generateAssets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Fzc2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpREFBaUQ7QUFDakQsaURBQWlEO0FBRWpELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFHakMsaUNBQXVDO0FBRXZDO0lBYUksWUFBbUIsYUFBb0QsRUFBRSxrQkFBMEMsU0FBUztRQUN4SCxJQUFJLGVBQWUsRUFBRTtZQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztTQUMxQzthQUNJO1lBQ0QsSUFBSSxZQUFZLEdBQVcsU0FBUyxDQUFDO1lBRXJDLElBQUksQ0FBQyxZQUFZLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTtnQkFDckMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQzFDO1lBRUQsSUFBSSxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFO2dCQUN6QyxZQUFZLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7YUFDOUM7WUFFRCxJQUFJLENBQUMsWUFBWSxJQUFJLGFBQWEsQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbkYsWUFBWSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzthQUN4RDtZQUVELElBQUksQ0FBQyxZQUFZLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtnQkFDeEMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO2FBQ3JEO1lBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7U0FDN0Y7UUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRWxFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU8scUJBQXFCLENBQUMsYUFBb0Q7UUFDOUUsbUZBQW1GO1FBQ25GLCtDQUErQztRQUMvQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztRQUVsQyxxREFBcUQ7UUFDckQsSUFBSSxhQUFhLENBQUMsT0FBTyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3pELE1BQU0seUJBQXlCLEdBQUcsUUFBUSxDQUFDLDZCQUE2QixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekcsTUFBTSxvQkFBb0IsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDN0QsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztnQkFDOUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUVoQixJQUFJLG9CQUFvQixFQUFFO2dCQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsZUFBZSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQztnQkFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsNkJBQTZCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzlGLElBQUksQ0FBQyxjQUFjLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztnQkFDakUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO2dCQUMzQyxPQUFPO2FBQ1Y7U0FDSjtRQUVELHFEQUFxRDtRQUNyRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXhILHNGQUFzRjtRQUN0Riw0REFBNEQ7UUFDNUQsTUFBTSxhQUFhLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDL0MsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWhCLElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN0RCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLENBQUMsQ0FBQztZQUNwRixJQUFJLE1BQU0sRUFBRTtnQkFDUixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDckUsSUFBSSxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7YUFDOUM7U0FDSjtRQUVELE9BQU87SUFDWCxDQUFDO0lBRU0sc0JBQXNCO1FBQ3pCLDZDQUE2QztRQUU3QyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN2QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVwRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLGNBQWMsRUFBRTtZQUN0RSxJQUFJLGlCQUFzQixDQUFDO1lBRTNCLElBQUk7Z0JBQ0EsaUJBQWlCLEdBQUcsb0JBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUN0RDtZQUNELE9BQU8sS0FBSyxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsbUNBQW1DLENBQUMsQ0FBQztnQkFDcEUsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBRUQsSUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7Z0JBQzNCLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsS0FBSyxJQUFJLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxZQUFZLEVBQUU7Z0JBQzVDLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLFVBQVUsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFO29CQUM3RCxPQUFPLElBQUksQ0FBQztpQkFDZjthQUNKO1NBQ0o7UUFFRCw4R0FBOEc7UUFDOUcsK0ZBQStGO1FBQy9GLE9BQU8sZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRU8sa0JBQWtCO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2xCLHFFQUFxRTtZQUNyRSxPQUFPLDRGQUE0RixDQUFDO1NBQ3ZHO1FBRUQsSUFBSSxNQUFNLEdBQUcsb0JBQW9CLENBQUM7UUFFbEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUNoRztRQUVELE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRTNHLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyx1QkFBdUI7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIscUVBQXFFO1lBQ3JFLE9BQU8sb0JBQW9CLENBQUM7U0FDL0I7UUFFRCxJQUFJLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztRQUVsQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQ2hHO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLGdCQUFnQixDQUFDLFlBQXFCO1FBQ3pDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixNQUFNLDRCQUE0QixHQUFXLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwSixNQUFNLDRCQUE0QixHQUFXLGdCQUFnQixDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztZQUMzRixPQUFPOztNQUViLDRCQUE0QjtNQUM1Qiw0QkFBNEI7RUFDaEMsQ0FBQztTQUNNO2FBQ0k7WUFDRCxNQUFNLCtCQUErQixHQUFXLGdCQUFnQixDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxSixNQUFNLDRCQUE0QixHQUFXLGdCQUFnQixDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztZQUMzRixPQUFPOztNQUViLCtCQUErQjtNQUMvQiw0QkFBNEI7RUFDaEMsQ0FBQztTQUNNO0lBQ0wsQ0FBQztJQUVPLDBCQUEwQjtRQUM5QixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1NBQ3JIO1FBRUQsT0FBTztZQUNILEtBQUssRUFBRSxPQUFPO1lBQ2QsT0FBTyxFQUFFLFFBQVE7WUFDakIsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pELGNBQWMsRUFBRSxZQUFZO1NBQy9CLENBQUM7SUFDTixDQUFDO0lBRU0sd0JBQXdCO1FBQzNCLE9BQU87WUFDSCxPQUFPLEVBQUUsT0FBTztZQUNoQixLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztTQUM3QyxDQUFDO0lBQ04sQ0FBQztDQUNKO0FBNU1ELHdDQTRNQztBQUVELHNDQUE2QyxXQUFtQixFQUFFLGdCQUF3QjtJQUN0RixPQUFPOzs7Ozs7O2tCQU9PLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLENBQUM7O2NBRTlDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUF1QjNELENBQUM7QUFDSCxDQUFDO0FBbENELG9FQWtDQztBQUVELG1DQUEwQyxXQUFtQixFQUFFLGdCQUF3QjtJQUNuRixPQUFPOzs7Ozs7O2tCQU9PLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLENBQUM7O2NBRTlDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQzs7Ozs7RUFLM0QsQ0FBQztBQUNILENBQUM7QUFoQkQsOERBZ0JDO0FBRUQsc0JBQXNCO0FBQ3RCO0lBQ0ksT0FBTzs7Ozs7O0VBTVQsQ0FBQztBQUNILENBQUM7QUFSRCw4REFRQztBQVFELDBCQUEwQixVQUFzQjtJQUM1QyxPQUFPLFVBQVUsQ0FBQyxhQUFhLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQztBQUNoRSxDQUFDO0FBRUQsdUJBQTZCLFNBQXlCOztRQUNsRCxPQUFPLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBTSxVQUFVLEVBQUMsRUFBRSxnREFDdkUsT0FBQSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILHVCQUF1QixrQkFBMkM7SUFDOUQsSUFBSSxNQUFNLEdBQTRCLEVBQUUsQ0FBQztJQUV6QyxNQUFNLE9BQU8sR0FBVyxPQUFPLENBQUM7SUFDaEMsTUFBTSxPQUFPLEdBQVcsT0FBTyxDQUFDO0lBRWhDLHVCQUF1QixPQUFlLEVBQUUsaUJBQTBDO1FBQzlFLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMxQixxQkFBcUI7UUFDckIsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLGlCQUFpQixFQUFFO1lBQzFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDL0Q7UUFDRCxxQkFBcUI7YUFDaEIsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLGlCQUFpQixFQUFFO1lBQy9DLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUI7SUFDTCxDQUFDO0lBRUQsYUFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVwRSxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRTtRQUM1QixhQUFhLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMvRTtJQUVELElBQUksa0JBQWtCLENBQUMsR0FBRyxFQUFFO1FBQ3hCLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNFO0lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7UUFDMUIsYUFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0U7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsNEJBQWtDLGFBQXFCOztRQUNuRCxPQUFPLElBQUksT0FBTyxDQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQy9DLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUM5QixJQUFJLE1BQU0sRUFBRTtvQkFDUixFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDdkMsSUFBSSxHQUFHLEVBQUU7NEJBQ0wsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ3RCO3dCQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDL0IsSUFBSSxrQkFBMkMsQ0FBQzt3QkFFaEQsSUFBSTs0QkFDQSxrQkFBa0IsR0FBRyxvQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUM1Qzt3QkFDRCxPQUFPLEtBQUssRUFBRTs0QkFDVixNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxDQUFDLENBQUM7NEJBQ2xFLE9BQU8sT0FBTyxDQUFDLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7eUJBQzlDO3dCQUVELElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUVuRCxPQUFPLENBQUMsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMxRCxDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFDSTtvQkFDRCxPQUFPLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDbkM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUFBO0FBRUQsNkJBQW1DLGNBQXNCLEVBQUUsVUFBc0I7O1FBQzdFLE9BQU8sSUFBSSxPQUFPLENBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDL0MsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDdEMsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUN2QjtxQkFDSTtvQkFDRCxVQUFVLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztvQkFDaEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUN2QjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQUE7QUFFRCxJQUFLLFlBSUo7QUFKRCxXQUFLLFlBQVk7SUFDYiw2Q0FBRyxDQUFBO0lBQ0gsMkNBQUUsQ0FBQTtJQUNGLHFEQUFPLENBQUE7QUFDWCxDQUFDLEVBSkksWUFBWSxLQUFaLFlBQVksUUFJaEI7QUFNRCwyQkFBaUMsZUFBdUM7O1FBQ3BFLE9BQU8sSUFBSSxPQUFPLENBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDakQsTUFBTSxPQUFPLEdBQWUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkUsTUFBTSxNQUFNLEdBQWUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO1lBQ2xHLE1BQU0sV0FBVyxHQUFlLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFM0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlELE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQzVCLHdEQUF3RCxXQUFXLGNBQWMsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztpQkFDL0csSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUFBO0FBRUQsaUNBQThDLFNBQXlCLEVBQUUsVUFBc0I7O1FBQzNGLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUU7Z0JBQzFCLE9BQU8sT0FBTyxFQUFFLENBQUM7YUFDcEI7WUFFRCxvQ0FBb0M7WUFDcEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRSxJQUFJLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQStCLE9BQU8sQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBRXZELElBQUksbUJBQW1CLEVBQUU7Z0JBQ3JCLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDdkU7WUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDdkQsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3RCO2dCQUVELE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQXhCRCwwREF3QkM7QUFFRCwwQkFBMEIsSUFBWSxFQUFFLFlBQW9CLENBQUM7SUFDekQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3hGLENBQUM7QUFFRCxrQ0FBd0MsU0FBeUIsRUFBRSxVQUFzQjs7UUFDckYsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtnQkFDM0IsT0FBTyxPQUFPLEVBQUUsQ0FBQzthQUNwQjtZQUVELHFDQUFxQztZQUNyQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLElBQUkscUJBQXFCLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBTyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXRFLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ3hELElBQUksVUFBVSxHQUFXLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVsRSxJQUFJLHFCQUFxQixFQUFFO2dCQUN2QixJQUFJLDJCQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN0RixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLDJCQUEyQixHQUFHLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakYsTUFBTSw0QkFBNEIsR0FBRywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTlFLElBQUksV0FBVyxLQUFLLENBQUMsQ0FBQyxJQUFJLDJCQUEyQixLQUFLLENBQUMsQ0FBQyxJQUFJLDRCQUE0QixLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNqRyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ2xELDJCQUEyQixHQUFHLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsR0FBRyxDQUFDLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFDbkksVUFBVSxHQUFHLEdBQUcsVUFBVSxJQUFJLDJCQUEyQixHQUFHLENBQUM7aUJBQ2hFO2FBQ0o7WUFFRCxNQUFNLHNCQUFzQixHQUFXLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sY0FBYyxHQUFHOzs7Ozs7dUJBTVIsc0JBQXNCO0VBQzNDLENBQUM7WUFFSyxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLEdBQUcsRUFBRTtvQkFDTCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDdEI7Z0JBRUQsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUFBO0FBRUQsbUJBQXlCLFNBQXlCLEVBQUUsVUFBc0I7O1FBQ3RFLE1BQU0sUUFBUSxHQUFHO1lBQ2IsdUJBQXVCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztZQUM5Qyx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1NBQ2xELENBQUM7UUFFRixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUFBO0FBRUQsSUFBWSxjQUtYO0FBTEQsV0FBWSxjQUFjO0lBQ3RCLHFFQUFhLENBQUE7SUFDYixtREFBSSxDQUFBO0lBQ0oseURBQU8sQ0FBQTtJQUNQLDZEQUFTLENBQUE7QUFDYixDQUFDLEVBTFcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFLekI7QUFFRCw4QkFBMkMsTUFBdUI7O1FBQzlELE9BQU8sSUFBSSxPQUFPLENBQWlCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFO2dCQUNwQyxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxXQUFXLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQU0sSUFBSSxFQUFDLEVBQUU7Z0JBQzlELDhFQUE4RTtnQkFDOUUsSUFBSSxRQUFRLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzNDLE1BQU0sU0FBUyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMzQyxPQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRTs0QkFDL0IsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3lCQUNoRDt3QkFFRCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUN2RCxJQUFJLE1BQU0sS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO2dDQUNqQyxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7NkJBQzFDOzRCQUVELElBQUksTUFBTSxLQUFLLFlBQVksQ0FBQyxHQUFHLEVBQUU7Z0NBQzdCLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQzs2QkFDNUM7NEJBRUQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dDQUN2QyxTQUFTLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDdkMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUN0QyxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztpQkFDTjtZQUNMLENBQUMsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQUE7QUFsQ0Qsb0RBa0NDO0FBRUQsMkJBQWlDLFNBQXlCOztRQUN0RCxPQUFPLElBQUksT0FBTyxDQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzVDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDekMsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQjtxQkFDSTtvQkFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDcEIsQ0FBQyxDQUFDLENBQUM7aUJBQ047WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUFBO0FBRUQsc0JBQTRCLFNBQXlCOztRQUNqRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDZixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7WUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO1NBQy9DLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQUVELDhCQUFvQyxTQUF5Qjs7UUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM1QyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksR0FBRyxFQUFFO29CQUNMLE1BQU0sT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO29CQUNqQyxNQUFNLFVBQVUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBRWhFLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsMENBQTBDLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQzt5QkFDNUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUNkLElBQUksU0FBUyxLQUFLLE9BQU8sRUFBRTs0QkFDdkIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3lCQUNwRDs2QkFDSTs0QkFDRCwwQkFBMEI7NEJBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDbEI7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7aUJBQ1Y7cUJBQ0k7b0JBQ0QsK0NBQStDO29CQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQUVELHdCQUFxQyxNQUF1Qjs7UUFDeEQsSUFBSSxvQkFBb0IsR0FBRyxNQUFNLFdBQVcsQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRixJQUFJLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQzNELE1BQU0sU0FBUyxHQUFHLElBQUksY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDM0QsSUFBSSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEQsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLGdCQUFnQixFQUFFO29CQUNsQixNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMzQyxNQUFNLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQzFDO2FBQ0o7U0FDSjthQUNJO1lBQ0QsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGdFQUFnRSxDQUFDLENBQUM7U0FDMUc7SUFDTCxDQUFDO0NBQUE7QUFoQkQsd0NBZ0JDIn0=