"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const xmldom_1 = require("xmldom");
const xpath_builder_1 = require("../xpath-builder");
function getCurrentXPath(editor, edit) {
    if (!editor.selection) {
        vscode_1.window.showInformationMessage("Please put your cursor in an element or attribute name.");
        return;
    }
    const document = new xmldom_1.DOMParser().parseFromString(editor.document.getText());
    const xpath = new xpath_builder_1.XPathBuilder(document).build(editor.selection.start);
    vscode_1.window.showInputBox({
        value: xpath,
        valueSelection: undefined
    });
}
exports.getCurrentXPath = getCurrentXPath;
//# sourceMappingURL=getCurrentXPath.js.map