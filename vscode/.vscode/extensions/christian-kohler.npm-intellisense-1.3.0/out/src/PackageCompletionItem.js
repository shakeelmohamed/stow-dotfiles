"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vscode_1 = require('vscode');
var PackageCompletionItem = (function (_super) {
    __extends(PackageCompletionItem, _super);
    function PackageCompletionItem(label, state) {
        _super.call(this, label);
        this.kind = vscode_1.CompletionItemKind.Module;
        this.textEdit = vscode_1.TextEdit.replace(this.importStringRange(state), label);
    }
    PackageCompletionItem.prototype.importStringRange = function (_a) {
        var textCurrentLine = _a.textCurrentLine, cursorLine = _a.cursorLine, cursorPosition = _a.cursorPosition;
        var textToPosition = textCurrentLine.substring(0, cursorPosition);
        var quotationPosition = Math.max(textToPosition.lastIndexOf('\"'), textToPosition.lastIndexOf('\''));
        return new vscode_1.Range(cursorLine, quotationPosition + 1, cursorLine, cursorPosition);
    };
    return PackageCompletionItem;
}(vscode_1.CompletionItem));
exports.PackageCompletionItem = PackageCompletionItem;
//# sourceMappingURL=PackageCompletionItem.js.map