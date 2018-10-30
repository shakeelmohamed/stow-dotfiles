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
const vscode = require("vscode");
const ParsedEnvironmentFile_1 = require("./coreclr-debug/ParsedEnvironmentFile");
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
     * Parse envFile and add to config.env
     */
    parseEnvFile(envFile, config) {
        if (envFile) {
            try {
                const parsedFile = ParsedEnvironmentFile_1.ParsedEnvironmentFile.CreateFromFile(envFile, config["env"]);
                // show error message if single lines cannot get parsed
                if (parsedFile.Warning) {
                    CSharpConfigurationProvider.showFileWarningAsync(parsedFile.Warning, envFile);
                }
                config.env = parsedFile.Env;
            }
            catch (e) {
                throw new Error(`Can't parse envFile ${envFile} because of ${e}`);
            }
        }
        // remove envFile from config after parsing
        if (config.envFile) {
            delete config.envFile;
        }
        return config;
    }
    /**
     * Try to add all missing attributes to the debug configuration being launched.
     */
    resolveDebugConfiguration(folder, config, token) {
        // read from envFile and set config.env
        if (config.envFile) {
            config = this.parseEnvFile(config.envFile.replace(/\${workspaceFolder}/g, folder.uri.fsPath), config);
        }
        // If the config looks functional return it, otherwise force VSCode to open a configuration file https://github.com/Microsoft/vscode/issues/54213
        return config && config.type ? config : null;
    }
    static showFileWarningAsync(message, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const openItem = { title: 'Open envFile' };
            let result = yield vscode.window.showWarningMessage(message, openItem);
            if (result && result.title === openItem.title) {
                let doc = yield vscode.workspace.openTextDocument(fileName);
                if (doc) {
                    vscode.window.showTextDocument(doc);
                }
            }
        });
    }
}
exports.CSharpConfigurationProvider = CSharpConfigurationProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ3VyYXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpREFBaUQ7QUFDakQsaUNBQWlDO0FBQ2pDLGlGQUE4RTtBQUU5RSxxQ0FBdUo7QUFHdkosbURBQWtFO0FBQ2xFLHFDQUF5QztBQUN6QywrQ0FBcUM7QUFHckM7SUFHSSxZQUFtQixNQUF1QjtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDVywrQ0FBK0MsQ0FBQyxNQUEwQzs7WUFDcEcsTUFBTSxvQkFBb0IsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFFM0Usc0VBQXNFO1lBQ3RFLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQ25EO2dCQUNJLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqQztZQUVELElBQUksWUFBWSxHQUFHLG9CQUFvQixDQUFDO1lBQ3hDLHNEQUFzRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzlDLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDYixJQUFJLE1BQU0sRUFDVjtvQkFDSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNyRDtnQkFFRCwwREFBMEQ7Z0JBQzFELE1BQU0sYUFBYSxHQUFHLElBQUks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