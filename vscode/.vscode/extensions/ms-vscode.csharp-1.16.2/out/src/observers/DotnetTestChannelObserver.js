"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class DotnetTestChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.DotNetTestRunStart.name:
                case loggingEvents_1.DotNetTestRunFailure.name:
                case loggingEvents_1.DotNetTestsInClassRunStart.name:
                case loggingEvents_1.DotNetTestDebugStart.name:
                case loggingEvents_1.DotNetTestsInClassDebugStart.name:
                    this.showChannel();
                    break;
            }
        };
    }
}
exports.default = DotnetTestChannelObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG90bmV0VGVzdENoYW5uZWxPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYnNlcnZlcnMvRG90bmV0VGVzdENoYW5uZWxPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLCtEQUE0RDtBQUM1RCw4REFBaUw7QUFFakwsK0JBQStDLFNBQVEseUNBQW1CO0lBQTFFOztRQUNXLFNBQUksR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtZQUMvQixRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLGtDQUFrQixDQUFDLElBQUksQ0FBQztnQkFDN0IsS0FBSyxvQ0FBb0IsQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLEtBQUssMENBQTBCLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxLQUFLLG9DQUFvQixDQUFDLElBQUksQ0FBQztnQkFDL0IsS0FBSyw0Q0FBNEIsQ0FBQyxJQUFJO29CQUNsQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25CLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQUNMLENBQUM7Q0FBQTtBQVpELDRDQVlDIn0=