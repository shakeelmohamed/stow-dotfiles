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
const protocol = require("./protocol");
function autoComplete(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.AutoComplete, request);
    });
}
exports.autoComplete = autoComplete;
function codeCheck(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.CodeCheck, request, token);
    });
}
exports.codeCheck = codeCheck;
function currentFileMembersAsTree(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.CurrentFileMembersAsTree, request, token);
    });
}
exports.currentFileMembersAsTree = currentFileMembersAsTree;
function filesChanged(server, requests) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FilesChanged, requests);
    });
}
exports.filesChanged = filesChanged;
function findImplementations(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FindImplementations, request);
    });
}
exports.findImplementations = findImplementations;
function findSymbols(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FindSymbols, request, token);
    });
}
exports.findSymbols = findSymbols;
function findUsages(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FindUsages, request, token);
    });
}
exports.findUsages = findUsages;
function formatAfterKeystroke(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FormatAfterKeystroke, request, token);
    });
}
exports.formatAfterKeystroke = formatAfterKeystroke;
function formatRange(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.FormatRange, request, token);
    });
}
exports.formatRange = formatRange;
function getCodeActions(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.GetCodeActions, request, token);
    });
}
exports.getCodeActions = getCodeActions;
function goToDefinition(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.GoToDefinition, request);
    });
}
exports.goToDefinition = goToDefinition;
function rename(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Rename, request, token);
    });
}
exports.rename = rename;
function requestProjectInformation(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Project, request);
    });
}
exports.requestProjectInformation = requestProjectInformation;
function requestWorkspaceInformation(server) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Projects);
    });
}
exports.requestWorkspaceInformation = requestWorkspaceInformation;
function runCodeAction(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunCodeAction, request);
    });
}
exports.runCodeAction = runCodeAction;
function signatureHelp(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.SignatureHelp, request, token);
    });
}
exports.signatureHelp = signatureHelp;
function typeLookup(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.TypeLookup, request, token);
    });
}
exports.typeLookup = typeLookup;
function updateBuffer(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.UpdateBuffer, request);
    });
}
exports.updateBuffer = updateBuffer;
function getMetadata(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.Requests.Metadata, request);
    });
}
exports.getMetadata = getMetadata;
function getTestStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.GetTestStartInfo, request);
    });
}
exports.getTestStartInfo = getTestStartInfo;
function runTest(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunTest, request);
    });
}
exports.runTest = runTest;
function runTestsInClass(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.RunAllTestsInClass, request);
    });
}
exports.runTestsInClass = runTestsInClass;
function debugTestGetStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestGetStartInfo, request);
    });
}
exports.debugTestGetStartInfo = debugTestGetStartInfo;
function debugTestClassGetStartInfo(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestsInClassGetStartInfo, request);
    });
}
exports.debugTestClassGetStartInfo = debugTestClassGetStartInfo;
function debugTestLaunch(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestLaunch, request);
    });
}
exports.debugTestLaunch = debugTestLaunch;
function debugTestStop(server, request) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.DebugTestStop, request);
    });
}
exports.debugTestStop = debugTestStop;
function isNetCoreProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netcoreapp') || tf.ShortName.startsWith('netstandard')) !== undefined;
    });
}
exports.isNetCoreProject = isNetCoreProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUdoRyx1Q0FBdUM7QUFHdkMsc0JBQW1DLE1BQXVCLEVBQUUsT0FBcUM7O1FBQzdGLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBa0MsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEcsQ0FBQztDQUFBO0FBRkQsb0NBRUM7QUFFRCxtQkFBZ0MsTUFBdUIsRUFBRSxPQUF5QixFQUFFLEtBQStCOztRQUMvRyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQTRCLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RyxDQUFDO0NBQUE7QUFGRCw4QkFFQztBQUVELGtDQUErQyxNQUF1QixFQUFFLE9BQXlCLEVBQUUsS0FBK0I7O1FBQzlILE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBNEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckksQ0FBQztDQUFBO0FBRkQsNERBRUM7QUFFRCxzQkFBbUMsTUFBdUIsRUFBRSxRQUE0Qjs7UUFDcEYsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlFLENBQUM7Q0FBQTtBQUZELG9DQUVDO0FBRUQsNkJBQTBDLE1BQXVCLEVBQUUsT0FBNEMsRUFBRSxLQUErQjs7UUFDNUksT0FBTyxNQUFNLENBQUMsV0FBVyxDQUE0QixRQUFRLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pHLENBQUM7Q0FBQTtBQUZELGtEQUVDO0FBRUQscUJBQWtDLE1BQXVCLEVB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