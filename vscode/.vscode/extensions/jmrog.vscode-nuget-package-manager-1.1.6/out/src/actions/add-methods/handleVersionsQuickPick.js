"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
const xml2js_1 = require("xml2js");
const utils_1 = require("../../utils");
const shared_1 = require("../shared");
const constants_1 = require("../../constants");
function getErrorMessage(verb, projFileFullPath) {
    return `Could not ${verb} the file at ${projFileFullPath}. Please try again.`;
}
// TODO: Clean this up if possible.
function handleVersionsQuickPick({ selectedVersion, selectedPackageName }) {
    selectedVersion = selectedVersion.startsWith('Latest version') ? '*' : selectedVersion;
    return shared_1.checkProjFilePath(vscode.workspace.rootPath)
        .then((result) => {
        if (result.length === 1) {
            return result[0];
        }
        return shared_1.showProjFileQuickPick(result, constants_1.ADD);
    })
        .then((pickedProjFile) => {
        return new Promise((resolve, reject) => {
            fs.readFile(pickedProjFile, 'utf8', (err, data) => {
                if (err) {
                    return utils_1.handleError(err, getErrorMessage('read', pickedProjFile), reject);
                }
                xml2js_1.parseString(data, (err, parsed = {}) => {
                    if (err) {
                        return utils_1.handleError(err, getErrorMessage('parse', pickedProjFile), reject);
                    }
                    let contents;
                    try {
                        contents = shared_1.createUpdatedProjectJson(parsed, selectedPackageName, selectedVersion);
                    }
                    catch (ex) {
                        return utils_1.handleError(ex, getErrorMessage('parse', pickedProjFile), reject);
                    }
                    return resolve({
                        pickedProjFile,
                        contents,
                        selectedPackageName,
                        selectedVersion,
                        originalContents: data
                    });
                });
            });
        });
    });
}
exports.default = handleVersionsQuickPick;
//# sourceMappingURL=handleVersionsQuickPick.js.map