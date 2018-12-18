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
const fs = require("fs");
const semver = require("semver");
const os = require("os");
const common_1 = require("./../common");
const MINIMUM_SUPPORTED_DOTNET_CLI = '1.0.0-preview2-003121';
class DotnetInfo {
}
exports.DotnetInfo = DotnetInfo;
class DotNetCliError extends Error {
}
exports.DotNetCliError = DotNetCliError;
class CoreClrDebugUtil {
    constructor(extensionDir) {
        this._extensionDir = '';
        this._debugAdapterDir = '';
        this._installCompleteFilePath = '';
        this._extensionDir = extensionDir;
        this._debugAdapterDir = path.join(this._extensionDir, '.debugger');
        this._installCompleteFilePath = path.join(this._debugAdapterDir, 'install.complete');
    }
    extensionDir() {
        if (this._extensionDir === '') {
            throw new Error('Failed to set extension directory');
        }
        return this._extensionDir;
    }
    debugAdapterDir() {
        if (this._debugAdapterDir === '') {
            throw new Error('Failed to set debugadpter directory');
        }
        return this._debugAdapterDir;
    }
    installCompleteFilePath() {
        if (this._installCompleteFilePath === '') {
            throw new Error('Failed to set install complete file path');
        }
        return this._installCompleteFilePath;
    }
    static writeEmptyFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.writeFile(path, '', (err) => {
                    if (err) {
                        reject(err.code);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    defaultDotNetCliErrorMessage() {
        return 'Failed to find up to date dotnet cli on the path.';
    }
    // This function checks for the presence of dotnet on the path and ensures the Version
    // is new enough for us. 
    // Returns: a promise that returns a DotnetInfo class
    // Throws: An DotNetCliError() from the return promise if either dotnet does not exist or is too old. 
    checkDotNetCli() {
        return __awaiter(this, void 0, void 0, function* () {
            let dotnetInfo = new DotnetInfo();
            return common_1.execChildProcess('dotnet --info', process.cwd())
                .then((data) => {
                let lines = data.replace(/\r/mg, '').split('\n');
                lines.forEach(line => {
                    let match;
                    if (match = /^\ Version:\s*([^\s].*)$/.exec(line)) {
                        dotnetInfo.Version = match[1];
                    }
                    else if (match = /^\ OS Version:\s*([^\s].*)$/.exec(line)) {
                        dotnetInfo.OsVersion = match[1];
                    }
                    else if (match = /^\ RID:\s*([\w\-\.]+)$/.exec(line)) {
                        dotnetInfo.RuntimeId = match[1];
                    }
                });
            }).catch((error) => {
                // something went wrong with spawning 'dotnet --info'
                let dotnetError = new DotNetCliError();
                dotnetError.ErrorMessage = 'The .NET CLI tools cannot be located. .NET Core debugging will not be enabled. Make sure .NET CLI tools are installed and are on the path.';
                dotnetError.ErrorString = "Failed to spawn 'dotnet --info'";
                throw dotnetError;
            }).then(() => {
                // succesfully spawned 'dotnet --info', check the Version
                if (semver.lt(dotnetInfo.Version, MINIMUM_SUPPORTED_DOTNET_CLI)) {
                    let dotnetError = new DotNetCliError();
                    dotnetError.ErrorMessage = 'The .NET CLI tools on the path are too old. .NET Core debugging will not be enabled. The minimum supported version is ' + MINIMUM_SUPPORTED_DOTNET_CLI + '.';
                    dotnetError.ErrorString = "dotnet cli is too old";
                    throw dotnetError;
                }
                return dotnetInfo;
            });
        });
    }
    static isMacOSSupported() {
        // .NET Core 2.0 requires macOS 10.12 (Sierra), which is Darwin 16.0+
        // Darwin version chart: https://en.wikipedia.org/wiki/Darwin_(operating_system)
        return semver.gte(os.release(), "16.0.0");
    }
    static existsSync(path) {
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return true;
        }
        catch (err) {
            if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                return false;
            }
            else {
                throw Error(err.code);
            }
        }
    }
    static getPlatformExeExtension() {
        if (process.platform === 'win32') {
            return '.exe';
        }
        return '';
    }
}
exports.CoreClrDebugUtil = CoreClrDebugUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlY2xyLWRlYnVnL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIsaUNBQWlDO0FBQ2pDLHlCQUF5QjtBQUN6Qix3Q0FBK0M7QUFFL0MsTUFBTSw0QkFBNEIsR0FBVyx1QkFBdUIsQ0FBQztBQUVyRTtDQUtDO0FBTEQsZ0NBS0M7QUFFRCxvQkFBNEIsU0FBUSxLQUFLO0NBR3hDO0FBSEQsd0NBR0M7QUFFRDtJQU1JLFlBQVksWUFBb0I7UUFKeEIsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFDM0IscUJBQWdCLEdBQVcsRUFBRSxDQUFDO1FBQzlCLDZCQUF3QixHQUFXLEVBQUUsQ0FBQztRQUcxQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFTSxZQUFZO1FBQ2YsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLEVBQUUsRUFDN0I7WUFDSSxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7U0FDeEQ7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDOUIsQ0FBQztJQUVNLGVBQWU7UUFDbEIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssRUFBRSxFQUFFO1lBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUMxRDtRQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lB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