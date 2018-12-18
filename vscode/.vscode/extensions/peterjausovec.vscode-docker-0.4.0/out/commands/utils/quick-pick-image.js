"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const dockerExtension_1 = require("../../dockerExtension");
const dockerConnectionError_1 = require("../../explorer/utils/dockerConnectionError");
const utils_1 = require("../../explorer/utils/utils");
const extensionVariables_1 = require("../../extensionVariables");
const build_image_1 = require("../build-image");
const tag_image_1 = require("../tag-image");
const docker_endpoint_1 = require("./docker-endpoint");
function createItem(image, repoTag) {
    return {
        label: repoTag || '<none>',
        imageDesc: image
    };
}
function computeItems(images, includeAll) {
    const items = [];
    // tslint:disable-next-line:prefer-for-of // Grandfathered in
    for (let i = 0; i < images.length; i++) {
        if (!images[i].RepoTags) {
            // dangling
            const item = createItem(images[i], '<none>:<none>');
            items.push(item);
        }
        else {
            // tslint:disable-next-line:prefer-for-of // Grandfathered in
            for (let j = 0; j < images[i].RepoTags.length; j++) {
                const item = createItem(images[i], images[i].RepoTags[j]);
                items.push(item);
            }
        }
    }
    if (includeAll && images.length > 0) {
        items.unshift({
            label: 'All Images',
            allImages: true
        });
    }
    return items;
}
async function quickPickImage(actionContext, includeAll) {
    let images;
    let properties = actionContext.properties;
    const imageFilters = {
        "filters": {
            "dangling": ["false"]
        }
    };
    try {
        images = await docker_endpoint_1.docker.getImageDescriptors(imageFilters);
    }
    catch (error) {
        dockerConnectionError_1.throwDockerConnectionError(actionContext, error);
    }
    if (!images || images.length === 0) {
        throw new Error('There are no docker images. Try Docker Build first.');
    }
    else {
        const items = computeItems(images, includeAll);
        let response = await extensionVariables_1.ext.ui.showQuickPick(items, { placeHolder: 'Choose image...' });
        properties.allContainers = includeAll ? String(response.allImages) : undefined;
        return response;
    }
}
exports.quickPickImage = quickPickImage;
async function quickPickImageName(actionContext, rootFolder, dockerFileItem) {
    let absFilePath = path.join(rootFolder.uri.fsPath, dockerFileItem.relativeFilePath);
    let dockerFileKey = `ACR_buildTag_${absFilePath}`;
    let prevImageName = extensionVariables_1.ext.context.globalState.get(dockerFileKey);
    let suggestedImageName;
    if (!prevImageName) {
        // Get imageName based on name of subfolder containing the Dockerfile, or else workspacefolder
        suggestedImageName = path.basename(dockerFileItem.relativeFolderPath).toLowerCase();
        if (suggestedImageName === '.') {
            suggestedImageName = path.basename(rootFolder.uri.fsPath).toLowerCase().replace(/\s/g, '');
        }
        suggestedImageName += ":{{.Run.ID}}";
    }
    else {
        suggestedImageName = prevImageName;
    }
    // Temporary work-around for vscode bug where valueSelection can be messed up if a quick pick is followed by a showInputBox
    await utils_1.delay(500);
    tag_image_1.addImageTaggingTelemetry(actionContext, suggestedImageName, '.before');
    const imageName = await tag_image_1.getTagFromUserInput(suggestedImageName, false);
    tag_image_1.addImageTaggingTelemetry(actionContext, imageName, '.after');
    await extensionVariables_1.ext.context.globalState.update(dockerFileKey, imageName);
    return imageName;
}
exports.quickPickImageName = quickPickImageName;
async function quickPickDockerFileItem(actionContext, dockerFileUri, rootFolder) {
    let dockerFileItem;
    while (!dockerFileItem) {
        let resolvedItem = await build_image_1.resolveFileItem(rootFolder, dockerFileUri, dockerExtension_1.DOCKERFILE_GLOB_PATTERN, 'Choose a Dockerfile to build.');
        if (resolvedItem) {
            dockerFileItem = resolvedItem;
        }
        else {
            let msg = "Couldn't find a Dockerfile in your workspace. Would you like to add Docker files to the workspace?";
            actionContext.properties.cancelStep = msg;
            await extensionVariables_1.ext.ui.showWarningMessage(msg, vscode_azureextensionui_1.DialogResponses.yes, vscode_azureextensionui_1.DialogResponses.cancel);
            actionContext.properties.cancelStep = undefined;
            await vscode.commands.executeCommand('vscode-docker.configure');
            // Try again
        }
    }
    return dockerFileItem;
}
exports.quickPickDockerFileItem = quickPickDockerFileItem;
async function quickPickYamlFileItem(fileUri, rootFolder) {
    let fileItem;
    let resolvedItem = await build_image_1.resolveFileItem(rootFolder, fileUri, dockerExtension_1.YAML_GLOB_PATTERN, 'Choose a .yaml file to run.');
    if (resolvedItem) {
        fileItem = resolvedItem;
    }
    return fileItem;
}
exports.quickPickYamlFileItem = quickPickYamlFileItem;
//# sourceMappingURL=quick-pick-image.js.map