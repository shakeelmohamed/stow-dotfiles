"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class CommandLineDotNetClient {
    constructor(processProvider) {
        this.processProvider = processProvider;
    }
    async execTarget(projectFile, options) {
        let command = `dotnet msbuild "${projectFile}"`;
        if (options) {
            if (options.target) {
                command += ` "/t:${options.target}"`;
            }
            if (options.properties) {
                const properties = options.properties;
                command += Object.keys(properties).map(key => ` "/p:${key}=${properties[key]}"`).join('');
            }
        }
        await this.processProvider.exec(command, {});
    }
    async getVersion() {
        try {
            const command = `dotnet --version`;
            const result = await this.processProvider.exec(command, {});
            return result.stdout.trim();
        }
        catch (_a) {
            return undefined;
        }
    }
}
exports.CommandLineDotNetClient = CommandLineDotNetClient;
exports.default = CommandLineDotNetClient;
//# sourceMappingURL=dotNetClient.js.map