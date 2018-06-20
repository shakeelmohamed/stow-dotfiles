"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function truncateProjFilePath(projFilePath, rootPath = vscode.workspace.rootPath) {
    if (!rootPath) {
        throw new Error('Unable to locate a workspace root path! Please open a workspace and try again.');
    }
    return projFilePath.replace(rootPath, '{root}');
}
exports.default = truncateProjFilePath;
//# sourceMappingURL=truncateProjFilePath.js.map