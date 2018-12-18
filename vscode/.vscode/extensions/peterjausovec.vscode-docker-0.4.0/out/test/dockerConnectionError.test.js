"use strict";
// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const assert = require("assert");
const extensionVariables_1 = require("../extensionVariables");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const testUrl_1 = require("./testUrl");
const dockerConnectionError_1 = require("../explorer/utils/dockerConnectionError");
const registryContainerName = 'test-registry';
suite("throwDockerConnectionError", async function () {
    suite("connection error URLs", async function () {
        testUrl_1.testUrl(dockerConnectionError_1.internal.installDockerUrl);
        testUrl_1.testUrl(dockerConnectionError_1.internal.linuxPostInstallUrl);
        testUrl_1.testUrl(dockerConnectionError_1.internal.troubleshootingUrl);
    });
    function testThrowDockerConnectionError(platform, expectedMessage) {
        test(platform, () => {
            let currentPlatform = extensionVariables_1.ext.os.platform;
            let actionContext = {
                measurements: {},
                properties: {},
            };
            try {
                extensionVariables_1.ext.os.platform = platform;
                dockerConnectionError_1.throwDockerConnectionError(actionContext, 'Whoops');
            }
            catch (err) {
                assert.equal(vscode_azureextensionui_1.parseError(err).message, expectedMessage);
                assert.equal(actionContext.suppressErrorDisplay, true);
            }
            finally {
                extensionVariables_1.ext.os.platform = currentPlatform;
            }
        });
    }
    testThrowDockerConnectionError('win32', 'Unable to connect to Docker. Please make sure you have installed Docker and that it is running. Details: Whoops');
    testThrowDockerConnectionError('darwin', 'Unable to connect to Docker. Please make sure you have installed Docker and that it is running. Details: Whoops');
    testThrowDockerConnectionError('linux', 'Unable to connect to Docker. Please make sure you have installed Docker and that it is running. Also make sure you\'ve followed the Linux post-install instructions "Manage Docker as a non-root user". Details: Whoops');
    testThrowDockerConnectionError('freebsd', 'Unable to connect to Docker. Please make sure you have installed Docker and that it is running. Also make sure you\'ve followed the Linux post-install instructions "Manage Docker as a non-root user". Details: Whoops');
});
//# sourceMappingURL=dockerConnectionError.test.js.map