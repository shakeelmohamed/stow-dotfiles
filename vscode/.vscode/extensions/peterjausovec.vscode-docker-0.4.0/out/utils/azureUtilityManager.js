"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const azure_arm_containerregistry_1 = require("azure-arm-containerregistry");
const azure_arm_resource_1 = require("azure-arm-resource");
const opn = require("opn");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../constants");
const asyncpool_1 = require("./asyncpool");
const nonNull_1 = require("./nonNull");
/* Singleton for facilitating communication with Azure account services by providing extended shared
  functionality and extension wide access to azureAccount. Tool for internal use.
  Authors: Esteban Rey L, Jackson Stokes, Julia Lieberman
*/
class AzureUtilityManager {
    constructor() { }
    async loadAzureAccountExtension() {
        let azureAccount;
        // tslint:disable-next-line:no-function-expression
        await vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('docker.loadAzureAccountExt', async function () {
            this.properties.isActivationEvent = 'true';
            try {
                let azureAccountExtension = vscode.extensions.getExtension('ms-vscode.azure-account');
                this.properties.found = azureAccountExtension ? 'true' : 'false';
                if (azureAccountExtension) {
                    azureAccount = await azureAccountExtension.activate();
                }
                vscode.commands.executeCommand('setContext', 'isAzureAccountInstalled', !!azureAccount);
            }
            catch (error) {
                throw new Error('Failed to activate the Azure Account Extension: ' + vscode_azureextensionui_1.parseError(error).message);
            }
        });
        return azureAccount;
    }
    static getInstance() {
        if (!AzureUtilityManager._instance) { // lazy initialization
            AzureUtilityManager._instance = new AzureUtilityManager();
        }
        return AzureUtilityManager._instance;
    }
    async tryGetAzureAccount() {
        if (!this._azureAccountPromise) {
            this._azureAccountPromise = this.loadAzureAccountExtension();
        }
        return await this._azureAccountPromise;
    }
    async requireAzureAccount() {
        let azureAccount = await this.tryGetAzureAccount();
        if (azureAccount) {
            return azureAccount;
        }
        else {
            const open = { title: "View in Marketplace" };
            const msg = 'This functionality requires installing the Azure Account extension.';
            let response = await vscode.window.showErrorMessage(msg, open);
            if (response === open) {
                // tslint:disable-next-line:no-unsafe-any
                opn('https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account');
            }
            throw new vscode_azureextensionui_1.UserCancelledError(msg);
        }
    }
    async getSession(subscription) {
        const tenantId = nonNull_1.getTenantId(subscription);
        const azureAccount = await this.requireAzureAccount();
        let foundSession = azureAccount.sessions.find((s) => s.tenantId.toLowerCase() === tenantId.toLowerCase());
        if (!foundSession) {
            throw new Error(`Could not find a session with tenantId "${tenantId}"`);
        }
        return foundSession;
    }
    async getFilteredSubscriptionList() {
        return (await this.requireAzureAccount()).filters.map(filter => {
            return {
                id: filter.subscription.id,
                subscriptionId: filter.subscription.subscriptionId,
                tenantId: filter.session.tenantId,
                displayName: filter.subscription.displayName,
                state: filter.subscription.state,
                subscriptionPolicies: filter.subscription.subscriptionPolicies,
                authorizationSource: filter.subscription.authorizationSource
            };
        });
    }
    async getContainerRegistryManagementClient(subscription) {
        let client = new azure_arm_containerregistry_1.ContainerRegistryManagementClient(await this.getCredentialByTenantId(subscription), nonNull_1.getSubscriptionId(subscription));
        vscode_azureextensionui_1.addExtensionUserAgent(client);
        return client;
    }
    async getResourceManagementClient(subscription) {
        return new azure_arm_resource_1.ResourceManagementClient(await this.getCredentialByTenantId(nonNull_1.getTenantId(subscription)), nonNull_1.getSubscriptionId(subscription));
    }
    async getRegistries(subscription, resourceGroup, compareFn = this.sortRegistriesAlphabetically) {
        let registries = [];
        if (subscription && resourceGroup) {
            //Get all registries under one resourcegroup
            const client = await this.getContainerRegistryManagementClient(subscription);
            registries = await client.registries.listByResourceGroup(resourceGroup);
        }
        else if (subscription) {
            //Get all registries under one subscription
            const client = await this.getContainerRegistryManagementClient(subscription);
            registries = await client.registries.list();
        }
        else {
            //Get all registries for all subscriptions
            const subs = await this.getFilteredSubscriptionList();
            const subPool = new asyncpool_1.AsyncPool(constants_1.MAX_CONCURRENT_SUBSCRIPTON_REQUESTS);
            for (let sub of subs) {
                subPool.addTask(async () => {
                    const client = await this.getContainerRegistryManagementClient(sub);
                    let subscriptionRegistries = await client.registries.list();
                    registries = registries.concat(subscriptionRegistries);
                });
            }
            await subPool.runAll();
        }
        registries.sort(compareFn);
        //Return only non classic registries
        return registries.filter((registry) => { return !registry.sku.tier || !registry.sku.tier.includes('Classic'); });
    }
    sortRegistriesAlphabetically(a, b) {
        return (a.loginServer || '').localeCompare(b.loginServer || '');
    }
    async getResourceGroups(subscription) {
        if (subscription) {
            const resourceClient = await this.getResourceManagementClient(subscription);
            return await resourceClient.resourceGroups.list();
        }
        const subs = await this.getFilteredSubscriptionList();
        const subPool = new asyncpool_1.AsyncPool(constants_1.MAX_CONCURRENT_SUBSCRIPTON_REQUESTS);
        let resourceGroups = [];
        //Acquire each subscription's data simultaneously
        for (let sub of subs) {
            subPool.addTask(async () => {
                const resourceClient = await this.getResourceManagementClient(sub);
                const internalGroups = await resourceClient.resourceGroups.list();
                resourceGroups = resourceGroups.concat(internalGroups);
            });
        }
        await subPool.runAll();
        return resourceGroups;
    }
    async getCredentialByTenantId(tenantIdOrSubscription) {
        let tenantId = typeof tenantIdOrSubscription === 'string' ? tenantIdOrSubscription : nonNull_1.getTenantId(tenantIdOrSubscription);
        const session = (await this.requireAzureAccount()).sessions.find((azureSession) => azureSession.tenantId.toLowerCase() === tenantId.toLowerCase());
        if (session) {
            return session.credentials;
        }
        throw new Error(`Failed to get credentials, tenant ${tenantId} not found.`);
    }
    async getLocationsBySubscription(subscription) {
        const credential = await this.getCredentialByTenantId(nonNull_1.getTenantId(subscription));
        const client = new azure_arm_resource_1.SubscriptionClient(credential);
        const locations = (await client.subscriptions.listLocations(nonNull_1.getSubscriptionId(subscription)));
        return locations;
    }
    //CHECKS
    //Provides a unified check for login that should be called once before using the rest of the singletons capabilities
    async waitForLogin() {
        let account = await this.tryGetAzureAccount();
        if (!account) {
            return false;
        }
        return await account.waitForLogin();
    }
}
exports.AzureUtilityManager = AzureUtilityManager;
//# sourceMappingURL=azureUtilityManager.js.map