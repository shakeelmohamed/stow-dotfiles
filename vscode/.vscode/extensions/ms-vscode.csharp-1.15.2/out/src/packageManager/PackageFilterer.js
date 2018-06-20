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
const PackageFilePathResolver_1 = require("./PackageFilePathResolver");
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
            let testPath = PackageFilePathResolver_1.ResolvePackageTestPath(pkg);
            if (!testPath) {
                //if there is no testPath specified then we will not filter it
                return true;
            }
            return !(yield util.fileExists(testPath));
        }));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZUZpbHRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VNYW5hZ2VyL1BhY2thZ2VGaWx0ZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFJaEcsa0NBQWtDO0FBQ2xDLHVFQUFtRTtBQUNuRSxpREFBOEM7QUFFOUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRXJELHdCQUFxQyxRQUFtQixFQUFFLFlBQWlDOztRQUN2RixJQUFJLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RSxPQUFPLDhCQUE4QixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUFBO0FBSEQsd0NBR0M7QUFFRCxnQ0FBZ0MsUUFBbUIsRUFBRSxZQUFpQztJQUNsRixJQUFJLFFBQVEsRUFBRTtRQUNWLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QixJQUFJLEdBQUcsQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNsRixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELElBQUksR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7S0FDTjtTQUNJO1FBQ0QsTUFBTSxJQUFJLDJCQUFZLENBQUMsa0NBQWtDLENBQUMsQ0FBQztLQUM5RDtBQUNMLENBQUM7QUFFRCx3Q0FBOEMsUUFBbUI7O1FBQzdELE9BQU8sV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFPLEdBQVksRUFBRSxFQUFFO1lBQ2hELGdFQUFnRTtZQUNoRSxJQUFJLFFBQVEsR0FBRyxnREFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNYLDhEQUE4RDtnQkFDOUQsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUVELE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDVCxDQUFDO0NBQUEifQ==