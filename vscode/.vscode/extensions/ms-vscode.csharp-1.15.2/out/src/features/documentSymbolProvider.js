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
class OmnisharpDocumentSymbolProvider extends abstractProvider_1.default {
    provideDocumentSymbols(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return serverUtils.currentFileMembersAsTree(this._server, { FileName: document.fileName }, token).then(tree => {
                let ret = [];
                for (let node of tree.TopLevelTypeDefinitions) {
                    typeConvertion_1.toDocumentSymbol(ret, node);
                }
                return ret;
            });
        });
    }
}
exports.default = OmnisharpDocumentSymbolProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTeW1ib2xQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudFN5bWJvbFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyx5REFBaUQ7QUFDakQsa0RBQWtEO0FBQ2xELGdFQUE2RDtBQUc3RCxxQ0FBcUQsU0FBUSwwQkFBZTtJQUUzRCxzQkFBc0IsQ0FBQyxRQUFzQixFQUFFLEtBQXdCOztZQUVoRixPQUFPLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFHLElBQUksR0FBRyxHQUF3QixFQUFFLENBQUM7Z0JBQ2xDLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO29CQUMzQyxpQ0FBZ0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQy9CO2dCQUNELE9BQU8sR0FBRyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7Q0FDSjtBQVpELGtEQVlDIn0=