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
const documentation_1 = require("./documentation");
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const vscode_1 = require("vscode");
class OmniSharpCompletionItemProvider extends abstractProvider_1.default {
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let wordToComplete = '';
            let range = document.getWordRangeAtPosition(position);
            if (range) {
                wordToComplete = document.getText(new vscode_1.Range(range.start, position));
            }
            let req = typeConvertion_1.createRequest(document, position);
            req.WordToComplete = wordToComplete;
            req.WantDocumentationForEveryCompletionResult = true;
            req.WantKind = true;
            req.WantReturnType = true;
            if (context.triggerKind == vscode_1.CompletionTriggerKind.TriggerCharacter) {
                req.TriggerCharacter = context.triggerCharacter;
            }
            return serverUtils.autoComplete(this._server, req).then(responses => {
                if (!responses) {
                    return;
                }
                let result = [];
                let completions = Object.create(null);
                // transform AutoCompleteResponse to CompletionItem and
                // group by code snippet
                for (let response of responses) {
                    let completion = new vscode_1.CompletionItem(response.CompletionText);
                    completion.detail = response.ReturnType
                        ? `${response.ReturnType} ${response.DisplayText}`
                        : response.DisplayText;
                    completion.documentation = documentation_1.extractSummaryText(response.Description);
                    completion.kind = _kinds[response.Kind] || vscode_1.CompletionItemKind.Property;
                    completion.insertText = response.CompletionText.replace(/<>/g, '');
                    completion.commitCharacters = response.IsSuggestionMode
                        ? OmniSharpCompletionItemProvider.CommitCharactersWithoutSpace
                        : OmniSharpCompletionItemProvider.AllCommitCharacters;
                    let array = completions[completion.label];
                    if (!array) {
                        completions[completion.label] = [completion];
                    }
                    else {
                        array.push(completion);
                    }
                }
                // per suggestion group, select on and indicate overloads
                for (let key in completions) {
                    let suggestion = completions[key][0], overloadCount = completions[key].length - 1;
                    if (overloadCount === 0) {
                        // remove non overloaded items
                        delete completions[key];
                    }
                    else {
                        // indicate that there is more
                        suggestion.detail = `${suggestion.detail} (+ ${overloadCount} overload(s))`;
                    }
                    result.push(suggestion);
                }
                // for short completions (up to 1 character), treat the list as incomplete
                // because the server has likely witheld some matches due to performance constraints
                return new vscode_1.CompletionList(result, wordToComplete.length > 1 ? false : true);
            });
        });
    }
}
// copied from Roslyn here: https://github.com/dotnet/roslyn/blob/6e8f6d600b6c4bc0b92bc3d782a9e0b07e1c9f8e/src/Features/Core/Portable/Completion/CompletionRules.cs#L166-L169
OmniSharpCompletionItemProvider.AllCommitCharacters = [
    ' ', '{', '}', '[', ']', '(', ')', '.', ',', ':',
    ';', '+', '-', '*', '/', '%', '&', '|', '^', '!',
    '~', '=', '<', '>', '?', '@', '#', '\'', '\"', '\\'
];
OmniSharpCompletionItemProvider.CommitCharactersWithoutSpace = [
    '{', '}', '[', ']', '(', ')', '.', ',', ':',
    ';', '+', '-', '*', '/', '%', '&', '|', '^', '!',
    '~', '=', '<', '>', '?', '@', '#', '\'', '\"', '\\'
];
exports.default = OmniSharpCompletionItemProvider;
const _kinds = Object.create(null);
// types
_kinds['Class'] = vscode_1.CompletionItemKind.Class;
_kinds['Delegate'] = vscode_1.CompletionItemKind.Class; // need a better option for this.
_kinds['Enum'] = vscode_1.CompletionItemKind.Enum;
_kinds['Interface'] = vscode_1.CompletionItemKind.Interface;
_kinds['Struct'] = vscode_1.CompletionItemKind.Struct;
// variables
_kinds['Local'] = vscode_1.CompletionItemKind.Variable;
_kinds['Parameter'] = vscode_1.CompletionItemKind.Variable;
_kinds['RangeVariable'] = vscode_1.CompletionItemKind.Variable;
// members
_kinds['Const'] = vscode_1.CompletionItemKind.Constant;
_kinds['EnumMember'] = vscode_1.CompletionItemKind.EnumMember;
_kinds['Event'] = vscode_1.CompletionItemKind.Event;
_kinds['Field'] = vscode_1.CompletionItemKind.Field;
_kinds['Method'] = vscode_1.CompletionItemKind.Method;
_kinds['Property'] = vscode_1.CompletionItemKind.Property;
// other stuff
_kinds['Label'] = vscode_1.CompletionItemKind.Unit; // need a better option for this.
_kinds['Keyword'] = vscode_1.CompletionItemKind.Keyword;
_kinds['Namespace'] = vscode_1.CompletionItemKind.Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbkl0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jb21wbGV0aW9uSXRlbVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtREFBbUQ7QUFDbkQseURBQWlEO0FBRWpELGtEQUFrRDtBQUNsRCxnRUFBMEQ7QUFDMUQsbUNBQThMO0FBRTlMLHFDQUFxRCxTQUFRLDBCQUFlO0lBYTNELHNCQUFzQixDQUFDLFFBQXNCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QixFQUFFLE9BQTBCOztZQUVoSSxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELElBQUksS0FBSyxFQUFFO2dCQUNQLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksY0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUVELElBQUksR0FBRyxHQUFHLDhCQUFhLENBQStCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMxRSxHQUFHLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUNwQyxHQUFHLENBQUMseUNBQXlDLEdBQUcsSUFBSSxDQUFDO1lBQ3JELEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLEdBQUcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSw4QkFBcUIsQ0FBQyxnQkFBZ0IsRUFDakU7Z0JBQ0ksR0FBRyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUNuRDtZQUVELE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FB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