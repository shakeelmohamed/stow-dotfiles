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
                case loggingEvents_1.CommandShowOutput.name:
                    this.showChannel();
                    break;
                case loggingEvents_1.OmnisharpFailure.name:
                    this.showChannel();
                    break;
            }
        };
    }
}
exports.OmnisharpChannelObserver = OmnisharpChannelObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwQ2hhbm5lbE9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9PbW5pc2hhcnBDaGFubmVsT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7K0ZBRytGOztBQUUvRiwrREFBNEQ7QUFDNUQsOERBQTRGO0FBRTVGLDhCQUFzQyxTQUFRLHlDQUFtQjtJQUFqRTs7UUFFVyxTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxpQ0FBaUIsQ0FBQyxJQUFJO29CQUN2QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25CLE1BQU07Z0JBQ1YsS0FBSyxnQ0FBZ0IsQ0FBQyxJQUFJO29CQUN0QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25CLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQUNMLENBQUM7Q0FBQTtBQVpELDREQVlDIn0=