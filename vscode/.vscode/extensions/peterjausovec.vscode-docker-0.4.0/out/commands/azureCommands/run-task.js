"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const acrTools = require("../../utils/Azure/acrTools");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const quick_pick_azure_1 = require("../utils/quick-pick-azure");
const SourceArchiveUtility_1 = require("../utils/SourceArchiveUtility");
// Runs the selected yaml file. Equivalent to az acr run -f <yaml file> <directory>
// Selected source code must contain a path to the desired dockerfile.
async function runTaskFile(yamlFileUri) {
    await SourceArchiveUtility_1.scheduleRunRequest(yamlFileUri, "FileTaskRunRequest");
}
exports.runTaskFile = runTaskFile;
async function runTask(context) {
    let taskName;
    let subscription;
    let resourceGroup;
    let registry;
    if (context) { // Right Click
        subscription = context.subscription;
        registry = context.registry;
        resourceGroup = await acrTools.getResourceGroup(registry, subscription);
        taskName = context.task.name;
    }
    else { // Command Palette
        subscription = await quick_pick_azure_1.quickPickSubscription();
        registry = await quick_pick_azure_1.quickPickACRRegistry();
        resourceGroup = await acrTools.getResourceGroup(registry, subscription);
        taskName = (await quick_pick_azure_1.quickPickTask(registry, subscription, resourceGroup)).name;
    }
    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    let runRequest = {
        type: 'TaskRunRequest',
        taskName: taskName
    };
    try {
        let taskRun = await client.registries.scheduleRun(resourceGroup.name, registry.name, runRequest);
        vscode.window.showInformationMessage(`Successfully scheduled the Task '${taskName}' with ID '${taskRun.runId}'.`);
    }
    catch (err) {
        throw new Error(`Failed to schedule the Task '${taskName}'\nError: '${vscode_azureextensionui_1.parseError(err).message}'`);
    }
}
exports.runTask = runTask;
//# sourceMappingURL=run-task.js.map