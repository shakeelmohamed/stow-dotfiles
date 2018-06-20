"use strict";
var vscode_1 = require('vscode');
var path_1 = require('path');
var provide_1 = require('./provide');
var fs_functions_1 = require('./fs-functions');
var config_1 = require('./config');
var util_1 = require('./util');
var quickPickOptions = {
    matchOnDescription: true
};
function onImportCommand() {
    var config = config_1.getConfig();
    vscode_1.window.showQuickPick(getPackages(config), quickPickOptions)
        .then(function (selection) { return addImportStatementToCurrentFile(selection, config); });
}
exports.onImportCommand = onImportCommand;
function getPackages(config) {
    var state = {
        filePath: path_1.dirname(vscode_1.window.activeTextEditor.document.fileName),
        rootPath: vscode_1.workspace.rootPath,
        cursorLine: undefined,
        cursorPosition: undefined,
        textCurrentLine: undefined
    };
    return provide_1.getNpmPackages(state, config, fs_functions_1.fsf)
        .then(function (npmPackages) { return npmPackages.map(moduleNameToQuickPickItem); })
        .catch(function (error) { return vscode_1.window.showErrorMessage(error); });
}
function moduleNameToQuickPickItem(moduleName) {
    return {
        label: moduleName,
        description: 'npm module'
    };
}
function addImportStatementToCurrentFile(item, config) {
    var statementES6 = "import {} from " + config.importQuotes + item.label + config.importQuotes + config.importLinebreak;
    var statementRequire = config.importDeclarationType + " " + util_1.guessVariableName(item.label) + " = require(" + config.importQuotes + item.label + config.importQuotes + ")" + config.importLinebreak;
    var statement = config.importES6 ? statementES6 : statementRequire;
    var insertLocation = vscode_1.window.activeTextEditor.selection.start;
    vscode_1.window.activeTextEditor.edit(function (edit) { return edit.insert(insertLocation, statement); });
}
//# sourceMappingURL=command-import.js.map