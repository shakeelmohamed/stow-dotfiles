"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dockerManager_1 = require("../../../debugging/coreclr/dockerManager");
suite('debugging/coreclr/dockerManager', () => {
    suite('compareBuildImageOptions', () => {
        function testComparison(name, options1, options2, expected, message) {
            test(name, () => assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), expected, message));
        }
        function testComparisonOfProperty(property, included = true) {
            suite(property, () => {
                test('Options undefined', () => {
                    const options1 = {};
                    options1[property] = undefined;
                    const options2 = undefined;
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Property undefined equates to options undefined.');
                });
                test('Property unspecified', () => {
                    const options1 = {};
                    options1[property] = undefined;
                    const options2 = {};
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Property undefined equates to property unspecified.');
                });
                test('Properties equal', () => {
                    const options1 = {};
                    options1[property] = 'value';
                    const options2 = {};
                    options2[property] = 'value';
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Equal properties should be equal.');
                });
                test('Properties different', () => {
                    const options1 = {};
                    options1[property] = 'value1';
                    const options2 = {};
                    options2[property] = 'value2';
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), !included, 'Different properties should be unequal.');
                });
            });
        }
        function testComparisonOfDictionary(property, included = true) {
            suite(property, () => {
                test('Options undefined', () => {
                    const options1 = {};
                    options1[property] = undefined;
                    const options2 = undefined;
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Dictionary undefined equates to options undefined.');
                });
                test('Dictionary unspecified', () => {
                    const options1 = {};
                    options1[property] = undefined;
                    const options2 = {};
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Dictionary undefined equates to dictionary unspecified.');
                });
                test('Dictionary empty', () => {
                    const options1 = {};
                    options1[property] = {};
                    const options2 = {};
                    options2[property] = {};
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Empty dictionaries should be equal.');
                });
                test('Dictionary equal', () => {
                    const options1 = {};
                    options1[property] = { arg1: 'value1', arg2: 'value2' };
                    const options2 = {};
                    options2[property] = { arg1: 'value1', arg2: 'value2' };
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), true, 'Equal dictionaries should be equal.');
                });
                test('Dictionary different keys', () => {
                    const options1 = {};
                    options1[property] = { arg1: 'value1', arg2: 'value2' };
                    const options2 = {};
                    options2[property] = { arg2: 'value2', arg3: 'value3' };
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), !included, 'Different properties should be unequal.');
                });
                test('Dictionary different values', () => {
                    const options1 = {};
                    options1[property] = { arg1: 'value1', arg2: 'value2' };
                    const options2 = {};
                    options2[property] = { arg1: 'value1', arg2: 'value3' };
                    assert.equal(dockerManager_1.compareBuildImageOptions(options1, options2), !included, 'Different properties should be unequal.');
                });
            });
        }
        testComparison('Both undefined', undefined, undefined, true, 'Both being undefined are considered equal.');
        testComparison('One undefined, one empty', undefined, {}, true, 'Undefined and empty are considered equal.');
        testComparison('Both empty', {}, {}, true, 'Both empty are considered equal.');
        testComparisonOfProperty('context');
        testComparisonOfProperty('dockerfile', false);
        testComparisonOfProperty('tag');
        testComparisonOfDictionary('args');
        testComparisonOfDictionary('labels');
    });
});
//# sourceMappingURL=dockerManager.test.js.map