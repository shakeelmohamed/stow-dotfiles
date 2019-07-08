"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../../common");
const xml_formatter_1 = require("../xml-formatter");
const xml_formatting_edit_provider_1 = require("../xml-formatting-edit-provider");
function formatAsXml(editor, edit) {
    const xmlFormattingEditProvider = new xml_formatting_edit_provider_1.XmlFormattingEditProvider(xml_formatter_1.XmlFormatterFactory.getXmlFormatter());
    const formattingOptions = {
        insertSpaces: editor.options.insertSpaces,
        tabSize: editor.options.tabSize
    };
    let edits;
    if (!editor.selection.isEmpty) {
        edits = xmlFormattingEditProvider.provideDocumentRangeFormattingEdits(editor.document, new vscode_1.Range(editor.selection.start, editor.selection.end), formattingOptions, null);
    }
    else {
        edits = xmlFormattingEditProvider.provideDocumentFormattingEdits(editor.document, formattingOptions, null);
    }
    for (let i = 0; i < edits.length; i++) {
        const textEdit = edits[i];
        editor.edit((editBuilder) => __awaiter(this, void 0, void 0, function* () {
            editBuilder.replace(textEdit.range, textEdit.newText);
            // wiggle the cursor to deselect the formatted XML (is there a non-hacky way to go about this?)
            yield common_1.NativeCommands.cursorMove("left", "character");
            yield common_1.NativeCommands.cursorMove("right", "character");
        }));
    }
}
exports.formatAsXml = formatAsXml;
//# sourceMappingURL=formatAsXml.js.map