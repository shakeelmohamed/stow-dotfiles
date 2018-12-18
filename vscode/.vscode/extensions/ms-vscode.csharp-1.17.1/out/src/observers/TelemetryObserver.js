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
                case loggingEvents_1.TelemetryEvent.name:
                    let telemetryEvent = event;
                    this.reporter.sendTelemetryEvent(telemetryEvent.eventName, telemetryEvent.properties, telemetryEvent.measures);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVsZW1ldHJ5T2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL1RlbGVtZXRyeU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcsOERBQWdQO0FBQ2hQLGlFQUE4RDtBQU05RDtJQUlJLFlBQVksWUFBaUMsRUFBRSxlQUF5QztRQUtqRixTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDOUMsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxtQ0FBbUIsQ0FBQyxJQUFJO29CQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ3JELE1BQU07Z0JBQ1YsS0FBSyxtQ0FBbUIsQ0FBQyxJQUFJO29CQUN6QixJQUFJLENBQUMseUJBQXlCLENBQXNCLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDM0UsTUFBTTtnQkFDVixLQUFLLG1DQUFtQixDQUFDLElBQUk7b0JBQ3pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDL0MsTUFBTTtnQkFDVixLQUFLLGtEQUFrQyxDQUFDLElBQUksQ0FBQztnQkFDN0MsS0FBSyw4QkFBYyxDQUFDLElBQUk7b0JBQ3BCLElBQUksQ0FBQyw0QkFBNEIsQ0FBNkIsS0FBSyxDQUFDLENBQUM7b0JBQ3JFLE1BQU07Z0JBQ1YsS0FBSyx3Q0FBd0IsQ0FBQyxJQUFJO29CQUM5QixJQUFJLENBQUMsOEJBQThCLENBQTJCLEtBQUssQ0FBQyxDQUFDO29CQUNyRSxNQUFNO2dCQUNWLEtBQUssOEJBQWMsQ0FBQyxJQUFJO29CQUNwQixJQUFJLGNBQWMsR0FBbUIsS0FBSyxDQUFDO29CQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQy9HLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtRQTVCRyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUE0Qk8sNEJBQTRCLENBQUMsS0FBaUM7UUFDbEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVPLHlCQUF5QixDQUFDLGNBQTBDO1FBQ3hFLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8seUJBQXlCLENBQUMsS0FBMEIsRUFBRSxjQUEwQztRQUNwRyxjQUFjLENBQUMsY0FBYyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUM3QyxJQUFJLEtBQUssQ0FBQyxLQUFLLFlBQVksMkJBQVksRUFBRTtZQUNyQyxzR0FBc0c7WUFDdEcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBRXRELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pCLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQzthQUM1RDtTQUNKO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLDhCQUE4QixDQUFDLEtBQStCO1FBQ2xFLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzFFO1FBQ0QsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEU7SUFDTCxDQUFDO0lBRU8saUJBQWlCO1FBQ3JCLElBQUksY0FBYyxHQUE4QjtZQUM1Qyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVk7WUFDdkQsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRO1NBQ2xELENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFO1lBQ2hDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDaEc7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUEvRUQsOENBK0VDIn0=