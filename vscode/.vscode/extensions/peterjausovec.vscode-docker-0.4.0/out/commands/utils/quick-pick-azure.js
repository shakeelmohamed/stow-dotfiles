"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../../constants");
const extensionVariables_1 = require("../../extensionVariables");
const acrTools = require("../../utils/Azure/acrTools");
const common_1 = require("../../utils/Azure/common");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const create_registry_1 = require("../azureCommands/create-registry");
async function quickPickACRImage(repository, prompt) {
    const placeHolder = prompt ? prompt : 'Select image to use';
    const repoImages = await acrTools.getImagesByRepository(repository);
    const imageListNames = repoImages.map(img => ({ label: img.tag, data: img }));
    let desiredImage = await extensionVariables_1.ext.ui.showQuickPick(imageListNames, { 'canPickMany': false, 'placeHolder': placeHolder });
    return desiredImage.data;
}
exports.quickPickACRImage = quickPickACRImage;
async function quickPickACRRepository(registry, prompt) {
    const placeHolder = prompt ? prompt : 'Select repository to use';
    const repositories = await acrTools.getRepositoriesByRegistry(registry);
    const quickPickRepoList = repositories.map(repo => ({ label: repo.name, data: repo }));
    let desiredRepo = await extensionVariables_1.ext.ui.showQuickPick(quickPickRepoList, { 'canPickMany': false, 'placeHolder': placeHolder });
    return desiredRepo.data;
}
exports.quickPickACRRepository = quickPickACRRepository;
async function quickPickTask(registry, subscription, resourceGroup, prompt) {
    const placeHolder = prompt ? prompt : 'Choose a Task';
    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    let tasks = await client.tasks.list(resourceGroup.name, registry.name);
    const quickpPickBTList = tasks.map(task => ({ label: task.name, data: task }));
    let desiredTask = await extensionVariables_1.ext.ui.showQuickPick(quickpPickBTList, { 'canPickMany': false, 'placeHolder': placeHolder });
    return desiredTask.data;
}
exports.quickPickTask = quickPickTask;
async function quickPickACRRegistry(canCreateNew = false, prompt) {
    const placeHolder = prompt ? prompt : 'Select registry';
    let registries = await azureUtilityManager_1.AzureUtilityManager.getInstance().getRegistries();
    let quickPickRegList = registries.map(reg => ({ label: reg.name, data: reg }));
    let createNewItem = { label: '+ Create new registry', data: undefined };
    if (canCreateNew) {
        quickPickRegList.unshift(createNewItem);
    }
    let desiredReg = await extensionVariables_1.ext.ui.showQuickPick(quickPickRegList, {
        'canPickMany': false,
        'placeHolder': placeHolder
    });
    let registry;
    if (desiredReg === createNewItem) {
        registry = await create_registry_1.createRegistry();
    }
    else {
        registry = desiredReg.data;
    }
    return registry;
}
exports.quickPickACRRegistry = quickPickACRRegistry;
async function quickPickSKU() {
    const quickPickSkuList = constants_1.skus.map(sk => ({ label: sk, data: sk }));
    let desiredSku = await extensionVariables_1.ext.ui.showQuickPick(quickPickSkuList, {
        'canPickMany': false,
        'placeHolder': 'Choose a SKU to use'
    });
    return desiredSku.data;
}
exports.quickPickSKU = quickPickSKU;
async function quickPickSubscription() {
    const subscriptions = await azureUtilityManager_1.AzureUtilityManager.getInstance().getFilteredSubscriptionList();
    if (subscriptions.length === 0) {
        vscode.window.showErrorMessage("You do not have any subscriptions. You can create one in your Azure portal", "Open Portal").then(val => {
            if (val === "Open Portal") {
                // tslint:disable-next-line:no-unsafe-any
                opn('https://portal.azure.com/');
            }
        });
    }
    if (subscriptions.length === 1) {
        return subscriptions[0];
    }
    let quickPickSubList = subscriptions.map(sub => ({ label: sub.displayName, data: sub }));
    let desiredSub = await extensionVariables_1.ext.ui.showQuickPick(quickPickSubList, {
        'canPickMany': false,
        'placeHolder': 'Select a subscription to use'
    });
    return desiredSub.data;
}
exports.quickPickSubscription = quickPickSubscription;
async function quickPickLocation(subscription) {
    let locations = await azureUtilityManager_1.AzureUtilityManager.getInstance().getLocationsBySubscription(subscription);
    let quickPickLocList = locations.map(loc => ({ label: loc.displayName, data: loc }));
    quickPickLocList.sort((loc1, loc2) => {
        return loc1.data.displayName.localeCompare(loc2.data.displayName);
    });
    let desiredLocation = await extensionVariables_1.ext.ui.showQuickPick(quickPickLocList, {
        'canPickMany': false,
        'placeHolder': 'Select a location to use'
    });
    return desiredLocation.label;
}
exports.quickPickLocation = quickPickLocation;
async function quickPickResourceGroup(canCreateNew, subscription) {
    let resourceGroups = await azureUtilityManager_1.AzureUtilityManager.getInstance().getResourceGroups(subscription);
    let quickPickResourceGroups = resourceGroups.map(res => ({ label: res.name, data: res }));
    let createNewItem = { label: '+ Create new resource group', data: undefined };
    if (canCreateNew) {
        quickPickResourceGroups.unshift(createNewItem);
    }
    let desiredResGroup = await extensionVariables_1.ext.ui.showQuickPick(quickPickResourceGroups, {
        'canPickMany': false,
        'placeHolder': 'Choose a resource group to use'
    });
    let resourceGroup;
    if (desiredResGroup === createNewItem) {
        if (!subscription) {
            subscription = await quickPickSubscription();
        }
        const loc = await quickPickLocation(subscription);
        resourceGroup = await createNewResourceGroup(loc, subscription);
    }
    else {
        resourceGroup = desiredResGroup.data;
    }
    return resourceGroup;
}
exports.quickPickResourceGroup = quickPickResourceGroup;
/** Requests confirmation for an action and returns true only in the case that the user types in yes
 * @param yesOrNoPrompt Should be a yes or no question
 */
async function confirmUserIntent(yesOrNoPrompt) {
    let opt = {
        ignoreFocusOut: true,
        placeHolder: 'Enter "Yes"',
        value: 'No',
        prompt: yesOrNoPrompt + ' Enter yes to continue'
    };
    let answer = await extensionVariables_1.ext.ui.showInputBox(opt);
    answer = answer.toLowerCase();
    if (answer === 'yes') {
        return answer === 'yes';
    }
    else {
        throw new vscode_azureextensionui_1.UserCancelledError();
    }
}
exports.confirmUserIntent = confirmUserIntent;
/*Creates a new resource group within the current subscription */
async function createNewResourceGroup(loc, subscription) {
    const resourceGroupClient = await azureUtilityManager_1.AzureUtilityManager.getInstance().getResourceManagementClient(subscription);
    let opt = {
        validateInput: async (value) => { return await checkForValidResourcegroupName(value, resourceGroupClient); },
        ignoreFocusOut: false,
        prompt: 'New resource group name?'
    };
    let resourceGroupName = await extensionVariables_1.ext.ui.showInputBox(opt);
    let newResourceGroup = {
        name: resourceGroupName,
        location: loc,
    };
    return await resourceGroupClient.resourceGroups.createOrUpdate(resourceGroupName, newResourceGroup);
}
async function checkForValidResourcegroupName(resourceGroupName, resourceGroupClient) {
    let check = common_1.isValidAzureName(resourceGroupName);
    if (!check.isValid) {
        return check.message;
    }
    let resourceGroupStatus = await resourceGroupClient.resourceGroups.checkExistence(resourceGroupName);
    if (resourceGroupStatus) {
        return 'This resource group is already in use';
    }
    return undefined;
}
//# sourceMappingURL=quick-pick-azure.js.map