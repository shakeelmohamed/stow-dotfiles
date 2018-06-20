"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// NOTE: Does not handle (or check for) circular structures.
function flattenNestedArray(array) {
    return array.reduce((flattened, item) => flattened.concat(Array.isArray(item) ? flattenNestedArray(item) : item), []);
}
exports.default = flattenNestedArray;
//# sourceMappingURL=flattenNestedArray.js.map