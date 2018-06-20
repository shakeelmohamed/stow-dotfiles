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
        let xml = document.getText(range);
        xml = this.xmlFormatter.formatXml(xml, xml_formatting_options_1.XmlFormattingOptionsFactory.getXmlFormattingOptions(options, document));
        return [vscode_1.TextEdit.replace(range, xml)];
    }
}
exports.XmlFormattingEditProvider = XmlFormattingEditProvider;
//# sourceMappingURL=xml-formatting-edit-provider.js.map