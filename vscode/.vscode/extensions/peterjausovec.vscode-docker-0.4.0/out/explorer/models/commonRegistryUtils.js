"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../../constants");
const extensionVariables_1 = require("../../extensionVariables");
const asyncpool_1 = require("../../utils/asyncpool");
async function registryRequest(registryUrl, relativeUrl, credentials) {
    let httpSettings = vscode.workspace.getConfiguration('http');
    let strictSSL = httpSettings.get('proxyStrictSSL', true);
    let response = await extensionVariables_1.ext.request.get(`${registryUrl}/${relativeUrl}`, {
        json: true,
        resolveWithFullResponse: false,
        strictSSL: strictSSL,
        auth: {
            bearer: credentials.bearer,
            user: credentials.userName,
            pass: credentials.password
        }
    });
    return response;
}
exports.registryRequest = registryRequest;
async function getCatalog(registryUrl, credentials) {
    // Note: Note that the contents of the response are specific to the registry implementation. Some registries may opt to provide a full
    //   catalog output, limit it based on the user’s access level or omit upstream results, if providing mirroring functionality.
    //   (https://docs.docker.com/registry/spec/api/#listing-repositories)
    // Azure and private registries just return the repository names
    let response = await registryRequest(registryUrl, 'v2/_catalog', credentials);
    return response.repositories;
}
exports.getCatalog = getCatalog;
async function getTags(registryUrl, repositoryName, credentials) {
    let result = await registryRequest(registryUrl, `v2/${repositoryName}/tags/list?page_size=${constants_1.PAGE_SIZE}&page=1`, credentials);
    let tags = result.tags;
    let tagInfos = [];
    //Acquires each image's manifest (in parallel) to acquire build time
    const pool = new asyncpool_1.AsyncPool(constants_1.MAX_CONCURRENT_REQUESTS);
    for (let tag of tags) {
        pool.addTask(async () => {
            try {
                let manifest = await registryRequest(registryUrl, `v2/${repositoryName}/manifests/${tag}`, credentials);
                let history = JSON.parse(manifest.history[0].v1Compatibility);
                let created = new Date(history.created);
                let info = {
                    tag: tag,
                    created
                };
                tagInfos.push(info);
            }
            catch (error) {
                vscode.window.showErrorMessage(vscode_azureextensionui_1.parseError(error).message);
            }
        });
    }
    await pool.runAll();
    tagInfos.sort(compareTagsReverse);
    return tagInfos;
}
exports.getTags = getTags;
function compareTagsReverse(a, b) {
    if (a.created < b.created) {
        return 1;
    }
    else if (a.created > b.created) {
        return -1;
    }
    else {
        return 0;
    }
}
function formatTag(tag, created) {
    let displayName = `${tag} (${moment(created).fromNow()})`;
    return displayName;
}
exports.formatTag = formatTag;
//# sourceMappingURL=commonRegistryUtils.js.map