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
const constants = require("../../constants");
const xpath_evaluator_1 = require("../xpath-evaluator");
class HistoricQuery {
    constructor(uri, query) {
        this.uri = uri;
        this.query = query;
    }
}
function evaluateXPath(editor, edit) {
    return __awaiter(this, void 0, void 0, function* () {
        // if there is no workspace, we will track queries in the global Memento
        const memento = common_1.ExtensionState.workspace || common_1.ExtensionState.global;
        // get the xpath persistence setting
        const persistQueries = common_1.Configuration.persistXPathQuery;
        // get the last query if there is one for this document
        // if not, try pulling the last query ran, regardless of document
        // NOTE: if the user has focus on the output channel when opening the xquery prompt, the channel is the "active" document
        const history = memento.get(constants.stateKeys.xpathQueryHistory, new Array());
        const globalLastQuery = memento.get(constants.stateKeys.xPathQueryLast, "");
        const lastQuery = history.find(x => {
            return (x.uri === editor.document.uri.toString());
        });
        // set the inital display value and prompt the user
        let query = (lastQuery) ? lastQuery.query : globalLastQuery;
        query = yield vscode_1.window.showInputBox({
            placeHolder: "XPath Query",
            prompt: "Please enter an XPath query to evaluate.",
            value: query
        });
        // showInputBox() will return undefined if the user dimissed the prompt
        if (!query) {
            return;
        }
        const ignoreDefaultNamespace = common_1.Configuration.ignoreDefaultNamespace;
        // run the query
        const xml = editor.document.getText();
        let evalResult;
        try {
            evalResult = xpath_evaluator_1.XPathEvaluator.evaluate(query, xml, ignoreDefaultNamespace);
        }
        catch (error) {
            console.error(error);
            vscode_1.window.showErrorMessage(`Something went wrong while evaluating the XPath: ${error}`);
            return;
        }
        // show the results to the user
        const outputChannel = vscode_1.window.createOutputChannel("XPath Results");
        outputChannel.clear();
        outputChannel.appendLine(`XPath Query: ${query}`);
        outputChannel.append("\n");
        if (evalResult.type === xpath_evaluator_1.EvaluatorResultType.NODE_COLLECTION) {
            evalResult.result.forEach((node) => {
                outputChannel.appendLine(`[Line ${node.lineNumber}] ${node.localName}: ${node.textContent}`);
            });
        }
        else {
            outputChannel.appendLine(`[Result]: ${evalResult.result}`);
        }
        outputChannel.show(false);
        if (persistQueries) {
            const historicQuery = new HistoricQuery(editor.document.uri.toString(), query);
            const affectedIndex = history.findIndex(x => x.uri === historicQuery.uri);
            if (affectedIndex === -1) {
                history.push(historicQuery);
            }
            else {
                history[affectedIndex].query = query;
            }
            memento.update(constants.stateKeys.xpathQueryHistory, history);
            memento.update(constants.stateKeys.xPathQueryLast, query);
        }
    });
}
exports.evaluateXPath = evaluateXPath;
//# sourceMappingURL=evaluateXPath.js.map