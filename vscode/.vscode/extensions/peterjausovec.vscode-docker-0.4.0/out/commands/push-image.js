"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const rootNode_1 = require("../explorer/models/rootNode");
const extensionVariables_1 = require("../extensionVariables");
const telemetry_1 = require("../telemetry/telemetry");
const registrySettings_1 = require("./registrySettings");
const tag_image_1 = require("./tag-image");
const teleCmdId = 'vscode-docker.image.push';
const teleAzureId = 'vscode-docker.image.push.azureContainerRegistry';
async function pushImage(actionContext, context) {
    let properties = actionContext.properties;
    let [imageToPush, imageName] = await tag_image_1.getOrAskForImageAndTag(actionContext, context instanceof rootNode_1.RootNode ? undefined : context);
    if (imageName.includes('/')) {
        await registrySettings_1.askToSaveRegistryPath(imageName);
    }
    else {
        //let addPrefixImagePush = "addPrefixImagePush";
        let askToPushPrefix = true; // ext.context.workspaceState.get(addPrefixImagePush, true);
        let defaultRegistryPath = vscode.workspace.getConfiguration('docker').get(constants_1.configurationKeys.defaultRegistryPath);
        if (askToPushPrefix && defaultRegistryPath) {
            properties.pushWithoutRepositoryAnswer = 'Cancel';
            // let alwaysPush: vscode.MessageItem = { title: "Always push" };
            let tagFirst = { title: "Tag first" };
            let pushAnyway = { title: "Push anyway" };
            let options = [tagFirst, pushAnyway];
            let response = await extensionVariables_1.ext.ui.showWarningMessage(`This will attempt to push to the official public Docker Hub library (docker.io/library), which you may not have permissions for. To push to your own repository, you must tag the image like <docker-id-or-registry-server>/<imagename>`, ...options);
            properties.pushWithoutRepositoryAnswer = response.title;
            // if (response === alwaysPush) {
            //     ext.context.workspaceState.update(addPrefixImagePush, false);
            // }
            if (response === tagFirst) {
                imageName = await tag_image_1.tagImage(actionContext, { imageDesc: imageToPush, label: imageName }); //not passing this would ask the user a second time to pick an image
            }
        }
    }
    if (imageToPush) {
        tag_image_1.addImageTaggingTelemetry(actionContext, imageName, '');
        const terminal = extensionVariables_1.ext.terminalProvider.createTerminal(imageName);
        terminal.sendText(`docker push ${imageName}`);
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
            if (imageName.toLowerCase().includes('azurecr.io')) {
                /* __GDPR__
                   "command" : {
                      "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                   }
                 */
                telemetry_1.reporter.sendTelemetryEvent('command', {
                    command: teleAzureId
                });
            }
        }
    }
}
exports.pushImage = pushImage;
//# sourceMappingURL=push-image.js.map