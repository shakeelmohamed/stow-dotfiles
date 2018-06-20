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
const serverUtils = require("../omnisharp/utils");
const launcher_1 = require("../omnisharp/launcher");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const protocol = require("../omnisharp/protocol");
const vscode = require("vscode");
const processPicker_1 = require("./processPicker");
const assets_1 = require("../assets");
const activate_1 = require("../coreclr-debug/activate");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const CompositeDisposable_1 = require("../CompositeDisposable");
function registerCommands(server, eventStream, platformInfo) {
    let d1 = vscode.commands.registerCommand('o.restart', () => restartOmniSharp(server));
    let d2 = vscode.commands.registerCommand('o.pickProjectAndStart', () => pickProjectAndStart(server));
    let d3 = vscode.commands.registerCommand('o.showOutput', () => eventStream.post(new loggingEvents_1.CommandShowOutput()));
    let d4 = vscode.commands.registerCommand('dotnet.restore', fileName => {
        if (fileName) {
            dotnetRestoreForProject(server, fileName, eventStream);
        }
        else {
            dotnetRestoreAllProjects(server, eventStream);
        }
    });
    // register empty handler for csharp.installDebugger
    // running the command activates the extension, which is all we need for installation to kickoff
    let d5 = vscode.commands.registerCommand('csharp.downloadDebugger', () => { });
    // register process picker for attach
    let attachItemsProvider = processPicker_1.DotNetAttachItemsProviderFactory.Get();
    let attacher = new processPicker_1.AttachPicker(attachItemsProvider);
    let d6 = vscode.commands.registerCommand('csharp.listProcess', () => __awaiter(this, void 0, void 0, function* () { return attacher.ShowAttachEntries(); }));
    // Register command for generating tasks.json and launch.json assets.
    let d7 = vscode.commands.registerCommand('dotnet.generateAssets', () => __awaiter(this, void 0, void 0, function* () { return assets_1.generateAssets(server); }));
    // Register command for remote process picker for attach
    let d8 = vscode.commands.registerCommand('csharp.listRemoteProcess', (args) => __awaiter(this, void 0, void 0, function* () { return processPicker_1.RemoteAttachPicker.ShowAttachEntries(args, platformInfo); }));
    // Register command for adapter executable command.
    let d9 = vscode.commands.registerCommand('csharp.coreclrAdapterExecutableCommand', (args) => __awaiter(this, void 0, void 0, function* () { return activate_1.getAdapterExecutionCommand(platformInfo, eventStream); }));
    let d10 = vscode.commands.registerCommand('csharp.clrAdapterExecutableCommand', (args) => __awaiter(this, void 0, void 0, function* () { return activate_1.getAdapterExecutionCommand(platformInfo, eventStream); }));
    return new CompositeDisposable_1.default(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
}
exports.default = registerCommands;
function restartOmniSharp(server) {
    if (server.isRunning()) {
        server.restart();
    }
    else {
        server.autoStart('');
    }
}
function pickProjectAndStart(server) {
    return launcher_1.findLaunchTargets().then(targets => {
        let currentPath = server.getSolutionPathOrFolder();
        if (currentPath) {
            for (let target of targets) {
                if (target.target === currentPath) {
                    target.label = `\u2713 ${target.label}`;
                }
            }
        }
        return vscode.window.showQuickPick(targets, {
            matchOnDescription: true,
            placeHolder: `Select 1 of ${targets.length} projects`
        }).then((launchTarget) => __awaiter(this, void 0, void 0, function* () {
            if (launchTarget) {
                return server.restart(launchTarget);
            }
        }));
    });
}
function projectsToCommands(projects, eventStream) {
    return projects.map((project) => __awaiter(this, void 0, void 0, function* () {
        let projectDirectory = project.Directory;
        return new Promise((resolve, reject) => {
            fs.lstat(projectDirectory, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                if (stats.isFile()) {
                    projectDirectory = path.dirname(projectDirectory);
                }
                resolve({
                    label: `dotnet restore - (${project.Name || path.basename(project.Directory)})`,
                    description: projectDirectory,
                    execute() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return dotnetRestore(projectDirectory, eventStream);
                        });
                    }
                });
            });
        });
    }));
}
function dotnetRestoreAllProjects(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!server.isRunning()) {
            return Promise.reject('OmniSharp server is not running.');
        }
        return serverUtils.requestWorkspaceInformation(server).then((info) => __awaiter(this, void 0, void 0, function* () {
            let descriptors = protocol.getDotNetCoreProjectDescriptors(info);
            if (descriptors.length === 0) {
                return Promise.reject("No .NET Core projects found");
            }
            let commandPromises = projectsToCommands(descriptors, eventStream);
            return Promise.all(commandPromises).then(commands => {
                return vscode.window.showQuickPick(commands);
            }).then(command => {
                if (command) {
                    return command.execute();
                }
            });
        }));
    });
}
exports.dotnetRestoreAllProjects = dotnetRestoreAllProjects;
function dotnetRestoreForProject(server, filePath, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!server.isRunning()) {
            return Promise.reject('OmniSharp server is not running.');
        }
        return serverUtils.requestWorkspaceInformation(server).then((info) => __awaiter(this, void 0, void 0, function* () {
            let descriptors = protocol.getDotNetCoreProjectDescriptors(info);
            if (descriptors.length === 0) {
                return Promise.reject("No .NET Core projects found");
            }
            for (let descriptor of descriptors) {
                if (descriptor.FilePath === filePath) {
                    return dotnetRestore(descriptor.Directory, eventStream, filePath);
                }
            }
        }));
    });
}
exports.dotnetRestoreForProject = dotnetRestoreForProject;
function dotnetRestore(cwd, eventStream, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            eventStream.post(new loggingEvents_1.CommandDotNetRestoreStart());
            let cmd = 'dotnet';
            let args = ['restore'];
            if (filePath) {
                args.push(filePath);
            }
            let dotnet = cp.spawn(cmd, args, { cwd: cwd, env: process.env });
            function handleData(stream) {
                stream.on('data', chunk => {
                    eventStream.post(new loggingEvents_1.CommandDotNetRestoreProgress(chunk.toString()));
                });
                stream.on('err', err => {
                    eventStream.post(new loggingEvents_1.CommandDotNetRestoreProgress(`ERROR: ${err}`));
                });
            }
            handleData(dotnet.stdout);
            handleData(dotnet.stderr);
            dotnet.on('close', (code, signal) => {
                eventStream.post(new loggingEvents_1.CommandDotNetRestoreSucceeded(`Done: ${code}.`));
                resolve();
            });
            dotnet.on('error', err => {
                eventStream.post(new loggingEvents_1.CommandDotNetRestoreFailed(`ERROR: ${err}`));
                reject(err);
            });
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBR2hHLGtEQUFrRDtBQUNsRCxvREFBMEQ7QUFDMUQsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0Isa0RBQWtEO0FBQ2xELGlDQUFpQztBQUNqQyxtREFBcUc7QUFDckcsc0NBQTJDO0FBQzNDLHdEQUF1RTtBQUN2RSw4REFBbUw7QUFHbkwsZ0VBQXlEO0FBRXpELDBCQUF5QyxNQUF1QixFQUFFLFdBQXdCLEVBQUUsWUFBaUM7SUFDekgsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdEYsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLGlDQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFHLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxFQUFFO1FBQ2xFLElBQUksUUFBUSxFQUFFO1lBQ1YsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUMxRDthQUNJO1lBQ0Qsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ2pEO0lB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