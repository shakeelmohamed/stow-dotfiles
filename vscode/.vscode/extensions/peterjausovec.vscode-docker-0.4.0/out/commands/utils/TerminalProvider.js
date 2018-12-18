"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const fse = require("fs-extra");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
class DefaultTerminalProvider {
    createTerminal(name) {
        let terminalOptions = {};
        terminalOptions.name = name;
        const value = vscode.workspace.getConfiguration("docker").get("host", "");
        if (value) {
            terminalOptions.env = {
                DOCKER_HOST: value
            };
        }
        return vscode.window.createTerminal(terminalOptions);
    }
}
exports.DefaultTerminalProvider = DefaultTerminalProvider;
/**
 * Creates terminals for testing that automatically save the standard and error output of the commands sent to it
 */
class TestTerminalProvider {
    createTerminal(name) {
        let terminal = new DefaultTerminalProvider().createTerminal(name);
        let testTerminal = new TestTerminal(terminal);
        this._currentTerminal = testTerminal;
        return testTerminal;
    }
    get currentTerminal() {
        return this._currentTerminal;
    }
}
exports.TestTerminalProvider = TestTerminalProvider;
class TestTerminal {
    constructor(_terminal) {
        this._terminal = _terminal;
        this._disposed = false;
        let root = vscode.workspace.rootPath || os.tmpdir();
        this._suffix = TestTerminal._lastSuffix++;
        this._outputFilePath = path.join(root, `.out${this._suffix}`);
        this._errFilePath = path.join(root, `.err${this._suffix}`);
        this._semaphorePath = path.join(root, `.sem${this._suffix}`);
    }
    /**
     * Causes the terminal to exit after completing the current commands, and returns the
     * redirected standard and error output.
     */
    async exit() {
        this.ensureNotDisposed();
        let results = await this.waitForCompletion();
        this.hide();
        this.dispose();
        return results;
    }
    /**
     * Causes the terminal to wait for completion of the current commands, and returns the
     * redirected standard and error output since the last call.
     */
    async waitForCompletion() {
        return this.waitForCompletionCore();
    }
    async waitForCompletionCore(options = {}) {
        this.ensureNotDisposed();
        console.log('Waiting for terminal command completion...');
        // Output text to a semaphore file. This will execute when the terminal is no longer busy.
        this.sendTextRaw(`echo Done > ${this._semaphorePath}`);
        // Wait for the semaphore file
        await this.waitForFileCreation(this._semaphorePath);
        assert(await fse.pathExists(this._outputFilePath), 'The output file from the command was not created. Sometimes this can mean the command to execute was not found.');
        let outputText = bufferToString(await fse.readFile(this._outputFilePath));
        assert(await fse.pathExists(this._errFilePath), 'The error file from the command was not created.');
        let errorText = bufferToString(await fse.readFile(this._errFilePath));
        console.log("OUTPUT:");
        console.log(outputText ? outputText : '(NONE)');
        console.log("END OF OUTPUT");
        if (errorText) {
            if (options.ignoreErrors) {
                // console.log("ERROR OUTPUT (IGNORED):");
                // console.log(errorText.replace(/\r/, "\rIGNORED: "));
                // console.log("END OF ERROR OUTPUT (IGNORED)");
            }
            else {
                console.log("ERRORS:");
                console.log(errorText.replace(/\r/, "\rERROR: "));
                console.log("END OF ERRORS");
            }
        }
        // Remove files in preparation for next commands, if any
        await fse.remove(this._semaphorePath);
        await fse.remove(this._outputFilePath);
        await fse.remove(this._errFilePath);
        return { outputText: outputText, errorText: errorText };
    }
    /**
     * Executes one or more commands and waits for them to complete. Returns stdout output and
     * throws if there is output to stdout.
     */
    async execute(commands, options = {}) {
        if (typeof commands === 'string') {
            commands = [commands];
        }
        this.show();
        for (let command of commands) {
            this.sendText(command);
        }
        let results = await this.waitForCompletionCore(options);
        if (!options.ignoreErrors) {
            assert.equal(results.errorText, '', `Encountered errors executing in terminal`);
        }
        return results.outputText;
    }
    get name() {
        this.ensureNotDisposed();
        return this._terminal.name;
    }
    get processId() {
        this.ensureNotDisposed();
        return this._terminal.processId;
    }
    async waitForFileCreation(filePath) {
        return new Promise((resolve, _reject) => {
            let timer = setInterval(() => {
                if (fse.existsSync(filePath)) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    }
    /**
     * Sends text to the terminal, does not wait for completion
     */
    sendText(text, addNewLine) {
        this.ensureNotDisposed();
        console.log(`Executing in terminal: ${text}`);
        if (addNewLine !== false) {
            // Redirect the output and error output to files (not a perfect solution, but it works)
            text += ` >>${this._outputFilePath} 2>>${this._errFilePath}`;
        }
        this.sendTextRaw(text, addNewLine);
    }
    sendTextRaw(text, addNewLine) {
        this._terminal.sendText(text, addNewLine);
    }
    show(preserveFocus) {
        this.ensureNotDisposed();
        this._terminal.show(preserveFocus);
    }
    hide() {
        this.ensureNotDisposed();
        this._terminal.hide();
    }
    dispose() {
        this._disposed = true;
        this._terminal.dispose();
    }
    ensureNotDisposed() {
        assert(!this._disposed, 'Terminal has already been disposed.');
    }
}
TestTerminal._lastSuffix = 1;
function bufferToString(buffer) {
    if (buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        // Buffer is in UTF-16 format (happens in some shells)
        return buffer.toString("utf-16le");
    }
    return buffer.toString();
}
//# sourceMappingURL=TerminalProvider.js.map