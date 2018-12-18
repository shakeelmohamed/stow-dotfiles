"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class DefaultAppStorage {
    constructor(appFolder, fileSystemProvider) {
        this.appFolder = appFolder;
        this.fileSystemProvider = fileSystemProvider;
    }
    async get(name, defaultValue) {
        const itemPath = this.createItemPath(name);
        if (await this.fileSystemProvider.fileExists(itemPath)) {
            const itemData = await this.fileSystemProvider.readFile(itemPath);
            return JSON.parse(itemData);
        }
        return defaultValue;
    }
    async update(name, item) {
        const itemPath = this.createItemPath(name);
        if (item) {
            const itemDir = path.dirname(itemPath);
            if (!await this.fileSystemProvider.dirExists(itemDir)) {
                await this.fileSystemProvider.makeDir(itemDir);
            }
            await this.fileSystemProvider.writeFile(itemPath, JSON.stringify(item));
        }
        else {
            await this.fileSystemProvider.unlinkFile(itemPath);
        }
    }
    createItemPath(name) {
        return path.join(this.appFolder, 'obj', 'docker', `${name}.json`);
    }
}
exports.DefaultAppStorage = DefaultAppStorage;
class DefaultAppStorageProvider {
    constructor(fileSystemProvider) {
        this.fileSystemProvider = fileSystemProvider;
    }
    async getStorage(appFolder) {
        return await Promise.resolve(new DefaultAppStorage(appFolder, this.fileSystemProvider));
    }
}
exports.DefaultAppStorageProvider = DefaultAppStorageProvider;
//# sourceMappingURL=appStorage.js.map