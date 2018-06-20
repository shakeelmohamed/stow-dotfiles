/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debugUtil = require("../src/coreclr-debug/util");
const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const path = require("path");
const util = require("../src/common");
const spawnNode_1 = require("../tasks/spawnNode");
const projectPaths_1 = require("../tasks/projectPaths");
const CsharpLoggerObserver_1 = require("../src/observers/CsharpLoggerObserver");
const EventStream_1 = require("../src/EventStream");
const packageJson_1 = require("../tasks/packageJson");
const logger_1 = require("../src/logger");
const platform_1 = require("../src/platform");
const PackageManager_1 = require("../src/packageManager/PackageManager");
const NetworkSettings_1 = require("../src/NetworkSettings");
const CSharpExtDownloader_1 = require("../src/CSharpExtDownloader");
const commandLineArguments_1 = require("../tasks/commandLineArguments");
gulp.task('vsix:offline:package', () => __awaiter(this, void 0, void 0, function* () {
    del.sync(projectPaths_1.vscodeignorePath);
    fs.copyFileSync(projectPaths_1.offlineVscodeignorePath, projectPaths_1.vscodeignorePath);
    try {
        yield doPackageOffline();
    }
    finally {
        del(projectPaths_1.vscodeignorePath);
    }
}));
function doPackageOffline() {
    return __awaiter(this, void 0, void 0, function* () {
        if (commandLineArguments_1.commandLineOptions.retainVsix) {
            //if user doesnot want to clean up the existing vsix packages	
            cleanSync(false);
        }
        else {
            cleanSync(true);
        }
        util.setExtensionPath(projectPaths_1.codeExtensionPath);
        const packageJSON = packageJson_1.getPackageJSON();
        const name = packageJSON.name;
        const version = packageJSON.version;
        const packageName = name + '.' + version;
        const packages = [
            new platform_1.PlatformInformation('win32', 'x86_64'),
            new platform_1.PlatformInformation('darwin', 'x86_64'),
            new platform_1.PlatformInformation('linux', 'x86_64')
        ];
        for (let platformInfo of packages) {
            yield doOfflinePackage(platformInfo, packageName, packageJSON, projectPaths_1.packedVsixOutputRoot);
        }
    });
}
function cleanSync(deleteVsix) {
    del.sync('install.*');
    del.sync('.omnisharp*');
    del.sync('.debugger');
    if (deleteVsix) {
        del.sync('*.vsix');
    }
}
function doOfflinePackage(platformInfo, packageName, packageJSON, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.platform === 'win32') {
            throw new Error('Do not build offline packages on windows. Runtime executables will not be marked executable in *nix packages.');
        }
        cleanSync(false);
        const packageFileName = `${packageName}-${platformInfo.platform}-${platformInfo.architecture}.vsix`;
        yield install(platformInfo, packageJSON);
        yield doPackageSync(packageFileName, outputFolder);
    });
}
// Install Tasks
function install(platformInfo, packageJSON) {
    return __awaiter(this, void 0, void 0, function* () {
        let eventStream = new EventStream_1.EventStream();
        const logger = new logger_1.Logger(message => process.stdout.write(message));
        let stdoutObserver = new CsharpLoggerObserver_1.CsharpLoggerObserver(logger);
        eventStream.subscribe(stdoutObserver.post);
        const debuggerUtil = new debugUtil.CoreClrDebugUtil(path.resolve('.'));
        let runTimeDependencies = CSharpExtDownloader_1.GetRunTimeDependenciesPackages(packageJSON);
        let provider = () => new NetworkSettings_1.default(undefined, undefined);
        yield PackageManager_1.DownloadAndInstallPackages(runTimeDependencies, provider, platformInfo, eventStream);
        yield debugUtil.CoreClrDebugUtil.writeEmptyFile(debuggerUtil.installCompleteFilePath());
    });
}
/// Packaging (VSIX) Tasks
function doPackageSync(packageName, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let vsceArgs = [];
        vsceArgs.push(projectPaths_1.vscePath);
        vsceArgs.push('package'); // package command
        if (packageName !== undefined) {
            vsceArgs.push('-o');
            if (outputFolder) {
                //if we have specified an output folder then put the files in that output folder
                vsceArgs.push(path.join(outputFolder, packageName));
            }
            else {
                vsceArgs.push(packageName);
            }
        }
        return spawnNode_1.default(vsceArgs);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZVBhY2thZ2luZ1Rhc2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGFza3Mvb2ZmbGluZVBhY2thZ2luZ1Rhc2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQUViLHVEQUF1RDtBQUN2RCwyQkFBMkI7QUFDM0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0Isc0NBQXNDO0FBQ3RDLGtEQUEyQztBQUMzQyx3REFBcUk7QUFDckksZ0ZBQTZFO0FBQzdFLG9EQUFpRDtBQUNqRCxzREFBc0Q7QUFDdEQsMENBQXVDO0FBQ3ZDLDhDQUFzRDtBQUN0RCx5RUFBa0Y7QUFDbEYsNERBQXFEO0FBQ3JELG9FQUE0RTtBQUM1RSx3RUFBbUU7QUFFbkUsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxHQUFTLEVBQUU7SUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBZ0IsQ0FBQyxDQUFDO0lBRTNCLEVBQUUsQ0FBQyxZQUFZLENBQUMsc0NBQXVCLEVBQUUsK0JBQWdCLENBQUMsQ0FBQztJQUUzRCxJQUFJO1FBQ0EsTUFBTSxnQkFBZ0IsRUFBRSxDQUFDO0tBQzVCO1lBQ087UUFDSixHQUFHLENBQUMsK0JBQWdCLENBQUMsQ0FBQztLQUN6QjtBQUNMLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSDs7UUFDSSxJQUFJLHlDQUFrQixDQUFDLFVBQVUsRUFBRTtZQUMvQiw4REFBOEQ7WUFDOUQsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BCO2FBQ0k7WUFDRCxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkI7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWlCLENBQUMsQ0FBQztRQUN6QyxNQUFNLFdBQVcsR0FBRyw0QkFBYyxFQUFFLENBQUM7UUFDckMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUks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