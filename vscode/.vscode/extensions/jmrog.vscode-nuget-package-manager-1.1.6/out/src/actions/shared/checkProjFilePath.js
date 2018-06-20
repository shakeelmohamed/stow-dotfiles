"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const _1 = require("./");
function checkProjFilePath(startPath) {
    return _1.getProjFileRecursive(startPath)
        .then((foundProjFile) => {
        if (foundProjFile.length < 1) {
            return utils_1.handleError(null, 'Cannot find any .csproj or .fsproj file for your project! Please fix this error and try again.', Promise.reject.bind(Promise));
        }
        return foundProjFile;
    });
}
exports.default = checkProjFilePath;
//# sourceMappingURL=checkProjFilePath.js.map