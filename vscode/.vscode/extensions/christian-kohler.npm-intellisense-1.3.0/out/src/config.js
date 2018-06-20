"use strict";
var vscode_1 = require('vscode');
function getConfig() {
    var configuration = vscode_1.workspace.getConfiguration('npm-intellisense');
    return {
        scanDevDependencies: configuration['scanDevDependencies'],
        recursivePackageJsonLookup: configuration['recursivePackageJsonLookup'],
        packageSubfoldersIntellisense: configuration['packageSubfoldersIntellisense'],
        showBuildInLibs: configuration['showBuildInLibs'],
        importES6: configuration['importES6'],
        importQuotes: configuration['importQuotes'],
        importLinebreak: configuration['importLinebreak'],
        importDeclarationType: configuration['importDeclarationType']
    };
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map