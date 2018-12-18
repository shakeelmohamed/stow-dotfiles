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
function showWarningMessage(vscode, message, ...items) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let value = yield vscode.window.showWarningMessage(message, ...items);
            if (value && value.command) {
                yield vscode.commands.executeCommand(value.command);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = showWarningMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvd1dhcm5pbmdNZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29ic2VydmVycy91dGlscy9TaG93V2FybmluZ01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBS2hHLDRCQUFpRCxNQUFjLEVBQUUsT0FBZSxFQUFFLEdBQUcsS0FBK0I7O1FBQ2hILElBQUk7WUFDQSxJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQXlCLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQzlGLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hCLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQVMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQy9EO1NBQ0o7UUFDRCxPQUFPLEdBQUcsRUFBRTtZQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEI7SUFDTCxDQUFDO0NBQUE7QUFWRCxxQ0FVQyJ9