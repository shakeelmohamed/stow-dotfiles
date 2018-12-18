"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fse = require("fs-extra");
const assert = require("assert");
const extensionVariables_1 = require("../extensionVariables");
const testKeytar_1 = require("../test/testKeytar");
var constants;
(function (constants) {
    constants.testOutputName = 'testOutput';
})(constants = exports.constants || (exports.constants = {}));
// The root workspace folder that vscode is opened against for tests
let testRootFolder;
function getTestRootFolder() {
    if (!testRootFolder) {
        // We're expecting to be opened against the test/test.code-workspace
        // workspace.
        let workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.error("No workspace is open.");
            process.exit(1);
        }
        else {
            if (workspaceFolders.length > 1) {
                console.error("There are unexpected multiple workspaces open");
                process.exit(1);
            }
            testRootFolder = workspaceFolders[0].uri.fsPath;
            console.log(`testRootFolder: ${testRootFolder}`);
            if (path.basename(testRootFolder) !== constants.testOutputName) {
                console.error("vscode is opened against the wrong folder for tests");
                process.exit(1);
            }
            fse.ensureDirSync(testRootFolder);
            fse.emptyDirSync(testRootFolder);
        }
    }
    return testRootFolder;
}
exports.getTestRootFolder = getTestRootFolder;
/**
 * Run a test with an empty root testing folder (i.e. delete everything out of it before running the test).
 * This is important since we can't open new folders in vscode while tests are running
 */
function testInEmptyFolder(name, func) {
    test(name, !func ? undefined : async () => {
        // Delete everything in the root testing folder
        assert(path.basename(testRootFolder) === constants.testOutputName, "Trying to delete wrong folder");
        ;
        await fse.emptyDir(testRootFolder);
        await func();
    });
}
exports.testInEmptyFolder = testInEmptyFolder;
// Runs before all tests
suiteSetup(async function () {
    this.timeout(60 * 1000);
    console.log('global.test.ts: suiteSetup');
    // Otherwise the app can blocking asking for keychain access
    extensionVariables_1.ext.keytar = new testKeytar_1.TestKeytar();
    console.log("Refreshing tree to make sure extension is activated");
    await vscode.commands.executeCommand('vscode-docker.explorer.refresh');
    console.log("Refresh done");
    assert(!!extensionVariables_1.ext.context, "Extension not activated");
});
// Runs after all tests
suiteTeardown(async function () {
    console.log('global.test.ts: suiteTeardown');
    if (testRootFolder && path.basename(testRootFolder) === constants.testOutputName) {
        fse.emptyDir(testRootFolder);
    }
});
//# sourceMappingURL=global.test.js.map