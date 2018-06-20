"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const xml2js_1 = require("xml2js");
const utils_1 = require("../../utils");
const getErrorMessage = (pickedProjFile) => {
    const extension = utils_1.getProjFileExtension(pickedProjFile);
    const fileDescription = extension ? `.${extension}` : 'project';
    return `Failed to write an updated ${fileDescription} file. Please try again later.`;
};
function writeFile({ pickedProjFile, contents, selectedPackageName, selectedVersion, originalContents = '' }) {
    return new Promise((resolve, reject) => {
        const xmlBuilder = new xml2js_1.Builder({
            headless: utils_1.isHeadlessXML(originalContents)
        });
        let xml;
        try {
            xml = xmlBuilder.buildObject(contents);
        }
        catch (ex) {
            return utils_1.handleError(ex, getErrorMessage(pickedProjFile), reject);
        }
        fs.writeFile(pickedProjFile, xml, (err) => {
            if (err) {
                return utils_1.handleError(err, getErrorMessage(pickedProjFile), reject);
            }
            return resolve(`Success! Wrote ${selectedPackageName}@${selectedVersion} to ${pickedProjFile}. Run dotnet restore to update your project.`);
        });
    });
}
exports.default = writeFile;
//# sourceMappingURL=writeFile.js.map