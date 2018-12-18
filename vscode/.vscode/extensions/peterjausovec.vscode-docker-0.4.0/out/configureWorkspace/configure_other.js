"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureOther = {
    genDockerFile,
    genDockerCompose,
    genDockerComposeDebug,
    defaultPort: '3000'
};
function genDockerFile(serviceNameAndRelativePath, platform, os, port, { cmd, author, version, artifactName }) {
    return `FROM docker/whalesay:latest
LABEL Name=${serviceNameAndRelativePath} Version=${version}
RUN apt-get -y update && apt-get install -y fortunes
CMD /usr/games/fortune -a | cowsay
`;
}
function genDockerCompose(serviceNameAndRelativePath, platform, os, port) {
    return `version: '2.1'

services:
  ${serviceNameAndRelativePath}:
    image: ${serviceNameAndRelativePath}
    build: .
    ports:
      - ${port}:${port}
`;
}
function genDockerComposeDebug(serviceNameAndRelativePath, platform, os, port, { fullCommand: cmd }) {
    return `version: '2.1'

services:
  ${serviceNameAndRelativePath}:
    image: ${serviceNameAndRelativePath}
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - ${port}:${port}
`;
}
//# sourceMappingURL=configure_other.js.map