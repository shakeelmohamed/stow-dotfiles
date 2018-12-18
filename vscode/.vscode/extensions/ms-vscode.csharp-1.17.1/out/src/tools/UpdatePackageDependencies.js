"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
function updatePackageDependencies() {
    const urlsIndex = process.argv.indexOf("--urls");
    const newPrimaryUrls = urlsIndex >= 0 ? process.argv[urlsIndex + 1] : undefined;
    const fallbackUrlsIndex = process.argv.indexOf("--fallbackUrls");
    const newFallbackUrls = fallbackUrlsIndex >= 0 ? process.argv[fallbackUrlsIndex + 1] : undefined;
    if (newPrimaryUrls === undefined || newPrimaryUrls === "-?" || newPrimaryUrls === "-h") {
        console.log("This command will update the URLs for package dependencies in package.json");
        console.log();
        console.log("Syntax: updatePackageDependencies --urls \"<url1>,<url2>,...\" [--fallbackUrls \"<fallback-url-1>,<fallback-url-2>...\"]");
        console.log();
        return;
    }
    if (newPrimaryUrls.length === 0) {
        throw new Error("Invalid first argument to updatePackageDependencies. URL string argument expected.");
    }
    let packageJSON = JSON.parse(fs.readFileSync('package.json').toString());
    // map from lowercase filename to Package
    const mapFileNameToDependency = {};
    // First build the map
    packageJSON.runtimeDependencies.forEach(dependency => {
        let fileName = getLowercaseFileNameFromUrl(dependency.url);
        let existingDependency = mapFileNameToDependency[fileName];
        if (existingDependency !== undefined) {
            throw new Error(`Multiple dependencies found with filename '${fileName}': '${existingDependency.url}' and '${dependency.url}'.`);
        }
        mapFileNameToDependency[fileName] = dependency;
    });
    let findDependencyToUpdate = (url) => {
        let fileName = getLowercaseFileNameFromUrl(url);
        let dependency = mapFileNameToDependency[fileName];
        if (dependency === undefined) {
            throw new Error(`Unable to update item for url '${url}'. No 'runtimeDependency' found with filename '${fileName}'.`);
        }
        console.log(`Updating ${url}`);
        return dependency;
    };
    newPrimaryUrls.split(',').forEach(urlToUpdate => {
        console.log(`Trying to update ${urlToUpdate}`);
        let dependency = findDependencyToUpdate(urlToUpdate);
        dependency.url = urlToUpdate;
    });
    if (newFallbackUrls !== undefined) {
        newFallbackUrls.split(',').forEach(urlToUpdate => {
            console.log(`Trying to update ${urlToUpdate}`);
            let dependency = findDependencyToUpdate(urlToUpdate);
            dependency.fallbackUrl = urlToUpdate;
        });
    }
    let content = JSON.stringify(packageJSON, null, 2);
    if (os.platform() === 'win32') {
        content = content.replace(/\n/gm, "\r\n");
    }
    // We use '\u200b' (unicode zero-length space character) to break VS Code's URL detection regex for URLs that are examples. This process will
    // convert that from the readable espace sequence, to just an invisible character. Convert it back to the visible espace sequence.
    content = content.replace(/\u200b/gm, "\\u200b");
    fs.writeFileSync('package.json', content);
}
exports.updatePackageDependencies = updatePackageDependencies;
function getLowercaseFileNameFromUrl(url) {
    if (!url.startsWith("https://")) {
        throw new Error(`Unexpected URL '${url}'. URL expected to start with 'https://'.`);
    }
    if (!url.endsWith(".zip")) {
        throw new Error(`Unexpected URL '${url}'. URL expected to end with '.zip'.`);
    }
    let index = url.lastIndexOf("/");
    return url.substr(index + 1).toLowerCase();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUGFja2FnZURlcGVuZGVuY2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b29scy9VcGRhdGVQYWNrYWdlRGVwZW5kZW5jaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQVN6QjtJQUVJLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sY0FBYyxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFOUUsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sZUFBZSxHQUFHLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRS9GLElBQUksY0FBYyxLQUFLLFNBQVMsSUFBSSxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7UUFDcEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1FBQzFGLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEhBQTBILENBQUMsQ0FBQztRQUN4SSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDZCxPQUFPO0tBQ1Y7SUFFRCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0ZBQW9GLENBQUMsQ0FBQztLQUN6RztJQUVELElB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