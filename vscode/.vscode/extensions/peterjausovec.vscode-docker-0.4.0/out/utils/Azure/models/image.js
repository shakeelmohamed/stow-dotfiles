"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Class Azure Image: Used locally, Organizes data for managing images */
class AzureImage {
    constructor(repository, tag, created) {
        this.registry = repository.registry;
        this.repository = repository;
        this.tag = tag;
        this.subscription = repository.subscription;
        this.resourceGroupName = repository.resourceGroupName;
        this.created = created;
        this.password = repository.password;
        this.username = repository.username;
    }
    toString() {
        return `${this.repository.name}:${this.tag}`;
    }
}
exports.AzureImage = AzureImage;
//# sourceMappingURL=image.js.map