/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
class DockerComposeParser extends parser_1.Parser {
    constructor() {
        let parseRegex = /\:+$/g;
        super(parseRegex);
    }
    parseLine(textLine) {
        let r = [];
        let lastTokenEndIndex = 0;
        let lastPushedToken;
        let emit = (end, type) => {
            if (end <= lastTokenEndIndex) {
                return;
            }
            if (lastPushedToken && lastPushedToken.type === type) {
                // merge with last pushed token
                lastPushedToken.endIndex = end;
                lastTokenEndIndex = end;
                return;
            }
            lastPushedToken = {
                startIndex: lastTokenEndIndex,
                endIndex: end,
                type: type
            };
            r.push(lastPushedToken);
            lastTokenEndIndex = end;
        };
        let inString = false;
        let idx = textLine.firstNonWhitespaceCharacterIndex;
        let line = textLine.text;
        for (let i = idx, len = line.length; i < len; i++) {
            let ch = line.charAt(i);
            if (inString) {
                if (ch === '"' && line.charAt(i - 1) !== '\\') {
                    inString = false;
                    emit(i + 1, parser_1.TokenType.String);
                }
                continue;
            }
            if (ch === '"') {
                emit(i, parser_1.TokenType.Text);
                inString = true;
                continue;
            }
            if (ch === '#') {
                // Comment the rest of the line
                emit(i, parser_1.TokenType.Text);
                emit(line.length, parser_1.TokenType.Comment);
                break;
            }
            if (ch === ':') {
                emit(i + 1, parser_1.TokenType.Key);
            }
            if (ch === ' ' || ch === '\t') {
                emit(i, parser_1.TokenType.Text);
                emit(i + 1, parser_1.TokenType.Whitespace);
            }
        }
        emit(line.length, parser_1.TokenType.Text);
        return r;
    }
}
exports.DockerComposeParser = DockerComposeParser;
//# sourceMappingURL=dockerComposeParser.js.map