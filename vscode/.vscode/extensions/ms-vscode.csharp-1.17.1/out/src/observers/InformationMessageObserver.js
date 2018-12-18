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
const ShowInformationMessage_1 = require("./utils/ShowInformationMessage");
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
            //to do: determine if we need the unresolved dependencies message
            let csharpConfig = this.vscode.workspace.getConfiguration('csharp');
            if (!csharpConfig.get('suppressDotnetRestoreNotification')) {
                let message = `There are unresolved dependencies. Please execute the restore command to continue.`;
                return ShowInformationMessage_1.default(this.vscode, message, { title: "Restore", command: "dotnet.restore.all" });
            }
        });
    }
}
exports.InformationMessageObserver = InformationMessageObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5mb3JtYXRpb25NZXNzYWdlT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0luZm9ybWF0aW9uTWVzc2FnZU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyw4REFBOEQ7QUFFOUQsMkVBQXFFO0FBRXJFO0lBQ0ksWUFBb0IsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFHM0IsU0FBSSxHQUFHLENBQUMsS0FBZ0MsRUFBRSxFQUFFO1lBQy9DLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssZUFBZSxDQUFDLHFDQUFxQyxDQUFDLElBQUk7b0JBQzNELElBQUksQ0FBQywyQ0FBMkMsQ0FBd0QsS0FBSyxDQUFDLENBQUM7b0JBQy9HLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQVJELENBQUM7SUFVYSwyQ0FBMkMsQ0FBQyxLQUE0RDs7WUFDbEgsaUVBQWlFO1lBQ2pFLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFVLG1DQUFtQyxDQUFDLEVBQUU7Z0JBQ2pFLElBQUksT0FBTyxHQUFHLG9GQUFvRixDQUFDO2dCQUNuRyxPQUFPLGdDQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO2FBQzVHO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFwQkQsZ0VBb0JDIn0=