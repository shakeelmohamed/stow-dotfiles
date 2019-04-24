"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const child_process_1 = require("child_process");
var AllFixesRequest;
(function (AllFixesRequest) {
    AllFixesRequest.type = new vscode_languageclient_1.RequestType('textDocument/tslint/allFixes');
})(AllFixesRequest || (AllFixesRequest = {}));
var NoTSLintLibraryRequest;
(function (NoTSLintLibraryRequest) {
    NoTSLintLibraryRequest.type = new vscode_languageclient_1.RequestType('tslint/noLibrary');
})(NoTSLintLibraryRequest || (NoTSLintLibraryRequest = {}));
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new vscode_languageclient_1.NotificationType('tslint/status');
})(StatusNotification || (StatusNotification = {}));
let willSaveTextDocumentListener;
let configurationChangedListener;
function activate(context) {
    let statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 0);
    let tslintStatus = Status.ok;
    let serverRunning = false;
    statusBarItem.text = 'TSLint';
    statusBarItem.command = 'tslint.showOutputChannel';
    function showStatusBarItem(show) {
        if (show) {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    }
    function updateStatus(status) {
        if (tslintStatus !== Status.ok && status === Status.ok) { // an error got addressed fix, write to the output that the status is OK
            client.info('vscode-tslint: Status is OK');
        }
        tslintStatus = status;
        updateStatusBarVisibility(vscode_1.window.activeTextEditor);
    }
    function isTypeScriptDocument(document) {
        return document.languageId === 'typescript' || document.languageId === 'typescriptreact';
    }
    function isJavaScriptDocument(languageId) {
        return languageId === 'javascript' || languageId === 'javascriptreact';
    }
    function isEnabledForJavaScriptDocument(document) {
        let isJsEnable = vscode_1.workspace.getConfiguration('tslint', document.uri).get('jsEnable', true);
        if (isJsEnable && isJavaScriptDocument(document.languageId)) {
            return true;
        }
        return false;
    }
    function updateStatusBarVisibility(editor) {
        switch (tslintStatus) {
            case Status.ok:
                statusBarItem.text = 'TSLint';
                break;
            case Status.warn:
                statusBarItem.text = '$(alert) TSLint';
                break;
            case Status.error:
                statusBarItem.text = '$(issue-opened) TSLint';
                break;
        }
        let uri = editor ? editor.document.uri : undefined;
        let enabled = vscode_1.workspace.getConfiguration('tslint', uri)['enable'];
        let alwaysShowStatus = vscode_1.workspace.getConfiguration('tslint', uri)['alwaysShowStatus'];
        if (!editor || !enabled || (tslintStatus === Status.ok && !alwaysShowStatus)) {
            showStatusBarItem(false);
            return;
        }
        showStatusBarItem(serverRunning &&
            (isTypeScriptDocument(editor.document) || isEnabledForJavaScriptDocument(editor.document)));
    }
    vscode_1.window.onDidChangeActiveTextEditor(updateStatusBarVisibility);
    updateStatusBarVisibility(vscode_1.window.activeTextEditor);
    // We need to go one level up since an extension compile the js code into
    // the output folder.
    let serverModulePath = path.join(__dirname, '..', 'server', 'tslintServer.js');
    // break on start options
    //let debugOptions = { execArgv: ["--nolazy", "--inspect-brk=6010", "--trace-warnings"] };
    let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"], cwd: process.cwd() };
    let runOptions = { cwd: process.cwd() };
    let serverOptions = {
        run: { module: serverModulePath, transport: vscode_languageclient_1.TransportKind.ipc, options: runOptions },
        debug: { module: serverModulePath, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    let clientOptions = {
        documentSelector: [
            { language: 'typescript', scheme: 'file' },
            { language: 'typescriptreact', scheme: 'file' },
            { language: 'javascript', scheme: 'file' },
            { language: 'javascriptreact', scheme: 'file' }
        ],
        synchronize: {
            configurationSection: 'tslint',
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/tslint.{json,yml,yaml}')
        },
        diagnosticCollectionName: 'tslint',
        initializationFailedHandler: (error) => {
            client.error('Server initialization failed.', error);
            client.outputChannel.show(true);
            return false;
        },
        middleware: {
            provideCodeActions: (document, range, context, token, next) => {
                // do not ask server for code action when the diagnostic isn't from tslint
                if (!context.diagnostics || context.diagnostics.length === 0) {
                    return [];
                }
                let tslintDiagnostics = [];
                for (let diagnostic of context.diagnostics) {
                    if (diagnostic.source === 'tslint') {
                        tslintDiagnostics.push(diagnostic);
                    }
                }
                if (tslintDiagnostics.length === 0) {
                    return [];
                }
                let newContext = Object.assign({}, context, { diagnostics: tslintDiagnostics });
                return next(document, range, newContext, token);
            },
            workspace: {
                configuration: (params, token, next) => {
                    if (!params.items) {
                        return [];
                    }
                    let result = next(params, token, next);
                    let scopeUri = "";
                    for (let item of params.items) {
                        if (!item.scopeUri) {
                            continue;
                        }
                        else {
                            scopeUri = item.scopeUri;
                        }
                    }
                    let resource = client.protocol2CodeConverter.asUri(scopeUri);
                    let workspaceFolder = vscode_1.workspace.getWorkspaceFolder(resource);
                    if (workspaceFolder) {
                        convertToAbsolutePaths(result[0], workspaceFolder);
                        if (workspaceFolder.uri.scheme === 'file') {
                            result[0].workspaceFolderPath = workspaceFolder.uri.fsPath;
                        }
                    }
                    return result;
                }
            }
        }
    };
    let client = new vscode_languageclient_1.LanguageClient('tslint', serverOptions, clientOptions);
    client.registerProposedFeatures();
    const running = 'Linter is running.';
    const stopped = 'Linter has stopped.';
    client.onDidChangeState((event) => {
        if (event.newState === vscode_languageclient_1.State.Running) {
            client.info(running);
            statusBarItem.tooltip = running;
            serverRunning = true;
        }
        else {
            client.info(stopped);
            statusBarItem.tooltip = stopped;
            serverRunning = false;
        }
        updateStatusBarVisibility(vscode_1.window.activeTextEditor);
    });
    client.onReady().then(() => {
        client.onNotification(StatusNotification.type, (params) => {
            updateStatus(params.state);
        });
        client.onRequest(NoTSLintLibraryRequest.type, (params) => {
            let uri = vscode_1.Uri.parse(params.source.uri);
            let workspaceFolder = vscode_1.workspace.getWorkspaceFolder(uri);
            let packageManager = vscode_1.workspace.getConfiguration('tslint', uri).get('packageManager', 'npm');
            client.info(getInstallFailureMessage(uri, workspaceFolder, packageManager));
            updateStatus(Status.warn);
            return {};
        });
    });
    function getInstallFailureMessage(uri, workspaceFolder, packageManager) {
        let localCommands = {
            npm: 'npm install tslint',
            yarn: 'yarn add tslint'
        };
        let globalCommands = {
            npm: 'npm install -g tslint',
            yarn: 'yarn global add tslint'
        };
        if (workspaceFolder) { // workspace opened on a folder
            return [
                '',
                `Failed to load the TSLint library for the document ${uri.fsPath}`,
                '',
                `To use TSLint in this workspace please install tslint using \'${localCommands[packageManager]}\' or globally using \'${globalCommands[packageManager]}\'.`,
                'TSLint has a peer dependency on `typescript`, make sure that `typescript` is installed as well.',
                'You need to reopen the workspace after installing tslint.',
            ].join('\n');
        }
        else {
            return [
                `Failed to load the TSLint library for the document ${uri.fsPath}`,
                `To use TSLint for single file install tslint globally using \'${globalCommands[packageManager]}\'.`,
                'TSLint has a peer dependency on `typescript`, make sure that `typescript` is installed as well.',
                'You need to reopen VS Code after installing tslint.',
            ].join('\n');
        }
    }
    function convertToAbsolutePaths(settings, folder) {
        let configFile = settings.configFile;
        if (configFile) {
            settings.configFile = convertAbsolute(configFile, folder);
        }
        let nodePath = settings.nodePath;
        if (nodePath) {
            settings.nodePath = convertAbsolute(nodePath, folder);
        }
        if (settings.rulesDirectory) {
            if (Array.isArray(settings.rulesDirectory)) {
                for (let i = 0; i < settings.rulesDirectory.length; i++) {
                    settings.rulesDirectory[i] = convertAbsolute(settings.rulesDirectory[i], folder);
                }
            }
            else {
                settings.rulesDirectory = convertAbsolute(settings.rulesDirectory, folder);
            }
        }
    }
    function convertAbsolute(file, folder) {
        if (path.isAbsolute(file)) {
            return file;
        }
        let folderPath = folder.uri.fsPath;
        if (!folderPath) {
            return file;
        }
        return path.join(folderPath, file);
    }
    function applyTextEdits(uri, documentVersion, edits) {
        return __awaiter(this, void 0, void 0, function* () {
            let textEditor = vscode_1.window.activeTextEditor;
            if (textEditor && textEditor.document.uri.toString() === uri) {
                if (documentVersion !== -1 && textEditor.document.version !== documentVersion) {
                    vscode_1.window.showInformationMessage(`TSLint fixes are outdated and can't be applied to the document.`);
                    return true;
                }
                return textEditor.edit(mutator => {
                    for (let edit of edits) {
                        mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                    }
                });
            }
            return true;
        });
    }
    function applyDisableRuleEdit(uri, documentVersion, edits) {
        let textEditor = vscode_1.window.activeTextEditor;
        if (textEditor && textEditor.document.uri.toString() === uri) {
            if (textEditor.document.version !== documentVersion) {
                vscode_1.window.showInformationMessage(`TSLint fixes are outdated and can't be applied to the document.`);
            }
            // prefix disable comment with same indent as line with the diagnostic
            let edit = edits[0];
            let ruleLine = textEditor.document.lineAt(edit.range.start.line);
            let prefixIndex = ruleLine.firstNonWhitespaceCharacterIndex;
            let prefix = ruleLine.text.substr(0, prefixIndex);
            edit.newText = prefix + edit.newText;
            applyTextEdits(uri, documentVersion, edits);
        }
    }
    function showRuleDocumentation(_uri, _documentVersion, _edits, ruleId) {
        const tslintDocBaseURL = "https://palantir.github.io/tslint/rules";
        if (!ruleId) {
            return;
        }
        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse(tslintDocBaseURL + '/' + ruleId));
    }
    function fixAllProblems() {
        // server is not running so there can be no problems to fix
        if (!serverRunning) {
            return;
        }
        let textEditor = vscode_1.window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        return doFixAllProblems(textEditor.document, undefined); // no time budget
    }
    function exists(file) {
        return new Promise((resolve, _reject) => {
            fs.exists(file, (value) => {
                resolve(value);
            });
        });
    }
    function findTslint(rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            if (platform === 'win32' && (yield exists(path.join(rootPath, 'node_modules', '.bin', 'tslint.cmd')))) {
                return path.join('.', 'node_modules', '.bin', 'tslint.cmd');
            }
            else if ((platform === 'linux' || platform === 'darwin') && (yield exists(path.join(rootPath, 'node_modules', '.bin', 'tslint')))) {
                return path.join('.', 'node_modules', '.bin', 'tslint');
            }
            else {
                return 'tslint';
            }
        });
    }
    function createDefaultConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            let folders = vscode_1.workspace.workspaceFolders;
            let folder = undefined;
            if (!folders) {
                vscode_1.window.showErrorMessage('A TSLint configuration file can only be generated if VS Code is opened on a folder.');
                return;
            }
            if (folders.length === 1) {
                folder = folders[0];
            }
            else {
                const options = {
                    placeHolder: "Select the folder for generating the 'tslint.json' file"
                };
                folder = yield vscode_1.window.showWorkspaceFolderPick(options);
                if (!folder) {
                    return;
                }
            }
            const folderPath = folder.uri.fsPath;
            const tslintConfigFile = path.join(folderPath, 'tslint.json');
            if (fs.existsSync(tslintConfigFile)) {
                vscode_1.window.showInformationMessage('A TSLint configuration file already exists.');
                let document = yield vscode_1.workspace.openTextDocument(tslintConfigFile);
                vscode_1.window.showTextDocument(document);
            }
            else {
                const tslintCmd = yield findTslint(folderPath);
                const cmd = `${tslintCmd} --init`;
                const p = child_process_1.exec(cmd, { cwd: folderPath, env: process.env });
                p.on('exit', (code, _signal) => __awaiter(this, void 0, void 0, function* () {
                    if (code === 0) {
                        let document = yield vscode_1.workspace.openTextDocument(tslintConfigFile);
                        vscode_1.window.showTextDocument(document);
                    }
                    else {
                        vscode_1.window.showErrorMessage('Could not run `tslint` to generate a configuration file. Please verify that you have `tslint` and `typescript` installed.');
                    }
                }));
            }
        });
    }
    function willSaveTextDocument(e) {
        let config = vscode_1.workspace.getConfiguration('tslint', e.document.uri);
        let autoFix = config.get('autoFixOnSave', false);
        if (autoFix) {
            let document = e.document;
            // only auto fix when the document was manually saved by the user
            if (!(isTypeScriptDocument(document) || isEnabledForJavaScriptDocument(document))
                || e.reason !== vscode_1.TextDocumentSaveReason.Manual) {
                return;
            }
            e.waitUntil(doFixAllProblems(document, 500) // total willSave time budget is 1500
            );
        }
    }
    function configurationChanged() {
        updateStatusBarVisibility(vscode_1.window.activeTextEditor);
    }
    function doFixAllProblems(document, timeBudget) {
        let start = Date.now();
        let loopCount = 0;
        let retry = false;
        let lastVersion = document.version;
        let promise = client.sendRequest(AllFixesRequest.type, { textDocument: { uri: document.uri.toString() }, isOnSave: true }).then((result) => __awaiter(this, void 0, void 0, function* () {
            while (true) {
                // console.log('duration ', Date.now() - start);
                if (timeBudget && Date.now() - start > timeBudget) {
                    console.log(`TSLint auto fix on save maximum time budget (${timeBudget}ms) exceeded.`);
                    break;
                }
                if (loopCount++ > 10) {
                    console.log(`TSLint auto fix on save maximum retries exceeded.`);
                    break;
                }
                if (result) {
                    // ensure that document versions on the client are in sync
                    if (lastVersion !== document.version) {
                        vscode_1.window.showInformationMessage("TSLint: Auto fix on save, fixes could not be applied (client version mismatch).");
                        break;
                    }
                    retry = false;
                    if (lastVersion !== result.documentVersion) {
                        console.log('TSLint auto fix on save, server document version different than client version');
                        retry = true; // retry to get the fixes matching the document
                    }
                    else {
                        // try to apply the edits from the server
                        let edits = client.protocol2CodeConverter.asTextEdits(result.edits);
                        // disable version check by passing -1 as the version, the event loop is blocked during `willSave`
                        let success = yield applyTextEdits(document.uri.toString(), -1, edits);
                        if (!success) {
                            vscode_1.window.showInformationMessage("TSLint: Auto fix on save, edits could not be applied");
                            break;
                        }
                    }
                    lastVersion = document.version;
                    if (result.overlappingFixes || retry) {
                        // ask for more non overlapping fixes
                        result = yield client.sendRequest(AllFixesRequest.type, { textDocument: { uri: document.uri.toString() }, isOnSave: true });
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            return null;
        }));
        return promise;
    }
    configurationChangedListener = vscode_1.workspace.onDidChangeConfiguration(configurationChanged);
    willSaveTextDocumentListener = vscode_1.workspace.onWillSaveTextDocument(willSaveTextDocument);
    configurationChanged();
    context.subscriptions.push(client.start(), configurationChangedListener, willSaveTextDocumentListener, 
    // internal commands
    vscode_1.commands.registerCommand('_tslint.applySingleFix', applyTextEdits), vscode_1.commands.registerCommand('_tslint.applySameFixes', applyTextEdits), vscode_1.commands.registerCommand('_tslint.applyAllFixes', fixAllProblems), vscode_1.commands.registerCommand('_tslint.applyDisableRule', applyDisableRuleEdit), vscode_1.commands.registerCommand('_tslint.showRuleDocumentation', showRuleDocumentation), 
    // user commands
    vscode_1.commands.registerCommand('tslint.fixAllProblems', fixAllProblems), vscode_1.commands.registerCommand('tslint.createConfig', createDefaultConfiguration), vscode_1.commands.registerCommand('tslint.showOutputChannel', () => { client.outputChannel.show(); }), statusBarItem);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map