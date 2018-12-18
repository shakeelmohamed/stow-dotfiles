"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const getCoreNodeModule_1 = require("./getCoreNodeModule");
/**
 * Returns the keytar module installed with vscode
 */
function getKeytarModule() {
    const keytar = getCoreNodeModule_1.getCoreNodeModule('keytar');
    if (!keytar) {
        throw new Error("Internal error: Could not find keytar module for reading and writing passwords");
    }
    else {
        return keytar;
    }
}
class Keytar {
    constructor(_keytar) {
        this._keytar = _keytar;
    }
    static tryCreate() {
        let keytar = getKeytarModule();
        if (keytar) {
            return new Keytar(keytar);
        }
        else {
            return undefined;
        }
    }
    async getPassword(service, account) {
        return await this._keytar.getPassword(service, account) || undefined;
    }
    async setPassword(service, account, password) {
        await this._keytar.setPassword(service, account, password);
    }
    async deletePassword(service, account) {
        return await this._keytar.deletePassword(service, account);
    }
}
exports.Keytar = Keytar;
//# sourceMappingURL=keytar.js.map