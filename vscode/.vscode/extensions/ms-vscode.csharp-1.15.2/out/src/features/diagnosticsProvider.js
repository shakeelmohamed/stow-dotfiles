"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const vscode = require("vscode");
const CompositeDisposable_1 = require("../CompositeDisposable");
class Advisor {
    constructor(server) {
        this._packageRestoreCounter = 0;
        this._projectSourceFileCounts = Object.create(null);
        this._server = server;
        let d1 = server.onProjectChange(this._onProjectChange, this);
        let d2 = server.onProjectAdded(this._onProjectAdded, this);
        let d3 = server.onProjectRemoved(this._onProjectRemoved, this);
        let d4 = server.onBeforePackageRestore(this._onBeforePackageRestore, this);
        let d5 = server.onPackageRestore(this._onPackageRestore, this);
        this._disposable = new CompositeDisposable_1.default(d1, d2, d3, d4, d5);
    }
    dispose() {
        this._disposable.dispose();
    }
    shouldValidateFiles() {
        return this._isServerStarted()
            && !this._isRestoringPackages();
    }
    shouldValidateProject() {
        return this._isServerStarted()
            && !this._isRestoringPackages()
            && !this._isHugeProject();
    }
    _updateProjectFileCount(path, fileCount) {
        this._projectSourceFileCounts[path] = fileCount;
    }
    _addOrUpdateProjectFileCount(info) {
        if (info.DotNetProject && info.DotNetProject.SourceFiles) {
            this._updateProjectFileCount(info.DotNetProject.Path, info.DotNetProject.SourceFiles.length);
        }
        if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
            this._updateProjectFileCount(info.MsBuildProject.Path, info.MsBuildProject.SourceFiles.length);
        }
    }
    _removeProjectFileCount(info) {
        if (info.DotNetProject && info.DotNetProject.SourceFiles) {
            delete this._projectSourceFileCounts[info.DotNetProject.Path];
        }
        if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
            delete this._projectSourceFileCounts[info.MsBuildProject.Path];
        }
    }
    _onProjectAdded(info) {
        this._addOrUpdateProjectFileCount(info);
    }
    _onProjectRemoved(info) {
        this._removeProjectFileCount(info);
    }
    _onProjectChange(info) {
        this._addOrUpdateProjectFileCount(info);
    }
    _onBeforePackageRestore() {
        this._packageRestoreCounter += 1;
    }
    _onPackageRestore() {
        this._packageRestoreCounter -= 1;
    }
    _isRestoringPackages() {
        return this._packageRestoreCounter > 0;
    }
    _isServerStarted() {
        return this._server.isRunning();
    }
    _isHugeProject() {
        let sourceFileCount = 0;
        for (let key in this._projectSourceFileCounts) {
            sourceFileCount += this._projectSourceFileCounts[key];
            if (sourceFileCount > 1000) {
                return true;
            }
        }
        return false;
    }
}
exports.Advisor = Advisor;
function reportDiagnostics(server, advisor) {
    return new DiagnosticsProvider(server, advisor);
}
exports.default = reportDiagnostics;
class DiagnosticsProvider extends abstractProvider_1.default {
    constructor(server, validationAdvisor) {
        super(server);
        this._documentValidations = Object.create(null);
        this.dispose = () => {
            if (this._projectValidation) {
                this._projectValidation.dispose();
            }
            for (let key in this._documentValidations) {
                this._documentValidations[key].dispose();
            }
            this._disposable.dispose();
        };
        this._validationAdvisor = validationAdvisor;
        this._diagnostics = vscode.languages.createDiagnosticCollection('csharp');
        let d1 = this._server.onPackageRestore(this._validateProject, this);
        let d2 = this._server.onProjectChange(this._validateProject, this);
        let d4 = vscode.workspace.onDidOpenTextDocument(event => this._onDocumentAddOrChange(event), this);
        let d3 = vscode.workspace.onDidChangeTextDocument(event => this._onDocumentAddOrChange(event.document), this);
        let d5 = vscode.workspace.onDidCloseTextDocument(this._onDocumentRemove, this);
        this._disposable = new CompositeDisposable_1.default(this._diagnostics, d1, d2, d3, d4, d5);
        // Go ahead and check for diagnostics in the currently visible editors.
        for (let editor of vscode.window.visibleTextEditors) {
            let document = editor.document;
            if (document.languageId === 'csharp' && document.uri.scheme === 'file') {
                this._validateDocument(document);
            }
        }
    }
    _onDocumentAddOrChange(document) {
        if (document.languageId === 'csharp' && document.uri.scheme === 'file') {
            this._validateDocument(document);
            this._validateProject();
        }
    }
    _onDocumentRemove(document) {
        let key = document.uri;
        let didChange = false;
        if (this._diagnostics.get(key)) {
            didChange = true;
            this._diagnostics.delete(key);
        }
        let keyString = key.toString();
        if (this._documentValidations[keyString]) {
            didChange = true;
            this._documentValidations[keyString].cancel();
            delete this._documentValidations[keyString];
        }
        if (didChange) {
            this._validateProject();
        }
    }
    _validateDocument(document) {
        // If we've already started computing for this document, cancel that work.
        let key = document.uri.toString();
        if (this._documentValidations[key]) {
            this._documentValidations[key].cancel();
        }
        if (!this._validationAdvisor.shouldValidateFiles()) {
            return;
        }
        let source = new vscode.CancellationTokenSource();
        let handle = setTimeout(() => {
            serverUtils.codeCheck(this._server, { FileName: document.fileName }, source.token).then(value => {
                let quickFixes = value.QuickFixes.filter(DiagnosticsProvider._shouldInclude);
                // Easy case: If there are no diagnostics in the file, we can clear it quickly.
                if (quickFixes.length === 0) {
                    if (this._diagnostics.has(document.uri)) {
                        this._diagnostics.delete(document.uri);
                    }
                    return;
                }
                // (re)set new diagnostics for this document
                let diagnostics = quickFixes.map(DiagnosticsProvider._asDiagnostic);
                this._diagnostics.set(document.uri, diagnostics);
            });
        }, 750);
        source.token.onCancellationRequested(() => clearTimeout(handle));
        this._documentValidations[key] = source;
    }
    _validateProject() {
        // If we've already started computing for this project, cancel that work.
        if (this._projectValidation) {
            this._projectValidation.cancel();
        }
        if (!this._validationAdvisor.shouldValidateProject()) {
            return;
        }
        this._projectValidation = new vscode.CancellationTokenSource();
        let handle = setTimeout(() => {
            serverUtils.codeCheck(this._server, { FileName: null }, this._projectValidation.token).then(value => {
                let quickFixes = value.QuickFixes
                    .filter(DiagnosticsProvider._shouldInclude)
                    .sort((a, b) => a.FileName.localeCompare(b.FileName));
                let entries = [];
                let lastEntry;
                for (let quickFix of quickFixes) {
                    let diag = DiagnosticsProvider._asDiagnostic(quickFix);
                    let uri = vscode.Uri.file(quickFix.FileName);
                    if (lastEntry && lastEntry[0].toString() === uri.toString()) {
                        lastEntry[1].push(diag);
                    }
                    else {
                        // We're replacing all diagnostics in this file. Pushing an entry with undefined for
                        // the diagnostics first ensures that the previous diagnostics for this file are
                        // cleared. Otherwise, new entries will be merged with the old ones.
                        entries.push([uri, undefined]);
                        lastEntry = [uri, [diag]];
                        entries.push(lastEntry);
                    }
                }
                // Clear diagnostics for files that no longer have any diagnostics.
                this._diagnostics.forEach((uri, diagnostics) => {
                    if (!entries.find(tuple => tuple[0].toString() === uri.toString())) {
                        this._diagnostics.delete(uri);
                    }
                });
                // replace all entries
                this._diagnostics.set(entries);
            });
        }, 3000);
        // clear timeout on cancellation
        this._projectValidation.token.onCancellationRequested(() => {
            clearTimeout(handle);
        });
    }
    static _shouldInclude(quickFix) {
        const config = vscode.workspace.getConfiguration('csharp');
        if (config.get('suppressHiddenDiagnostics', true)) {
            return quickFix.LogLevel.toLowerCase() !== 'hidden';
        }
        else {
            return true;
        }
    }
    // --- data converter
    static _asDiagnostic(quickFix) {
        let severity = DiagnosticsProvider._asDiagnosticSeverity(quickFix.LogLevel);
        let message = `${quickFix.Text} [${quickFix.Projects.map(n => DiagnosticsProvider._asProjectLabel(n)).join(', ')}]`;
        return new vscode.Diagnostic(typeConvertion_1.toRange(quickFix), message, severity);
    }
    static _asDiagnosticSeverity(logLevel) {
        switch (logLevel.toLowerCase()) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            // info and hidden
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
    static _asProjectLabel(projectName) {
        const idx = projectName.indexOf('+');
        return projectName.substr(idx + 1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kaWFnbm9zdGljc1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcseURBQWlEO0FBRWpELGtEQUFrRDtBQUNsRCxnRUFBc0Q7QUFDdEQsaUNBQWlDO0FBQ2pDLGdFQUF5RDtBQUd6RDtJQU9JLFlBQVksTUFBdUI7UUFIM0IsMkJBQXNCLEdBQVcsQ0FBQyxDQUFDO1FBQ25DLDZCQUF3QixHQUErQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRy9FLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXRCLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdELElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9ELElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0UsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksNkJBQW1CLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFTSxPQUFPO1FBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FB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