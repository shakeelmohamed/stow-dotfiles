"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
const serverUtils = require("../omnisharp/utils");
const protocol_1 = require("../omnisharp/protocol");
const CompositeDisposable_1 = require("../CompositeDisposable");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
function trackCurrentVirtualDocuments(server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < vscode_1.workspace.textDocuments.length; i++) {
            let document = vscode_1.workspace.textDocuments[i];
            if (!shouldIgnoreDocument(document, server)) {
                yield openVirtualDocument(document, server, eventStream);
            }
        }
    });
}
function isVirtualCSharpDocument(document) {
    if (document.languageId !== 'csharp') {
        return false;
    }
    if (document.uri.scheme === 'virtualCSharp-') {
        return false;
    }
    if (!document.uri.scheme.startsWith('virtualCSharp-')) {
        return false;
    }
    return true;
}
exports.isVirtualCSharpDocument = isVirtualCSharpDocument;
function trackFutureVirtualDocuments(server, eventStream) {
    let onTextDocumentOpen = vscode_1.workspace.onDidOpenTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
        if (shouldIgnoreDocument(document, server)) {
            return;
        }
        yield openVirtualDocument(document, server, eventStream);
    }));
    let onTextDocumentChange = vscode_1.workspace.onDidChangeTextDocument((changeEvent) => __awaiter(this, void 0, void 0, function* () {
        const document = changeEvent.document;
        if (shouldIgnoreDocument(document, server)) {
            return;
        }
        yield changeVirtualDocument(document, server, eventStream);
    }));
    let onTextDocumentClose = vscode_1.workspace.onDidCloseTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
        if (shouldIgnoreDocument(document, server)) {
            return;
        }
        yield closeVirtualDocument(document, server, eventStream);
    }));
    // We already track text document changes for virtual documents in our change forwarder.
    return new CompositeDisposable_1.default(onTextDocumentOpen, onTextDocumentClose, onTextDocumentChange);
}
function shouldIgnoreDocument(document, server) {
    if (!isVirtualCSharpDocument(document)) {
        // We're only interested in non-physical CSharp documents.
        return true;
    }
    if (!server.isRunning()) {
        return true;
    }
    return false;
}
function openVirtualDocument(document, server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let path = document.uri.fsPath;
        if (!path) {
            path = document.uri.path;
        }
        let req = { FileName: path, changeType: protocol_1.FileChangeType.Create };
        try {
            yield serverUtils.filesChanged(server, [req]);
            // Trigger a change for the opening so we can get content refreshed.
            yield changeVirtualDocument(document, server, eventStream);
        }
        catch (error) {
            logSynchronizationFailure(document.uri, error, server, eventStream);
        }
    });
}
function changeVirtualDocument(document, server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let path = document.uri.fsPath;
        if (!path) {
            path = document.uri.path;
        }
        try {
            yield serverUtils.updateBuffer(server, { Buffer: document.getText(), FileName: document.fileName });
        }
        catch (error) {
            logSynchronizationFailure(document.uri, error, server, eventStream);
        }
    });
}
function closeVirtualDocument(document, server, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        let path = document.uri.fsPath;
        if (!path) {
            path = document.uri.path;
        }
        let req = { FileName: path, changeType: protocol_1.FileChangeType.Delete };
        try {
            yield serverUtils.filesChanged(server, [req]);
        }
        catch (error) {
            logSynchronizationFailure(document.uri, error, server, eventStream);
        }
    });
}
function logSynchronizationFailure(uri, error, server, eventStream) {
    if (server.isRunning()) {
        eventStream.post(new loggingEvents_1.DocumentSynchronizationFailure(uri.path, error));
    }
}
function trackVirtualDocuments(server, eventStream) {
    trackCurrentVirtualDocuments(server, eventStream);
    const disposable = trackFutureVirtualDocuments(server, eventStream);
    return disposable;
}
exports.default = trackVirtualDocuments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbERvY3VtZW50VHJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy92aXJ0dWFsRG9jdW1lbnRUcmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtQ0FBc0Q7QUFFdEQsa0RBQWtEO0FBQ2xELG9EQUF1RDtBQUV2RCxnRUFBeUQ7QUFFekQsOERBQTRFO0FBRTVFLHNDQUE0QyxNQUF1QixFQUFFLFdBQXdCOztRQUN6RixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQVMsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JELElBQUksUUFBUSxHQUFHLGtCQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3pDLE1BQU0sbUJBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzthQUM1RDtTQUNKO0lBQ0wsQ0FBQztDQUFBO0FBRUQsaUNBQXdDLFFBQXNCO0lBQzFELElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUU7UUFDbEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFFRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLGdCQUFnQixFQUFFO1FBQzFDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ25ELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQWRELDBEQWNDO0FBRUQscUNBQXFDLE1BQXVCLEVBQUUsV0FBd0I7SUFDbEYsSUFB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