/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const suggestHelper = require("../helpers/suggestSupportHelper");
const parser = require("../parser");
class DockerComposeHoverProvider {
    // Provide the parser you want to use as well as keyinfo dictionary.
    constructor(wordParser, keyInfo) {
        this._parser = wordParser;
        this._keyInfo = keyInfo;
    }
    provideHover(document, position, token) {
        let line = document.lineAt(position.line);
        if (line.text.length === 0) {
            return Promise.resolve(null);
        }
        let tokens = this._parser.parseLine(line);
        return this._computeInfoForLineWithTokens(line.text, tokens, position);
    }
    // tslint:disable-next-line:promise-function-async // Grandfathered in
    _computeInfoForLineWithTokens(line, tokens, position) {
        let possibleTokens = this._parser.tokensAtColumn(tokens, position.character);
        // tslint:disable-next-line:promise-function-async // Grandfathered in
        return Promise.all(possibleTokens.map(tokenIndex => this._computeInfoForToken(line, tokens, tokenIndex))).then((results) => {
            return possibleTokens.map((tokenIndex, arrayIndex) => {
                return {
                    startIndex: tokens[tokenIndex].startIndex,
                    endIndex: tokens[tokenIndex].endIndex,
                    result: results[arrayIndex]
                };
            });
        }).then((results) => {
            let filteredResults = results.filter(r => !!r.result);
            if (filteredResults.length === 0) {
                return;
            }
            let range = new vscode_1.Range(position.line, filteredResults[0].startIndex, position.line, filteredResults[0].endIndex);
            let hover = new vscode_1.Hover(filteredResults[0].result, range);
            return hover;
        });
    }
    // tslint:disable-next-line:promise-function-async // Grandfathered in
    _computeInfoForToken(line, tokens, tokenIndex) {
        // -------------
        // Detect hovering on a key
        if (tokens[tokenIndex].type === parser.TokenType.Key) {
            let keyName = this._parser.keyNameFromKeyToken(this._parser.tokenValue(line, tokens[tokenIndex])).trim();
            let r = this._keyInfo[keyName];
            if (r) {
                return Promise.resolve([r]);
            }
        }
        // -------------
        // Detect <<image: [["something"]]>>
        // Detect <<image: [[something]]>>
        let helper = new suggestHelper.SuggestSupportHelper();
        let r2 = helper.getImageNameHover(line, this._parser, tokens, tokenIndex);
        if (r2) {
            return r2;
        }
        return;
    }
}
exports.DockerComposeHoverProvider = DockerComposeHoverProvider;
//# sourceMappingURL=dockerComposeHoverProvider.js.map