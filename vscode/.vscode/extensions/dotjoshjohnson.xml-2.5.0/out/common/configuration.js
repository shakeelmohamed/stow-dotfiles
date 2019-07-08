"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const ExtensionTopLevelSection = "xmlTools";
class Configuration {
    static get enableXmlTreeView() {
        return this._getForWindow("enableXmlTreeView");
    }
    static get enableXmlTreeViewMetadata() {
        return this._getForWindow("enableXmlTreeViewMetadata");
    }
    static get enableXmlTreeViewCursorSync() {
        return this._getForWindow("enableXmlTreeViewCursorSync");
    }
    static get ignoreDefaultNamespace() {
        return this._getForWindow("ignoreDefaultNamespace");
    }
    static get persistXPathQuery() {
        return this._getForWindow("persistXPathQuery");
    }
    static get xmlFormatterImplementation() {
        return this._getForWindow("xmlFormatterImplementation");
    }
    static get xqueryExecutionArguments() {
        return this._getForWindow("xqueryExecutionArguments");
    }
    static get xqueryExecutionEngine() {
        return this._getForWindow("xqueryExecutionEngine");
    }
    static get xqueryExecutionInputLimit() {
        return this._getForWindow("xqueryExecutionInputLimit");
    }
    static get xqueryExecutionInputSearchPattern() {
        return this._getForWindow("xqueryExecutionInputSearchPattern");
    }
    static enforcePrettySelfClosingTagOnFormat(resource) {
        return this._getForResource("enforcePrettySelfClosingTagOnFormat", resource);
    }
    static removeCommentsOnMinify(resource) {
        return this._getForResource("removeCommentsOnMinify", resource);
    }
    static splitAttributesOnFormat(resource) {
        return this._getForResource("splitAttributesOnFormat", resource);
    }
    static splitXmlnsOnFormat(resource) {
        return this._getForResource("splitXmlnsOnFormat", resource);
    }
    static _getForResource(section, resource) {
        return vscode_1.workspace.getConfiguration(ExtensionTopLevelSection, resource).get(section);
    }
    static _getForWindow(section) {
        return vscode_1.workspace.getConfiguration(ExtensionTopLevelSection).get(section);
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map