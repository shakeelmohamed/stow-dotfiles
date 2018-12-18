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
const documentation_1 = require("./documentation");
class OmniSharpHoverProvider extends abstractProvider_1.default {
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            req.IncludeDocumentation = true;
            return serverUtils.typeLookup(this._server, req, token).then(value => {
                if (value && value.Type) {
                    let documentation = documentation_1.GetDocumentationString(value.StructuredDocumentation);
                    let contents = [documentation, { language: 'csharp', value: value.Type }];
                    return new vscode_1.Hover(contents);
                }
            });
        });
    }
}
exports.default = OmniSharpHoverProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9ob3ZlclByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyx5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELGdFQUE0RDtBQUM1RCxtQ0FBeUY7QUFDekYsbURBQXlEO0FBRXpELDRCQUE0QyxTQUFRLDBCQUFlO0lBRWxELFlBQVksQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7O1lBRTFGLElBQUksR0FBRyxHQUFHLDhCQUFhLENBQTZCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RSxHQUFHLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1lBRWhDLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pFLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7b0JBQ3JCLElBQUksYUFBYSxHQUFHLHNDQUFzQixDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUMxRSxJQUFJLFFBQVEsR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUMxRSxPQUFPLElBQUksY0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUM5QjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUFmRCx5Q0FlQyJ9