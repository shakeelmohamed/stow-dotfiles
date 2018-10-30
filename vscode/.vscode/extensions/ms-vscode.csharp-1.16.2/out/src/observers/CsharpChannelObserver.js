"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class CsharpChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.DownloadStart.name:
                case loggingEvents_1.InstallationFailure.name:
                case loggingEvents_1.DebuggerNotInstalledFailure.name:
                case loggingEvents_1.DebuggerPrerequisiteFailure.name:
                case loggingEvents_1.ProjectJsonDeprecatedWarning.name:
                    this.showChannel();
                    break;
            }
        };
    }
}
exports.CsharpChannelObserver = CsharpChannelObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3NoYXJwQ2hhbm5lbE9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9Dc2hhcnBDaGFubmVsT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRywrREFBNEQ7QUFDNUQsOERBQW1MO0FBRW5MLDJCQUFtQyxTQUFRLHlDQUFtQjtJQUE5RDs7UUFDVyxTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyw2QkFBYSxDQUFDLElBQUksQ0FBQztnQkFDeEIsS0FBSyxtQ0FBbUIsQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLEtBQUssMkNBQTJCLENBQUMsSUFBSSxDQUFDO2dCQUN0QyxLQUFLLDJDQUEyQixDQUFDLElBQUksQ0FBQztnQkFDdEMsS0FBSyw0Q0FBNEIsQ0FBQyxJQUFJO29CQUNsQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25CLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQUNMLENBQUM7Q0FBQTtBQVpELHNEQVlDIn0=