"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./common");
const loggingEvents_1 = require("./omnisharp/loggingEvents");
const PackageManager_1 = require("./packageManager/PackageManager");
/*
 * Class used to download the runtime dependencies of the C# Extension
 */
class CSharpExtDownloader {
    constructor(networkSettingsProvider, eventStream, packageJSON, platformInfo, extensionPath) {
        this.networkSettingsProvider = networkSettingsProvider;
        this.eventStream = eventStream;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.extensionPath = extensionPath;
    }
    installRuntimeDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            this.eventStream.post(new loggingEvents_1.PackageInstallation("C# dependencies"));
            let installationStage = 'touchBeginFile';
            try {
                yield util.touchInstallFile(util.InstallFileType.Begin);
                // Display platform information and RID
                this.eventStream.post(new loggingEvents_1.LogPlatformInfo(this.platformInfo));
                let runTimeDependencies = GetRunTimeDependenciesPackages(this.packageJSON);
                installationStage = 'downloadAndInstallPackages';
                yield PackageManager_1.DownloadAndInstallPackages(runTimeDependencies, this.networkSettingsProvider, this.platformInfo, this.eventStream, this.extensionPath);
                installationStage = 'touchLockFile';
                yield util.touchInstallFile(util.InstallFileType.Lock);
                this.eventStream.post(new loggingEvents_1.InstallationSuccess());
                return true;
            }
            catch (error) {
                this.eventStream.post(new loggingEvents_1.InstallationFailure(installationStage, error));
                return false;
            }
            finally {
                try {
                    util.deleteInstallFile(util.InstallFileType.Begin);
                }
                catch (error) { }
            }
        });
    }
}
exports.CSharpExtDownloader = CSharpExtDownloader;
function GetRunTimeDependenciesPackages(packageJSON) {
    if (packageJSON.runtimeDependencies) {
        return JSON.parse(JSON.stringify(packageJSON.runtimeDependencies));
    }
    throw new Error("No runtime dependencies found");
}
exports.GetRunTimeDependenciesPackages = GetRunTimeDependenciesPackages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1NoYXJwRXh0RG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9DU2hhcnBFeHREb3dubG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxpQ0FBaUM7QUFFakMsNkRBQTJIO0FBRTNILG9FQUE2RTtBQUk3RTs7R0FFRztBQUNIO0lBRUksWUFDWSx1QkFBZ0QsRUFDaEQsV0FBd0IsRUFDeEIsV0FBZ0IsRUFDaEIsWUFBaUMsRUFDakMsYUFBcUI7UUFKckIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtRQUNoRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixnQkFBVyxHQUFYLFdBQVcsQ0FBSztRQUNoQixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDakMsa0JBQWEsR0FBYixhQUFhLENBQVE7SUFDakMsQ0FBQztJQUVZLDBCQUEwQjs7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBSSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUV6QyxJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hELHVDQUF1QztnQkFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQkFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLG1CQUFtQixHQUFHLDhCQUE4QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDM0UsaUJBQWlCLEdBQUcsNEJBQTRCLENBQUM7Z0JBQ2pELE1BQU0sMkNBQTBCLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzdJLGlCQUFpQixHQUFHLGVBQWUsQ0FBQztnQkFDcEMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBbUIsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxPQUFPLEtBQUssRUFBRTtnQkFDVixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFtQixDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3pFLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO29CQUNPO2dCQUNKLElBQUk7b0JBQ0EsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3REO2dCQUNELE9BQU8sS0FBSyxFQUFFLEdBQUc7YUFDcEI7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQXJDRCxrREFxQ0M7QUFFRCx3Q0FBK0MsV0FBZ0I7SUFDM0QsSUFBSSxXQUFXLENBQUMsbUJBQW1CLEVBQUU7UUFDakMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQVksV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztLQUNqRjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBTkQsd0VBTUMifQ==