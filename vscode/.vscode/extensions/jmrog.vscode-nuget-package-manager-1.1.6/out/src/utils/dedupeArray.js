"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// NOTE: naively dedupes using `toString`, so be careful.
function dedupeArray(array) {
    const seenValuesMap = {};
    return array.filter((item) => (!seenValuesMap[item.toString()] && (seenValuesMap[item.toString()] = true)));
}
exports.default = dedupeArray;
//# sourceMappingURL=dedupeArray.js.map