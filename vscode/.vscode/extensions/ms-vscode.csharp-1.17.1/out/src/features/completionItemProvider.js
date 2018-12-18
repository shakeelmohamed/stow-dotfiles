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
const typeConversion_1 = require("../omnisharp/typeConversion");
const vscode_1 = require("vscode");
class OmniSharpCompletionItemProvider extends abstractProvider_1.default {
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let wordToComplete = '';
            let range = document.getWordRangeAtPosition(position);
            if (range) {
                wordToComplete = document.getText(new vscode_1.Range(range.start, position));
            }
            let req = typeConversion_1.createRequest(document, position);
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
                    completion.preselect = response.Preselect;
                    let completionSet = completions[completion.label];
                    if (!completionSet) {
                        completions[completion.label] = { items: [completion], preselect: completion.preselect };
                    }
                    else {
                        completionSet.preselect = completionSet.preselect || completion.preselect;
                        completionSet.items.push(completion);
                    }
                }
                // per suggestion group, select on and indicate overloads
                for (let key in completions) {
                    let suggestion = completions[key].items[0], overloadCount = completions[key].items.length - 1;
                    if (overloadCount === 0) {
                        // remove non overloaded items
                        delete completions[key];
                    }
                    else {
                        // indicate that there is more
                        suggestion.detail = `${suggestion.detail} (+ ${overloadCount} overload(s))`;
                        suggestion.preselect = completions[key].preselect;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbkl0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jb21wbGV0aW9uSXRlbVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtREFBcUQ7QUFDckQseURBQWlEO0FBRWpELGtEQUFrRDtBQUNsRCxnRUFBNEQ7QUFDNUQsbUNBQWdNO0FBRWhNLHFDQUFxRCxTQUFRLDBCQUFlO0lBYTNELHNCQUFzQixDQUFDLFFBQXNCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QixFQUFFLE9BQTBCOztZQUVoSSxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELElBQUksS0FBSyxFQUFFO2dCQUNQLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksY0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUVELElBQUksR0FBRyxHQUFHLDhCQUFhLENBQStCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMxRSxHQUFHLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUNwQyxHQUFHLENBQUMseUNBQXlDLEdBQUcsSUFBSSxDQUFDO1lBQ3JELEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLEdBQUcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSw4QkFBcUIsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDL0QsR0FBRyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUNuRDtZQUVELE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FB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