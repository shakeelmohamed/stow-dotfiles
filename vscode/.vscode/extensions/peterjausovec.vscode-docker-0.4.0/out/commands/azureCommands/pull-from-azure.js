"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const child_process_1 = require("child_process");
const fse = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const wizard_1 = require("../../explorer/deploy/wizard");
const azureRegistryNodes_1 = require("../../explorer/models/azureRegistryNodes");
const extensionVariables_1 = require("../../extensionVariables");
const acrTools = require("../../utils/Azure/acrTools");
const quickPicks = require("../utils/quick-pick-azure");
/* Pulls an image from Azure. The context is the image node the user has right clicked on */
async function pullFromAzure(context) {
    let registryName;
    let registry;
    let imageName;
    if (context) { // Right Click
        registryName = context.registry.loginServer;
        registry = context.registry;
        if (context instanceof azureRegistryNodes_1.AzureImageTagNode) { // Right Click on AzureImageNode
            imageName = context.label;
        }
        else if (context instanceof azureRegistryNodes_1.AzureRepositoryNode) { // Right Click on AzureRepositoryNode
            imageName = `${context.label} -a`; // Pull all images in repository
        }
        else {
            assert.fail(`Unexpected node type`);
        }
    }
    else { // Command Palette
        registry = await quickPicks.quickPickACRRegistry();
        registryName = registry.loginServer;
        const repository = await quickPicks.quickPickACRRepository(registry, 'Select the repository of the image you want to pull');
        const image = await quickPicks.quickPickACRImage(repository, 'Select the image you want to pull');
        imageName = `${repository.name}:${image.tag}`;
    }
    // Using loginCredentials function to get the username and password. This takes care of all users, even if they don't have the Azure CLI
    const credentials = await acrTools.getLoginCredentials(registry);
    const username = credentials.username;
    const password = credentials.password;
    await pullImage(registryName, imageName, username, password);
}
exports.pullFromAzure = pullFromAzure;
async function pullImage(registryName, imageName, username, password) {
    // Check if user is logged into Docker and send appropriate commands to terminal
    let result = await isLoggedIntoDocker(registryName);
    if (!result.loggedIn) { // If not logged in to Docker
        let login = { title: 'Log in to Docker CLI' };
        let msg = `You are not currently logged in to "${registryName}" in the Docker CLI.`;
        let response = await vscode.window.showErrorMessage(msg, login);
        if (response !== login) {
            throw new wizard_1.UserCancelledError(msg);
        }
        await new Promise((resolve, reject) => {
            let childProcess = child_process_1.exec(`docker login ${registryName} --username ${username} --password-stdin`, (err, stdout, stderr) => {
                extensionVariables_1.ext.outputChannel.append(stdout);
                extensionVariables_1.ext.outputChannel.append(stderr);
                if (err && err.message.match(/error storing credentials.*The stub received bad data/)) {
                    // Temporary work-around for this error- same as Azure CLI
                    // See https://github.com/Azure/azure-cli/issues/4843
                    reject(new Error(`In order to log in to the Docker CLI using tokens, you currently need to go to \n${result.configPath} and remove "credsStore": "wincred" from the config.json file, then try again. \nDoing this will disable wincred and cause Docker to store credentials directly in the .docker/config.json file. All registries that are currently logged in will be effectly logged out.`));
                }
                else if (err) {
                    reject(err);
                }
                else if (stderr) {
                    reject(stderr);
                }
                resolve();
            });
            childProcess.stdin.write(password); // Prevents insecure password error
            childProcess.stdin.end();
        });
    }
    const terminal = extensionVariables_1.ext.terminalProvider.createTerminal("docker pull");
    terminal.show();
    terminal.sendText(`docker pull ${registryName}/${imageName}`);
}
async function isLoggedIntoDocker(registryName) {
    let home = process.env.HOMEPATH;
    let configPath = path.join(home, '.docker', 'config.json');
    let buffer;
    await vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('findDockerConfig', async function () {
        this.suppressTelemetry = true;
        buffer = fse.readFileSync(configPath);
    });
    let index = buffer.indexOf(registryName);
    let loggedIn = index >= 0; // Returns -1 if user is not logged into Docker
    return { configPath, loggedIn }; // Returns object with configuration path and boolean indicating if user was logged in or not
}
//# sourceMappingURL=pull-from-azure.js.map