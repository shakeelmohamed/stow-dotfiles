"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const PackageError_1 = require("../packageManager/PackageError");
class TelemetryObserver {
    constructor(platformInfo, reporterCreator) {
        this.post = (event) => {
            let telemetryProps = this.getTelemetryProps();
            switch (event.constructor.name) {
                case loggingEvents_1.PackageInstallation.name:
                    this.reporter.sendTelemetryEvent("AcquisitionStart");
                    break;
                case loggingEvents_1.InstallationFailure.name:
                    this.handleInstallationFailure(event, telemetryProps);
                    break;
                case loggingEvents_1.InstallationSuccess.name:
                    this.handleInstallationSuccess(telemetryProps);
                    break;
                case loggingEvents_1.OmnisharpDelayTrackerEventMeasures.name:
                case loggingEvents_1.OmnisharpStart.name:
                    this.handleTelemetryEventMeasures(event);
                    break;
                case loggingEvents_1.TestExecutionCountReport.name:
                    this.handleTestExecutionCountReport(event);
                    break;
            }
        };
        this.platformInfo = platformInfo;
        this.reporter = reporterCreator();
    }
    handleTelemetryEventMeasures(event) {
        this.reporter.sendTelemetryEvent(event.eventName, null, event.measures);
    }
    handleInstallationSuccess(telemetryProps) {
        telemetryProps['installStage'] = 'completeSuccess';
        this.reporter.sendTelemetryEvent('Acquisition', telemetryProps);
    }
    handleInstallationFailure(event, telemetryProps) {
        telemetryProps['installStage'] = event.stage;
        if (event.error instanceof PackageError_1.PackageError) {
            // we can log the message in a PackageError to telemetry as we do not put PII in PackageError messages
            telemetryProps['error.message'] = event.error.message;
            if (event.error.pkg) {
                telemetryProps['error.packageUrl'] = event.error.pkg.url;
            }
        }
        this.reporter.sendTelemetryEvent('Acquisition', telemetryProps);
    }
    handleTestExecutionCountReport(event) {
        if (event.debugCounts) {
            this.reporter.sendTelemetryEvent('DebugTest', null, event.debugCounts);
        }
        if (event.runCounts) {
            this.reporter.sendTelemetryEvent('RunTest', null, event.runCounts);
        }
    }
    getTelemetryProps() {
        let telemetryProps = {
            'platform.architecture': this.platformInfo.architecture,
            'platform.platform': this.platformInfo.platform
        };
        if (this.platformInfo.distribution) {
            telemetryProps['platform.distribution'] = this.platformInfo.distribution.toTelemetryString();
        }
        return telemetryProps;
    }
}
exports.TelemetryObserver = TelemetryObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVsZW1ldHJ5T2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL1RlbGVtZXRyeU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcsOERBQWdPO0FBQ2hPLGlFQUE4RDtBQU05RDtJQUlJLFlBQVksWUFBaUMsRUFBRSxlQUF5QztRQUtqRixTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDOUMsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxtQ0FBbUIsQ0FBQyxJQUFJO29CQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ3JELE1BQU07Z0JBQ1YsS0FBSyxtQ0FBbUIsQ0FBQyxJQUFJO29CQUN6QixJQUFJLENBQUMseUJBQXlCLENBQXNCLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDM0UsTUFBTTtnQkFDVixLQUFLLG1DQUFtQixDQUFDLElBQUk7b0JBQ3pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDL0MsTUFBTTtnQkFDVixLQUFLLGtEQUFrQyxDQUFDLElBQUksQ0FBQztnQkFDN0MsS0FBSyw4QkFBYyxDQUFDLElBQUk7b0JBQ3BCLElBQUksQ0FBQyw0QkFBNEIsQ0FBNkIsS0FBSyxDQUFDLENBQUM7b0JBQ3JFLE1BQU07Z0JBQ1YsS0FBSyx3Q0FBd0IsQ0FBQyxJQUFJO29CQUM5QixJQUFJLENBQUMsOEJBQThCLENBQTJCLEtBQUssQ0FBQyxDQUFDO29CQUNyRSxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUE7UUF4QkcsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxlQUFlLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBd0JPLDRCQUE0QixDQUFDLEtBQWlDO1FBQ2xFLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxjQUEwQztRQUN4RSxjQUFjLENBQUMsY0FBYyxDQUFDLEdBQUcsaUJBQWlCLENBQUM7UUFDbkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLHlCQUF5QixDQUFDLEtBQTBCLEVBQUUsY0FBMEM7UUFDcEcsY0FBYyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDN0MsSUFBSSxLQUFLLENBQUMsS0FBSyxZQUFZLDJCQUFZLEVBQUU7WUFDckMsc0dBQXNHO1lBQ3RHLGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUV0RCxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNqQixjQUFjLENBQUMsa0JBQWtCLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7YUFDNUQ7U0FDSjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTyw4QkFBOEIsQ0FBQyxLQUErQjtRQUNsRSxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUMxRTtRQUNELElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3RFO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQjtRQUNyQixJQUFJLGNBQWMsR0FBOEI7WUFDNUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZO1lBQ3ZELG1CQUFtQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUTtTQUNsRCxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRTtZQUNoQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQ2hHO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBM0VELDhDQTJFQyJ9