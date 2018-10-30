"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const protocol = require("../omnisharp/protocol");
const serverUtils = require("../omnisharp/utils");
const vscode = require("vscode");
var Structure = protocol.V2.Structure;
var SymbolKinds = protocol.V2.SymbolKinds;
var SymbolRangeNames = protocol.V2.SymbolRangeNames;
class OmnisharpDocumentSymbolProvider extends abstractProvider_1.default {
    provideDocumentSymbols(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield serverUtils.codeStructure(this._server, { FileName: document.fileName }, token);
            if (response && response.Elements) {
                return createSymbols(response.Elements, document.fileName);
            }
            return [];
        });
    }
}
exports.default = OmnisharpDocumentSymbolProvider;
function createSymbols(elements, fileName) {
    let results = [];
    Structure.walkCodeElements(elements, (element, parentElement) => {
        const parentElementName = parentElement ? parentElement.DisplayName : undefined;
        const symbol = createSymbolForElement(element, parentElementName, fileName);
        results.push(symbol);
    });
    return results;
}
function createSymbolForElement(element, parentElementName, fileName) {
    const range = element.Ranges[SymbolRangeNames.Full];
    const vscodeRange = new vscode.Range(range.Start.Line - 1, range.Start.Column - 1, range.End.Line - 1, range.End.Column - 1);
    return new vscode.SymbolInformation(element.DisplayName, toSymbolKind(element.Kind), parentElementName, new vscode.Location(vscode.Uri.file(fileName), vscodeRange));
}
const kinds = {};
kinds[SymbolKinds.Class] = vscode.SymbolKind.Class;
kinds[SymbolKinds.Delegate] = vscode.SymbolKind.Class;
kinds[SymbolKinds.Enum] = vscode.SymbolKind.Enum;
kinds[SymbolKinds.Interface] = vscode.SymbolKind.Interface;
kinds[SymbolKinds.Struct] = vscode.SymbolKind.Struct;
kinds[SymbolKinds.Constant] = vscode.SymbolKind.Constant;
kinds[SymbolKinds.Destructor] = vscode.SymbolKind.Method;
kinds[SymbolKinds.EnumMember] = vscode.SymbolKind.EnumMember;
kinds[SymbolKinds.Event] = vscode.SymbolKind.Event;
kinds[SymbolKinds.Field] = vscode.SymbolKind.Field;
kinds[SymbolKinds.Indexer] = vscode.SymbolKind.Property;
kinds[SymbolKinds.Method] = vscode.SymbolKind.Method;
kinds[SymbolKinds.Operator] = vscode.SymbolKind.Operator;
kinds[SymbolKinds.Property] = vscode.SymbolKind.Property;
kinds[SymbolKinds.Namespace] = vscode.SymbolKind.Namespace;
kinds[SymbolKinds.Unknown] = vscode.SymbolKind.Class;
function toSymbolKind(kind) {
    // Note: 'constructor' is a special property name for JavaScript objects.
    // So, we need to handle it specifically.
    if (kind === 'constructor') {
        return vscode.SymbolKind.Constructor;
    }
    return kinds[kind];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTeW1ib2xQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudFN5bWJvbFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyx5REFBaUQ7QUFDakQsa0RBQWtEO0FBQ2xELGtEQUFrRDtBQUNsRCxpQ0FBaUM7QUFFakMsSUFBTyxTQUFTLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDekMsSUFBTyxXQUFXLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFDN0MsSUFBTyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO0FBRXZELHFDQUFxRCxTQUFRLDBCQUFlO0lBRWxFLHNCQUFzQixDQUFDLFFBQTZCLEVBQUUsS0FBK0I7O1lBQ3ZGLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV2RyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUMvQixPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5RDtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0NBQ0o7QUFYRCxrREFXQztBQUVELHVCQUF1QixRQUFpQyxFQUFFLFFBQWdCO0lBQ3RFLElBQUksT0FBTyxHQUErQixFQUFFLENBQUM7SUFFN0MsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsRUFBRTtRQUM1RCxNQUFNLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMs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