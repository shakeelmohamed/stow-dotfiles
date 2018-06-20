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
const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const unzip = require("unzip2");
const projectPaths_1 = require("./projectPaths");
const packageJson_1 = require("./packageJson");
const spawnNode_1 = require("./spawnNode");
gulp.task('vsix:release:unpackage', () => {
    const packageJSON = packageJson_1.getPackageJSON();
    const name = packageJSON.name;
    const version = packageJSON.version;
    const packageName = `${name}-${version}.vsix`;
    del.sync(projectPaths_1.unpackedVsixPath);
    fs.createReadStream(packageName).pipe(unzip.Extract({ path: projectPaths_1.unpackedVsixPath }));
});
gulp.task('vsix:release:package', (onError) => __awaiter(this, void 0, void 0, function* () {
    del.sync(projectPaths_1.vscodeignorePath);
    fs.copyFileSync(projectPaths_1.onlineVscodeignorePath, projectPaths_1.vscodeignorePath);
    try {
        yield spawnNode_1.default([projectPaths_1.vscePath, 'package']);
    }
    finally {
        yield del(projectPaths_1.vscodeignorePath);
    }
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25saW5lUGFja2FnaW5nVGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90YXNrcy9vbmxpbmVQYWNrYWdpbmdUYXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxZQUFZLENBQUM7Ozs7Ozs7Ozs7QUFFYiwyQkFBMkI7QUFDM0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixnQ0FBZ0M7QUFDaEMsaURBQXNHO0FBQ3RHLCtDQUErQztBQUMvQywyQ0FBb0M7QUFFcEMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFDckMsTUFBTSxXQUFXLEdBQUcsNEJBQWMsRUFBRSxDQUFDO0lBQ3JDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7SUFDOUIsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztJQUNwQyxNQUFNLFdBQVcsR0FBRyxHQUFHLElBQUksSUFBSSxPQUFPLE9BQU8sQ0FBQztJQUU5QyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUFnQixDQUFDLENBQUM7SUFDM0IsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLCtCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFPLE9BQU8sRUFBRSxFQUFFO0lBQ2hELEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQWdCLENBQUMsQ0FBQztJQUUzQixFQUFFLENBQUMsWUFBWSxDQUFDLHFDQUFzQixFQUFFLCtCQUFnQixDQUFDLENBQUM7SUFFMUQsSUFBSTtRQUNBLE1BQU0sbUJBQVMsQ0FBQyxDQUFDLHVCQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztLQUMxQztZQUNPO1FBQ0osTUFBTSxHQUFHLENBQUMsK0JBQWdCLENBQUMsQ0FBQztLQUMvQjtBQUNMLENBQUMsQ0FBQSxDQUFDLENBQUMifQ==