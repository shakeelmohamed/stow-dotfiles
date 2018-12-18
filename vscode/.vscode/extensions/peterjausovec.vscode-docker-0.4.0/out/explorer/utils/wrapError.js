"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
/**
 * Wrap an existing error with a new error that contains the previous error as just a "Detail".
 *
 * Example:
 *   let wrapped = wrapError(new Error('CPU on strike'), 'Unable to process banking account.');
 *   console.log(parseError(wrapped).message) => 'Unable to process banking account. Details: CPU on strike'
 */
// tslint:disable-next-line:no-any
function wrapError(innerError, outerMessage) {
    let parsed = vscode_azureextensionui_1.parseError(innerError);
    let mergedMessage = `${outerMessage} Details: ${parsed.message}`;
    // We could consider attaching the inner error but right now telemetry doesn't do anything with it
    return new Error(mergedMessage);
}
exports.wrapError = wrapError;
//# sourceMappingURL=wrapError.js.map