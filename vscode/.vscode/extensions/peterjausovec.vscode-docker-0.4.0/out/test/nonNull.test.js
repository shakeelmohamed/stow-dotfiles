"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const nonNull_1 = require("../utils/nonNull");
suite("nonNull", async function () {
    function testNonNull(testName, actual, expected) {
        test(testName, () => {
            assert.equal(actual, expected);
        });
    }
    function testNonNullThrows(testName, block) {
        test(testName, () => {
            assert.throws(block, 'Expected an exception');
        });
    }
    test('nonNullProp', () => {
        testNonNull('string-or-undefined: string', nonNull_1.nonNullProp({ stringOrUndefined: 'hi' }, 'stringOrUndefined'), 'hi');
        testNonNullThrows('string-or-undefined property: undefined', () => nonNull_1.nonNullProp({ stringOrUndefined: undefined }, 'stringOrUndefined'));
        testNonNullThrows('string-or-undefined : missing', () => nonNull_1.nonNullProp({}, 'stringOrUndefined'));
        testNonNull('string-or-null property: string', nonNull_1.nonNullProp({ stringOrNull: 'hi' }, 'stringOrNull'), 'hi');
        testNonNullThrows('string-or-null property: null', () => nonNull_1.nonNullProp({ stringOrNull: null }, 'stringOrNull'));
        testNonNullThrows('string-or-null property: missing', () => nonNull_1.nonNullProp({}, 'stringOrNull'));
        testNonNull('string property: null missing', nonNull_1.nonNullProp({ string: 'hi' }, 'string'), 'hi');
        testNonNull('string property: empty', nonNull_1.nonNullProp({ string: '' }, 'string'), '');
        testNonNull('array-of-undefined property: array', nonNull_1.nonNullProp({ arrayOrUndefined: [1, 2] }, 'arrayOrUndefined'), [1, 2]);
        testNonNullThrows('array-of-undefined property: missing', () => nonNull_1.nonNullProp({}, 'arrayOrUndefined'));
    });
});
//# sourceMappingURL=nonNull.test.js.map