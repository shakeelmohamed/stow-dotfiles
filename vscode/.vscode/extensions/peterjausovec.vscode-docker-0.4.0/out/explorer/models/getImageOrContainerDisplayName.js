"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const extractRegExGroups_1 = require("../../helpers/extractRegExGroups");
const utils_1 = require("../utils/utils");
function getImageOrContainerDisplayName(fullName, truncateLongRegistryPaths, truncateMaxLength) {
    if (!truncateLongRegistryPaths) {
        return fullName;
    }
    // Extra registry from the rest of the name
    let [registry, restOfName] = extractRegExGroups_1.extractRegExGroups(fullName, /^([^\/]+)\/(.*)$/, ['', fullName]);
    let trimmedRegistry;
    if (registry) {
        registry = utils_1.trimWithElipsis(registry, truncateMaxLength);
        return `${registry}/${restOfName}`;
    }
    return fullName;
}
exports.getImageOrContainerDisplayName = getImageOrContainerDisplayName;
//# sourceMappingURL=getImageOrContainerDisplayName.js.map