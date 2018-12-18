"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const docker_endpoint_1 = require("../commands/utils/docker-endpoint");
exports.IMAGE_DOMAIN = "image";
exports.SCHEME = "docker-inspect";
exports.URI_EXTENSION = ".json";
class DockerInspectDocumentContentProvider {
    static async openImageInspectDocument(image) {
        const imageName = image.RepoTags ? image.RepoTags[0] : image.Id;
        const uri = vscode_1.Uri.parse(`${exports.SCHEME}://${exports.IMAGE_DOMAIN}/${imageName}${exports.URI_EXTENSION}`);
        vscode_1.window.showTextDocument(await vscode_1.workspace.openTextDocument(uri));
    }
    // tslint:disable-next-line:promise-function-async // Grandfathered in
    provideTextDocumentContent({ path }) {
        return new Promise((resolve, reject) => {
            const imageName = path.substring(1).replace(exports.URI_EXTENSION, "");
            // tslint:disable-next-line:no-any
            docker_endpoint_1.docker.getImage(imageName).inspect((error, imageMetadata) => {
                resolve(JSON.stringify(imageMetadata, null, "    "));
            });
        });
    }
}
exports.default = DockerInspectDocumentContentProvider;
//# sourceMappingURL=dockerInspect.js.map