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
const OmniSharp = require("./omnisharp/extension");
const coreclrdebug = require("./coreclr-debug/activate");
const util = require("./common");
const vscode = require("vscode");
const loggingEvents_1 = require("./omnisharp/loggingEvents");
const WarningMessageObserver_1 = require("./observers/WarningMessageObserver");
const CSharpExtDownloader_1 = require("./CSharpExtDownloader");
const CsharpChannelObserver_1 = require("./observers/CsharpChannelObserver");
const CsharpLoggerObserver_1 = require("./observers/CsharpLoggerObserver");
const DotnetChannelObserver_1 = require("./observers/DotnetChannelObserver");
const DotnetLoggerObserver_1 = require("./observers/DotnetLoggerObserver");
const EventStream_1 = require("./EventStream");
const InformationMessageObserver_1 = require("./observers/InformationMessageObserver");
const OmnisharpChannelObserver_1 = require("./observers/OmnisharpChannelObserver");
const OmnisharpDebugModeLoggerObserver_1 = require("./observers/OmnisharpDebugModeLoggerObserver");
const OmnisharpLoggerObserver_1 = require("./observers/OmnisharpLoggerObserver");
const OmnisharpStatusBarObserver_1 = require("./observers/OmnisharpStatusBarObserver");
const platform_1 = require("./platform");
const statusBarItemAdapter_1 = require("./statusBarItemAdapter");
const TelemetryObserver_1 = require("./observers/TelemetryObserver");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const jsonContributions_1 = require("./features/json/jsonContributions");
const ProjectStatusBarObserver_1 = require("./observers/ProjectStatusBarObserver");
const options_1 = require("./omnisharp/options");
const NetworkSettings_1 = require("./NetworkSettings");
const ErrorMessageObserver_1 = require("./observers/ErrorMessageObserver");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionId = 'ms-vscode.csharp';
        const extension = vscode.extensions.getExtension(extensionId);
        const extensionVersion = extension.packageJSON.version;
        const aiKey = extension.packageJSON.contributes.debuggers[0].aiKey;
        const reporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, aiKey);
        util.setExtensionPath(extension.extensionPath);
        const eventStream = new EventStream_1.EventStream();
        let dotnetChannel = vscode.window.createOutputChannel('.NET');
        let dotnetChannelObserver = new DotnetChannelObserver_1.DotNetChannelObserver(dotnetChannel);
        let dotnetLoggerObserver = new DotnetLoggerObserver_1.DotnetLoggerObserver(dotnetChannel);
        eventStream.subscribe(dotnetChannelObserver.post);
        eventStream.subscribe(dotnetLoggerObserver.post);
        let csharpChannel = vscode.window.createOutputChannel('C#');
        let csharpchannelObserver = new CsharpChannelObserver_1.CsharpChannelObserver(csharpChannel);
        let csharpLogObserver = new CsharpLoggerObserver_1.CsharpLoggerObserver(csharpChannel);
        eventStream.subscribe(csharpchannelObserver.post);
        eventStream.subscribe(csharpLogObserver.post);
        let omnisharpChannel = vscode.window.createOutputChannel('OmniSharp Log');
        let omnisharpLogObserver = new OmnisharpLoggerObserver_1.OmnisharpLoggerObserver(omnisharpChannel);
        let omnisharpChannelObserver = new OmnisharpChannelObserver_1.OmnisharpChannelObserver(omnisharpChannel);
        eventStream.subscribe(omnisharpLogObserver.post);
        eventStream.subscribe(omnisharpChannelObserver.post);
        let warningMessageObserver = new WarningMessageObserver_1.WarningMessageObserver(vscode, () => options_1.Options.Read(vscode).disableMSBuildDiagnosticWarning || false);
        eventStream.subscribe(warningMessageObserver.post);
        let informationMessageObserver = new InformationMessageObserver_1.InformationMessageObserver(vscode);
        eventStream.subscribe(informationMessageObserver.post);
        let errorMessageObserver = new ErrorMessageObserver_1.ErrorMessageObserver(vscode);
        eventStream.subscribe(errorMessageObserver.post);
        let omnisharpStatusBar = new statusBarItemAdapter_1.StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE));
        let omnisharpStatusBarObserver = new OmnisharpStatusBarObserver_1.OmnisharpStatusBarObserver(omnisharpStatusBar);
        eventStream.subscribe(omnisharpStatusBarObserver.post);
        let projectStatusBar = new statusBarItemAdapter_1.StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left));
        let projectStatusBarObserver = new ProjectStatusBarObserver_1.ProjectStatusBarObserver(projectStatusBar);
        eventStream.subscribe(projectStatusBarObserver.post);
        const debugMode = false;
        if (debugMode) {
            let omnisharpDebugModeLoggerObserver = new OmnisharpDebugModeLoggerObserver_1.OmnisharpDebugModeLoggerObserver(omnisharpChannel);
            eventStream.subscribe(omnisharpDebugModeLoggerObserver.post);
        }
        let platformInfo;
        try {
            platformInfo = yield platform_1.PlatformInformation.GetCurrent();
        }
        catch (error) {
            eventStream.post(new loggingEvents_1.ActivationFailure());
        }
        let telemetryObserver = new TelemetryObserver_1.TelemetryObserver(platformInfo, () => reporter);
        eventStream.subscribe(telemetryObserver.post);
        let networkSettingsProvider = NetworkSettings_1.vscodeNetworkSettingsProvider(vscode);
        let runtimeDependenciesExist = yield ensureRuntimeDependencies(extension, eventStream, platformInfo, networkSettingsProvider);
        // activate language services
        let omniSharpPromise = OmniSharp.activate(context, eventStream, extension.packageJSON, platformInfo, networkSettingsProvider);
        // register JSON completion & hover providers for project.json
        context.subscriptions.push(jsonContributions_1.addJSONProviders());
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
            eventStream.post(new loggingEvents_1.ActiveTextEditorChanged());
        }));
        let coreClrDebugPromise = Promise.resolve();
        if (runtimeDependenciesExist) {
            // activate coreclr-debug
            coreClrDebugPromise = coreclrdebug.activate(extension, context, platformInfo, eventStream);
        }
        return {
            initializationFinished: () => __awaiter(this, void 0, void 0, function* () {
                let omniSharp = yield omniSharpPromise;
                yield omniSharp.waitForEmptyEventQueue();
                yield coreClrDebugPromise;
            })
        };
    });
}
exports.activate = activate;
function ensureRuntimeDependencies(extension, eventStream, platformInfo, networkSettingsProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        return util.installFileExists(util.InstallFileType.Lock)
            .then(exists => {
            if (!exists) {
                const downloader = new CSharpExtDownloader_1.CSharpExtDownloader(networkSettingsProvider, eventStream, extension.packageJSON, platformInfo);
                return downloader.installRuntimeDependencies();
            }
            else {
                return true;
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtREFBbUQ7QUFDbkQseURBQXlEO0FBQ3pELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFFakMsNkRBQXVGO0FBQ3ZGLCtFQUE0RTtBQUM1RSwrREFBNEQ7QUFDNUQsNkVBQTBFO0FBQzFFLDJFQUF3RTtBQUN4RSw2RUFBMEU7QUFDMUUsMkVBQXdFO0FBQ3hFLCtDQUE0QztBQUM1Qyx1RkFBb0Y7QUFDcEYsbUZBQWdGO0FBQ2hGLG1HQUFnRztBQUNoRyxpRkFBOEU7QUFDOUUsdUZBQW9GO0FBQ3BGLHlDQUFpRDtBQUNqRCxpRUFBOEQ7QUFDOUQscUVBQWtFO0FBQ2xFLDJFQUEyRDtBQUMzRCx5RUFBcUU7QUFDckUsbUZBQWdGO0FBRWhGLGlEQUE4QztBQUM5Qyx1REFBMkY7QUFDM0YsMkVBQXdFO0FBRXhFLGtCQUErQixPQUFnQzs7UUFFM0QsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUM7UUFDdkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQXlCLFdBQVcsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDdkQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNuRSxNQUFNLFFBQVEsR0FBRyxJQUFJLG9DQUFpQixDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU3RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sV0FBVyxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFDO1FBRXRDLElB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