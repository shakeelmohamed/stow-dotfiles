"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const dockerExtension_1 = require("../../dockerExtension");
const extensionVariables_1 = require("../../extensionVariables");
const common_1 = require("../../utils/Azure/common");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const nonNull_1 = require("../../utils/nonNull");
const quick_pick_azure_1 = require("../utils/quick-pick-azure");
/* Creates a new Azure container registry based on user input/selection of features */
async function createRegistry() {
    const subscription = await quick_pick_azure_1.quickPickSubscription();
    const resourceGroup = await quick_pick_azure_1.quickPickResourceGroup(true, subscription);
    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    const registryName = await acquireRegistryName(client);
    const sku = await quick_pick_azure_1.quickPickSKU();
    const location = await quick_pick_azure_1.quickPickLocation(subscription);
    const registry = await client.registries.beginCreate(nonNull_1.nonNullProp(resourceGroup, 'name'), registryName, {
        'sku': { 'name': sku },
        'location': location
    });
    vscode.window.showInformationMessage(registry.name + ' has been created succesfully!');
    dockerExtension_1.dockerExplorerProvider.refreshRegistries();
    return registry;
}
exports.createRegistry = createRegistry;
/** Acquires a new registry name from a user, validating that the name is unique */
async function acquireRegistryName(client) {
    let opt = {
        validateInput: async (value) => { return await checkForValidName(value, client); },
        ignoreFocusOut: false,
        prompt: 'Enter the new registry name? '
    };
    let registryName = await extensionVariables_1.ext.ui.showInputBox(opt);
    return registryName;
}
async function checkForValidName(registryName, client) {
    let check = common_1.isValidAzureName(registryName);
    if (!check.isValid) {
        return check.message;
    }
    let registryStatus = await client.registries.checkNameAvailability({ 'name': registryName });
    if (registryStatus.message) {
        return registryStatus.message;
    }
    return undefined;
}
//# sourceMappingURL=create-registry.js.map