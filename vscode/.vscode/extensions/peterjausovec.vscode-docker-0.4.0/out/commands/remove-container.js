"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const dockerExtension_1 = require("../dockerExtension");
const containerNode_1 = require("../explorer/models/containerNode");
const telemetry_1 = require("../telemetry/telemetry");
const docker_endpoint_1 = require("./utils/docker-endpoint");
const quick_pick_container_1 = require("./utils/quick-pick-container");
const teleCmdId = 'vscode-docker.container.remove';
async function removeContainer(actionContext, context) {
    let containersToRemove;
    if (context instanceof containerNode_1.ContainerNode && context.containerDesc) {
        containersToRemove = [context.containerDesc];
    }
    else {
        const opts = {
            "filters": {
                "status": ["created", "restarting", "running", "paused", "exited", "dead"]
            }
        };
        const selectedItem = await quick_pick_container_1.quickPickContainer(actionContext, true, opts);
        if (selectedItem) {
            if (selectedItem.allContainers) {
                containersToRemove = await docker_endpoint_1.docker.getContainerDescriptors(opts);
            }
            else {
                containersToRemove = [selectedItem.containerDesc];
            }
        }
    }
    if (containersToRemove) {
        const numContainers = containersToRemove.length;
        let containerCounter = 0;
        vscode.window.setStatusBarMessage("Docker: Removing Container(s)...", new Promise((resolve, reject) => {
            containersToRemove.forEach((c) => {
                // tslint:disable-next-line:no-function-expression no-any // Grandfathered in
                docker_endpoint_1.docker.getContainer(c.Id).remove({ force: true }, function (err, _data) {
                    containerCounter++;
                    if (err) {
                        // TODO: parseError, proper error handling
                        vscode.window.showErrorMessage(err.message);
                        dockerExtension_1.dockerExplorerProvider.refreshContainers();
                        reject();
                    }
                    if (containerCounter === numContainers) {
                        dockerExtension_1.dockerExplorerProvider.refreshContainers();
                        resolve();
                    }
                });
            });
        }));
    }
    if (telemetry_1.reporter) {
        /* __GDPR__
        "command" : {
            "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        }
        */
        telemetry_1.reporter.sendTelemetryEvent("command", { command: teleCmdId });
    }
}
exports.removeContainer = removeContainer;
//# sourceMappingURL=remove-container.js.map