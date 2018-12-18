"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const extensionVariables_1 = require("../extensionVariables");
// Minimum Windows RS3 version number
const windows10RS3MinVersion = '10.0.16299';
// Minimum Windows RS4 version number
const windows10RS4MinVersion = '10.0.17134';
function isWindows() {
    return extensionVariables_1.ext.os.platform === 'win32';
}
exports.isWindows = isWindows;
function isWindows10RS4OrNewer() {
    if (!isWindows()) {
        return false;
    }
    return semver.gte(extensionVariables_1.ext.os.release, windows10RS4MinVersion);
}
exports.isWindows10RS4OrNewer = isWindows10RS4OrNewer;
function isWindows10RS3OrNewer() {
    if (!isWindows()) {
        return false;
    }
    return semver.gte(extensionVariables_1.ext.os.release, windows10RS3MinVersion);
}
exports.isWindows10RS3OrNewer = isWindows10RS3OrNewer;
function isLinux() {
    return !isMac() && !isWindows();
}
exports.isLinux = isLinux;
function isMac() {
    return extensionVariables_1.ext.os.platform === 'darwin';
}
exports.isMac = isMac;
//# sourceMappingURL=osVersion.js.map