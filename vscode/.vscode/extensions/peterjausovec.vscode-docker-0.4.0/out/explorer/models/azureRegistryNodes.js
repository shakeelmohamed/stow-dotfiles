"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const acrTools_1 = require("../../utils/Azure/acrTools");
const repository_1 = require("../../utils/Azure/models/repository");
const nonNull_1 = require("../../utils/nonNull");
const commonRegistryUtils_1 = require("./commonRegistryUtils");
const nodeBase_1 = require("./nodeBase");
const taskNode_1 = require("./taskNode");
class AzureRegistryNode extends nodeBase_1.NodeBase {
    constructor(label, azureAccount, registry, subscription) {
        super(label);
        this.label = label;
        this.azureAccount = azureAccount;
        this.registry = registry;
        this.subscription = subscription;
        this.contextValue = 'azureRegistryNode';
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'Registry_16x.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'Registry_16x.svg')
        };
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue,
            iconPath: this.iconPath
        };
    }
    async getChildren(element) {
        const repoNodes = [];
        //Pushing single TaskRootNode under the current registry. All the following nodes added to registryNodes are type AzureRepositoryNode
        let taskNode = new taskNode_1.TaskRootNode("Tasks", element.azureAccount, element.subscription, element.registry);
        repoNodes.push(taskNode);
        if (!this.azureAccount) {
            return [];
        }
        const repositories = await acrTools_1.getRepositoriesByRegistry(element.registry);
        for (let repository of repositories) {
            let node = new AzureRepositoryNode(repository.name, element, this.azureAccount, element.subscription, element.registry, element.label);
            repoNodes.push(node);
        }
        //Note these are ordered by default in alphabetical order
        return repoNodes;
    }
}
exports.AzureRegistryNode = AzureRegistryNode;
class AzureRepositoryNode extends nodeBase_1.NodeBase {
    constructor(label, parent, azureAccount, subscription, registry, repositoryName) {
        super(label);
        this.label = label;
        this.parent = parent;
        this.azureAccount = azureAccount;
        this.subscription = subscription;
        this.registry = registry;
        this.repositoryName = repositoryName;
        this.contextValue = AzureRepositoryNode.contextValue;
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'Repository_16x.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'Repository_16x.svg')
        };
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue,
            iconPath: this.iconPath
        };
    }
    async getChildren(element) {
        const imageNodes = [];
        let node;
        let repo = await repository_1.Repository.Create(element.registry, element.label);
        let images = await acrTools_1.getImagesByRepository(repo);
        for (let img of images) {
            node = new AzureImageTagNode(element.azureAccount, element, img.subscription, img.registry, nonNull_1.getLoginServer(img.registry), img.repository.name, img.tag, img.created);
            imageNodes.push(node);
        }
        return imageNodes;
    }
}
AzureRepositoryNode.contextValue = 'azureRepositoryNode';
exports.AzureRepositoryNode = AzureRepositoryNode;
class AzureImageTagNode extends nodeBase_1.NodeBase {
    constructor(azureAccount, parent, subscription, registry, serverUrl, repositoryName, tag, created) {
        super(AzureImageTagNode.getImageNameWithTag(repositoryName, tag));
        this.azureAccount = azureAccount;
        this.parent = parent;
        this.subscription = subscription;
        this.registry = registry;
        this.serverUrl = serverUrl;
        this.repositoryName = repositoryName;
        this.tag = tag;
        this.created = created;
        this.contextValue = AzureImageTagNode.contextValue;
    }
    static getImageNameWithTag(repositoryName, tag) {
        return `${repositoryName}:${tag}`;
    }
    getTreeItem() {
        return {
            label: commonRegistryUtils_1.formatTag(this.label, this.created),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: this.contextValue
        };
    }
}
AzureImageTagNode.contextValue = 'azureImageTagNode';
exports.AzureImageTagNode = AzureImageTagNode;
class AzureNotSignedInNode extends nodeBase_1.NodeBase {
    constructor() {
        super('Click here to sign in to Azure...');
        this.contextValue = 'azureNotSignedInNode';
    }
    getTreeItem() {
        return {
            label: this.label,
            command: {
                title: this.label,
                command: 'azure-account.login'
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }
}
exports.AzureNotSignedInNode = AzureNotSignedInNode;
class AzureLoadingNode extends nodeBase_1.NodeBase {
    constructor() {
        super('Loading...');
        this.contextValue = 'azureLoadingNode';
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }
}
exports.AzureLoadingNode = AzureLoadingNode;
//# sourceMappingURL=azureRegistryNodes.js.map