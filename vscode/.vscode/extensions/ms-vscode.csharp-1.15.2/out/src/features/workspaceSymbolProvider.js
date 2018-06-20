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
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const vscode_1 = require("vscode");
class OmnisharpWorkspaceSymbolProvider extends abstractProvider_1.default {
    provideWorkspaceSymbols(search, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return serverUtils.findSymbols(this._server, { Filter: search, FileName: '' }, token).then(res => {
                if (res && Array.isArray(res.QuickFixes)) {
                    return res.QuickFixes.map(OmnisharpWorkspaceSymbolProvider._asSymbolInformation);
                }
            });
        });
    }
    static _asSymbolInformation(symbolInfo) {
        return new vscode_1.SymbolInformation(symbolInfo.Text, OmnisharpWorkspaceSymbolProvider._toKind(symbolInfo), typeConvertion_1.toRange(symbolInfo), vscode_1.Uri.file(symbolInfo.FileName));
    }
    static _toKind(symbolInfo) {
        switch (symbolInfo.Kind) {
            case 'Method':
                return vscode_1.SymbolKind.Method;
            case 'Field':
                return vscode_1.SymbolKind.Field;
            case 'Property':
                return vscode_1.SymbolKind.Property;
            case 'Interface':
                return vscode_1.SymbolKind.Interface;
            case 'Enum':
                return vscode_1.SymbolKind.Enum;
            case 'Struct':
                return vscode_1.SymbolKind.Struct;
            case 'Event':
                return vscode_1.SymbolKind.Event;
            case 'EnumMember':
                return vscode_1.SymbolKind.EnumMember;
            case 'Class':
                return vscode_1.SymbolKind.Class;
            default:
                return vscode_1.SymbolKind.Class;
        }
    }
}
exports.default = OmnisharpWorkspaceSymbolProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlU3ltYm9sUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvd29ya3NwYWNlU3ltYm9sUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlEQUFpRDtBQUVqRCxrREFBa0Q7QUFDbEQsZ0VBQW9EO0FBQ3BELG1DQUFzRztBQUd0RyxzQ0FBc0QsU0FBUSwwQkFBZTtJQUU1RCx1QkFBdUIsQ0FBQyxNQUFjLEVBQUUsS0FBd0I7O1lBRXpFLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM3RixJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDdEMsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNwRjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQW1DO1FBRW5FLE9BQU8sSUFBSSwwQkFBaUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFDOUYsd0JBQU8sQ0FBQyxVQUFVLENBQUMsRUFDbkIsWUFBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFtQztRQUN0RCxRQUFRLFVBQVUsQ0FBQyxJQUFJLEVBQUU7WUFDckIsS0FBSyxRQUFRO2dCQUNULE9BQU8sbUJBQVUsQ0FBQyxNQUFNLENBQUM7WUFDN0IsS0FBSyxPQUFPO2dCQUNSLE9BQU8sbUJBQVUsQ0FBQyxLQUFLLENBQUM7WUFDNUIsS0FBSyxVQUFVO2dCQUNYLE9BQU8sbUJBQVUsQ0FBQyxRQUFRLENBQUM7WUFDL0IsS0FBSyxXQUFXO2dCQUNaLE9BQU8sbUJBQVUsQ0FBQyxTQUFTLENBQUM7WUFDaEMsS0FBSyxNQUFNO2dCQUNQLE9BQU8sbUJBQVUsQ0FBQyxJQUFJLENBQUM7WUFDM0IsS0FBSyxRQUFRO2dCQUNULE9BQU8sbUJBQVUsQ0FBQyxNQUFNLENBQUM7WUFDN0IsS0FBSyxPQUFPO2dCQUNSLE9BQU8sbUJBQVUsQ0FBQyxLQUFLLENBQUM7WUFDNUIsS0FBSyxZQUFZO2dCQUNiLE9BQU8sbUJBQVUsQ0FBQyxVQUFVLENBQUM7WUFDakMsS0FBSyxPQUFPO2dCQUNSLE9BQU8sbUJBQVUsQ0FBQyxLQUFLLENBQUM7WUFDNUI7Z0JBQ0ksT0FBTyxtQkFBVSxDQUFDLEtBQUssQ0FBQztTQUUvQjtJQUNMLENBQUM7Q0FDSjtBQTNDRCxtREEyQ0MifQ==