"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const rootNode_1 = require("../explorer/models/rootNode");
const utils_1 = require("../explorer/utils/utils");
const extensionVariables_1 = require("../extensionVariables");
const extractRegExGroups_1 = require("../helpers/extractRegExGroups");
const telemetry_1 = require("../telemetry/telemetry");
const docker_endpoint_1 = require("./utils/docker-endpoint");
const quick_pick_image_1 = require("./utils/quick-pick-image");
const teleCmdId = 'vscode-docker.image.tag';
async function tagImage(actionContext, context) {
    // If a RootNode or no node is passed in, we ask the user to pick an image
    let [imageToTag, currentName] = await getOrAskForImageAndTag(actionContext, context instanceof rootNode_1.RootNode ? undefined : context);
    if (imageToTag) {
        addImageTaggingTelemetry(actionContext, currentName, '.before');
        let newTaggedName = await getTagFromUserInput(currentName, true);
        addImageTaggingTelemetry(actionContext, newTaggedName, '.after');
        let repo = newTaggedName;
        let tag = 'latest';
        if (newTaggedName.lastIndexOf(':') > 0) {
            repo = newTaggedName.slice(0, newTaggedName.lastIndexOf(':'));
            tag = newTaggedName.slice(newTaggedName.lastIndexOf(':') + 1);
        }
        const image = docker_endpoint_1.docker.getImage(imageToTag.Id);
        // tslint:disable-next-line:no-function-expression no-any // Grandfathered in
        image.tag({ repo: repo, tag: tag }, function (err, _data) {
            if (err) {
                // TODO: use parseError, proper error handling
                vscode.window.showErrorMessage('Docker Tag error: ' + err.message);
            }
        });
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
        return newTaggedName;
    }
}
exports.tagImage = tagImage;
async function getTagFromUserInput(imageName, addDefaultRegistry) {
    const configOptions = vscode.workspace.getConfiguration('docker');
    const defaultRegistryPath = configOptions.get(constants_1.configurationKeys.defaultRegistryPath, '');
    let opt = {
        ignoreFocusOut: true,
        prompt: 'Tag image as...',
    };
    if (addDefaultRegistry) {
        let registryLength = imageName.indexOf('/');
        if (defaultRegistryPath.length > 0 && registryLength < 0) {
            imageName = defaultRegistryPath + '/' + imageName;
            registryLength = defaultRegistryPath.length;
        }
        opt.valueSelection = registryLength < 0 ? undefined : [0, registryLength + 1]; //include the '/'
    }
    opt.value = imageName;
    const nameWithTag = await extensionVariables_1.ext.ui.showInputBox(opt);
    return nameWithTag;
}
exports.getTagFromUserInput = getTagFromUserInput;
async function getOrAskForImageAndTag(actionContext, context) {
    let name;
    let description;
    if (context && context.imageDesc) {
        description = context.imageDesc;
        name = context.label;
    }
    else {
        const selectedItem = await quick_pick_image_1.quickPickImage(actionContext, false);
        if (selectedItem) {
            description = selectedItem.imageDesc;
            name = selectedItem.label;
        }
        // Temporary work-around for vscode bug where valueSelection can be messed up if a quick pick is followed by a showInputBox
        await utils_1.delay(500);
    }
    return [description, name];
}
exports.getOrAskForImageAndTag = getOrAskForImageAndTag;
const KnownRegistries = [
    // Like username/path
    { type: 'dockerhub-namespace', regex: /^[^.:]+\/[^.:]+\/$/ },
    { type: 'dockerhub-dockerio', regex: /^docker.io.*\// },
    { type: 'gitlab', regex: /gitlab.*\// },
    { type: 'ACR', regex: /azurecr\.io.*\// },
    { type: 'GCR', regex: /gcr\.io.*\// },
    { type: 'ECR', regex: /\.ecr\..*\// },
    { type: 'localhost', regex: /localhost:.*\// },
    // Has a port, probably a private registry
    { type: 'privateWithPort', regex: /:[0-9]+\// },
    // Match anything remaining
    { type: 'other', regex: /\// },
    { type: 'none', regex: /./ } // no slash
];
function addImageTaggingTelemetry(actionContext, fullImageName, propertyPostfix) {
    try {
        let defaultRegistryPath = vscode.workspace.getConfiguration('docker').get('defaultRegistryPath', '');
        let properties = {};
        let [repository, tag] = extractRegExGroups_1.extractRegExGroups(fullImageName, /^(.*):(.*)$/, [fullImageName, '']);
        if (!!tag.match(/^[0-9.-]*(|alpha|beta|latest|edge|v|version)?[0-9.-]*$/)) {
            properties.safeTag = tag;
        }
        properties.hasTag = String(!!tag);
        properties.numSlashes = String(numberMatches(repository.match(/\//g)));
        properties.isDefaultRegistryPathInName = String(repository.startsWith(`${defaultRegistryPath}/`));
        properties.isDefaultRegistryPathSet = String(!!defaultRegistryPath);
        let knownRegistry = KnownRegistries.find(kr => !!repository.match(kr.regex));
        properties.registryType = knownRegistry.type;
        for (let propertyName of Object.getOwnPropertyNames(properties)) {
            actionContext.properties[propertyName + propertyPostfix] = properties[propertyName];
        }
    }
    catch (error) {
        console.error(error);
    }
}
exports.addImageTaggingTelemetry = addImageTaggingTelemetry;
function numberMatches(matches) {
    return matches ? matches.length : 0;
}
//# sourceMappingURL=tag-image.js.map