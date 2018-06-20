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
    Requests.CurrentFileMembersAsTree = '/currentfilemembersastree';
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
    })(Requests = V2.Requests || (V2.Requests = {}));
    let TestOutcomes;
    (function (TestOutcomes) {
        TestOutcomes.None = 'none';
        TestOutcomes.Passed = 'passed';
        TestOutcomes.Failed = 'failed';
        TestOutcomes.Skipped = 'skipped';
        TestOutcomes.NotFound = 'notfound';
    })(TestOutcomes = V2.TestOutcomes || (V2.TestOutcomes = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3Byb3RvY29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkJBQTZCO0FBRTdCLElBQWMsUUFBUSxDQXdCckI7QUF4QkQsV0FBYyxRQUFRO0lBQ0wscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0IscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0Isa0JBQVMsR0FBRyxZQUFZLENBQUM7SUFDekIsbUJBQVUsR0FBRyxhQUFhLENBQUM7SUFDM0IscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0IsaUNBQXdCLEdBQUcsMkJBQTJCLENBQUM7SUFDdkQscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0Isb0JBQVcsR0FBRyxjQUFjLENBQUM7SUFDN0IsbUJBQVUsR0FBRyxhQUFhLENBQUM7SUFDM0IsNkJBQW9CLEdBQUcsdUJBQXVCLENBQUM7SUFDL0Msb0JBQVcsR0FBRyxjQUFjLENBQUM7SUFDN0IsdUJBQWMsR0FBRyxpQkFBaUIsQ0FBQztJQUNuQyx1QkFBYyxHQUFHLGlCQUFpQixDQUFDO0lBQ25DLDRCQUFtQixHQUFHLHNCQUFzQixDQUFDO0lBQzdDLGdCQUFPLEdBQUcsVUFBVSxDQUFDO0lBQ3JCLGlCQUFRLEdBQUcsV0FBVyxDQUFDO0lBQ3ZCLDBCQUFpQixHQUFHLG9CQUFvQixDQUFDO0lBQ3pDLGVBQU0sR0FBRyxTQUFTLENBQUM7SUFDbkIsc0JBQWEsR0FBRyxnQkFBZ0IsQ0FBQztJQUNqQyxzQkFBYSxHQUFHLGdCQUFnQixDQUFDO0lBQ2pDLG1CQUFVLEdBQUcsYUFBYSxDQUFDO0lBQzNCLHFCQUFZLEdBQUcsZUFBZSxDQUFDO0lBQy9CLGlCQUFRLEdBQUcsV0FBVyxDQUFDO0FBQ3hDLENBQUMsRUF4QmEsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUF3QnJCO0FBeVZELElBQVksb0JBS1g7QUFM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