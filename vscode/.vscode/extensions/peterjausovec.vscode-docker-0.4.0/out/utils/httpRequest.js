"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const url = require("url");
const addUserAgent_1 = require("./addUserAgent");
function convertToOptions(options) {
    if (typeof options === 'string') {
        // Must use Node's url, not vscode.Uri
        let optionsAsUrl = url.parse(options);
        return optionsAsUrl;
    }
    else {
        return options;
    }
}
// tslint:disable-next-line:promise-function-async // Grandfathered in
async function httpsRequest(opts) {
    let convertedOpts = convertToOptions(opts);
    addUserAgent_1.addUserAgent(convertedOpts);
    return new Promise((resolve, reject) => {
        let req = https.request(convertedOpts, (res) => {
            let data = '';
            res.on('data', (d) => {
                data += d;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
        req.end();
        req.on('error', reject);
    });
}
exports.httpsRequest = httpsRequest;
async function httpsRequestBinary(opts) {
    let convertedOpts = convertToOptions(opts);
    addUserAgent_1.addUserAgent(convertedOpts);
    let buffer = Buffer.alloc(0);
    return new Promise((resolve, reject) => {
        let req = https.request(convertedOpts, (res) => {
            res.on('data', (d) => {
                buffer = Buffer.concat([buffer, d]);
            });
            res.on('end', () => {
                resolve(buffer);
            });
        });
        req.end();
        req.on('error', reject);
    });
}
exports.httpsRequestBinary = httpsRequestBinary;
//# sourceMappingURL=httpRequest.js.map