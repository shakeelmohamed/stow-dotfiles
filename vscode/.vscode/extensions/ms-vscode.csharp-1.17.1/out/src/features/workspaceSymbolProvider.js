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
const typeConversion_1 = require("../omnisharp/typeConversion");
const vscode_1 = require("vscode");
class OmnisharpWorkspaceSymbolProvider extends abstractProvider_1.default {
    constructor(server, optionProvider) {
        super(server);
        this.optionProvider = optionProvider;
    }
    provideWorkspaceSymbols(search, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = this.optionProvider.GetLatestOptions();
            let minFilterLength = options.minFindSymbolsFilterLength > 0 ? options.minFindSymbolsFilterLength : undefined;
            let maxItemsToReturn = options.maxFindSymbolsItems > 0 ? options.maxFindSymbolsItems : undefined;
            if (minFilterLength != undefined && search.length < minFilterLength) {
                return [];
            }
            return serverUtils.findSymbols(this._server, { Filter: search, MaxItemsToReturn: maxItemsToReturn, FileName: '' }, token).then(res => {
                if (res && Array.isArray(res.QuickFixes)) {
                    return res.QuickFixes.map(OmnisharpWorkspaceSymbolProvider._asSymbolInformation);
                }
            });
        });
    }
    static _asSymbolInformation(symbolInfo) {
        return new vscode_1.SymbolInformation(symbolInfo.Text, OmnisharpWorkspaceSymbolProvider._toKind(symbolInfo), typeConversion_1.toRange(symbolInfo), vscode_1.Uri.file(symbolInfo.FileName));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlU3ltYm9sUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvd29ya3NwYWNlU3ltYm9sUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlEQUFpRDtBQUlqRCxrREFBa0Q7QUFDbEQsZ0VBQW9EO0FBQ3BELG1DQUFzRztBQUd0RyxzQ0FBc0QsU0FBUSwwQkFBZTtJQUV6RSxZQUFZLE1BQXVCLEVBQVUsY0FBOEI7UUFDdkUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRDJCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtJQUUzRSxDQUFDO0lBRVksdUJBQXVCLENBQUMsTUFBYyxFQUFFLEtBQXdCOztZQUV6RSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDckQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDOUcsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUVqRyxJQUFJLGVBQWUsSUFBSSxTQUFTLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxlQUFlLEVBQUU7Z0JBQ2pFLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFFRCxPQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDakksSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3RDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDcEY7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFtQztRQUVuRSxPQUFPLElBQUksMEJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxnQ0FBZ0MsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzlGLHdCQUFPLENBQUMsVUFBVSxDQUFDLEVBQ25CLFlBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVPLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBbUM7UUFDdEQsUUFBUSxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ3JCLEtBQUssUUFBUTtnQkFDVCxPQUFPLG1CQUFVLENBQUMsTUFBTSxDQUFDO1lBQzdCLEtBQUssT0FBTztnQkFDUixPQUFPLG1CQUFVLENBQUMsS0FBSyxDQUFDO1lBQzVCLEtBQUssVUFBVTtnQkFDWCxPQUFPLG1CQUFVLENBQUMsUUFBUSxDQUFDO1lBQy9CLEtBQUssV0FBVztnQkFDWixPQUFPLG1CQUFVLENBQUMsU0FBUyxDQUFDO1lBQ2hDLEtBQUssTUFBTTtnQkFDUCxPQUFPLG1CQUFVLENBQUMsSUFBSSxDQUFDO1lBQzNCLEtBQUssUUFBUTtnQkFDVCxPQUFPLG1CQUFVLENBQUMsTUFBTSxDQUFDO1lBQzdCLEtBQUssT0FBTztnQkFDUixPQUFPLG1CQUFVLENBQUMsS0FBSyxDQUFDO1lBQzVCLEtBQUssWUFBWTtnQkFDYixPQUFPLG1CQUFVLENBQUMsVUFBVSxDQUFDO1lBQ2pDLEtBQUssT0FBTztnQkFDUixPQUFPLG1CQUFVLENBQUMsS0FBSyxDQUFDO1lBQzVCO2dCQUNJLE9BQU8sbUJBQVUsQ0FBQyxLQUFLLENBQUM7U0FFL0I7SUFDTCxDQUFDO0NBQ0o7QUF2REQsbURBdURDIn0=