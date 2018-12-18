"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const getImageOrContainerDisplayName_1 = require("./getImageOrContainerDisplayName");
const nodeBase_1 = require("./nodeBase");
class ContainerNode extends nodeBase_1.NodeBase {
    constructor(label, containerDesc, contextValue, iconPath) {
        super(label);
        this.label = label;
        this.containerDesc = containerDesc;
        this.contextValue = contextValue;
        this.iconPath = iconPath;
    }
    getTreeItem() {
        let config = vscode.workspace.getConfiguration('docker');
        let displayName = getImageOrContainerDisplayName_1.getImageOrContainerDisplayName(this.label, config.get('truncateLongRegistryPaths'), config.get('truncateMaxLength'));
        return {
            label: `${displayName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: this.contextValue,
            iconPath: this.iconPath
        };
    }
}
exports.ContainerNode = ContainerNode;
//# sourceMappingURL=containerNode.js.map