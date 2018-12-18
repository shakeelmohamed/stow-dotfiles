"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class Lazy {
    constructor(valueFactory) {
        this.valueFactory = valueFactory;
        this._isValueCreated = false;
    }
    get isValueCreated() {
        return this._isValueCreated;
    }
    get value() {
        if (!this._isValueCreated) {
            this._value = this.valueFactory();
            this._isValueCreated = true;
        }
        return this._value;
    }
}
exports.Lazy = Lazy;
exports.default = Lazy;
//# sourceMappingURL=lazy.js.map