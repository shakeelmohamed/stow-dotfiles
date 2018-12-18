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
class OmnisharpReferenceProvider extends abstractProvider_1.default {
    provideReferences(document, position, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            req.OnlyThisFile = false;
            req.ExcludeDefinition = false;
            return serverUtils.findUsages(this._server, req, token).then(res => {
                if (res && Array.isArray(res.QuickFixes)) {
                    return res.QuickFixes.map(typeConversion_1.toLocation);
                }
            });
        });
    }
}
exports.default = OmnisharpReferenceProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvcmVmZXJlbmNlUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlEQUFpRDtBQUVqRCxrREFBa0Q7QUFDbEQsZ0VBQXNFO0FBR3RFLGdDQUFnRCxTQUFRLDBCQUFlO0lBRXRELGlCQUFpQixDQUFDLFFBQXNCLEVBQUUsUUFBa0IsRUFBRSxPQUF3QyxFQUFFLEtBQXdCOztZQUV6SSxJQUFJLEdBQUcsR0FBRyw4QkFBYSxDQUE2QixRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEUsR0FBRyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDekIsR0FBRyxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUU5QixPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvRCxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDdEMsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQywyQkFBVSxDQUFDLENBQUM7aUJBQ3pDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7Q0FDSjtBQWRELDZDQWNDIn0=