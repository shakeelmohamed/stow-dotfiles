"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const dockerExtension_1 = require("../dockerExtension");
const containerNode_1 = require("../explorer/models/containerNode");
const telemetry_1 = require("../telemetry/telemetry");
const docker_endpoint_1 = require("./utils/docker-endpoint");
const quick_pick_container_1 = require("./utils/quick-pick-container");
const vscode = require("vscode");
const teleCmdId = 'vscode-docker.container.restart';
async function restartContainer(actionContext, context) {
    let containersToRestart;
    if (context instanceof containerNode_1.ContainerNode && context.containerDesc) {
        containersToRestart = [context.containerDesc];
    }
    else {
        const opts = {
            "filters": {
                "status": ["running", "paused", "exited"]
            }
        };
        const selectedItem = await quick_pick_container_1.quickPickContainer(actionContext, true, opts);
        if (selectedItem) {
            if (selectedItem.allContainers) {
                containersToRestart = await docker_endpoint_1.docker.getContainerDescriptors(opts);
            }
            else {
                containersToRestart = [selectedItem.containerDesc];
            }
        }
    }
    if (containersToRestart) {
        const numContainers = containersToRestart.length;
        let containerCounter = 0;
        vscode.window.setStatusBarMessage("Docker: Restarting Container(s)...", new Promise((resolve, reject) => {
            containersToRestart.forEach((container) => {
                // tslint:disable-next-line:no-any
                docker_endpoint_1.docker.getContainer(container.Id).restart((err, _data) => {
                    containerCounter++;
                    if (err) {
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
        if (telemetry_1.reporter) {
            /* __GDPR__
                "command" : {
                    "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            telemetry_1.reporter.sendTelemetryEvent('command', {
                command: teleCmdId
            });
        }
    }
}
exports.restartContainer = restartContainer;
//# sourceMappingURL=restart-container.js.map