"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const actions_1 = require("./actions");
function activate(context) {
    const disposableCommands = [
        vscode.commands.registerCommand('extension.addNuGetPackage', actions_1.addNuGetPackage),
        vscode.commands.registerCommand('extension.removeNuGetPackage', actions_1.removeNuGetPackage)
    ];
    disposableCommands.forEach((disposable) => context.subscriptions.push(disposable));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map