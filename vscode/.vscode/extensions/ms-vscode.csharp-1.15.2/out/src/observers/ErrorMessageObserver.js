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
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class ErrorMessageObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.ZipError.name:
                    this.handleZipError(event);
                    break;
            }
        };
    }
    handleZipError(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield showErrorMessage(this.vscode, event.message);
        });
    }
}
exports.ErrorMessageObserver = ErrorMessageObserver;
function showErrorMessage(vscode, message, ...items) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield vscode.window.showErrorMessage(message, ...items);
        }
        catch (err) {
            console.log(err);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJyb3JNZXNzYWdlT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0Vycm9yTWVzc2FnZU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUdoRyw4REFBaUU7QUFHakU7SUFFSSxZQUFvQixNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUczQixTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyx3QkFBUSxDQUFDLElBQUk7b0JBQ2QsSUFBSSxDQUFDLGNBQWMsQ0FBVyxLQUFLLENBQUMsQ0FBQztvQkFDckMsTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBUkQsQ0FBQztJQVVhLGNBQWMsQ0FBQyxLQUFlOztZQUN4QyxNQUFNLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FBQTtDQUNKO0FBaEJELG9EQWdCQztBQUVELDBCQUFnQyxNQUFjLEVBQUUsT0FBZSxFQUFFLEdBQUcsS0FBZTs7UUFDL0UsSUFBSTtZQUNBLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQztTQUMzRDtRQUNELE9BQU8sR0FBRyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwQjtJQUNMLENBQUM7Q0FBQSJ9