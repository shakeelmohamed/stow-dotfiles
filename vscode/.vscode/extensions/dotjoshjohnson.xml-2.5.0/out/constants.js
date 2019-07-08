"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commands;
(function (commands) {
    commands.evaluateXPath = "xmlTools.evaluateXPath";
    commands.executeXQuery = "xmlTools.executeXQuery";
    commands.formatAsXml = "xmlTools.formatAsXml";
    commands.xmlToText = "xmlTools.xmlToText";
    commands.textToXml = "xmlTools.textToXml";
    commands.getCurrentXPath = "xmlTools.getCurrentXPath";
    commands.minifyXml = "xmlTools.minifyXml";
})(commands = exports.commands || (exports.commands = {}));
var contextKeys;
(function (contextKeys) {
    contextKeys.xmlTreeViewEnabled = "xmlTreeViewEnabled";
})(contextKeys = exports.contextKeys || (exports.contextKeys = {}));
var diagnosticCollections;
(function (diagnosticCollections) {
    diagnosticCollections.xquery = "XQueryDiagnostics";
})(diagnosticCollections = exports.diagnosticCollections || (exports.diagnosticCollections = {}));
var languageIds;
(function (languageIds) {
    languageIds.xml = "xml";
    languageIds.xsd = "xsd";
    languageIds.xquery = "xquery";
})(languageIds = exports.languageIds || (exports.languageIds = {}));
var nativeCommands;
(function (nativeCommands) {
    nativeCommands.revealLine = "revealLine";
})(nativeCommands = exports.nativeCommands || (exports.nativeCommands = {}));
var stateKeys;
(function (stateKeys) {
    stateKeys.xpathQueryHistory = "xpathQueryHistory";
    stateKeys.xPathQueryLast = "xPathQueryLast";
})(stateKeys = exports.stateKeys || (exports.stateKeys = {}));
var uriSchemes;
(function (uriSchemes) {
    uriSchemes.file = "file";
    uriSchemes.untitled = "untitled";
})(uriSchemes = exports.uriSchemes || (exports.uriSchemes = {}));
var views;
(function (views) {
    views.xmlTreeView = "xmlTreeView";
})(views = exports.views || (exports.views = {}));
var xmlFormatterImplementations;
(function (xmlFormatterImplementations) {
    xmlFormatterImplementations.classic = "classic";
    xmlFormatterImplementations.v2 = "v2";
})(xmlFormatterImplementations = exports.xmlFormatterImplementations || (exports.xmlFormatterImplementations = {}));
//# sourceMappingURL=constants.js.map