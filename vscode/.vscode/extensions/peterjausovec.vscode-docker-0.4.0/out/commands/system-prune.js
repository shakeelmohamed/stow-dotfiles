"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const vscode = require("vscode");
const dockerConnectionError_1 = require("../explorer/utils/dockerConnectionError");
const extensionVariables_1 = require("../extensionVariables");
const docker_endpoint_1 = require("./utils/docker-endpoint");
async function systemPrune(actionContext) {
    const configOptions = vscode.workspace.getConfiguration('docker');
    const terminal = extensionVariables_1.ext.terminalProvider.createTerminal("docker system prune");
    try {
        if (configOptions.get('promptOnSystemPrune', true)) {
            let res = await vscode.window.showWarningMessage('Remove all unused containers, volumes, networks and images (both dangling and unreferenced)?', { title: 'Yes' }, { title: 'Cancel', isCloseAffordance: true });
            if (!res || res.isCloseAffordance) {
                return;
            }
        }
        // EngineInfo in dockerode is incomplete
        const info = await docker_endpoint_1.docker.getEngineInfo();
        // in docker 17.06.1 and higher you must specify the --volumes flag
        if (semver.gte(info.ServerVersion, '17.6.1', true)) {
            terminal.sendText(`docker system prune --volumes -f`);
        }
        else {
            terminal.sendText(`docker system prune -f`);
        }
        terminal.show();
    }
    catch (error) {
        dockerConnectionError_1.throwDockerConnectionError(actionContext, error);
    }
}
exports.systemPrune = systemPrune;
//# sourceMappingURL=system-prune.js.map