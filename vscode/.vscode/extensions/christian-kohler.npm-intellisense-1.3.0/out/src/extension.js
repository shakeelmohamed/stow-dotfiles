'use strict';
var vscode_1 = require('vscode');
var NpmIntellisense_1 = require('./NpmIntellisense');
var command_import_1 = require('./command-import');
function activate(context) {
    if (vscode_1.workspace.rootPath) {
        var provider = new NpmIntellisense_1.NpmIntellisense();
        var triggers = ['"', '\'', '/'];
        var selector = ['typescript', 'javascript', 'javascriptreact', 'typescriptreact'];
        context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider.apply(vscode_1.languages, [selector, provider].concat(triggers)));
        context.subscriptions.push(vscode_1.commands.registerCommand('npm-intellisense.import', command_import_1.onImportCommand));
    }
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map