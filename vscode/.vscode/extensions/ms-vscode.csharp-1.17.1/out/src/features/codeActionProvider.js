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
const vscode = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const typeConversion_1 = require("../omnisharp/typeConversion");
const serverUtils = require("../omnisharp/utils");
const protocol_1 = require("../omnisharp/protocol");
const vscode_1 = require("vscode");
const CompositeDisposable_1 = require("../CompositeDisposable");
class CodeActionProvider extends abstractProvider_1.default {
    constructor(server, optionProvider) {
        super(server);
        this.optionProvider = optionProvider;
        this._commandId = 'omnisharp.runCodeAction';
        let registerCommandDisposable = vscode.commands.registerCommand(this._commandId, this._runCodeAction, this);
        this.addDisposables(new CompositeDisposable_1.default(registerCommandDisposable));
    }
    provideCodeActions(document, range, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = this.optionProvider.GetLatestOptions();
            if (options.disableCodeActions) {
                return;
            }
            let line;
            let column;
            let selection;
            // VS Code will pass the range of the word at the editor caret, even if there isn't a selection.
            // To ensure that we don't suggest selection-based refactorings when there isn't a selection, we first
            // find the text editor for this document and verify that there is a selection.
            let editor = vscode.window.visibleTextEditors.find(e => e.document === document);
            if (editor) {
                if (editor.selection.isEmpty) {
                    // The editor does not have a selection. Use the active position of the selection (i.e. the caret).
                    let active = editor.selection.active;
                    line = active.line + 1;
                    column = active.character + 1;
                }
                else {
                    // The editor has a selection. Use it.
                    let start = editor.selection.start;
                    let end = editor.selection.end;
                    selection = {
                        Start: { Line: start.line + 1, Column: start.character + 1 },
                        End: { Line: end.line + 1, Column: end.character + 1 }
                    };
                }
            }
            else {
                // We couldn't find the editor, so just use the range we were provided.
                selection = {
                    Start: { Line: range.start.line + 1, Column: range.start.character + 1 },
                    End: { Line: range.end.line + 1, Column: range.end.character + 1 }
                };
            }
            let request = {
                FileName: document.fileName,
                Line: line,
                Column: column,
                Selection: selection
            };
            return serverUtils.getCodeActions(this._server, request, token).then(response => {
                return response.CodeActions.map(codeAction => {
                    let runRequest = {
                        FileName: document.fileName,
                        Line: line,
                        Column: column,
                        Selection: selection,
                        Identifier: codeAction.Identifier,
                        WantsTextChanges: true,
                        WantsAllCodeActionOperations: true
                    };
                    return {
                        title: codeAction.Name,
                        command: this._commandId,
                        arguments: [runRequest]
                    };
                });
            }, (error) => __awaiter(this, void 0, void 0, function* () {
                return Promise.reject(`Problem invoking 'GetCodeActions' on OmniSharp server: ${error}`);
            }));
        });
    }
    _runCodeAction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return serverUtils.runCodeAction(this._server, req).then(response => {
                if (response && Array.isArray(response.Changes)) {
                    let edit = new vscode.WorkspaceEdit();
                    let fileToOpen = null;
                    let renamedFiles = [];
                    for (let change of response.Changes) {
                        if (change.ModificationType == protocol_1.FileModificationType.Renamed) {
                            // The file was renamed. Omnisharp has already persisted
                            // the right changes to disk. We don't need to try to
                            // apply text changes (and will skip this file if we see an edit)
                            renamedFiles.push(vscode_1.Uri.file(change.FileName));
                        }
                    }
                    for (let change of response.Changes) {
                        if (change.ModificationType == protocol_1.FileModificationType.Opened) {
                            // The CodeAction requested that we open a file. 
                            // Record that file name and keep processing CodeActions.
                            // If a CodeAction requests that we open multiple files 
                            // we only open the last one (what would it mean to open multiple files?)
                            fileToOpen = vscode.Uri.file(change.FileName);
                        }
                        if (change.ModificationType == protocol_1.FileModificationType.Modified) {
                            let uri = vscode.Uri.file(change.FileName);
                            if (renamedFiles.some(r => r == uri)) {
                                // This file got renamed. Omnisharp has already
                                // persisted the new file with any applicable changes.
                                continue;
                            }
                            let edits = [];
                            for (let textChange of change.Changes) {
                                edits.push(vscode.TextEdit.replace(typeConversion_1.toRange2(textChange), textChange.NewText));
                            }
                            edit.set(uri, edits);
                        }
                    }
                    let applyEditPromise = vscode.workspace.applyEdit(edit);
                    // Unfortunately, the textEditor.Close() API has been deprecated
                    // and replaced with a command that can only close the active editor.
                    // If files were renamed that weren't the active editor, their tabs will
                    // be left open and marked as "deleted" by VS Code
                    let next = applyEditPromise;
                    if (renamedFiles.some(r => r.fsPath == vscode.window.activeTextEditor.document.uri.fsPath)) {
                        next = applyEditPromise.then(_ => {
                            return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                        });
                    }
                    return fileToOpen != null
                        ? next.then(_ => {
                            return vscode.commands.executeCommand("vscode.open", fileToOpen);
                        })
                        : next;
                }
            }, (error) => __awaiter(this, void 0, void 0, function* () {
                return Promise.reject(`Problem invoking 'RunCodeAction' on OmniSharp server: ${error}`);
            }));
        });
    }
}
exports.default = CodeActionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL2NvZGVBY3Rpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsaUNBQWlDO0FBRWpDLHlEQUFrRDtBQUVsRCxnRUFBdUQ7QUFDdkQsa0RBQWtEO0FBQ2xELG9EQUE2RDtBQUM3RCxtQ0FBNkI7QUFDN0IsZ0VBQXlEO0FBR3pELHdCQUF3QyxTQUFRLDBCQUFnQjtJQUk1RCxZQUFZLE1BQXVCLEVBQVUsY0FBOEI7UUFDdkUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRDJCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUV2RSxJQUFJLENBQUMsVUFBVSxHQUFHLHlCQUF5QixDQUFDO1FBQzVDLElBQUkseUJBQXlCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSw2QkFBbUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVZLGtCQUFrQixDQUFDLFFBQTZCLEVBQUUsS0FBbUIsRUFBRSxPQUFpQyxFQUFFLEtBQStCOztZQUNsSixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDckQsSUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzVCLE9BQU87YUFDVjtZQUVELElBQUksSUFBWSxDQUFDO1lBQ2pCLElBQUksTUFBYyxDQUFDO1lBQ25CLElBQUksU0FBNEIsQ0FBQztZQUVqQyxnR0FBZ0c7WUFDaEcsc0dBQXNHO1lBQ3RHLCtFQUErRTtZQUMvRSxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGtC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