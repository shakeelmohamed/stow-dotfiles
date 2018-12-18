"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const dockerInspect_1 = require("../documentContentProviders/dockerInspect");
const telemetry_1 = require("../telemetry/telemetry");
const quick_pick_image_1 = require("./utils/quick-pick-image");
async function inspectImage(actionContext, context) {
    let imageToInspect;
    if (context && context.imageDesc) {
        imageToInspect = context.imageDesc;
    }
    else {
        const selectedImage = await quick_pick_image_1.quickPickImage(actionContext);
        if (selectedImage) {
            imageToInspect = selectedImage.imageDesc;
        }
    }
    if (imageToInspect) {
        await dockerInspect_1.default.openImageInspectDocument(imageToInspect);
        if (telemetry_1.reporter) {
            /* __GDPR__
            "command" : {
                "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
            */
            telemetry_1.reporter.sendTelemetryEvent("command", { command: "vscode-docker.image.inspect" });
        }
    }
}
exports.default = inspectImage;
//# sourceMappingURL=inspect-image.js.map