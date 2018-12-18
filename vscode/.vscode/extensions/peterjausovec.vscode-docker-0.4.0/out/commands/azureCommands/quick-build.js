"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SourceArchiveUtility_1 = require("../utils/SourceArchiveUtility");
// Prompts user to select a subscription, resource group, then registry from drop down. If there are multiple folders in the workspace, the source folder must also be selected.
// The user is then asked to name & tag the image. A build is queued for the image in the selected registry.
// Selected source code must contain a path to the desired dockerfile.
async function quickBuild(actionContext, dockerFileUri) {
    await SourceArchiveUtility_1.scheduleRunRequest(dockerFileUri, "DockerBuildRequest", actionContext);
}
exports.quickBuild = quickBuild;
//# sourceMappingURL=quick-build.js.map