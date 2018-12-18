"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const dockerExtension_1 = require("../dockerExtension");
const extensionVariables_1 = require("../extensionVariables");
const telemetry_1 = require("../telemetry/telemetry");
const quickPickWorkspaceFolder_1 = require("./utils/quickPickWorkspaceFolder");
const teleCmdId = 'vscode-docker.compose.'; // we append up or down when reporting telemetry
async function getDockerComposeFileUris(folder) {
    return await vscode.workspace.findFiles(new vscode.RelativePattern(folder, dockerExtension_1.COMPOSE_FILE_GLOB_PATTERN), null, 9999, undefined);
}
function createItem(folder, uri) {
    const filePath = folder ? path.join('.', uri.fsPath.substr(folder.uri.fsPath.length)) : uri.fsPath;
    return {
        description: undefined,
        file: filePath,
        label: filePath,
        path: path.dirname(filePath)
    };
}
function computeItems(folder, uris) {
    const items = [];
    // tslint:disable-next-line:prefer-for-of // Grandfathered in
    for (let i = 0; i < uris.length; i++) {
        items.push(createItem(folder, uris[i]));
    }
    return items;
}
async function compose(commands, message, dockerComposeFileUri, selectedComposeFileUris) {
    let folder = await quickPickWorkspaceFolder_1.quickPickWorkspaceFolder('To run Docker compose you must first open a folder or workspace in VS Code.');
    let commandParameterFileUris;
    if (selectedComposeFileUris && selectedComposeFileUris.length) {
        commandParameterFileUris = selectedComposeFileUris;
    }
    else if (dockerComposeFileUri) {
        commandParameterFileUris = [dockerComposeFileUri];
    }
    else {
        commandParameterFileUris = [];
    }
    let selectedItems = commandParameterFileUris.map(uri => createItem(folder, uri));
    if (!selectedItems.length) {
        // prompt for compose file
        const uris = await getDockerComposeFileUris(folder);
        if (!uris || uris.length === 0) {
            vscode.window.showInformationMessage('Couldn\'t find any docker-compose files in your workspace.');
            return;
        }
        const items = computeItems(folder, uris);
        selectedItems = [await extensionVariables_1.ext.ui.showQuickPick(items, { placeHolder: `Choose Docker Compose file ${message}` })];
    }
    const terminal = extensionVariables_1.ext.terminalProvider.createTerminal('Docker Compose');
    const configOptions = vscode.workspace.getConfiguration('docker');
    const build = configOptions.get('dockerComposeBuild', true) ? '--build' : '';
    const detached = configOptions.get('dockerComposeDetached', true) ? '-d' : '';
    terminal.sendText(`cd "${folder.uri.fsPath}"`);
    for (let command of commands) {
        selectedItems.forEach((item) => {
            terminal.sendText(command.toLowerCase() === 'up' ? `docker-compose -f "${item.file}" ${command} ${detached} ${build}` : `docker-compose -f "${item.file}" ${command}`);
        });
        terminal.show();
        if (telemetry_1.reporter) {
            /* __GDPR__
               "command" : {
                  "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
               }
             */
            telemetry_1.reporter.sendTelemetryEvent('command', {
                command: teleCmdId + command
            });
        }
    }
}
async function composeUp(dockerComposeFileUri, selectedComposeFileUris) {
    return await compose(['up'], 'to bring up', dockerComposeFileUri, selectedComposeFileUris);
}
exports.composeUp = composeUp;
async function composeDown(dockerComposeFileUri, selectedComposeFileUris) {
    return await compose(['down'], 'to take down', dockerComposeFileUri, selectedComposeFileUris);
}
exports.composeDown = composeDown;
async function composeRestart(dockerComposeFileUri, selectedComposeFileUris) {
    return await compose(['down', 'up'], 'to restart', dockerComposeFileUri, selectedComposeFileUris);
}
exports.composeRestart = composeRestart;
//# sourceMappingURL=docker-compose.js.map