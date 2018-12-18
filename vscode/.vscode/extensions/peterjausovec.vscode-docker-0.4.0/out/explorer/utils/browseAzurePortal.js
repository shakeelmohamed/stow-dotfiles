"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const nonNull_1 = require("../../utils/nonNull");
const azureRegistryNodes_1 = require("../models/azureRegistryNodes");
function browseAzurePortal(node) {
    if (node && node.azureAccount) {
        const tenantId = nonNull_1.getTenantId(node.subscription);
        const session = nonNull_1.nonNullValue(node.azureAccount.sessions.find(s => s.tenantId.toLowerCase() === tenantId.toLowerCase()), `Unable to find session with tenantId ${tenantId}`);
        let url = `${session.environment.portalUrl}/${tenantId}/#resource${node.registry.id}`;
        if (node.contextValue === azureRegistryNodes_1.AzureImageTagNode.contextValue || node.contextValue === azureRegistryNodes_1.AzureRepositoryNode.contextValue) {
            url = `${url}/repository`;
        }
        // tslint:disable-next-line:no-unsafe-any
        opn(url);
    }
}
exports.browseAzurePortal = browseAzurePortal;
//# sourceMappingURL=browseAzurePortal.js.map