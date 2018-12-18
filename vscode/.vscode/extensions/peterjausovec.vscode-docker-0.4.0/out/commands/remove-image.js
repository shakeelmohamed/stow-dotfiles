"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const imageNode_1 = require("../explorer/models/imageNode");
const telemetry_1 = require("../telemetry/telemetry");
const docker_endpoint_1 = require("./utils/docker-endpoint");
const quick_pick_image_1 = require("./utils/quick-pick-image");
const teleCmdId = 'vscode-docker.image.remove';
async function removeImage(actionContext, context) {
    let imagesToRemove;
    if (context instanceof imageNode_1.ImageNode && context.imageDesc) {
        imagesToRemove = [context.imageDesc];
    }
    else {
        const selectedItem = await quick_pick_image_1.quickPickImage(actionContext, true);
        if (selectedItem) {
            if (selectedItem.allImages) {
                imagesToRemove = await docker_endpoint_1.docker.getImageDescriptors();
            }
            else {
                imagesToRemove = [selectedItem.imageDesc];
            }
        }
    }
    if (imagesToRemove) {
        const numImages = imagesToRemove.length;
        let imageCounter = 0;
        vscode.window.setStatusBarMessage("Docker: Removing Image(s)...", new Promise((resolve, reject) => {
            imagesToRemove.forEach((img) => {
                // tslint:disable-next-line:no-function-expression no-any // Grandfathered in
                docker_endpoint_1.docker.getImage(img.Id).remove({ force: true }, function (err, _data) {
                    imageCounter++;
                    if (err) {
                        // TODO: use parseError, proper error handling
                        vscode.window.showErrorMessage(err.message);
                        reject();
                    }
                    if (imageCounter === numImages) {
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
        telemetry_1.reporter.sendTelemetryEvent('command', {
            command: teleCmdId
        });
    }
}
exports.removeImage = removeImage;
//# sourceMappingURL=remove-image.js.map