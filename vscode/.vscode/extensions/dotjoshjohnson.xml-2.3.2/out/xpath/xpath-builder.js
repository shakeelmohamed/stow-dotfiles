"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class XPathBuilder {
    constructor(_xmlDocument) {
        this._xmlDocument = _xmlDocument;
        this._xmlTraverser = new common_1.XmlTraverser(this._xmlDocument);
    }
    build(position) {
        const selectedNode = this._xmlTraverser.getNodeAtPosition(position);
        return this._buildCore(selectedNode);
    }
    _buildCore(selectedNode) {
        if (selectedNode === this._xmlDocument.documentElement) {
            return `/${selectedNode.nodeName}`;
        }
        if (!this._xmlTraverser.isElement(selectedNode)) {
            return `${this._buildCore(selectedNode.ownerElement)}/@${selectedNode.nodeName}`;
        }
        else if (this._xmlTraverser.hasSimilarSiblings(selectedNode)) {
            const siblings = this._xmlTraverser.getSiblings(selectedNode);
            const xPathIndex = (siblings.indexOf(selectedNode) + 1);
            return `${this._buildCore(selectedNode.parentNode)}/${selectedNode.nodeName}[${xPathIndex}]`;
        }
        else {
            return `${this._buildCore(selectedNode.parentNode)}/${selectedNode.nodeName}`;
        }
    }
}
exports.XPathBuilder = XPathBuilder;
//# sourceMappingURL=xpath-builder.js.map