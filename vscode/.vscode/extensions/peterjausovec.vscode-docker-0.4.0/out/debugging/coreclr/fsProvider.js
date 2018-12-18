"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fse = require("fs-extra");
class LocalFileSystemProvider {
    async dirExists(path) {
        try {
            const stats = await fse.stat(path);
            return stats.isDirectory();
        }
        catch (err) {
            // tslint:disable-next-line:no-unsafe-any
            if (err.code === "ENOENT") {
                return false;
            }
            throw err;
        }
    }
    async fileExists(path) {
        try {
            const stats = await fse.stat(path);
            return stats.isFile();
        }
        catch (err) {
            // tslint:disable-next-line:no-unsafe-any
            if (err.code === "ENOENT") {
                return false;
            }
            throw err;
        }
    }
    async hashFile(path) {
        const hash = crypto.createHash('sha256');
        const contents = await this.readFile(path);
        hash.update(contents);
        return hash.digest('hex');
    }
    async makeDir(path) {
        return await fse.mkdir(path);
    }
    async readDir(path) {
        return await fse.readdir(path);
    }
    async readFile(filename, encoding) {
        // NOTE: If encoding is specified, output is a string; if omitted, output is a Buffer.
        return (await (encoding ? fse.readFile(filename, encoding) : fse.readFile(filename))).toString();
    }
    async unlinkFile(filename) {
        return await fse.unlink(filename);
    }
    // tslint:disable-next-line:no-any
    async writeFile(filename, data) {
        return await fse.writeFile(filename, data);
    }
}
exports.LocalFileSystemProvider = LocalFileSystemProvider;
//# sourceMappingURL=fsProvider.js.map