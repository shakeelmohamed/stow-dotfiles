"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const xml2js_1 = require("xml2js");
const utils_1 = require("../../utils");
const getConstructedErrorMessage = (projFileFullPath, template) => {
    const extension = utils_1.getProjFileExtension(projFileFullPath);
    const fileDescription = extension ? `.${extension}` : 'project';
    return template.replace(/{{extension}}/g, fileDescription).replace(/{{projFileFullPath}}/g, projFileFullPath);
};
function readInstalledPackages(projFileFullPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(projFileFullPath, 'utf8', (err, data) => {
            if (err) {
                return utils_1.handleError(err, getConstructedErrorMessage(projFileFullPath, "Could not read your project's {{extension}} file (checked {{projFileFullPath}}). Please try again."), reject);
            }
            xml2js_1.parseString(data, (err, parsed = {}) => {
                if (err || !parsed) {
                    return utils_1.handleError(err, getConstructedErrorMessage(projFileFullPath, `Could not parse the {{extension}} file at {{projFileFullPath}}. Please try again.`), reject);
                }
                const project = parsed.Project || {};
                const itemGroup = project.ItemGroup || [];
                const packageRefSection = itemGroup.find((group) => group.PackageReference);
                if (!packageRefSection || !packageRefSection.PackageReference.length) {
                    return reject(`Could not locate package references in ${projFileFullPath}. Please try again.`);
                }
                const installedPackages = packageRefSection.PackageReference.map((ref) => `${ref.$.Include} ${ref.$.Version}`);
                return resolve({
                    projFileFullPath,
                    installedPackages,
                    packageRefSection,
                    parsed,
                    originalContents: data
                });
            });
        });
    });
}
exports.default = readInstalledPackages;
//# sourceMappingURL=readInstalledPackages.js.map