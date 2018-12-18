"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const userAgentKey = 'User-Agent';
function addUserAgent(options) {
    if (!options.headers) {
        options.headers = {};
    }
    let userAgent = vscode_azureextensionui_1.appendExtensionUserAgent(options.headers[userAgentKey]);
    options.headers[userAgentKey] = userAgent;
}
exports.addUserAgent = addUserAgent;
//# sourceMappingURL=addUserAgent.js.map