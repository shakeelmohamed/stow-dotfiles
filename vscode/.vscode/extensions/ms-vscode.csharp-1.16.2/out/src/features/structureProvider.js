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
const vscode_1 = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const utils_1 = require("../omnisharp/utils");
class StructureProvider extends abstractProvider_1.default {
    provideFoldingRanges(document, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: document.fileName,
            };
            let response = yield utils_1.blockStructure(this._server, request, token);
            let ranges = [];
            for (let member of response.Spans) {
                ranges.push(new vscode_1.FoldingRange(member.Range.Start.Line - 1, member.Range.End.Line - 1, this.GetType(member.Kind)));
            }
            return ranges;
        });
    }
    GetType(type) {
        switch (type) {
            case "Comment":
                return vscode_1.FoldingRangeKind.Comment;
            case "Imports":
                return vscode_1.FoldingRangeKind.Imports;
            case "Region":
                return vscode_1.FoldingRangeKind.Region;
            default:
                return null;
        }
    }
}
exports.StructureProvider = StructureProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RydWN0dXJlUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvc3RydWN0dXJlUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLG1DQUErSDtBQUMvSCx5REFBaUQ7QUFDakQsOENBQW9EO0FBR3BELHVCQUErQixTQUFRLDBCQUFlO0lBQzVDLG9CQUFvQixDQUFDLFFBQXNCLEVBQUUsT0FBdUIsRUFBRSxLQUF3Qjs7WUFDaEcsSUFBSSxPQUFPLEdBQVk7Z0JBQ25CLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTthQUM5QixDQUFDO1lBRUYsSUFBSSxRQUFRLEdBQUcsTUFBTSxzQkFBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLElBQUksTUFBTSxHQUFtQixFQUFFLENBQUM7WUFDaEMsS0FBSyxJQUFJLE1BQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO2dCQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BIO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztLQUFBO0lBRUQsT0FBTyxDQUFDLElBQVk7UUFDaEIsUUFBUSxJQUFJLEVBQUU7WUFDVixLQUFLLFNBQVM7Z0JBQ1YsT0FBTyx5QkFBZ0IsQ0FBQyxPQUFPLENBQUM7WUFDcEMsS0FBSyxTQUFTO2dCQUNWLE9BQU8seUJBQWdCLENBQUMsT0FBTyxDQUFDO1lBQ3BDLEtBQUssUUFBUTtnQkFDVCxPQUFPLHlCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUNuQztnQkFDSSxPQUFPLElBQUksQ0FBQztTQUNuQjtJQUNMLENBQUM7Q0FFSjtBQTVCRCw4Q0E0QkMifQ==