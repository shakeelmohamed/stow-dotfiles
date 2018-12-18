"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const osVersion_1 = require("../../helpers/osVersion");
const wrapError_1 = require("./wrapError");
const connectionMessage = 'Unable to connect to Docker. Please make sure you have installed Docker and that it is running.';
var internal;
(function (internal) {
    // Exported for tests
    internal.installDockerUrl = 'https://aka.ms/AA37qtj';
    internal.linuxPostInstallUrl = 'https://aka.ms/AA37yk6';
    internal.troubleshootingUrl = 'https://aka.ms/AA37qt2';
})(internal = exports.internal || (exports.internal = {}));
// tslint:disable-next-line:no-any
function showDockerConnectionError(actionContext, error) {
    let message = connectionMessage;
    let items = [];
    items.push({ title: 'Install Docker', url: internal.installDockerUrl });
    if (osVersion_1.isLinux()) {
        message = `${message} Also make sure you've followed the Linux post-install instructions "Manage Docker as a non-root user".`;
        items.push({ title: 'Linux Post-Install Instructions', url: internal.linuxPostInstallUrl });
    }
    items.push({ title: 'Additional Troubleshooting', url: internal.troubleshootingUrl });
    let wrappedError = wrapError_1.wrapError(error, message);
    // Don't wait
    actionContext.suppressErrorDisplay = true;
    vscode.window.showErrorMessage(vscode_azureextensionui_1.parseError(wrappedError).message, ...items).then(response => {
        if (response) {
            // tslint:disable-next-line:no-unsafe-any
            opn(response.url);
        }
    });
    return wrappedError;
}
exports.showDockerConnectionError = showDockerConnectionError;
// tslint:disable-next-line:no-any no-unsafe-any
function throwDockerConnectionError(actionContext, error) {
    throw showDockerConnectionError(actionContext, error);
}
exports.throwDockerConnectionError = throwDockerConnectionError;
//# sourceMappingURL=dockerConnectionError.js.map