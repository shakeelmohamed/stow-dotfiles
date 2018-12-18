"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const https = require("https");
const path = require("path");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const extensionVariables_1 = require("../extensionVariables");
const async_1 = require("../helpers/async");
const osVersion_1 = require("../helpers/osVersion");
let _systemCertificates;
const defaultCertificatePaths = [
    "/etc/ssl/certs/ca-certificates",
    "/etc/openssl/certs",
    "/etc/pki/tls/certs",
    "/usr/local/share/certs"
];
async function getTrustedCertificates() {
    // tslint:disable-next-line:no-function-expression
    return vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('docker.certificates', async function () {
        this.suppressTelemetry = true;
        let importSetting = vscode.workspace.getConfiguration('docker').get('importCertificates');
        if (importSetting === false) {
            // Use default Node.js behavior
            this.properties.importCertificates = 'false';
            return undefined;
        }
        let useCertificateStore;
        let certificatePaths;
        if (importSetting === true) {
            this.properties.importCertificates = 'true';
            useCertificateStore = true;
            certificatePaths = defaultCertificatePaths;
        }
        else {
            this.properties.importCertificates = 'custom';
            useCertificateStore = !!importSetting.useCertificateStore;
            certificatePaths = importSetting.certificatePaths || [];
        }
        this.properties.useCertStore = String(useCertificateStore);
        let systemCerts = useCertificateStore ? getCertificatesFromSystem() : [];
        let filesCerts;
        this.properties.certPathsCount = String(certificatePaths.length);
        filesCerts = await getCertificatesFromPaths(certificatePaths);
        this.properties.systemCertsCount = String(systemCerts.length);
        this.properties.fileCertsCount = String(filesCerts.length);
        let certificates = systemCerts;
        certificates.push(...filesCerts);
        return certificates;
    });
}
exports.getTrustedCertificates = getTrustedCertificates;
async function getCertificatesFromPaths(paths) {
    let certs = [];
    for (let certPath of paths) {
        if (!path.isAbsolute(certPath)) {
            // tslint:disable-next-line: no-floating-promises
            extensionVariables_1.ext.ui.showWarningMessage(`Certificate path "${certPath}" is not an absolute path, ignored.`);
        }
        else {
            let isFile = false;
            let isFolder = false;
            try {
                if (await fse.pathExists(certPath)) {
                    let stat = await fse.stat(certPath);
                    isFolder = stat.isDirectory();
                    isFile = stat.isFile();
                }
            }
            catch (_a) {
                // Ignore (could be permission issues, for instance)
            }
            let certFiles = [];
            if (isFolder) {
                let files = await async_1.globAsync('**', { absolute: true, nodir: true, cwd: certPath });
                certFiles.push(...files);
            }
            else if (isFile) {
                certFiles.push(certPath);
            }
            else {
                console.log(`Could not find certificate path "${certPath}.`);
            }
            for (let cf of certFiles) {
                certs.push(fse.readFileSync(cf));
            }
        }
    }
    return certs;
}
function getCertificatesFromSystem() {
    if (!_systemCertificates) {
        // {win,mac}-ca automatically read trusted certificate authorities from the system and place them into the global
        //   Node agent. We don't want them in the global agent because that will affect all other extensions
        //   loaded in the same process, which will make them behave inconsistently depending on whether we're loaded.
        let previousCertificateAuthorities = https.globalAgent.options.ca;
        let certificates = [];
        try {
            if (osVersion_1.isWindows()) {
                require('win-ca');
            }
            else if (osVersion_1.isMac()) {
                require('mac-ca');
            }
            else if (osVersion_1.isLinux()) {
            }
        }
        finally {
            certificates = https.globalAgent.options.ca;
            https.globalAgent.options.ca = previousCertificateAuthorities;
        }
        if (!certificates) {
            certificates = [];
        }
        else if (!Array.isArray(certificates)) {
            certificates = [certificates];
        }
        _systemCertificates = certificates;
    }
    return _systemCertificates;
}
//# sourceMappingURL=getTrustedCertificates.js.map