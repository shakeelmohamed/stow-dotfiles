"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../constants");
const azureRegistryNodes_1 = require("../explorer/models/azureRegistryNodes");
const customRegistryNodes_1 = require("../explorer/models/customRegistryNodes");
const dockerHubNodes_1 = require("../explorer/models/dockerHubNodes");
const extensionVariables_1 = require("../extensionVariables");
const assertNever_1 = require("../helpers/assertNever");
const defaultRegistryKey = "defaultRegistry";
const hasCheckedRegistryPaths = "hasCheckedRegistryPaths";
async function setRegistryAsDefault(node) {
    let registryName;
    if (node instanceof dockerHubNodes_1.DockerHubOrgNode) {
        registryName = node.namespace;
    }
    else if (node instanceof azureRegistryNodes_1.AzureRegistryNode) {
        registryName = node.registry.loginServer || node.label;
    }
    else if (node instanceof customRegistryNodes_1.CustomRegistryNode) {
        registryName = node.registryName;
    }
    else {
        return assertNever_1.assertNever(node, 'type of registry node');
    }
    const configOptions = vscode.workspace.getConfiguration('docker');
    await configOptions.update(constants_1.configurationKeys.defaultRegistryPath, registryName, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Updated the docker.defaultRegistryPath setting to "${registryName}"`);
}
exports.setRegistryAsDefault = setRegistryAsDefault;
async function consolidateDefaultRegistrySettings() {
    const configOptions = vscode.workspace.getConfiguration('docker');
    const combineRegistryPaths = !(extensionVariables_1.ext.context.workspaceState.get(hasCheckedRegistryPaths));
    let defaultRegistryPath = configOptions.get(constants_1.configurationKeys.defaultRegistryPath, '');
    let defaultRegistry = configOptions.get(defaultRegistryKey, '');
    if (defaultRegistry && combineRegistryPaths) {
        let updatedPath = defaultRegistryPath ? `${defaultRegistry}/${defaultRegistryPath}` : `${defaultRegistry}`;
        await extensionVariables_1.ext.context.workspaceState.update(hasCheckedRegistryPaths, true);
        await configOptions.update(constants_1.configurationKeys.defaultRegistryPath, updatedPath, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`The 'docker.defaultRegistry' setting is now obsolete, please use the 'docker.${constants_1.configurationKeys.defaultRegistryPath}' setting by itself. Your settings have been updated to reflect this change.`);
    }
}
exports.consolidateDefaultRegistrySettings = consolidateDefaultRegistrySettings;
async function askToSaveRegistryPath(imagePath, promptForSave) {
    let askToSaveKey = 'docker.askToSaveRegistryPath';
    let askToSavePath = promptForSave || extensionVariables_1.ext.context.globalState.get(askToSaveKey, true);
    const configOptions = vscode.workspace.getConfiguration('docker');
    let prefix = "";
    if (imagePath.includes('/')) {
        prefix = imagePath.substring(0, imagePath.lastIndexOf('/'));
    }
    if (prefix && askToSavePath) {
        let userPrefixPreference = await extensionVariables_1.ext.ui.showWarningMessage(`Would you like to save '${prefix}' as your default registry path?`, vscode_azureextensionui_1.DialogResponses.yes, vscode_azureextensionui_1.DialogResponses.no, vscode_azureextensionui_1.DialogResponses.skipForNow);
        if (userPrefixPreference === vscode_azureextensionui_1.DialogResponses.yes || userPrefixPreference === vscode_azureextensionui_1.DialogResponses.no) {
            await extensionVariables_1.ext.context.globalState.update(askToSaveKey, false);
        }
        if (userPrefixPreference === vscode_azureextensionui_1.DialogResponses.yes) {
            await configOptions.update(constants_1.configurationKeys.defaultRegistryPath, prefix, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`Default registry path saved to the 'docker.${constants_1.configurationKeys.defaultRegistryPath}' setting.`);
        }
    }
}
exports.askToSaveRegistryPath = askToSaveRegistryPath;
//# sourceMappingURL=registrySettings.js.map