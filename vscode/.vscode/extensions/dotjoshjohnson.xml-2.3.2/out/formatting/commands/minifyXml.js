"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const xml_formatter_1 = require("../xml-formatter");
const xml_formatting_options_1 = require("../xml-formatting-options");
function minifyXml(editor, edit) {
    const xmlFormatter = xml_formatter_1.XmlFormatterFactory.getXmlFormatter();
    const xmlFormattingOptions = xml_formatting_options_1.XmlFormattingOptionsFactory.getXmlFormattingOptions({
        insertSpaces: editor.options.insertSpaces,
        tabSize: editor.options.tabSize
    }, editor.document);
    const endPosition = editor.document.lineAt(editor.document.lineCount - 1).rangeIncludingLineBreak.end;
    const range = new vscode_1.Range(editor.document.positionAt(0), endPosition);
    edit.replace(range, xmlFormatter.minifyXml(editor.document.getText(), xmlFormattingOptions));
}
exports.minifyXml = minifyXml;
//# sourceMappingURL=minifyXml.js.map