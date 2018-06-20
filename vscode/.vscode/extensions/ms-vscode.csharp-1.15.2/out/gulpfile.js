/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = require("gulp");
const optionsSchemaGenerator = require("./src/tools/GenerateOptionsSchema");
const packageDependencyUpdater = require("./src/tools/UpdatePackageDependencies");
const gulp_tslint_1 = require("gulp-tslint");
require('./tasks/testTasks');
require('./tasks/onlinePackagingTasks');
require('./tasks/offlinePackagingTasks');
require('./tasks/backcompatTasks');
require('./tasks/coverageTasks');
gulp.task('generateOptionsSchema', () => {
    optionsSchemaGenerator.GenerateOptionsSchema();
});
gulp.task('updatePackageDependencies', () => {
    packageDependencyUpdater.updatePackageDependencies();
});
gulp.task('tslint', () => {
    gulp.src([
        '**/*.ts',
        '!**/*.d.ts',
        '!**/typings**',
        '!node_modules/**',
        '!vsix/**'
    ])
        .pipe(gulp_tslint_1.default({
        program: require('tslint').Linter.createProgram("./tsconfig.json"),
        configuration: "./tslint.json"
    }))
        .pipe(gulp_tslint_1.default.report({
        summarizeFailureOutput: false,
        emitError: false
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VscGZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9ndWxwZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxZQUFZLENBQUM7O0FBRWIsNkJBQTZCO0FBQzdCLDRFQUE0RTtBQUM1RSxrRkFBa0Y7QUFDbEYsNkNBQWlDO0FBRWpDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzdCLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3hDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3pDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25DLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRWpDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO0lBQ3BDLHNCQUFzQixDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDbkQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtJQUN4Qyx3QkFBd0IsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO0FBQ3pELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO0lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDTCxTQUFTO1FBQ1QsWUFBWTtRQUNaLGVBQWU7UUFDZixrQkFBa0I7UUFDbEIsVUFBVTtLQUNiLENBQUM7U0FDRyxJQUFJLENBQUMscUJBQU0sQ0FBQztRQUNULE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQztRQUNsRSxhQUFhLEVBQUUsZUFBZTtLQUNqQyxDQUFDLENBQUM7U0FDRixJQUFJLENBQUMscUJBQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEIsc0JBQXNCLEVBQUUsS0FBSztRQUM3QixTQUFTLEVBQUUsS0FBSztLQUNuQixDQUFDLENBQUMsQ0FBQztBQUNaLENBQUMsQ0FBQyxDQUFDIn0=