"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assertEx = require("./assertEx");
const vscode_1 = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const TerminalProvider_1 = require("../commands/utils/TerminalProvider");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const registryContainerName = 'test-registry';
suite("Custom registries", async function () {
    this.timeout(Math.max(60 * 1000 * 3, this.timeout()));
    const outputChannel = vscode_1.window.createOutputChannel('Docker extension tests');
    extensionVariables_1.ext.outputChannel = outputChannel;
    let testTerminalProvider = new TerminalProvider_1.TestTerminalProvider();
    extensionVariables_1.ext.terminalProvider = testTerminalProvider;
    let registryTerminal = await testTerminalProvider.createTerminal('custom registry');
    async function stopRegistry() {
        await registryTerminal.execute([
            `docker stop ${registryContainerName}`,
            `docker rm ${registryContainerName}`,
        ], {
            ignoreErrors: true
        });
    }
    suite("localhost", async function () {
        this.timeout(Math.max(60 * 1000 * 5, this.timeout()));
        suiteSetup(async function () {
            await stopRegistry();
            await registryTerminal.execute(`docker pull registry`, {
                // docker uses stderr to indicate that it didn't find a local cache and has to download
                ignoreErrors: true
            });
            await registryTerminal.execute(`docker run -d --rm --name ${registryContainerName} -p 5900:5000 registry`);
            if (false) { // Too inconsistent between terminals
                // Make sure it's running
                // (On some Linux systems, --silent and --show-error are necessary otherwise errors don't go to
                // correct output). On others these may not be valid and may show an error which can be ignored.
                let curlResult = await registryTerminal.execute(`curl http://localhost:5900/v2/_catalog --silent --show-error`);
                assertEx.assertContains(curlResult, '"repositories":');
            }
        });
        suiteTeardown(async function () {
            await stopRegistry();
        });
        test("Connect, no auth", async function () {
            let input = new vscode_azureextensionui_1.TestUserInput([
                'http://localhost:5900',
                ''
            ]);
            extensionVariables_1.ext.ui = input;
            await vscode_1.commands.executeCommand('vscode-docker.connectCustomRegistry');
            // TODO: Verify the node is there (have to start using common tree provider first)
        });
        test("Connect, no auth - keytar not available", async function () {
            let oldKeytar = extensionVariables_1.ext.keytar;
            try {
                extensionVariables_1.ext.keytar = undefined;
                let input = new vscode_azureextensionui_1.TestUserInput([
                    'http://localhost:5900',
                    ''
                ]);
                extensionVariables_1.ext.ui = input;
                await vscode_1.commands.executeCommand('vscode-docker.connectCustomRegistry');
                // TODO: Verify the node is there (have to start using common tree provider first)
            }
            finally {
                extensionVariables_1.ext.keytar = oldKeytar;
            }
        });
        test("Connect with credentials");
        test("Publish to Azure app service with credentials");
        test("Disconnect");
        test("Connect with credentials");
        test("Publish to Azure app service with credentials");
        test("Disconnect");
    });
});
//# sourceMappingURL=customRegistries.test.js.map