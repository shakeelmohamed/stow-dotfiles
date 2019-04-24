"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants = require("../constants");
function createDocumentSelector(language) {
    return [
        { language, scheme: constants.uriSchemes.file },
        { language, scheme: constants.uriSchemes.untitled },
    ];
}
exports.createDocumentSelector = createDocumentSelector;
//# sourceMappingURL=create-document-selector.js.map