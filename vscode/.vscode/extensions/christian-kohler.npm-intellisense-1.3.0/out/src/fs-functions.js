"use strict";
var fs_1 = require('fs');
exports.fsf = {
    readJson: readJson,
    isFile: isFile,
    readDir: readDir
};
function readJson(file) {
    return new Promise(function (resolve, reject) {
        fs_1.readFile(file, function (err, data) { return err ? reject(err) : resolve(JSON.parse(data.toString())); });
    });
}
function isFile(path) {
    try {
        return fs_1.statSync(path).isFile();
    }
    catch (err) {
        return false;
    }
}
function readDir(path) {
    return new Promise(function (resolve, reject) {
        fs_1.readdir(path, function (err, files) { return err ? reject(err) : resolve(files); });
    });
}
//# sourceMappingURL=fs-functions.js.map