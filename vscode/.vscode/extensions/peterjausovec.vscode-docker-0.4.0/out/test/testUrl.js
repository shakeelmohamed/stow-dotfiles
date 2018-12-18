"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const extensionVariables_1 = require("../extensionVariables");
const wrapError_1 = require("../explorer/utils/wrapError");
const vscode_1 = require("vscode");
const osVersion_1 = require("../helpers/osVersion");
async function testUrl(url) {
    test(`Testing ${url} exists`, async function () {
        this.timeout(10000);
        if (!osVersion_1.isWindows()) {
            this.skip();
        }
        else {
            let contents;
            try {
                let options = {
                    method: 'GET',
                    url
                };
                contents = await extensionVariables_1.ext.request(options);
            }
            catch (error) {
                throw wrapError_1.wrapError(error, `Could not connect to ${url}`);
            }
            let fragment = vscode_1.Uri.parse(url).fragment;
            if (fragment) {
                // If contains a fragment, verify a link with that ID actually exists in the contents
                if (!contents.includes(`href="#${fragment}"`)) {
                    throw new Error(`Found page for ${url}, but couldn't find target for fragment ${fragment}`);
                }
            }
        }
    });
}
exports.testUrl = testUrl;
//# sourceMappingURL=testUrl.js.map