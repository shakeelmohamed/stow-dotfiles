"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class OmnisharpChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.ShowOmniSharpChannel.name:
                case loggingEvents_1.OmnisharpFailure.name:
                case loggingEvents_1.OmnisharpServerOnStdErr.name:
                    this.showChannel();
                    break;
                case loggingEvents_1.OmnisharpRestart.name:
                    this.clearChannel();
                    break;
            }
        };
    }
}
exports.OmnisharpChannelObserver = OmnisharpChannelObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwQ2hhbm5lbE9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9PbW5pc2hhcnBDaGFubmVsT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7K0ZBRytGOztBQUUvRiwrREFBNEQ7QUFDNUQsOERBQTBJO0FBRTFJLDhCQUFzQyxTQUFRLHlDQUFtQjtJQUFqRTs7UUFFVyxTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxvQ0FBb0IsQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLEtBQUssZ0NBQWdCLENBQUMsSUFBSSxDQUFDO2dCQUMzQixLQUFLLHVDQUF1QixDQUFDLElBQUk7b0JBQzdCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbkIsTUFBTTtnQkFDVixLQUFLLGdDQUFnQixDQUFDLElBQUk7b0JBQ3RCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDcEIsTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztDQUFBO0FBZEQsNERBY0MifQ==