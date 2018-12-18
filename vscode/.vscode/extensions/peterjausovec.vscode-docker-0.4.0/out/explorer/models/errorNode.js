"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const nodeBase_1 = require("./nodeBase");
class ErrorNode extends nodeBase_1.NodeBase {
    constructor(error, contextValue) {
        super(vscode_azureextensionui_1.parseError(error).message);
        this.contextValue = contextValue;
        this.iconPath = path.join(__filename, '..', '..', '..', '..', 'images', 'warning.svg');
    }
}
ErrorNode.getImagesErrorContextValue = 'ErrorNode.getImages';
ErrorNode.getContainersErrorContextValue = 'ErrorNode.getContainers';
exports.ErrorNode = ErrorNode;
//# sourceMappingURL=errorNode.js.map