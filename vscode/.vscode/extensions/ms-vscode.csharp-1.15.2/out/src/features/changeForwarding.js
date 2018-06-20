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
        if (document.isUntitled || document.languageId !== 'csharp') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlRm9yd2FyZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jaGFuZ2VGb3J3YXJkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsbUNBQXNDO0FBRXRDLGtEQUFrRDtBQUNsRCxvREFBdUQ7QUFFdkQsZ0VBQXlEO0FBRXpELGdDQUFnQyxNQUF1QjtJQUVuRCxPQUFPLGtCQUFTLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFFN0MsSUFBSSxFQUFDLFFBQVEsRUFBQyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDekQsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNyQixPQUFPO1NBQ1Y7UUFFRCxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCw0QkFBNEIsTUFBdUI7SUFFL0MsMkJBQTJCLFVBQTBCO1FBQ2pELE9BQU8sVUFBUyxHQUFRO1lBRXBCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQ3JCLE9BQU87YUFDVjtZQUVELElBQUksR0FBRyxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLENBQUM7WUFFOUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQywrQ0FBK0MsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRSxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLGtCQUFTLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUQsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFdkUsT0FBTyxJQUFJLDZCQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRCx3QkFBdUMsTUFBdUI7SUFFMUQsbURBQW1EO0lBQ25ELE9BQU8sSUFBSSw2QkFBbUIsQ0FDMUIsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEVBQzlCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQU5ELGlDQU1DIn0=