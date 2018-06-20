"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../constants");
function showVersionsQuickPick({ json, selectedPackageName }) {
    // TODO: This could probably use more error handling.
    const versions = json.versions.slice().reverse().concat('Latest version (Wildcard *)');
    return new Promise((resolve, reject) => {
        vscode.window.showQuickPick(versions, {
            placeHolder: 'Select the version to add.'
        }).then((selectedVersion) => {
            if (!selectedVersion) {
                // User canceled.
                return reject(constants_1.CANCEL);
            }
            resolve({ selectedVersion, selectedPackageName });
        });
    });
}
exports.default = showVersionsQuickPick;
//# sourceMappingURL=showVersionsQuickPick.js.map