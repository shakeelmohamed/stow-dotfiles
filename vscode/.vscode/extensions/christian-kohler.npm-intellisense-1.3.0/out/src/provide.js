"use strict";
var path_1 = require('path');
var PackageCompletionItem_1 = require('./PackageCompletionItem');
var repl = require('repl');
function provide(state, config, fsf) {
    return getNpmPackages(state, config, fsf)
        .then(function (dependencies) {
        return config.packageSubfoldersIntellisense ?
            readModuleSubFolders(dependencies, state, fsf) : dependencies;
    })
        .then(function (dependencies) { return dependencies.map(function (d) { return toCompletionItem(d, state); }); });
}
exports.provide = provide;
function getNpmPackages(state, config, fsf) {
    return fsf.readJson(getPackageJson(state, config, fsf))
        .then(function (packageJson) { return Object.keys(packageJson.dependencies || {}).concat(Object.keys(config.scanDevDependencies ? packageJson.devDependencies || {} : {}), (config.showBuildInLibs ? getBuildInModules() : [])); })
        .catch(function () { return []; });
}
exports.getNpmPackages = getNpmPackages;
function getBuildInModules() {
    return repl._builtinLibs;
}
function toCompletionItem(dependency, state) {
    return new PackageCompletionItem_1.PackageCompletionItem(dependency, state);
}
function getPackageJson(state, config, fsf) {
    return config.recursivePackageJsonLookup ?
        nearestPackageJson(state.rootPath, state.filePath, fsf) :
        path_1.join(state.rootPath, 'package.json');
}
function nearestPackageJson(rootPath, currentPath, fsf) {
    var packageJsonFullPath = path_1.join(currentPath, 'package.json');
    if (currentPath === rootPath || fsf.isFile(packageJsonFullPath)) {
        return packageJsonFullPath;
    }
    return nearestPackageJson(rootPath, path_1.resolve(currentPath, '..'), fsf);
}
function readModuleSubFolders(dependencies, state, fsf) {
    var fragments = state.textCurrentLine.split('from ');
    var pkgFragment = fragments[fragments.length - 1].split(/['"]/)[1];
    var pkgFragmentSplit = pkgFragment.split('/');
    var packageName = pkgFragmentSplit[0];
    if (dependencies.filter(function (dep) { return dep === packageName; }).length) {
        var path = path_1.join.apply(void 0, [state.rootPath, 'node_modules'].concat(pkgFragmentSplit));
        // Todo: make the replace function work with other filetypes as well
        return fsf.readDir(path)
            .then(function (files) { return files.map(function (file) { return pkgFragment + file.replace(/\.js$/, ''); }); })
            .catch(function (err) { return ['']; });
    }
    return Promise.resolve(dependencies);
}
//# sourceMappingURL=provide.js.map