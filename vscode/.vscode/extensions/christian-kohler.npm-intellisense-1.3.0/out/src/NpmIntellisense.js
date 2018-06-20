"use strict";
var vscode_1 = require('vscode');
var path_1 = require('path');
var config_1 = require('./config');
var shouldProvide_1 = require('./shouldProvide');
var provide_1 = require('./provide');
var fs_functions_1 = require('./fs-functions');
var NpmIntellisense = (function () {
    function NpmIntellisense() {
    }
    NpmIntellisense.prototype.provideCompletionItems = function (document, position) {
        var state = {
            rootPath: vscode_1.workspace.rootPath,
            filePath: path_1.dirname(document.fileName),
            textCurrentLine: document.lineAt(position).text,
            cursorPosition: position.character,
            cursorLine: position.line
        };
        return shouldProvide_1.shouldProvide(state) ? provide_1.provide(state, config_1.getConfig(), fs_functions_1.fsf) : Promise.resolve([]);
    };
    return NpmIntellisense;
}());
exports.NpmIntellisense = NpmIntellisense;
//# sourceMappingURL=NpmIntellisense.js.map