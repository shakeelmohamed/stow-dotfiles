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
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
const constants = require("../../constants");
const child_process_1 = require("../child-process");
const common_1 = require("../../common");
function executeXQuery(editor, edit) {
    return __awaiter(this, void 0, void 0, function* () {
        // this disposable will be used for creating status bar messages
        let disposable;
        if (editor.document.languageId !== constants.languageIds.xquery) {
            vscode_1.window.showErrorMessage("This action can only be performed on an XQuery file.");
            return;
        }
        const executable = common_1.Configuration.xqueryExecutionEngine;
        let args = common_1.Configuration.xqueryExecutionArguments || [];
        if (!executable || executable === "") {
            const action = yield vscode_1.window.showWarningMessage("An XQuery execution engine has not been defined.", "Define Now");
            if (action === "Define Now") {
                common_1.NativeCommands.openGlobalSettings();
            }
            return;
        }
        let inputFile;
        disposable = vscode_1.window.setStatusBarMessage("Searching for XML files in folder...");
        const searchPattern = common_1.Configuration.xqueryExecutionInputSearchPattern;
        const inputLimit = common_1.Configuration.xqueryExecutionInputLimit;
        const files = yield vscode_1.workspace.findFiles(searchPattern, "", inputLimit);
        disposable.dispose();
        // user does not have a folder open - prompt for file name
        if (typeof files === "undefined") {
            vscode_1.window.showErrorMessage("You must have a folder opened in VS Code to use this feature.");
            return;
        }
        // if there is only one XML file, default it
        // otherwise, prompt the user to select one from the open folder
        if (files.length > 1) {
            const qpItems = new Array();
            files.forEach((file) => {
                const filename = file.fsPath.replace("\\", "/");
                qpItems.push({
                    label: filename.substring(filename.lastIndexOf("/") + 1),
                    description: file.fsPath,
                    file: file
                });
            });
            const selection = yield vscode_1.window.showQuickPick(qpItems, { placeHolder: "Please select an input file." });
            if (!selection) {
                return;
            }
            inputFile = selection.file;
        }
        else {
            inputFile = files[0];
        }
        // prompt for output file name
        let outputPath = null;
        let outputPathPos = -1;
        for (let i = 0; i < args.length; i++) {
            if (i > 0) {
                if (args[i - 1].search(/out|result/)) {
                    outputPath = args[i];
                    outputPathPos = i;
                }
            }
        }
        if (outputPath) {
            outputPath = yield vscode_1.window.showInputBox({
                placeHolder: "ex. C:\\TEMP\XQueryOutput\\MyOutputFile.xml",
                prompt: "Please specify the output file path. Existing file behavior is determined by the execution engine you have specified.",
                value: outputPath
            });
            args[outputPathPos] = outputPath;
        }
        // call out to the execution engine
        disposable = vscode_1.window.setStatusBarMessage("Executing XQuery Script...");
        args = args.map((value) => {
            return value
                .replace("$(script)", editor.document.uri.fsPath)
                .replace("$(input)", inputFile.fsPath)
                .replace("$(project)", (vscode_1.workspace.workspaceFolders) ? vscode_1.workspace.workspaceFolders[0].uri.fsPath : "");
        });
        try {
            yield child_process_1.ChildProcess.spawn(executable, args);
        }
        catch (error) {
            if (error.message.search(/[Ll]ine:?\s*\d+/gm) > -1) {
                const match = /[Ll]ine:?\s*\d+/gm.exec(error.message);
                const line = (Number.parseInt(match[0].replace(/([Ll]ine:?\s*)|\s/, "")) - 1);
                const selection = yield vscode_1.window.showErrorMessage(error.message, `Go to Line ${line}`);
                if (selection === `Go to Line ${line}`) {
                    editor.revealRange(new vscode_2.Range(line, 0, line, 0));
                }
            }
            else {
                vscode_1.window.showErrorMessage(error.message);
            }
        }
        finally {
            disposable.dispose();
        }
    });
}
exports.executeXQuery = executeXQuery;
//# sourceMappingURL=executeXQuery.js.map