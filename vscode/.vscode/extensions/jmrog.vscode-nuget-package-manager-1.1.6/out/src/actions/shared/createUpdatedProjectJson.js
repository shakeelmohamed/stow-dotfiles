"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
/**
 * Generates a new JSON representation of the project file using `parsedProjectFile` as a basis.
 * Any property that is altered is cloned first to prevent mutating the original parsing output,
 * since mutating inside a utility method seems pretty risky.
 *
 * @param {Object} parsedProjectFile - JSON representation of the current project file on disk;
 *  must have a top-level `Project` property
 * @param {string} selectedPackageName - name of package being added
 * @param {string} selectedVersion - version string for package being added
 */
function createUpdatedProjectJson(parsedProjectFile, selectedPackageName, selectedVersion) {
    if (!parsedProjectFile || !utils_1.isPlainObject(parsedProjectFile.Project)) {
        // We don't try to create this, as its absence suggests something is terribly wrong.
        throw new TypeError('Cannot locate the project root in your project file. Please fix this issue and try again.');
    }
    const itemGroups = parsedProjectFile.Project.ItemGroup ? [...parsedProjectFile.Project.ItemGroup] : [];
    const existingItemWithPackageRefs = itemGroups.find((group) => Array.isArray(group.PackageReference));
    const newItemWithPackageRefs = !existingItemWithPackageRefs ? { PackageReference: [] } : Object.assign({}, existingItemWithPackageRefs, { PackageReference: [...existingItemWithPackageRefs.PackageReference] });
    const packageReferences = newItemWithPackageRefs.PackageReference;
    const existingReference = packageReferences.find((ref) => ref.$ && ref.$.Include === selectedPackageName);
    const newReference = {
        $: {
            Include: selectedPackageName,
            Version: selectedVersion
        }
    };
    // Update `packageReferences`.
    if (!existingReference) {
        packageReferences.push(newReference);
    }
    else {
        packageReferences[packageReferences.indexOf(existingReference)] = newReference;
    }
    // Update `itemGroups`.
    if (!existingItemWithPackageRefs) {
        itemGroups.push(newItemWithPackageRefs);
    }
    else {
        itemGroups[itemGroups.indexOf(existingItemWithPackageRefs)] = newItemWithPackageRefs;
    }
    return Object.assign({}, parsedProjectFile, { Project: Object.assign({}, parsedProjectFile.Project, { ItemGroup: itemGroups }) });
}
exports.default = createUpdatedProjectJson;
//# sourceMappingURL=createUpdatedProjectJson.js.map