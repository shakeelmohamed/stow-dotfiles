"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const _1 = require("./");
const constants_1 = require("../../constants");
/**
 * Helper method for getting the placeholder text.
 *
 * @param {string} action
 * @returns {string}
 */
function getPlaceholder(action) {
    const preposition = action === constants_1.REMOVE ? 'From' : 'To';
    return `${preposition} which project file do you wish to ${action.toLowerCase()} this dependency?`;
}
function showProjFileQuickPick(foundProjFiles, action) {
    // Truncate `.[fc]sproj` file paths for readability, mapping the truncated string to the full path
    // for easy retrieval once a truncated path is picked by the user.
    const truncatedPathMap = foundProjFiles.reduce((newMap, projFilePath) => {
        newMap[_1.truncateProjFilePath(projFilePath)] = projFilePath;
        return newMap;
    }, {});
    return vscode.window.showQuickPick(Object.keys(truncatedPathMap), {
        placeHolder: getPlaceholder(action)
    }).then((choice) => {
        if (!choice) {
            // User canceled.
            return Promise.reject(constants_1.CANCEL);
        }
        return truncatedPathMap[choice];
    });
}
exports.default = showProjFileQuickPick;
//# sourceMappingURL=showProjFileQuickPick.js.map