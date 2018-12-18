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
const ShowWarningMessage_1 = require("./utils/ShowWarningMessage");
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
            yield ShowWarningMessage_1.default(this.vscode, message, { title: "Show Output", command: 'o.showOutput' });
        }));
    }
    handleOmnisharpServerMsBuildProjectDiagnostics(event) {
        if (!this.disableMsBuildDiagnosticWarning() && event.diagnostics.Errors.length > 0) {
            this.warningMessageDebouncer.next(event);
        }
    }
}
exports.WarningMessageObserver = WarningMessageObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FybmluZ01lc3NhZ2VPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYnNlcnZlcnMvV2FybmluZ01lc3NhZ2VPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFHaEcsOERBQXlIO0FBRXpILDBDQUF1QztBQUN2QywwQ0FBd0M7QUFDeEMsbUVBQTREO0FBRTVEO0lBR0ksWUFBb0IsTUFBYyxFQUFVLCtCQUE4QyxFQUFFLFNBQXFCO1FBQTdGLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWU7UUFRbkYsU0FBSSxHQUFHLENBQUMsS0FBZ0IsRUFBRSxFQUFFO1lBQy9CLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssc0NBQXNCLENBQUMsSUFBSTtvQkFDNUIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekMsTUFBTTtnQkFDVixLQUFLLHdEQUF3QyxDQUFDLElBQUk7b0JBQzlDLElBQUksQ0FBQyw4Q0FBOEMsQ0FBMkMsS0FBSyxDQUFDLENBQUM7b0JBQ3JHLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtRQWhCRyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxpQkFBTyxFQUFhLENBQUM7UUFDeEQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQU0sS0FBSyxFQUFDLEVBQUU7WUFDL0UsSUFBSSxPQUFPLEdBQUcsZ0ZBQWdGLENBQUM7WUFDL0YsTUFBTSw0QkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDdEcsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNQLENBQUM7SUFhTyw4Q0FBOEMsQ0FBQyxLQUErQztRQUNsRyxJQUFJLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNoRixJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztDQUNKO0FBM0JELHdEQTJCQyJ9