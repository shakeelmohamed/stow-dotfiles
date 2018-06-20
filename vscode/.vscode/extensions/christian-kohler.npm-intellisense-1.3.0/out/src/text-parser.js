"use strict";
function getCurrentLine(document, position) {
    return document.getText(document.lineAt(position).range);
}
exports.getCurrentLine = getCurrentLine;
function getTextWithinString(text, position) {
    var textToPosition = text.substring(0, position);
    var quoatationPosition = Math.max(textToPosition.lastIndexOf('\"'), textToPosition.lastIndexOf('\''));
    return quoatationPosition != -1 ? textToPosition.substring(quoatationPosition + 1, textToPosition.length) : undefined;
}
exports.getTextWithinString = getTextWithinString;
//# sourceMappingURL=text-parser.js.map