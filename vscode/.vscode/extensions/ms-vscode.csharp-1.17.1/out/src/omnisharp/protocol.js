"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
var Requests;
(function (Requests) {
    Requests.AddToProject = '/addtoproject';
    Requests.AutoComplete = '/autocomplete';
    Requests.CodeCheck = '/codecheck';
    Requests.CodeFormat = '/codeformat';
    Requests.ChangeBuffer = '/changebuffer';
    Requests.FilesChanged = '/filesChanged';
    Requests.FindSymbols = '/findsymbols';
    Requests.FindUsages = '/findusages';
    Requests.FormatAfterKeystroke = '/formatAfterKeystroke';
    Requests.FormatRange = '/formatRange';
    Requests.GetCodeActions = '/getcodeactions';
    Requests.GoToDefinition = '/gotoDefinition';
    Requests.FindImplementations = '/findimplementations';
    Requests.Project = '/project';
    Requests.Projects = '/projects';
    Requests.RemoveFromProject = '/removefromproject';
    Requests.Rename = '/rename';
    Requests.RunCodeAction = '/runcodeaction';
    Requests.SignatureHelp = '/signatureHelp';
    Requests.TypeLookup = '/typelookup';
    Requests.UpdateBuffer = '/updatebuffer';
    Requests.Metadata = '/metadata';
})(Requests = exports.Requests || (exports.Requests = {}));
var FileModificationType;
(function (FileModificationType) {
    FileModificationType[FileModificationType["Modified"] = 0] = "Modified";
    FileModificationType[FileModificationType["Opened"] = 1] = "Opened";
    FileModificationType[FileModificationType["Renamed"] = 2] = "Renamed";
})(FileModificationType = exports.FileModificationType || (exports.FileModificationType = {}));
var FileChangeType;
(function (FileChangeType) {
    FileChangeType["Change"] = "Change";
    FileChangeType["Create"] = "Create";
    FileChangeType["Delete"] = "Delete";
})(FileChangeType = exports.FileChangeType || (exports.FileChangeType = {}));
var V2;
(function (V2) {
    let Requests;
    (function (Requests) {
        Requests.GetCodeActions = '/v2/getcodeactions';
        Requests.RunCodeAction = '/v2/runcodeaction';
        Requests.GetTestStartInfo = '/v2/getteststartinfo';
        Requests.RunTest = '/v2/runtest';
        Requests.RunAllTestsInClass = "/v2/runtestsinclass";
        Requests.DebugTestGetStartInfo = '/v2/debugtest/getstartinfo';
        Requests.DebugTestsInClassGetStartInfo = '/v2/debugtestsinclass/getstartinfo';
        Requests.DebugTestLaunch = '/v2/debugtest/launch';
        Requests.DebugTestStop = '/v2/debugtest/stop';
        Requests.BlockStructure = '/v2/blockstructure';
        Requests.CodeStructure = '/v2/codestructure';
    })(Requests = V2.Requests || (V2.Requests = {}));
    let TestOutcomes;
    (function (TestOutcomes) {
        TestOutcomes.None = 'none';
        TestOutcomes.Passed = 'passed';
        TestOutcomes.Failed = 'failed';
        TestOutcomes.Skipped = 'skipped';
        TestOutcomes.NotFound = 'notfound';
    })(TestOutcomes = V2.TestOutcomes || (V2.TestOutcomes = {}));
    let SymbolKinds;
    (function (SymbolKinds) {
        // types
        SymbolKinds.Class = 'class';
        SymbolKinds.Delegate = 'delegate';
        SymbolKinds.Enum = 'enum';
        SymbolKinds.Interface = 'interface';
        SymbolKinds.Struct = 'struct';
        // members
        SymbolKinds.Constant = 'constant';
        SymbolKinds.Constructor = 'constructor';
        SymbolKinds.Destructor = 'destructor';
        SymbolKinds.EnumMember = 'enummember';
        SymbolKinds.Event = 'event';
        SymbolKinds.Field = 'field';
        SymbolKinds.Indexer = 'indexer';
        SymbolKinds.Method = 'method';
        SymbolKinds.Operator = 'operator';
        SymbolKinds.Property = 'property';
        // other
        SymbolKinds.Namespace = 'namespace';
        SymbolKinds.Unknown = 'unknown';
    })(SymbolKinds = V2.SymbolKinds || (V2.SymbolKinds = {}));
    let SymbolAccessibilities;
    (function (SymbolAccessibilities) {
        SymbolAccessibilities.Internal = 'internal';
        SymbolAccessibilities.Private = 'private';
        SymbolAccessibilities.PrivateProtected = 'private protected';
        SymbolAccessibilities.Protected = 'protected';
        SymbolAccessibilities.ProtectedInternal = 'protected internal';
        SymbolAccessibilities.Public = 'public';
    })(SymbolAccessibilities = V2.SymbolAccessibilities || (V2.SymbolAccessibilities = {}));
    let SymbolPropertyNames;
    (function (SymbolPropertyNames) {
        SymbolPropertyNames.Accessibility = 'accessibility';
        SymbolPropertyNames.Static = 'static';
        SymbolPropertyNames.TestFramework = 'testFramework';
        SymbolPropertyNames.TestMethodName = 'testMethodName';
    })(SymbolPropertyNames = V2.SymbolPropertyNames || (V2.SymbolPropertyNames = {}));
    let SymbolRangeNames;
    (function (SymbolRangeNames) {
        SymbolRangeNames.Attributes = 'attributes';
        SymbolRangeNames.Full = 'full';
        SymbolRangeNames.Name = 'name';
    })(SymbolRangeNames = V2.SymbolRangeNames || (V2.SymbolRangeNames = {}));
    let Structure;
    (function (Structure) {
        function walkCodeElements(elements, action) {
            function walker(elements, parentElement) {
                for (let element of elements) {
                    action(element, parentElement);
                    if (element.Children) {
                        walker(element.Children, element);
                    }
                }
            }
            walker(elements);
        }
        Structure.walkCodeElements = walkCodeElements;
    })(Structure = V2.Structure || (V2.Structure = {}));
})(V2 = exports.V2 || (exports.V2 = {}));
function findNetFrameworkTargetFramework(project) {
    let regexp = new RegExp('^net[1-4]');
    return project.TargetFrameworks.find(tf => regexp.test(tf.ShortName));
}
exports.findNetFrameworkTargetFramework = findNetFrameworkTargetFramework;
function findNetCoreAppTargetFramework(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netcoreapp'));
}
exports.findNetCoreAppTargetFramework = findNetCoreAppTargetFramework;
function findNetStandardTargetFramework(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netstandard'));
}
exports.findNetStandardTargetFramework = findNetStandardTargetFramework;
function isDotNetCoreProject(project) {
    return findNetCoreAppTargetFramework(project) !== undefined ||
        findNetStandardTargetFramework(project) !== undefined ||
        findNetFrameworkTargetFramework(project) !== undefined;
}
exports.isDotNetCoreProject = isDotNetCoreProject;
function getDotNetCoreProjectDescriptors(info) {
    let result = [];
    if (info.DotNet && info.DotNet.Projects.length > 0) {
        for (let project of info.DotNet.Projects) {
            result.push({
                Name: project.Name,
                Directory: project.Path,
                FilePath: path.join(project.Path, 'project.json')
            });
        }
    }
    if (info.MsBuild && info.MsBuild.Projects.length > 0) {
        for (let project of info.MsBuild.Projects) {
            if (isDotNetCoreProject(project)) {
                result.push({
                    Name: path.basename(project.Path),
                    Directory: path.dirname(project.Path),
                    FilePath: project.Path
                });
            }
        }
    }
    return result;
}
exports.getDotNetCoreProjectDescriptors = getDotNetCoreProjectDescriptors;
function findExecutableMSBuildProjects(projects) {
    let result = [];
    projects.forEach(project => {
        if (project.IsExe && findNetCoreAppTargetFramework(project) !== undefined) {
            result.push(project);
        }
    });
    return result;
}
exports.findExecutableMSBuildProjects = findExecutableMSBuildProjects;
function findExecutableProjectJsonProjects(projects, configurationName) {
    let result = [];
    projects.forEach(project => {
        project.Configurations.forEach(configuration => {
            if (configuration.Name === configurationName && configuration.EmitEntryPoint === true) {
                if (project.Frameworks.length > 0) {
                    result.push(project);
                }
            }
        });
    });
    return result;
}
exports.findExecutableProjectJsonProjects = findExecutableProjectJsonProjects;
function containsDotNetCoreProjects(workspaceInfo) {
    if (workspaceInfo.DotNet && findExecutableProjectJsonProjects(workspaceInfo.DotNet.Projects, 'Debug').length > 0) {
        return true;
    }
    if (workspaceInfo.MsBuild && findExecutableMSBuildProjects(workspaceInfo.MsBuild.Projects).length > 0) {
        return true;
    }
    return false;
}
exports.containsDotNetCoreProjects = containsDotNetCoreProjects;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3Byb3RvY29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkJBQTZCO0FBRTdCLElBQWMsUUFBUSxDQXVCckI7QUF2QkQsV0FBYyxRQUFRO0lBQ0wscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0IscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0Isa0JBQVMsR0FBRyxZQUFZLENBQUM7SUFDekIsbUJBQVUsR0FBRyxhQUFhLENBQUM7SUFDM0IscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0IscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0Isb0JBQVcsR0FBRyxjQUFjLENBQUM7SUFDN0IsbUJBQVUsR0FBRyxhQUFhLENBQUM7SUFDM0IsNkJBQW9CLEdBQUcsdUJBQXVCLENBQUM7SUFDL0Msb0JBQVcsR0FBRyxjQUFjLENBQUM7SUFDN0IsdUJBQWMsR0FBRyxpQkFBaUIsQ0FBQztJQUNuQyx1QkFBYyxHQUFHLGlCQUFpQixDQUFDO0lBQ25DLDRCQUFtQixHQUFHLHNCQUFzQixDQUFDO0lBQzdDLGdCQUFPLEdBQUcsVUFBVSxDQUFDO0lBQ3JCLGlCQUFRLEdBQUcsV0FBVyxDQUFDO0lBQ3ZCLDBCQUFpQixHQUFHLG9CQUFvQixDQUFDO0lBQ3pDLGVBQU0sR0FBRyxTQUFTLENBQUM7SUFDbkIsc0JBQWEsR0FBRyxnQkFBZ0IsQ0FBQztJQUNqQyxzQkFBYSxHQUFHLGdCQUFnQixDQUFDO0lBQ2pDLG1CQUFVLEdBQUcsYUFBYSxDQUFDO0lBQzNCLHFCQUFZLEdBQUcsZUFBZSxDQUFDO0lBQy9CLGlCQUFRLEdBQUcsV0FBVyxDQUFDO0FBQ3hDLENBQUMsRUF2QmEsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUF1QnJCO0FBbVZELElBQVksb0JBSVg7QUFKRCxXQUFZLG9CQUFvQjtJQUM1Qix1RUFBUSxDQUFB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