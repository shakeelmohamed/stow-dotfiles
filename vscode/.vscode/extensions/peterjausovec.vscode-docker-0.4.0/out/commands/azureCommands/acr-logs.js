"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const azureRegistryNodes_1 = require("../../explorer/models/azureRegistryNodes");
const taskNode_1 = require("../../explorer/models/taskNode");
const acrTools_1 = require("../../utils/Azure/acrTools");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const quick_pick_azure_1 = require("../utils/quick-pick-azure");
const logFileManager_1 = require("./acr-logs-utils/logFileManager");
const tableDataManager_1 = require("./acr-logs-utils/tableDataManager");
const tableViewManager_1 = require("./acr-logs-utils/tableViewManager");
/**  This command is used through a right click on an azure registry, repository or image in the Docker Explorer. It is used to view ACR logs for a given item. */
async function viewACRLogs(context) {
    let registry;
    let subscription;
    if (!context) {
        registry = await quick_pick_azure_1.quickPickACRRegistry();
        subscription = await acrTools_1.getSubscriptionFromRegistry(registry);
    }
    else {
        registry = context.registry;
        subscription = context.subscription;
    }
    let resourceGroup = acrTools_1.getResourceGroupName(registry);
    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    let logData = new tableDataManager_1.LogData(client, registry, resourceGroup);
    // Filtering provided
    if (context && context instanceof azureRegistryNodes_1.AzureImageTagNode) {
        //ACR Image Logs
        await logData.loadLogs({
            webViewEvent: false,
            loadNext: false,
            removeOld: false,
            filter: { image: context.label }
        });
        if (!hasValidLogContent(context, logData)) {
            return;
        }
        const url = await logData.getLink(0);
        await logFileManager_1.accessLog(url, logData.logs[0].runId, false);
    }
    else {
        if (context && context instanceof taskNode_1.TaskNode) {
            //ACR Task Logs
            await logData.loadLogs({
                webViewEvent: false,
                loadNext: false,
                removeOld: false,
                filter: { task: context.label }
            });
        }
        else {
            //ACR Registry Logs
            await logData.loadLogs({
                webViewEvent: false,
                loadNext: false
            });
        }
        if (!hasValidLogContent(context, logData)) {
            return;
        }
        let webViewTitle = registry.name;
        if (context instanceof taskNode_1.TaskNode) {
            webViewTitle += '/' + context.label;
        }
        const webview = new tableViewManager_1.LogTableWebview(webViewTitle, logData);
    }
}
exports.viewACRLogs = viewACRLogs;
function hasValidLogContent(context, logData) {
    if (logData.logs.length === 0) {
        let itemType;
        if (context && context instanceof taskNode_1.TaskNode) {
            itemType = 'task';
        }
        else if (context && context instanceof azureRegistryNodes_1.AzureImageTagNode) {
            itemType = 'image';
        }
        else {
            itemType = 'registry';
        }
        vscode.window.showInformationMessage(`This ${itemType} has no associated logs`);
        return false;
    }
    return true;
}
//# sourceMappingURL=acr-logs.js.map