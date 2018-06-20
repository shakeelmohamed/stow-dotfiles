"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("../../utils");
const errorMessage = 'No matching results found. Please try again.';
function showPackageQuickPick(json) {
    if (!json) {
        return utils_1.handleError(null, errorMessage, Promise.reject.bind(Promise));
    }
    const { data } = json;
    if (!data || data.length < 1) {
        return utils_1.handleError(null, errorMessage, Promise.reject.bind(Promise));
    }
    return vscode.window.showQuickPick(data);
}
exports.default = showPackageQuickPick;
//# sourceMappingURL=showPackageQuickPick.js.map