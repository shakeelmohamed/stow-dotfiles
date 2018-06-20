"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const utils_1 = require("../../utils");
const constants_1 = require("../../constants");
const nodeModulesMatcher = path.sep === '/' ? /\/node_modules\// : /\\node_modules\\/;
function getProjFileRecursive(startPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(startPath, (err, files) => {
            if (err) {
                return utils_1.handleError(err, err.message, reject);
            }
            const promises = files.map((fileName) => new Promise((resolve, reject) => {
                const filePath = path.resolve(startPath, fileName);
                if (nodeModulesMatcher.test(filePath)) {
                    resolve([]);
                    return;
                }
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        return utils_1.handleError(err, err.message, reject);
                    }
                    if (stats) {
                        if (stats.isFile() && constants_1.projFileExtensionMatcher.test(filePath)) {
                            return resolve([filePath]);
                        }
                        if (stats.isDirectory()) {
                            return getProjFileRecursive(filePath).then(resolve);
                        }
                    }
                    resolve([]);
                });
            }));
            Promise.all(promises).then((tree) => {
                resolve(utils_1.flattenNestedArray(tree));
            });
        });
    });
}
exports.default = getProjFileRecursive;
//# sourceMappingURL=getProjFileRecursive.js.map