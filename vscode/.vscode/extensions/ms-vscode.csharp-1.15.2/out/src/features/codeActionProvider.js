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
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const serverUtils = require("../omnisharp/utils");
const options_1 = require("../omnisharp/options");
const protocol_1 = require("../omnisharp/protocol");
const vscode_1 = require("vscode");
const CompositeDisposable_1 = require("../CompositeDisposable");
class CodeActionProvider extends abstractProvider_1.default {
    constructor(server) {
        super(server);
        this._commandId = 'omnisharp.runCodeAction';
        this._resetCachedOptions();
        let d1 = vscode.workspace.onDidChangeConfiguration(this._resetCachedOptions, this);
        let d2 = vscode.commands.registerCommand(this._commandId, this._runCodeAction, this);
        this.addDisposables(new CompositeDisposable_1.default(d1, d2));
    }
    _resetCachedOptions() {
        this._options = options_1.Options.Read(vscode);
    }
    provideCodeActions(document, range, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._options.disableCodeActions) {
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
                                edits.push(vscode.TextEdit.replace(typeConvertion_1.toRange2(textChange), textChange.NewText));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL2NvZGVBY3Rpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsaUNBQWlDO0FBRWpDLHlEQUFrRDtBQUVsRCxnRUFBdUQ7QUFDdkQsa0RBQWtEO0FBQ2xELGtEQUErQztBQUMvQyxvREFBNkQ7QUFDN0QsbUNBQTZCO0FBQzdCLGdFQUF5RDtBQUV6RCx3QkFBd0MsU0FBUSwwQkFBZ0I7SUFLNUQsWUFBWSxNQUF1QjtRQUMvQixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsVUFBVSxHQUFHLHlCQUF5QixDQUFDO1FBRTVDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRTNCLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25GLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksNkJBQW1CLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVPLG1CQUFtQjtRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFWSxrQkFBa0IsQ0FBQyxRQUE2QixFQUFFLEtBQW1CLEVBQUUsT0FBaUMsRUFBRSxLQUErQjs7WUFDbEosSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFO2dCQUNsQyxPQUFPO2FBQ1Y7WUFFRCxJ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