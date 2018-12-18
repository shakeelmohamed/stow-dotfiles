"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
let loadStartTime = Date.now();
const assert = require("assert");
const path = require("path");
const request = require("request-promise-native");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const main_1 = require("vscode-languageclient/lib/main");
const acr_logs_1 = require("./commands/azureCommands/acr-logs");
const logFileManager_1 = require("./commands/azureCommands/acr-logs-utils/logFileManager");
const create_registry_1 = require("./commands/azureCommands/create-registry");
const delete_image_1 = require("./commands/azureCommands/delete-image");
const delete_registry_1 = require("./commands/azureCommands/delete-registry");
const delete_repository_1 = require("./commands/azureCommands/delete-repository");
const pull_from_azure_1 = require("./commands/azureCommands/pull-from-azure");
const quick_build_1 = require("./commands/azureCommands/quick-build");
const run_task_1 = require("./commands/azureCommands/run-task");
const show_task_1 = require("./commands/azureCommands/show-task");
const showTaskManager_1 = require("./commands/azureCommands/task-utils/showTaskManager");
const build_image_1 = require("./commands/build-image");
const docker_compose_1 = require("./commands/docker-compose");
const inspect_image_1 = require("./commands/inspect-image");
const open_shell_container_1 = require("./commands/open-shell-container");
const push_image_1 = require("./commands/push-image");
const registrySettings_1 = require("./commands/registrySettings");
const remove_container_1 = require("./commands/remove-container");
const remove_image_1 = require("./commands/remove-image");
const restart_container_1 = require("./commands/restart-container");
const showlogs_container_1 = require("./commands/showlogs-container");
const start_container_1 = require("./commands/start-container");
const stop_container_1 = require("./commands/stop-container");
const system_prune_1 = require("./commands/system-prune");
const tag_image_1 = require("./commands/tag-image");
const docker_endpoint_1 = require("./commands/utils/docker-endpoint");
const TerminalProvider_1 = require("./commands/utils/TerminalProvider");
const configDebugProvider_1 = require("./configureWorkspace/configDebugProvider");
const configure_1 = require("./configureWorkspace/configure");
const registerDebugger_1 = require("./debugging/coreclr/registerDebugger");
const dockerComposeCompletionItemProvider_1 = require("./dockerCompose/dockerComposeCompletionItemProvider");
const dockerComposeHoverProvider_1 = require("./dockerCompose/dockerComposeHoverProvider");
const dockerComposeKeyInfo_1 = require("./dockerCompose/dockerComposeKeyInfo");
const dockerComposeParser_1 = require("./dockerCompose/dockerComposeParser");
const dockerfileCompletionItemProvider_1 = require("./dockerfile/dockerfileCompletionItemProvider");
const dockerInspect_1 = require("./documentContentProviders/dockerInspect");
const azureAccountWrapper_1 = require("./explorer/deploy/azureAccountWrapper");
const util = require("./explorer/deploy/util");
const webAppCreator_1 = require("./explorer/deploy/webAppCreator");
const dockerExplorer_1 = require("./explorer/dockerExplorer");
const customRegistries_1 = require("./explorer/models/customRegistries");
const nodeBase_1 = require("./explorer/models/nodeBase");
const browseAzurePortal_1 = require("./explorer/utils/browseAzurePortal");
const dockerHubUtils_1 = require("./explorer/utils/dockerHubUtils");
const wrapError_1 = require("./explorer/utils/wrapError");
const extensionVariables_1 = require("./extensionVariables");
const telemetry_1 = require("./telemetry/telemetry");
const addUserAgent_1 = require("./utils/addUserAgent");
const azureUtilityManager_1 = require("./utils/azureUtilityManager");
const getTrustedCertificates_1 = require("./utils/getTrustedCertificates");
const keytar_1 = require("./utils/keytar");
exports.FROM_DIRECTIVE_PATTERN = /^\s*FROM\s*([\w-\/:]*)(\s*AS\s*[a-z][a-z0-9-_\\.]*)?$/i;
exports.COMPOSE_FILE_GLOB_PATTERN = '**/[dD][oO][cC][kK][eE][rR]-[cC][oO][mM][pP][oO][sS][eE]*.{[yY][aA][mM][lL],[yY][mM][lL]}';
exports.DOCKERFILE_GLOB_PATTERN = '**/{*.[dD][oO][cC][kK][eE][rR][fF][iI][lL][eE],[dD][oO][cC][kK][eE][rR][fF][iI][lL][eE]}';
exports.YAML_GLOB_PATTERN = '**/*.{[yY][aA][mM][lL],[yY][mM][lL]}';
let client;
const DOCUMENT_SELECTOR = [
    { language: 'dockerfile', scheme: 'file' }
];
function initializeExtensionVariables(ctx) {
    if (!extensionVariables_1.ext.ui) {
        // This allows for standard interactions with the end user (as opposed to test input)
        extensionVariables_1.ext.ui = new vscode_azureextensionui_1.AzureUserInput(ctx.globalState);
    }
    extensionVariables_1.ext.context = ctx;
    extensionVariables_1.ext.outputChannel = util.getOutputChannel();
    if (!extensionVariables_1.ext.terminalProvider) {
        extensionVariables_1.ext.terminalProvider = new TerminalProvider_1.DefaultTerminalProvider();
    }
    telemetry_1.initializeTelemetryReporter(vscode_azureextensionui_1.createTelemetryReporter(ctx));
    extensionVariables_1.ext.reporter = telemetry_1.reporter;
    if (!extensionVariables_1.ext.keytar) {
        extensionVariables_1.ext.keytar = keytar_1.Keytar.tryCreate();
    }
    vscode_azureextensionui_1.registerUIExtensionVariables(extensionVariables_1.ext);
}
async function activate(ctx) {
    let activateStartTime = Date.now();
    initializeExtensionVariables(ctx);
    await setRequestDefaults();
    await vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('docker.activate', async function () {
        this.properties.isActivationEvent = 'true';
        this.measurements.mainFileLoad = (loadEndTime - loadStartTime) / 1000;
        this.measurements.mainFileLoadedToActivate = (activateStartTime - loadEndTime) / 1000;
        ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, new dockerfileCompletionItemProvider_1.DockerfileCompletionItemProvider(), '.'));
        const YAML_MODE_ID = {
            language: 'yaml',
            scheme: 'file',
            pattern: exports.COMPOSE_FILE_GLOB_PATTERN
        };
        let yamlHoverProvider = new dockerComposeHoverProvider_1.DockerComposeHoverProvider(new dockerComposeParser_1.DockerComposeParser(), dockerComposeKeyInfo_1.default.All);
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(YAML_MODE_ID, yamlHoverProvider));
        ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(YAML_MODE_ID, new dockerComposeCompletionItemProvider_1.DockerComposeCompletionItemProvider(), "."));
        ctx.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(dockerInspect_1.SCHEME, new dockerInspect_1.default()));
        ctx.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(logFileManager_1.LogContentProvider.scheme, new logFileManager_1.LogContentProvider()));
        ctx.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(showTaskManager_1.TaskContentProvider.scheme, new showTaskManager_1.TaskContentProvider()));
        registerDockerCommands();
        ctx.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('docker', new configDebugProvider_1.DockerDebugConfigProvider()));
        registerDebugger_1.registerDebugConfigurationProvider(ctx);
        await registrySettings_1.consolidateDefaultRegistrySettings();
        activateLanguageClient(ctx);
        // Start loading the Azure account after we're completely done activating.
        setTimeout(
        // Do not wait
        // tslint:disable-next-line:promise-function-async
        () => azureUtilityManager_1.AzureUtilityManager.getInstance().tryGetAzureAccount(), 1);
    });
}
exports.activate = activate;
async function setRequestDefaults() {
    // Set up the user agent for all direct 'request' calls in the extension (as long as they use ext.request)
    // ...  Trusted root certificate authorities
    let caList = await getTrustedCertificates_1.getTrustedCertificates();
    let defaultRequestOptions = { agentOptions: { ca: caList } };
    // ... User agent
    addUserAgent_1.addUserAgent(defaultRequestOptions);
    let requestWithDefaults = request.defaults(defaultRequestOptions);
    // Wrap 'get' to provide better error message for self-signed certificates
    let originalGet = requestWithDefaults.get;
    // tslint:disable-next-line:no-any
    async function wrappedGet(...args) {
        try {
            // tslint:disable-next-line: no-unsafe-any
            return await originalGet.call(this, ...args);
        }
        catch (err) {
            let error = err;
            if (error && error.cause && error.cause.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
                err = wrapError_1.wrapError(err, `There was a problem verifying a certificate. This could be caused by a self-signed or corporate certificate. You may need to set the 'docker.importCertificates' setting to true.`);
            }
            throw err;
        }
    }
    // tslint:disable-next-line:no-any
    requestWithDefaults.get = wrappedGet;
    extensionVariables_1.ext.request = requestWithDefaults;
}
async function createWebApp(context) {
    assert(!!context, "Should not be available through command palette");
    let azureAccount = await azureUtilityManager_1.AzureUtilityManager.getInstance().requireAzureAccount();
    const azureAccountWrapper = new azureAccountWrapper_1.AzureAccountWrapper(extensionVariables_1.ext.context, azureAccount);
    const wizard = new webAppCreator_1.WebAppCreator(extensionVariables_1.ext.outputChannel, azureAccountWrapper, context);
    const result = await wizard.run();
    if (result.status === 'Faulted') {
        throw result.error;
    }
    else if (result.status === 'Cancelled') {
        throw new vscode_azureextensionui_1.UserCancelledError();
    }
}
// Remove this when https://github.com/Microsoft/vscode-docker/issues/445 fixed
function registerCommand(commandId, 
// tslint:disable-next-line: no-any
callback) {
    return vscode_azureextensionui_1.registerCommand(commandId, 
    // tslint:disable-next-line:no-function-expression no-any
    async function (...args) {
        if (args.length) {
            let properties = this.properties;
            const contextArg = args[0];
            if (contextArg instanceof nodeBase_1.NodeBase) {
                properties.contextValue = contextArg.contextValue;
            }
            else if (contextArg instanceof vscode.Uri) {
                properties.contextValue = "Uri";
            }
        }
        return callback.call(this, ...args);
    });
}
// tslint:disable-next-line:max-func-body-length
function registerDockerCommands() {
    exports.dockerExplorerProvider = new dockerExplorer_1.DockerExplorerProvider();
    vscode.window.registerTreeDataProvider('dockerExplorer', exports.dockerExplorerProvider);
    registerCommand('vscode-docker.acr.createRegistry', create_registry_1.createRegistry);
    registerCommand('vscode-docker.acr.deleteImage', delete_image_1.deleteAzureImage);
    registerCommand('vscode-docker.acr.deleteRegistry', delete_registry_1.deleteAzureRegistry);
    registerCommand('vscode-docker.acr.deleteRepository', delete_repository_1.deleteRepository);
    registerCommand('vscode-docker.acr.pullImage', pull_from_azure_1.pullFromAzure);
    registerCommand('vscode-docker.acr.quickBuild', async function (item) { await quick_build_1.quickBuild(this, item); });
    registerCommand('vscode-docker.acr.runTask', run_task_1.runTask);
    registerCommand("vscode-docker.acr.runTaskFile", run_task_1.runTaskFile);
    registerCommand('vscode-docker.acr.showTask', show_task_1.showTaskProperties);
    registerCommand('vscode-docker.acr.untagImage', delete_image_1.untagAzureImage);
    registerCommand('vscode-docker.acr.viewLogs', acr_logs_1.viewACRLogs);
    registerCommand('vscode-docker.api.configure', async function (options) { await configure_1.configureApi(this, options); });
    registerCommand('vscode-docker.browseDockerHub', (context) => { dockerHubUtils_1.browseDockerHub(context); });
    registerCommand('vscode-docker.browseAzurePortal', (context) => { browseAzurePortal_1.browseAzurePortal(context); });
    registerCommand('vscode-docker.compose.down', docker_compose_1.composeDown);
    registerCommand('vscode-docker.compose.restart', docker_compose_1.composeRestart);
    registerCommand('vscode-docker.compose.up', docker_compose_1.composeUp);
    registerCommand('vscode-docker.configure', async function () { await configure_1.configure(this, undefined); });
    registerCommand('vscode-docker.connectCustomRegistry', customRegistries_1.connectCustomRegistry);
    registerCommand('vscode-docker.container.open-shell', async function (node) { await open_shell_container_1.openShellContainer(this, node); });
    registerCommand('vscode-docker.container.remove', async function (node) { await remove_container_1.removeContainer(this, node); });
    registerCommand('vscode-docker.container.restart', async function (node) { await restart_container_1.restartContainer(this, node); });
    registerCommand('vscode-docker.container.show-logs', async function (node) { await showlogs_container_1.showLogsContainer(this, node); });
    registerCommand('vscode-docker.container.start', async function (node) { await start_container_1.startContainer(this, node); });
    registerCommand('vscode-docker.container.start.azurecli', async function () { await start_container_1.startAzureCLI(this); });
    registerCommand('vscode-docker.container.start.interactive', async function (node) { await start_container_1.startContainerInteractive(this, node); });
    registerCommand('vscode-docker.container.stop', async function (node) { await stop_container_1.stopContainer(this, node); });
    registerCommand('vscode-docker.createWebApp', async (context) => await createWebApp(context));
    registerCommand('vscode-docker.disconnectCustomRegistry', customRegistries_1.disconnectCustomRegistry);
    registerCommand('vscode-docker.dockerHubLogout', dockerHubUtils_1.dockerHubLogout);
    registerCommand('vscode-docker.explorer.refresh', () => exports.dockerExplorerProvider.refresh());
    registerCommand('vscode-docker.image.build', async function (item) { await build_image_1.buildImage(this, item); });
    registerCommand('vscode-docker.image.inspect', async function (node) { await inspect_image_1.default(this, node); });
    registerCommand('vscode-docker.image.push', async function (node) { await push_image_1.pushImage(this, node); });
    registerCommand('vscode-docker.image.remove', async function (node) { await remove_image_1.removeImage(this, node); });
    registerCommand('vscode-docker.image.tag', async function (node) { await tag_image_1.tagImage(this, node); });
    registerCommand('vscode-docker.setRegistryAsDefault', registrySettings_1.setRegistryAsDefault);
    registerCommand('vscode-docker.system.prune', system_prune_1.systemPrune);
}
async function deactivate() {
    if (!client) {
        return undefined;
    }
    // perform cleanup
    Configuration.dispose();
    return await client.stop();
}
exports.deactivate = deactivate;
var Configuration;
(function (Configuration) {
    let configurationListener;
    function computeConfiguration(params) {
        let result = [];
        for (let item of params.items) {
            let config;
            if (item.scopeUri) {
                config = vscode.workspace.getConfiguration(item.section, client.protocol2CodeConverter.asUri(item.scopeUri));
            }
            else {
                config = vscode.workspace.getConfiguration(item.section);
            }
            result.push(config);
        }
        return result;
    }
    Configuration.computeConfiguration = computeConfiguration;
    function initialize() {
        configurationListener = vscode.workspace.onDidChangeConfiguration((e) => {
            // notify the language server that settings have change
            client.sendNotification(main_1.DidChangeConfigurationNotification.type, {
                settings: null
            });
            // Update endpoint and refresh explorer if needed
            if (e.affectsConfiguration('docker')) {
                docker_endpoint_1.docker.refreshEndpoint();
                // tslint:disable-next-line: no-floating-promises
                setRequestDefaults();
                vscode.commands.executeCommand('vscode-docker.explorer.refresh');
            }
        });
    }
    Configuration.initialize = initialize;
    function dispose() {
        if (configurationListener) {
            // remove this listener when disposed
            configurationListener.dispose();
        }
    }
    Configuration.dispose = dispose;
})(Configuration || (Configuration = {}));
function activateLanguageClient(ctx) {
    let serverModule = ctx.asAbsolutePath(path.join("node_modules", "dockerfile-language-server-nodejs", "lib", "server.js"));
    let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
    let serverOptions = {
        run: {
            module: serverModule,
            transport: main_1.TransportKind.ipc,
            args: ["--node-ipc"]
        },
        debug: {
            module: serverModule,
            transport: main_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    let middleware = {
        workspace: {
            configuration: Configuration.computeConfiguration
        }
    };
    let clientOptions = {
        documentSelector: DOCUMENT_SELECTOR,
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc")
        },
        middleware: middleware
    };
    client = new main_1.LanguageClient("dockerfile-langserver", "Dockerfile Language Server", serverOptions, clientOptions);
    // tslint:disable-next-line:no-floating-promises
    client.onReady().then(() => {
        // attach the VS Code settings listener
        Configuration.initialize();
    });
    client.start();
}
let loadEndTime = Date.now();
//# sourceMappingURL=dockerExtension.js.map