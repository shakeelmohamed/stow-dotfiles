"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const os = require("os");
class OmnisharpLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OmnisharpInitialisation.name:
                    this.handleOmnisharpInitialisation(event);
                    break;
                case loggingEvents_1.OmnisharpLaunch.name:
                    this.handleOmnisharpLaunch(event);
                    break;
                case loggingEvents_1.OmnisharpFailure.name:
                    this.logger.appendLine(event.message);
                    this.logger.appendLine();
                    break;
                case loggingEvents_1.OmnisharpServerMessage.name:
                    this.logger.appendLine(event.message);
                    break;
                case loggingEvents_1.OmnisharpServerOnServerError.name:
                    this.handleOmnisharpServerOnServerError(event);
                    break;
                case loggingEvents_1.OmnisharpServerOnError.name:
                    this.handleOmnisharpServerOnError(event);
                    break;
                case loggingEvents_1.OmnisharpServerMsBuildProjectDiagnostics.name:
                    this.handleOmnisharpServerMsBuildProjectDiagnostics(event);
                    break;
                case loggingEvents_1.OmnisharpServerOnStdErr.name:
                    this.logger.append(event.message);
                    break;
                case loggingEvents_1.OmnisharpEventPacketReceived.name:
                    this.handleOmnisharpEventPacketReceived(event);
                    break;
            }
        };
    }
    handleOmnisharpServerOnServerError(event) {
        this.logger.appendLine('[ERROR] ' + event.err);
    }
    handleOmnisharpInitialisation(event) {
        this.logger.appendLine(`Starting OmniSharp server at ${event.timeStamp.toLocaleString()}`);
        this.logger.increaseIndent();
        this.logger.appendLine(`Target: ${event.solutionPath}`);
        this.logger.decreaseIndent();
        this.logger.appendLine();
    }
    handleOmnisharpLaunch(event) {
        if (event.monoVersion) {
            this.logger.appendLine(`OmniSharp server started with Mono ${event.monoVersion}`);
        }
        else {
            this.logger.appendLine(`OmniSharp server started`);
        }
        this.logger.increaseIndent();
        this.logger.appendLine(`Path: ${event.command}`);
        this.logger.appendLine(`PID: ${event.pid}`);
        this.logger.decreaseIndent();
        this.logger.appendLine();
    }
    handleOmnisharpServerMsBuildProjectDiagnostics(event) {
        if (event.diagnostics.Errors.length > 0 || event.diagnostics.Warnings.length > 0) {
            this.logger.appendLine(event.diagnostics.FileName);
            event.diagnostics.Errors.forEach(error => {
                this.logger.appendLine(`${error.FileName}(${error.StartLine},${error.StartColumn}): Error: ${error.Text}`);
            });
            event.diagnostics.Warnings.forEach(warning => {
                this.logger.appendLine(`${warning.FileName}(${warning.StartLine},${warning.StartColumn}): Warning: ${warning.Text}`);
            });
            this.logger.appendLine("");
        }
    }
    handleOmnisharpServerOnError(event) {
        if (event.errorMessage.FileName) {
            this.logger.appendLine(`${event.errorMessage.FileName}(${event.errorMessage.Line},${event.errorMessage.Column})`);
        }
        this.logger.appendLine(event.errorMessage.Text);
        this.logger.appendLine("");
    }
    handleOmnisharpEventPacketReceived(event) {
        if (!this._isFilterableOutput(event)) {
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
exports.OmnisharpLoggerObserver = OmnisharpLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwTG9nZ2VyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL09tbmlzaGFycExvZ2dlck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkRBQTBEO0FBQzFELDhEQUFrUztBQUNsUyx5QkFBeUI7QUFFekIsNkJBQXFDLFNBQVEsdUNBQWtCO0lBQS9EOztRQUNXLFNBQUksR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtZQUMvQixRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLHVDQUF1QixDQUFDLElBQUk7b0JBQzdCLElBQUksQ0FBQyw2QkFBNkIsQ0FBMEIsS0FBSyxDQUFDLENBQUM7b0JBQ25FLE1BQU07Z0JBQ1YsS0FBSywrQkFBZSxDQUFDLElBQUk7b0JBQ3JCLElBQUksQ0FBQyxxQkFBcUIsQ0FBa0IsS0FBSyxDQUFDLENBQUM7b0JBQ25ELE1BQU07Z0JBQ1YsS0FBSyxnQ0FBZ0IsQ0FBQyxJQUFJO29CQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBb0IsS0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUN6QixNQUFNO2dCQUNWLEtBQUssc0NBQXNCLENBQUMsSUFBSTtvQkFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQTBCLEtBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDaEUsTUFBTTtnQkFDVixLQUFLLDRDQUE0QixDQUFDLElBQUk7b0JBQ2xDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBK0IsS0FBSyxDQUFDLENBQUM7b0JBQzdFLE1BQU07Z0JBQ1YsS0FBSyxzQ0FBc0IsQ0FBQyxJQUFJO29CQUM1QixJQUFJLENBQUMsNEJBQTRCLENBQXlCLEtBQUssQ0FBQyxDQUFDO29CQUNqRSxN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