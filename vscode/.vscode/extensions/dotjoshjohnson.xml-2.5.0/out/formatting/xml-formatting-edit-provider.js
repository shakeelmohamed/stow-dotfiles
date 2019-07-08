"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const xml_formatting_options_1 = require("./xml-formatting-options");
class XmlFormattingEditProvider {
    constructor(xmlFormatter) {
        this.xmlFormatter = xmlFormatter;
    }
    provideDocumentFormattingEdits(document, options, token) {
        const lastLine = document.lineAt(document.lineCount - 1);
        const documentRange = new vscode_1.Range(document.positionAt(0), lastLine.range.end);
        return this.provideDocumentRangeFormattingEdits(document, documentRange, options, token);
    }
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        const allXml = document.getText();
        let selectedXml = document.getText(range);
        const extFormattingOptions = xml_formatting_options_1.XmlFormattingOptionsFactory.getXmlFormattingOptions(options, document);
        const selectionStartOffset = document.offsetAt(range.start);
        let tabCount = 0;
        let spaceCount = 0;
        for (let i = (selectionStartOffset - 1); i >= 0; i--) {
            const cc = allXml.charAt(i);
            if (/\t/.test(cc)) {
                tabCount++;
            }
            else if (/ /.test(cc)) {
                spaceCount++;
            }
            else {
                break;
            }
        }
        if (options.insertSpaces) {
            extFormattingOptions.initialIndentLevel = Math.ceil(spaceCount / (options.tabSize || 1));
        }
        else {
            extFormattingOptions.initialIndentLevel = tabCount;
        }
        selectedXml = this.xmlFormatter.formatXml(selectedXml, extFormattingOptions);
        // we need to remove the leading whitespace because the formatter will add an indent before the first element
        selectedXml = selectedXml.replace(/^\s+/, "");
        return [vscode_1.TextEdit.replace(range, selectedXml)];
    }
}
exports.XmlFormattingEditProvider = XmlFormattingEditProvider;
//# sourceMappingURL=xml-formatting-edit-provider.js.map