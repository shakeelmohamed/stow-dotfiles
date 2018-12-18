/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class Parser {
    constructor(parseTokenRegex) {
        this._tokenParseRegex = parseTokenRegex;
    }
    keyNameFromKeyToken(keyToken) {
        return keyToken.replace(this._tokenParseRegex, '');
    }
    tokenValue(line, token) {
        return line.substring(token.startIndex, token.endIndex);
    }
    tokensAtColumn(tokens, charIndex) {
        for (let i = 0, len = tokens.length; i < len; i++) {
            let token = tokens[i];
            if (token.endIndex < charIndex) {
                continue;
            }
            if (token.endIndex === charIndex && i + 1 < len) {
                return [i, i + 1];
            }
            return [i];
        }
        // should not happen: no token found? => return the last one
        return [tokens.length - 1];
    }
}
exports.Parser = Parser;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Whitespace"] = 0] = "Whitespace";
    TokenType[TokenType["Text"] = 1] = "Text";
    TokenType[TokenType["String"] = 2] = "String";
    TokenType[TokenType["Comment"] = 3] = "Comment";
    TokenType[TokenType["Key"] = 4] = "Key";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//# sourceMappingURL=parser.js.map