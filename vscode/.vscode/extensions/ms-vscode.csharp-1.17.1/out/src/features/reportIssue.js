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
const CSharpExtensionId_1 = require("../constants/CSharpExtensionId");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const issuesUrl = "https://github.com/OmniSharp/omnisharp-vscode/issues/new";
function reportIssue(vscode, eventStream, getDotnetInfo, isValidPlatformForMono, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        const dotnetInfo = yield getDotnetInfo();
        const monoInfo = yield getMonoIfPlatformValid(isValidPlatformForMono, options, monoResolver);
        let extensions = getInstalledExtensions(vscode);
        let csharpExtVersion = getCsharpExtensionVersion(vscode);
        const body = encodeURIComponent(`## Issue Description ##
## Steps to Reproduce ##

## Expected Behavior ##

## Actual Behavior ##

## Logs ##

### OmniSharp log ###
<details>Post the output from Output-->OmniSharp log here</details>

### C# log ###
<details>Post the output from Output-->C# here</details>

## Environment information ##

**VSCode version**: ${vscode.version}
**C# Extension**: ${csharpExtVersion}

${monoInfo}
<details><summary>Dotnet Information</summary>
${dotnetInfo}</details>
<details><summary>Visual Studio Code Extensions</summary>
${generateExtensionTable(extensions)}
</details>
`);
        const encodedBody = encodeURIComponent(body);
        const queryStringPrefix = "?";
        const fullUrl = `${issuesUrl}${queryStringPrefix}body=${encodedBody}`;
        eventStream.post(new loggingEvents_1.OpenURL(fullUrl));
    });
}
exports.default = reportIssue;
function sortExtensions(a, b) {
    if (a.packageJSON.name.toLowerCase() < b.packageJSON.name.toLowerCase()) {
        return -1;
    }
    if (a.packageJSON.name.toLowerCase() > b.packageJSON.name.toLowerCase()) {
        return 1;
    }
    return 0;
}
function generateExtensionTable(extensions) {
    if (extensions.length <= 0) {
        return "none";
    }
    const tableHeader = `|Extension|Author|Version|\n|---|---|---|`;
    const table = extensions.map((e) => `|${e.packageJSON.name}|${e.packageJSON.publisher}|${e.packageJSON.version}|`).join("\n");
    const extensionTable = `
${tableHeader}\n${table};
`;
    return extensionTable;
}
function getMonoIfPlatformValid(isValidPlatformForMono, options, monoResolver) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isValidPlatformForMono) {
            let monoVersion;
            try {
                let globalMonoInfo = yield monoResolver.getGlobalMonoInfo(options);
                if (globalMonoInfo) {
                    monoVersion = `OmniSharp using global mono :${globalMonoInfo.version}`;
                }
                else {
                    monoVersion = `OmniSharp using built-in mono`;
                }
            }
            catch (error) {
                monoVersion = `There is a problem with running OmniSharp on mono: ${error}`;
            }
            return `<details><summary>Mono Information</summary>
        ${monoVersion}</details>`;
        }
        return "";
    });
}
function getInstalledExtensions(vscode) {
    let extensions = vscode.extensions.all
        .filter(extension => extension.packageJSON.isBuiltin === false);
    return extensions.sort(sortExtensions);
}
function getCsharpExtensionVersion(vscode) {
    const extension = vscode.extensions.getExtension(CSharpExtensionId_1.CSharpExtensionId);
    return extension.packageJSON.version;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0SXNzdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvcmVwb3J0SXNzdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBSWhHLHNFQUFtRTtBQUVuRSw4REFBcUQ7QUFLckQsTUFBTSxTQUFTLEdBQUcsMERBQTBELENBQUM7QUFFN0UscUJBQTBDLE1BQWMsRUFBRSxXQUF3QixFQUFFLGFBQTZCLEVBQUUsc0JBQStCLEVBQUUsT0FBZ0IsRUFBRSxZQUEyQjs7UUFDN0wsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFFBQVEsR0FBRyxNQUFNLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM3RixJQUFJLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxJQUFJLGdCQUFnQixHQUFHLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXpELE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztzQkFpQmQsTUFBTSxDQUFDLE9BQU87b0JBQ2hCLGdCQUFnQjs7RUFFbEMsUUFBUTs7RUFFUixVQUFVOztFQUVWLHNCQUFzQixDQUFDLFVBQVUsQ0FBQzs7Q0FFbkMsQ0FBQyxDQUFDO1FBRUMsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsTUFBTSxpQkFBaUIsR0FBVyxHQUFHLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsR0FBRyxTQUFTLEdBQUcsaUJBQWlCLFFBQVEsV0FBVyxFQUFFLENBQUM7UUFDdEUsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQUE7QUF0Q0QsOEJBc0NDO0FBRUQsd0JBQXdCLENBQWlCLEVBQUUsQ0FBaUI7SUFFeEQsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUNyRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ2I7SUFDRCxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO1FBQ3JFLE9BQU8sQ0FBQyxDQUFDO0tBQ1o7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUFFRCxnQ0FBZ0MsVUFBNEI7SUFDeEQsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUN4QixPQUFPLE1BQU0sQ0FBQztLQUNqQjtJQUVELE1BQU0sV0FBVyxHQUFHLDJDQUEyQyxDQUFDO0lBQ2hFLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU5SCxNQUFNLGNBQWMsR0FBRztFQUN6QixXQUFXLEtBQUssS0FBSztDQUN0QixDQUFDO0lBRUUsT0FBTyxjQUFjLENBQUM7QUFDMUIsQ0FBQztBQUVELGdDQUFzQyxzQkFBK0IsRUFBRSxPQUFnQixFQUFFLFlBQTJCOztRQUNoSCxJQUFJLHNCQUFzQixFQUFFO1lBQ3hCLElBQUksV0FBbUIsQ0FBQztZQUN4QixJQUFJO2dCQUNBLElBQUksY0FBYyxHQUFHLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLGNBQWMsRUFBRTtvQkFDaEIsV0FBVyxHQUFHLGdDQUFnQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQzFFO3FCQUNJO29CQUNELFdBQVcsR0FBRywrQkFBK0IsQ0FBQztpQkFDakQ7YUFDSjtZQUNELE9BQU8sS0FBSyxFQUFFO2dCQUNWLFdBQVcsR0FBRyxzREFBc0QsS0FBSyxFQUFFLENBQUM7YUFDL0U7WUFFRCxPQUFPO1VBQ0wsV0FBVyxZQUFZLENBQUM7U0FDN0I7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FBQTtBQUlELGdDQUFnQyxNQUFjO0lBQzFDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRztTQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQztJQUVwRSxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVELG1DQUFtQyxNQUFjO0lBQzdDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLHFDQUFpQixDQUFDLENBQUM7SUFDcEUsT0FBTyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUN6QyxDQUFDIn0=