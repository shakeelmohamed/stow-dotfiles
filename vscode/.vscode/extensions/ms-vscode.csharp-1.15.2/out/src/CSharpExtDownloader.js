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
const PackageFilePathResolver_1 = require("./packageManager/PackageFilePathResolver");
/*
 * Class used to download the runtime dependencies of the C# Extension
 */
class CSharpExtDownloader {
    constructor(networkSettingsProvider, eventStream, packageJSON, platformInfo) {
        this.networkSettingsProvider = networkSettingsProvider;
        this.eventStream = eventStream;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
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
                runTimeDependencies.forEach(pkg => PackageFilePathResolver_1.ResolveFilePaths(pkg));
                installationStage = 'downloadAndInstallPackages';
                yield PackageManager_1.DownloadAndInstallPackages(runTimeDependencies, this.networkSettingsProvider, this.platformInfo, this.eventStream);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1NoYXJwRXh0RG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9DU2hhcnBFeHREb3dubG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxpQ0FBaUM7QUFFakMsNkRBQTJIO0FBRTNILG9FQUE2RTtBQUc3RSxzRkFBNEU7QUFFNUU7O0dBRUc7QUFDSDtJQUVJLFlBQ1ksdUJBQWdELEVBQ2hELFdBQXdCLEVBQ3hCLFdBQWdCLEVBQ2hCLFlBQWlDO1FBSGpDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7UUFDaEQsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsZ0JBQVcsR0FBWCxXQUFXLENBQUs7UUFDaEIsaUJBQVksR0FBWixZQUFZLENBQXFCO0lBQzdDLENBQUM7SUFFWSwwQkFBMEI7O1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLElBQUksaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7WUFFekMsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4RCx1Q0FBdUM7Z0JBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksK0JBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxtQkFBbUIsR0FBRyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLDBDQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELGlCQUFpQixHQUFHLDRCQUE0QixDQUFDO2dCQUNqRCxNQUFNLDJDQUEwQixDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDekgsaUJBQWlCLEdBQUcsZUFBZSxDQUFDO2dCQUNwQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDakQsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELE9BQU8sS0FBSyxFQUFFO2dCQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQW1CLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDekUsT0FBTyxLQUFLLENBQUM7YUFDaEI7b0JBQ087Z0JBQ0osSUFBSTtvQkFDQSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDdEQ7Z0JBQ0QsT0FBTyxLQUFLLEVBQUUsR0FBRzthQUNwQjtRQUNMLENBQUM7S0FBQTtDQUNKO0FBckNELGtEQXFDQztBQUVELHdDQUErQyxXQUFnQjtJQUMzRCxJQUFJLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRTtRQUNqQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBWSxXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0tBQ2pGO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFORCx3RUFNQyJ9