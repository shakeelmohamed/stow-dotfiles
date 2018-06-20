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
const options_1 = require("./options");
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
function activate(context, eventStream, packageJSON, platformInfo, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentSelector = {
            language: 'csharp',
            scheme: 'file' // only files from disk
        };
        const options = options_1.Options.Read(vscode);
        const server = new server_1.OmniSharpServer(vscode, provider, eventStream, packageJSON, platformInfo);
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
            localDisposables.add(vscode.languages.registerCodeLensProvider(documentSelector, new codeLensProvider_1.default(server, testManager)));
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
            const codeActionProvider = new codeActionProvider_1.default(server);
            localDisposables.add(codeActionProvider);
            localDisposables.add(vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider));
            localDisposables.add(diagnosticsProvider_1.default(server, advisor));
            localDisposables.add(changeForwarding_1.default(server));
        }));
        disposables.add(server.onServerStop(() => {
            // remove language feature providers on stop
            if (localDisposables) {
                localDisposables.dispose();
            }
            localDisposables = null;
        }));
        disposables.add(commands_1.default(server, eventStream, platformInfo));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsc0NBQWlFO0FBQ2pFLHlFQUE2RTtBQUM3RSxzQ0FBNEM7QUFDNUMsb0VBQXVFO0FBQ3ZFLHVFQUFnRTtBQUNoRSxtRUFBNEQ7QUFDNUQsK0VBQXdFO0FBQ3hFLHVHQUFnRztBQUNoRyx1RUFBZ0U7QUFDaEUscUZBQThFO0FBQzlFLCtFQUF3RTtBQUN4RSwrRUFBZ0U7QUFDaEUsNkRBQXNEO0FBQ3RELCtFQUF3RTtBQUN4RSxxQ0FBMkM7QUFDM0MsdUNBQW9DO0FBQ3BDLHFFQUE4RDtBQUM5RCwrREFBd0Q7QUFDeEQsNkVBQXNFO0FBQ3RFLHVEQUFpRDtBQUNqRCxpRkFBMEU7QUFDMUUsbUVBQTBEO0FBQzFELG1EQUFvRDtBQUVwRCxtREFBK0U7QUFHL0UsZ0VBQXlEO0FBQ3pELDhDQUF1QztBQUl2QyxrQkFBK0IsT0FBZ0MsRUFBRSxXQUF3QixFQUFFLFdBQWdCLEVBQUUsWUFBaUMsRUFBRSxRQUFpQzs7UUFDN0ssTUFBTSxnQkFBZ0IsR0FBNEI7WUFDOUMsUUFBUSxFQUFFLFFBQVE7WUFDbEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUI7U0FDekMsQ0FBQztRQUVGLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDN0YsaUJBQVMsR0FBRyxNQUFNLENBQUM7UUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBSSw2QkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsa0NBQWtDO1FBQ3ZFLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQW1CLEVBQUUsQ0FBQztRQUM5QyxJQUFJLGdCQUFzQyxDQUFDO1FBRTNDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7WUFDdEMsOENBQThDO1lBQzlDLGdCQUFnQixHQUFHLElBQUksNkJBQW1CLEVBQUUsQ0FBQztZQUM3QyxNQUFNLGtDQUFrQyxHQUFHLElBQUksNENBQWtDLEVBQUUsQ0FBQztZQUNwRixrQ0FBa0MsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUN6RCxNQUFNLGtCQUFrQixHQUFHLElBQUksNEJBQWtCLENBQUMsTUFBTSxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFDOUYsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3hHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLEVBQUUsTUFBTSxFQUFFLGtDQUFrQyxDQUFDLE1BQU0sRUFBRSxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM3SSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1SCxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLDBCQUFnQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0gsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxtQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUgsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSwyQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEgsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSx1QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLHdCQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVHLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkNBQTJDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0NBQW9DLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3ZJO1lBQ0QsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0SSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLGlDQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLCtCQUFxQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BJLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSw0QkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6QyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDekcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLDZCQUFpQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pELGdCQUFnQixDQUFDLEdBQUcsQ0FBQywwQkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFDckMsNENBQTRDO1lBQzVDLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ2xCLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzlCO1lBQ0QsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFSixXQUFXLENBQUMsR0FBRyxDQUFDLGtCQUFnQixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQVUscUJBQXFCLENBQUMsRUFBRTtZQUM3RCxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO2dCQUN0QywyQ0FBMkM7Z0JBQzNDLDZCQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDdkMsSUFBSSxNQUFNLEtBQUssdUJBQWMsQ0FBQyxPQUFPLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO3FCQUM5RDtnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUDtRQUVELCtFQUErRTtRQUMvRSx1R0FBdUc7UUFDdkcsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBVSw0QkFBNEIsQ0FBQyxFQUFFO1lBQzFELFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUM7cUJBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxhQUFhLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2xFLE1BQU0sWUFBWSxHQUFHLGtGQUFrRixDQUFDO3dCQUN4RyxNQUFNLGNBQWMsR0FBdUIsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUM7d0JBQ3BFLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQzs2QkFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUNULFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSw0Q0FBNEIsRUFBRSxDQUFDLENBQUM7d0JBQ3pELENBQUMsQ0FBQyxDQUFDO3FCQUNWO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNQO1FBRUQsd0VBQXdFO1FBQ3hFLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7WUFDdEMsSUFBSSxRQUFRLEdBQThCLEVBQUUsQ0FBQztZQUU3QyxLQUFLLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDO2lCQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ2xCLElBQUksYUFBYSxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNsRSxRQUFRLENBQUMsMEJBQTBCLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQzVFLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLFlBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7aUJBQzFHO2dCQUVELElBQUksYUFBYSxDQUFDLE9BQU8sSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNwRSxRQUFRLENBQUMsc0JBQXNCLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQ3pFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLFlBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ3BHLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLFlBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNHLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLFlBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekg7Z0JBRUQscUNBQXFDO2dCQUVyQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQWMsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLDhDQUE4QztRQUM5QyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVySCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDbkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBUywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7U0FDcEY7UUFFRCw0QkFBNEI7UUFDNUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9CQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLGlDQUFpQztRQUNqQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsU0FBUyxFQUFFLElBQUksbURBQTJCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJILE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXhDLE9BQU8sSUFBSSxPQUFPLENBQWtCLE9BQU8sQ0FBQyxFQUFFLENBQzFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDckIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQUE7QUFsSUQsNEJBa0lDIn0=