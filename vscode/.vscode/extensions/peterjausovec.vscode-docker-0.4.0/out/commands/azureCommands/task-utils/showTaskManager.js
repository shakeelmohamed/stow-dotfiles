"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class TaskContentProvider {
    constructor() {
        this.onDidChangeEvent = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
        const parse = JSON.parse(uri.query);
        return decodeBase64(parse.content);
    }
    get onDidChange() {
        return this.onDidChangeEvent.event;
    }
    update(uri, message) {
        this.onDidChangeEvent.fire(uri);
    }
}
TaskContentProvider.scheme = 'task';
exports.TaskContentProvider = TaskContentProvider;
function decodeBase64(str) {
    return Buffer.from(str, 'base64').toString('utf8');
}
exports.decodeBase64 = decodeBase64;
function encodeBase64(str) {
    return Buffer.from(str, 'ascii').toString('base64');
}
exports.encodeBase64 = encodeBase64;
function openTask(content, title) {
    const scheme = 'task';
    let query = JSON.stringify({ 'content': encodeBase64(content) });
    let uri = vscode.Uri.parse(`${scheme}://authority/${title}.json?${query}#idk`);
    vscode.workspace.openTextDocument(uri).then((doc) => {
        return vscode.window.showTextDocument(doc, vscode.ViewColumn.Active + 1, true);
    });
}
exports.openTask = openTask;
//# sourceMappingURL=showTaskManager.js.map