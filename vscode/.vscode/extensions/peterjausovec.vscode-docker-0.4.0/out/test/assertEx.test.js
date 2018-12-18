"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assertEx_1 = require("./assertEx");
const assert = require("assert");
suite("assertEx", () => {
    test("areUnorderedArraysEqual", () => {
        assertEx_1.unorderedArraysEqual([], []);
        assertEx_1.notUnorderedArraysEqual([], [1]);
        assertEx_1.unorderedArraysEqual([1], [1]);
        assertEx_1.notUnorderedArraysEqual([1], [1, 2]);
        assertEx_1.unorderedArraysEqual([1, 2], [1, 2]);
        assertEx_1.unorderedArraysEqual([1, 2], [2, 1]);
        assertEx_1.notUnorderedArraysEqual([1, 2], [2, 1, 3]);
    });
    suite("throwsAsync", () => {
        test("throws", async () => {
            await assertEx_1.throwsOrRejectsAsync(async () => {
                throw new Error("this is an error");
            }, {
                message: "this is an error"
            });
        });
        test("rejects", async () => {
            await assertEx_1.throwsOrRejectsAsync(() => {
                return Promise.reject(new Error("This is a rejection. Don't take it personally."));
            }, {
                message: "This is a rejection. Don't take it personally."
            });
        });
        test("wrong message", async () => {
            let error;
            try {
                await assertEx_1.throwsOrRejectsAsync(() => {
                    throw new Error("this is an error");
                }, {
                    message: "I'm expecting too much"
                });
            }
            catch (err) {
                error = err;
            }
            assert.equal(error && error.message, "Error did not have the expected value for property 'message'");
        });
        test("fails", async () => {
            let error;
            try {
                await assertEx_1.throwsOrRejectsAsync(() => {
                    return Promise.resolve();
                }, {
                    message: "This is a rejection. Don't take it personally."
                });
            }
            catch (err) {
                error = err;
            }
            assert.equal(error && error.message, "Expected exception or rejection: This is a rejection. Don't take it personally.");
        });
    });
});
//# sourceMappingURL=assertEx.test.js.map