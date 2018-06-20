"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function pathExists(stringPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fsAccess(stringPath, fs.constants.F_OK);
            return true;
        }
        catch (e) {
            return false;
        }
    });
}
exports.pathExists = pathExists;
function fsAccess(stringPath, checks) {
    return promisifier(fs.access, stringPath, checks);
}
// adapted from vs/base/common/async
function promisifier(fn, ...args) {
    return new Promise((c, e) => fn(...args, (err, result) => err ? e(err) : c(result)));
}
exports.promisifier = promisifier;
function readFileAsync(filePath, encoding) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield promisifier(fs.readFile, filePath, encoding);
    });
}
exports.readFileAsync = readFileAsync;
//# sourceMappingURL=fsWrapper.js.map