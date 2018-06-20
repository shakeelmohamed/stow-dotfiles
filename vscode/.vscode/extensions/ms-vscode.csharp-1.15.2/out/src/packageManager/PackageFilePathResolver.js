"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("../common");
function ResolveFilePaths(pkg) {
    pkg.installTestPath = ResolvePackageTestPath(pkg);
    pkg.installPath = ResolveBaseInstallPath(pkg);
    pkg.binaries = ResolvePackageBinaries(pkg);
}
exports.ResolveFilePaths = ResolveFilePaths;
function ResolvePackageTestPath(pkg) {
    if (pkg.installTestPath) {
        return path.resolve(util.getExtensionPath(), pkg.installTestPath);
    }
    return null;
}
exports.ResolvePackageTestPath = ResolvePackageTestPath;
function ResolvePackageBinaries(pkg) {
    if (pkg.binaries) {
        return pkg.binaries.map(value => path.resolve(ResolveBaseInstallPath(pkg), value));
    }
    return null;
}
function ResolveBaseInstallPath(pkg) {
    let basePath = util.getExtensionPath();
    if (pkg.installPath) {
        basePath = path.resolve(basePath, pkg.installPath);
    }
    return basePath;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZUZpbGVQYXRoUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGFja2FnZU1hbmFnZXIvUGFja2FnZUZpbGVQYXRoUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyw2QkFBNkI7QUFDN0Isa0NBQWtDO0FBR2xDLDBCQUFpQyxHQUFZO0lBQ3pDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEQsR0FBRyxDQUFDLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QyxHQUFHLENBQUMsUUFBUSxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFKRCw0Q0FJQztBQUVELGdDQUF1QyxHQUFZO0lBQy9DLElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRTtRQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3JFO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQU5ELHdEQU1DO0FBRUQsZ0NBQWdDLEdBQVk7SUFDeEMsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO1FBQ2QsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN0RjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxnQ0FBZ0MsR0FBWTtJQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUN2QyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDakIsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN0RDtJQUVELE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUMifQ==