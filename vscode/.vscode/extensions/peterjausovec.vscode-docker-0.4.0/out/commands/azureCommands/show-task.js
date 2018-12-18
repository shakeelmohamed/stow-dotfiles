"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acrTools = require("../../utils/Azure/acrTools");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const quick_pick_azure_1 = require("../utils/quick-pick-azure");
const showTaskManager_1 = require("./task-utils/showTaskManager");
async function showTaskProperties(context) {
    let subscription;
    let registry;
    let resourceGroup;
    let task;
    if (context) { // Right click
        subscription = context.subscription;
        registry = context.registry;
        resourceGroup = await acrTools.getResourceGroup(registry, subscription);
        task = context.task.name;
    }
    else { // Command palette
        subscription = await quick_pick_azure_1.quickPickSubscription();
        registry = await quick_pick_azure_1.quickPickACRRegistry();
        resourceGroup = await acrTools.getResourceGroup(registry, subscription);
        task = (await quick_pick_azure_1.quickPickTask(registry, subscription, resourceGroup)).name;
    }
    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    let item = await client.tasks.get(resourceGroup.name, registry.name, task);
    let indentation = 2;
    showTaskManager_1.openTask(JSON.stringify(item, undefined, indentation), task);
}
exports.showTaskProperties = showTaskProperties;
//# sourceMappingURL=show-task.js.map