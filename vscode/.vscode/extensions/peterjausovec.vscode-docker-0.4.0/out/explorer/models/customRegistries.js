"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../../constants");
const extensionVariables_1 = require("../../extensionVariables");
const nonNull_1 = require("../../utils/nonNull");
const customRegistryNodes_1 = require("./customRegistryNodes");
const customRegistriesKey = 'customRegistries';
async function connectCustomRegistry() {
    let registries = await getCustomRegistries();
    // tslint:disable-next-line:no-constant-condition
    let url = await extensionVariables_1.ext.ui.showInputBox({
        prompt: "Enter the URL for the registry (OAuth not yet supported)",
        placeHolder: 'Example: http://localhost:5000',
        validateInput: (value) => {
            let uri = vscode.Uri.parse(value);
            if (!uri.scheme || !uri.authority || !uri.path) {
                return "Please enter a valid URL";
            }
            if (registries.find(reg => reg.url.toLowerCase() === value.toLowerCase())) {
                return `There is already an entry for a container registry at ${value}`;
            }
            return undefined;
        }
    });
    let userName = await extensionVariables_1.ext.ui.showInputBox({
        prompt: "Enter the username for connecting, or ENTER for none"
    });
    let password = '';
    if (userName) {
        password = await extensionVariables_1.ext.ui.showInputBox({
            prompt: "Enter the password",
            password: true
        });
    }
    let newRegistry = {
        url,
        credentials: { userName, password }
    };
    try {
        await customRegistryNodes_1.CustomRegistryNode.verifyIsValidRegistryUrl(newRegistry);
    }
    catch (err) {
        let error = err;
        let message = vscode_azureextensionui_1.parseError(error).message;
        if (error.statusCode === 401) {
            message = 'OAuth support has not yet been implemented in this preview feature.  This registry does not appear to support basic authentication.';
            throw new Error(message);
        }
        throw error;
    }
    // Save
    if (extensionVariables_1.ext.keytar) {
        let sensitive = JSON.stringify(newRegistry.credentials);
        let key = getUsernamePwdKey(newRegistry.url);
        await extensionVariables_1.ext.keytar.setPassword(constants_1.keytarConstants.serviceId, key, sensitive);
        registries.push(newRegistry);
        await saveCustomRegistriesNonsensitive(registries);
    }
    await refresh();
}
exports.connectCustomRegistry = connectCustomRegistry;
async function disconnectCustomRegistry(node) {
    let registries = await getCustomRegistries();
    let registry = registries.find(reg => reg.url.toLowerCase() === node.registry.url.toLowerCase());
    if (registry) {
        let key = getUsernamePwdKey(node.registry.url);
        if (extensionVariables_1.ext.keytar) {
            await extensionVariables_1.ext.keytar.deletePassword(constants_1.keytarConstants.serviceId, key);
        }
        registries.splice(registries.indexOf(registry), 1);
        await saveCustomRegistriesNonsensitive(registries);
        await refresh();
    }
}
exports.disconnectCustomRegistry = disconnectCustomRegistry;
function getUsernamePwdKey(registryUrl) {
    return `usernamepwd_${registryUrl}`;
}
async function getCustomRegistries() {
    let nonsensitive = extensionVariables_1.ext.context.globalState.get(customRegistriesKey) || [];
    let registries = [];
    for (let reg of nonsensitive) {
        await vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('getCustomRegistryUsernamePwd', async function () {
            this.suppressTelemetry = true;
            try {
                if (extensionVariables_1.ext.keytar) {
                    let key = getUsernamePwdKey(reg.url);
                    let credentialsString = await extensionVariables_1.ext.keytar.getPassword(constants_1.keytarConstants.serviceId, key);
                    let credentials = JSON.parse(nonNull_1.nonNullValue(credentialsString, 'Invalid stored password'));
                    registries.push({
                        url: reg.url,
                        credentials
                    });
                }
            }
            catch (error) {
                throw new Error(`Unable to retrieve password for container registry ${reg.url}: ${vscode_azureextensionui_1.parseError(error).message}`);
            }
        });
    }
    return registries;
}
exports.getCustomRegistries = getCustomRegistries;
async function refresh() {
    await vscode.commands.executeCommand('vscode-docker.explorer.refresh');
}
async function saveCustomRegistriesNonsensitive(registries) {
    let minimal = registries.map(reg => ({ url: reg.url }));
    await extensionVariables_1.ext.context.globalState.update(customRegistriesKey, minimal);
}
//# sourceMappingURL=customRegistries.js.map