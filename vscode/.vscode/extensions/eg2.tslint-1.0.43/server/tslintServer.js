/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const delayer_1 = require("./delayer");
const fixer_1 = require("./fixer");
const runner_1 = require("./runner");
class SettingsCache {
    constructor() {
        this.uri = undefined;
        this.promise = undefined;
    }
    get(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri === this.uri) {
                trace('SettingsCache: cache hit for ' + this.uri);
                return this.promise;
            }
            if (scopedSettingsSupport) {
                this.uri = uri;
                return this.promise = new Promise((resolve, _reject) => __awaiter(this, void 0, void 0, function* () {
                    trace('SettingsCache: cache updating cache for' + this.uri);
                    let configRequestParam = { items: [{ scopeUri: uri, section: 'tslint' }] };
                    let settings = yield connection.sendRequest(server.ConfigurationRequest.type, configRequestParam);
                    resolve(settings[0]);
                }));
            }
            this.promise = Promise.resolve(globalSettings);
            return this.promise;
        });
    }
    flush() {
        this.uri = undefined;
        this.promise = undefined;
    }
}
let settingsCache = new SettingsCache();
let globalSettings = {};
let scopedSettingsSupport = false;
process.on('unhandledRejection', (reason, p) => {
    connection.console.info(`Unhandled Rejection at: Promise ${p} reason:, ${reason}`);
});
function computeKey(diagnostic) {
    let range = diagnostic.range;
    return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}`;
}
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new server.NotificationType('tslint/status');
})(StatusNotification || (StatusNotification = {}));
let validationDelayer = new Map(); // key is the URI of the document
function makeDiagnostic(settings, problem) {
    let severity;
    let alwaysWarning = settings && settings.alwaysShowRuleFailuresAsWarnings;
    // tslint5 supports to assign severities to rules
    if (!alwaysWarning && problem.getRuleSeverity && problem.getRuleSeverity() === 'error') {
        severity = server.DiagnosticSeverity.Error;
    }
    else {
        severity = server.DiagnosticSeverity.Warning;
    }
    let diagnostic = {
        severity: severity,
        message: problem.getFailure(),
        range: {
            start: {
                line: problem.getStartPosition().getLineAndCharacter().line,
                character: problem.getStartPosition().getLineAndCharacter().character
            },
            end: {
                line: problem.getEndPosition().getLineAndCharacter().line,
                character: problem.getEndPosition().getLineAndCharacter().character
            },
        },
        code: problem.getRuleName(),
        source: 'tslint'
    };
    return diagnostic;
}
let codeFixActions = new Map();
let codeDisableRuleActions = new Map();
function recordCodeAction(document, diagnostic, problem) {
    let documentDisableRuleFixes = codeDisableRuleActions[document.uri];
    if (!documentDisableRuleFixes) {
        documentDisableRuleFixes = Object.create(null);
        codeDisableRuleActions[document.uri] = documentDisableRuleFixes;
    }
    documentDisableRuleFixes[computeKey(diagnostic)] = createDisableRuleFix(problem, document);
    let fix = undefined;
    // tslint can return a fix with an empty replacements array, these fixes are ignored
    if (problem.getFix && problem.getFix() && !replacementsAreEmpty(problem.getFix())) { // tslint fixes are not available in tslint < 3.17
        fix = createAutoFix(problem, document, problem.getFix());
    }
    if (!fix) {
        let vscFix = fixer_1.createVscFixForRuleFailure(problem, document);
        if (vscFix) {
            fix = createAutoFix(problem, document, vscFix);
        }
    }
    if (!fix) {
        return;
    }
    let documentAutoFixes = codeFixActions[document.uri];
    if (!documentAutoFixes) {
        documentAutoFixes = Object.create(null);
        codeFixActions[document.uri] = documentAutoFixes;
    }
    documentAutoFixes[computeKey(diagnostic)] = fix;
}
function convertReplacementToAutoFix(document, repl) {
    let start = document.positionAt(repl.start);
    let end = document.positionAt(repl.end);
    return {
        range: [start, end],
        text: repl.text,
    };
}
function getErrorMessage(err, document) {
    let errorMessage = `unknown error`;
    if (typeof err.message === 'string' || err.message instanceof String) {
        errorMessage = err.message;
    }
    let fsPath = server.Files.uriToFilePath(document.uri);
    let message = `vscode-tslint: '${errorMessage}' while validating: ${fsPath} stacktrace: ${err.stack}`;
    return message;
}
function getConfigurationFailureMessage(err) {
    let errorMessage = `unknown error`;
    if (typeof err.message === 'string' || err.message instanceof String) {
        errorMessage = err.message;
    }
    return `vscode-tslint: Cannot read tslint configuration - '${errorMessage}'`;
}
function validateAllTextDocuments(conn, documents) {
    trace('validateAllTextDocuments');
    let tracker = new server.ErrorMessageTracker();
    documents.forEach(document => {
        try {
            validateTextDocument(conn, document);
        }
        catch (err) {
            tracker.add(getErrorMessage(err, document));
        }
    });
}
let tslintRunner = undefined;
function validateTextDocument(connection, document) {
    return __awaiter(this, void 0, void 0, function* () {
        trace('start validateTextDocument');
        let uri = document.uri;
        let settings = yield settingsCache.get(uri);
        trace('validateTextDocument: settings fetched');
        if (settings && !settings.enable) {
            // send diagnostics event to flush existing warnings
            connection.sendDiagnostics({ uri: uri, diagnostics: [] });
            return;
        }
        let diagnostics = [];
        delete codeFixActions[uri];
        delete codeDisableRuleActions[uri];
        // tslint can only validate files on disk
        if (vscode_uri_1.default.parse(uri).scheme !== 'file') {
            trace(`No linting: file is not saved on disk`);
            return diagnostics;
        }
        let fsPath = server.Files.uriToFilePath(uri);
        if (!settings) {
            trace('No linting: settings could not be loaded');
            return diagnostics;
        }
        if (!settings.enable) {
            trace('No linting: tslint is disabled');
            return diagnostics;
        }
        if (!tslintRunner) {
            tslintRunner = new runner_1.TsLintRunner(trace);
        }
        let traceLevel = 'normal';
        if (settings.trace && settings.trace.server && settings.trace.server === 'verbose') {
            traceLevel = 'verbose';
        }
        let runConfiguration = {
            workspaceFolderPath: settings.workspaceFolderPath,
            configFile: settings.configFile,
            jsEnable: settings.jsEnable,
            exclude: settings.exclude,
            ignoreDefinitionFiles: settings.ignoreDefinitionFiles,
            nodePath: settings.nodePath,
            packageManager: settings.packageManager,
            rulesDirectory: settings.rulesDirectory,
            validateWithDefaultConfig: settings.validateWithDefaultConfig,
            traceLevel: traceLevel
        };
        let result = tslintRunner.runTsLint(fsPath, document.getText(), runConfiguration);
        if (result.warnings.length > 0) {
            connection.sendNotification(StatusNotification.type, { state: Status.warn });
            result.warnings.forEach(each => {
                connection.console.warn(each);
            });
        }
        let filterdFailures = tslintRunner.filterProblemsForFile(fsPath, result.lintResult.failures);
        filterdFailures.forEach(each => {
            let diagnostic = makeDiagnostic(settings, each);
            diagnostics.push(diagnostic);
            recordCodeAction(document, diagnostic, each);
        });
        connection.sendDiagnostics({ uri, diagnostics });
    });
}
let connection = server.createConnection(new server.IPCMessageReader(process), new server.IPCMessageWriter(process));
let documents = new server.TextDocuments();
documents.listen(connection);
function trace(message, verbose) {
    connection.tracer.log(message, verbose);
}
connection.onInitialize((params) => {
    function hasClientCapability(name) {
        let keys = name.split('.');
        let c = params.capabilities;
        for (let i = 0; c && i < keys.length; i++) {
            c = c[keys[i]];
        }
        return !!c;
    }
    scopedSettingsSupport = hasClientCapability('workspace.configuration');
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            codeActionProvider: true
        }
    };
});
documents.onDidOpen((event) => __awaiter(this, void 0, void 0, function* () {
    trace('onDidOpen');
    triggerValidateDocument(event.document);
}));
documents.onDidChangeContent((event) => __awaiter(this, void 0, void 0, function* () {
    trace('onDidChangeContent');
    let settings = yield settingsCache.get(event.document.uri);
    trace('onDidChangeContent: settings' + settings);
    if (settings && settings.run === 'onType') {
        trace('onDidChangeContent: triggerValidateDocument');
        triggerValidateDocument(event.document);
    }
    // clear the diagnostics when validating on save and when the document is modified
    else if (settings && settings.run === 'onSave') {
        connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    }
}));
documents.onDidSave((event) => __awaiter(this, void 0, void 0, function* () {
    let settings = yield settingsCache.get(event.document.uri);
    if (settings && settings.run === 'onSave') {
        triggerValidateDocument(event.document);
    }
}));
documents.onDidClose((event) => {
    // A text document was closed we clear the diagnostics
    trace('onDidClose' + event.document.uri);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function triggerValidateDocument(document) {
    let d = validationDelayer[document.uri];
    trace('triggerValidation on ' + document.uri);
    if (!d) {
        d = new delayer_1.Delayer(200);
        validationDelayer[document.uri] = d;
    }
    d.trigger(() => __awaiter(this, void 0, void 0, function* () {
        trace('trigger validateTextDocument');
        forceValidation(connection, document);
    }));
}
function forceValidation(connection, document) {
    return __awaiter(this, void 0, void 0, function* () {
        if (validationDelayer[document.uri]) {
            yield validateTextDocument(connection, document);
            delete validationDelayer[document.uri];
        }
    });
}
function tslintConfigurationValid() {
    try {
        documents.all().forEach((each) => {
            let fsPath = server.Files.uriToFilePath(each.uri);
            if (fsPath) {
                // TODO getConfiguration(fsPath, configFile);
            }
        });
    }
    catch (err) {
        connection.console.info(getConfigurationFailureMessage(err));
        connection.sendNotification(StatusNotification.type, { state: Status.error });
        return false;
    }
    return true;
}
// The VS Code tslint settings have changed. Revalidate all documents.
connection.onDidChangeConfiguration((params) => {
    trace('onDidChangeConfiguraton');
    globalSettings = params.settings;
    if (tslintRunner) {
        tslintRunner.onConfigFileChange('');
    }
    settingsCache.flush();
    validateAllTextDocuments(connection, documents.all());
});
// The watched tslint.json has changed. Revalidate all documents, IF the configuration is valid.
connection.onDidChangeWatchedFiles((params) => {
    // Tslint 3.7 started to load configuration files using 'require' and they are now
    // cached in the node module cache. To ensure that the extension uses
    // the latest configuration file we remove the config file from the module cache.
    params.changes.forEach(element => {
        let configFilePath = server.Files.uriToFilePath(element.uri);
        if (configFilePath) {
            let cached = require.cache[configFilePath];
            if (cached) {
                delete require.cache[configFilePath];
            }
        }
    });
    if (tslintRunner) {
        tslintRunner.onConfigFileChange('');
    }
    if (tslintConfigurationValid()) {
        validateAllTextDocuments(connection, documents.all());
    }
});
connection.onCodeAction((params) => {
    let result = [];
    let uri = params.textDocument.uri;
    let documentVersion = -1;
    let ruleId = undefined;
    let documentFixes = codeFixActions[uri];
    if (documentFixes) {
        for (let diagnostic of params.context.diagnostics) {
            let autoFix = documentFixes[computeKey(diagnostic)];
            if (autoFix) {
                documentVersion = autoFix.documentVersion;
                ruleId = autoFix.problem.getRuleName();
                let command = server.Command.create(autoFix.label, '_tslint.applySingleFix', uri, documentVersion, createTextEdit(autoFix));
                let codeAction = server.CodeAction.create(autoFix.label, command, server.CodeActionKind.QuickFix);
                codeAction.diagnostics = [diagnostic];
                result.push(codeAction);
            }
        }
        if (result.length > 0) {
            let same = [];
            let all = [];
            let fixes = Object.keys(documentFixes).map(key => documentFixes[key]);
            fixes = sortFixes(fixes);
            for (let autofix of fixes) {
                if (documentVersion === -1) {
                    documentVersion = autofix.documentVersion;
                }
                if (autofix.problem.getRuleName() === ruleId && !overlaps(getLastEdit(same), autofix)) {
                    same.push(autofix);
                }
                if (!overlaps(getLastEdit(all), autofix)) {
                    all.push(autofix);
                }
            }
            // if the same rule warning exists more than once, provide a command to fix all these warnings
            if (same.length > 1) {
                let label = `Fix all: ${same[0].problem.getFailure()}`;
                let command = server.Command.create(label, '_tslint.applySameFixes', uri, documentVersion, concatenateEdits(same));
                result.push(server.CodeAction.create(label, command, server.CodeActionKind.QuickFix));
            }
            // create a command to fix all the warnings with fixes
            if (all.length > 1) {
                let label = `Fix all auto-fixable problems`;
                let command = server.Command.create(label, '_tslint.applyAllFixes', uri, documentVersion, concatenateEdits(all));
                // Contribute both a kind = Source and kind = Quick Fix. Then
                // action appears in the light bulb (for backward compatibility) and the Source... quick pick.
                result.push(server.CodeAction.create(`${label} (tslint)`, command, server.CodeActionKind.Source), server.CodeAction.create(label, command, server.CodeActionKind.QuickFix));
            }
        }
    }
    // add the fix to disable the rule
    let disableRuleFixes = codeDisableRuleActions[uri];
    if (disableRuleFixes) {
        for (let diagnostic of params.context.diagnostics) {
            let autoFix = disableRuleFixes[computeKey(diagnostic)];
            if (autoFix) {
                documentVersion = autoFix.documentVersion;
                ruleId = autoFix.problem.getRuleName();
                let command = server.Command.create(autoFix.label, '_tslint.applyDisableRule', uri, documentVersion, createTextEdit(autoFix));
                let codeAction = server.CodeAction.create(autoFix.label, command, server.CodeActionKind.QuickFix);
                codeAction.diagnostics = [diagnostic];
                result.push(codeAction);
            }
        }
    }
    // quick fix to show the rule documentation
    if (documentFixes) {
        for (let diagnostic of params.context.diagnostics) {
            let autoFix = disableRuleFixes[computeKey(diagnostic)];
            if (autoFix) {
                documentVersion = autoFix.documentVersion;
                let ruleId = autoFix.problem.getRuleName();
                let label = `Show documentation for "${ruleId}"`;
                let command = server.Command.create(label, '_tslint.showRuleDocumentation', uri, documentVersion, undefined, ruleId);
                let codeAction = server.CodeAction.create(label, command, server.CodeActionKind.QuickFix);
                codeAction.diagnostics = [diagnostic];
                result.push(codeAction);
            }
        }
    }
    return result;
});
function replacementsAreEmpty(fix) {
    // in tslint 4 a Fix has a replacement property witht the Replacements
    if (fix.replacements) {
        return fix.replacements.length === 0;
    }
    // tslint 5
    if (Array.isArray(fix)) {
        return fix.length === 0;
    }
    return false;
}
function createAutoFix(problem, document, fix) {
    let edits = [];
    function isTslintAutofixEdit(fix) {
        return fix.range !== undefined;
    }
    if (isTslintAutofixEdit(fix)) {
        edits = [fix];
    }
    else {
        let ff = fix;
        // in tslint4 a Fix has a replacement property with the Replacements
        if (ff.replacements) {
            // tslint4
            edits = ff.replacements.map(each => convertReplacementToAutoFix(document, each));
        }
        else {
            // in tslint 5 a Fix is a Replacment | Replacement[]
            if (!Array.isArray(fix)) {
                fix = [fix];
            }
            edits = fix.map(each => convertReplacementToAutoFix(document, each));
        }
    }
    let autofix = {
        label: `Fix: ${problem.getFailure()}`,
        documentVersion: document.version,
        problem: problem,
        edits: edits,
    };
    return autofix;
}
function createDisableRuleFix(problem, document) {
    let pos = {
        character: 0,
        line: problem.getStartPosition().getLineAndCharacter().line
    };
    let disableEdit = {
        range: [pos, pos],
        // prefix to the text will be inserted on the client
        text: `// tslint:disable-next-line:${problem.getRuleName()}\n`
    };
    let disableFix = {
        label: `Disable rule "${problem.getRuleName()}" for this line`,
        documentVersion: document.version,
        problem: problem,
        edits: [disableEdit]
    };
    return disableFix;
}
function sortFixes(fixes) {
    // The AutoFix.edits are sorted, so we sort on the first edit
    return fixes.sort((a, b) => {
        let editA = a.edits[0];
        let editB = b.edits[0];
        if (editA.range[0] < editB.range[0]) {
            return -1;
        }
        if (editA.range[0] > editB.range[0]) {
            return 1;
        }
        // lines are equal
        if (editA.range[1] < editB.range[1]) {
            return -1;
        }
        if (editA.range[1] > editB.range[1]) {
            return 1;
        }
        // characters are equal
        return 0;
    });
}
function overlaps(lastFix, nextFix) {
    if (!lastFix) {
        return false;
    }
    let doesOverlap = false;
    lastFix.edits.some(last => {
        return nextFix.edits.some(next => {
            if (last.range[1].line > next.range[0].line) {
                doesOverlap = true;
                return true;
            }
            else if (last.range[1].line < next.range[0].line) {
                return false;
            }
            else if (last.range[1].character >= next.range[0].character) {
                doesOverlap = true;
                return true;
            }
            return false;
        });
    });
    return doesOverlap;
}
exports.overlaps = overlaps;
function getLastEdit(array) {
    let length = array.length;
    if (length === 0) {
        return undefined;
    }
    return array[length - 1];
}
function getAllNonOverlappingFixes(fixes) {
    let nonOverlapping = [];
    let hasOverlappingFixes = false;
    fixes = sortFixes(fixes);
    for (let autofix of fixes) {
        if (!overlaps(getLastEdit(nonOverlapping), autofix)) {
            nonOverlapping.push(autofix);
        }
        else {
            hasOverlappingFixes = true;
        }
    }
    return [nonOverlapping, hasOverlappingFixes];
}
exports.getAllNonOverlappingFixes = getAllNonOverlappingFixes;
function createTextEdit(autoFix) {
    return autoFix.edits.map(each => server.TextEdit.replace(server.Range.create(each.range[0], each.range[1]), each.text || ''));
}
var AllFixesRequest;
(function (AllFixesRequest) {
    AllFixesRequest.type = new server.RequestType('textDocument/tslint/allFixes');
})(AllFixesRequest || (AllFixesRequest = {}));
connection.onRequest(AllFixesRequest.type, (params) => __awaiter(this, void 0, void 0, function* () {
    let result = undefined;
    let uri = params.textDocument.uri;
    let isOnSave = params.isOnSave;
    let document = documents.get(uri);
    if (!document) {
        return undefined;
    }
    yield forceValidation(connection, document);
    let documentFixes = codeFixActions[uri];
    let documentVersion = -1;
    let settings = yield settingsCache.get(uri);
    if (!documentFixes) {
        return undefined;
    }
    let fixes = Object.keys(documentFixes).map(key => documentFixes[key]);
    for (let fix of fixes) {
        if (documentVersion === -1) {
            documentVersion = fix.documentVersion;
            break;
        }
    }
    // Filter out fixes for problems that aren't defined to be autofixable on save
    if (isOnSave && settings && Array.isArray(settings.autoFixOnSave)) {
        const autoFixOnSave = settings.autoFixOnSave;
        fixes = fixes.filter(fix => autoFixOnSave.indexOf(fix.problem.getRuleName()) > -1);
    }
    let [allFixes, overlappingEdits] = getAllNonOverlappingFixes(fixes);
    result = {
        documentVersion: documentVersion,
        edits: concatenateEdits(allFixes),
        overlappingFixes: overlappingEdits
    };
    return result;
}));
function concatenateEdits(fixes) {
    let textEdits = [];
    fixes.forEach(each => {
        textEdits = textEdits.concat(createTextEdit(each));
    });
    return textEdits;
}
connection.listen();
//# sourceMappingURL=tslintServer.js.map