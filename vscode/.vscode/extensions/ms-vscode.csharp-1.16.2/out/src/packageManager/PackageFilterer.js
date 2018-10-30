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
const util = require("../common");
const PackageError_1 = require("./PackageError");
const { filterAsync } = require('node-filter-async');
function filterPackages(packages, platformInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let platformPackages = filterPlatformPackages(packages, platformInfo);
        return filterAlreadyInstalledPackages(platformPackages);
    });
}
exports.filterPackages = filterPackages;
function filterPlatformPackages(packages, platformInfo) {
    if (packages) {
        return packages.filter(pkg => {
            if (pkg.architectures && pkg.architectures.indexOf(platformInfo.architecture) === -1) {
                return false;
            }
            if (pkg.platforms && pkg.platforms.indexOf(platformInfo.platform) === -1) {
                return false;
            }
            return true;
        });
    }
    else {
        throw new PackageError_1.PackageError("Package manifest does not exist.");
    }
}
function filterAlreadyInstalledPackages(packages) {
    return __awaiter(this, void 0, void 0, function* () {
        return filterAsync(packages, (pkg) => __awaiter(this, void 0, void 0, function* () {
            //If the file is present at the install test path then filter it
            let testPath = pkg.installTestPath;
            if (!testPath) {
                //if there is no testPath specified then we will not filter it
                return true;
            }
            return !(yield util.fileExists(testPath.value));
        }));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZUZpbHRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VNYW5hZ2VyL1BhY2thZ2VGaWx0ZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFHaEcsa0NBQWtDO0FBQ2xDLGlEQUE4QztBQUc5QyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFckQsd0JBQXFDLFFBQStCLEVBQUUsWUFBaUM7O1FBQ25HLElBQUksZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sOEJBQThCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQUE7QUFIRCx3Q0FHQztBQUVELGdDQUFnQyxRQUErQixFQUFFLFlBQWlDO0lBQzlGLElBQUksUUFBUSxFQUFFO1FBQ1YsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3pCLElBQUksR0FBRyxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ2xGLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsSUFBSSxHQUFHLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdEUsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztLQUNOO1NBQ0k7UUFDRCxNQUFNLElBQUksMkJBQVksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0tBQzlEO0FBQ0wsQ0FBQztBQUVELHdDQUE4QyxRQUErQjs7UUFDekUsT0FBTyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQU8sR0FBd0IsRUFBRSxFQUFFO1lBQzVELGdFQUFnRTtZQUNoRSxJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ1gsOERBQThEO2dCQUM5RCxPQUFPLElBQUksQ0FBQzthQUNmO1lBRUQsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDVCxDQUFDO0NBQUEifQ==