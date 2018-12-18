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
        this.logger.append(`OmniSharp server started`);
        if (event.monoVersion) {
            this.logger.append(` with Mono ${event.monoVersion}`);
            if (event.monoPath !== undefined) {
                this.logger.append(` (${event.monoPath})`);
            }
        }
        this.logger.appendLine('.');
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