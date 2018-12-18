"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const fse = require("fs-extra");
// Provides additional assertion-style functions for use in tests.
/**
 * Asserts that two arrays are equal (non-deep), even if in different orders
 */
function unorderedArraysEqual(actual, expected, message) {
    let result = areUnorderedArraysEqual(actual, expected);
    assert(result.areEqual, `${message || "Unordered arrays are not equal"}\n${result.message}`);
}
exports.unorderedArraysEqual = unorderedArraysEqual;
/**
 * Asserts that two arrays are not equal (non-deep), even if they were ordered the same way
 */
function notUnorderedArraysEqual(actual, expected, message) {
    let result = areUnorderedArraysEqual(actual, expected);
    assert(!result.areEqual, `${message || "Unordered arrays are equal but were expected not to be"}\n${result.message}`);
}
exports.notUnorderedArraysEqual = notUnorderedArraysEqual;
/**
 * Same as assert.throws except for async functions
 * @param block Block to test
 * @param expected Properties in this object will be tested to ensure they exist in the object that is thrown
 * @param message Optional failure message
 */
async function throwsOrRejectsAsync(block, expected, message) {
    let error;
    try {
        await block();
    }
    catch (err) {
        error = err;
    }
    if (!error) {
        throw new Error(`Expected exception or rejection: ${vscode_azureextensionui_1.parseError(expected).message}`);
    }
    for (let prop of Object.getOwnPropertyNames(expected)) {
        assert.equal(error[prop], expected[prop], `Error did not have the expected value for property '${prop}'`);
    }
}
exports.throwsOrRejectsAsync = throwsOrRejectsAsync;
function areUnorderedArraysEqual(actual, expected) {
    actual = actual.slice();
    expected = expected.slice();
    actual.sort();
    expected.sort();
    let message = `Actual:   ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`;
    if (!(actual.length === expected.length)) {
        return { areEqual: false, message };
    }
    for (let i = 0; i < actual.length; ++i) {
        if (actual[i] !== expected[i]) {
            return { areEqual: false, message };
        }
    }
    return { areEqual: true };
}
function assertContains(s, searchString) {
    assert(s.includes(searchString), `Expected to find '${searchString}' in '${s}'`);
}
exports.assertContains = assertContains;
function assertNotContains(s, searchString) {
    assert(!s.includes(searchString), `Unexpected text '${searchString}' found in '${s}'`);
}
exports.assertNotContains = assertNotContains;
function assertFileContains(filePath, text) {
    let contents = fse.readFileSync(filePath).toString();
    assert(contents.indexOf(text) >= 0, `Expected to find '${text}' in file ${filePath}, but found:\n${contents}`);
}
exports.assertFileContains = assertFileContains;
function assertNotFileContains(filePath, text) {
    let contents = fse.readFileSync(filePath).toString();
    assert(contents.indexOf(text) < 0, `Unexpected text '${text}' found in file ${filePath}`);
}
exports.assertNotFileContains = assertNotFileContains;
//# sourceMappingURL=assertEx.js.map