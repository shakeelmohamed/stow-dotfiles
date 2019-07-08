"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("./common");
const completion_1 = require("./completion");
const formatting_1 = require("./formatting");
const commands_1 = require("./formatting/commands");
const linting_1 = require("./linting");
const tree_view_1 = require("./tree-view");
const commands_2 = require("./xpath/commands");
const commands_3 = require("./xquery-execution/commands");
const constants = require("./constants");
let diagnosticCollectionXQuery;
function activate(context) {
    common_1.ExtensionState.configure(context);
    const xmlXsdDocSelector = [...common_1.createDocumentSelector(constants.languageIds.xml), ...common_1.createDocumentSelector(constants.languageIds.xsd)];
    const xqueryDocSelector = common_1.createDocumentSelector(constants.languageIds.xquery);
    /* Completion Features */
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(xqueryDocSelector, new completion_1.XQueryCompletionItemProvider(), ":", "$"));
    /* Formatting Features */
    const xmlFormattingEditProvider = new formatting_1.XmlFormattingEditProvider(formatting_1.XmlFormatterFactory.getXmlFormatter());
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand(constants.commands.formatAsXml, commands_1.formatAsXml), vscode_1.commands.registerTextEditorCommand(constants.commands.xmlToText, commands_1.xmlToText), vscode_1.commands.registerTextEditorCommand(constants.commands.textToXml, commands_1.textToXml), vscode_1.commands.registerTextEditorCommand(constants.commands.minifyXml, commands_1.minifyXml), vscode_1.languages.registerDocumentFormattingEditProvider(xmlXsdDocSelector, xmlFormattingEditProvider), vscode_1.languages.registerDocumentRangeFormattingEditProvider(xmlXsdDocSelector, xmlFormattingEditProvider));
    /* Linting Features */
    diagnosticCollectionXQuery = vscode_1.languages.createDiagnosticCollection(constants.diagnosticCollections.xquery);
    context.subscriptions.push(diagnosticCollectionXQuery, vscode_1.window.onDidChangeActiveTextEditor(_handleChangeActiveTextEditor), vscode_1.window.onDidChangeTextEditorSelection(_handleChangeTextEditorSelection));
    /* Tree View Features */
    const treeViewDataProvider = new tree_view_1.XmlTreeDataProvider(context);
    const treeView = vscode_1.window.createTreeView(constants.views.xmlTreeView, {
        treeDataProvider: treeViewDataProvider
    });
    if (common_1.Configuration.enableXmlTreeViewCursorSync) {
        vscode_1.window.onDidChangeTextEditorSelection(x => {
            if (x.kind === vscode_1.TextEditorSelectionChangeKind.Mouse && x.selections.length > 0) {
                treeView.reveal(treeViewDataProvider.getNodeAtPosition(x.selections[0].start));
            }
        });
    }
    context.subscriptions.push(treeView);
    /* XPath Features */
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand(constants.commands.evaluateXPath, commands_2.evaluateXPath), vscode_1.commands.registerTextEditorCommand(constants.commands.getCurrentXPath, commands_2.getCurrentXPath));
    /* XQuery Features */
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand(constants.commands.executeXQuery, commands_3.executeXQuery));
}
exports.activate = activate;
function deactivate() {
    // do nothing
}
exports.deactivate = deactivate;
function _handleContextChange(editor) {
    const supportedSchemes = [constants.uriSchemes.file, constants.uriSchemes.untitled];
    if (!editor || !editor.document || supportedSchemes.indexOf(editor.document.uri.scheme) === -1) {
        return;
    }
    switch (editor.document.languageId) {
        case constants.languageIds.xquery:
            diagnosticCollectionXQuery.set(editor.document.uri, new linting_1.XQueryLinter().lint(editor.document.getText()));
            break;
    }
}
function _handleChangeActiveTextEditor(editor) {
    _handleContextChange(editor);
}
function _handleChangeTextEditorSelection(e) {
    _handleContextChange(e.textEditor);
}
//# sourceMappingURL=extension.js.map