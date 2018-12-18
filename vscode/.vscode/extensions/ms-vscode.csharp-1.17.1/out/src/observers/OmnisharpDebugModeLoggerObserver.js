"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const os = require("os");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class OmnisharpDebugModeLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OmnisharpRequestMessage.name:
                    this.handleOmnisharpRequestMessage(event);
                    break;
                case loggingEvents_1.OmnisharpServerEnqueueRequest.name:
                    this.handleOmnisharpServerEnqueueRequest(event);
                    break;
                case loggingEvents_1.OmnisharpServerDequeueRequest.name:
                    this.handleOmnisharpServerDequeueRequest(event);
                    break;
                case loggingEvents_1.OmnisharpServerProcessRequestStart.name:
                    this.handleOmnisharpProcessRequestStart(event);
                    break;
                case loggingEvents_1.OmnisharpServerProcessRequestComplete.name:
                    this.logger.decreaseIndent();
                    break;
                case loggingEvents_1.OmnisharpServerVerboseMessage.name:
                    this.handleOmnisharpServerVerboseMessage(event);
                    break;
                case loggingEvents_1.OmnisharpEventPacketReceived.name:
                    this.handleOmnisharpEventPacketReceived(event);
                    break;
            }
        };
    }
    handleOmnisharpRequestMessage(event) {
        this.logger.append(`makeRequest: ${event.request.command} (${event.id})`);
        if (event.request.data) {
            this.logger.append(`, data=${JSON.stringify(event.request.data)}`);
        }
        this.logger.appendLine();
    }
    handleOmnisharpServerEnqueueRequest(event) {
        this.logger.appendLine(`Enqueue ${event.name} request for ${event.command}.`);
        this.logger.appendLine();
    }
    handleOmnisharpServerDequeueRequest(event) {
        this.logger.appendLine(`Dequeue ${event.name} request for ${event.command} (${event.id}).`);
        this.logger.appendLine();
    }
    handleOmnisharpProcessRequestStart(event) {
        this.logger.appendLine(`Processing ${event.name} queue`);
        this.logger.increaseIndent();
    }
    handleOmnisharpServerVerboseMessage(event) {
        this.logger.appendLine(event.message);
    }
    handleOmnisharpEventPacketReceived(event) {
        if (this._isFilterableOutput(event)) {
            let output = `[${this.getLogLevelPrefix(event.logLevel)}]: ${event.name}${os.EOL}${event.message}`;
            const newLinePlusPadding = os.EOL + "        ";
            output = output.replace(os.EOL, newLinePlusPadding);
            this.logger.appendLine(output);
        }
    }
    _isFilterableOutput(event) {
        // filter messages like: /codecheck: 200 339ms
        const timing200Pattern = /^\/[\/\w]+: 200 \d+ms/;
        return event.logLevel === "INFORMATION"
            && event.name === "OmniSharp.Middleware.LoggingMiddleware"
            && timing200Pattern.test(event.message);
    }
    getLogLevelPrefix(logLevel) {
        switch (logLevel) {
            case "TRACE": return "trce";
            case "DEBUG": return "dbug";
            case "INFORMATION": return "info";
            case "WARNING": return "warn";
            case "ERROR": return "fail";
            case "CRITICAL": return "crit";
            default: throw new Error(`Unknown log level value: ${logLevel}`);
        }
    }
}
exports.OmnisharpDebugModeLoggerObserver = OmnisharpDebugModeLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwRGVidWdNb2RlTG9nZ2VyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL09tbmlzaGFycERlYnVnTW9kZUxvZ2dlck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkRBQTBEO0FBQzFELHlCQUF5QjtBQUN6Qiw4REFBc1I7QUFFdFIsc0NBQThDLFNBQVEsdUNBQWtCO0lBQXhFOztRQUNXLFNBQUksR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtZQUMvQixRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLHVDQUF1QixDQUFDLElBQUk7b0JBQzdCLElBQUksQ0FBQyw2QkFBNkIsQ0FBMEIsS0FBSyxDQUFDLENBQUM7b0JBQ25FLE1BQU07Z0JBQ1YsS0FBSyw2Q0FBNkIsQ0FBQyxJQUFJO29CQUNuQyxJQUFJLENBQUMsbUNBQW1DLENBQWdDLEtBQUssQ0FBQyxDQUFDO29CQUMvRSxNQUFNO2dCQUNWLEtBQUssNkNBQTZCLENBQUMsSUFBSTtvQkFDbkMsSUFBSSxDQUFDLG1DQUFtQyxDQUFnQyxLQUFLLENBQUMsQ0FBQztvQkFDL0UsTUFBTTtnQkFDVixLQUFLLGtEQUFrQyxDQUFDLElBQUk7b0JBQ3hDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBcUMsS0FBSyxDQUFDLENBQUM7b0JBQ25GLE1BQU07Z0JBQ1YsS0FBSyxxREFBcUMsQ0FBQyxJQUFJO29CQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUM3QixNQUFNO2dCQUNWLEtBQUssNkNBQTZCLENBQUMsSUFBSTtvQkFDbkMsSUFBSSxDQUFDLG1DQUFtQyxDQUFnQyxLQUFLLENBQUMsQ0FBQztvQkFDL0UsTUFBTTtnQkFDVixLQUFLLDRDQUE0QixDQUFDLElBQUk7b0JBQ2xDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBK0IsS0FBSyxDQUFDLENBQUM7b0JBQzdFLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQTRETCxDQUFDO0lBMURXLDZCQUE2QixDQUFDLEtBQThCO1FBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN0RTtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLG1DQUFtQyxDQUFDLEtBQW9DO1FBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsS0FBSyxDQUFDLElBQUksZ0JBQWdCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLG1DQUFtQyxDQUFDLEtBQW9DO1FBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsS0FBSyxDQUFDLElBQUksZ0JBQWdCLEtBQUssQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRU8sa0NBQWtDLENBQUMsS0FBeUM7UUFDaEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFTyxtQ0FBbUMsQ0FBQyxLQUFvQztRQUM1RSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVPLGtDQUFrQyxDQUFDLEtBQW1DO1FBQzFFLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLElBQUksTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRW5HLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUM7WUFDL0MsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQUVPLG1CQUFtQixDQUFDLEtBQW1DO1FBQzNELDhDQUE4QztRQUM5QyxNQUFNLGdCQUFnQixHQUFHLHVCQUF1QixDQUFDO1FBRWpELE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxhQUFhO2VBQ2hDLEtBQUssQ0FBQyxJQUFJLEtBQUssd0NBQXdDO2VBQ3ZELGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVPLGlCQUFpQixDQUFDLFFBQWdCO1FBQ3RDLFFBQVEsUUFBUSxFQUFFO1lBQ2QsS0FBSyxPQUFPLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQztZQUM1QixLQUFLLE9BQU8sQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDO1lBQzVCLEtBQUssYUFBYSxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7WUFDbEMsS0FBSyxTQUFTLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQztZQUM5QixLQUFLLE9BQU8sQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDO1lBQzVCLEtBQUssVUFBVSxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7WUFDL0IsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUNwRTtJQUNMLENBQUM7Q0FDSjtBQXJGRCw0RUFxRkMifQ==