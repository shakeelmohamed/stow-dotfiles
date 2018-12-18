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
const child_process_1 = require("child_process");
const path = require("path");
const vscode = require("vscode");
var LaunchTargetKind;
(function (LaunchTargetKind) {
    LaunchTargetKind[LaunchTargetKind["Solution"] = 0] = "Solution";
    LaunchTargetKind[LaunchTargetKind["ProjectJson"] = 1] = "ProjectJson";
    LaunchTargetKind[LaunchTargetKind["Folder"] = 2] = "Folder";
    LaunchTargetKind[LaunchTargetKind["Csx"] = 3] = "Csx";
    LaunchTargetKind[LaunchTargetKind["Cake"] = 4] = "Cake";
})(LaunchTargetKind = exports.LaunchTargetKind || (exports.LaunchTargetKind = {}));
/**
 * Returns a list of potential targets on which OmniSharp can be launched.
 * This includes `project.json` files, `*.sln` files (if any `*.csproj` files are found), and the root folder
 * (if it doesn't contain a `project.json` file, but `project.json` files exist). In addition, the root folder
 * is included if there are any `*.csproj` files present, but a `*.sln* file is not found.
 */
function findLaunchTargets(options) {
    if (!vscode.workspace.workspaceFolders) {
        return Promise.resolve([]);
    }
    return vscode.workspace.findFiles(
    /*include*/ '{**/*.sln,**/*.csproj,**/project.json,**/*.csx,**/*.cake,**/*.cs}', 
    /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}', 
    /*maxResults*/ options.maxProjectResults)
        .then(resourcesToLaunchTargets);
}
exports.findLaunchTargets = findLaunchTargets;
function resourcesToLaunchTargets(resources) {
    // The list of launch targets is calculated like so:
    //   * If there are .csproj files, .sln files are considered as launch targets.
    //   * Any project.json file is considered a launch target.
    //   * If there is no project.json file in a workspace folder, the workspace folder as added as a launch target.
    //   * Additionally, if there are .csproj files, but no .sln file, the root is added as a launch target.
    //
    // TODO:
    //   * It should be possible to choose a .csproj as a launch target
    //   * It should be possible to choose a .sln file even when no .csproj files are found 
    //     within the root.
    if (!Array.isArray(resources)) {
        return [];
    }
    let workspaceFolderToUriMap = new Map();
    for (let resource of resources) {
        let folder = vscode.workspace.getWorkspaceFolder(resource);
        if (folder) {
            let buckets;
            if (workspaceFolderToUriMap.has(folder.index)) {
                buckets = workspaceFolderToUriMap.get(folder.index);
            }
            else {
                buckets = [];
                workspaceFolderToUriMap.set(folder.index, buckets);
            }
            buckets.push(resource);
        }
    }
    let targets = [];
    workspaceFolderToUriMap.forEach((resources, folderIndex) => {
        let hasCsProjFiles = false, hasSlnFile = false, hasProjectJson = false, hasProjectJsonAtRoot = false, hasCSX = false, hasCake = false, hasCs = false;
        hasCsProjFiles = resources.some(isCSharpProject);
        let folder = vscode.workspace.workspaceFolders[folderIndex];
        let folderPath = folder.uri.fsPath;
        resources.forEach(resource => {
            // Add .sln files if there are .csproj files
            if (hasCsProjFiles && isSolution(resource)) {
                hasSlnFile = true;
                targets.push({
                    label: path.basename(resource.fsPath),
                    description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
                    target: resource.fsPath,
                    directory: path.dirname(resource.fsPath),
                    kind: LaunchTargetKind.Solution
                });
            }
            // Add project.json files
            if (isProjectJson(resource)) {
                const dirname = path.dirname(resource.fsPath);
                hasProjectJson = true;
                hasProjectJsonAtRoot = hasProjectJsonAtRoot || dirname === folderPath;
                targets.push({
                    label: path.basename(resource.fsPath),
                    description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
                    target: dirname,
                    directory: dirname,
                    kind: LaunchTargetKind.ProjectJson
                });
            }
            // Discover if there is any CSX file
            if (!hasCSX && isCsx(resource)) {
                hasCSX = true;
            }
            // Discover if there is any Cake file
            if (!hasCake && isCake(resource)) {
                hasCake = true;
            }
            //Discover if there is any cs file
            if (!hasCs && isCs(resource)) {
                hasCs = true;
            }
        });
        // Add the root folder under the following circumstances:
        // * If there are .csproj files, but no .sln file, and none in the root.
        // * If there are project.json files, but none in the root.
        if ((hasCsProjFiles && !hasSlnFile) || (hasProjectJson && !hasProjectJsonAtRoot)) {
            targets.push({
                label: path.basename(folderPath),
                description: '',
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Folder
            });
        }
        // if we noticed any CSX file(s), add a single CSX-specific target pointing at the root folder
        if (hasCSX) {
            targets.push({
                label: "CSX",
                description: path.basename(folderPath),
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Csx
            });
        }
        // if we noticed any Cake file(s), add a single Cake-specific target pointing at the root folder
        if (hasCake) {
            targets.push({
                label: "Cake",
                description: path.basename(folderPath),
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Cake
            });
        }
        if (hasCs && !hasSlnFile && !hasCsProjFiles && !hasProjectJson && !hasProjectJsonAtRoot) {
            targets.push({
                label: path.basename(folderPath),
                description: '',
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Folder
            });
        }
    });
    return targets.sort((a, b) => a.directory.localeCompare(b.directory));
}
function isCSharpProject(resource) {
    return /\.csproj$/i.test(resource.fsPath);
}
function isSolution(resource) {
    return /\.sln$/i.test(resource.fsPath);
}
function isProjectJson(resource) {
    return /\project.json$/i.test(resource.fsPath);
}
function isCsx(resource) {
    return /\.csx$/i.test(resource.fsPath);
}
function isCake(resource) {
    return /\.cake$/i.test(resource.fsPath);
}
function isCs(resource) {
    return /\.cs$/i.test(resource.fsPath);
}
function launchOmniSharp(cwd, args, launchInfo, platformInfo, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            launch(cwd, args, launchInfo, platformInfo, options, monoResolver)
                .then(result => {
                // async error - when target not not ENEOT
                result.process.on('error', err => {
                    reject(err);
                });
                // success after a short freeing event loop
                setTimeout(function () {
                    resolve(result);
                }, 0);
            })
                .catch(reason => reject(reason));
        });
    });
}
exports.launchOmniSharp = launchOmniSharp;
function launch(cwd, args, launchInfo, platformInfo, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.useEditorFormattingSettings) {
            let globalConfig = vscode.workspace.getConfiguration('', null);
            let csharpConfig = vscode.workspace.getConfiguration('[csharp]', null);
            args.push(`formattingOptions:useTabs=${!getConfigurationValue(globalConfig, csharpConfig, 'editor.insertSpaces', true)}`);
            args.push(`formattingOptions:tabSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
            args.push(`formattingOptions:indentationSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
        }
        if (platformInfo.isWindows()) {
            return launchWindows(launchInfo.LaunchPath, cwd, args);
        }
        let monoInfo = yield monoResolver.getGlobalMonoInfo(options);
        if (monoInfo) {
            const launchPath = launchInfo.MonoLaunchPath || launchInfo.LaunchPath;
            let childEnv = monoInfo.env;
            return Object.assign({}, launchNixMono(launchPath, cwd, args, childEnv, options.waitForDebugger), { monoVersion: monoInfo.version, monoPath: monoInfo.path });
        }
        else {
            return launchNix(launchInfo.LaunchPath, cwd, args);
        }
    });
}
function getConfigurationValue(globalConfig, csharpConfig, configurationPath, defaultValue) {
    if (csharpConfig[configurationPath] != undefined) {
        return csharpConfig[configurationPath];
    }
    return globalConfig.get(configurationPath, defaultValue);
}
function launchWindows(launchPath, cwd, args) {
    function escapeIfNeeded(arg) {
        const hasSpaceWithoutQuotes = /^[^"].* .*[^"]/;
        return hasSpaceWithoutQuotes.test(arg)
            ? `"${arg}"`
            : arg.replace("&", "^&");
    }
    let argsCopy = args.slice(0); // create copy of args
    argsCopy.unshift(launchPath);
    argsCopy = [[
            '/s',
            '/c',
            '"' + argsCopy.map(escapeIfNeeded).join(' ') + '"'
        ].join(' ')];
    let process = child_process_1.spawn('cmd', argsCopy, {
        windowsVerbatimArguments: true,
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath,
    };
}
function launchNix(launchPath, cwd, args) {
    let process = child_process_1.spawn(launchPath, args, {
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath
    };
}
function launchNixMono(launchPath, cwd, args, environment, useDebugger) {
    let argsCopy = args.slice(0); // create copy of details args
    argsCopy.unshift(launchPath);
    argsCopy.unshift("--assembly-loader=strict");
    if (useDebugger) {
        argsCopy.unshift("--debug");
        argsCopy.unshift("--debugger-agent=transport=dt_socket,server=y,address=127.0.0.1:55555");
    }
    let process = child_process_1.spawn('mono', argsCopy, {
        detached: false,
        cwd: cwd,
        env: environment
    });
    return {
        process,
        command: launchPath
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL2xhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxpREFBb0Q7QUFHcEQsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUtqQyxJQUFZLGdCQU1YO0FBTkQsV0FBWSxnQkFBZ0I7SUFDeEIsK0RBQVEsQ0FBQTtJQUNSLHFFQUFXLENBQUE7SUFDWCwyREFBTSxDQUFBO0lBQ04scURBQUcsQ0FBQTtJQUNILHVEQUFJLENBQUE7QUFDUixDQUFDLEVBTlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFNM0I7QUFhRDs7Ozs7R0FLRztBQUNILDJCQUFrQyxPQUFnQjtJQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNwQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDOUI7SUFFRCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUztJQUN6QixXQUFXLENBQUMsbUVBQW1FO0lBQy9FLFdBQVcsQ0FBQyx3REFBd0Q7SUFDcEUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztTQUM1QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBVkQsOENBVUM7QUFFRCxrQ0FBa0MsU0FBdUI7SUFDckQsb0RBQW9EO0lBQ3BELCtFQUErRTtJQUMvRSwyREFBMkQ7SUFDM0QsZ0hBQWdIO0lBQ2hILHdHQUF3RztJQUN4RyxFQUFFO0lBQ0YsUUFBUTtJQUNSLG1FQUFtRTtJQUNuRSx3RkFBd0Y7SUFDeEYsdUJBQXVCO0lBRXZCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFFRCxJQUFJLHVCQUF1QixHQUFH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