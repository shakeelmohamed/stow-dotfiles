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
const vscode_2 = require("vscode");
class OmniSharpSignatureHelpProvider extends abstractProvider_1.default {
    provideSignatureHelp(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            return serverUtils.signatureHelp(this._server, req, token).then(res => {
                if (!res) {
                    return undefined;
                }
                let ret = new vscode_1.SignatureHelp();
                ret.activeSignature = res.ActiveSignature;
                ret.activeParameter = res.ActiveParameter;
                for (let signature of res.Signatures) {
                    let signatureInfo = new vscode_1.SignatureInformation(signature.Label, signature.StructuredDocumentation.SummaryText);
                    ret.signatures.push(signatureInfo);
                    for (let parameter of signature.Parameters) {
                        let parameterInfo = new vscode_1.ParameterInformation(parameter.Label, this.GetParameterDocumentation(parameter));
                        signatureInfo.parameters.push(parameterInfo);
                    }
                }
                return ret;
            });
        });
    }
    GetParameterDocumentation(parameter) {
        let summary = parameter.Documentation;
        if (summary.length > 0) {
            let paramText = `**${parameter.Name}**: ${summary}`;
            return new vscode_2.MarkdownString(paramText);
        }
        return "";
    }
}
exports.default = OmniSharpSignatureHelpProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmF0dXJlSGVscFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL3NpZ25hdHVyZUhlbHBQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcseURBQWlEO0FBQ2pELGtEQUFrRDtBQUNsRCxnRUFBNEQ7QUFDNUQsbUNBQXFKO0FBQ3JKLG1DQUF3QztBQUd4QyxvQ0FBb0QsU0FBUSwwQkFBZTtJQUUxRCxvQkFBb0IsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7O1lBRWxHLElBQUksR0FBRyxHQUFHLDhCQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRTVDLE9BQU8sV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBRWxFLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ04sT0FBTyxTQUFTLENBQUM7aUJBQ3BCO2dCQUVELElBQUksR0FBRyxHQUFHLElBQUksc0JBQWEsRUFBRSxDQUFDO2dCQUM5QixHQUFHLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7Z0JBQzFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQztnQkFFMUMsS0FBSyxJQUFJLFNBQVMsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFO29CQUVsQyxJQUFJLGFBQWEsR0FBRyxJQUFJLDZCQUFvQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUM3RyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFFbkMsS0FBSyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO3dCQUN4QyxJQUFJLGFBQWEsR0FBRyxJQUFJLDZCQUFvQixDQUN4QyxTQUFTLENBQUMsS0FBSyxFQUNmLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUUvQyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztxQkFDaEQ7aUJBQ0o7Z0JBRUQsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVPLHlCQUF5QixDQUFDLFNBQWlDO1FBQy9ELElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFDdEMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixJQUFJLFNBQVMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxJQUFJLE9BQU8sT0FBTyxFQUFFLENBQUM7WUFDcEQsT0FBTyxJQUFJLHVCQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEM7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FDSjtBQTNDRCxpREEyQ0MifQ==