"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { toString } = Object.prototype;
function isPlainObject(candidate) {
    return toString.call(candidate) === '[object Object]';
}
exports.default = isPlainObject;
//# sourceMappingURL=isPlainObject.js.map