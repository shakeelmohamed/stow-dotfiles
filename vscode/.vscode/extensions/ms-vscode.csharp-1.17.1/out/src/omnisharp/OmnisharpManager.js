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
const path = require("path");
const semver = require("semver");
const util = require("../common");
class OmnisharpManager {
    constructor(downloader, platformInfo) {
        this.downloader = downloader;
        this.platformInfo = platformInfo;
    }
    GetOmniSharpLaunchInfo(defaultOmnisharpVersion, omnisharpPath, serverUrl, latestVersionFileServerPath, installPath, extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!omnisharpPath) {
                // If omnisharpPath was not specified, return the default path.
                let basePath = path.resolve(extensionPath, '.omnisharp', defaultOmnisharpVersion);
                return this.GetLaunchInfo(this.platformInfo, basePath);
            }
            // Looks at the options path, installs the dependencies and returns the path to be loaded by the omnisharp server
            if (path.isAbsolute(omnisharpPath)) {
                if (!(yield util.fileExists(omnisharpPath))) {
                    throw new Error('The system could not find the specified path');
                }
                return {
                    LaunchPath: omnisharpPath
                };
            }
            else if (omnisharpPath === 'latest') {
                return yield this.InstallLatestAndReturnLaunchInfo(serverUrl, latestVersionFileServerPath, installPath, extensionPath);
            }
            // If the path is neither a valid path on disk not the string "latest", treat it as a version 
            return yield this.InstallVersionAndReturnLaunchInfo(omnisharpPath, serverUrl, installPath, extensionPath);
        });
    }
    InstallLatestAndReturnLaunchInfo(serverUrl, latestVersionFileServerPath, installPath, extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let version = yield this.downloader.GetLatestVersion(serverUrl, latestVersionFileServerPath);
            return yield this.InstallVersionAndReturnLaunchInfo(version, serverUrl, installPath, extensionPath);
        });
    }
    InstallVersionAndReturnLaunchInfo(version, serverUrl, installPath, extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (semver.valid(version)) {
                yield this.downloader.DownloadAndInstallOmnisharp(version, serverUrl, installPath);
                return this.GetLaunchPathForVersion(this.platformInfo, version, installPath, extensionPath);
            }
            else {
                throw new Error(`Invalid OmniSharp version - ${version}`);
            }
        });
    }
    GetLaunchPathForVersion(platformInfo, version, installPath, extensionPath) {
        if (!version) {
            throw new Error('Invalid Version');
        }
        let basePath = path.resolve(extensionPath, installPath, version);
        return this.GetLaunchInfo(platformInfo, basePath);
    }
    GetLaunchInfo(platformInfo, basePath) {
        if (platformInfo.isWindows()) {
            return {
                LaunchPath: path.join(basePath, 'OmniSharp.exe')
            };
        }
        return {
            LaunchPath: path.join(basePath, 'run'),
            MonoLaunchPath: path.join(basePath, 'omnisharp', 'OmniSharp.exe')
        };
    }
}
exports.OmnisharpManager = OmnisharpManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvT21uaXNoYXJwTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxrQ0FBa0M7QUFTbEM7SUFDSSxZQUNZLFVBQStCLEVBQy9CLFlBQWlDO1FBRGpDLGVBQVUsR0FBVixVQUFVLENBQXFCO1FBQy9CLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtJQUM3QyxDQUFDO0lBRVksc0JBQXNCLENBQUMsdUJBQStCLEVBQUUsYUFBcUIsRUFBRSxTQUFpQixFQUFFLDJCQUFtQyxFQUFFLFdBQW1CLEVBQUUsYUFBcUI7O1lBQzFMLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ2hCLCtEQUErRDtnQkFDL0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBQ2xGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzFEO1lBRUQsaUhBQWlIO1lBQ2pILElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFBLEVBQUU7b0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztpQkFDbkU7Z0JBRUQsT0FBTztvQkFDSCxVQUFVLEVBQUUsYUFBYTtpQkFDNUIsQ0FBQzthQUNMO2lCQUNJLElBQUksYUFBYSxLQUFLLFFBQVEsRUFBRTtnQkFDakMsT0FBTyxNQUFNLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTLEVBQUUsMkJBQTJCLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzFIO1lBRUQsOEZBQThGO1lBQzlGLE9BQU8sTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDOUcsQ0FBQztLQUFBO0lBRWEsZ0NBQWdDLENBQUMsU0FBaUIsRUFBRSwyQkFBbUMsRUFBRSxXQUFtQixFQUFFLGFBQXFCOztZQUM3SSxJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLDJCQUEyQixDQUFDLENBQUM7WUFDN0YsT0FBTyxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN4RyxDQUFDO0tBQUE7SUFFYSxpQ0FBaUMsQ0FBQyxPQUFlLEVBQUUsU0FBaUIsRUFBRSxXQUFtQixFQUFFLGFBQXFCOztZQUMxSCxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNuRixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDL0Y7aUJBQ0k7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUM3RDtRQUNMLENBQUM7S0FBQTtJQUVPLHVCQUF1QixDQUFDLFlBQWlDLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsYUFBcUI7UUFDMUgsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN0QztRQUVELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTyxhQUFhLENBQUMsWUFBaUMsRUFBRSxRQUFnQjtRQUNyRSxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUMxQixPQUFPO2dCQUNILFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUM7YUFDbkQsQ0FBQztTQUNMO1FBRUQsT0FBTztZQUNILFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUM7WUFDdEMsY0FBYyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUM7U0FDcEUsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQXBFRCw0Q0FvRUMifQ==