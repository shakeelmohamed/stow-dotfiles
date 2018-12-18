"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const protocol = require("../omnisharp/protocol");
class DotNetTestLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.DotNetTestRunStart.name:
                    this.handleDotnetTestRunStart(event);
                    break;
                case loggingEvents_1.DotNetTestMessage.name:
                    this.logger.appendLine(event.message);
                    break;
                case loggingEvents_1.ReportDotNetTestResults.name:
                    this.handleReportDotnetTestResults(event);
                    break;
                case loggingEvents_1.DotNetTestDebugStart.name:
                    this.handleDotnetTestDebugStart(event);
                    break;
                case loggingEvents_1.DotNetTestDebugWarning.name:
                    this.handleDotNetTestDebugWarning(event);
                    break;
                case loggingEvents_1.DotNetTestDebugProcessStart.name:
                    this.handleDotNetTestDebugProcessStart(event);
                    break;
                case loggingEvents_1.DotNetTestDebugComplete.name:
                    this.logger.appendLine("Debugging complete.\n");
                    break;
                case loggingEvents_1.DotNetTestsInClassDebugStart.name:
                    this.handleDotnetTestsInClassDebugStart(event);
                    break;
                case loggingEvents_1.DotNetTestsInClassRunStart.name:
                    this.handleDotnetTestsInClassRunStart(event);
                    break;
            }
        };
    }
    handleDotNetTestDebugWarning(event) {
        this.logger.appendLine(`Warning: ${event.message}`);
    }
    handleDotnetTestDebugStart(event) {
        this.logger.appendLine(`----- Debugging test method ${event.testMethod} -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestRunStart(event) {
        this.logger.appendLine(`----- Running test method "${event.testMethod}" -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestsInClassDebugStart(event) {
        this.logger.appendLine(`----- Debugging tests in class ${event.className} -----`);
        this.logger.appendLine('');
    }
    handleDotnetTestsInClassRunStart(event) {
        this.logger.appendLine(`----- Running tests in class "${event.className}" -----`);
        this.logger.appendLine('');
    }
    handleDotNetTestDebugProcessStart(event) {
        this.logger.appendLine(`Started debugging process #${event.targetProcessId}.`);
    }
    handleReportDotnetTestResults(event) {
        this.logger.appendLine("----- Test Execution Summary -----");
        this.logger.appendLine('');
        // Omnisharp returns null results if there are build failures
        const results = event.results || [];
        const totalTests = results.length;
        let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
        for (let result of results) {
            this.logTestResult(result);
            switch (result.Outcome) {
                case protocol.V2.TestOutcomes.Failed:
                    totalFailed += 1;
                    break;
                case protocol.V2.TestOutcomes.Passed:
                    totalPassed += 1;
                    break;
                case protocol.V2.TestOutcomes.Skipped:
                    totalSkipped += 1;
                    break;
            }
        }
        this.logger.appendLine(`Total tests: ${totalTests}. Passed: ${totalPassed}. Failed: ${totalFailed}. Skipped: ${totalSkipped}`);
        this.logger.appendLine('');
    }
    logTestResult(result) {
        this.logger.appendLine(`${result.MethodName}:`);
        this.logger.increaseIndent();
        this.logger.appendLine(`Outcome: ${processOutcome(result.Outcome)}`);
        if (result.ErrorMessage) {
            this.logger.appendLine(`Error Message:`);
            this.logger.appendLine(result.ErrorMessage);
        }
        if (result.ErrorStackTrace) {
            this.logger.appendLine(`Stack Trace:`);
            this.logger.appendLine(result.ErrorStackTrace);
        }
        if (result.StandardOutput && result.StandardOutput.length > 0) {
            this.logger.appendLine("Standard Output Messages:");
            result.StandardOutput.forEach(message => this.logger.appendLine(message));
        }
        if (result.StandardError && result.StandardError.length > 0) {
            this.logger.appendLine("Standard Error Messages:");
            result.StandardError.forEach(message => this.logger.appendLine(message));
        }
        this.logger.appendLine();
        this.logger.decreaseIndent();
    }
}
exports.default = DotNetTestLoggerObserver;
function processOutcome(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}
exports.processOutcome = processOutcome;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG90bmV0VGVzdExvZ2dlck9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9Eb3RuZXRUZXN0TG9nZ2VyT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyw4REFBcVI7QUFDclIsNkRBQTBEO0FBQzFELGtEQUFrRDtBQUVsRCw4QkFBOEMsU0FBUSx1Q0FBa0I7SUFBeEU7O1FBRVcsU0FBSSxHQUFHLENBQUMsS0FBZ0IsRUFBRSxFQUFFO1lBQy9CLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssa0NBQWtCLENBQUMsSUFBSTtvQkFDeEIsSUFBSSxDQUFDLHdCQUF3QixDQUFxQixLQUFLLENBQUMsQ0FBQztvQkFDekQsTUFBTTtnQkFDVixLQUFLLGlDQUFpQixDQUFDLElBQUk7b0JBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFxQixLQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzNELE1BQU07Z0JBQ1YsS0FBSyx1Q0FBdUIsQ0FBQyxJQUFJO29CQUM3QixJQUFJLENBQUMsNkJBQTZCLENBQTBCLEtBQUssQ0FBQyxDQUFDO29CQUNuRSxNQUFNO2dCQUNWLEtBQUssb0NBQW9CLENBQUMsSUFBSTtvQkFDMUIsSUFBSSxDQUFDLDBCQUEwQixDQUF1QixLQUFLLENBQUMsQ0FBQztvQkFDN0QsTUFBTTtnQkFDVixLQUFLLHNDQUFzQixDQUFDLElBQUk7b0JBQzVCLElBQUksQ0FBQyw0QkFBNEIsQ0FBeUIsS0FBSyxDQUFDLENBQUM7b0JBQ2pFLE1BQU07Z0JBQ1YsS0FBSywyQ0FBMkIsQ0FBQyxJQUFJO29CQUNqQyxJQUFJLENBQUMsaUNBQWlDLENBQThCLEtBQUssQ0FBQyxDQUFDO29CQUMzRSxNQUFNO2dCQUNWLEtBQUssdUNBQXVCLENBQUMsSUFBSTtvQkFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FB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