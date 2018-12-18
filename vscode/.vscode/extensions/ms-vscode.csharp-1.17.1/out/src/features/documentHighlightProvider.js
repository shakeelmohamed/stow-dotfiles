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
class OmnisharpDocumentHighlightProvider extends abstractProvider_1.default {
    provideDocumentHighlights(resource, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(resource, position);
            req.OnlyThisFile = true;
            req.ExcludeDefinition = false;
            return serverUtils.findUsages(this._server, req, token).then(res => {
                if (res && Array.isArray(res.QuickFixes)) {
                    return res.QuickFixes.map(OmnisharpDocumentHighlightProvider._asDocumentHighlight);
                }
            });
        });
    }
    static _asDocumentHighlight(quickFix) {
        return new vscode_1.DocumentHighlight(typeConversion_1.toRange(quickFix), vscode_1.DocumentHighlightKind.Read);
    }
}
exports.default = OmnisharpDocumentHighlightProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRIaWdobGlnaHRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudEhpZ2hsaWdodFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyx5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELGdFQUFtRTtBQUNuRSxtQ0FBc0k7QUFFdEksd0NBQXdELFNBQVEsMEJBQWU7SUFFOUQseUJBQXlCLENBQUMsUUFBc0IsRUFBRSxRQUFrQixFQUFFLEtBQXdCOztZQUV2RyxJQUFJLEdBQUcsR0FBRyw4QkFBYSxDQUE2QixRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEUsR0FBRyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDeEIsR0FBRyxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUU5QixPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvRCxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDdEMsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUN0RjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLFFBQTJCO1FBQzNELE9BQU8sSUFBSSwwQkFBaUIsQ0FBQyx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLDhCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hGLENBQUM7Q0FDSjtBQWxCRCxxREFrQkMifQ==