"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const ExtensionConfigPrefix = "xmlTools";
class ConfigService {
    get $baseConfig() {
        return vscode_1.workspace.getConfiguration(ExtensionConfigPrefix);
    }
    get enableXmlTreeView() {
        return this._getForWindow("enableXmlTreeView");
    }
    get enableXmlTreeViewMetadata() {
        return this._getForWindow("enableXmlTreeViewMetadata");
    }
    get enableXmlTreeViewCursorSync() {
        return this._getForWindow("enableXmlTreeViewCursorSync");
    }
    get xmlFormatterImplementation() {
        return this._getForWindow("xmlFormatterImplementation");
    }
    ignoreDefaultNamespace(resource) {
        return this._getForResource("ignoreDefaultNamespace", resource);
    }
    persistXPathQuery(resource) {
        return this._getForResource("persistXPathQuery", resource);
    }
    removeCommentsOnMinify(resource) {
        return this._getForResource("removeCommentsOnMinify", resource);
    }
    splitAttributesOnFormat(resource) {
        return this._getForResource("splitAttributesOnFormat", resource);
    }
    splitXmlnsOnFormat(resource) {
        return this._getForResource("splitXmlnsOnFormat", resource);
    }
    xqueryExecutionArguments(resource) {
        return this._getForResource("xqueryExecutionArguments", resource);
    }
    xqueryExecutionEngine(resource) {
        return this._getForResource("xqueryExecutionEngine", resource);
    }
    xqueryExecutionInputLimit(resource) {
        return this._getForResource("xqueryExecutionInputLimit", resource);
    }
    xqueryExecutionInputSearchPattern(resource) {
        return this._getForResource("xqueryExecutionInputSearchPattern", resource);
    }
    _getForResource(section, resource, defaultValue) {
        return vscode_1.workspace.getConfiguration(ExtensionConfigPrefix, resource).get(section, defaultValue);
    }
    _getForWindow(section, defaultValue) {
        return vscode_1.workspace.getConfiguration(ExtensionConfigPrefix).get(section, defaultValue);
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=config-service.js.map