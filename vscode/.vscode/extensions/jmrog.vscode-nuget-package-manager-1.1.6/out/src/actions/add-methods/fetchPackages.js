"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const qs = require("querystring");
const node_fetch_1 = require("node-fetch");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
function fetchPackages(input, searchUrl = constants_1.NUGET_SEARCH_URL) {
    if (!input) {
        // Search canceled.
        return Promise.reject(constants_1.CANCEL);
    }
    vscode.window.setStatusBarMessage('Searching NuGet...');
    const queryParams = qs.stringify({
        q: input,
        prerelease: 'true',
        take: '100'
    });
    return node_fetch_1.default(`${searchUrl}?${queryParams}`, utils_1.getFetchOptions(vscode.workspace.getConfiguration('http')));
}
exports.default = fetchPackages;
//# sourceMappingURL=fetchPackages.js.map