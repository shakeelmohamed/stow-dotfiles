"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function showSearchBox() {
    return vscode.window.showInputBox({
        placeHolder: 'Enter a package name or search term to search for a NuGet package'
    });
}
exports.default = showSearchBox;
//# sourceMappingURL=showSearchBox.js.map