"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const extensionVariables_1 = require("../extensionVariables");
/**
 * Prompts for a port number
 * @throws `UserCancelledError` if the user cancels.
 */
async function promptForPort(port) {
    let opt = {
        placeHolder: `${port}`,
        prompt: 'What port does your app listen on? ENTER for none.',
        value: `${port}`,
        validateInput: (value) => {
            if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
                return 'Port must be a positive integer or else empty for no exposed port';
            }
            return undefined;
        }
    };
    return extensionVariables_1.ext.ui.showInputBox(opt);
}
exports.promptForPort = promptForPort;
/**
 * Prompts for a platform
 * @throws `UserCancelledError` if the user cancels.
 */
async function quickPickPlatform() {
    let opt = {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: 'Select Application Platform'
    };
    const platforms = [
        'Go',
        'Java',
        '.NET Core Console',
        'ASP.NET Core',
        'Node.js',
        'Python',
        'Ruby',
        'Other'
    ];
    const items = platforms.map(p => ({ label: p, data: p }));
    let response = await extensionVariables_1.ext.ui.showQuickPick(items, opt);
    return response.data;
}
exports.quickPickPlatform = quickPickPlatform;
/**
 * Prompts for an OS
 * @throws `UserCancelledError` if the user cancels.
 */
async function quickPickOS() {
    let opt = {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: 'Select Operating System'
    };
    const OSes = ['Windows', 'Linux'];
    const items = OSes.map(p => ({ label: p, data: p }));
    let response = await extensionVariables_1.ext.ui.showQuickPick(items, opt);
    return response.data;
}
exports.quickPickOS = quickPickOS;
//# sourceMappingURL=config-utils.js.map