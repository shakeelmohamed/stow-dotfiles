"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const XQLint = require("xqlint").XQLint;
class XQueryLinter {
    lint(text) {
        const linter = new XQLint(text);
        const diagnostics = new Array();
        linter.getErrors().forEach((error) => {
            diagnostics.push(new vscode_1.Diagnostic(new vscode_1.Range(new vscode_1.Position(error.pos.sl, error.pos.sc), new vscode_1.Position(error.pos.el, error.pos.ec)), error.message, vscode_1.DiagnosticSeverity.Error));
        });
        linter.getWarnings().forEach((warning) => {
            diagnostics.push(new vscode_1.Diagnostic(new vscode_1.Range(new vscode_1.Position(warning.pos.sl, warning.pos.sc), new vscode_1.Position(warning.pos.el, warning.pos.ec)), warning.message, vscode_1.DiagnosticSeverity.Warning));
        });
        return diagnostics;
    }
}
XQueryLinter.SEVERITY_WARNING = 1;
XQueryLinter.SEVERITY_ERROR = 2;
exports.XQueryLinter = XQueryLinter;
//# sourceMappingURL=xquery-linter.js.map