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
        projectPaths_1.istanbulPath,
        'report',
        '--dir',
        projectPaths_1.integrationTestCoverageRootPath,
        '--include',
        `${projectPaths_1.integrationTestNycOutputPath}/*.json`,
        'lcovonly'
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
gulp.task("cov:merge-html", () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.istanbulPath,
        'report',
        '--dir',
        projectPaths_1.integrationTestCoverageRootPath,
        '--include',
        `${projectPaths_1.integrationTestNycOutputPath}/*.json`,
        'html'
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
}));
gulp.task("cov:report:integration", gulp.series("cov:merge", () => __awaiter(this, void 0, void 0, function* () {
    return spawnNode_1.default([
        projectPaths_1.codecovPath,
        '-f',
        path.join(projectPaths_1.integrationTestCoverageRootPath, 'lcov.info'),
        '-F',
        'integration'
    ], {
        cwd: projectPaths_1.codeExtensionSourcesPath
    });
})));
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
gulp.task("cov:report", gulp.parallel("cov:report:integration", "cov:report:unit"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY292ZXJhZ2VUYXNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rhc2tzL2NvdmVyYWdlVGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOzs7Ozs7Ozs7O0FBRWIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QiwyQkFBMkI7QUFDM0IsMkNBQW9DO0FBQ3BDLGlEQUF3TjtBQUV4TixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtJQUNuQyxHQUFHLENBQUMsK0JBQWdCLENBQUMsQ0FBQztJQUN0QixHQUFHLENBQUMsNEJBQWEsQ0FBQyxDQUFDO0lBRW5CLE9BQU8sbUJBQVMsQ0FBQztRQUNiLHNCQUFPO1FBQ1AsWUFBWTtRQUNaLFdBQVc7UUFDWCw2QkFBNkI7UUFDN0IsR0FBRztRQUNILEdBQUc7S0FDTixFQUFFO1FBQ0MsR0FBRyxFQUFFLHVDQUF3QjtLQUNoQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBUyxFQUFFO0lBQzlCLE9BQU8sbUJBQVMsQ0FBQztRQUNiLDJCQUFZO1FBQ1osUUFBUTtRQUNSLE9BQU87UUFDUCw4Q0FBK0I7UUFDL0IsV0FBVztRQUNYLEdBQUcsMkNBQTRCLFNBQVM7UUFDeEMsVUFBVTtLQUNiLEVBQUU7UUFDQyxHQUFHLEVBQUUsdUNBQXdCO0tBQ2hDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtJQUNuQyxPQUFPLG1CQUFTLENBQUM7UUFDYiwyQkFBWTtRQUNaLFFBQVE7UUFDUixPQUFPO1FBQ1AsOENBQStCO1FBQy9CLFdBQVc7UUFDWCxHQUFHLDJDQUE0QixTQUFTO1FBQ3hDLE1BQU07S0FDVCxFQUFFO1FBQ0MsR0FBRyxFQUFFLHVDQUF3QjtLQUNoQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBR0gsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFTLEVBQUU7SUFDcEUsT0FBTyxtQkFBUyxDQUFDO1FBQ2IsMEJBQVc7UUFDWCxJQUFJO1FBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBK0IsRUFBRSxXQUFXLENBQUM7UUFDdkQsSUFBSTtRQUNKLGFBQWE7S0FDaEIsRUFBRTtRQUNDLEdBQUcsRUFBRSx1Q0FBd0I7S0FDaEMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBRUosSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFTLEVBQUU7SUFDcEMsT0FBTyxtQkFBUyxDQUFDO1FBQ2IsMEJBQVc7UUFDWCxJQUFJO1FBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBd0IsRUFBRSxXQUFXLENBQUM7UUFDaEQsSUFBSTtRQUNKLE1BQU07S0FDVCxFQUFFO1FBQ0MsR0FBRyxFQUFFLHVDQUF3QjtLQUNoQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMifQ==