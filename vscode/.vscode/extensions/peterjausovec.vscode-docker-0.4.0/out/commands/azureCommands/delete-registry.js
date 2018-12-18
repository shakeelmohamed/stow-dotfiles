"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const dockerExtension_1 = require("../../dockerExtension");
const acrTools = require("../../utils/Azure/acrTools");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const nonNull_1 = require("../../utils/nonNull");
const quick_pick_azure_1 = require("../utils/quick-pick-azure");
/** Delete a registry and all it's associated nested items
 * @param context : the AzureRegistryNode the user right clicked on to delete
 */
async function deleteAzureRegistry(context) {
    let registry;
    if (context) {
        registry = context.registry;
    }
    else {
        registry = await quick_pick_azure_1.quickPickACRRegistry(false, 'Select the registry you want to delete');
    }
    const shouldDelete = await quick_pick_azure_1.confirmUserIntent(`Are you sure you want to delete ${registry.name} and its associated images?`);
    if (shouldDelete) {
        let subscription = await acrTools.getSubscriptionFromRegistry(registry);
        let resourceGroup = acrTools.getResourceGroupName(registry);
        const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
        await client.registries.beginDeleteMethod(resourceGroup, nonNull_1.nonNullProp(registry, 'name'));
        vscode.window.showInformationMessage(`Successfully deleted registry ${registry.name}`);
        dockerExtension_1.dockerExplorerProvider.refreshRegistries();
    }
}
exports.deleteAzureRegistry = deleteAzureRegistry;
//# sourceMappingURL=delete-registry.js.map