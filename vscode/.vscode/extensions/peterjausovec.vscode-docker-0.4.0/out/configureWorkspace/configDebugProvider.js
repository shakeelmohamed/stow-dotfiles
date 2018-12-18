/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class DockerDebugConfigProvider {
    provideDebugConfigurations(folder, token) {
        const config = {
            name: 'Docker: Attach to Node',
            type: 'node',
            request: 'attach',
            port: 9229,
            address: 'localhost',
            localRoot: '\${workspaceFolder}',
            remoteRoot: '/usr/src/app',
            protocol: 'inspector'
        };
        return [config];
    }
}
exports.DockerDebugConfigProvider = DockerDebugConfigProvider;
//# sourceMappingURL=configDebugProvider.js.map