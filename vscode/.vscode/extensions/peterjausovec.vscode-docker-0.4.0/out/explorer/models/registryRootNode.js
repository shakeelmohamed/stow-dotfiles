"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../../constants");
const extensionVariables_1 = require("../../extensionVariables");
const asyncpool_1 = require("../../utils/asyncpool");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const nonNull_1 = require("../../utils/nonNull");
const dockerHub = require("../utils/dockerHubUtils");
const azureRegistryNodes_1 = require("./azureRegistryNodes");
const customRegistries_1 = require("./customRegistries");
const customRegistryNodes_1 = require("./customRegistryNodes");
const dockerHubNodes_1 = require("./dockerHubNodes");
const nodeBase_1 = require("./nodeBase");
class RegistryRootNode extends nodeBase_1.NodeBase {
    constructor(label, contextValue, eventEmitter, // Needed only for Azure
    azureAccount // Needed only for Azure
    ) {
        super(label);
        this.label = label;
        this.contextValue = contextValue;
        this.eventEmitter = eventEmitter;
        this.azureAccount = azureAccount;
        this._azureAccount = azureAccount;
        if (this._azureAccount && this.eventEmitter && this.contextValue === 'azureRegistryRootNode') {
            this._azureAccount.onFiltersChanged((e) => {
                this.eventEmitter.fire(this);
            });
            this._azureAccount.onStatusChanged((e) => {
                this.eventEmitter.fire(this);
            });
            this._azureAccount.onSessionsChanged((e) => {
                this.eventEmitter.fire(this);
            });
        }
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue,
        };
    }
    async getChildren(element) {
        if (element.contextValue === 'azureRegistryRootNode') {
            return this.getAzureRegistries();
        }
        else if (element.contextValue === 'dockerHubRootNode') {
            return this.getDockerHubOrgs();
        }
        else {
            assert(element.contextValue === 'customRootNode');
            return await this.getCustomRegistryNodes();
        }
    }
    async getDockerHubOrgs() {
        const orgNodes = [];
        let id;
        if (extensionVariables_1.ext.keytar) {
            let token = await extensionVariables_1.ext.keytar.getPassword(constants_1.keytarConstants.serviceId, constants_1.keytarConstants.dockerHubTokenKey);
            let username = await extensionVariables_1.ext.keytar.getPassword(constants_1.keytarConstants.serviceId, constants_1.keytarConstants.dockerHubUserNameKey);
            let password = await extensionVariables_1.ext.keytar.getPassword(constants_1.keytarConstants.serviceId, constants_1.keytarConstants.dockerHubPasswordKey);
            if (token && username && password) {
                id = { token, username, password };
            }
        }
        if (!id) {
            id = await dockerHub.dockerHubLogin();
            if (id && id.token && extensionVariables_1.ext.keytar) {
                await extensionVariables_1.ext.keytar.setPassword(constants_1.keytarConstants.serviceId, constants_1.keytarConstants.dockerHubTokenKey, id.token);
                await extensionVariables_1.ext.keytar.setPassword(constants_1.keytarConstants.serviceId, constants_1.keytarConstants.dockerHubPasswordKey, id.password);
                await extensionVariables_1.ext.keytar.setPassword(constants_1.keytarConstants.serviceId, constants_1.keytarConstants.dockerHubUserNameKey, id.username);
            }
            else {
                return orgNodes;
            }
        }
        else {
            dockerHub.setDockerHubToken(id.token);
        }
        const user = await dockerHub.getUser();
        const myRepos = await dockerHub.getRepositories(user.username);
        const namespaces = [...new Set(myRepos.map(item => item.namespace))];
        namespaces.forEach((namespace) => {
            let node = new dockerHubNodes_1.DockerHubOrgNode(`${namespace}`, id.username, id.password, id.token);
            orgNodes.push(node);
        });
        return orgNodes;
    }
    async getCustomRegistryNodes() {
        let registries = await customRegistries_1.getCustomRegistries();
        let nodes = [];
        for (let registry of registries) {
            nodes.push(new customRegistryNodes_1.CustomRegistryNode(vscode.Uri.parse(registry.url).authority, registry));
        }
        return nodes;
    }
    async getAzureRegistries() {
        if (!this._azureAccount) {
            return [];
        }
        const loggedIntoAzure = await this._azureAccount.waitForLogin();
        let azureRegistryNodes = [];
        if (this._azureAccount.status === 'Initializing' || this._azureAccount.status === 'LoggingIn') {
            return [new azureRegistryNodes_1.AzureLoadingNode()];
        }
        if (this._azureAccount.status === 'LoggedOut') {
            return [new azureRegistryNodes_1.AzureNotSignedInNode()];
        }
        if (loggedIntoAzure) {
            const subscriptions = await azureUtilityManager_1.AzureUtilityManager.getInstance().getFilteredSubscriptionList();
            const subPool = new asyncpool_1.AsyncPool(constants_1.MAX_CONCURRENT_SUBSCRIPTON_REQUESTS);
            let subsAndRegistries = [];
            //Acquire each subscription's data simultaneously
            for (let sub of subscriptions) {
                subPool.addTask(async () => {
                    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(sub);
                    try {
                        let regs = await client.registries.list();
                        subsAndRegistries.push({
                            'subscription': sub,
                            'registries': regs
                        });
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(vscode_azureextensionui_1.parseError(error).message);
                    }
                });
            }
            await subPool.runAll();
            const regPool = new asyncpool_1.AsyncPool(constants_1.MAX_CONCURRENT_REQUESTS);
            // tslint:disable-next-line:prefer-for-of // Grandfathered in
            for (let i = 0; i < subsAndRegistries.length; i++) {
                const registries = subsAndRegistries[i].registries;
                const subscription = subsAndRegistries[i].subscription;
                //Go through the registries and add them to the async pool
                // tslint:disable-next-line:prefer-for-of // Grandfathered in
                for (let j = 0; j < registries.length; j++) {
                    if (!(registries[j].sku.tier || '').includes('Classic')) {
                        regPool.addTask(async () => {
                            let node = new azureRegistryNodes_1.AzureRegistryNode(nonNull_1.getLoginServer(registries[j]), this._azureAccount, registries[j], subscription);
                            azureRegistryNodes.push(node);
                        });
                    }
                }
            }
            await regPool.runAll();
            function compareFn(a, b) {
                return nonNull_1.getLoginServer(a.registry).localeCompare(nonNull_1.getLoginServer(b.registry));
            }
            azureRegistryNodes.sort(compareFn);
            return azureRegistryNodes;
        }
        else {
            return [];
        }
    }
}
exports.RegistryRootNode = RegistryRootNode;
//# sourceMappingURL=registryRootNode.js.map