"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const rootNode_1 = require("./models/rootNode");
class DockerExplorerProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this.refreshImages();
        this.refreshContainers();
        this.refreshRegistries();
    }
    refreshImages() {
        this._onDidChangeTreeData.fire(this._imagesNode);
    }
    refreshContainers() {
        this._onDidChangeTreeData.fire(this._containersNode);
    }
    refreshRegistries() {
        this._onDidChangeTreeData.fire(this._registriesNode);
    }
    refreshNode(element) {
        this._onDidChangeTreeData.fire(element);
    }
    getTreeItem(element) {
        return element.getTreeItem();
    }
    async getChildren(element) {
        if (!element) {
            return this.getRootNodes();
        }
        return element.getChildren(element);
    }
    async getRootNodes() {
        const rootNodes = [];
        let node;
        node = new rootNode_1.RootNode('Images', 'imagesRootNode', this._onDidChangeTreeData);
        this._imagesNode = node;
        rootNodes.push(node);
        node = new rootNode_1.RootNode('Containers', 'containersRootNode', this._onDidChangeTreeData);
        this._containersNode = node;
        rootNodes.push(node);
        node = new rootNode_1.RootNode('Registries', 'registriesRootNode', this._onDidChangeTreeData);
        this._registriesNode = node;
        rootNodes.push(node);
        return rootNodes;
    }
}
exports.DockerExplorerProvider = DockerExplorerProvider;
//# sourceMappingURL=dockerExplorer.js.map