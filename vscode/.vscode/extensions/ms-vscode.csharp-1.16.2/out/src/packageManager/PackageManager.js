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
const PackageError_1 = require("./PackageError");
const NestedError_1 = require("../NestedError");
const FileDownloader_1 = require("./FileDownloader");
const ZipInstaller_1 = require("./ZipInstaller");
const PackageFilterer_1 = require("./PackageFilterer");
const AbsolutePathPackage_1 = require("./AbsolutePathPackage");
function DownloadAndInstallPackages(packages, provider, platformInfo, eventStream, extensionPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let absolutePathPackages = packages.map(pkg => AbsolutePathPackage_1.AbsolutePathPackage.getAbsolutePathPackage(pkg, extensionPath));
        let filteredPackages = yield PackageFilterer_1.filterPackages(absolutePathPackages, platformInfo);
        if (filteredPackages) {
            for (let pkg of filteredPackages) {
                try {
                    let buffer = yield FileDownloader_1.DownloadFile(pkg.description, eventStream, provider, pkg.url, pkg.fallbackUrl);
                    yield ZipInstaller_1.InstallZip(buffer, pkg.description, pkg.installPath, pkg.binaries, eventStream);
                }
                catch (error) {
                    if (error instanceof NestedError_1.NestedError) {
                        throw new PackageError_1.PackageError(error.message, pkg, error.err);
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
    });
}
exports.DownloadAndInstallPackages = DownloadAndInstallPackages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGFja2FnZU1hbmFnZXIvUGFja2FnZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBSWhHLGlEQUE4QztBQUM5QyxnREFBNkM7QUFDN0MscURBQWdEO0FBQ2hELGlEQUE0QztBQUc1Qyx1REFBbUQ7QUFDbkQsK0RBQTREO0FBRTVELG9DQUFpRCxRQUFtQixFQUFFLFFBQWlDLEVBQUUsWUFBaUMsRUFBRSxXQUF3QixFQUFFLGFBQXFCOztRQUN2TCxJQUFJLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyx5Q0FBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUMvRyxJQUFJLGdCQUFnQixHQUFHLE1BQU0sZ0NBQWMsQ0FBQyxvQkFBb0IsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRixJQUFJLGdCQUFnQixFQUFFO1lBQ2xCLEtBQUssSUFBSSxHQUFHLElBQUksZ0JBQWdCLEVBQUU7Z0JBQzlCLElBQUk7b0JBQ0EsSUFBSSxNQUFNLEdBQUcsTUFBTSw2QkFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDbEcsTUFBTSx5QkFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDekY7Z0JBQ0QsT0FBTyxLQUFLLEVBQUU7b0JBQ1YsSUFBSSxLQUFLLFlBQVkseUJBQVcsRUFBRTt3QkFDOUIsTUFBTSxJQUFJLDJCQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN6RDt5QkFDSTt3QkFDRCxNQUFNLEtBQUssQ0FBQztxQkFDZjtpQkFDSjthQUNKO1NBQ0o7SUFDTCxDQUFDO0NBQUE7QUFuQkQsZ0VBbUJDIn0=