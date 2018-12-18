"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let alphaNum = new RegExp('^[a-zA-Z0-9]*$');
function isValidAzureName(value) {
    if (value.length < 5 || value.length > 50) {
        return { isValid: false, message: 'Name must be between 5 and 50 characters' };
    }
    else if (!alphaNum.test(value)) {
        return { isValid: false, message: 'Name may contain alpha numeric characters only' };
    }
    else {
        return { isValid: true };
    }
}
exports.isValidAzureName = isValidAzureName;
//# sourceMappingURL=common.js.map