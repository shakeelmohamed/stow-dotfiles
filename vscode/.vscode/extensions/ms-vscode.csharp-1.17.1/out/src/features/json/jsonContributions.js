"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_parser_1 = require("jsonc-parser");
const projectJSONContribution_1 = require("./projectJSONContribution");
const request_light_1 = require("request-light");
const vscode_1 = require("vscode");
const CompositeDisposable_1 = require("../../CompositeDisposable");
function addJSONProviders() {
    let subscriptions = new CompositeDisposable_1.default();
    // configure the XHR library with the latest proxy settings
    function configureHttpRequest() {
        let httpSettings = vscode_1.workspace.getConfiguration('http');
        request_light_1.configure(httpSettings.get('proxy'), httpSettings.get('proxyStrictSSL'));
    }
    configureHttpRequest();
    subscriptions.add(vscode_1.workspace.onDidChangeConfiguration(e => configureHttpRequest()));
    // register completion and hove providers for JSON setting file(s)
    let contributions = [new projectJSONContribution_1.ProjectJSONContribution(request_light_1.xhr)];
    contributions.forEach(contribution => {
        let selector = contribution.getDocumentSelector();
        let triggerCharacters = ['"', ':', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        subscriptions.add(vscode_1.languages.registerCompletionItemProvider(selector, new JSONCompletionItemProvider(contribution), ...triggerCharacters));
        subscriptions.add(vscode_1.languages.registerHoverProvider(selector, new JSONHoverProvider(contribution)));
    });
    return subscriptions;
}
exports.addJSONProviders = addJSONProviders;
class JSONHoverProvider {
    constructor(jsonContribution) {
        this.jsonContribution = jsonContribution;
    }
    provideHover(document, position, token) {
        let offset = document.offsetAt(position);
        let location = jsonc_parser_1.getLocation(document.getText(), offset);
        let node = location.previousNode;
        if (node && node.offset <= offset && offset <= node.offset + node.length) {
            let promise = this.jsonContribution.getInfoContribution(document.fileName, location);
            if (promise) {
                return promise.then(htmlContent => {
                    let range = new vscode_1.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
                    let result = {
                        contents: htmlContent,
                        range: range
                    };
                    return result;
                });
            }
        }
        return null;
    }
}
exports.JSONHoverProvider = JSONHoverProvider;
class JSONCompletionItemProvider {
    constructor(jsonContribution) {
        this.jsonContribution = jsonContribution;
    }
    resolveCompletionItem(item, token) {
        if (this.jsonContribution.resolveSuggestion) {
            let resolver = this.jsonContribution.resolveSuggestion(item);
            if (resolver) {
                return resolver;
            }
        }
        return Promise.resolve(item);
    }
    provideCompletionItems(document, position, token) {
        let currentWord = this.getCurrentWord(document, position);
        let overwriteRange = null;
        let items = [];
        let isIncomplete = false;
        let offset = document.offsetAt(position);
        let location = jsonc_parser_1.getLocation(document.getText(), offset);
        let node = location.previousNode;
        if (node && node.offset <= offset && offset <= node.offset + node.length && (node.type === 'property' || node.type === 'string' || node.type === 'number' || node.type === 'boolean' || node.type === 'null')) {
            overwriteRange = new vscode_1.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
        }
        else {
            overwriteRange = new vscode_1.Range(document.positionAt(offset - currentWord.length), position);
        }
        let proposed = {};
        let collector = {
            add: (suggestion) => {
                if (!proposed[suggestion.label]) {
                    proposed[suggestion.label] = true;
                    if (overwriteRange) {
                        suggestion.textEdit = vscode_1.TextEdit.replace(overwriteRange, suggestion.insertText);
                    }
                    items.push(suggestion);
                }
            },
            setAsIncomplete: () => isIncomplete = true,
            error: (message) => console.error(message),
            log: (message) => console.log(message)
        };
        let collectPromise = null;
        if (location.isAtPropertyKey) {
            let addValue = !location.previousNode || !location.previousNode.columnOffset && (offset == (location.previousNode.offset + location.previousNode.length));
            let scanner = jsonc_parser_1.createScanner(document.getText(), true);
            scanner.setPosition(offset);
            scanner.scan();
            let isLast = scanner.getToken() === jsonc_parser_1.SyntaxKind.CloseBraceToken || scanner.getToken() === jsonc_parser_1.SyntaxKind.EOF;
            collectPromise = this.jsonContribution.collectPropertySuggestions(document.fileName, location, currentWord, addValue, isLast, collector);
        }
        else {
            if (location.path.length === 0) {
                collectPromise = this.jsonContribution.collectDefaultSuggestions(document.fileName, collector);
            }
            else {
                collectPromise = this.jsonContribution.collectValueSuggestions(document.fileName, location, collector);
            }
        }
        if (collectPromise) {
            return collectPromise.then(() => {
                if (items.length > 0) {
                    return new vscode_1.CompletionList(items, isIncomplete);
                }
                return null;
            });
        }
        return null;
    }
    getCurrentWord(document, position) {
        let i = position.character - 1;
        let text = document.lineAt(position.line).text;
        while (i >= 0 && ' \t\n\r\v":{[,'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, position.character);
    }
}
exports.JSONCompletionItemProvider = JSONCompletionItemProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmVhdHVyZXMvanNvbi9qc29uQ29udHJpYnV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLCtDQUFnRjtBQUNoRix1RUFBb0U7QUFDcEUsaURBQStEO0FBRS9ELG1DQUdnQjtBQUNoQixtRUFBNEQ7QUFrQjVEO0lBQ0ksSUFBSSxhQUFhLEdBQUcsSUFBSSw2QkFBbUIsRUFBRSxDQUFDO0lBRTlDLDJEQUEyRDtJQUMzRDtRQUNJLElBQUksWUFBWSxHQUFHLGtCQUFTLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQseUJBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFTLE9BQU8sQ0FBQyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQVUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRCxvQkFBb0IsRUFBRSxDQUFDO0lBQ3ZCLGFBQWEsQ0FBQyxHQUFHLENBQUMsa0JBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRW5GLGtFQUFrRTtJQUNsRSxJQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksaURBQXVCLENBQUMsbUJBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUNqQyxJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGlCQUFpQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFD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