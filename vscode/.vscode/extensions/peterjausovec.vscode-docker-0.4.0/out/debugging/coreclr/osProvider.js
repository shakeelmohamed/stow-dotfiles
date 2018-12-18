"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
class LocalOSProvider {
    get homedir() {
        return os.homedir();
    }
    get isMac() {
        return os.platform() === 'darwin';
    }
    get os() {
        return os.platform() === 'win32' ? 'Windows' : 'Linux';
    }
    get tmpdir() {
        return os.tmpdir();
    }
    pathJoin(pathOS, ...paths) {
        return pathOS === 'Windows' ? path.win32.join(...paths) : path.posix.join(...paths);
    }
    pathNormalize(pathOS, rawPath) {
        return rawPath.replace(pathOS === 'Windows' ? /\//g : /\\/g, pathOS === 'Windows' ? '\\' : '/');
    }
}
exports.LocalOSProvider = LocalOSProvider;
exports.default = LocalOSProvider;
//# sourceMappingURL=osProvider.js.map