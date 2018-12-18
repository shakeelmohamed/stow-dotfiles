"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class OSTempFileProvider {
    constructor(osProvider, processProvider) {
        this.osProvider = osProvider;
        this.processProvider = processProvider;
        this.count = 1;
    }
    getTempFilename(prefix = 'temp') {
        return path.join(this.osProvider.tmpdir, `${prefix}_${new Date().valueOf()}_${this.processProvider.pid}_${this.count++}.tmp`);
    }
}
exports.OSTempFileProvider = OSTempFileProvider;
//# sourceMappingURL=tempFileProvider.js.map