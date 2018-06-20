"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleSearchResponse(response) {
    if (!response.ok) {
        return Promise.reject('The NuGet package repository returned a bad response. Please try again later.');
    }
    return response.json();
}
exports.default = handleSearchResponse;
//# sourceMappingURL=handleSearchResponse.js.map