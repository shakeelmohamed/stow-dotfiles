"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
const _1 = require("./shared/");
const add_methods_1 = require("./add-methods");
function addNuGetPackage() {
    add_methods_1.showSearchBox()
        .then(add_methods_1.fetchPackages)
        .then(add_methods_1.handleSearchResponse)
        .then(add_methods_1.showPackageQuickPick)
        .then(add_methods_1.fetchPackageVersions)
        .then(add_methods_1.handleVersionsResponse)
        .then(add_methods_1.showVersionsQuickPick)
        .then(add_methods_1.handleVersionsQuickPick)
        .then(add_methods_1.writeFile)
        .then(_1.showInformationMessage)
        .then(undefined, (err) => {
        _1.clearStatusBar();
        if (err !== constants_1.CANCEL) {
            vscode.window.showErrorMessage(err.message || err || 'Something went wrong! Please try again.');
        }
    });
}
exports.addNuGetPackage = addNuGetPackage;
//# sourceMappingURL=add.js.map