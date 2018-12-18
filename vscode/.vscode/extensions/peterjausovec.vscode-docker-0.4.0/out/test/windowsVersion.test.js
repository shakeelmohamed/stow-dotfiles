"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const extensionVariables_1 = require("../extensionVariables");
const assert = require("assert");
const osVersion_1 = require("../helpers/osVersion");
suite("windowsVersion", () => {
    let previousOs;
    function testIsWindows10RS4OrNewer(release, expectedResult) {
        test(`isWindows10RS4OrNewer: ${release}`, () => {
            let previousOs = extensionVariables_1.ext.os;
            try {
                extensionVariables_1.ext.os = {
                    platform: 'win32',
                    release
                };
                let result = osVersion_1.isWindows10RS4OrNewer();
                assert.equal(result, expectedResult);
            }
            finally {
                extensionVariables_1.ext.os = previousOs;
            }
        });
    }
    function testIsWindows10RS3OrNewer(release, expectedResult) {
        test(`isWindows10RS4OrNewer: ${release}`, () => {
            let previousOs = extensionVariables_1.ext.os;
            try {
                extensionVariables_1.ext.os = {
                    platform: 'win32',
                    release
                };
                let result = osVersion_1.isWindows10RS3OrNewer();
                assert.equal(result, expectedResult);
            }
            finally {
                extensionVariables_1.ext.os = previousOs;
            }
        });
    }
    suite('isWindows10RS4OrNewer', () => {
        testIsWindows10RS4OrNewer('10.0.17134', true);
        testIsWindows10RS4OrNewer('10.0.17135', true);
        testIsWindows10RS4OrNewer('10.0.17133', false);
        testIsWindows10RS4OrNewer('10.0.17133', false);
        testIsWindows10RS4OrNewer('9.9.17135', false);
        testIsWindows10RS4OrNewer('10.1.0', true);
        testIsWindows10RS4OrNewer('11.1.0', true);
        testIsWindows10RS4OrNewer('10.0.14393', false); // Windows Server 2016
        testIsWindows10RS4OrNewer('10.0.17134', true); // Windows 10 Version 1803 (build 17134.285)
    });
    suite('isWindows10RS3OrNewer', () => {
        testIsWindows10RS3OrNewer('10.0.16299', true);
        testIsWindows10RS3OrNewer('10.0.16300', true);
        testIsWindows10RS3OrNewer('10.0.16298', false);
        testIsWindows10RS3OrNewer('10.0.14393', false); // Windows Server 2016
        testIsWindows10RS3OrNewer('10.0.17134', true); // Windows 10 Version 1803 (build 17134.285)
    });
});
//# sourceMappingURL=windowsVersion.test.js.map