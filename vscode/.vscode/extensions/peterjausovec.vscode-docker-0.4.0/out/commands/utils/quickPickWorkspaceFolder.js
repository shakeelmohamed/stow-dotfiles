"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
async function quickPickWorkspaceFolder(noWorkspacesMessage) {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0];
    }
    else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
        let selected = await vscode.window.showWorkspaceFolderPick();
        if (!selected) {
            throw new vscode_azureextensionui_1.UserCancelledError();
        }
        return selected;
    }
    else {
        throw new Error(noWorkspacesMessage);
    }
}
exports.quickPickWorkspaceFolder = quickPickWorkspaceFolder;
//# sourceMappingURL=quickPickWorkspaceFolder.js.map