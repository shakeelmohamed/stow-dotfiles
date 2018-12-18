"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class TestKeytar {
    constructor() {
        this._services = new Map();
    }
    async getPassword(service, account) {
        await this.delay();
        let foundService = this._services.get(service);
        if (foundService) {
            return foundService.get(account);
        }
        return undefined;
    }
    async setPassword(service, account, password) {
        await this.delay();
        let foundService = this._services.get(service);
        if (!foundService) {
            foundService = new Map();
            this._services.set(service, foundService);
        }
        foundService.set(account, password);
    }
    async deletePassword(service, account) {
        await this.delay();
        let foundService = this._services.get(service);
        if (foundService) {
            if (foundService.has(account)) {
                foundService.delete(account);
                return true;
            }
        }
        return false;
    }
    async delay() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 1);
        });
    }
}
exports.TestKeytar = TestKeytar;
//# sourceMappingURL=testKeytar.js.map