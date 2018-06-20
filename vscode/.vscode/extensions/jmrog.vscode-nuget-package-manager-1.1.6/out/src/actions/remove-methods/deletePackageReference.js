"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const xml2js_1 = require("xml2js");
const utils_1 = require("../../utils");
const constants_1 = require("../../constants");
const getErrorMessage = (projFileFullPath) => {
    const extension = utils_1.getProjFileExtension(projFileFullPath);
    const fileDescription = extension ? `.${extension}` : 'project';
    return `Failed to write an updated ${fileDescription} file. Please try again later.`;
};
function deletePackageReference({ projFileFullPath, selectedPackage, parsed, packageRefSection, originalContents = '' }) {
    if (!selectedPackage) {
        // Search canceled.
        return Promise.reject(constants_1.CANCEL);
    }
    return new Promise((resolve, reject) => {
        // Mutation of `parsed` is okay here, since we're dealing with a temporary in-memory JS representation.
        const [selectedPackageName, selectedPackageVersion] = selectedPackage.split(/\s/);
        const itemGroup = parsed.Project.ItemGroup;
        const packageRefSectionIdx = itemGroup.indexOf(packageRefSection);
        itemGroup[packageRefSectionIdx].PackageReference =
            packageRefSection.PackageReference.filter((ref) => !(ref.$.Include === selectedPackageName && ref.$.Version === selectedPackageVersion));
        if (itemGroup[packageRefSectionIdx].PackageReference.length === 0) {
            itemGroup.splice(packageRefSectionIdx, 1);
        }
        const xmlBuilder = new xml2js_1.Builder({
            headless: utils_1.isHeadlessXML(originalContents)
        });
        let xml;
        try {
            xml = xmlBuilder.buildObject(parsed);
        }
        catch (ex) {
            return utils_1.handleError(ex, getErrorMessage(projFileFullPath), reject);
        }
        fs.writeFile(projFileFullPath, xml, (err) => {
            if (err) {
                return utils_1.handleError(err, getErrorMessage(projFileFullPath), reject);
            }
            return resolve(`Success! Removed ${selectedPackageName}@${selectedPackageVersion} from ${projFileFullPath}. Run dotnet restore to update your project.`);
        });
    });
}
exports.default = deletePackageReference;
//# sourceMappingURL=deletePackageReference.js.map