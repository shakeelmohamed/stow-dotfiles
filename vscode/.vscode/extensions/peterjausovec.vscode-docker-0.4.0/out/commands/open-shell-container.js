"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const containerNode_1 = require("../explorer/models/containerNode");
const extensionVariables_1 = require("../extensionVariables");
const docker_endpoint_1 = require("./utils/docker-endpoint");
const quick_pick_container_1 = require("./utils/quick-pick-container");
const teleCmdId = 'vscode-docker.container.open-shell';
function getEngineTypeShellCommands(engineType) {
    const configOptions = vscode.workspace.getConfiguration('docker');
    switch (engineType) {
        case docker_endpoint_1.DockerEngineType.Linux:
            return configOptions.get('attachShellCommand.linuxContainer');
        case docker_endpoint_1.DockerEngineType.Windows:
            return configOptions.get('attachShellCommand.windowsContainer');
        default:
            throw new Error(`Unexpected engine type ${engineType}`);
    }
}
async function openShellContainer(actionContext, context) {
    let containerToAttach;
    if (context instanceof containerNode_1.ContainerNode && context.containerDesc) {
        containerToAttach = context.containerDesc;
    }
    else {
        const opts = {
            "filters": {
                "status": ["running"]
            }
        };
        const selectedItem = await quick_pick_container_1.quickPickContainer(actionContext, false, opts);
        if (selectedItem) {
            containerToAttach = selectedItem.containerDesc;
        }
    }
    if (containerToAttach) {
        let engineType = await docker_endpoint_1.docker.getEngineType();
        actionContext.properties.engineType = docker_endpoint_1.DockerEngineType[engineType];
        const shellCommand = getEngineTypeShellCommands(engineType);
        actionContext.properties.shellCommand = shellCommand;
        const terminal = extensionVariables_1.ext.terminalProvider.createTerminal(`Shell: ${containerToAttach.Image}`);
        terminal.sendText(`docker exec -it ${containerToAttach.Id} ${shellCommand}`);
        terminal.show();
    }
}
exports.openShellContainer = openShellContainer;
//# sourceMappingURL=open-shell-container.js.map