"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Writes an error to the console but rejects with a nicer error message for the user.
 *
 * @param {Error} err
 * @param {string} displayMessage
 * @param {Function} rejector - the function to use for rejecting
 */
function handleError(err, displayMessage, rejector) {
    console.error(err || displayMessage);
    return rejector(displayMessage);
}
exports.default = handleError;
//# sourceMappingURL=handleError.js.map