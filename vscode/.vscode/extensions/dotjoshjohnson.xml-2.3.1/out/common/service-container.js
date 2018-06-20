"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceContainer {
    constructor() {
        this._factoryFunctions = new Map();
        this._services = new Map();
    }
    get(type) {
        if (this._services.has(type)) {
            return this._services.get(type);
        }
        const factory = this._factoryFunctions.get(type);
        const service = factory(this);
        this._services.set(type, service);
        return service;
    }
    register(type, factory) {
        this._factoryFunctions.set(type, factory);
    }
}
exports.ServiceContainer = ServiceContainer;
//# sourceMappingURL=service-container.js.map