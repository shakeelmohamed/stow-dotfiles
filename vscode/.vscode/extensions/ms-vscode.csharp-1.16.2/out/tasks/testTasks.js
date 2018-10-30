/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = require("gulp");
const path = require("path");
const projectPaths_1 = require("./projectPaths");
const spawnNode_1 = require("./spawnNode");
gulp.task("test:feature", () => __awaiter(this, void 0, void 0, function* () {
    let env = Object.assign({}, process.env, { OSVC_SUITE: "featureTests", CODE_TESTS_PATH: path.join(projectPaths_1.testRootPath, "featureTests") });
    return spawnNode_1.default([projectPaths_1.vscodeTestHostPath], {
        env
    });
}));
gulp.task("test:unit", () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.nycPath,
        '-r',
        'lcovonly',
        '--report-dir',
        projectPaths_1.unitTestCoverageRootPath,
        projectPaths_1.mochaPath,
        '--ui',
        'tdd',
        '--',
        'test/unitTests/**/*.test.ts'
    ]);
}));
gulp.task("test:integration:singleCsproj", () => __awaiter(this, void 0, void 0, function* () {
    return runIntegrationTest("singleCsproj");
}));
gulp.task("test:integration:slnWithCsproj", () => __awaiter(this, void 0, void 0, function* () {
    return runIntegrationTest("slnWithCsproj");
}));
gulp.task("test:integration", gulp.series("test:integration:singleCsproj", "test:integration:slnWithCsproj"));
gulp.task("test", gulp.series("test:feature", "test:unit", "test:integration"));
function runIntegrationTest(testAssetName) {
    return __awaiter(this, void 0, void 0, function* () {
        let env = {
            OSVC_SUITE: testAssetName,
            CODE_TESTS_PATH: path.join(projectPaths_1.testRootPath, "integrationTests"),
            CODE_EXTENSIONS_PATH: projectPaths_1.codeExtensionPath,
            CODE_TESTS_WORKSPACE: path.join(projectPaths_1.testAssetsRootPath, testAssetName),
            CODE_WORKSPACE_ROOT: projectPaths_1.rootPath,
        };
        return spawnNode_1.default([projectPaths_1.vscodeTestHostPath], { env, cwd: projectPaths_1.rootPath });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFRhc2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGFza3MvdGVzdFRhc2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQUViLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsaURBQWlLO0FBQ2pLLDJDQUFvQztBQUVwQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFTLEVBQUU7SUFDakMsSUFBSSxHQUFHLHFCQUNBLE9BQU8sQ0FBQyxHQUFHLElBQ2QsVUFBVSxFQUFFLGNBQWMsRUFDMUIsZUFBZSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQVksRUFBRSxjQUFjLENBQUMsR0FDM0QsQ0FBQztJQUVGLE9BQU8sbUJBQVMsQ0FBQyxDQUFDLGlDQUFrQixDQUFDLEVBQUU7UUFDbkMsR0FBRztLQUNOLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFTLEVBQUU7SUFDOUIsT0FBTyxtQkFBUyxDQUFDO1FBQ2Isc0JBQU87UUFDUCxJQUFJO1FBQ0osVUFBVTtRQUNWLGNBQWM7UUFDZCx1Q0FBd0I7UUFDeEIsd0JBQVM7UUFDVCxNQUFNO1FBQ04sS0FBSztRQUNMLElBQUk7UUFDSiw2QkFBNkI7S0FDaEMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsR0FBUyxFQUFFO0lBQ2xELE9BQU8sa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsR0FBUyxFQUFFO0lBQ25ELE9BQU8sa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxJQUFJLENBQ0wsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FDM0IsK0JBQStCLEVBQy9CLGdDQUFnQyxDQUNuQyxDQUFDLENBQUM7QUFFUCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUN6QixjQUFjLEVBQ2QsV0FBVyxFQUNYLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUV6Qiw0QkFBa0MsYUFBcUI7O1FBQ25ELElBQUksR0FBRyxHQUFHO1lBQ04sVUFBVSxFQUFFLGFBQWE7WUFDekIsZUFBZSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQVksRUFBRSxrQkFBa0IsQ0FBQztZQUM1RCxvQkFBb0IsRUFBRSxnQ0FBaUI7WUFDdkMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBa0IsRUFBRSxhQUFhLENBQUM7WUFDbEUsbUJBQW1CLEVBQUUsdUJBQVE7U0FDaEMsQ0FBQztRQUVGLE9BQU8sbUJBQVMsQ0FBQyxDQUFDLGlDQUFrQixDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLHVCQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FBQSJ9