"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class LineSplitter {
    constructor() {
        this.emitter = new vscode.EventEmitter();
    }
    get onLine() {
        return this.emitter.event;
    }
    close() {
        if (this.buffer !== undefined) {
            this.emitter.fire(this.buffer);
            this.buffer = undefined;
        }
    }
    dispose() {
        this.close();
    }
    write(data) {
        if (data === undefined) {
            return;
        }
        this.buffer = this.buffer !== undefined ? this.buffer + data : data;
        let index = 0;
        let lineStart = 0;
        while (index < this.buffer.length) {
            if (this.buffer[index] === '\n') {
                const line = index === 0 || this.buffer[index - 1] !== '\r'
                    ? this.buffer.substring(lineStart, index)
                    : this.buffer.substring(lineStart, index - 1);
                this.emitter.fire(line);
                lineStart = index + 1;
            }
            index++;
        }
        this.buffer = lineStart < index ? this.buffer.substring(lineStart) : undefined;
    }
    static splitLines(data) {
        const splitter = new LineSplitter();
        const lines = [];
        splitter.onLine(line => lines.push(line));
        splitter.write(data);
        splitter.close();
        return lines;
    }
}
exports.LineSplitter = LineSplitter;
exports.default = LineSplitter;
//# sourceMappingURL=lineSplitter.js.map