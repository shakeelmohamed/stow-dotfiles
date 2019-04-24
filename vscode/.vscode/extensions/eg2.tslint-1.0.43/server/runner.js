"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const fs = require("fs");
const minimatch = require("minimatch");
const path = require("path");
const util = require("util");
const server = require("vscode-languageserver");
const mruCache_1 = require("./mruCache");
class ConfigCache {
    constructor() {
        this.filePath = undefined;
        this.configuration = undefined;
    }
    set(filePath, configuration) {
        this.filePath = filePath;
        this.configuration = configuration;
    }
    get(forPath) {
        return forPath === this.filePath ? this.configuration : undefined;
    }
    isDefaultLinterConfig() {
        return !!(this.configuration && this.configuration.isDefaultLinterConfig);
    }
    flush() {
        this.filePath = undefined;
        this.configuration = undefined;
    }
}
const emptyLintResult = {
    errorCount: 0,
    warningCount: 0,
    failures: [],
    fixes: [],
    format: '',
    output: '',
};
const emptyResult = {
    lintResult: emptyLintResult,
    warnings: [],
};
class TsLintRunner {
    constructor(trace) {
        this.trace = trace;
        this.tslintPath2Library = new Map();
        this.document2LibraryCache = new mruCache_1.MruCache(100);
        // map stores undefined values to represent failed resolutions
        this.globalPackageManagerPath = new Map();
        this.configCache = new ConfigCache();
    }
    runTsLint(filePath, contents, configuration) {
        this.trace('start validateTextDocument');
        this.trace('validateTextDocument: about to load tslint library');
        const warnings = [];
        if (!this.document2LibraryCache.has(filePath)) {
            this.loadLibrary(filePath, configuration, warnings);
        }
        this.trace('validateTextDocument: loaded tslint library');
        if (!this.document2LibraryCache.has(filePath)) {
            return emptyResult;
        }
        const library = this.document2LibraryCache.get(filePath)();
        if (!library) {
            return {
                lintResult: emptyLintResult,
                warnings: [
                    getInstallFailureMessage(filePath, configuration.workspaceFolderPath, configuration.packageManager || 'npm'),
                ],
            };
        }
        this.trace('About to validate ' + filePath);
        return this.doRun(filePath, contents, library, configuration, warnings);
    }
    /**
     * Filter failures for the given document
     */
    filterProblemsForFile(filePath, failures) {
        const normalizedPath = path.normalize(filePath);
        // we only show diagnostics targetting this open document, some tslint rule return diagnostics for other documents/files
        const normalizedFiles = new Map();
        return failures.filter((each) => {
            const fileName = each.getFileName();
            if (!normalizedFiles.has(fileName)) {
                normalizedFiles.set(fileName, path.normalize(fileName));
            }
            return normalizedFiles.get(fileName) === normalizedPath;
        });
    }
    onConfigFileChange(_tsLintFilePath) {
        this.configCache.flush();
    }
    getNonOverlappingReplacements(failures) {
        function overlaps(a, b) {
            return a.end >= b.start;
        }
        let sortedFailures = this.sortFailures(failures);
        let nonOverlapping = [];
        for (let i = 0; i < sortedFailures.length; i++) {
            let replacements = this.getReplacements(sortedFailures[i].getFix());
            if (i === 0 || !overlaps(nonOverlapping[nonOverlapping.length - 1], replacements[0])) {
                nonOverlapping.push(...replacements);
            }
        }
        return nonOverlapping;
    }
    getReplacements(fix) {
        let replacements = null;
        // in tslint4 a Fix has a replacement property with the Replacements
        if (fix.replacements) {
            // tslint4
            replacements = fix.replacements;
        }
        else {
            // in tslint 5 a Fix is a Replacement | Replacement[]
            if (!Array.isArray(fix)) {
                replacements = [fix];
            }
            else {
                replacements = fix;
            }
        }
        return replacements || [];
    }
    getReplacement(failure, at) {
        return this.getReplacements(failure.getFix())[at];
    }
    sortFailures(failures) {
        // The failures.replacements are sorted by position, we sort on the position of the first replacement
        return failures.sort((a, b) => {
            return this.getReplacement(a, 0).start - this.getReplacement(b, 0).start;
        });
    }
    loadLibrary(filePath, configuration, warningsOutput) {
        this.trace(`loadLibrary for ${filePath}`);
        const getGlobalPath = () => this.getGlobalPackageManagerPath(configuration.packageManager);
        const directory = path.dirname(filePath);
        let np = undefined;
        if (configuration && configuration.nodePath) {
            const exists = fs.existsSync(configuration.nodePath);
            if (exists) {
                np = configuration.nodePath;
            }
            else {
                warningsOutput.push(`The setting 'tslint.nodePath' refers to '${configuration.nodePath}', but this path does not exist. The setting will be ignored.`);
            }
        }
        let tsLintPath;
        if (np) {
            try {
                tsLintPath = this.resolveTsLint(np, np);
                if (tsLintPath.length === 0) {
                    tsLintPath = this.resolveTsLint(getGlobalPath(), directory);
                }
            }
            catch (_a) {
                tsLintPath = this.resolveTsLint(getGlobalPath(), directory);
            }
        }
        else {
            try {
                tsLintPath = this.resolveTsLint(undefined, directory);
                if (tsLintPath.length === 0) {
                    tsLintPath = this.resolveTsLint(getGlobalPath(), directory);
                }
            }
            catch (_b) {
                tsLintPath = this.resolveTsLint(getGlobalPath(), directory);
            }
        }
        this.document2LibraryCache.set(filePath, () => {
            let library;
            if (!this.tslintPath2Library.has(tsLintPath)) {
                try {
                    library = require(tsLintPath);
                }
                catch (e) {
                    this.tslintPath2Library.set(tsLintPath, undefined);
                    return;
                }
                this.tslintPath2Library.set(tsLintPath, library);
            }
            return this.tslintPath2Library.get(tsLintPath);
        });
    }
    getGlobalPackageManagerPath(packageManager) {
        this.trace(`Begin - Resolve Global Package Manager Path for: ${packageManager}`);
        if (!packageManager) {
            packageManager = 'npm';
        }
        if (!this.globalPackageManagerPath.has(packageManager)) {
            let path;
            if (packageManager === 'npm') {
                path = server.Files.resolveGlobalNodePath(this.trace);
            }
            else if (packageManager === 'yarn') {
                path = server.Files.resolveGlobalYarnPath(this.trace);
            }
            this.globalPackageManagerPath.set(packageManager, path);
        }
        this.trace(`Done - Resolve Global Package Manager Path for: ${packageManager}`);
        return this.globalPackageManagerPath.get(packageManager);
    }
    doRun(filePath, contents, library, configuration, warnings) {
        this.trace('start doValidate ' + filePath);
        const uri = filePath;
        if (this.fileIsExcluded(configuration, filePath)) {
            this.trace(`No linting: file ${filePath} is excluded`);
            return emptyResult;
        }
        if (configuration.workspaceFolderPath) {
            this.trace(`Changed directory to ${configuration.workspaceFolderPath}`);
            process.chdir(configuration.workspaceFolderPath);
        }
        const configFile = configuration.configFile || null;
        let linterConfiguration;
        this.trace('validateTextDocument: about to getConfiguration');
        try {
            linterConfiguration = this.getConfiguration(uri, filePath, library, configFile);
        }
        catch (err) {
            this.trace(`No linting: exception when getting tslint configuration for ${filePath}, configFile= ${configFile}`);
            warnings.push(getConfigurationFailureMessage(err));
            return {
                lintResult: emptyLintResult,
                warnings,
            };
        }
        if (!linterConfiguration) {
            this.trace(`No linting: no tslint configuration`);
            return emptyResult;
        }
        this.trace('validateTextDocument: configuration fetched');
        if (isJsDocument(filePath) && !configuration.jsEnable) {
            this.trace(`No linting: a JS document, but js linting is disabled`);
            return emptyResult;
        }
        if (configuration.validateWithDefaultConfig === false && this.configCache.configuration.isDefaultLinterConfig) {
            this.trace(`No linting: linting with default tslint configuration is disabled`);
            return emptyResult;
        }
        if (isExcludedFromLinterOptions(linterConfiguration.linterConfiguration, filePath)) {
            this.trace(`No linting: file is excluded using linterOptions.exclude`);
            return emptyResult;
        }
        let result;
        const options = {
            formatter: "json",
            fix: false,
            rulesDirectory: configuration.rulesDirectory || undefined,
            formattersDirectory: undefined,
        };
        if (configuration.traceLevel && configuration.traceLevel === 'verbose') {
            this.traceConfigurationFile(linterConfiguration.linterConfiguration);
        }
        // tslint writes warnings using console.warn, capture these warnings and send them to the client
        const originalConsoleWarn = console.warn;
        const captureWarnings = (message) => {
            warnings.push(message);
            originalConsoleWarn(message);
        };
        console.warn = captureWarnings;
        try { // clean up if tslint crashes
            const tslint = new library.Linter(options, typeof contents === 'string' ? undefined : contents);
            this.trace(`Linting: start linting`);
            tslint.lint(filePath, typeof contents === 'string' ? contents : '', linterConfiguration.linterConfiguration);
            result = tslint.getResult();
            this.trace(`Linting: ended linting`);
        }
        finally {
            console.warn = originalConsoleWarn;
        }
        return {
            lintResult: result,
            warnings,
            workspaceFolderPath: configuration.workspaceFolderPath,
            configFilePath: linterConfiguration.path,
        };
    }
    getConfiguration(uri, filePath, library, configFileName) {
        this.trace('getConfiguration for' + uri);
        const config = this.configCache.get(filePath);
        if (config) {
            return config;
        }
        let isDefaultConfig = false;
        let linterConfiguration = undefined;
        const linter = library.Linter;
        if (linter.findConfigurationPath) {
            isDefaultConfig = linter.findConfigurationPath(configFileName, filePath) === undefined;
        }
        const configurationResult = linter.findConfiguration(configFileName, filePath);
        // between tslint 4.0.1 and tslint 4.0.2 the attribute 'error' has been removed from IConfigurationLoadResult
        // in 4.0.2 findConfiguration throws an exception as in version ^3.0.0
        if (configurationResult.error) {
            throw configurationResult.error;
        }
        linterConfiguration = configurationResult.results;
        // In tslint version 5 the 'no-unused-variable' rules breaks the TypeScript language service plugin.
        // See https://github.com/Microsoft/TypeScript/issues/15344
        // Therefore we remove the rule from the configuration.
        //
        // In tslint 5 the rules are stored in a Map, in earlier versions they were stored in an Object
        if (linterConfiguration) {
            if (linterConfiguration.rules && linterConfiguration.rules instanceof Map) {
                linterConfiguration.rules.delete('no-unused-variable');
            }
            if (linterConfiguration.jsRules && linterConfiguration.jsRules instanceof Map) {
                linterConfiguration.jsRules.delete('no-unused-variable');
            }
        }
        const configuration = {
            isDefaultLinterConfig: isDefaultConfig,
            linterConfiguration,
            path: configurationResult.path
        };
        this.configCache.set(filePath, configuration);
        return this.configCache.configuration;
    }
    fileIsExcluded(settings, filePath) {
        if (settings.ignoreDefinitionFiles) {
            if (filePath.endsWith('.d.ts')) {
                return true;
            }
        }
        if (settings.exclude) {
            if (Array.isArray(settings.exclude)) {
                for (const pattern of settings.exclude) {
                    if (testForExclusionPattern(filePath, pattern)) {
                        return true;
                    }
                }
            }
            else if (testForExclusionPattern(filePath, settings.exclude)) {
                return true;
            }
        }
        return false;
    }
    traceConfigurationFile(configuration) {
        if (!configuration) {
            this.trace("no tslint configuration");
            return;
        }
        this.trace("tslint configuration:" + util.inspect(configuration, undefined, 4));
    }
    resolveTsLint(nodePath, cwd) {
        const nodePathKey = 'NODE_PATH';
        const app = [
            "console.log(require.resolve('tslint'));",
        ].join('');
        const env = process.env;
        const newEnv = Object.create(null);
        Object.keys(env).forEach(key => newEnv[key] = env[key]);
        if (nodePath) {
            if (newEnv[nodePathKey]) {
                newEnv[nodePathKey] = nodePath + path.delimiter + newEnv[nodePathKey];
            }
            else {
                newEnv[nodePathKey] = nodePath;
            }
            this.trace(`NODE_PATH value is: ${newEnv[nodePathKey]}`);
        }
        newEnv.ELECTRON_RUN_AS_NODE = '1';
        const spanwResults = cp.spawnSync(process.argv0, ['-e', app], { cwd, env: newEnv });
        return spanwResults.stdout.toString().trim();
    }
}
exports.TsLintRunner = TsLintRunner;
function testForExclusionPattern(filePath, pattern) {
    return minimatch(filePath, pattern, { dot: true });
}
function getInstallFailureMessage(filePath, workspaceFolder, packageManager) {
    const localCommands = {
        npm: 'npm install tslint',
        yarn: 'yarn add tslint',
    };
    const globalCommands = {
        npm: 'npm install -g tslint',
        yarn: 'yarn global add tslint',
    };
    if (workspaceFolder) { // workspace opened on a folder
        return [
            '',
            `Failed to load the TSLint library for the document ${filePath}`,
            '',
            `To use TSLint in this workspace please install tslint using \'${localCommands[packageManager]}\' or globally using \'${globalCommands[packageManager]}\'.`,
            'TSLint has a peer dependency on `typescript`, make sure that `typescript` is installed as well.',
            'You need to reopen the workspace after installing tslint.',
        ].join('\n');
    }
    else {
        return [
            `Failed to load the TSLint library for the document ${filePath}`,
            `To use TSLint for single file install tslint globally using \'${globalCommands[packageManager]}\'.`,
            'TSLint has a peer dependency on `typescript`, make sure that `typescript` is installed as well.',
            'You need to reopen VS Code after installing tslint.',
        ].join('\n');
    }
}
function isJsDocument(filePath) {
    return filePath.match(/\.jsx?$/i);
}
function isExcludedFromLinterOptions(config, fileName) {
    if (config === undefined || config.linterOptions === undefined || config.linterOptions.exclude === undefined) {
        return false;
    }
    return config.linterOptions.exclude.some((pattern) => testForExclusionPattern(fileName, pattern));
}
function getConfigurationFailureMessage(err) {
    let errorMessage = `unknown error`;
    if (typeof err.message === 'string' || err.message instanceof String) {
        errorMessage = err.message;
    }
    return `vscode-tslint: Cannot read tslint configuration - '${errorMessage}'`;
}
//# sourceMappingURL=runner.js.map