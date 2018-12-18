"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../../constants");
const asyncpool_1 = require("../../utils/asyncpool");
const dockerHub = require("../utils/dockerHubUtils");
const commonRegistryUtils_1 = require("./commonRegistryUtils");
const nodeBase_1 = require("./nodeBase");
/**
 * This is a child node of the "Docker Hub" node - i.e., it represents a namespace, e.g. a docker ID or an organization name
 */
class DockerHubOrgNode extends nodeBase_1.NodeBase {
    constructor(namespace, userName, password, token) {
        super(namespace);
        this.namespace = namespace;
        this.userName = userName;
        this.password = password;
        this.token = token;
        this.contextValue = DockerHubOrgNode.contextValue;
        this.label = this.namespace;
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
        let node;
        const user = await dockerHub.getUser();
        const myRepos = await dockerHub.getRepositories(user.username);
        const repoPool = new asyncpool_1.AsyncPool(constants_1.MAX_CONCURRENT_REQUESTS);
        // tslint:disable-next-line:prefer-for-of // Grandfathered in
        for (let i = 0; i < myRepos.length; i++) {
            repoPool.addTask(async () => {
                let myRepo = await dockerHub.getRepositoryInfo(myRepos[i]);
                node = new DockerHubRepositoryNode(myRepo.name);
                node.repository = myRepo;
                node.userName = element.userName;
                node.password = element.password;
                repoNodes.push(node);
            });
        }
        await repoPool.runAll();
        repoNodes.sort((a, b) => a.label.localeCompare(b.label));
        return repoNodes;
    }
}
DockerHubOrgNode.contextValue = 'dockerHubOrgNode';
exports.DockerHubOrgNode = DockerHubOrgNode;
class DockerHubRepositoryNode extends nodeBase_1.NodeBase {
    constructor(label) {
        super(label);
        this.label = label;
        this.contextValue = DockerHubRepositoryNode.contextValue;
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
        const myTags = await dockerHub.getRepositoryTags({ namespace: element.repository.namespace, name: element.repository.name });
        for (let tag of myTags) {
            node = new DockerHubImageTagNode(element.repository.name, tag.name);
            node.password = element.password;
            node.userName = element.userName;
            node.repository = element.repository;
            node.created = new Date(tag.last_updated);
            imageNodes.push(node);
        }
        return imageNodes;
    }
}
DockerHubRepositoryNode.contextValue = 'dockerHubRepositoryNode';
exports.DockerHubRepositoryNode = DockerHubRepositoryNode;
class DockerHubImageTagNode extends nodeBase_1.NodeBase {
    constructor(repositoryName, tag) {
        super(`${repositoryName}:${tag}`);
        this.repositoryName = repositoryName;
        this.tag = tag;
        this.contextValue = DockerHubImageTagNode.contextValue;
        // this needs to be empty string for Docker Hub
        this.serverUrl = '';
    }
    getTreeItem() {
        return {
            label: commonRegistryUtils_1.formatTag(this.label, this.created),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: this.contextValue
        };
    }
}
DockerHubImageTagNode.contextValue = 'dockerHubImageTagNode';
exports.DockerHubImageTagNode = DockerHubImageTagNode;
//# sourceMappingURL=dockerHubNodes.js.map