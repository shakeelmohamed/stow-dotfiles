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
const cp = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
let extensionPath;
function setExtensionPath(path) {
    extensionPath = path;
}
exports.setExtensionPath = setExtensionPath;
function getExtensionPath() {
    if (!extensionPath) {
        throw new Error('Failed to set extension path');
    }
    return extensionPath;
}
exports.getExtensionPath = getExtensionPath;
function isBoolean(obj) {
    return obj === true || obj === false;
}
exports.isBoolean = isBoolean;
function sum(arr, selector) {
    return arr.reduce((prev, curr) => prev + selector(curr), 0);
}
exports.sum = sum;
/** Retrieve the length of an array. Returns 0 if the array is `undefined`. */
function safeLength(arr) {
    return arr ? arr.length : 0;
}
exports.safeLength = safeLength;
function buildPromiseChain(array, builder) {
    return __awaiter(this, void 0, void 0, function* () {
        return array.reduce((promise, n) => __awaiter(this, void 0, void 0, function* () { return promise.then(() => __awaiter(this, void 0, void 0, function* () { return builder(n); })); }), Promise.resolve(null));
    });
}
exports.buildPromiseChain = buildPromiseChain;
function execChildProcess(command, workingDirectory = getExtensionPath()) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            cp.exec(command, { cwd: workingDirectory, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else if (stderr && stderr.length > 0) {
                    reject(new Error(stderr));
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
}
exports.execChildProcess = execChildProcess;
function getUnixChildProcessIds(pid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let ps = cp.exec('ps -A -o ppid,pid', (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                if (stderr) {
                    return reject(stderr);
                }
                if (!stdout) {
                    return resolve([]);
                }
                let lines = stdout.split(os.EOL);
                let pairs = lines.map(line => line.trim().split(/\s+/));
                let children = [];
                for (let pair of pairs) {
                    let ppid = parseInt(pair[0]);
                    if (ppid === pid) {
                        children.push(parseInt(pair[1]));
                    }
                }
                resolve(children);
            });
            ps.on('error', reject);
        });
    });
}
exports.getUnixChildProcessIds = getUnixChildProcessIds;
function fileExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (stats && stats.isFile()) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    });
}
exports.fileExists = fileExists;
function deleteIfExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return fileExists(filePath)
            .then((exists) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!exists) {
                    return resolve();
                }
                fs.unlink(filePath, err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }));
    });
}
exports.deleteIfExists = deleteIfExists;
var InstallFileType;
(function (InstallFileType) {
    InstallFileType[InstallFileType["Begin"] = 0] = "Begin";
    InstallFileType[InstallFileType["Lock"] = 1] = "Lock";
})(InstallFileType = exports.InstallFileType || (exports.InstallFileType = {}));
function getInstallFilePath(type) {
    let installFile = 'install.' + InstallFileType[type];
    return path.resolve(getExtensionPath(), installFile);
}
function installFileExists(type) {
    return __awaiter(this, void 0, void 0, function* () {
        return fileExists(getInstallFilePath(type));
    });
}
exports.installFileExists = installFileExists;
function touchInstallFile(type) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.writeFile(getInstallFilePath(type), '', err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
exports.touchInstallFile = touchInstallFile;
function deleteInstallFile(type) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.unlink(getInstallFilePath(type), err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
exports.deleteInstallFile = deleteInstallFile;
function convertNativePathToPosix(pathString) {
    let parts = pathString.split(path.sep);
    return parts.join(path.posix.sep);
}
exports.convertNativePathToPosix = convertNativePathToPosix;
/**
 * This function checks to see if a subfolder is part of folder.
 *
 * Assumes subfolder and folder are absolute paths and have consistent casing.
 *
 * @param subfolder subfolder to check if it is part of the folder parameter
 * @param folder folder to check aganist
 */
function isSubfolderOf(subfolder, folder) {
    const subfolderArray = subfolder.split(path.sep);
    const folderArray = folder.split(path.sep);
    // Check to see that every sub directory in subfolder exists in folder.
    return subfolderArray.length <= folderArray.length && subfolderArray.every((subpath, index) => folderArray[index] === subpath);
}
exports.isSubfolderOf = isSubfolderOf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qix5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLElBQUksYUFBcUIsQ0FBQztBQUUxQiwwQkFBaUMsSUFBWTtJQUN6QyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLENBQUM7QUFGRCw0Q0FFQztBQUVEO0lBQ0ksSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7S0FDbkQ7SUFFRCxPQUFPLGFBQWEsQ0FBQztBQUN6QixDQUFDO0FBTkQsNENBTUM7QUFFRCxtQkFBMEIsR0FBUTtJQUM5QixPQUFPLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztBQUN6QyxDQUFDO0FBRkQsOEJBRUM7QUFFRCxhQUF1QixHQUFRLEVBQUUsUUFBNkI7SUFDMUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRkQsa0JBRUM7QUFFRCw4RUFBOEU7QUFDOUUsb0JBQThCLEdBQW9CO0lBQzlDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELGdDQUVDO0FBRUQsMkJBQW9ELEtBQVUsRUFBRSxPQUFzQzs7UUFDbEcsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUNmLENBQU8sT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLGdEQUFDLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFTLEVBQUUs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