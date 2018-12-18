"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const appStorage_1 = require("./appStorage");
const browserClient_1 = require("./browserClient");
const debuggerClient_1 = require("./debuggerClient");
const debugSessionManager_1 = require("./debugSessionManager");
const dockerClient_1 = require("./dockerClient");
const dockerDebugConfigurationProvider_1 = require("./dockerDebugConfigurationProvider");
const dockerManager_1 = require("./dockerManager");
const dotNetClient_1 = require("./dotNetClient");
const fsProvider_1 = require("./fsProvider");
const netCoreProjectProvider_1 = require("./netCoreProjectProvider");
const osProvider_1 = require("./osProvider");
const outputManager_1 = require("./outputManager");
const prereqManager_1 = require("./prereqManager");
const processProvider_1 = require("./processProvider");
const tempFileProvider_1 = require("./tempFileProvider");
const vsdbgClient_1 = require("./vsdbgClient");
function registerDebugConfigurationProvider(ctx) {
    const fileSystemProvider = new fsProvider_1.LocalFileSystemProvider();
    const processProvider = new processProvider_1.default();
    const dockerClient = new dockerClient_1.default(processProvider);
    const msBuildClient = new dotNetClient_1.default(processProvider);
    const osProvider = new osProvider_1.default();
    const dockerOutputChannel = vscode.window.createOutputChannel('Docker');
    ctx.subscriptions.push(dockerOutputChannel);
    const dockerOutputManager = new outputManager_1.DefaultOutputManager(dockerOutputChannel);
    const dockerManager = new dockerManager_1.DefaultDockerManager(new appStorage_1.DefaultAppStorageProvider(fileSystemProvider), new debuggerClient_1.DefaultDebuggerClient(new vsdbgClient_1.RemoteVsDbgClient(dockerOutputManager, fileSystemProvider, ctx.globalState, osProvider, processProvider)), dockerClient, dockerOutputManager, fileSystemProvider, osProvider, processProvider, ctx.workspaceState);
    const debugSessionManager = new debugSessionManager_1.DockerDebugSessionManager(vscode.debug.onDidTerminateDebugSession, dockerManager);
    ctx.subscriptions.push(debugSessionManager);
    ctx.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('docker-coreclr', new dockerDebugConfigurationProvider_1.default(debugSessionManager, dockerManager, fileSystemProvider, osProvider, new netCoreProjectProvider_1.MsBuildNetCoreProjectProvider(fileSystemProvider, msBuildClient, new tempFileProvider_1.OSTempFileProvider(osProvider, processProvider)), new prereqManager_1.AggregatePrerequisite(new prereqManager_1.DockerDaemonIsLinuxPrerequisite(dockerClient, vscode.window.showErrorMessage), new prereqManager_1.DotNetExtensionInstalledPrerequisite(new browserClient_1.default(), vscode.extensions.getExtension, vscode.window.showErrorMessage), new prereqManager_1.DotNetSdkInstalledPrerequisite(msBuildClient, vscode.window.showErrorMessage), new prereqManager_1.MacNuGetFallbackFolderSharedPrerequisite(fileSystemProvider, osProvider, vscode.window.showErrorMessage), new prereqManager_1.LinuxUserInDockerGroupPrerequisite(osProvider, processProvider, vscode.window.showErrorMessage)))));
}
exports.registerDebugConfigurationProvider = registerDebugConfigurationProvider;
//# sourceMappingURL=registerDebugger.js.map