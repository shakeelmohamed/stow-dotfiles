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
const NetworkSettings_1 = require("./NetworkSettings");
const ErrorMessageObserver_1 = require("./observers/ErrorMessageObserver");
const OptionProvider_1 = require("./observers/OptionProvider");
const DotnetTestChannelObserver_1 = require("./observers/DotnetTestChannelObserver");
const DotnetTestLoggerObserver_1 = require("./observers/DotnetTestLoggerObserver");
const OptionChangeObserver_1 = require("./observers/OptionChangeObserver");
const CreateOptionStream_1 = require("./observables/CreateOptionStream");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionId = 'ms-vscode.csharp';
        const extension = vscode.extensions.getExtension(extensionId);
        const extensionVersion = extension.packageJSON.version;
        const aiKey = extension.packageJSON.contributes.debuggers[0].aiKey;
        const reporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, aiKey);
        util.setExtensionPath(extension.extensionPath);
        const eventStream = new EventStream_1.EventStream();
        const optionStream = CreateOptionStream_1.default(vscode);
        let optionProvider = new OptionProvider_1.default(optionStream);
        let dotnetChannel = vscode.window.createOutputChannel('.NET');
        let dotnetChannelObserver = new DotnetChannelObserver_1.DotNetChannelObserver(dotnetChannel);
        let dotnetLoggerObserver = new DotnetLoggerObserver_1.DotnetLoggerObserver(dotnetChannel);
        eventStream.subscribe(dotnetChannelObserver.post);
        eventStream.subscribe(dotnetLoggerObserver.post);
        let dotnetTestChannel = vscode.window.createOutputChannel(".NET Test Log");
        let dotnetTestChannelObserver = new DotnetTestChannelObserver_1.default(dotnetTestChannel);
        let dotnetTestLoggerObserver = new DotnetTestLoggerObserver_1.default(dotnetTestChannel);
        eventStream.subscribe(dotnetTestChannelObserver.post);
        eventStream.subscribe(dotnetTestLoggerObserver.post);
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
        let warningMessageObserver = new WarningMessageObserver_1.WarningMessageObserver(vscode, () => optionProvider.GetLatestOptions().disableMSBuildDiagnosticWarning || false);
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
        let omniSharpPromise = OmniSharp.activate(context, extension.packageJSON, platformInfo, networkSettingsProvider, eventStream, optionProvider, extension.extensionPath);
        // register JSON completion & hover providers for project.json
        context.subscriptions.push(jsonContributions_1.addJSONProviders());
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
            eventStream.post(new loggingEvents_1.ActiveTextEditorChanged());
        }));
        context.subscriptions.push(optionProvider);
        context.subscriptions.push(OptionChangeObserver_1.ShowOmniSharpConfigChangePrompt(optionStream, vscode));
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
                const downloader = new CSharpExtDownloader_1.CSharpExtDownloader(networkSettingsProvider, eventStream, extension.packageJSON, platformInfo, extension.extensionPath);
                return downloader.installRuntimeDependencies();
            }
            else {
                return true;
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtREFBbUQ7QUFDbkQseURBQXlEO0FBQ3pELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFFakMsNkRBQXVGO0FBQ3ZGLCtFQUE0RTtBQUM1RSwrREFBNEQ7QUFDNUQsNkVBQTBFO0FBQzFFLDJFQUF3RTtBQUN4RSw2RUFBMEU7QUFDMUUsMkVBQXdFO0FBQ3hFLCtDQUE0QztBQUM1Qyx1RkFBb0Y7QUFDcEYsbUZBQWdGO0FBQ2hGLG1HQUFnRztBQUNoRyxpRkFBOEU7QUFDOUUsdUZBQW9GO0FBQ3BGLHlDQUFpRDtBQUNqRCxpRUFBOEQ7QUFDOUQscUVBQWtFO0FBQ2xFLDJFQUEyRDtBQUMzRCx5RUFBcUU7QUFDckUsbUZBQWdGO0FBRWhGLHVEQUEyRjtBQUMzRiwyRUFBd0U7QUFDeEUsK0RBQXlEO0FBQ3pELHFGQUE4RTtBQUM5RSxtRkFBNEU7QUFDNUUsMkVBQW1GO0FBQ25GLHlFQUFrRTtBQUVsRSxrQkFBK0IsT0FBZ0M7O1FBRTNELE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDO1FBQ3ZDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUF5QixXQUFXLENBQUMsQ0FBQztRQUN0RixNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQ0FBaUIsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFN0UsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FB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