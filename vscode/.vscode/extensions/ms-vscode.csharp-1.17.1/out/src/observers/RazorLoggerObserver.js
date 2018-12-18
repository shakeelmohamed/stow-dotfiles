"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class RazorLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.RazorPluginPathSpecified.name:
                    this.handleRazorPluginPathSpecifiedMessage(event);
                    break;
                case loggingEvents_1.RazorPluginPathDoesNotExist.name:
                    this.handleRazorPluginPathDoesNotExistMessage(event);
                    break;
                case loggingEvents_1.RazorDevModeActive.name:
                    this.handleRazorDevMode();
                    break;
            }
        };
    }
    handleRazorPluginPathSpecifiedMessage(event) {
        this.logger.appendLine('Razor Plugin Path Specified');
        this.logger.increaseIndent();
        this.logger.appendLine(`Path: ${event.path}`);
        this.logger.decreaseIndent();
        this.logger.appendLine();
    }
    handleRazorPluginPathDoesNotExistMessage(event) {
        this.logger.appendLine(`[error]: Razor plugin path was specified as '${event.path}' but does not exist on disk.`);
    }
    handleRazorDevMode() {
        this.logger.appendLine('Razor dev mode active. Suppressing built-in OmniSharp Razor support.');
        this.logger.appendLine();
    }
}
exports.RazorLoggerObserver = RazorLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF6b3JMb2dnZXJPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYnNlcnZlcnMvUmF6b3JMb2dnZXJPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLDZEQUEwRDtBQUMxRCw4REFBa0k7QUFFbEkseUJBQWlDLFNBQVEsdUNBQWtCO0lBQTNEOztRQUNXLFNBQUksR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtZQUMvQixRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLHdDQUF3QixDQUFDLElBQUk7b0JBQzlCLElBQUksQ0FBQyxxQ0FBcUMsQ0FBMkIsS0FBSyxDQUFDLENBQUM7b0JBQzVFLE1BQU07Z0JBQ1YsS0FBSywyQ0FBMkIsQ0FBQyxJQUFJO29CQUNqQyxJQUFJLENBQUMsd0NBQXdDLENBQThCLEtBQUssQ0FBQyxDQUFDO29CQUNsRixNQUFNO2dCQUNWLEtBQUssa0NBQWtCLENBQUMsSUFBSTtvQkFDeEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQzFCLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQWtCTCxDQUFDO0lBaEJXLHFDQUFxQyxDQUFDLEtBQStCO1FBQ3pFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRU8sd0NBQXdDLENBQUMsS0FBK0I7UUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0RBQWdELEtBQUssQ0FBQyxJQUFJLCtCQUErQixDQUFDLENBQUM7SUFDdEgsQ0FBQztJQUVPLGtCQUFrQjtRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1FBQy9GLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNKO0FBL0JELGtEQStCQyJ9