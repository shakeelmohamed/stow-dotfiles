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
function registerCommands(server, platformInfo, eventStream, optionProvider) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBR2hHLGtEQUFrRDtBQUNsRCxvREFBMEQ7QUFDMUQsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0Isa0RBQWtEO0FBQ2xELGlDQUFpQztBQUNqQyxtREFBcUc7QUFDckcsc0NBQTJDO0FBQzNDLHdEQUF1RTtBQUN2RSw4REFBc0w7QUFHdEwsZ0VBQXlEO0FBR3pELDBCQUF5QyxNQUF1QixFQUFFLFlBQWlDLEVBQUUsV0FBd0IsRUFBRSxjQUE4QjtJQUN6SixJQUFJLFVBQVUsR0FBRyxJQUFJLDZCQUFtQixFQUFFLENBQUM7SUFDM0MsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdGLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsdUJBQXVCLEVBQUUsR0FBUyxFQUFFLGdEQUFDLE9BQUEsbUJBQW1CLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDLENBQUM7SUFDbEksVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLG9DQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEgsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyx3QkFBd0IsRUFBRSxHQUFTLEVBQUUsZ0RBQUMsT0FBQSwyQkFBMkIsQ0FBQyxN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