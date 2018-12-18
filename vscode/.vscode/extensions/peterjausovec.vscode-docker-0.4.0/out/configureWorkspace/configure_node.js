"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const configure_1 = require("./configure");
exports.configureNode = {
    genDockerFile,
    genDockerCompose,
    genDockerComposeDebug,
    defaultPort: '3000'
};
function genDockerFile(serviceNameAndRelativePath, platform, os, port, { cmd, author, version, artifactName }) {
    let exposeStatements = configure_1.getExposeStatements(port);
    return `FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
${exposeStatements}
CMD ${cmd}`;
}
function genDockerCompose(serviceNameAndRelativePath, platform, os, port) {
    return `version: '2.1'

services:
  ${serviceNameAndRelativePath}:
    image: ${serviceNameAndRelativePath}
    build: .
    environment:
      NODE_ENV: production
    ports:
      - ${port}:${port}`;
}
function genDockerComposeDebug(serviceNameAndRelativePath, platform, os, port, { fullCommand: cmd }) {
    const cmdArray = cmd.split(' ');
    if (cmdArray[0].toLowerCase() === 'node') {
        cmdArray.splice(1, 0, '--inspect=0.0.0.0:9229');
        cmd = `command: ${cmdArray.join(' ')}`;
    }
    else {
        cmd = '## set your startup file here\n    command: node --inspect index.js';
    }
    return `version: '2.1'

services:
  ${serviceNameAndRelativePath}:
    image: ${serviceNameAndRelativePath}
    build: .
    environment:
      NODE_ENV: development
    ports:
      - ${port}:${port}
      - 9229:9229
    ${cmd}`;
}
//# sourceMappingURL=configure_node.js.map