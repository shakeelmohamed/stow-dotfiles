"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
function getProjFileExtension(projFile) {
    return (projFile.match(constants_1.projFileExtensionMatcher) || [])[1];
}
exports.default = getProjFileExtension;
//# sourceMappingURL=getProjFileExtension.js.map