'use_strict';
"use strict";
var vscode_1 = require('vscode');
var fs_1 = require('fs');
var path_1 = require('path');
exports.isDirectory = function (path) {
    return new Promise(function (resolve, reject) {
        fs_1.stat(path, function (error, stats) {
            if (error) {
                reject(error);
            }
            else {
                resolve(stats.isDirectory());
            }
        });
    });
};
exports.readFilesFromDir = function (dir) {
    return new Promise(function (resolve, reject) {
        var paths = [];
        fs_1.readdir(dir, function (error, files) {
            Promise.all(files.map(function (file) {
                var path = path_1.join(dir, file);
                if (file === 'node_modules') {
                    return Promise.resolve([]);
                }
                return exports.isDirectory(path)
                    .then(function (isDir) { return isDir ? exports.readFilesFromDir(path) : Promise.resolve([path]); });
            }))
                .then(function (filesPerDir) {
                resolve((_a = []).concat.apply(_a, filesPerDir));
                var _a;
            })
                .catch(function (error) { return reject(error); });
        });
    });
};
exports.readFilesFromPackage = function (packageName) {
    return exports.readFilesFromDir(path_1.join(vscode_1.workspace.rootPath, 'node_modules', packageName));
};
exports.getQuickPickItems = function (packages) {
    var root = vscode_1.workspace.rootPath;
    var nodeRegEx = new RegExp("^node_modules\\" + path_1.sep);
    return Promise.all([exports.readFilesFromDir(root)].concat(packages.map(exports.readFilesFromPackage)))
        .then(function (filesPerPackage) {
        var items = (_a = []).concat.apply(_a, filesPerPackage)
            .map(function (filePath) {
            var partialPath = filePath.replace(root + path_1.sep, '').replace(nodeRegEx, '');
            var fragments = partialPath.split(path_1.sep);
            var label = fragments[fragments.length - 1];
            var description = fragments.join('/');
            return { label: label, description: description, filePath: filePath };
        });
        return items;
        var _a;
    });
};
exports.getImportStatementFromFilepath = function (filePath) {
    var partialPath = !filePath.includes('node_modules') ?
        path_1.relative(vscode_1.window.activeTextEditor.document.fileName, filePath)
        : filePath.replace(path_1.join(vscode_1.workspace.rootPath, 'node_modules') + path_1.sep, '');
    var fragments = filePath.split(path_1.sep)
        .map(function (fragment, index, arr) {
        return index === arr.length - 1 ?
            fragment.replace(/\.js$/, '')
                .replace(/^index$/, '')
            : fragment;
    })
        .filter(function (fragment) { return !!fragment; });
    var moduleName = fragments[fragments.length - 1]
        .replace(/[\-](.)/g, function (substring) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        return rest[0].toUpperCase();
    });
    moduleName = moduleName.replace(new RegExp(path_1.extname(moduleName) + "$"), '')
        .replace(/^[^a-z$]/i, '');
    var packagePath = partialPath.split(path_1.sep).filter(function (fragment) { return fragment !== 'index.js'; }).join('/') || '.';
    var importES6 = vscode_1.workspace.getConfiguration('npm-intellisense')['importES6'];
    var quoteType = vscode_1.workspace.getConfiguration('npm-intellisense')['importQuotes'];
    var linebreak = vscode_1.workspace.getConfiguration('npm-intellisense')['importLinebreak'];
    var declaration = vscode_1.workspace.getConfiguration('npm-intellisense')['importDeclarationType'];
    var statement;
    if (importES6) {
        statement = "import " + moduleName + " from " + quoteType + packagePath + quoteType;
    }
    else {
        statement = declaration + " " + moduleName + " = require(" + quoteType + packagePath + quoteType + ")";
    }
    statement += "" + linebreak;
    return statement;
};
exports.guessVariableName = function (packageName) {
    return packageName.replace(/-\w/gm, function (sub, args) { return sub.replace('-', '').toUpperCase(); });
};
//# sourceMappingURL=util.js.map