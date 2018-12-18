"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
async function globAsync(pattern, options) {
    return await new Promise((resolve, reject) => {
        glob(pattern, options, (err, matches) => {
            if (err) {
                reject();
            }
            else {
                resolve(matches);
            }
        });
    });
}
exports.globAsync = globAsync;
//# sourceMappingURL=async.js.map