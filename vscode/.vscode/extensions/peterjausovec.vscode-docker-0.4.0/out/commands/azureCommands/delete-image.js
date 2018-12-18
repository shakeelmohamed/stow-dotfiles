"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const dockerExtension_1 = require("../../dockerExtension");
const extensionVariables_1 = require("../../extensionVariables");
const acrTools = require("../../utils/Azure/acrTools");
const image_1 = require("../../utils/Azure/models/image");
const repository_1 = require("../../utils/Azure/models/repository");
const quickPicks = require("../utils/quick-pick-azure");
/** Function to untag an Azure hosted image
 * @param context : if called through right click on AzureImageNode, the node object will be passed in. See azureRegistryNodes.ts for more info
 */
async function untagAzureImage(context) {
    let registry;
    let repo;
    let image;
    if (!context) {
        registry = await quickPicks.quickPickACRRegistry();
        repo = await quickPicks.quickPickACRRepository(registry, `Select the repository of the image you want to untag`);
        image = await quickPicks.quickPickACRImage(repo, `Select the image you want to untag`);
    }
    else {
        registry = context.registry;
        let wholeName = context.label.split(':');
        repo = await repository_1.Repository.Create(registry, wholeName[0]);
        image = new image_1.AzureImage(repo, wholeName[1]);
    }
    const shouldDelete = await extensionVariables_1.ext.ui.showWarningMessage(`Are you sure you want to untag '${image.toString()}'? This does not delete the manifest referenced by the tag.`, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
    if (shouldDelete === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
        await acrTools.untagImage(image);
        vscode.window.showInformationMessage(`Successfully untagged '${image.toString()}'`);
        if (context) {
            dockerExtension_1.dockerExplorerProvider.refreshNode(context.parent);
        }
        else {
            dockerExtension_1.dockerExplorerProvider.refreshRegistries();
        }
    }
}
exports.untagAzureImage = untagAzureImage;
/** Function to delete an Azure hosted image
 * @param context : if called through right click on AzureImageNode, the node object will be passed in. See azureRegistryNodes.ts for more info
 */
async function deleteAzureImage(context) {
    let registry;
    let repo;
    let image;
    if (!context) {
        registry = await quickPicks.quickPickACRRegistry();
        repo = await quickPicks.quickPickACRRepository(registry, `Select the repository of the image you want to delete`);
        image = await quickPicks.quickPickACRImage(repo, `Select the image you want to delete`);
    }
    else {
        registry = context.registry;
        let wholeName = context.label.split(':');
        repo = await repository_1.Repository.Create(registry, wholeName[0]);
        image = new image_1.AzureImage(repo, wholeName[1]);
    }
    const digest = await acrTools.getImageDigest(image);
    const images = await acrTools.getImagesByDigest(repo, digest);
    const imageList = images.join(', ');
    const shouldDelete = await extensionVariables_1.ext.ui.showWarningMessage(`Are you sure you want to delete the manifest '${digest}' and the associated image(s): ${imageList}?`, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
    if (shouldDelete === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
        await acrTools.deleteImage(repo, digest);
        vscode.window.showInformationMessage(`Successfully deleted manifest '${digest}' and the associated image(s): ${imageList}.`);
        if (context) {
            dockerExtension_1.dockerExplorerProvider.refreshNode(context.parent);
        }
        else {
            dockerExtension_1.dockerExplorerProvider.refreshRegistries();
        }
    }
}
exports.deleteAzureImage = deleteAzureImage;
//# sourceMappingURL=delete-image.js.map