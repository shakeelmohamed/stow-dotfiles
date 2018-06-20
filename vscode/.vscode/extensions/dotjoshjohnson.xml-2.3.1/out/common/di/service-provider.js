"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceProvider {
    constructor() {
        this._descriptors = [];
    }
    addService(descriptor) {
        this._descriptors.push(descriptor);
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=service-provider.js.map