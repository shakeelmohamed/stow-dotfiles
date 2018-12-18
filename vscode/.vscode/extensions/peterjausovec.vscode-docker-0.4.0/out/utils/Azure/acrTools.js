"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
const util_1 = require("util");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../../constants");
const extensionVariables_1 = require("../../extensionVariables");
const azureUtilityManager_1 = require("../azureUtilityManager");
const nonNull_1 = require("../nonNull");
const image_1 = require("./models/image");
const repository_1 = require("./models/repository");
//General helpers
/** Gets the subscription for a given registry
 * @param registry gets the subscription for a given regsitry
 * @returns a subscription object
 */
async function getSubscriptionFromRegistry(registry) {
    let id = nonNull_1.getId(registry);
    let subscriptionId = id.slice('/subscriptions/'.length, id.search('/resourceGroups/'));
    const subs = await azureUtilityManager_1.AzureUtilityManager.getInstance().getFilteredSubscriptionList();
    let subscription = subs.find((sub) => {
        return sub.subscriptionId === subscriptionId;
    });
    if (!subscription) {
        throw new Error(`Could not find subscription with id "${subscriptionId}"`);
    }
    return subscription;
}
exports.getSubscriptionFromRegistry = getSubscriptionFromRegistry;
function getResourceGroupName(registry) {
    let id = nonNull_1.getId(registry);
    return id.slice(id.search('resourceGroups/') + 'resourceGroups/'.length, id.search('/providers/'));
}
exports.getResourceGroupName = getResourceGroupName;
//Gets resource group object from registry and subscription
async function getResourceGroup(registry, subscription) {
    let resourceGroups = await azureUtilityManager_1.AzureUtilityManager.getInstance().getResourceGroups(subscription);
    const resourceGroupName = getResourceGroupName(registry);
    return resourceGroups.find((res) => { return res.name === resourceGroupName; });
}
exports.getResourceGroup = getResourceGroup;
//Registry item management
/** List images under a specific Repository */
async function getImagesByRepository(repo) {
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(repo.registry, 'repository:' + repo.name + ':pull');
    let response = await sendRequest('get', nonNull_1.getLoginServer(repo.registry), `acr/v1/${repo.name}/_tags?orderby=timedesc`, acrAccessToken);
    let tags = response.tags;
    let images = [];
    if (!util_1.isNull(tags)) {
        //Acquires each image's manifest (in parallel) to acquire build time
        for (let tag of tags) {
            let img = new image_1.AzureImage(repo, tag.name, new Date(tag.lastUpdateTime));
            images.push(img);
        }
    }
    return images;
}
exports.getImagesByRepository = getImagesByRepository;
/** List images under a specific digest */
async function getImagesByDigest(repo, digest) {
    let allImages = [];
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(repo.registry, 'repository:' + repo.name + ':pull');
    let response = await sendRequest('get', nonNull_1.getLoginServer(repo.registry), `acr/v1/${repo.name}/_manifests/${digest}`, acrAccessToken);
    const tags = response.manifest.tags;
    for (let tag of tags) {
        allImages.push(new image_1.AzureImage(repo, tag));
    }
    return allImages;
}
exports.getImagesByDigest = getImagesByDigest;
/** List repositories on a given Registry. */
async function getRepositoriesByRegistry(registry) {
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(registry, "registry:catalog:*");
    let response = await sendRequest('get', nonNull_1.getLoginServer(registry), 'acr/v1/_catalog', acrAccessToken);
    let allRepos = [];
    if (!util_1.isNull(response.repositories)) {
        for (let tempRepo of response.repositories) {
            allRepos.push(await repository_1.Repository.Create(registry, tempRepo));
        }
    }
    //Note these are ordered by default in alphabetical order
    return allRepos;
}
exports.getRepositoriesByRegistry = getRepositoriesByRegistry;
async function deleteRepository(repo) {
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(repo.registry, `repository:${repo.name}:*`);
    await sendRequest('delete', nonNull_1.getLoginServer(repo.registry), `v2/_acr/${repo.name}/repository`, acrAccessToken);
}
exports.deleteRepository = deleteRepository;
async function deleteImage(repo, imageDigest) {
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(repo.registry, `repository:${repo.name}:*`);
    await sendRequest('delete', nonNull_1.getLoginServer(repo.registry), `v2/${repo.name}/manifests/${imageDigest}`, acrAccessToken);
}
exports.deleteImage = deleteImage;
async function untagImage(img) {
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(img.registry, `repository:${img.repository.name}:*`);
    await sendRequest('delete', nonNull_1.getLoginServer(img.registry), `v2/_acr/${img.repository.name}/tags/${img.tag}`, acrAccessToken);
}
exports.untagImage = untagImage;
/** Sends a custom html request to a registry
 * @param http_method : the http method
 * @param login_server: the login server of the registry
 * @param path : the URL path
 * @param accessToken : Bearer access token.
 */
async function sendRequest(http_method, login_server, path, accessToken) {
    let url = `https://${login_server}/${path}`;
    if (http_method === 'delete') {
        return await extensionVariables_1.ext.request.delete({
            headers: { 'Authorization': `Bearer ${accessToken}` },
            url: url
        });
    }
    else if (http_method === 'get') {
        return await extensionVariables_1.ext.request.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            json: true,
            resolveWithFullResponse: false,
        });
    }
    throw new Error('sendRequestToRegistry: Unexpected http method');
}
exports.sendRequest = sendRequest;
/** Sends a custom html request to a registry, and retrieves the image's digest.
 * @param image : The targeted image.
 */
async function getImageDigest(image) {
    const { acrAccessToken } = await acquireACRAccessTokenFromRegistry(image.registry, `repository:${image.repository.name}:pull`);
    return new Promise((resolve, reject) => extensionVariables_1.ext.request.get('https://' + image.registry.loginServer + `/v2/${image.repository.name}/manifests/${image.tag}`, {
        auth: {
            bearer: acrAccessToken
        },
        headers: {
            accept: 'application/vnd.docker.distribution.manifest.v2+json; 0.5, application/vnd.docker.distribution.manifest.list.v2+json; 0.6'
        }
    }, (_err, _httpResponse, _body) => {
        if (_err) {
            reject(_err);
        }
        else {
            const imageDigest = _httpResponse.headers['docker-content-digest'];
            if (imageDigest instanceof Array) {
                reject(new Error('docker-content-digest should be a string not an array.'));
            }
            else {
                resolve(imageDigest);
            }
        }
    }));
}
exports.getImageDigest = getImageDigest;
//Credential management
/** Obtains registry username and password compatible with docker login */
async function getLoginCredentials(registry) {
    const subscription = await getSubscriptionFromRegistry(registry);
    const session = await azureUtilityManager_1.AzureUtilityManager.getInstance().getSession(subscription);
    const { aadAccessToken, aadRefreshToken } = await acquireAADTokens(session);
    const acrRefreshToken = await acquireACRRefreshToken(nonNull_1.getLoginServer(registry), session.tenantId, aadRefreshToken, aadAccessToken);
    return { 'password': acrRefreshToken, 'username': constants_1.NULL_GUID };
}
exports.getLoginCredentials = getLoginCredentials;
/** Obtains tokens for using the Docker Registry v2 Api
 * @param registry The targeted Azure Container Registry
 * @param scope String determining the scope of the access token
 * @returns acrRefreshToken: For use as a Password for docker registry access , acrAccessToken: For use with docker API
 */
async function acquireACRAccessTokenFromRegistry(registry, scope) {
    const subscription = await getSubscriptionFromRegistry(registry);
    const session = await azureUtilityManager_1.AzureUtilityManager.getInstance().getSession(subscription);
    const { aadAccessToken, aadRefreshToken } = await acquireAADTokens(session);
    let loginServer = nonNull_1.getLoginServer(registry);
    const acrRefreshToken = await acquireACRRefreshToken(loginServer, session.tenantId, aadRefreshToken, aadAccessToken);
    const acrAccessToken = await acquireACRAccessToken(loginServer, scope, acrRefreshToken);
    return { acrRefreshToken, acrAccessToken };
}
exports.acquireACRAccessTokenFromRegistry = acquireACRAccessTokenFromRegistry;
/** Obtains refresh and access tokens for Azure Active Directory. */
async function acquireAADTokens(session) {
    return new Promise((resolve, reject) => {
        const credentials = session.credentials;
        const environment = session.environment;
        credentials.context.acquireToken(environment.activeDirectoryResourceId, credentials.username, credentials.clientId, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                let tokenResponse = result;
                resolve({
                    aadAccessToken: tokenResponse.accessToken,
                    aadRefreshToken: tokenResponse.refreshToken,
                });
            }
        });
    });
}
exports.acquireAADTokens = acquireAADTokens;
/** Obtains refresh tokens for Azure Container Registry. */
async function acquireACRRefreshToken(registryUrl, tenantId, aadRefreshToken, aadAccessToken) {
    const acrRefreshTokenResponse = await extensionVariables_1.ext.request.post(`https://${registryUrl}/oauth2/exchange`, {
        form: {
            grant_type: "refresh_token",
            service: registryUrl,
            tenant: tenantId,
            refresh_token: aadRefreshToken,
            access_token: aadAccessToken,
        },
        json: true
    });
    return acrRefreshTokenResponse.refresh_token;
}
exports.acquireACRRefreshToken = acquireACRRefreshToken;
/** Gets an ACR accessToken by using an acrRefreshToken */
async function acquireACRAccessToken(registryUrl, scope, acrRefreshToken) {
    const acrAccessTokenResponse = await extensionVariables_1.ext.request.post(`https://${registryUrl}/oauth2/token`, {
        form: {
            grant_type: "refresh_token",
            service: registryUrl,
            scope,
            refresh_token: acrRefreshToken,
        },
        json: true
    });
    return acrAccessTokenResponse.access_token;
}
exports.acquireACRAccessToken = acquireACRAccessToken;
/** Parses information into a readable format from a blob url */
function getBlobInfo(blobUrl) {
    let items = blobUrl.slice(blobUrl.search('https://') + 'https://'.length).split('/');
    const accountName = blobUrl.slice(blobUrl.search('https://') + 'https://'.length, blobUrl.search('.blob'));
    const endpointSuffix = items[0].slice(items[0].search('.blob.') + '.blob.'.length);
    const containerName = items[1];
    const blobName = items[2] + '/' + items[3] + '/' + items[4].slice(0, items[4].search('[?]'));
    const sasToken = items[4].slice(items[4].search('[?]') + 1);
    const host = accountName + '.blob.' + endpointSuffix;
    return {
        accountName: accountName,
        endpointSuffix: endpointSuffix,
        containerName: containerName,
        blobName: blobName,
        sasToken: sasToken,
        host: host
    };
}
exports.getBlobInfo = getBlobInfo;
/** Stream logs from a blob into output channel.
 * Note, since output streams don't actually deal with streams directly, text is not actually
 * streamed in which prevents updating of already appended lines. Usure if this can be fixed. Nonetheless
 * logs do load in chunks every 1 second.
 */
async function streamLogs(registry, run, providedClient) {
    //Prefer passed in client to avoid initialization but if not added obtains own
    const subscription = await getSubscriptionFromRegistry(registry);
    let client = providedClient ? providedClient : await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    let temp = await client.runs.getLogSasUrl(getResourceGroupName(registry), registry.name, run.runId);
    const link = temp.logLink;
    let blobInfo = getBlobInfo(link);
    let blob = azure_storage_1.createBlobServiceWithSas(blobInfo.host, blobInfo.sasToken);
    let available = 0;
    let start = 0;
    let obtainLogs = setInterval(async () => {
        let props;
        let metadata;
        try {
            props = await getBlobProperties(blobInfo, blob);
            metadata = props.metadata;
        }
        catch (err) {
            const error = vscode_azureextensionui_1.parseError(err);
            //Not found happens when the properties havent yet been set, blob is not ready. Wait 1 second and try again
            if (error.errorType === "NotFound") {
                return;
            }
            else {
                throw error;
            }
        }
        available = +props.contentLength;
        let text;
        //Makes sure that if item fails it does so due to network/azure errors not lack of new content
        if (available > start) {
            text = await getBlobToText(blobInfo, blob, start);
            let utf8encoded = (new Buffer(text, 'ascii')).toString('utf8');
            start += text.length;
            extensionVariables_1.ext.outputChannel.append(utf8encoded);
        }
        if (metadata.Complete) {
            clearInterval(obtainLogs);
        }
    }, 1000);
}
exports.streamLogs = streamLogs;
// Promisify getBlobToText for readability and error handling purposes
async function getBlobToText(blobInfo, blob, rangeStart) {
    return new Promise((resolve, reject) => {
        blob.getBlobToText(blobInfo.containerName, blobInfo.blobName, { rangeStart: rangeStart }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
}
exports.getBlobToText = getBlobToText;
// Promisify getBlobProperties for readability and error handling purposes
async function getBlobProperties(blobInfo, blob) {
    return new Promise((resolve, reject) => {
        blob.getBlobProperties(blobInfo.containerName, blobInfo.blobName, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
}
//# sourceMappingURL=acrTools.js.map