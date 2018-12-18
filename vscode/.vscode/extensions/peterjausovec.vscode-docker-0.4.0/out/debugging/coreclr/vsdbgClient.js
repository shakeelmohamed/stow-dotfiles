"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const process = require("process");
const extensionVariables_1 = require("../../extensionVariables");
class RemoteVsDbgClient {
    constructor(dockerOutputManager, fileSystemProvider, globalState, osProvider, processProvider) {
        this.dockerOutputManager = dockerOutputManager;
        this.fileSystemProvider = fileSystemProvider;
        this.globalState = globalState;
        this.processProvider = processProvider;
        this.vsdbgPath = path.join(osProvider.homedir, '.vsdbg');
        this.options = osProvider.os === 'Windows'
            ? {
                name: 'GetVsDbg.ps1',
                url: 'https://aka.ms/getvsdbgps1',
                getAcquisitionCommand: async (vsdbgAcquisitionScriptPath, version, runtime, vsdbgVersionPath) => {
                    const powershellCommand = `${process.env[RemoteVsDbgClient.winDir]}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;
                    return await Promise.resolve(`${powershellCommand} -NonInteractive -NoProfile -WindowStyle Hidden -ExecutionPolicy RemoteSigned -File \"${vsdbgAcquisitionScriptPath}\" -Version ${version} -RuntimeID ${runtime} -InstallPath \"${vsdbgVersionPath}\"`);
                }
            }
            : {
                name: 'getvsdbg.sh',
                url: 'https://aka.ms/getvsdbgsh',
                getAcquisitionCommand: async (vsdbgAcquisitionScriptPath, version, runtime, vsdbgVersionPath) => {
                    return await Promise.resolve(`${vsdbgAcquisitionScriptPath} -v ${version} -r ${runtime} -l \"${vsdbgVersionPath}\"`);
                },
                onScriptAcquired: async (scriptPath) => {
                    await this.processProvider.exec(`chmod +x \"${scriptPath}\"`, { cwd: this.vsdbgPath });
                }
            };
    }
    async getVsDbgVersion(version, runtime) {
        const vsdbgVersionPath = path.join(this.vsdbgPath, runtime, version);
        const vsdbgVersionExists = await this.fileSystemProvider.dirExists(vsdbgVersionPath);
        if (vsdbgVersionExists && await this.isUpToDate(this.lastDebuggerAcquisitionKey(version, runtime))) {
            // The debugger is up to date...
            return vsdbgVersionPath;
        }
        return await this.dockerOutputManager.performOperation('Acquiring the latest .NET Core debugger...', async () => {
            await this.getVsDbgAcquisitionScript();
            const vsdbgAcquisitionScriptPath = path.join(this.vsdbgPath, this.options.name);
            const acquisitionCommand = await this.options.getAcquisitionCommand(vsdbgAcquisitionScriptPath, version, runtime, vsdbgVersionPath);
            await this.processProvider.exec(acquisitionCommand, { cwd: this.vsdbgPath });
            await this.updateDate(this.lastDebuggerAcquisitionKey(version, runtime), new Date());
            return vsdbgVersionPath;
        }, 'Debugger acquired.', 'Unable to acquire the .NET Core debugger.');
    }
    async getVsDbgAcquisitionScript() {
        const vsdbgAcquisitionScriptPath = path.join(this.vsdbgPath, this.options.name);
        const acquisitionScriptExists = await this.fileSystemProvider.fileExists(vsdbgAcquisitionScriptPath);
        if (acquisitionScriptExists && await this.isUpToDate(this.lastScriptAcquisitionKey)) {
            // The acquisition script is up to date...
            return;
        }
        const directoryExists = await this.fileSystemProvider.dirExists(this.vsdbgPath);
        if (!directoryExists) {
            await this.fileSystemProvider.makeDir(this.vsdbgPath);
        }
        const script = await extensionVariables_1.ext.request(this.options.url);
        await this.fileSystemProvider.writeFile(vsdbgAcquisitionScriptPath, script);
        if (this.options.onScriptAcquired) {
            await this.options.onScriptAcquired(vsdbgAcquisitionScriptPath);
        }
        await this.updateDate(this.lastScriptAcquisitionKey, new Date());
    }
    async isUpToDate(key) {
        const lastAcquisitionDate = await this.getDate(key);
        if (lastAcquisitionDate) {
            let aquisitionExpirationDate = new Date(lastAcquisitionDate);
            aquisitionExpirationDate.setDate(lastAcquisitionDate.getDate() + 1);
            if (aquisitionExpirationDate.valueOf() > new Date().valueOf()) {
                // The acquisition is up to date...
                return true;
            }
        }
        return false;
    }
    get lastScriptAcquisitionKey() {
        return `${RemoteVsDbgClient.stateKey}.lastScriptAcquisition`;
    }
    lastDebuggerAcquisitionKey(version, runtime) {
        return `${RemoteVsDbgClient.stateKey}.lastDebuggerAcquisition(${version}, ${runtime})`;
    }
    async getDate(key) {
        const dateString = this.globalState.get(key);
        return await Promise.resolve(dateString ? new Date(dateString) : undefined);
    }
    async updateDate(key, timestamp) {
        await this.globalState.update(key, timestamp);
    }
}
RemoteVsDbgClient.stateKey = 'RemoteVsDbgClient';
RemoteVsDbgClient.winDir = 'WINDIR';
exports.RemoteVsDbgClient = RemoteVsDbgClient;
//# sourceMappingURL=vsdbgClient.js.map