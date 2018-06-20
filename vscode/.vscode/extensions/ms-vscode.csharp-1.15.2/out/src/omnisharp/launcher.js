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
const semver_1 = require("semver");
const path = require("path");
const vscode = require("vscode");
const options_1 = require("./options");
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
function findLaunchTargets() {
    if (!vscode.workspace.workspaceFolders) {
        return Promise.resolve([]);
    }
    const options = options_1.Options.Read(vscode);
    return vscode.workspace.findFiles(
    /*include*/ '{**/*.sln,**/*.csproj,**/project.json,**/*.csx,**/*.cake}', 
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
        let hasCsProjFiles = false, hasSlnFile = false, hasProjectJson = false, hasProjectJsonAtRoot = false, hasCSX = false, hasCake = false;
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
function launchOmniSharp(cwd, args, launchInfo, platformInfo, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            launch(cwd, args, launchInfo, platformInfo, options)
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
function launch(cwd, args, launchInfo, platformInfo, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.useEditorFormattingSettings) {
            let globalConfig = vscode.workspace.getConfiguration();
            let csharpConfig = vscode.workspace.getConfiguration('[csharp]');
            args.push(`formattingOptions:useTabs=${!getConfigurationValue(globalConfig, csharpConfig, 'editor.insertSpaces', true)}`);
            args.push(`formattingOptions:tabSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
            args.push(`formattingOptions:indentationSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
        }
        if (platformInfo.isWindows()) {
            return launchWindows(launchInfo.LaunchPath, cwd, args);
        }
        let monoVersion = yield getMonoVersion();
        let isValidMonoAvailable = yield semver_1.satisfies(monoVersion, '>=5.8.1');
        // If the user specifically said that they wanted to launch on Mono, respect their wishes.
        if (options.useGlobalMono === "always") {
            if (!isValidMonoAvailable) {
                throw new Error('Cannot start OmniSharp because Mono version >=5.8.1 is required.');
            }
            const launchPath = launchInfo.MonoLaunchPath || launchInfo.LaunchPath;
            return launchNixMono(launchPath, monoVersion, cwd, args);
        }
        // If we can launch on the global Mono, do so; otherwise, launch directly;
        if (options.useGlobalMono === "auto" && isValidMonoAvailable && launchInfo.MonoLaunchPath) {
            return launchNixMono(launchInfo.MonoLaunchPath, monoVersion, cwd, args);
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
function launchNixMono(launchPath, monoVersion, cwd, args) {
    let argsCopy = args.slice(0); // create copy of details args
    argsCopy.unshift(launchPath);
    argsCopy.unshift("--assembly-loader=strict");
    let process = child_process_1.spawn('mono', argsCopy, {
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath,
        monoVersion,
    };
}
function getMonoVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const versionRegexp = /(\d+\.\d+\.\d+)/;
        return new Promise((resolve, reject) => {
            let childprocess;
            try {
                childprocess = child_process_1.spawn('mono', ['--version']);
            }
            catch (e) {
                return resolve(undefined);
            }
            childprocess.on('error', function (err) {
                resolve(undefined);
            });
            let stdout = '';
            childprocess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            childprocess.stdout.on('close', () => {
                let match = versionRegexp.exec(stdout);
                if (match && match.length > 1) {
                    resolve(match[1]);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL2xhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxpREFBb0Q7QUFDcEQsbUNBQW1DO0FBRW5DLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFDakMsdUNBQW9DO0FBR3BDLElBQVksZ0JBTVg7QUFORCxXQUFZLGdCQUFnQjtJQUN4QiwrREFBUSxDQUFBO0lBQ1IscUVBQVcsQ0FBQTtJQUNYLDJEQUFNLENBQUE7SUFDTixxREFBRyxDQUFBO0lBQ0gsdURBQUksQ0FBQTtBQUNSLENBQUMsRUFOVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQU0zQjtBQWFEOzs7OztHQUtHO0FBQ0g7SUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNwQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDOUI7SUFFRCxNQUFNLE9BQU8sR0FBRyxpQkFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQyxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUztJQUN6QixXQUFXLENBQUMsMkRBQTJEO0lBQ3ZFLFdBQVcsQ0FBQyx3REFBd0Q7SUFDcEUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztTQUM1QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBWkQsOENBWUM7QUFFRCxrQ0FBa0MsU0FBdUI7SUFDckQsb0RBQW9EO0lBQ3BELCtFQUErRTtJQUMvRSwyREFBMkQ7SUFDM0QsZ0hBQWdIO0lBQ2hILHdHQUF3RztJQUN4RyxFQUFFO0lBQ0YsUUFBUTtJQUNSLG1FQUFtRTtJQUNuRSx3RkFBd0Y7SUFDeEYsdUJBQXVCO0lBRXZCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FB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