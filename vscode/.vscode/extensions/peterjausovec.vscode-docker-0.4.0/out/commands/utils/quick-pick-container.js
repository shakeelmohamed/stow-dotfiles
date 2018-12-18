"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const dockerConnectionError_1 = require("../../explorer/utils/dockerConnectionError");
const extensionVariables_1 = require("../../extensionVariables");
const docker_endpoint_1 = require("./docker-endpoint");
function createItem(container) {
    return {
        label: container.Image,
        containerDesc: container
    };
}
function computeItems(containers, includeAll) {
    const items = [];
    for (let container of containers) {
        const item = createItem(container);
        items.push(item);
    }
    if (includeAll && containers.length > 0) {
        items.unshift({
            label: 'All Containers',
            allContainers: true
        });
    }
    return items;
}
async function quickPickContainer(actionContext, includeAll = false, opts) {
    let properties = actionContext.properties;
    let containers;
    // "status": ["created", "restarting", "running", "paused", "exited", "dead"]
    if (!opts) {
        opts = {
            "filters": {
                "status": ["running"]
            }
        };
    }
    try {
        containers = await docker_endpoint_1.docker.getContainerDescriptors(opts);
    }
    catch (err) {
        dockerConnectionError_1.throwDockerConnectionError(actionContext, err);
    }
    if (containers.length === 0) {
        throw new Error('There are no Docker containers that apply to this command.');
    }
    else {
        const items = computeItems(containers, includeAll);
        let response = await extensionVariables_1.ext.ui.showQuickPick(items, { placeHolder: 'Choose container...' });
        properties.allContainers = includeAll ? String(response.allContainers) : undefined;
        return response;
    }
}
exports.quickPickContainer = quickPickContainer;
//# sourceMappingURL=quick-pick-container.js.map