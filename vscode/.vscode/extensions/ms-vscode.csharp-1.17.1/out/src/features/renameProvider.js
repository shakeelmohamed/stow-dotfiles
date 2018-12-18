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
class OmnisharpRenameProvider extends abstractProvider_1.default {
    provideRenameEdits(document, position, newName, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            req.WantsTextChanges = true;
            req.RenameTo = newName;
            return serverUtils.rename(this._server, req, token).then(response => {
                if (!response) {
                    return;
                }
                const edit = new vscode_1.WorkspaceEdit();
                response.Changes.forEach(change => {
                    const uri = vscode_1.Uri.file(change.FileName);
                    change.Changes.forEach(change => {
                        edit.replace(uri, new vscode_1.Range(change.StartLine - 1, change.StartColumn - 1, change.EndLine - 1, change.EndColumn - 1), change.NewText);
                    });
                });
                return edit;
            });
        });
    }
}
exports.default = OmnisharpRenameProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuYW1lUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvcmVuYW1lUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlEQUFpRDtBQUVqRCxrREFBa0Q7QUFDbEQsZ0VBQTBEO0FBQzFELG1DQUE0RztBQUU1Ryw2QkFBNkMsU0FBUSwwQkFBZTtJQUVuRCxrQkFBa0IsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsT0FBZSxFQUFFLEtBQXdCOztZQUVqSCxJQUFJLEdBQUcsR0FBRyw4QkFBYSxDQUF5QixRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEUsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM1QixHQUFHLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUV2QixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUVoRSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNYLE9BQU87aUJBQ1Y7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7Z0JBQ2pDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM5QixNQUFNLEdBQUcsR0FBRyxZQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUNaLElBQUksY0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQ2pHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7Q0FDSjtBQTNCRCwwQ0EyQkMifQ==