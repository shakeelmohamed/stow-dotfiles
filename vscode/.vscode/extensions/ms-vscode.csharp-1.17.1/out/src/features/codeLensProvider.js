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
const protocol = require("../omnisharp/protocol");
const serverUtils = require("../omnisharp/utils");
const vscode = require("vscode");
const typeConversion_1 = require("../omnisharp/typeConversion");
const abstractProvider_1 = require("./abstractProvider");
var Structure = protocol.V2.Structure;
var SymbolKinds = protocol.V2.SymbolKinds;
var SymbolPropertyNames = protocol.V2.SymbolPropertyNames;
var SymbolRangeNames = protocol.V2.SymbolRangeNames;
class OmniSharpCodeLens extends vscode.CodeLens {
    constructor(range, fileName) {
        super(new vscode.Range(range.Start.Line - 1, range.Start.Column - 1, range.End.Line - 1, range.End.Column - 1));
        this.fileName = fileName;
    }
}
class ReferencesCodeLens extends OmniSharpCodeLens {
    constructor(range, fileName) {
        super(range, fileName);
    }
}
class TestCodeLens extends OmniSharpCodeLens {
    constructor(range, fileName, displayName, isTestContainer, testFramework, testMethodNames) {
        super(range, fileName);
        this.displayName = displayName;
        this.isTestContainer = isTestContainer;
        this.testFramework = testFramework;
        this.testMethodNames = testMethodNames;
    }
}
class RunTestsCodeLens extends TestCodeLens {
    constructor(range, fileName, displayName, isTestContainer, testFramework, testMethodNames) {
        super(range, fileName, displayName, isTestContainer, testFramework, testMethodNames);
    }
}
class DebugTestsCodeLens extends TestCodeLens {
    constructor(range, fileName, displayName, isTestContainer, testFramework, testMethodNames) {
        super(range, fileName, displayName, isTestContainer, testFramework, testMethodNames);
    }
}
class OmniSharpCodeLensProvider extends abstractProvider_1.default {
    constructor(server, testManager, optionProvider) {
        super(server);
        this.optionProvider = optionProvider;
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.optionProvider.GetLatestOptions();
            if (!options.showReferencesCodeLens && !options.showTestsCodeLens) {
                return [];
            }
            const response = yield serverUtils.codeStructure(this._server, { FileName: document.fileName }, token);
            if (response && response.Elements) {
                return createCodeLenses(response.Elements, document.fileName, options);
            }
            return [];
        });
    }
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (codeLens instanceof ReferencesCodeLens) {
                return this.resolveReferencesCodeLens(codeLens, token);
            }
            else if (codeLens instanceof RunTestsCodeLens) {
                return this.resolveTestCodeLens(codeLens, 'Run Test', 'dotnet.test.run', 'Run All Tests', 'dotnet.classTests.run');
            }
            else if (codeLens instanceof DebugTestsCodeLens) {
                return this.resolveTestCodeLens(codeLens, 'Debug Test', 'dotnet.test.debug', 'Debug All Tests', 'dotnet.classTests.debug');
            }
        });
    }
    resolveReferencesCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                FileName: codeLens.fileName,
                Line: codeLens.range.start.line + 1,
                Column: codeLens.range.start.character + 1,
                OnlyThisFile: false,
                ExcludeDefinition: true
            };
            const result = yield serverUtils.findUsages(this._server, request, token);
            if (!result || !result.QuickFixes) {
                return;
            }
            const quickFixes = result.QuickFixes;
            const count = quickFixes.length;
            codeLens.command = {
                title: count === 1 ? '1 reference' : `${count} references`,
                command: 'editor.action.showReferences',
                arguments: [vscode.Uri.file(request.FileName), codeLens.range.start, quickFixes.map(typeConversion_1.toLocation)]
            };
            return codeLens;
        });
    }
    resolveTestCodeLens(codeLens, singularTitle, singularCommandName, pluralTitle, pluralCommandName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!codeLens.isTestContainer) {
                // This is just a single test method, not a container.
                codeLens.command = {
                    title: singularTitle,
                    command: singularCommandName,
                    arguments: [codeLens.testMethodNames[0], codeLens.fileName, codeLens.testFramework]
                };
                return codeLens;
            }
            const projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: codeLens.fileName });
            // We do not support running all tests on legacy projects.
            if (projectInfo.MsBuildProject && !projectInfo.DotNetProject) {
                codeLens.command = {
                    title: pluralTitle,
                    command: pluralCommandName,
                    arguments: [codeLens.displayName, codeLens.testMethodNames, codeLens.fileName, codeLens.testFramework]
                };
            }
            return codeLens;
        });
    }
}
exports.default = OmniSharpCodeLensProvider;
function createCodeLenses(elements, fileName, options) {
    let results = [];
    Structure.walkCodeElements(elements, element => {
        let codeLenses = createCodeLensesForElement(element, fileName, options);
        results.push(...codeLenses);
    });
    return results;
}
function createCodeLensesForElement(element, fileName, options) {
    let results = [];
    if (options.showReferencesCodeLens && isValidElementForReferencesCodeLens(element)) {
        let range = element.Ranges[SymbolRangeNames.Name];
        if (range) {
            results.push(new ReferencesCodeLens(range, fileName));
        }
    }
    if (options.showTestsCodeLens) {
        if (isValidMethodForTestCodeLens(element)) {
            let [testFramework, testMethodName] = getTestFrameworkAndMethodName(element);
            let range = element.Ranges[SymbolRangeNames.Name];
            if (range && testFramework && testMethodName) {
                results.push(new RunTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ false, testFramework, [testMethodName]));
                results.push(new DebugTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ false, testFramework, [testMethodName]));
            }
        }
        else if (isValidClassForTestCodeLens(element)) {
            // Note: We don't handle multiple test frameworks in the same class. The first test framework wins.
            let testFramework = null;
            let testMethodNames = [];
            let range = element.Ranges[SymbolRangeNames.Name];
            for (let childElement of element.Children) {
                let [childTestFramework, childTestMethodName] = getTestFrameworkAndMethodName(childElement);
                if (!testFramework && childTestFramework) {
                    testFramework = childTestFramework;
                    testMethodNames.push(childTestMethodName);
                }
                else if (testFramework && childTestFramework === testFramework) {
                    testMethodNames.push(childTestMethodName);
                }
            }
            results.push(new RunTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ true, testFramework, testMethodNames));
            results.push(new DebugTestsCodeLens(range, fileName, element.DisplayName, /*isTestContainer*/ true, testFramework, testMethodNames));
        }
    }
    return results;
}
const filteredSymbolNames = {
    'Equals': true,
    'Finalize': true,
    'GetHashCode': true,
    'ToString': true
};
function isValidElementForReferencesCodeLens(element) {
    if (element.Kind === SymbolKinds.Namespace) {
        return false;
    }
    if (element.Kind === SymbolKinds.Method && filteredSymbolNames[element.Name]) {
        return false;
    }
    return true;
}
function isValidClassForTestCodeLens(element) {
    if (element.Kind != SymbolKinds.Class) {
        return false;
    }
    if (!element.Children) {
        return false;
    }
    return element.Children.find(isValidMethodForTestCodeLens) !== undefined;
}
function isValidMethodForTestCodeLens(element) {
    if (element.Kind != SymbolKinds.Method) {
        return false;
    }
    if (!element.Properties ||
        !element.Properties[SymbolPropertyNames.TestFramework] ||
        !element.Properties[SymbolPropertyNames.TestMethodName]) {
        return false;
    }
    return true;
}
function getTestFrameworkAndMethodName(element) {
    if (!element.Properties) {
        return [null, null];
    }
    const testFramework = element.Properties[SymbolPropertyNames.TestFramework];
    const testMethodName = element.Properties[SymbolPropertyNames.TestMethodName];
    return [testFramework, testMethodName];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUxlbnNQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jb2RlTGVuc1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxrREFBa0Q7QUFDbEQsa0RBQWtEO0FBQ2xELGlDQUFpQztBQUNqQyxnRUFBeUQ7QUFDekQseURBQWtEO0FBTWxELElBQU8sU0FBUyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDO0FBQ3pDLElBQU8sV0FBVyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzdDLElBQU8sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztBQUM3RCxJQUFPLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7QUFFdkQsdUJBQWlDLFNBQVEsTUFBTSxDQUFDLFFBQVE7SUFDcEQsWUFDSSxLQUF3QixFQUNqQixRQUFnQjtRQUV2QixLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUNsQixLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQ3pGLENBQUMsQ0FBQztRQUpJLGFBQVEsR0FBUixRQUFRLENBQVE7SUFLM0IsQ0FBQztDQUNKO0FBRUQsd0JBQXlCLFNBQVEsaUJBQWlCO0lBQzlDLFlBQ0ksS0FBd0IsRUFDeEIsUUFBZ0I7UUFDaEIsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUFFRCxrQkFBNEIsU0FBUSxpQkFBaUI7SUFDakQsWUFDSSxL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