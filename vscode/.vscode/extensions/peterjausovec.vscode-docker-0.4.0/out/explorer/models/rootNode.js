"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const docker_endpoint_1 = require("../../commands/utils/docker-endpoint");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const dockerConnectionError_1 = require("../utils/dockerConnectionError");
const containerNode_1 = require("./containerNode");
const errorNode_1 = require("./errorNode");
const imageNode_1 = require("./imageNode");
const nodeBase_1 = require("./nodeBase");
const registryRootNode_1 = require("./registryRootNode");
const imageFilters = {
    "filters": {
        "dangling": ["false"]
    }
};
const containerFilters = {
    "filters": {
        "status": ["created", "restarting", "running", "paused", "exited", "dead"]
    }
};
class RootNode extends nodeBase_1.NodeBase {
    constructor(label, contextValue, eventEmitter) {
        super(label);
        this.label = label;
        this.contextValue = contextValue;
        this.eventEmitter = eventEmitter;
        if (this.contextValue === 'imagesRootNode') {
            this._imagesNode = this;
        }
        else if (this.contextValue === 'containersRootNode') {
            this._containersNode = this;
        }
    }
    autoRefreshImages() {
        const configOptions = vscode.workspace.getConfiguration('docker');
        const refreshInterval = configOptions.get('explorerRefreshInterval', 1000);
        // https://github.com/Microsoft/vscode/issues/30535
        // if (this._imagesNode.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
        //     clearInterval(this._imageDebounceTimer);
        //     return;
        // }
        if (this._imageDebounceTimer) {
            clearInterval(this._imageDebounceTimer);
        }
        if (refreshInterval > 0) {
            this._imageDebounceTimer = setInterval(async () => {
                const images = await docker_endpoint_1.docker.getImageDescriptors(imageFilters);
                images.sort((img1, img2) => {
                    if (img1.Id > img2.Id) {
                        return -1;
                    }
                    else if (img1.Id < img2.Id) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });
                if (!this._sortedImageCache) {
                    this._sortedImageCache = images;
                    return;
                }
                let imagesAsJson = JSON.stringify(images);
                let cacheAsJson = JSON.stringify(this._sortedImageCache);
                if (imagesAsJson !== cacheAsJson) {
                    this.eventEmitter.fire(this._imagesNode);
                    this._sortedImageCache = images;
                }
            }, refreshInterval);
        }
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue
        };
    }
    async getChildren(element) {
        switch (element.contextValue) {
            case 'imagesRootNode': {
                return this.getImages();
            }
            case 'containersRootNode': {
                return this.getContainers();
            }
            case 'registriesRootNode': {
                return this.getRegistries();
            }
            default: {
                throw new Error(`Unexpected contextValue ${element.contextValue}`);
            }
        }
    }
    async getImages() {
        // tslint:disable-next-line:no-this-assignment
        let me = this;
        return await vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('getChildren.images', async function () {
            const imageNodes = [];
            let images;
            try {
                images = await docker_endpoint_1.docker.getImageDescriptors(imageFilters);
                if (!images || images.length === 0) {
                    return [];
                }
                for (let image of images) {
                    if (!image.RepoTags) {
                        let node = new imageNode_1.ImageNode(`<none>:<none>`, image, me.eventEmitter);
                        node.imageDesc = image;
                        imageNodes.push(node);
                    }
                    else {
                        for (let repoTag of image.RepoTags) {
                            let node = new imageNode_1.ImageNode(`${repoTag}`, image, me.eventEmitter);
                            node.imageDesc = image;
                            imageNodes.push(node);
                        }
                    }
                }
            }
            catch (error) {
                let newError = dockerConnectionError_1.showDockerConnectionError(this, error);
                return [new errorNode_1.ErrorNode(newError, errorNode_1.ErrorNode.getImagesErrorContextValue)];
            }
            me.autoRefreshImages();
            return imageNodes;
        });
    }
    isContainerUnhealthy(container) {
        return container.Status.includes('(unhealthy)');
    }
    autoRefreshContainers() {
        const configOptions = vscode.workspace.getConfiguration('docker');
        const refreshInterval = configOptions.get('explorerRefreshInterval', 1000);
        // https://github.com/Microsoft/vscode/issues/30535
        // if (this._containersNode.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
        //     clearInterval(this._containerDebounceTimer);
        //     return;
        // }
        if (this._containerDebounceTimer) {
            clearInterval(this._containerDebounceTimer);
        }
        if (refreshInterval > 0) {
            this._containerDebounceTimer = setInterval(async () => {
                let needToRefresh = false;
                let found = false;
                const containers = await docker_endpoint_1.docker.getContainerDescriptors(containerFilters);
                if (!this._containerCache) {
                    this._containerCache = containers;
                }
                if (this._containerCache.length !== containers.length) {
                    needToRefresh = true;
                }
                else {
                    for (let cachedContainer of this._containerCache) {
                        let ctr = cachedContainer;
                        for (let cont of containers) {
                            // can't do a full object compare because "Status" keeps changing for running containers
                            if (ctr.Id === cont.Id &&
                                ctr.Image === cont.Image &&
                                ctr.State === cont.State &&
                                this.isContainerUnhealthy(ctr) === this.isContainerUnhealthy(cont)) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            needToRefresh = true;
                            break;
                        }
                    }
                }
                if (needToRefresh) {
                    this.eventEmitter.fire(this._containersNode);
                    this._containerCache = containers;
                }
            }, refreshInterval);
        }
    }
    async getContainers() {
        // tslint:disable-next-line:no-this-assignment
        let me = this;
        return await vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('getChildren.containers', async function () {
            const containerNodes = [];
            let containers;
            let contextValue;
            let iconPath;
            try {
                containers = await docker_endpoint_1.docker.getContainerDescriptors(containerFilters);
                if (!containers || containers.length === 0) {
                    return [];
                }
                for (let container of containers) {
                    if (['exited', 'dead'].includes(container.State)) {
                        contextValue = "stoppedLocalContainerNode";
                        iconPath = {
                            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'stoppedContainer.svg'),
                            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'stoppedContainer.svg')
                        };
                    }
                    else if (me.isContainerUnhealthy(container)) {
                        contextValue = "runningLocalContainerNode";
                        iconPath = {
                            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'unhealthyContainer.svg'),
                            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'unhealthyContainer.svg')
                        };
                    }
                    else {
                        contextValue = "runningLocalContainerNode";
                        iconPath = {
                            light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'runningContainer.svg'),
                            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'runningContainer.svg')
                        };
                    }
                    let containerNode = new containerNode_1.ContainerNode(`${container.Image} (${container.Names[0].substring(1)}) (${container.Status})`, container, contextValue, iconPath);
                    containerNodes.push(containerNode);
                }
            }
            catch (error) {
                let newError = dockerConnectionError_1.showDockerConnectionError(this, error);
                return [new errorNode_1.ErrorNode(newError, errorNode_1.ErrorNode.getContainersErrorContextValue)];
            }
            me.autoRefreshContainers();
            return containerNodes;
        });
    }
    async getRegistries() {
        const registryRootNodes = [];
        registryRootNodes.push(new registryRootNode_1.RegistryRootNode('Docker Hub', "dockerHubRootNode", undefined, undefined));
        let azureAccount = await azureUtilityManager_1.AzureUtilityManager.getInstance().tryGetAzureAccount();
        if (azureAccount) {
            registryRootNodes.push(new registryRootNode_1.RegistryRootNode('Azure', "azureRegistryRootNode", this.eventEmitter, azureAccount));
        }
        registryRootNodes.push(new registryRootNode_1.RegistryRootNode('Private Registries', 'customRootNode', undefined, undefined));
        return registryRootNodes;
    }
}
exports.RootNode = RootNode;
//# sourceMappingURL=rootNode.js.map