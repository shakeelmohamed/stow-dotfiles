"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const commonRegistryUtils_1 = require("./commonRegistryUtils");
const nodeBase_1 = require("./nodeBase");
const registryType_1 = require("./registryType");
class CustomRegistryNode extends nodeBase_1.NodeBase {
    constructor(registryName, registry) {
        super(registryName);
        this.registryName = registryName;
        this.registry = registry;
        this.type = registryType_1.RegistryType.Custom;
        this.contextValue = CustomRegistryNode.contextValue;
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'Registry_16x.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'Registry_16x.svg')
        };
    }
    getTreeItem() {
        return {
            label: this.registryName,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue,
            iconPath: this.iconPath
        };
    }
    // Returns undefined if it's valid, otherwise returns an error message
    static async verifyIsValidRegistryUrl(registry) {
        // If the call succeeds, it's a V2 registry (https://docs.docker.com/registry/spec/api/#api-version-check)
        await commonRegistryUtils_1.registryRequest(registry.url, 'v2/', registry.credentials);
    }
    async getChildren(element) {
        const repoNodes = [];
        try {
            let repositories = await commonRegistryUtils_1.getCatalog(this.registry.url, this.registry.credentials);
            for (let repoName of repositories) {
                repoNodes.push(new CustomRepositoryNode(repoName, this.registry));
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(vscode_azureextensionui_1.parseError(error).message);
        }
        return repoNodes;
    }
}
CustomRegistryNode.contextValue = 'customRegistryNode';
exports.CustomRegistryNode = CustomRegistryNode;
class CustomRepositoryNode extends nodeBase_1.NodeBase {
    constructor(repositoryName, // e.g. 'hello-world' or 'registry'
    registry) {
        super(repositoryName);
        this.repositoryName = repositoryName;
        this.registry = registry;
        this.contextValue = CustomRepositoryNode.contextValue;
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
        try {
            let tagInfos = await commonRegistryUtils_1.getTags(this.registry.url, this.repositoryName, this.registry.credentials);
            for (let tagInfo of tagInfos) {
                node = new CustomImageTagNode(this.registry, this.repositoryName, tagInfo.tag, tagInfo.created);
                imageNodes.push(node);
            }
            return imageNodes;
        }
        catch (error) {
            let message = `Docker: Unable to retrieve Repository Tags: ${vscode_azureextensionui_1.parseError(error).message}`;
            console.error(message);
            vscode.window.showErrorMessage(message);
        }
        return imageNodes;
    }
}
CustomRepositoryNode.contextValue = 'customRepository';
exports.CustomRepositoryNode = CustomRepositoryNode;
class CustomImageTagNode extends nodeBase_1.NodeBase {
    constructor(registry, repositoryName, tag, created) {
        super(`${repositoryName}:${tag}`);
        this.registry = registry;
        this.repositoryName = repositoryName;
        this.tag = tag;
        this.created = created;
        this.contextValue = CustomImageTagNode.contextValue;
    }
    get serverUrl() {
        return this.registry.url;
    }
    getTreeItem() {
        return {
            label: commonRegistryUtils_1.formatTag(this.label, this.created),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: this.contextValue
        };
    }
}
CustomImageTagNode.contextValue = 'customImageTagNode';
exports.CustomImageTagNode = CustomImageTagNode;
class CustomLoadingNode extends nodeBase_1.NodeBase {
    constructor() {
        super('Loading...');
        this.contextValue = 'customLoadingNode';
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }
}
exports.CustomLoadingNode = CustomLoadingNode;
//# sourceMappingURL=customRegistryNodes.js.map