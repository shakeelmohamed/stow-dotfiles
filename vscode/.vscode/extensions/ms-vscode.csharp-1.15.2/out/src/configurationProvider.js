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
const fs = require("fs-extra");
const path = require("path");
const serverUtils = require("./omnisharp/utils");
const assets_1 = require("./assets");
const protocol_1 = require("./omnisharp/protocol");
const common_1 = require("./common");
const jsonc_parser_1 = require("jsonc-parser");
class CSharpConfigurationProvider {
    constructor(server) {
        this.server = server;
    }
    /**
     * TODO: Remove function when https://github.com/OmniSharp/omnisharp-roslyn/issues/909 is resolved.
     *
     * Note: serverUtils.requestWorkspaceInformation only retrieves one folder for multi-root workspaces. Therefore, generator will be incorrect for all folders
     * except the first in a workspace. Currently, this only works if the requested folder is the same as the server's solution path or folder.
     */
    checkWorkspaceInformationMatchesWorkspaceFolder(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const solutionPathOrFolder = this.server.getSolutionPathOrFolder();
            // Make sure folder, folder.uri, and solutionPathOrFolder are defined.
            if (!folder || !folder.uri || !solutionPathOrFolder) {
                return Promise.resolve(false);
            }
            let serverFolder = solutionPathOrFolder;
            // If its a .sln file, get the folder of the solution.
            return fs.lstat(solutionPathOrFolder).then(stat => {
                return stat.isFile();
            }).then(isFile => {
                if (isFile) {
                    serverFolder = path.dirname(solutionPathOrFolder);
                }
                // Get absolute paths of current folder and server folder.
                const currentFolder = path.resolve(folder.uri.fsPath);
                serverFolder = path.resolve(serverFolder);
                return currentFolder && folder.uri && common_1.isSubfolderOf(serverFolder, currentFolder);
            });
        });
    }
    /**
     * Returns a list of initial debug configurations based on contextual information, e.g. package.json or folder.
     */
    provideDebugConfigurations(folder, token) {
        return serverUtils.requestWorkspaceInformation(this.server).then((info) => __awaiter(this, void 0, void 0, function* () {
            return this.checkWorkspaceInformationMatchesWorkspaceFolder(folder).then((workspaceMatches) => __awaiter(this, void 0, void 0, function* () {
                const generator = new assets_1.AssetGenerator(info);
                if (workspaceMatches && protocol_1.containsDotNetCoreProjects(info)) {
                    const dotVscodeFolder = path.join(folder.uri.fsPath, '.vscode');
                    const tasksJsonPath = path.join(dotVscodeFolder, 'tasks.json');
                    // Make sure .vscode folder exists, addTasksJsonIfNecessary will fail to create tasks.json if the folder does not exist. 
                    return fs.ensureDir(dotVscodeFolder).then(() => __awaiter(this, void 0, void 0, function* () {
                        // Check to see if tasks.json exists.
                        return fs.pathExists(tasksJsonPath);
                    })).then((tasksJsonExists) => __awaiter(this, void 0, void 0, function* () {
                        // Enable addTasksJson if it does not exist.
                        return assets_1.addTasksJsonIfNecessary(generator, { addTasksJson: !tasksJsonExists });
                    })).then(() => {
                        const isWebProject = generator.hasWebServerDependency();
                        const launchJson = generator.createLaunchJson(isWebProject);
                        // jsonc-parser's parse function parses a JSON string with comments into a JSON object. However, this removes the comments. 
                        return jsonc_parser_1.parse(launchJson);
                    });
                }
                // Error to be caught in the .catch() below to write default C# configurations
                throw new Error("Does not contain .NET Core projects.");
            }));
        })).catch((err) => {
            // Provider will always create an launch.json file. Providing default C# configurations.
            // jsonc-parser's parse to convert to JSON object without comments. 
            return [
                jsonc_parser_1.parse(assets_1.createLaunchConfiguration("${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll", '${workspaceFolder}')),
                jsonc_parser_1.parse(assets_1.createWebLaunchConfiguration("${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll", '${workspaceFolder}')),
                jsonc_parser_1.parse(assets_1.createAttachConfiguration())
            ];
        });
    }
    /**
     * Try to add all missing attributes to the debug configuration being launched.
     */
    resolveDebugConfiguration(folder, config, token) {
        // vsdbg does the error checking
        return config;
    }
}
exports.CSharpConfigurationProvider = CSharpConfigurationProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ3VyYXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpREFBaUQ7QUFHakQscUNBQXVKO0FBR3ZKLG1EQUFrRTtBQUNsRSxxQ0FBeUM7QUFDekMsK0NBQXFDO0FBRXJDO0lBR0ksWUFBbUIsTUFBdUI7UUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ1csK0NBQStDLENBQUMsTUFBMEM7O1lBQ3BHLE1BQU0sb0JBQW9CLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBRTNFLHNFQUFzRTtZQUN0RSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUNuRDtnQkFDSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakM7WUFFRCxJQUFJLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztZQUN4QyxzREFBc0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5QyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2IsSUFBSSxNQUFNLEVBQ1Y7b0JBQ0ksWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDckQ7Z0JBRUQsMERBQTBEO2dCQUMxRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxH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