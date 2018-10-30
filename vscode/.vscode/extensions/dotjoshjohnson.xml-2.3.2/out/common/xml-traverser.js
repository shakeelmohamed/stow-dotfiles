"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class XmlTraverser {
    constructor(_xmlDocument) {
        this._xmlDocument = _xmlDocument;
    }
    get xmlDocument() {
        return this._xmlDocument;
    }
    set xmlDocument(value) {
        this._xmlDocument = value;
    }
    getChildAttributeArray(node) {
        if (!node.attributes) {
            return [];
        }
        const array = new Array();
        for (let i = 0; i < node.attributes.length; i++) {
            array.push(node.attributes[i]);
        }
        return array;
    }
    getChildElementArray(node) {
        if (!node.childNodes) {
            return [];
        }
        const array = new Array();
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (this.isElement(child)) {
                array.push(child);
            }
        }
        return array;
    }
    getElementAtPosition(position) {
        const node = this.getNodeAtPosition(position);
        return this.getNearestElementAncestor(node);
    }
    getNearestElementAncestor(node) {
        if (!this.isElement) {
            return this.getNearestElementAncestor(node.parentNode);
        }
        return node;
    }
    getNodeAtPosition(position) {
        return this._getNodeAtPositionCore(position, this._xmlDocument.documentElement);
    }
    getSiblings(node) {
        if (this.isElement(node)) {
            return this.getSiblingElements(node);
        }
        return this.getSiblingAttributes(node);
    }
    getSiblingAttributes(node) {
        return this.getChildAttributeArray(node.parentNode);
    }
    getSiblingElements(node) {
        return this.getChildElementArray(node.parentNode);
    }
    hasSimilarSiblings(node) {
        if (!node || !node.parentNode || !this.isElement(node)) {
            return false;
        }
        const siblings = this.getChildElementArray(node.parentNode);
        return (siblings.filter(x => x.tagName === node.tagName).length > 1);
    }
    isElement(node) {
        return (!!node && !!node.tagName);
    }
    _getNodeAtPositionCore(position, contextNode) {
        if (!contextNode) {
            return undefined;
        }
        const lineNumber = contextNode.lineNumber;
        const columnNumber = contextNode.columnNumber;
        const columnRange = [columnNumber, (columnNumber + (this._getNodeWidthInCharacters(contextNode) - 1))];
        // for some reason, xmldom sets the column number for attributes to the "="
        if (!this.isElement(contextNode)) {
            columnRange[0] = (columnRange[0] - contextNode.nodeName.length);
        }
        if (lineNumber === (position.line + 1) && ((position.character + 1) >= columnRange[0] && (position.character + 1) < columnRange[1])) {
            return contextNode;
        }
        if (this.isElement(contextNode)) {
            const children = [...this.getChildAttributeArray(contextNode), ...this.getChildElementArray(contextNode)];
            let result;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                result = this._getNodeAtPositionCore(position, child);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }
    _getNodeWidthInCharacters(node) {
        if (this.isElement(node)) {
            return (node.nodeName.length + 2);
        }
        else {
            return (node.nodeName.length + node.nodeValue.length + 3);
        }
    }
}
exports.XmlTraverser = XmlTraverser;
//# sourceMappingURL=xml-traverser.js.map