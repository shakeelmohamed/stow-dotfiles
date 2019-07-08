"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xpath = require("xpath");
const xmldom_1 = require("xmldom");
class EvaluatorResult {
}
exports.EvaluatorResult = EvaluatorResult;
class EvaluatorResultType {
}
EvaluatorResultType.SCALAR_TYPE = 0;
EvaluatorResultType.NODE_COLLECTION = 1;
exports.EvaluatorResultType = EvaluatorResultType;
class XPathResultTypes {
}
XPathResultTypes.ANY_TYPE = 0;
XPathResultTypes.NUMBER_TYPE = 1;
XPathResultTypes.STRING_TYPE = 2;
XPathResultTypes.BOOLEAN_TYPE = 3;
XPathResultTypes.UNORDERED_NODE_ITERATOR_TYPE = 4;
XPathResultTypes.ORDERED_NODE_ITERATOR_TYPE = 5;
XPathResultTypes.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
XPathResultTypes.ORDERED_NODE_SNAPSHOT_TYPE = 7;
XPathResultTypes.ANY_UNORDERED_NODE_TYPE = 8;
XPathResultTypes.FIRST_ORDERED_NODE_TYPE = 9;
exports.XPathResultTypes = XPathResultTypes;
class XPathEvaluator {
    static evaluate(query, xml, ignoreDefaultNamespace) {
        if (ignoreDefaultNamespace) {
            xml = xml.replace(/xmlns=".+"/g, (match) => {
                return match.replace(/xmlns/g, "xmlns:default");
            });
        }
        const nodes = new Array();
        const xdoc = new xmldom_1.DOMParser().parseFromString(xml, "text/xml");
        const resolver = xpath.createNSResolver(xdoc);
        const xPathResult = xpath.evaluate(query, xdoc, resolver, 0, null);
        const evaluatorResult = new EvaluatorResult();
        evaluatorResult.type = EvaluatorResultType.SCALAR_TYPE;
        switch (xPathResult.resultType) {
            case XPathResultTypes.NUMBER_TYPE:
                evaluatorResult.result = xPathResult.numberValue;
                break;
            case XPathResultTypes.STRING_TYPE:
                evaluatorResult.result = xPathResult.stringValue;
                break;
            case XPathResultTypes.BOOLEAN_TYPE:
                evaluatorResult.result = xPathResult.booleanValue;
                break;
            case XPathResultTypes.UNORDERED_NODE_ITERATOR_TYPE:
            case XPathResultTypes.ORDERED_NODE_ITERATOR_TYPE:
                evaluatorResult.result = xPathResult.booleanValue;
                let node;
                while (node = xPathResult.iterateNext()) {
                    nodes.push(node);
                }
                evaluatorResult.result = nodes;
                evaluatorResult.type = EvaluatorResultType.NODE_COLLECTION;
                break;
        }
        return evaluatorResult;
    }
}
exports.XPathEvaluator = XPathEvaluator;
//# sourceMappingURL=xpath-evaluator.js.map