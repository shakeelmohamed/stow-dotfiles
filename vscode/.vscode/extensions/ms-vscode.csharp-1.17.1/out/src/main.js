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
const CSharpExtensionId_1 = require("./constants/CSharpExtensionId");
const OpenURLObserver_1 = require("./observers/OpenURLObserver");
const razor_1 = require("./razor/razor");
const RazorLoggerObserver_1 = require("./observers/RazorLoggerObserver");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionId = CSharpExtensionId_1.CSharpExtensionId;
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
        let openURLObserver = new OpenURLObserver_1.OpenURLObserver(vscode);
        eventStream.subscribe(openURLObserver.post);
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
        if (!optionProvider.GetLatestOptions().razorDisabled) {
            const razorObserver = new RazorLoggerObserver_1.RazorLoggerObserver(omnisharpChannel);
            eventStream.subscribe(razorObserver.post);
            if (!optionProvider.GetLatestOptions().razorDevMode) {
                yield razor_1.activateRazorExtension(context, extension.extensionPath, eventStream);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtREFBbUQ7QUFDbkQseURBQXlEO0FBQ3pELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFFakMsNkRBQXVGO0FBQ3ZGLCtFQUE0RTtBQUM1RSwrREFBNEQ7QUFDNUQsNkVBQTBFO0FBQzFFLDJFQUF3RTtBQUN4RSw2RUFBMEU7QUFDMUUsMkVBQXdFO0FBQ3hFLCtDQUE0QztBQUM1Qyx1RkFBb0Y7QUFDcEYsbUZBQWdGO0FBQ2hGLG1HQUFnRztBQUNoRyxpRkFBOEU7QUFDOUUsdUZBQW9GO0FBQ3BGLHlDQUFpRDtBQUNqRCxpRUFBOEQ7QUFDOUQscUVBQWtFO0FBQ2xFLDJFQUEyRDtBQUMzRCx5RUFBcUU7QUFDckUsbUZBQWdGO0FBRWhGLHVEQUEyRjtBQUMzRiwyRUFBd0U7QUFDeEUsK0RBQXlEO0FBQ3pELHFGQUE4RTtBQUM5RSxtRkFBNEU7QUFDNUUsMkVBQW1GO0FBQ25GLHlFQUFrRTtBQUNsRSxxRUFBa0U7QUFDbEUsaUVBQThEO0FBQzlELHlDQUF1RDtBQUN2RCx5RUFBc0U7QUFFdEUsa0JBQStCLE9BQWdDOztRQUUzRCxNQUFNLFdBQVcsR0FBRyxxQ0FBaUIsQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBeUIsV0FBVyxDQUFDLENBQUM7UUFDdEYsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ25FLE1BQU0sUUFBUSxHQUFHLElBQUksb0NBQWlCLENBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFD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