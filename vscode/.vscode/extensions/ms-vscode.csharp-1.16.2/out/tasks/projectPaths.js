/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const commandLineArguments_1 = require("./commandLineArguments");
exports.rootPath = path.resolve(__dirname, '..');
exports.vscodeignorePath = path.join(exports.rootPath, '.vscodeignore');
exports.offlineVscodeignorePath = path.join(exports.rootPath, 'offline.vscodeignore');
exports.onlineVscodeignorePath = path.join(exports.rootPath, 'release.vscodeignore');
exports.nodeModulesPath = path.join(exports.rootPath, 'node_modules');
exports.vscePath = path.join(exports.nodeModulesPath, 'vsce', 'out', 'vsce');
exports.nycPath = path.join(exports.nodeModulesPath, 'nyc', 'bin', 'nyc.js');
exports.mochaPath = path.join(exports.nodeModulesPath, 'mocha', 'bin', 'mocha');
exports.istanbulPath = path.join(exports.nodeModulesPath, 'istanbul', 'lib', 'cli.js');
exports.codecovPath = path.join(exports.nodeModulesPath, 'codecov', 'bin', 'codecov');
exports.vscodeTestHostPath = path.join(exports.nodeModulesPath, 'vscode', 'bin', 'test');
exports.packageJsonPath = path.join(exports.rootPath, "package.json");
exports.packedVsixOutputRoot = commandLineArguments_1.commandLineOptions.outputFolder || exports.rootPath;
exports.unpackedVsixPath = path.join(exports.rootPath, "vsix");
exports.unpackedExtensionPath = path.join(exports.unpackedVsixPath, "extension");
exports.codeExtensionPath = commandLineArguments_1.commandLineOptions.codeExtensionPath || exports.rootPath;
exports.codeExtensionSourcesPath = path.join(exports.codeExtensionPath, "out");
exports.testRootPath = path.join(exports.rootPath, "out", "test");
exports.testAssetsRootPath = path.join(exports.rootPath, "test", "integrationTests", "testAssets");
exports.coverageRootPath = path.join(exports.rootPath, 'coverage');
exports.unitTestCoverageRootPath = path.join(exports.coverageRootPath, 'unit');
exports.integrationTestCoverageRootPath = path.join(exports.coverageRootPath, 'integration');
exports.nycOutputPath = path.join(exports.rootPath, '.nyc_output');
exports.integrationTestNycOutputPath = path.join(exports.nycOutputPath, 'integration');
exports.nodePath = path.join(process.env.NVM_BIN
    ? `${process.env.NVM_BIN}${path.sep}`
    : '', 'node');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdFBhdGhzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGFza3MvcHJvamVjdFBhdGhzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYiw2QkFBNkI7QUFDN0IsaUVBQTREO0FBRS9DLFFBQUEsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRXpDLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3hELFFBQUEsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBUSxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDdEUsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFRLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztBQUVyRSxRQUFBLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEQsUUFBQSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBZSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0QsUUFBQSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBZSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDN0QsUUFBQSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBZSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEUsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBZSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkUsUUFBQSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBZSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDdEUsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUFlLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUV6RSxRQUFBLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFdEQsUUFBQSxvQkFBb0IsR0FBRyx5Q0FBa0IsQ0FBQyxZQUFZLElBQUksZ0JBQVEsQ0FBQztBQUNuRSxRQUFBLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvQyxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQWdCLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFakUsUUFBQSxpQkFBaUIsR0FBRyx5Q0FBa0IsQ0FBQyxpQkFBaUIsSUFBSSxnQkFBUSxDQUFDO0FBQ3JFLFFBQUEsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUUvRCxRQUFBLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELFFBQUEsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBUSxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUVuRixRQUFBLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRCxRQUFBLHdCQUF3QixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0QsUUFBQSwrQkFBK0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRTdFLFFBQUEsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNuRCxRQUFBLDRCQUE0QixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUV2RSxRQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTztJQUNqRCxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFO0lBQ3JDLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMifQ==