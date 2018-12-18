"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const containerNode_1 = require("../explorer/models/containerNode");
const extensionVariables_1 = require("../extensionVariables");
const telemetry_1 = require("../telemetry/telemetry");
const quick_pick_container_1 = require("./utils/quick-pick-container");
const teleCmdId = 'vscode-docker.container.show-logs';
async function showLogsContainer(actionContext, context) {
    let containerToLog;
    if (context instanceof containerNode_1.ContainerNode && context.containerDesc) {
        containerToLog = context.containerDesc;
    }
    else {
        const opts = {
            "filters": {
                "status": ["running"]
            }
        };
        const selectedItem = await quick_pick_container_1.quickPickContainer(actionContext, false, opts);
        if (selectedItem) {
            containerToLog = selectedItem.containerDesc;
        }
    }
    if (containerToLog) {
        const terminal = extensionVariables_1.ext.terminalProvider.createTerminal(containerToLog.Image);
        terminal.sendText(`docker logs -f ${containerToLog.Id}`);
        terminal.show();
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
exports.showLogsContainer = showLogsContainer;
//# sourceMappingURL=showlogs-container.js.map