"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
const fse = require("fs-extra");
const os = require("os");
const tar = require("tar");
const url = require("url");
const extensionVariables_1 = require("../../extensionVariables");
const acrTools_1 = require("../../utils/Azure/acrTools");
const azureUtilityManager_1 = require("../../utils/azureUtilityManager");
const quick_pick_azure_1 = require("./quick-pick-azure");
const quick_pick_image_1 = require("./quick-pick-image");
const quickPickWorkspaceFolder_1 = require("./quickPickWorkspaceFolder");
const idPrecision = 6;
const vcsIgnoreList = ['.git', '.gitignore', '.bzr', 'bzrignore', '.hg', '.hgignore', '.svn'];
async function scheduleRunRequest(fileUri, requestType, actionContext) {
    //Acquire information.
    let rootFolder;
    let fileItem;
    if (requestType === 'DockerBuildRequest') {
        rootFolder = await quickPickWorkspaceFolder_1.quickPickWorkspaceFolder("To quick build Docker files you must first open a folder or workspace in VS Code.");
        fileItem = await quick_pick_image_1.quickPickDockerFileItem(actionContext, fileUri, rootFolder);
    }
    else if (requestType === 'FileTaskRunRequest') {
        rootFolder = await quickPickWorkspaceFolder_1.quickPickWorkspaceFolder("To run a task from a .yaml file you must first open a folder or workspace in VS Code.");
        fileItem = await quick_pick_image_1.quickPickYamlFileItem(fileUri, rootFolder);
    }
    else {
        throw new Error("Run Request Type Currently not supported.");
    }
    const subscription = await quick_pick_azure_1.quickPickSubscription();
    const registry = await quick_pick_azure_1.quickPickACRRegistry(true);
    const osPick = ['Linux', 'Windows'].map(item => ({ label: item, data: item }));
    const osType = (await extensionVariables_1.ext.ui.showQuickPick(osPick, { 'canPickMany': false, 'placeHolder': 'Select image base OS' })).data;
    const resourceGroupName = acrTools_1.getResourceGroupName(registry);
    const tarFilePath = getTempSourceArchivePath();
    const client = await azureUtilityManager_1.AzureUtilityManager.getInstance().getContainerRegistryManagementClient(subscription);
    //Prepare to run.
    extensionVariables_1.ext.outputChannel.show();
    const uploadedSourceLocation = await uploadSourceCode(client, registry.name, resourceGroupName, rootFolder, tarFilePath);
    extensionVariables_1.ext.outputChannel.appendLine("Uploaded source code to " + tarFilePath);
    let runRequest;
    if (requestType === 'DockerBuildRequest') {
        const imageName = await quick_pick_image_1.quickPickImageName(actionContext, rootFolder, fileItem);
        runRequest = {
            type: requestType,
            imageNames: [imageName],
            isPushEnabled: true,
            sourceLocation: uploadedSourceLocation,
            platform: { os: osType },
            dockerFilePath: fileItem.relativeFilePath
        };
    }
    else {
        runRequest = {
            type: 'FileTaskRunRequest',
            taskFilePath: fileItem.relativeFilePath,
            sourceLocation: uploadedSourceLocation,
            platform: { os: osType }
        };
    }
    //Schedule the run and Clean up.
    extensionVariables_1.ext.outputChannel.appendLine("Set up run request");
    const run = await client.registries.scheduleRun(resourceGroupName, registry.name, runRequest);
    extensionVariables_1.ext.outputChannel.appendLine("Scheduled run " + run.runId);
    await acrTools_1.streamLogs(registry, run, client);
    await fse.unlink(tarFilePath);
}
exports.scheduleRunRequest = scheduleRunRequest;
async function uploadSourceCode(client, registryName, resourceGroupName, rootFolder, tarFilePath) {
    extensionVariables_1.ext.outputChannel.appendLine("   Sending source code to temp file");
    let source = rootFolder.uri.fsPath;
    let items = await fse.readdir(source);
    items = items.filter(i => !(i in vcsIgnoreList));
    // tslint:disable-next-line:no-unsafe-any
    tar.c({ cwd: source }, items).pipe(fse.createWriteStream(tarFilePath));
    extensionVariables_1.ext.outputChannel.appendLine("   Getting build source upload URL ");
    let sourceUploadLocation = await client.registries.getBuildSourceUploadUrl(resourceGroupName, registryName);
    let upload_url = sourceUploadLocation.uploadUrl;
    let relative_path = sourceUploadLocation.relativePath;
    extensionVariables_1.ext.outputChannel.appendLine("   Getting blob info from upload URL ");
    // Right now, accountName and endpointSuffix are unused, but will be used for streaming logs later.
    let blobInfo = acrTools_1.getBlobInfo(upload_url);
    extensionVariables_1.ext.outputChannel.appendLine("   Creating blob service ");
    let blob = azure_storage_1.createBlobServiceWithSas(blobInfo.host, blobInfo.sasToken);
    extensionVariables_1.ext.outputChannel.appendLine("   Creating block blob ");
    blob.createBlockBlobFromLocalFile(blobInfo.containerName, blobInfo.blobName, tarFilePath, () => { });
    return relative_path;
}
function getTempSourceArchivePath() {
    /* tslint:disable-next-line:insecure-random */
    const id = Math.floor(Math.random() * Math.pow(10, idPrecision));
    const archive = `sourceArchive${id}.tar.gz`;
    extensionVariables_1.ext.outputChannel.appendLine(`Setting up temp file with '${archive}'`);
    const tarFilePath = url.resolve(os.tmpdir(), archive);
    return tarFilePath;
}
//# sourceMappingURL=SourceArchiveUtility.js.map