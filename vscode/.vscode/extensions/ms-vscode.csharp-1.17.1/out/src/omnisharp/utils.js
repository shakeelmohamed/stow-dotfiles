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
function blockStructure(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.BlockStructure, request, token);
    });
}
exports.blockStructure = blockStructure;
function codeStructure(server, request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return server.makeRequest(protocol.V2.Requests.CodeStructure, request, token);
    });
}
exports.codeStructure = codeStructure;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUdoRyx1Q0FBdUM7QUFHdkMsc0JBQW1DLE1BQXVCLEVBQUUsT0FBcUM7O1FBQzdGLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBa0MsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEcsQ0FBQztDQUFBO0FBRkQsb0NBRUM7QUFFRCxtQkFBZ0MsTUFBdUIsRUFBRSxPQUF5QixFQUFFLEtBQStCOztRQUMvRyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQTRCLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RyxDQUFDO0NBQUE7QUFGRCw4QkFFQztBQUVELHdCQUFxQyxNQUF1QixFQUFFLE9BQTBDLEVBQUUsS0FBK0I7O1FBQ3JJLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBcUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2SCxDQUFDO0NBQUE7QUFGRCx3Q0FFQztBQUVELHVCQUFvQyxNQUF1QixFQUFFLE9BQW1ELEVBQUUsS0FBK0I7O1FBQzdJLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBOEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvSCxDQUFDO0NBQUE7QUFGRCxzQ0FFQztBQUVELHNCQUFtQyxNQUF1QixFQUFFLFFBQTRCOztRQUNwRixPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUUsQ0FBQztDQUFBO0FBRkQsb0NBRUM7QUFFRCw2QkFBMEMsTUFBdUIsRUFBRSxPQUE0QyxFQUFFLEtBQStCOztRQUM1SSxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQTRCLFFBQVEsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekcsQ0FBQztDQUFBO0FBRkQsa0RBRUM7QUFFRCxxQkFBa0MsTUFBdUIsRUFBRSxPQUFvQyxFQUFFLEtBQStCOztRQUM1SCxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQStCLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzRyxDQUFDO0NBQUE7QUFGRCxrQ0FFQztBQUVELG9CQUFpQyxNQUF1QixFQUFFLE9BQW1DLEVBQUUsS0FBK0I7O1FBQzFILE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBNEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7Q0FBQTtBQUZELGdDQUVDO0FBRUQsOEJBQTJDLE1BQXVCLEVBQUUsT0FBNkMsRUFBRSxLQUErQjs7UUFDOUksT0FBTyxNQUFNLENBQUMsV0FBVyxDQUErQixRQUFRLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwSCxDQUFDO0NBQUE7QUFGRCxvREFFQztBQUVELHFCQUFrQyxNQUF1QixFQUFFLE9BQW9DLEVBQUUsS0FBK0I7O1FBQzVILE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBK0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNHLENBQUM7Q0FBQTtBQUZELGtDQUVDO0FBRUQsd0JBQXFDLE1BQXVCLEVBQUUsT0FBMEMsRUFBRSxLQUErQjs7UUFDckksT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFxQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZILENBQUM7Q0FBQTtBQUZELHdDQUVDO0FBRUQsd0JBQXFDLE1BQXVCLEVBQUUsT0FBdUMsRUFBRSxLQUErQjs7UUFDbEksT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFrQyxRQUFRLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMxRyxDQUFDO0NBQUE7QUFGRCx3Q0FFQztBQUVELGdCQUE2QixNQUF1QixFQUFFLE9BQStCLEVBQUUsS0FBK0I7O1FBQ2xILE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBMEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pHLENBQUM7Q0FBQTtBQUZELHdCQUVDO0FBRUQsbUNBQWdELE1BQXVCLEVBQUUsT0FBeUI7O1FBQzlGLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBc0MsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkcsQ0FBQztDQUFBO0FBRkQsOERBRUM7QUFFRCxxQ0FBa0QsTUFBdUI7O1FBQ3JFLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBd0MsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqRyxDQUFDO0NBQUE7QUFGRCxrRUFFQztBQUVELHVCQUFvQyxNQUF1QixFQUFFLE9BQXlDOztRQUNsRyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQW9DLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RyxDQUFDO0NBQUE7QUFGRCxzQ0FFQztBQUVELHVCQUFvQyxNQUF1QixFQUFFLE9BQXlCLEVBQUUsS0FBK0I7O1FBQ25ILE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBeUIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7Q0FBQTtBQUZELHNDQUVDO0FBRUQsb0JBQWlDLE1BQXVCLEVBQUUsT0FBbUMsRUFBRSxLQUErQjs7UUFDMUgsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUE4QixRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekcsQ0FBQztDQUFBO0FBRkQsZ0NBRUM7QUFFRCxzQkFBbUMsTUFBdUIsRUFBRSxPQUFxQzs7UUFDN0YsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFVLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hGLENBQUM7Q0FBQTtBQUZELG9DQUVDO0FBRUQscUJBQWtDLE1BQXVCLEVBQUUsT0FBaUM7O1FBQ3hGLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBNEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUYsQ0FBQztDQUFBO0FBRkQsa0NBRUM7QUFFRCwwQkFBdUMsTUFBdUIsRUFBRSxPQUE0Qzs7UUFDeEcsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUF1QyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwSCxDQUFDO0NBQUE7QUFGRCw0Q0FFQztBQUVELGlCQUE4QixNQUF1QixFQUFFLE9BQW1DOztRQUN0RixPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQThCLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRyxDQUFDO0NBQUE7QUFGRCwwQkFFQztBQUVELHlCQUFzQyxNQUF1QixFQUFFLE9BQTJDOztRQUN0RyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQThCLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdHLENBQUM7Q0FBQTtBQUZELDBDQUVDO0FBRUQsK0JBQTRDLE1BQXVCLEVBQUUsT0FBaUQ7O1FBQ2xILE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBNEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUgsQ0FBQztDQUFBO0FBRkQsc0RBRUM7QUFFRCxvQ0FBaUQsTUFBdUIsRUFBRSxPQUFzRDs7UUFDNUgsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUE0QyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0SSxDQUFDO0NBQUE7QUFGRCxnRUFFQztBQUVELHlCQUFzQyxNQUF1QixFQUFFLE9BQTJDOztRQUN0RyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQXNDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsSCxDQUFDO0NBQUE7QUFGRCwwQ0FFQztBQUVELHVCQUFvQyxNQUF1QixFQUFFLE9BQXlDOztRQUNsRyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQW9DLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RyxDQUFDO0NBQUE7QUFGRCxzQ0FFQztBQUVELDBCQUF1QyxPQUFnQzs7UUFDbkUsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUM7SUFDOUksQ0FBQztDQUFBO0FBRkQsNENBRUMifQ==