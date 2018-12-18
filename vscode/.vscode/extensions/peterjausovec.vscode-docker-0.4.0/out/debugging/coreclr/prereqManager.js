"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const dockerManager_1 = require("./dockerManager");
class DockerDaemonIsLinuxPrerequisite {
    constructor(dockerClient, showErrorMessage) {
        this.dockerClient = dockerClient;
        this.showErrorMessage = showErrorMessage;
    }
    async checkPrerequisite() {
        const daemonOsJson = await this.dockerClient.getVersion({ format: '{{json .Server.Os}}' });
        const daemonOs = JSON.parse(daemonOsJson.trim());
        if (daemonOs === 'linux') {
            return true;
        }
        this.showErrorMessage('The Docker daemon is not configured to run Linux containers. Only Linux containers can be used for .NET Core debugging.');
        return false;
    }
}
exports.DockerDaemonIsLinuxPrerequisite = DockerDaemonIsLinuxPrerequisite;
class DotNetExtensionInstalledPrerequisite {
    constructor(browserClient, getExtension, showErrorMessage) {
        this.browserClient = browserClient;
        this.getExtension = getExtension;
        this.showErrorMessage = showErrorMessage;
    }
    async checkPrerequisite() {
        // NOTE: Debugging .NET Core in Docker containers requires the C# (i.e. .NET Core debugging) extension.
        //       As this extension targets Docker in general and not .NET Core in particular, we don't want the
        //       extension as a whole to depend on it.  Hence, we only check for its existence if/when asked to
        //       debug .NET Core in Docker containers.
        const dependenciesSatisfied = this.getExtension('ms-vscode.csharp') !== undefined;
        if (!dependenciesSatisfied) {
            const openExtensionInGallery = {
                title: 'View extension in gallery'
            };
            this
                .showErrorMessage('To debug .NET Core in Docker containers, install the C# extension for VS Code.', openExtensionInGallery)
                .then(result => {
                if (result === openExtensionInGallery) {
                    this.browserClient.openBrowser('https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp');
                }
            });
        }
        return await Promise.resolve(dependenciesSatisfied);
    }
}
exports.DotNetExtensionInstalledPrerequisite = DotNetExtensionInstalledPrerequisite;
class DotNetSdkInstalledPrerequisite {
    constructor(msbuildClient, showErrorMessage) {
        this.msbuildClient = msbuildClient;
        this.showErrorMessage = showErrorMessage;
    }
    async checkPrerequisite() {
        const result = await this.msbuildClient.getVersion();
        if (result) {
            return true;
        }
        this.showErrorMessage('The .NET Core SDK must be installed to debug .NET Core applications running within Docker containers.');
        return false;
    }
}
exports.DotNetSdkInstalledPrerequisite = DotNetSdkInstalledPrerequisite;
class LinuxUserInDockerGroupPrerequisite {
    constructor(osProvider, processProvider, showErrorMessage) {
        this.osProvider = osProvider;
        this.processProvider = processProvider;
        this.showErrorMessage = showErrorMessage;
    }
    async checkPrerequisite() {
        if (this.osProvider.os !== 'Linux' || this.osProvider.isMac) {
            return true;
        }
        const result = await this.processProvider.exec('id -Gn', {});
        const groups = result.stdout.trim().split(' ');
        const inDockerGroup = groups.find(group => group === 'docker') !== undefined;
        if (inDockerGroup) {
            return true;
        }
        this.showErrorMessage('The current user is not a member of the "docker" group. Add it using the command "sudo usermod -a -G docker $USER".');
        return false;
    }
}
exports.LinuxUserInDockerGroupPrerequisite = LinuxUserInDockerGroupPrerequisite;
class MacNuGetFallbackFolderSharedPrerequisite {
    constructor(fileSystemProvider, osProvider, showErrorMessage) {
        this.fileSystemProvider = fileSystemProvider;
        this.osProvider = osProvider;
        this.showErrorMessage = showErrorMessage;
    }
    async checkPrerequisite() {
        if (!this.osProvider.isMac) {
            // Only Mac requires this folder be specifically shared.
            return true;
        }
        const settingsPath = path.posix.join(this.osProvider.homedir, 'Library/Group Containers/group.com.docker/settings.json');
        if (!await this.fileSystemProvider.fileExists(settingsPath)) {
            // Docker versions earlier than 17.12.0-ce-mac46 may not have the settings file.
            return true;
        }
        const settingsContent = await this.fileSystemProvider.readFile(settingsPath);
        const settings = JSON.parse(settingsContent);
        if (settings === undefined || settings.filesharingDirectories === undefined) {
            // Docker versions earlier than 17.12.0-ce-mac46 may not have the property.
            return true;
        }
        if (settings.filesharingDirectories.find(directory => directory === dockerManager_1.MacNuGetPackageFallbackFolderPath) !== undefined) {
            return true;
        }
        this.showErrorMessage(`To debug .NET Core in Docker containers, add "${dockerManager_1.MacNuGetPackageFallbackFolderPath}" as a shared folder in your Docker preferences.`);
        return false;
    }
}
exports.MacNuGetFallbackFolderSharedPrerequisite = MacNuGetFallbackFolderSharedPrerequisite;
class AggregatePrerequisite {
    constructor(...prerequisites) {
        this.prerequisites = prerequisites;
    }
    async checkPrerequisite() {
        const results = await Promise.all(this.prerequisites.map(async (prerequisite) => await prerequisite.checkPrerequisite()));
        return results.every(result => result);
    }
}
exports.AggregatePrerequisite = AggregatePrerequisite;
//# sourceMappingURL=prereqManager.js.map