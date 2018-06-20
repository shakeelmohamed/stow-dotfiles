"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseLoggerObserver_1 = require("./BaseLoggerObserver");
const Event = require("../omnisharp/loggingEvents");
const PackageError_1 = require("../packageManager/PackageError");
class CsharpLoggerObserver extends BaseLoggerObserver_1.BaseLoggerObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case Event.ActivationFailure.name:
                    this.logger.appendLine("[ERROR]: C# Extension failed to get platform information.");
                    break;
                case Event.PackageInstallation.name:
                    this.handlePackageInstallation(event);
                    break;
                case Event.LogPlatformInfo.name:
                    this.handlePlatformInfo(event);
                    break;
                case Event.InstallationFailure.name:
                    this.handleInstallationFailure(event);
                    break;
                case Event.InstallationSuccess.name:
                    this.logger.appendLine('Finished');
                    this.logger.appendLine();
                    break;
                case Event.InstallationStart.name:
                    this.handleInstallationStart(event);
                    break;
                case Event.DownloadStart.name:
                    this.handleDownloadStart(event);
                    break;
                case Event.DownloadProgress.name:
                    this.handleDownloadProgress(event);
                    break;
                case Event.DownloadSuccess.name:
                case Event.DownloadFailure.name:
                case Event.DebuggerPrerequisiteFailure.name:
                case Event.DebuggerPrerequisiteWarning.name:
                    this.handleEventWithMessage(event);
                    break;
                case Event.ProjectJsonDeprecatedWarning.name:
                    this.logger.appendLine("Warning: project.json is no longer a supported project format for .NET Core applications. Update to the latest version of .NET Core (https://aka.ms/netcoredownload) and use 'dotnet migrate' to upgrade your project (see https://aka.ms/netcoremigrate for details).");
                    break;
                case Event.DownloadFallBack.name:
                    this.handleDownloadFallback(event);
                    break;
                case Event.DownloadSizeObtained.name:
                    this.handleDownloadSizeObtained(event);
                    break;
                case Event.LatestBuildDownloadStart.name:
                    this.logger.appendLine("Getting latest OmniSharp version information");
                    break;
            }
        };
    }
    handleDownloadSizeObtained(event) {
        this.logger.append(`(${Math.ceil(event.packageSize / 1024)} KB)`);
    }
    handleDownloadFallback(event) {
        this.logger.append(`\tRetrying from '${event.fallbackUrl}' `);
    }
    handleEventWithMessage(event) {
        this.logger.appendLine(event.message);
    }
    handlePackageInstallation(event) {
        this.logger.append(`Installing ${event.packageInfo}...`);
        this.logger.appendLine();
    }
    handlePlatformInfo(event) {
        this.logger.appendLine(`Platform: ${event.info.toString()}`);
        this.logger.appendLine();
    }
    handleInstallationFailure(event) {
        this.logger.appendLine(`Failed at stage: ${event.stage}`);
        if (event.error instanceof PackageError_1.PackageError) {
            if (event.error.innerError) {
                this.logger.appendLine(event.error.innerError.toString());
            }
            else {
                this.logger.appendLine(event.error.message);
            }
        }
        else {
            // do not log raw errorMessage in telemetry as it is likely to contain PII.
            this.logger.appendLine(event.error.toString());
        }
        this.logger.appendLine();
    }
    handleDownloadProgress(event) {
        let newDots = Math.ceil(event.downloadPercentage / 5);
        this.logger.append('.'.repeat(newDots - this.dots));
        this.dots = newDots;
    }
    handleDownloadStart(event) {
        this.logger.append(`Downloading package '${event.packageDescription}' `);
        this.dots = 0;
    }
    handleInstallationStart(event) {
        this.logger.appendLine(`Installing package '${event.packageDescription}'`);
        this.logger.appendLine();
    }
}
exports.CsharpLoggerObserver = CsharpLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3NoYXJwTG9nZ2VyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0NzaGFycExvZ2dlck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkRBQTBEO0FBQzFELG9EQUFvRDtBQUNwRCxpRUFBOEQ7QUFFOUQsMEJBQWtDLFNBQVEsdUNBQWtCO0lBQTVEOztRQUdXLFNBQUksR0FBRyxDQUFDLEtBQXNCLEVBQUUsRUFBRTtZQUNyQyxRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJO29CQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO29CQUNwRixNQUFNO2dCQUNWLEtBQUssS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUk7b0JBQy9CLElBQUksQ0FBQyx5QkFBeUIsQ0FBNEIsS0FBSyxDQUFDLENBQUM7b0JBQ2pFLE1BQU07Z0JBQ1YsS0FBSyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUk7b0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBd0IsS0FBSyxDQUFDLENBQUM7b0JBQ3RELE1BQU07Z0JBQ1YsS0FBSyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSTtvQkFDL0IsSUFBSSxDQUFDLHlCQUF5QixDQUE0QixLQUFLLENBQUMsQ0FBQztvQkFDakUsTUFBTTtnQkFDVixLQUFLLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO29CQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDekIsTUFBTTtnQkFDVixLQUFLLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJO29CQUM3QixJQUFJLENBQUMsdUJB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