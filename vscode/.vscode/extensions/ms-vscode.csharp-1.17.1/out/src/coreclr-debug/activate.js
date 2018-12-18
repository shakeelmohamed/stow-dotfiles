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
const path = require("path");
const vscode = require("vscode");
const common = require("./../common");
const util_1 = require("./util");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
let _debugUtil = null;
function activate(thisExtension, context, platformInformation, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        _debugUtil = new util_1.CoreClrDebugUtil(context.extensionPath);
        if (!util_1.CoreClrDebugUtil.existsSync(_debugUtil.debugAdapterDir())) {
            let isInvalidArchitecture = yield checkForInvalidArchitecture(platformInformation, eventStream);
            if (!isInvalidArchitecture) {
                eventStream.post(new loggingEvents_1.DebuggerPrerequisiteFailure("[ERROR]: C# Extension failed to install the debugger package."));
                showInstallErrorMessage(eventStream);
            }
        }
        else if (!util_1.CoreClrDebugUtil.existsSync(_debugUtil.installCompleteFilePath())) {
            completeDebuggerInstall(platformInformation, eventStream);
        }
    });
}
exports.activate = activate;
function checkForInvalidArchitecture(platformInformation, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        if (platformInformation) {
            if (platformInformation.isMacOS() && !util_1.CoreClrDebugUtil.isMacOSSupported()) {
                eventStream.post(new loggingEvents_1.DebuggerPrerequisiteFailure("[ERROR] The debugger cannot be installed. The debugger requires macOS 10.12 (Sierra) or newer."));
                return true;
            }
            else if (platformInformation.architecture !== "x86_64") {
                if (platformInformation.isWindows() && platformInformation.architecture === "x86") {
                    eventStream.post(new loggingEvents_1.DebuggerPrerequisiteWarning(`[WARNING]: x86 Windows is not currently supported by the .NET Core debugger. Debugging will not be available.`));
                }
                else {
                    eventStream.post(new loggingEvents_1.DebuggerPrerequisiteWarning(`[WARNING]: Processor architecture '${platformInformation.architecture}' is not currently supported by the .NET Core debugger. Debugging will not be available.`));
                }
                return true;
            }
        }
        return false;
    });
}
function completeDebuggerInstall(platformInformation, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        return _debugUtil.checkDotNetCli()
            .then((dotnetInfo) => __awaiter(this, void 0, void 0, function* () {
            let isInvalidArchitecture = yield checkForInvalidArchitecture(platformInformation, eventStream);
            if (isInvalidArchitecture) {
                eventStream.post(new loggingEvents_1.DebuggerNotInstalledFailure());
                vscode.window.showErrorMessage('Failed to complete the installation of the C# extension. Please see the error in the output window below.');
                return false;
            }
            // Write install.complete
            util_1.CoreClrDebugUtil.writeEmptyFile(_debugUtil.installCompleteFilePath());
            vscode.window.setStatusBarMessage('Successfully installed .NET Core Debugger.', 5000);
            return true;
        }), (err) => {
            // Check for dotnet tools failed. pop the UI
            // err is a DotNetCliError but use defaults in the unexpected case that it's not
            showDotnetToolsWarning(err.ErrorMessage || _debugUtil.defaultDotNetCliErrorMessage());
            eventStream.post(new loggingEvents_1.DebuggerPrerequisiteWarning(err.ErrorString || err));
            // TODO: log telemetry?
            return false;
        });
    });
}
function showInstallErrorMessage(eventStream) {
    eventStream.post(new loggingEvents_1.DebuggerNotInstalledFailure());
    vscode.window.showErrorMessage("An error occured during installation of the .NET Core Debugger. The C# extension may need to be reinstalled.");
}
function showDotnetToolsWarning(message) {
    const config = vscode.workspace.getConfiguration('csharp');
    if (!config.get('suppressDotnetInstallWarning', false)) {
        const getDotNetMessage = 'Get .NET CLI tools';
        const goToSettingsMessage = 'Disable this message in user settings';
        // Buttons are shown in right-to-left order, with a close button to the right of everything;
        // getDotNetMessage will be the first button, then goToSettingsMessage, then the close button.
        vscode.window.showErrorMessage(message, goToSettingsMessage, getDotNetMessage).then(value => {
            if (value === getDotNetMessage) {
                let open = require('open');
                let dotnetcoreURL = 'https://www.microsoft.com/net/core';
                // Windows redirects https://www.microsoft.com/net/core to https://www.microsoft.com/net/core#windowsvs2015
                if (process.platform == "win32") {
                    dotnetcoreURL = dotnetcoreURL + '#windowscmd';
                }
                open(dotnetcoreURL);
            }
            else if (value === goToSettingsMessage) {
                vscode.commands.executeCommand('workbench.action.openGlobalSettings');
            }
        });
    }
}
// The default extension manifest calls this command as the adapterExecutableCommand
// If the debugger components have not finished downloading, the proxy displays an error message to the user
// Else it will launch the debug adapter
function getAdapterExecutionCommand(platformInfo, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let util = new util_1.CoreClrDebugUtil(common.getExtensionPath());
        // Check for .debugger folder. Handle if it does not exist.
        if (!util_1.CoreClrDebugUtil.existsSync(util.debugAdapterDir())) {
            // our install.complete file does not exist yet, meaning we have not completed the installation. Try to figure out what if anything the package manager is doing
            // the order in which files are dealt with is this:
            // 1. install.Begin is created
            // 2. install.Lock is created
            // 3. install.Begin is deleted
            // 4. install.complete is created
            // install.Lock does not exist, need to wait for packages to finish downloading.
            let installLock = yield common.installFileExists(common.InstallFileType.Lock);
            if (!installLock) {
                eventStream.post(new loggingEvents_1.DebuggerNotInstalledFailure());
                throw new Error('The C# extension is still downloading packages. Please see progress in the output window below.');
            }
            // install.complete does not exist, check dotnetCLI to see if we can complete.
            else if (!util_1.CoreClrDebugUtil.existsSync(util.installCompleteFilePath())) {
                let success = yield completeDebuggerInstall(platformInfo, eventStream);
                if (!success) {
                    eventStream.post(new loggingEvents_1.DebuggerNotInstalledFailure());
                    throw new Error('Failed to complete the installation of the C# extension. Please see the error in the output window below.');
                }
            }
        }
        // debugger has finished installation, kick off our debugger process
        return {
            command: path.join(common.getExtensionPath(), ".debugger", "vsdbg-ui" + util_1.CoreClrDebugUtil.getPlatformExeExtension())
        };
    });
}
exports.getAdapterExecutionCommand = getAdapterExecutionCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZWNsci1kZWJ1Zy9hY3RpdmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxzQ0FBc0M7QUFDdEMsaUNBQXVEO0FBRXZELDhEQUFtSTtBQUluSSxJQUFJLFVBQVUsR0FBcUIsSUFBSSxDQUFDO0FBRXhDLGtCQUErQixhQUF1RCxFQUFFLE9BQWdDLEVBQUUsbUJBQXdDLEVBQUUsV0FBd0I7O1FBQ3hMLFVBQVUsR0FBRyxJQUFJLHVCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsdUJBQWdCLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFO1lBQzVELElBQUkscUJBQXFCLEdBQVksTUFBTSwyQkFBMkIsQ0FBQyxtQkFBbUIsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN6RyxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3hCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQ0FBMkIsQ0FBQywrREFBK0QsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ILHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3hDO1NBQ0o7YUFBTSxJQUFJLENBQUMsdUJBQWdCLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUU7WUFDM0UsdUJBQXVCLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDN0Q7SUFDTCxDQUFDO0NBQUE7QUFaRCw0QkFZQztBQUVELHFDQUEyQyxtQkFBd0MsRUFBRSxXQUF3Qjs7UUFDekcsSUFBSSxtQkFBbUIsRUFBRTtZQUNyQixJQUFJLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsdUJBQWdCLENBQUMsZ0JBQWdCLEVBQUUs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