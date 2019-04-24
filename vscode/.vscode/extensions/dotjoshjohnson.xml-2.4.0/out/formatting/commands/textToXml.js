"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function textToXml(textEditor) {
    textEditor.edit(textEdit => {
        const selections = textEditor.selections;
        selections.forEach(selection => {
            if (selection.isEmpty) {
                selection = new vscode_1.Selection(textEditor.document.positionAt(0), textEditor.document.positionAt(textEditor.document.getText().length));
            }
            const txt = textEditor.document.getText(new vscode_1.Range(selection.start, selection.end));
            const transformed = txt.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            textEdit.replace(selection, transformed);
        });
    });
}
exports.textToXml = textToXml;
//# sourceMappingURL=textToXml.js.map