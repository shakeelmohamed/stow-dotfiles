"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const path = require("path");
const vscode = require("vscode");
const acrTools = require("../../utils/Azure/acrTools");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const nodeBase_1 = require("./nodeBase");
/* Single TaskRootNode under each Repository. Labeled "Tasks" */
class TaskRootNode extends nodeBase_1.NodeBase {
    constructor(label, azureAccount, subscription, registry) {
        super(label);
        this.label = label;
        this.azureAccount = azureAccount;
        this.subscription = subscription;
        this.registry = registry;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.contextValue = 'taskRootNode';
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'tasks_light.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'tasks_dark.svg')
        };
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: TaskRootNode.contextValue,
            iconPath: this.iconPath
        };
    }
    /* Making a list view of TaskNodes, or the Tasks of the current registry */
    async getChildren(element) {
        const taskNodes = [];
        let tasks = [];
        const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(element.subscription);
        const resourceGroup = acrTools.getResourceGroupName(element.registry);
        tasks = await client.tasks.list(resourceGroup, element.registry.name);
        if (tasks.length === 0) {
            const learnHow = { title: "Learn How to Create Build Tasks" };
            vscode.window.showInformationMessage(`You do not have any Tasks in the registry '${element.registry.name}'.`, learnHow).then(val => {
                if (val === learnHow) {
                    // tslint:disable-next-line:no-unsafe-any
                    opn('https://aka.ms/acr/task');
                }
            });
        }
        for (let task of tasks) {
            let node = new TaskNode(task, element.registry, element.subscription, element);
            taskNodes.push(node);
        }
        return taskNodes;
    }
}
TaskRootNode.contextValue = 'taskRootNode';
exports.TaskRootNode = TaskRootNode;
class TaskNode extends nodeBase_1.NodeBase {
    constructor(task, registry, subscription, parent) {
        super(task.name);
        this.task = task;
        this.registry = registry;
        this.subscription = subscription;
        this.parent = parent;
        this.contextValue = 'taskNode';
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: this.contextValue,
            iconPath: null
        };
    }
}
exports.TaskNode = TaskNode;
//# sourceMappingURL=taskNode.js.map