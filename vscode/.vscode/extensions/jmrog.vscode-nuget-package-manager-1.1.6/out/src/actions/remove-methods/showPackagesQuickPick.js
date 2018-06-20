"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function showPackagesQuickPick({ projFileFullPath, installedPackages, packageRefSection, parsed, originalContents }) {
    return vscode.window.showQuickPick(installedPackages)
        .then((selectedPackage) => ({
        projFileFullPath,
        selectedPackage,
        parsed,
        packageRefSection,
        originalContents
    }));
}
exports.default = showPackagesQuickPick;
//# sourceMappingURL=showPackagesQuickPick.js.map