"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const osNode = require("os");
/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */
var ext;
(function (ext) {
    /**
     * A test-injectable structure defining the current operating system and version
     */
    ext.os = {
        platform: osNode.platform(),
        release: osNode.release()
    };
})(ext = exports.ext || (exports.ext = {}));
//# sourceMappingURL=extensionVariables.js.map