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
const reportIssue_1 = require("./reportIssue");
const getDotnetInfo_1 = require("../utils/getDotnetInfo");
function registerCommands(server, platformInfo, eventStream, optionProvider, monoResolver) {
    let disposable = new CompositeDisposable_1.default();
    disposable.add(vscode.commands.registerCommand('o.restart', () => restartOmniSharp(server)));
    disposable.add(vscode.commands.registerCommand('o.pickProjectAndStart', () => __awaiter(this, void 0, void 0, function* () { return pickProjectAndStart(server, optionProvider); })));
    disposable.add(vscode.commands.registerCommand('o.showOutput', () => eventStream.post(new loggingEvents_1.ShowOmniSharpChannel())));
    disposable.add(vscode.commands.registerCommand('dotnet.restore.project', () => __awaiter(this, void 0, void 0, function* () { return pickProjectAndDotnetRestore(server, eventStream); })));
    disposable.add(vscode.commands.registerCommand('dotnet.restore.all', () => __awaiter(this, void 0, void 0, function* () { return dotnetRestoreAllProjects(server, eventStream); })));
    // register empty handler for csharp.installDebugger
    // running the command activates the extension, which is all we need for installation to kickoff
    disposable.add(vscode.commands.registerCommand('csharp.downloadDebugger', () => { }));
    // register process picker for attach
    let attachItemsProvider = processPicker_1.DotNetAttachItemsProviderFactory.Get();
    let attacher = new processPicker_1.AttachPicker(attachItemsProvider);
    disposable.add(vscode.commands.registerCommand('csharp.listProcess', () => __awaiter(this, void 0, void 0, function* () { return attacher.ShowAttachEntries(); })));
    // Register command for generating tasks.json and launch.json assets.
    disposable.add(vscode.commands.registerCommand('dotnet.generateAssets', () => __awaiter(this, void 0, void 0, function* () { return assets_1.generateAssets(server); })));
    // Register command for remote process picker for attach
    disposable.add(vscode.commands.registerCommand('csharp.listRemoteProcess', (args) => __awaiter(this, void 0, void 0, function* () { return processPicker_1.RemoteAttachPicker.ShowAttachEntries(args, platformInfo); })));
    // Register command for adapter executable command.
    disposable.add(vscode.commands.registerCommand('csharp.coreclrAdapterExecutableCommand', (args) => __awaiter(this, void 0, void 0, function* () { return activate_1.getAdapterExecutionCommand(platformInfo, eventStream); })));
    disposable.add(vscode.commands.registerCommand('csharp.clrAdapterExecutableCommand', (args) => __awaiter(this, void 0, void 0, function* () { return activate_1.getAdapterExecutionCommand(platformInfo, eventStream); })));
    disposable.add(vscode.commands.registerCommand('csharp.reportIssue', () => __awaiter(this, void 0, void 0, function* () { return reportIssue_1.default(vscode, eventStream, getDotnetInfo_1.getDotnetInfo, platformInfo.isValidPlatformForMono(), optionProvider.GetLatestOptions(), monoResolver); })));
    return new CompositeDisposable_1.default(disposable);
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
function pickProjectAndStart(server, optionProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = optionProvider.GetLatestOptions();
        return launcher_1.findLaunchTargets(options).then(targets => {
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
function pickProjectAndDotnetRestore(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let descriptors = yield getProjectDescriptors(server);
        eventStream.post(new loggingEvents_1.CommandDotNetRestoreStart());
        let commands = yield Promise.all(projectsToCommands(descriptors, eventStream));
        let command = yield vscode.window.showQuickPick(commands);
        if (command) {
            return command.execute();
        }
    });
}
function dotnetRestoreAllProjects(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let descriptors = yield getProjectDescriptors(server);
        eventStream.post(new loggingEvents_1.CommandDotNetRestoreStart());
        for (let descriptor of descriptors) {
            yield dotnetRestore(descriptor.Directory, eventStream);
        }
    });
}
function getProjectDescriptors(server) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!server.isRunning()) {
            return Promise.reject('OmniSharp server is not running.');
        }
        let info = yield serverUtils.requestWorkspaceInformation(server);
        let descriptors = protocol.getDotNetCoreProjectDescriptors(info);
        if (descriptors.length === 0) {
            return Promise.reject("No .NET Core projects found");
        }
        return descriptors;
    });
}
function dotnetRestore(cwd, eventStream, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
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
exports.dotnetRestore = dotnetRestore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBR2hHLGtEQUFrRDtBQUNsRCxvREFBMEQ7QUFDMUQsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0Isa0RBQWtEO0FBQ2xELGlDQUFpQztBQUNqQyxtREFBcUc7QUFDckcsc0NBQTJDO0FBQzNDLHdEQUF1RTtBQUN2RSw4REFBc0w7QUFHdEwsZ0VBQXlEO0FBRXpELCtDQUF3QztBQUV4QywwREFBdUQ7QUFFdkQsMEJBQXlDLE1BQXVCLEVBQUUsWUFBaUMsRUFBRSxXQUF3QixFQUFFLGNBQThCLEVBQUUsWUFBMkI7SUFDdEwsSUFBSSxVQUFVLEdBQUcsSUFBSSw2QkFBbUIsRUFBRSxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RixVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLHVCQUF1QixFQUFFLEdBQVMsRUFBRSxnREFBQyxPQUFBLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQSxHQUFBLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQ0FBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BILFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsd0JBQXdCLEVB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