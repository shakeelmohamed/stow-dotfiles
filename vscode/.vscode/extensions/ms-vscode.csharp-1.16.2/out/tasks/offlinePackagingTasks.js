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
        yield PackageManager_1.DownloadAndInstallPackages(runTimeDependencies, provider, platformInfo, eventStream, projectPaths_1.codeExtensionPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZVBhY2thZ2luZ1Rhc2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGFza3Mvb2ZmbGluZVBhY2thZ2luZ1Rhc2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQUViLHVEQUF1RDtBQUN2RCwyQkFBMkI7QUFDM0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0Isa0RBQTJDO0FBQzNDLHdEQUFxSTtBQUNySSxnRkFBNkU7QUFDN0Usb0RBQWlEO0FBQ2pELHNEQUFzRDtBQUN0RCwwQ0FBdUM7QUFDdkMsOENBQXNEO0FBQ3RELHlFQUFrRjtBQUNsRiw0REFBcUQ7QUFDckQsb0VBQTRFO0FBQzVFLHdFQUFtRTtBQUVuRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQVMsRUFBRTtJQUN6QyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUFnQixDQUFDLENBQUM7SUFFM0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxzQ0FBdUIsRUFBRSwrQkFBZ0IsQ0FBQyxDQUFDO0lBRTNELElBQUk7UUFDQSxNQUFNLGdCQUFnQixFQUFFLENBQUM7S0FDNUI7WUFDTztRQUNKLEdBQUcsQ0FBQywrQkFBZ0IsQ0FBQyxDQUFDO0tBQ3pCO0FBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVIOztRQUNJLElBQUkseUNBQWtCLENBQUMsVUFBVSxFQUFFO1lBQy9CLDhEQUE4RDtZQUM5RCxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEI7YUFDSTtZQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNuQjtRQUVELE1BQU0sV0FBVyxHQUFHLDRCQUFjLEVBQUUsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSxX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