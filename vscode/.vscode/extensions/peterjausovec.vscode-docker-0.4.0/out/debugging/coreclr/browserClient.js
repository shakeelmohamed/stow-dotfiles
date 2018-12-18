"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const vscode_1 = require("vscode");
class OpnBrowserClient {
    openBrowser(url) {
        const uri = vscode_1.Uri.parse(url);
        if (uri.scheme === 'http' || uri.scheme === 'https') {
            // tslint:disable-next-line:no-unsafe-any
            opn(url);
        }
    }
}
exports.OpnBrowserClient = OpnBrowserClient;
exports.default = OpnBrowserClient;
//# sourceMappingURL=browserClient.js.map