"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acrTools = require("../acrTools");
/** Class Azure Repository: Used locally, Organizes data for managing Repositories */
class Repository {
    constructor() {
    }
    static async Create(registry, repositoryName, password, username) {
        let repository = new Repository();
        repository.registry = registry;
        repository.resourceGroupName = acrTools.getResourceGroupName(registry);
        repository.subscription = await acrTools.getSubscriptionFromRegistry(registry);
        repository.name = repositoryName;
        repository.password = password;
        repository.username = username;
        return repository;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map