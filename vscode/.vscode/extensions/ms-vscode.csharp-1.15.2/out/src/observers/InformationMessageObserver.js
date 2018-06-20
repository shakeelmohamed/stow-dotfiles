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
const ObservableEvent = require("../omnisharp/loggingEvents");
class InformationMessageObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.constructor.name) {
                case ObservableEvent.OmnisharpServerUnresolvedDependencies.name:
                    this.handleOmnisharpServerUnresolvedDependencies(event);
                    break;
            }
        };
    }
    handleOmnisharpServerUnresolvedDependencies(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let csharpConfig = this.vscode.workspace.getConfiguration('csharp');
            if (!csharpConfig.get('suppressDotnetRestoreNotification')) {
                let info = `There are unresolved dependencies from '${this.vscode.workspace.asRelativePath(event.unresolvedDependencies.FileName)}'. Please execute the restore command to continue.`;
                let value = yield this.vscode.window.showInformationMessage(info, 'Restore');
                if (value) {
                    this.vscode.commands.executeCommand('dotnet.restore', event.unresolvedDependencies.FileName);
                }
            }
        });
    }
}
exports.InformationMessageObserver = InformationMessageObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5mb3JtYXRpb25NZXNzYWdlT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0luZm9ybWF0aW9uTWVzc2FnZU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyw4REFBOEQ7QUFHOUQ7SUFDSSxZQUFvQixNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUczQixTQUFJLEdBQUcsQ0FBQyxLQUFnQyxFQUFFLEVBQUU7WUFDL0MsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxlQUFlLENBQUMscUNBQXFDLENBQUMsSUFBSTtvQkFDM0QsSUFBSSxDQUFDLDJDQUEyQyxDQUF3RCxLQUFLLENBQUMsQ0FBQztvQkFDL0csTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBUkQsQ0FBQztJQVVhLDJDQUEyQyxDQUFDLEtBQTREOztZQUNsSCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBVSxtQ0FBbUMsQ0FBQyxFQUFFO2dCQUNqRSxJQUFJLElBQUksR0FBRywyQ0FBMkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsb0RBQW9ELENBQUM7Z0JBQ3RMLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLEtBQUssRUFBRTtvQkFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNoRzthQUNKO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUF0QkQsZ0VBc0JDIn0=