"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const dockerExtension_1 = require("../../dockerExtension");
const acrTools = require("../../utils/Azure/acrTools");
const repository_1 = require("../../utils/Azure/models/repository");
const quick_pick_azure_1 = require("../utils/quick-pick-azure");
/**
 * function to delete an Azure repository and its associated images
 * @param context : if called through right click on AzureRepositoryNode, the node object will be passed in. See azureRegistryNodes.ts for more info
 */
async function deleteRepository(context) {
    let registry;
    let repo;
    if (context) {
        registry = context.registry;
        repo = await repository_1.Repository.Create(registry, context.label);
    }
    else {
        registry = await quick_pick_azure_1.quickPickACRRegistry();
        repo = await quick_pick_azure_1.quickPickACRRepository(registry, 'Select the repository you want to delete');
    }
    const shouldDelete = await quick_pick_azure_1.confirmUserIntent(`Are you sure you want to delete ${repo.name} and its associated images?`);
    if (shouldDelete) {
        await acrTools.deleteRepository(repo);
        vscode.window.showInformationMessage(`Successfully deleted repository ${repo.name}`);
        if (context) {
            dockerExtension_1.dockerExplorerProvider.refreshNode(context.parent);
        }
        else {
            dockerExtension_1.dockerExplorerProvider.refreshRegistries();
        }
    }
}
exports.deleteRepository = deleteRepository;
//# sourceMappingURL=delete-repository.js.map