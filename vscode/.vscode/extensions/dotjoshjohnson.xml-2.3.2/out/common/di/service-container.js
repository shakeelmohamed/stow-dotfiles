"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_lifetime_1 = require("./service-lifetime");
class ServiceContainer {
    constructor() {
        this._descriptors = new Map();
        this._singletons = new Map();
    }
    static get default() {
        return this._default || (this._default = new ServiceContainer());
    }
    add(descriptor) {
        this._descriptors.set(descriptor.type, descriptor);
    }
    addSingleton(type, factory) {
        this.add({
            factory: factory || this._getDefaultFactory(type),
            lifetime: service_lifetime_1.ServiceLifetime.Singleton,
            type: type
        });
    }
    addTransient(type, factory) {
        this.add({
            factory: factory || this._getDefaultFactory(type),
            lifetime: service_lifetime_1.ServiceLifetime.Singleton,
            type: type
        });
    }
    get(type) {
        const descriptor = this._descriptors.get(type);
        if (!descriptor) {
            throw new Error("Unable to resolve service type!");
        }
        let service;
        if (descriptor.lifetime === service_lifetime_1.ServiceLifetime.Singleton && this._singletons.has(type)) {
            service = this._singletons.get(type);
        }
        else if (descriptor.lifetime === service_lifetime_1.ServiceLifetime.Singleton) {
            service = this._resolve(type);
            this._singletons.set(type, service);
        }
        else {
            service = this._resolve(type);
        }
        return service;
    }
    _getDefaultFactory(serviceType) {
        return function (container) {
            return new serviceType();
        };
    }
    _resolve(descriptor) {
        return descriptor.factory(this);
    }
}
exports.ServiceContainer = ServiceContainer;
//# sourceMappingURL=service-container.js.map