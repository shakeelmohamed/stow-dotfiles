"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const xml2js_1 = require("xml2js");
const utils_1 = require("../../utils");
const constants_1 = require("../../constants");
const nuGetConfigMatcher = /^nuget\.config$/i;
/**
 * TODO: Document limitations:
 *  - does not (currently) respect NuGet <clear /> tag
 *  - does not (currently) use <packageSourceCredentials> or <apikeys> or <disabledPackageSources>
 */
// FIXME: handle errors as in rest of project
// TODO: better typing
function getPackageSourcesFromConfig(parsedNuGetConfig = {}) {
    const { configuration = {} } = parsedNuGetConfig;
    const { packageSources = [] } = configuration;
    // TODO: Check whether these need to be reversed first; not sure how the config is standardly parsed.
    return packageSources.reduce((accumulator, packageSource) => {
        let { add: sourceEntries = [] } = packageSource;
        return accumulator.concat(sourceEntries.reduce((sourceAccumulator, entry) => {
            if (!entry.$ || !entry.$.value) {
                return sourceAccumulator;
            }
            return sourceAccumulator.concat(entry.$.value);
        }, []));
    }, []);
}
// Exported only for tests. TODO: add the tests
function getPackageSourcesFromConfigs(nugetConfigs) {
    if (nugetConfigs.length === 0) {
        return Promise.resolve([]);
    }
    const packageSourcePromises = nugetConfigs.map((nugetConfig) => new Promise((resolve, reject) => {
        xml2js_1.parseString(nugetConfig, (err, parsed = {}) => {
            if (err) {
                return reject(err);
            }
            return resolve(getPackageSourcesFromConfig(parsed));
        });
    }));
    return Promise.all(packageSourcePromises);
}
exports.getPackageSourcesFromConfigs = getPackageSourcesFromConfigs;
function getNuGetConfigContents(configPaths) {
    if (configPaths.length === 0) {
        return Promise.resolve([]);
    }
    const readPromises = configPaths.map((configPath) => new Promise((resolve, reject) => {
        fs.readFile(configPath, 'utf-8', (err, contents) => {
            if (err) {
                return reject(err);
            }
            return resolve(contents);
        });
    }));
    return Promise.all(readPromises);
}
function getNuGetSearchUrls() {
    const ngpmConfiguration = vscode.workspace.getConfiguration('ngpm');
    const useLocalNuGetConfigs = ngpmConfiguration.get('useLocalNuGetConfigs') || false;
    const defaultPackageSources = [constants_1.NUGET_SEARCH_URL];
    if (!useLocalNuGetConfigs) {
        return Promise.resolve(defaultPackageSources);
    }
    const readDirPromise = new Promise((resolve, reject) => {
        fs.readdir(vscode.workspace.rootPath, (err, files) => {
            if (err) {
                return reject(err);
            }
            return resolve(files);
        });
    });
    return readDirPromise
        .then((files) => {
        const workspaceConfig = files.filter((filename) => nuGetConfigMatcher.test(filename))[0];
        const pathsToNuGetConfigs = ngpmConfiguration.get('nugetConfigLocations') || [];
        if (workspaceConfig) {
            pathsToNuGetConfigs.unshift(path.join(vscode.workspace.rootPath, workspaceConfig));
        }
        return utils_1.dedupeArray(pathsToNuGetConfigs);
    })
        .then(getNuGetConfigContents)
        .then(getPackageSourcesFromConfigs)
        .then((nestedPackageSources) => utils_1.flattenNestedArray(nestedPackageSources));
}
exports.default = getNuGetSearchUrls;
//# sourceMappingURL=getNuGetSearchUrl.js.map