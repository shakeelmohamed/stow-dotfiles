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
const common_1 = require("../common");
function getDotnetInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let dotnetInfo;
        try {
            dotnetInfo = yield common_1.execChildProcess("dotnet --info", process.cwd());
        }
        catch (error) {
            dotnetInfo = "A valid dotnet installation could not be found.";
        }
        return dotnetInfo;
    });
}
exports.getDotnetInfo = getDotnetInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RG90bmV0SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9nZXREb3RuZXRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxzQ0FBNkM7QUFFN0M7O1FBQ0ksSUFBSSxVQUFrQixDQUFDO1FBQ3ZCLElBQUk7WUFDQSxVQUFVLEdBQUcsTUFBTSx5QkFBZ0IsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLEtBQUssRUFBRTtZQUNWLFVBQVUsR0FBRyxpREFBaUQsQ0FBQztTQUNsRTtRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7Q0FBQTtBQVZELHNDQVVDIn0=