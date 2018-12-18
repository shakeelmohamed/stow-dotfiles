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
const utils = require("./utils");
const vscode = require("vscode");
const assets_1 = require("../assets");
const diagnosticsProvider_1 = require("../features/diagnosticsProvider");
const common_1 = require("../common");
const configurationProvider_1 = require("../configurationProvider");
const codeActionProvider_1 = require("../features/codeActionProvider");
const codeLensProvider_1 = require("../features/codeLensProvider");
const completionItemProvider_1 = require("../features/completionItemProvider");
const definitionMetadataDocumentProvider_1 = require("../features/definitionMetadataDocumentProvider");
const definitionProvider_1 = require("../features/definitionProvider");
const documentHighlightProvider_1 = require("../features/documentHighlightProvider");
const documentSymbolProvider_1 = require("../features/documentSymbolProvider");
const formattingEditProvider_1 = require("../features/formattingEditProvider");
const hoverProvider_1 = require("../features/hoverProvider");
const implementationProvider_1 = require("../features/implementationProvider");
const server_1 = require("./server");
const referenceProvider_1 = require("../features/referenceProvider");
const renameProvider_1 = require("../features/renameProvider");
const signatureHelpProvider_1 = require("../features/signatureHelpProvider");
const dotnetTest_1 = require("../features/dotnetTest");
const workspaceSymbolProvider_1 = require("../features/workspaceSymbolProvider");
const changeForwarding_1 = require("../features/changeForwarding");
const commands_1 = require("../features/commands");
const loggingEvents_1 = require("./loggingEvents");
const CompositeDisposable_1 = require("../CompositeDisposable");
const Disposable_1 = require("../Disposable");
const virtualDocumentTracker_1 = require("../features/virtualDocumentTracker");
const structureProvider_1 = require("../features/structureProvider");
const OmniSharpMonoResolver_1 = require("./OmniSharpMonoResolver");
const getMonoVersion_1 = require("../utils/getMonoVersion");
function activate(context, packageJSON, platformInfo, provider, eventStream, optionProvider, extensionPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentSelector = {
            language: 'csharp',
        };
        const options = optionProvider.GetLatestOptions();
        let omnisharpMonoResolver = new OmniSharpMonoResolver_1.OmniSharpMonoResolver(getMonoVersion_1.getMonoVersion);
        const server = new server_1.OmniSharpServer(vscode, provider, packageJSON, platformInfo, eventStream, optionProvider, extensionPath, omnisharpMonoResolver);
        exports.omnisharp = server;
        const advisor = new diagnosticsProvider_1.Advisor(server); // create before server is started
        const disposables = new CompositeDisposable_1.default();
        let localDisposables;
        disposables.add(server.onServerStart(() => {
            // register language feature provider on start
            localDisposables = new CompositeDisposable_1.default();
            const definitionMetadataDocumentProvider = new definitionMetadataDocumentProvider_1.default();
            definitionMetadataDocumentProvider.register();
            localDisposables.add(definitionMetadataDocumentProvider);
            const definitionProvider = new definitionProvider_1.default(server, definitionMetadataDocumentProvider);
            localDisposables.add(vscode.languages.registerDefinitionProvider(documentSelector, definitionProvider));
            localDisposables.add(vscode.languages.registerDefinitionProvider({ scheme: definitionMetadataDocumentProvider.scheme }, definitionProvider));
            localDisposables.add(vscode.languages.registerImplementationProvider(documentSelector, new implementationProvider_1.default(server)));
            const testManager = new dotnetTest_1.default(server, eventStream);
            localDisposables.add(testManager);
            localDisposables.add(vscode.languages.registerCodeLensProvider(documentSelector, new codeLensProvider_1.default(server, testManager, optionProvider)));
            localDisposables.add(vscode.languages.registerDocumentHighlightProvider(documentSelector, new documentHighlightProvider_1.default(server)));
            localDisposables.add(vscode.languages.registerDocumentSymbolProvider(documentSelector, new documentSymbolProvider_1.default(server)));
            localDisposables.add(vscode.languages.registerReferenceProvider(documentSelector, new referenceProvider_1.default(server)));
            localDisposables.add(vscode.languages.registerHoverProvider(documentSelector, new hoverProvider_1.default(server)));
            localDisposables.add(vscode.languages.registerRenameProvider(documentSelector, new renameProvider_1.default(server)));
            if (options.useFormatting) {
                localDisposables.add(vscode.languages.registerDocumentRangeFormattingEditProvider(documentSelector, new formattingEditProvider_1.default(server)));
                localDisposables.add(vscode.languages.registerOnTypeFormattingEditProvider(documentSelector, new formattingEditProvider_1.default(server), '}', ';'));
            }
            localDisposables.add(vscode.languages.registerCompletionItemProvider(documentSelector, new completionItemProvider_1.default(server), '.', ' '));
            localDisposables.add(vscode.languages.registerWorkspaceSymbolProvider(new workspaceSymbolProvider_1.default(server, optionProvider)));
            localDisposables.add(vscode.languages.registerSignatureHelpProvider(documentSelector, new signatureHelpProvider_1.default(server), '(', ','));
            const codeActionProvider = new codeActionProvider_1.default(server, optionProvider);
            localDisposables.add(codeActionProvider);
            localDisposables.add(vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider));
            localDisposables.add(diagnosticsProvider_1.default(server, advisor));
            localDisposables.add(changeForwarding_1.default(server));
            localDisposables.add(virtualDocumentTracker_1.default(server, eventStream));
            localDisposables.add(vscode.languages.registerFoldingRangeProvider(documentSelector, new structureProvider_1.StructureProvider(server)));
        }));
        disposables.add(server.onServerStop(() => {
            // remove language feature providers on stop
            if (localDisposables) {
                localDisposables.dispose();
            }
            localDisposables = null;
        }));
        disposables.add(commands_1.default(server, platformInfo, eventStream, optionProvider, omnisharpMonoResolver));
        if (!context.workspaceState.get('assetPromptDisabled')) {
            disposables.add(server.onServerStart(() => {
                // Update or add tasks.json and launch.json
                assets_1.addAssetsIfNecessary(server).then(result => {
                    if (result === assets_1.AddAssetResult.Disable) {
                        context.workspaceState.update('assetPromptDisabled', true);
                    }
                });
            }));
        }
        // After server is started (and projects are loaded), check to see if there are
        // any project.json projects if the suppress option is not set. If so, notify the user about migration.
        let csharpConfig = vscode.workspace.getConfiguration('csharp');
        if (!csharpConfig.get('suppressProjectJsonWarning')) {
            disposables.add(server.onServerStart(() => {
                utils.requestWorkspaceInformation(server)
                    .then(workspaceInfo => {
                    if (workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                        const shortMessage = 'project.json is no longer a supported project format for .NET Core applications.';
                        const moreDetailItem = { title: 'More Detail' };
                        vscode.window.showWarningMessage(shortMessage, moreDetailItem)
                            .then(item => {
                            eventStream.post(new loggingEvents_1.ProjectJsonDeprecatedWarning());
                        });
                    }
                });
            }));
        }
        // Send telemetry about the sorts of projects the server was started on.
        disposables.add(server.onServerStart(() => {
            let measures = {};
            utils.requestWorkspaceInformation(server)
                .then(workspaceInfo => {
                if (workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                    measures['projectjson.projectcount'] = workspaceInfo.DotNet.Projects.length;
                    measures['projectjson.filecount'] = common_1.sum(workspaceInfo.DotNet.Projects, p => common_1.safeLength(p.SourceFiles));
                }
                if (workspaceInfo.MsBuild && workspaceInfo.MsBuild.Projects.length > 0) {
                    measures['msbuild.projectcount'] = workspaceInfo.MsBuild.Projects.length;
                    measures['msbuild.filecount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => common_1.safeLength(p.SourceFiles));
                    measures['msbuild.unityprojectcount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => p.IsUnityProject ? 1 : 0);
                    measures['msbuild.netcoreprojectcount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => utils.isNetCoreProject(p) ? 1 : 0);
                }
                // TODO: Add measurements for script.
                eventStream.post(new loggingEvents_1.OmnisharpStart('OmniSharp.Start', measures));
            });
        }));
        disposables.add(server.onBeforeServerStart(path => {
            if (options.razorDevMode) {
                eventStream.post(new loggingEvents_1.RazorDevModeActive());
            }
            // read and store last solution or folder path
            context.workspaceState.update('lastSolutionPathOrFolder', path);
        }));
        if (options.autoStart) {
            server.autoStart(context.workspaceState.get('lastSolutionPathOrFolder'));
        }
        // stop server on deactivate
        disposables.add(new Disposable_1.default(() => {
            advisor.dispose();
            server.stop();
        }));
        // Register ConfigurationProvider
        disposables.add(vscode.debug.registerDebugConfigurationProvider('coreclr', new configurationProvider_1.CSharpConfigurationProvider(server)));
        context.subscriptions.push(disposables);
        return new Promise(resolve => server.onServerStart(e => resolve(server)));
    });
}
exports.activate = activate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsc0NBQWlFO0FBQ2pFLHlFQUE2RTtBQUM3RSxzQ0FBNEM7QUFDNUMsb0VBQXVFO0FBQ3ZFLHVFQUFnRTtBQUNoRSxtRUFBNEQ7QUFDNUQsK0VBQXdFO0FBQ3hFLHVHQUFnRztBQUNoRyx1RUFBZ0U7QUFDaEUscUZBQThFO0FBQzlFLCtFQUF3RTtBQUN4RSwrRUFBZ0U7QUFDaEUsNkRBQXNEO0FBQ3RELCtFQUF3RTtBQUN4RSxxQ0FBMkM7QUFDM0MscUVBQThEO0FBQzlELCtEQUF3RDtBQUN4RCw2RUFBc0U7QUFDdEUsdURBQWlEO0FBQ2pELGlGQUEwRTtBQUMxRSxtRUFBMEQ7QUFDMUQsbURBQW9EO0FBRXBELG1EQUFtRztBQUduRyxnRUFBeUQ7QUFDekQsOENBQXVDO0FBRXZDLCtFQUF1RTtBQUN2RSxxRUFBa0U7QUFDbEUsbUVBQWdFO0FBQ2hFLDREQUF5RDtBQUl6RCxrQkFBK0IsT0FBZ0MsRUFBRSxXQUFnQixFQUFFLFlBQWlDLEVBQUUsUUFBaUMsRUFBRSxXQUF3QixFQUFFLGNBQThCLEVBQUUsYUFBcUI7O1FBQ3BPLE1BQU0sZ0JBQWdCLEdBQTRCO1lBQzlDLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUM7UUFFRixNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNsRCxJQUFJLHFCQUFxQixHQUFHLElBQUksNkNBQXFCLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxhQUFhLEVB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