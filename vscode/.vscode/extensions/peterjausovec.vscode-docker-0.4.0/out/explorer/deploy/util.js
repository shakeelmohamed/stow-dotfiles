"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const WebSiteManagementClient = require("azure-arm-website");
const vscode = require("vscode");
const nonNull_1 = require("../../utils/nonNull");
async function listAll(client, first) {
    const all = [];
    for (let list = await first; list.length || list.nextLink; list = list.nextLink ? await client.listNext(list.nextLink) : []) {
        all.push(...list);
    }
    return all;
}
exports.listAll = listAll;
// tslint:disable-next-line:promise-function-async // Grandfathered in
function waitForWebSiteState(webSiteManagementClient, site, state, intervalMs = 5000, timeoutMs = 60000) {
    // tslint:disable-next-line:promise-must-complete // false positive
    return new Promise((resolve, reject) => {
        const func = async (count) => {
            const currentSite = await webSiteManagementClient.webApps.get(nonNull_1.nonNullProp(site, 'resourceGroup'), nonNull_1.nonNullProp(site, 'name'));
            if (nonNull_1.nonNullProp(currentSite, 'state').toLowerCase() === state.toLowerCase()) {
                resolve();
            }
            else {
                count += intervalMs;
                if (count < timeoutMs) {
                    // tslint:disable-next-line:no-string-based-set-timeout // false positive
                    setTimeout(func, intervalMs, count);
                }
                else {
                    reject(new Error(`Timeout waiting for Web Site "${site.name}" state "${state}".`));
                }
            }
        };
        // tslint:disable-next-line:no-string-based-set-timeout // false positive
        setTimeout(func, intervalMs, intervalMs);
    });
}
exports.waitForWebSiteState = waitForWebSiteState;
function getSignInCommandString() {
    return 'azure-account.login';
}
exports.getSignInCommandString = getSignInCommandString;
// tslint:disable-next-line:promise-function-async // Grandfathered in
function getWebAppPublishCredential(azureAccount, subscription, site) {
    const credentials = azureAccount.getCredentialByTenantId(subscription);
    const websiteClient = new WebSiteManagementClient(credentials, nonNull_1.getSubscriptionId(subscription));
    return websiteClient.webApps.listPublishingCredentials(nonNull_1.nonNullProp(site, 'resourceGroup'), nonNull_1.nonNullProp(site, 'name'));
}
exports.getWebAppPublishCredential = getWebAppPublishCredential;
// Output channel for the extension
const outputChannel = vscode.window.createOutputChannel("Docker");
function getOutputChannel() {
    return outputChannel;
}
exports.getOutputChannel = getOutputChannel;
//# sourceMappingURL=util.js.map