"use strict";
function shouldProvide(state) {
    return isImportOrRequire(state.textCurrentLine, state.cursorPosition)
        && !startsWithADot(state.textCurrentLine, state.cursorPosition);
}
exports.shouldProvide = shouldProvide;
function isImportOrRequire(textCurrentLine, position) {
    var isImport = textCurrentLine.substring(0, 6) === 'import';
    var isRequire = textCurrentLine.indexOf('require(') != -1;
    return (isImport && (isAfterFrom(textCurrentLine, position)
        || isImportWithoutFrom(textCurrentLine, position))) || isRequire;
}
function isAfterFrom(textCurrentLine, position) {
    var fromPosition = stringMatches(textCurrentLine, [
        ' from \'', ' from "',
        '}from \'', '}from "'
    ]);
    return fromPosition != -1 && fromPosition < position;
}
function isImportWithoutFrom(textCurrentLine, postition) {
    var modulePosition = stringMatches(textCurrentLine, [
        ' \'',
        '\'',
        '"',
        ' "'
    ], true);
    return modulePosition != -1 && modulePosition < postition;
}
function stringMatches(textCurrentLine, strings, searchFromStart) {
    if (searchFromStart === void 0) { searchFromStart = false; }
    return strings.reduce(function (position, str) {
        var textPosition = searchFromStart
            ? textCurrentLine.indexOf(str)
            : textCurrentLine.lastIndexOf(str);
        return Math.max(position, textPosition);
    }, -1);
}
function startsWithADot(textCurrentLine, position) {
    var textWithinString = getTextWithinString(textCurrentLine, position);
    return textWithinString
        && textWithinString.length > 0
        && textWithinString[0] === '.';
}
function getTextWithinString(text, position) {
    var textToPosition = text.substring(0, position);
    var quoatationPosition = Math.max(textToPosition.lastIndexOf('\"'), textToPosition.lastIndexOf('\''));
    return quoatationPosition != -1 ? textToPosition.substring(quoatationPosition + 1, textToPosition.length) : undefined;
}
//# sourceMappingURL=shouldProvide.js.map