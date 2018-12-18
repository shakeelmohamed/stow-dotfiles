"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const assertEx = require("./assertEx");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
const fse = require("fs-extra");
const AdmZip = require("adm-zip");
const path = require("path");
const extensionVariables_1 = require("../extensionVariables");
const configure_1 = require("../configureWorkspace/configure");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const global_test_1 = require("./global.test");
const httpRequest_1 = require("../utils/httpRequest");
const TerminalProvider_1 = require("../commands/utils/TerminalProvider");
let testRootFolder = global_test_1.getTestRootFolder();
/**
 * Downloads and then extracts only a specific folder and its subfolders.
 */
async function unzipFileFromUrl(uri, sourceFolderInZip, outputFolder) {
    let zipContents = await httpRequest_1.httpsRequestBinary(uri.toString());
    let zip = new AdmZip(zipContents);
    await extractFolderTo(zip, sourceFolderInZip, outputFolder);
}
/**
 * Extracts only a specific folder and its subfolders.
 * Not using AdmZip.extractAllTo because depending on the .zip file we may end up with an extraneous top-level folder
 */
async function extractFolderTo(zip, sourceFolderInZip, outputFolder) {
    if (!(sourceFolderInZip.endsWith('/') || sourceFolderInZip.endsWith('\\'))) {
        sourceFolderInZip += '/';
    }
    var zipEntries = zip.getEntries();
    for (let entry of zipEntries) {
        if (entry.entryName.startsWith(sourceFolderInZip)) {
            let relativePath = entry.entryName.slice(sourceFolderInZip.length);
            if (!relativePath) {
                // root folder
                continue;
            }
            let outPath = path.join(outputFolder, relativePath);
            if (entry.isDirectory) {
                //console.log(`Folder: ${entry.entryName}`);
                await fse.mkdirs(outPath);
            }
            else {
                //console.log(`File: ${entry.entryName}`);
                let data = entry.getData();
                await fse.writeFile(outPath, data);
            }
        }
    }
}
suite("Build Image", function () {
    this.timeout(2 * 60 * 1000);
    const outputChannel = vscode.window.createOutputChannel('Docker extension tests');
    extensionVariables_1.ext.outputChannel = outputChannel;
    async function testConfigureAndBuildImage(platform, configureInputs, buildInputs) {
        // Set up simulated user input
        configureInputs.unshift(platform);
        extensionVariables_1.ext.ui = new vscode_azureextensionui_1.TestUserInput(configureInputs);
        let testTerminalProvider = new TerminalProvider_1.TestTerminalProvider();
        extensionVariables_1.ext.terminalProvider = testTerminalProvider;
        let actionContext = {
            properties: { isActivationEvent: 'false', cancelStep: '', errorMessage: '', error: undefined, result: 'Succeeded' },
            measurements: { duration: 0 },
            suppressTelemetry: false,
            rethrowError: false,
            suppressErrorDisplay: false
        };
        await configure_1.configure(actionContext, testRootFolder);
        assert.equal(configureInputs.length, 0, 'Not all inputs were used for configure docker files');
        // Build image
        extensionVariables_1.ext.ui = new vscode_azureextensionui_1.TestUserInput(buildInputs);
        let dockerFile = vscode_2.Uri.file(path.join(testRootFolder, 'Dockerfile'));
        await vscode_1.commands.executeCommand('vscode-docker.image.build', dockerFile);
        assert.equal(configureInputs.length, 0, 'Not all inputs were used for Build Image');
        let { outputText, errorText } = await testTerminalProvider.currentTerminal.exit();
        assert.equal(errorText, '', 'Expected no errors from Build Image');
        assertEx.assertContains(outputText, 'Successfully built');
        assertEx.assertContains(outputText, 'Successfully tagged');
    }
    // Go
    global_test_1.testInEmptyFolder("Go", async () => {
        let uri = 'https://codeload.github.com/cloudfoundry-community/simple-go-web-app/zip/master'; // https://github.com/cloudfoundry-community/simple-go-web-app/archive/master.zip
        await unzipFileFromUrl(vscode_2.Uri.parse(uri), 'simple-go-web-app-master', testRootFolder);
        await testConfigureAndBuildImage('Go', ['3001'], ['testoutput:latest']);
        // CONSIDER: Run the built image
    });
    // CONSIDER TESTS:
    // 'Java'
    // '.NET Core Console'
    // 'ASP.NET Core'
    // 'Node.js'
    // 'Python'
    // 'Ruby'
});
//# sourceMappingURL=buildAndRun.test.js.map