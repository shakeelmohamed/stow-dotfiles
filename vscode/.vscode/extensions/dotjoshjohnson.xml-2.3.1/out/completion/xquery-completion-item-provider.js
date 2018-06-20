"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const XQLint = require("xqlint").XQLint;
class XQueryCompletionItemProvider {
    provideCompletionItems(document, position) {
        const completionItems = new Array();
        const linter = new XQLint(document.getText());
        linter.getCompletions({ line: position.line, col: position.character }).forEach((x) => {
            completionItems.push(this._getCompletionItem(x));
        });
        return completionItems;
    }
    _getCompletionItem(xqLintCompletionItem) {
        const completionItem = new vscode_1.CompletionItem(xqLintCompletionItem.name);
        completionItem.insertText = xqLintCompletionItem.value;
        switch (xqLintCompletionItem.meta) {
            // functions (always qualified with a colon)
            case "function":
                completionItem.kind = vscode_1.CompletionItemKind.Function;
                const funcStart = (xqLintCompletionItem.value.indexOf(":") + 1);
                const funcEnd = xqLintCompletionItem.value.indexOf("(");
                completionItem.insertText = xqLintCompletionItem.value.substring(funcStart, funcEnd);
                break;
            // variables and parameters (always qualified with a dollar sign)
            case "Let binding":
            case "Local variable":
            case "Window variable":
            case "Function parameter":
                completionItem.kind = vscode_1.CompletionItemKind.Variable;
                completionItem.insertText = xqLintCompletionItem.value.substring(1);
                break;
            // everything else
            default:
                completionItem.kind = vscode_1.CompletionItemKind.Text;
                break;
        }
        return completionItem;
    }
}
exports.XQueryCompletionItemProvider = XQueryCompletionItemProvider;
//# sourceMappingURL=xquery-completion-item-provider.js.map