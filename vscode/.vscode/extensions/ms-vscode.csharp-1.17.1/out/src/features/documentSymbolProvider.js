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
var SymbolKinds = protocol.V2.SymbolKinds;
var SymbolRangeNames = protocol.V2.SymbolRangeNames;
const typeConversion_1 = require("../omnisharp/typeConversion");
class OmnisharpDocumentSymbolProvider extends abstractProvider_1.default {
    provideDocumentSymbols(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield serverUtils.codeStructure(this._server, { FileName: document.fileName }, token);
            if (response && response.Elements) {
                return createSymbols(response.Elements);
            }
            return [];
        });
    }
}
exports.default = OmnisharpDocumentSymbolProvider;
function createSymbols(elements) {
    let results = [];
    elements.forEach(element => {
        let symbol = createSymbolForElement(element);
        if (element.Children) {
            symbol.children = createSymbols(element.Children);
        }
        results.push(symbol);
    });
    return results;
}
function createSymbolForElement(element) {
    const fullRange = element.Ranges[SymbolRangeNames.Full];
    const nameRange = element.Ranges[SymbolRangeNames.Name];
    return new vscode.DocumentSymbol(element.Name, /*detail*/ "", toSymbolKind(element.Kind), typeConversion_1.toRange3(fullRange), typeConversion_1.toRange3(nameRange));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTeW1ib2xQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudFN5bWJvbFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyx5REFBaUQ7QUFDakQsa0RBQWtEO0FBQ2xELGtEQUFrRDtBQUNsRCxpQ0FBaUM7QUFHakMsSUFBTyxXQUFXLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFDN0MsSUFBTyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO0FBQ3ZELGdFQUF1RDtBQUV2RCxxQ0FBcUQsU0FBUSwwQkFBZTtJQUVsRSxzQkFBc0IsQ0FBQyxRQUE2QixFQUFFLEtBQStCOztZQUN2RixNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdkcsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTtnQkFDL0IsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzNDO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO0tBQUE7Q0FDSjtBQVhELGtEQVdDO0FBRUQsdUJBQXVCLFFBQWlDO0lBQ3BELElBQUksT0FBTyxHQUE0QixFQUFFLENBQUM7SUFFMUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN2QixJQUFJLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDbEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFD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