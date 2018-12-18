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
const vscode_1 = require("vscode");
class FormattingSupport extends abstractProvider_1.default {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: document.fileName,
                Line: range.start.line + 1,
                Column: range.start.character + 1,
                EndLine: range.end.line + 1,
                EndColumn: range.end.character + 1
            };
            return serverUtils.formatRange(this._server, request, token).then(res => {
                if (res && Array.isArray(res.Changes)) {
                    return res.Changes.map(FormattingSupport._asEditOptionation);
                }
            });
        });
    }
    provideOnTypeFormattingEdits(document, position, ch, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: document.fileName,
                Line: position.line + 1,
                Column: position.character + 1,
                Character: ch
            };
            return serverUtils.formatAfterKeystroke(this._server, request, token).then(res => {
                if (res && Array.isArray(res.Changes)) {
                    return res.Changes.map(FormattingSupport._asEditOptionation);
                }
            });
        });
    }
    static _asEditOptionation(change) {
        return new vscode_1.TextEdit(new vscode_1.Range(change.StartLine - 1, change.StartColumn - 1, change.EndLine - 1, change.EndColumn - 1), change.NewText);
    }
}
exports.default = FormattingSupport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGluZ0VkaXRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9mb3JtYXR0aW5nRWRpdFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyx5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELG1DQUEwSTtBQUUxSSx1QkFBdUMsU0FBUSwwQkFBZTtJQUU3QyxtQ0FBbUMsQ0FBQyxRQUFzQixFQUFFLEtBQVksRUFBRSxPQUEwQixFQUFFLEtBQXdCOztZQUV2SSxJQUFJLE9BQU8sR0FBZ0M7Z0JBQ3ZDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQzFCLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDO2dCQUNqQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztnQkFDM0IsU0FBUyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUM7YUFDckMsQ0FBQztZQUVGLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3BFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNuQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQ2hFO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7SUFFWSw0QkFBNEIsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsRUFBVSxFQUFFLE9BQTBCLEVBQUUsS0FBd0I7O1lBRWxKLElBQUksT0FBTyxHQUEwQztnQkFDakQsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO2dCQUMzQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDO2dCQUN2QixNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsR0FBRyxDQUFDO2dCQUM5QixTQUFTLEVBQUUsRUFBRTthQUNoQixDQUFDO1lBRUYsT0FBTyxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM3RSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDbkMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUNoRTtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQTJCO1FBQ3pELE9BQU8sSUFBSSxpQkFBUSxDQUNmLElBQUksY0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQ2pHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDO0NBQ0o7QUF4Q0Qsb0NBd0NDIn0=