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
                case Event.DocumentSynchronizationFailure.name:
                    this.handleDocumentSynchronizationFailure(event);
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
    handleDocumentSynchronizationFailure(event) {
        this.logger.appendLine(`Failed to synchronize document '${event.documentPath}': ${event.errorMessage}`);
    }
}
exports.CsharpLoggerObserver = CsharpLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3NoYXJwTG9nZ2VyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0NzaGFycExvZ2dlck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkRBQTBEO0FBQzFELG9EQUFvRDtBQUNwRCxpRUFBOEQ7QUFFOUQsMEJBQWtDLFNBQVEsdUNBQWtCO0lBQTVEOztRQUdXLFNBQUksR0FBRyxDQUFDLEtBQXNCLEVBQUUsRUFBRTtZQUNyQyxRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJO29CQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO29CQUNwRixNQUFNO2dCQUNWLEtBQUssS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUk7b0JBQy9CLElBQUksQ0FBQyx5QkFBeUIsQ0FBNEIsS0FBSyxDQUFDLENBQUM7b0JBQ2pFLE1BQU07Z0JBQ1YsS0FBSyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUk7b0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBd0IsS0FBSyxDQUFDLENBQUM7b0JBQ3RELE1BQU07Z0JBQ1YsS0FBSyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSTtvQkFDL0IsSUFBSSxDQUFDLHlCQUF5QixDQUE0QixLQUFLLENBQUMsQ0FBQztvQkFDakUsTUFBTTtnQkFDVixLQUFLLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO29CQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDekIsTUFBTTtnQkFDVixLQUFLLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJO29CQUM3QixJQUFJLENBQUMsdUJB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