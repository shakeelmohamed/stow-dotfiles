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
const Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/debounceTime");
class WarningMessageObserver {
    constructor(vscode, disableMsBuildDiagnosticWarning, scheduler) {
        this.vscode = vscode;
        this.disableMsBuildDiagnosticWarning = disableMsBuildDiagnosticWarning;
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OmnisharpServerOnError.name:
                    this.warningMessageDebouncer.next(event);
                    break;
                case loggingEvents_1.OmnisharpServerMsBuildProjectDiagnostics.name:
                    this.handleOmnisharpServerMsBuildProjectDiagnostics(event);
                    break;
            }
        };
        this.warningMessageDebouncer = new Subject_1.Subject();
        this.warningMessageDebouncer.debounceTime(1500, scheduler).subscribe((event) => __awaiter(this, void 0, void 0, function* () {
            let message = "Some projects have trouble loading. Please review the output for more details.";
            yield showWarningMessage(this.vscode, message, { title: "Show Output", command: 'o.showOutput' });
        }));
    }
    handleOmnisharpServerMsBuildProjectDiagnostics(event) {
        if (!this.disableMsBuildDiagnosticWarning() && event.diagnostics.Errors.length > 0) {
            this.warningMessageDebouncer.next(event);
        }
    }
}
exports.WarningMessageObserver = WarningMessageObserver;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FybmluZ01lc3NhZ2VPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYnNlcnZlcnMvV2FybmluZ01lc3NhZ2VPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFHaEcsOERBQXlIO0FBRXpILDBDQUF1QztBQUN2QywwQ0FBd0M7QUFNeEM7SUFHSSxZQUFvQixNQUFjLEVBQVUsK0JBQThDLEVBQUUsU0FBcUI7UUFBN0YsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBZTtRQVFuRixTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxzQ0FBc0IsQ0FBQyxJQUFJO29CQUM1QixJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN6QyxNQUFNO2dCQUNWLEtBQUssd0RBQXdDLENBQUMsSUFBSTtvQkFDOUMsSUFBSSxDQUFDLDhDQUE4QyxDQUEyQyxLQUFLLENBQUMsQ0FBQztvQkFDckcsTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO1FBaEJHLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLGlCQUFPLEVBQWEsQ0FBQztRQUN4RCxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBTSxLQUFLLEVBQUMsRUFBRTtZQUMvRSxJQUFJLE9BQU8sR0FBRyxnRkFBZ0YsQ0FBQztZQUMvRixNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN0RyxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQWFPLDhDQUE4QyxDQUFDLEtBQStDO1FBQ2xHLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2hGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUM7SUFDTCxDQUFDO0NBQ0o7QUEzQkQsd0RBMkJDO0FBRUQsNEJBQWtDLE1BQWMsRUFBRSxPQUFlLEVBQUUsR0FBRyxLQUErQjs7UUFDakcsSUFBSTtZQUNBLElBQUksS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBeUIsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDOUYsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBUyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDL0Q7U0FDSjtRQUNELE9BQU8sR0FBRyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwQjtJQUNMLENBQUM7Q0FBQSJ9