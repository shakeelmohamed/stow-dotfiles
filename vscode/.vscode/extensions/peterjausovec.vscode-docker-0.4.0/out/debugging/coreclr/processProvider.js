"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const process = require("process");
class ChildProcessProvider {
    get env() {
        return process.env;
    }
    get pid() {
        return process.pid;
    }
    async exec(command, options) {
        return await new Promise((resolve, reject) => {
            const p = cp.exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                resolve({ stdout, stderr });
            });
            if (options.progress) {
                const progress = options.progress;
                p.stderr.on('data', chunk => progress(chunk.toString()));
                p.stdout.on('data', chunk => progress(chunk.toString()));
            }
        });
    }
}
exports.ChildProcessProvider = ChildProcessProvider;
exports.default = ChildProcessProvider;
//# sourceMappingURL=processProvider.js.map