"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class CommandLineBuilder {
    constructor() {
        this.args = [];
    }
    static create(...args) {
        let builder = new CommandLineBuilder();
        for (let arg of args) {
            if (arg) {
                if (typeof arg === 'string') {
                    builder = builder.withArg(arg);
                }
                else {
                    builder = builder.withArgFactory(arg);
                }
            }
        }
        return builder;
    }
    build() {
        return this.args.map(arg => arg()).filter(arg => arg !== undefined).join(' ');
    }
    withArg(arg) {
        return this.withArgFactory(() => arg);
    }
    withArrayArgs(name, values, formatter) {
        formatter = formatter || ((value) => value.toString());
        return this.withArgFactory(() => values ? values.map(value => `${name} "${formatter(value)}"`).join(' ') : undefined);
    }
    withArgFactory(factory) {
        if (factory) {
            this.args.push(factory);
        }
        return this;
    }
    withFlagArg(name, value) {
        return this.withArgFactory(() => value ? name : undefined);
    }
    withKeyValueArgs(name, values) {
        return this.withArgFactory(() => {
            if (values) {
                const keys = Object.keys(values);
                if (keys.length > 0) {
                    return keys.map(key => `${name} "${key}=${values[key]}"`).join(' ');
                }
            }
            return undefined;
        });
    }
    withNamedArg(name, value) {
        return this.withArgFactory(() => value ? `${name} "${value}"` : undefined);
    }
    withQuotedArg(value) {
        return this.withArgFactory(() => value ? `"${value}"` : undefined);
    }
}
exports.CommandLineBuilder = CommandLineBuilder;
exports.default = CommandLineBuilder;
//# sourceMappingURL=commandLineBuilder.js.map