"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
/**
 * Retrieves a property by name from an object and checks that it's not null and not undefined.  It is strongly typed
 * for the property and will give a compile error if the given name is not a property of the source.
 */
function nonNullProp(source, name) {
    let value = source[name];
    return nonNullValue(value, name);
}
exports.nonNullProp = nonNullProp;
/**
 * Validates that a given value is not null and not undefined.
 */
function nonNullValue(value, propertyNameOrMessage) {
    if (util_1.isNullOrUndefined(value)) {
        throw new Error(
        // tslint:disable-next-line:prefer-template
        "Internal error: Expected value to be neither null nor undefined"
            + (propertyNameOrMessage ? `: ${propertyNameOrMessage}` : ''));
    }
    return value;
}
exports.nonNullValue = nonNullValue;
function getId(registry) {
    return nonNullProp(registry, 'id');
}
exports.getId = getId;
function getLoginServer(registry) {
    return nonNullProp(registry, 'loginServer');
}
exports.getLoginServer = getLoginServer;
function getTenantId(subscription) {
    return nonNullProp(subscription, 'tenantId');
}
exports.getTenantId = getTenantId;
function getSubscriptionId(subscription) {
    return nonNullProp(subscription, 'subscriptionId');
}
exports.getSubscriptionId = getSubscriptionId;
//# sourceMappingURL=nonNull.js.map