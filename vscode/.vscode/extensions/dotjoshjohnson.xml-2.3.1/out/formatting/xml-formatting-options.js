"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../common");
class XmlFormattingOptionsFactory {
    static getXmlFormattingOptions(formattingOptions, document) {
        return {
            editorOptions: formattingOptions,
            enforcePrettySelfClosingTagOnFormat: common_1.Configuration.enforcePrettySelfClosingTagOnFormat(document.uri),
            newLine: (document.eol === vscode_1.EndOfLine.CRLF) ? "\r\n" : "\n",
            removeCommentsOnMinify: common_1.Configuration.removeCommentsOnMinify(document.uri),
            splitAttributesOnFormat: common_1.Configuration.splitAttributesOnFormat(document.uri),
            splitXmlnsOnFormat: common_1.Configuration.splitXmlnsOnFormat(document.uri)
        };
    }
}
exports.XmlFormattingOptionsFactory = XmlFormattingOptionsFactory;
//# sourceMappingURL=xml-formatting-options.js.map