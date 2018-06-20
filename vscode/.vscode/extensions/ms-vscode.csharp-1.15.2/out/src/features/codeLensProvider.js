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
const serverUtils = require("../omnisharp/utils");
const vscode = require("vscode");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const abstractProvider_1 = require("./abstractProvider");
const options_1 = require("../omnisharp/options");
const CompositeDisposable_1 = require("../CompositeDisposable");
class OmniSharpCodeLens extends vscode.CodeLens {
    constructor(fileName, range) {
        super(range);
        this.fileName = fileName;
    }
}
class OmniSharpCodeLensProvider extends abstractProvider_1.default {
    constructor(server, testManager) {
        super(server);
        this._resetCachedOptions();
        let configChangedDisposable = vscode.workspace.onDidChangeConfiguration(this._resetCachedOptions, this);
        this.addDisposables(new CompositeDisposable_1.default(configChangedDisposable));
    }
    _resetCachedOptions() {
        this._options = options_1.Options.Read(vscode);
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._options.showReferencesCodeLens && !this._options.showTestsCodeLens) {
                return [];
            }
            let tree = yield serverUtils.currentFileMembersAsTree(this._server, { FileName: document.fileName }, token);
            let ret = [];
            for (let node of tree.TopLevelTypeDefinitions) {
                yield this._convertQuickFix(ret, document.fileName, node);
            }
            return ret;
        });
    }
    _convertQuickFix(bucket, fileName, node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (node.Kind === 'MethodDeclaration' && OmniSharpCodeLensProvider.filteredSymbolNames[node.Location.Text]) {
                return;
            }
            let lens = new OmniSharpCodeLens(fileName, typeConvertion_1.toRange(node.Location));
            if (this._options.showReferencesCodeLens) {
                bucket.push(lens);
            }
            for (let child of node.ChildNodes) {
                this._convertQuickFix(bucket, fileName, child);
            }
            if (this._options.showTestsCodeLens) {
                yield this._updateCodeLensForTest(bucket, fileName, node);
            }
        });
    }
    resolveCodeLens(codeLens, token) {
        if (codeLens instanceof OmniSharpCodeLens) {
            let req = {
                FileName: codeLens.fileName,
                Line: codeLens.range.start.line + 1,
                Column: codeLens.range.start.character + 1,
                OnlyThisFile: false,
                ExcludeDefinition: true
            };
            return serverUtils.findUsages(this._server, req, token).then(res => {
                if (!res || !Array.isArray(res.QuickFixes)) {
                    return;
                }
                let len = res.QuickFixes.length;
                codeLens.command = {
                    title: len === 1 ? '1 reference' : `${len} references`,
                    command: 'editor.action.showReferences',
                    arguments: [vscode.Uri.file(req.FileName), codeLens.range.start, res.QuickFixes.map(typeConvertion_1.toLocation)]
                };
                return codeLens;
            });
        }
    }
    _updateCodeLensForTest(bucket, fileName, node) {
        return __awaiter(this, void 0, void 0, function* () {
            // backward compatible check: Features property doesn't present on older version OmniSharp
            if (node.Features === undefined) {
                return;
            }
            if (node.Kind === "ClassDeclaration" && node.ChildNodes.length > 0) {
                let projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
                if (!projectInfo.DotNetProject && projectInfo.MsBuildProject) {
                    this._updateCodeLensForTestClass(bucket, fileName, node);
                }
            }
            let [testFeature, testFrameworkName] = this._getTestFeatureAndFramework(node);
            if (testFeature) {
                bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "Run Test", command: 'dotnet.test.run', arguments: [testFeature.Data, fileName, testFrameworkName] }));
                bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "Debug Test", command: 'dotnet.test.debug', arguments: [testFeature.Data, fileName, testFrameworkName] }));
            }
        });
    }
    _updateCodeLensForTestClass(bucket, fileName, node) {
        // if the class doesnot contain any method then return
        if (!node.ChildNodes.find(value => (value.Kind === "MethodDeclaration"))) {
            return;
        }
        let testMethods = new Array();
        let testFrameworkName = null;
        for (let child of node.ChildNodes) {
            let [testFeature, frameworkName] = this._getTestFeatureAndFramework(child);
            if (testFeature) {
                // this test method has a test feature
                if (!testFrameworkName) {
                    testFrameworkName = frameworkName;
                }
                testMethods.push(testFeature.Data);
            }
        }
        if (testMethods.length > 0) {
            bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "Run All Tests", command: 'dotnet.classTests.run', arguments: [testMethods, fileName, testFrameworkName] }));
            bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "Debug All Tests", command: 'dotnet.classTests.debug', arguments: [testMethods, fileName, testFrameworkName] }));
        }
    }
    _getTestFeatureAndFramework(node) {
        let testFeature = node.Features.find(value => (value.Name == 'XunitTestMethod' || value.Name == 'NUnitTestMethod' || value.Name == 'MSTestMethod'));
        if (testFeature) {
            let testFrameworkName = 'xunit';
            if (testFeature.Name == 'NUnitTestMethod') {
                testFrameworkName = 'nunit';
            }
            else if (testFeature.Name == 'MSTestMethod') {
                testFrameworkName = 'mstest';
            }
            return [testFeature, testFrameworkName];
        }
        return [null, null];
    }
}
OmniSharpCodeLensProvider.filteredSymbolNames = {
    'Equals': true,
    'Finalize': true,
    'GetHashCode': true,
    'ToString': true
};
exports.default = OmniSharpCodeLensProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUxlbnNQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jb2RlTGVuc1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUdoRyxrREFBa0Q7QUFDbEQsaUNBQWlDO0FBRWpDLGdFQUFrRTtBQUVsRSx5REFBa0Q7QUFFbEQsa0RBQStDO0FBRS9DLGdFQUF5RDtBQUV6RCx1QkFBd0IsU0FBUSxNQUFNLENBQUMsUUFBUTtJQUkzQyxZQUFZLFFBQWdCLEVBQUUsS0FBbUI7UUFDN0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztDQUNKO0FBRUQsK0JBQStDLFNBQVEsMEJBQWdCO0lBSW5FLFlBQVksTUFBdUIsRUFBRSxXQUF3QjtRQUN6RCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUUzQixJQUFJLHVCQUF1QixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSw2QkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVPLG1CQUFtQjtRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFTSyxpQkFBaUIsQ0FBQyxRQUE2QixFQUFFLEtBQStCOztZQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzNFLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFF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