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
const del = require("del");
const spawnNode_1 = require("./spawnNode");
const projectPaths_1 = require("./projectPaths");
gulp.task("cov:instrument", () => __awaiter(this, void 0, void 0, function* () {
    del(projectPaths_1.coverageRootPath);
    del(projectPaths_1.nycOutputPath);
    return spawnNode_1.default([
        projectPaths_1.nycPath,
        'instrument',
        '--require',
        'source-map-support/register',
        '.',
        '.'
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
gulp.task("cov:merge", () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.istanbulCombinePath,
        '-d',
        projectPaths_1.integrationTestCoverageRootPath,
        '-r',
        'lcovonly',
        `${projectPaths_1.integrationTestNycOutputPath}/*.json`
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
gulp.task("cov:merge-html", () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.istanbulCombinePath,
        '-d',
        projectPaths_1.integrationTestCoverageRootPath,
        '-r',
        'html',
        `${projectPaths_1.integrationTestNycOutputPath}/*.json`
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
gulp.task("cov:report", ["cov:report:integration", "cov:report:unit"]);
gulp.task("cov:report:integration", ["cov:merge"], () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.codecovPath,
        '-f',
        path.join(projectPaths_1.integrationTestCoverageRootPath, 'lcov.info'),
        '-F',
        'integration'
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
gulp.task("cov:report:unit", () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.codecovPath,
        '-f',
        path.join(projectPaths_1.unitTestCoverageRootPath, 'lcov.info'),
        '-F',
        'unit'
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY292ZXJhZ2VUYXNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rhc2tzL2NvdmVyYWdlVGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOzs7Ozs7Ozs7O0FBRWIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QiwyQkFBMkI7QUFDM0IsMkNBQW9DO0FBQ3BDLGlEQUErTjtBQUUvTixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtJQUNuQyxHQUFHLENBQUMsK0JBQWdCLENBQUMsQ0FBQztJQUN0QixHQUFHLENBQUMsNEJBQWEsQ0FBQyxDQUFDO0lBRW5CLE9BQU8sbUJBQVMsQ0FBQztRQUNiLHNCQUFPO1FBQ1AsWUFBWTtRQUNaLFdBQVc7UUFDWCw2QkFBNkI7UUFDN0IsR0FBRztRQUNILEdBQUc7S0FDTixFQUFFO1FBQ0MsR0FBRyxFQUFFLHVDQUF3QjtLQUNoQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBUyxFQUFFO0lBQzlCLE9BQU8sbUJBQVMsQ0FBQztRQUNiLGtDQUFtQjtRQUNuQixJQUFJO1FBQ0osOENBQStCO1FBQy9CLElBQUk7UUFDSixVQUFVO1FBQ1YsR0FBRywyQ0FBNEIsU0FBUztLQUMzQyxFQUFFO1FBQ0MsR0FBRyxFQUFFLHVDQUF3QjtLQUNoQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFTLEVBQUU7SUFDbkMsT0FBTyxtQkFBUyxDQUFDO1FBQ2Isa0NBQW1CO1FBQ25CLElBQUk7UUFDSiw4Q0FBK0I7UUFDL0IsSUFBSTtRQUNKLE1BQU07UUFDTixHQUFHLDJDQUE0QixTQUFTO0tBQzNDLEVBQUU7UUFDQyxHQUFHLEVBQUUsdUNBQXdCO0tBQ2hDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLHdCQUF3QixFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUV2RSxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBUyxFQUFFO0lBQzFELE9BQU8sbUJBQVMsQ0FBQztRQUNiLDBCQUFXO1FBQ1gsSUFBSTtRQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQStCLEVBQUUsV0FBVyxDQUFDO1FBQ3ZELElBQUk7UUFDSixhQUFhO0tBQ2hCLEVBQUU7UUFDQyxHQUFHLEVBQUUsdUNBQXdCO0tBQ2hDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQVMsRUFBRTtJQUNwQyxPQUFPLG1CQUFTLENBQUM7UUFDYiwwQkFBVztRQUNYLElBQUk7UUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLHVDQUF3QixFQUFFLFdBQVcsQ0FBQztRQUNoRCxJQUFJO1FBQ0osTUFBTTtLQUNULEVBQUU7UUFDQyxHQUFHLEVBQUUsdUNBQXdCO0tBQ2hDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDLENBQUMifQ==