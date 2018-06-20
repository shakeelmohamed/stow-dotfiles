"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const shared_1 = require("./shared");
const constants_1 = require("../constants");
const remove_methods_1 = require("./remove-methods");
function removeNuGetPackage() {
    shared_1.checkProjFilePath(vscode.workspace.rootPath)
        .then((result) => {
        if (result.length === 1) {
            return result[0];
        }
        return shared_1.showProjFileQuickPick(result, constants_1.REMOVE);
    })
        .then(remove_methods_1.readInstalledPackages)
        .then(remove_methods_1.showPackagesQuickPick)
        .then(remove_methods_1.deletePackageReference)
        .then(shared_1.showInformationMessage)
        .then(undefined, (err) => {
        if (err !== constants_1.CANCEL) {
            vscode.window.showErrorMessage(err.message || err || 'Something went wrong! Please try again.');
        }
    });
}
exports.removeNuGetPackage = removeNuGetPackage;
//# sourceMappingURL=remove.js.map