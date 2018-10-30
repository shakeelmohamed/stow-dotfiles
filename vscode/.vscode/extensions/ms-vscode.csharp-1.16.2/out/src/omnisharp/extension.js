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
function activate(context, packageJSON, platformInfo, provider, eventStream, optionProvider, extensionPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentSelector = {
            language: 'csharp',
        };
        const options = optionProvider.GetLatestOptions();
        const server = new server_1.OmniSharpServer(vscode, provider, packageJSON, platformInfo, eventStream, optionProvider, extensionPath);
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
            localDisposables.add(vscode.languages.registerWorkspaceSymbolProvider(new workspaceSymbolProvider_1.default(server)));
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
        disposables.add(commands_1.default(server, platformInfo, eventStream, optionProvider));
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
        // read and store last solution or folder path
        disposables.add(server.onBeforeServerStart(path => context.workspaceState.update('lastSolutionPathOrFolder', path)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsc0NBQWlFO0FBQ2pFLHlFQUE2RTtBQUM3RSxzQ0FBNEM7QUFDNUMsb0VBQXVFO0FBQ3ZFLHVFQUFnRTtBQUNoRSxtRUFBNEQ7QUFDNUQsK0VBQXdFO0FBQ3hFLHVHQUFnRztBQUNoRyx1RUFBZ0U7QUFDaEUscUZBQThFO0FBQzlFLCtFQUF3RTtBQUN4RSwrRUFBZ0U7QUFDaEUsNkRBQXNEO0FBQ3RELCtFQUF3RTtBQUN4RSxxQ0FBMkM7QUFDM0MscUVBQThEO0FBQzlELCtEQUF3RDtBQUN4RCw2RUFBc0U7QUFDdEUsdURBQWlEO0FBQ2pELGlGQUEwRTtBQUMxRSxtRUFBMEQ7QUFDMUQsbURBQW9EO0FBRXBELG1EQUErRTtBQUcvRSxnRUFBeUQ7QUFDekQsOENBQXVDO0FBRXZDLCtFQUF1RTtBQUN2RSxxRUFBa0U7QUFJbEUsa0JBQStCLE9BQWdDLEVBQUUsV0FBZ0IsRUFBRSxZQUFpQyxFQUFFLFFBQWlDLEVBQUUsV0FBd0IsRUFBRSxjQUE4QixFQUFFLGFBQXFCOztRQUNwTyxNQUFNLGdCQUFnQixHQUE0QjtZQUM5QyxRQUFRLEVBQUUsUUFBUTtTQUNyQixDQUFDO1FBRUYsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzVILGlCQUFTLEdBQUcsTUFBTSxDQUFDO1FBQ25CLE1BQU0sT0FBTyxHQUFHLElBQUksNkJBQU8sQ0FBQyxNQUFNLENBQUMs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