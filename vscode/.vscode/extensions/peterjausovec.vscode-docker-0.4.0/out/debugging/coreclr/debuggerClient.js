"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultDebuggerClient {
    constructor(vsdbgClient) {
        this.vsdbgClient = vsdbgClient;
    }
    async getDebugger(os) {
        return await this.vsdbgClient.getVsDbgVersion(DefaultDebuggerClient.debuggerVersion, os === 'Windows' ? DefaultDebuggerClient.debuggerWindowsRuntime : DefaultDebuggerClient.debuggerLinuxRuntime);
    }
}
DefaultDebuggerClient.debuggerVersion = 'vs2017u5';
DefaultDebuggerClient.debuggerLinuxRuntime = 'debian.8-x64';
DefaultDebuggerClient.debuggerWindowsRuntime = 'win7-x64';
exports.DefaultDebuggerClient = DefaultDebuggerClient;
//# sourceMappingURL=debuggerClient.js.map