"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class DotnetLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.CommandDotNetRestoreProgress.name:
                    this.logger.append(event.message);
                    break;
                case loggingEvents_1.CommandDotNetRestoreSucceeded.name:
                    this.logger.appendLine(event.message);
                    break;
                case loggingEvents_1.CommandDotNetRestoreFailed.name:
                    this.logger.appendLine(event.message);
                    break;
            }
        };
    }
}
exports.DotnetLoggerObserver = DotnetLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG90bmV0TG9nZ2VyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0RvdG5ldExvZ2dlck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7OztnR0FHZ0c7QUFDaEcsNkRBQTBEO0FBQzFELDhEQUFnSjtBQUVoSiwwQkFBa0MsU0FBUSx1Q0FBa0I7SUFBNUQ7O1FBQ1csU0FBSSxHQUFHLENBQUMsS0FBZ0IsRUFBRSxFQUFFO1lBQy9CLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssNENBQTRCLENBQUMsSUFBSTtvQkFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWdDLEtBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDbEUsTUFBTTtnQkFDVixLQUFLLDZDQUE2QixDQUFDLElBQUk7b0JBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQyxLQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3ZFLE1BQU07Z0JBQ1YsS0FBSywwQ0FBMEIsQ0FBQyxJQUFJO29CQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBOEIsS0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwRSxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0NBQUE7QUFkRCxvREFjQyJ9