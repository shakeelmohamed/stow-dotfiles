"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
function handleVersionsResponse({ response, selectedPackageName }) {
    if (!response.ok) {
        return utils_1.handleError(null, 'Versioning information could not be retrieved from the NuGet package repository. Please try again later.', Promise.reject.bind(Promise));
    }
    return response.json().then((json) => ({ json, selectedPackageName }));
}
exports.default = handleVersionsResponse;
//# sourceMappingURL=handleVersionsResponse.js.map