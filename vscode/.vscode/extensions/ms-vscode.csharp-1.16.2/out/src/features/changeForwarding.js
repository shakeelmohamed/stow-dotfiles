"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const serverUtils = require("../omnisharp/utils");
const protocol_1 = require("../omnisharp/protocol");
const CompositeDisposable_1 = require("../CompositeDisposable");
function forwardDocumentChanges(server) {
    return vscode_1.workspace.onDidChangeTextDocument(event => {
        let { document } = event;
        if (document.isUntitled || document.languageId !== 'csharp' || document.uri.scheme !== 'file') {
            return;
        }
        if (!server.isRunning()) {
            return;
        }
        serverUtils.updateBuffer(server, { Buffer: document.getText(), FileName: document.fileName }).catch(err => {
            console.error(err);
            return err;
        });
    });
}
function forwardFileChanges(server) {
    function onFileSystemEvent(changeType) {
        return function (uri) {
            if (!server.isRunning()) {
                return;
            }
            let req = { FileName: uri.fsPath, changeType };
            serverUtils.filesChanged(server, [req]).catch(err => {
                console.warn(`[o] failed to forward file change event for ${uri.fsPath}`, err);
                return err;
            });
        };
    }
    const watcher = vscode_1.workspace.createFileSystemWatcher('**/*.*');
    let d1 = watcher.onDidCreate(onFileSystemEvent(protocol_1.FileChangeType.Create));
    let d2 = watcher.onDidDelete(onFileSystemEvent(protocol_1.FileChangeType.Delete));
    let d3 = watcher.onDidChange(onFileSystemEvent(protocol_1.FileChangeType.Change));
    return new CompositeDisposable_1.default(watcher, d1, d2, d3);
}
function forwardChanges(server) {
    // combine file watching and text document watching
    return new CompositeDisposable_1.default(forwardDocumentChanges(server), forwardFileChanges(server));
}
exports.default = forwardChanges;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlRm9yd2FyZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jaGFuZ2VGb3J3YXJkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsbUNBQXNDO0FBRXRDLGtEQUFrRDtBQUNsRCxvREFBdUQ7QUFFdkQsZ0VBQXlEO0FBRXpELGdDQUFnQyxNQUF1QjtJQUVuRCxPQUFPLGtCQUFTLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFFN0MsSUFBSSxFQUFDLFFBQVEsRUFBQyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO1lBQzNGLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDckIsT0FBTztTQUNWO1FBRUQsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDcEcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsNEJBQTRCLE1BQXVCO0lBRS9DLDJCQUEyQixVQUEwQjtRQUNqRCxPQUFPLFVBQVMsR0FBUTtZQUVwQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUNyQixPQUFPO2FBQ1Y7WUFFRCxJQUFJLEdBQUcsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxDQUFDO1lBRTlDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsK0NBQStDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDL0UsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNLE9BQU8sR0FBRyxrQkFBUyxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVELElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMseUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMseUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMseUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXZFLE9BQU8sSUFBSSw2QkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQsd0JBQXVDLE1BQXVCO0lBRTFELG1EQUFtRDtJQUNuRCxPQUFPLElBQUksNkJBQW1CLENBQzFCLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxFQUM5QixrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFORCxpQ0FNQyJ9