"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const node_fetch_1 = require("node-fetch");
const shared_1 = require("../shared");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
function fetchPackageVersions(selectedPackageName, versionsUrl = constants_1.NUGET_VERSIONS_URL) {
    if (!selectedPackageName) {
        // User has canceled the process.
        return Promise.reject(constants_1.CANCEL);
    }
    vscode.window.setStatusBarMessage('Loading package versions...');
    return new Promise((resolve) => {
        node_fetch_1.default(`${versionsUrl}${selectedPackageName}/index.json`, utils_1.getFetchOptions(vscode.workspace.getConfiguration('http')))
            .then((response) => {
            shared_1.clearStatusBar();
            resolve({ response, selectedPackageName });
        });
    });
}
exports.default = fetchPackageVersions;
//# sourceMappingURL=fetchPackageVersions.js.map