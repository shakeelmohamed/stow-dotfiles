"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
const path = require("path");
const xmldom_1 = require("xmldom");
const common_1 = require("../common");
const constants = require("../constants");
class XmlTreeDataProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChangeTreeData = new vscode_2.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        vscode_1.window.onDidChangeActiveTextEditor(() => {
            this._refreshTree();
        });
        vscode_1.workspace.onDidChangeTextDocument(() => {
            this._refreshTree();
        });
        this._refreshTree();
    }
    get activeEditor() {
        return vscode_1.window.activeTextEditor || null;
    }
    getTreeItem(element) {
        const enableMetadata = common_1.Configuration.enableXmlTreeViewMetadata;
        const enableSync = common_1.Configuration.enableXmlTreeViewCursorSync;
        const treeItem = new vscode_2.TreeItem(element.localName);
        if (!this._xmlTraverser.isElement(element)) {
            treeItem.label = `${element.localName} = "${element.nodeValue}"`;
        }
        else if (enableMetadata) {
            const childAttributes = this._xmlTraverser.getChildAttributeArray(element);
            const childElements = this._xmlTraverser.getChildElementArray(element);
            const totalChildren = (childAttributes.length + childElements.length);
            if (totalChildren > 0) {
                treeItem.label += "  (";
                if (childAttributes.length > 0) {
                    treeItem.label += `attributes: ${childAttributes.length}, `;
                    treeItem.collapsibleState = vscode_2.TreeItemCollapsibleState.Collapsed;
                }
                if (childElements.length > 0) {
                    treeItem.label += `children: ${childElements.length}, `;
                    treeItem.collapsibleState = vscode_2.TreeItemCollapsibleState.Collapsed;
                }
                treeItem.label = treeItem.label.substr(0, treeItem.label.length - 2);
                treeItem.label += ")";
            }
            if (this._xmlTraverser.hasSimilarSiblings(element) && enableSync) {
                treeItem.label += ` [line ${element.lineNumber}]`;
            }
        }
        treeItem.command = {
            command: constants.nativeCommands.revealLine,
            title: "",
            arguments: [{
                    lineNumber: element.lineNumber - 1,
                    at: "top"
                }]
        };
        treeItem.iconPath = this._getIcon(element);
        return treeItem;
    }
    getChildren(element) {
        if (!this._xmlDocument) {
            this._refreshTree();
        }
        if (this._xmlTraverser.isElement(element)) {
            return [].concat(this._xmlTraverser.getChildAttributeArray(element), this._xmlTraverser.getChildElementArray(element));
        }
        else if (this._xmlDocument) {
            return [this._xmlDocument.lastChild];
        }
        else {
            return [];
        }
    }
    getParent(element) {
        if ((!element || !element.parentNode || !element.parentNode.parentNode) && !element.ownerElement) {
            return undefined;
        }
        return element.parentNode || element.ownerElement;
    }
    getNodeAtPosition(position) {
        return this._xmlTraverser.getNodeAtPosition(position);
    }
    _getIcon(element) {
        let type = "element";
        if (!this._xmlTraverser.isElement(element)) {
            type = "attribute";
        }
        const icon = {
            dark: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.dark.svg`)),
            light: this._context.asAbsolutePath(path.join("resources", "icons", `${type}.light.svg`))
        };
        return icon;
    }
    _refreshTree() {
        if (!this.activeEditor || this.activeEditor.document.languageId !== constants.languageIds.xml) {
            common_1.NativeCommands.setContext(constants.contextKeys.xmlTreeViewEnabled, false);
            this._xmlDocument = null;
            this._onDidChangeTreeData.fire();
            return;
        }
        const enableTreeView = common_1.Configuration.enableXmlTreeView;
        common_1.NativeCommands.setContext(constants.contextKeys.xmlTreeViewEnabled, enableTreeView);
        const xml = this.activeEditor.document.getText();
        try {
            this._xmlDocument = new xmldom_1.DOMParser({
                errorHandler: () => {
                    throw new Error("Invalid Document");
                },
                locator: {}
            }).parseFromString(xml, "text/xml");
        }
        catch (_a) {
            this._xmlDocument = new xmldom_1.DOMParser().parseFromString("<InvalidDocument />", "text/xml");
        }
        finally {
            this._xmlTraverser = this._xmlTraverser || new common_1.XmlTraverser(this._xmlDocument);
            this._xmlTraverser.xmlDocument = this._xmlDocument;
        }
        this._onDidChangeTreeData.fire();
    }
}
exports.XmlTreeDataProvider = XmlTreeDataProvider;
//# sourceMappingURL=xml-tree-data-provider.js.map