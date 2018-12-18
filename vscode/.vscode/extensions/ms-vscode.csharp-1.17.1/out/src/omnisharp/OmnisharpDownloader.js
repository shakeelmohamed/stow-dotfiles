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
const OmnisharpPackageCreator_1 = require("./OmnisharpPackageCreator");
const loggingEvents_1 = require("./loggingEvents");
const PackageManager_1 = require("../packageManager/PackageManager");
const FileDownloader_1 = require("../packageManager/FileDownloader");
class OmnisharpDownloader {
    constructor(networkSettingsProvider, eventStream, packageJSON, platformInfo, extensionPath) {
        this.networkSettingsProvider = networkSettingsProvider;
        this.eventStream = eventStream;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.extensionPath = extensionPath;
    }
    DownloadAndInstallOmnisharp(version, serverUrl, installPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.eventStream.post(new loggingEvents_1.PackageInstallation(`OmniSharp Version = ${version}`));
            let installationStage = '';
            try {
                this.eventStream.post(new loggingEvents_1.LogPlatformInfo(this.platformInfo));
                installationStage = 'getPackageInfo';
                let packages = OmnisharpPackageCreator_1.GetPackagesFromVersion(version, this.packageJSON.runtimeDependencies, serverUrl, installPath);
                installationStage = 'downloadAndInstallPackages';
                yield PackageManager_1.DownloadAndInstallPackages(packages, this.networkSettingsProvider, this.platformInfo, this.eventStream, this.extensionPath);
                this.eventStream.post(new loggingEvents_1.InstallationSuccess());
            }
            catch (error) {
                this.eventStream.post(new loggingEvents_1.InstallationFailure(installationStage, error));
                throw error; // throw the error up to the server
            }
        });
    }
    GetLatestVersion(serverUrl, latestVersionFileServerPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let description = "Latest OmniSharp Version Information";
            let url = `${serverUrl}/${latestVersionFileServerPath}`;
            try {
                this.eventStream.post(new loggingEvents_1.LatestBuildDownloadStart());
                let versionBuffer = yield FileDownloader_1.DownloadFile(description, this.eventStream, this.networkSettingsProvider, url);
                return versionBuffer.toString('utf8');
            }
            catch (error) {
                this.eventStream.post(new loggingEvents_1.InstallationFailure('getLatestVersionInfoFile', error));
                throw error;
            }
        });
    }
}
exports.OmnisharpDownloader = OmnisharpDownloader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwRG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvT21uaXNoYXJwRG93bmxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsdUVBQW1FO0FBRW5FLG1EQUEySTtBQUczSSxxRUFBOEU7QUFDOUUscUVBQWdFO0FBRWhFO0lBRUksWUFDWSx1QkFBZ0QsRUFDaEQsV0FBd0IsRUFDeEIsV0FBZ0IsRUFDaEIsWUFBaUMsRUFDakMsYUFBcUI7UUFKckIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtRQUNoRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixnQkFBVyxHQUFYLFdBQVcsQ0FBSztRQUNoQixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDakMsa0JBQWEsR0FBYixhQUFhLENBQVE7SUFDakMsQ0FBQztJQUVZLDJCQUEyQixDQUFDLE9BQWUsRUFBRSxTQUFpQixFQUFFLFdBQW1COztZQUM1RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFtQixDQUFDLHVCQUF1QixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFFM0IsSUFBSTtnQkFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLCtCQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQzlELGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO2dCQUNyQyxJQUFJLFFBQVEsR0FBRyxnREFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzdHLGlCQUFpQixHQUFHLDRCQUE0QixDQUFDO2dCQUNqRCxNQUFNLDJDQUEwQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbEksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBbUIsRUFBRSxDQUFDLENBQUM7YUFDcEQ7WUFDRCxPQUFPLEtBQUssRUFBRTtnQkFDVixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFtQixDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sS0FBSyxDQUFDLENBQUEsbUNBQW1DO2FBQ2xEO1FBQ0wsQ0FBQztLQUFBO0lBRVksZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSwyQkFBbUM7O1lBQ2hGLElBQUksV0FBVyxHQUFHLHNDQUFzQyxDQUFDO1lBQ3pELElBQUksR0FBRyxHQUFHLEdBQUcsU0FBUyxJQUFJLDJCQUEyQixFQUFFLENBQUM7WUFDeEQsSUFBSTtnQkFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLHdDQUF3QixFQUFFLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxhQUFhLEdBQUcsTUFBTSw2QkFBWSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekcsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsT0FBTyxLQUFLLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBbUIsQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNsRixNQUFNLEtBQUssQ0FBQzthQUNmO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUF6Q0Qsa0RBeUNDIn0=