"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function GetPackagesFromVersion(version, runTimeDependencies, serverUrl, installPath) {
    if (!version) {
        throw new Error('Invalid version');
    }
    let versionPackages = new Array();
    for (let inputPackage of runTimeDependencies) {
        if (inputPackage.platformId) {
            versionPackages.push(SetBinaryAndGetPackage(inputPackage, serverUrl, version, installPath));
        }
    }
    return versionPackages;
}
exports.GetPackagesFromVersion = GetPackagesFromVersion;
function SetBinaryAndGetPackage(inputPackage, serverUrl, version, installPath) {
    let installBinary;
    if (inputPackage.platformId === "win-x86" || inputPackage.platformId === "win-x64") {
        installBinary = "OmniSharp.exe";
    }
    else {
        installBinary = "run";
    }
    return GetPackage(inputPackage, serverUrl, version, installPath, installBinary);
}
exports.SetBinaryAndGetPackage = SetBinaryAndGetPackage;
function GetPackage(inputPackage, serverUrl, version, installPath, installBinary) {
    if (!version) {
        throw new Error('Invalid version');
    }
    let versionPackage = Object.assign({}, inputPackage, { "description": `${inputPackage.description}, Version = ${version}`, "url": `${serverUrl}/releases/${version}/omnisharp-${inputPackage.platformId}.zip`, "installPath": `${installPath}/${version}`, "installTestPath": `./${installPath}/${version}/${installBinary}`, "fallbackUrl": "" //setting to empty so that we dont use the fallback url of the default packages
     });
    return versionPackage;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwUGFja2FnZUNyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL09tbmlzaGFycFBhY2thZ2VDcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFJaEcsZ0NBQXVDLE9BQWUsRUFBRSxtQkFBOEIsRUFBRSxTQUFpQixFQUFFLFdBQW1CO0lBQzFILElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdEM7SUFFRCxJQUFJLGVBQWUsR0FBRyxJQUFJLEtBQUssRUFBVyxDQUFDO0lBQzNDLEtBQUssSUFBSSxZQUFZLElBQUksbUJBQW1CLEVBQUU7UUFDMUMsSUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFO1lBQ3pCLGVBQWUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUMvRjtLQUNKO0lBRUQsT0FBTyxlQUFlLENBQUM7QUFDM0IsQ0FBQztBQWJELHdEQWFDO0FBRUQsZ0NBQXVDLFlBQXFCLEVBQUUsU0FBaUIsRUFBRSxPQUFlLEVBQUUsV0FBbUI7SUFDakgsSUFBSSxhQUFxQixDQUFDO0lBQzFCLElBQUksWUFBWSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksWUFBWSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7UUFDaEYsYUFBYSxHQUFHLGVBQWUsQ0FBQztLQUNuQztTQUNJO1FBQ0QsYUFBYSxHQUFHLEtBQUssQ0FBQztLQUN6QjtJQUVELE9BQU8sVUFBVSxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBVkQsd0RBVUM7QUFFRCxvQkFBb0IsWUFBcUIsRUFBRSxTQUFpQixFQUFFLE9BQWUsRUFBRSxXQUFtQixFQUFFLGFBQXFCO0lBQ3JILElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdEM7SUFFRCxJQUFJLGNBQWMscUJBQU8sWUFBWSxJQUNqQyxhQUFhLEVBQUUsR0FBRyxZQUFZLENBQUMsV0FBVyxlQUFlLE9BQU8sRUFBRSxFQUNsRSxLQUFLLEVBQUUsR0FBRyxTQUFTLGFBQWEsT0FBTyxjQUFjLFlBQVksQ0FBQyxVQUFVLE1BQU0sRUFDbEYsYUFBYSxFQUFFLEdBQUcsV0FBVyxJQUFJLE9BQU8sRUFBRSxFQUMxQyxpQkFBaUIsRUFBRSxLQUFLLFdBQVcsSUFBSSxPQUFPLElBQUksYUFBYSxFQUFFLEVBQ2pFLGFBQWEsRUFBRSxFQUFFLENBQUMsK0VBQStFO09BQ3BHLENBQUM7SUFFRixPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDIn0=