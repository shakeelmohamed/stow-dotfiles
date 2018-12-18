"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
const fse = require("fs-extra");
const vscode = require("vscode");
const acrTools_1 = require("../../../utils/Azure/acrTools");
class LogContentProvider {
    constructor() {
        this.onDidChangeEvent = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
        let parse = JSON.parse(uri.query);
        return decodeBase64(parse.log);
    }
    get onDidChange() {
        return this.onDidChangeEvent.event;
    }
    update(uri, message) {
        this.onDidChangeEvent.fire(uri);
    }
}
LogContentProvider.scheme = 'purejs';
exports.LogContentProvider = LogContentProvider;
function decodeBase64(str) {
    return Buffer.from(str, 'base64').toString('ascii');
}
exports.decodeBase64 = decodeBase64;
function encodeBase64(str) {
    return Buffer.from(str, 'ascii').toString('base64');
}
exports.encodeBase64 = encodeBase64;
/** Loads log text from remote url using azure blobservices */
async function accessLog(url, title, download) {
    let blobInfo = acrTools_1.getBlobInfo(url);
    let blob = azure_storage_1.createBlobServiceWithSas(blobInfo.host, blobInfo.sasToken);
    let text1 = await acrTools_1.getBlobToText(blobInfo, blob, 0);
    if (download) {
        await downloadLog(text1, title);
    }
    else {
        openLogInNewWindow(text1, title);
    }
}
exports.accessLog = accessLog;
function openLogInNewWindow(content, title) {
    const scheme = 'purejs';
    let query = JSON.stringify({ 'log': encodeBase64(content) });
    let uri = vscode.Uri.parse(`${scheme}://authority/${title}.log?${query}#idk`);
    vscode.workspace.openTextDocument(uri).then((doc) => {
        return vscode.window.showTextDocument(doc, vscode.ViewColumn.Active + 1, true);
    });
}
async function downloadLog(content, title) {
    let uri = await vscode.window.showSaveDialog({
        filters: { 'Log': ['.log', '.txt'] },
        defaultUri: vscode.Uri.file(`${title}.log`)
    });
    fse.writeFile(uri.fsPath, content, (err) => {
        if (err) {
            throw err;
        }
    });
}
exports.downloadLog = downloadLog;
//# sourceMappingURL=logFileManager.js.map