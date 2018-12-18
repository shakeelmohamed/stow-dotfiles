"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const lineSplitter_1 = require("./lineSplitter");
class DefaultOutputManager {
    constructor(outputChannel, level = 0) {
        this.outputChannel = outputChannel;
        this.level = level;
        this.lineSplitter = new lineSplitter_1.LineSplitter();
        this.isShown = false;
        this.lineSplitter.onLine(line => this.outputChannel.appendLine(this.generatePrefix(line)));
    }
    append(content) {
        if (this.level) {
            this.lineSplitter.write(content);
        }
        else {
            this.outputChannel.append(content);
        }
    }
    appendLine(content) {
        if (this.level) {
            this.lineSplitter.write(content + '\n');
        }
        else {
            this.outputChannel.appendLine(content);
        }
    }
    dispose() {
        this.lineSplitter.close();
    }
    async performOperation(startContent, operation, endContent, errorContent) {
        if (!this.isShown) {
            this.outputChannel.show(true);
            this.isShown = true;
        }
        this.appendLine(startContent);
        try {
            const nextLevelOutputManager = new DefaultOutputManager(this.outputChannel, this.level + 1);
            let result;
            try {
                result = await operation(nextLevelOutputManager);
            }
            finally {
                nextLevelOutputManager.dispose();
            }
            if (endContent) {
                this.appendLine(typeof endContent === 'string' ? endContent : endContent(result));
            }
            return result;
        }
        catch (error) {
            if (errorContent) {
                this.appendLine(typeof errorContent === 'string' ? errorContent : errorContent(error));
            }
            throw error;
        }
    }
    generatePrefix(content) {
        return '>'.repeat(this.level) + ' ' + (content || '');
    }
}
exports.DefaultOutputManager = DefaultOutputManager;
//# sourceMappingURL=outputManager.js.map