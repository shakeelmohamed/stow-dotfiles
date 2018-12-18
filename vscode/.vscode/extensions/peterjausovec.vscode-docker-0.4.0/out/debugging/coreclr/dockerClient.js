"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineBuilder_1 = require("./commandLineBuilder");
const lineSplitter_1 = require("./lineSplitter");
class CliDockerClient {
    constructor(processProvider) {
        this.processProvider = processProvider;
        // CONSIDER: Use dockerode client as basis for debugging.
    }
    async buildImage(options, progress) {
        options = options || {};
        let command = commandLineBuilder_1.default
            .create('docker', 'build', '--rm')
            .withNamedArg('-f', options.dockerfile)
            .withKeyValueArgs('--build-arg', options.args)
            .withKeyValueArgs('--label', options.labels)
            .withNamedArg('-t', options.tag)
            .withNamedArg('--target', options.target)
            .withQuotedArg(options.context)
            .build();
        let imageId;
        const lineSplitter = new lineSplitter_1.LineSplitter();
        lineSplitter.onLine(line => {
            // Expected output is: 'Successfully built 7cc5654ca3b6'
            const buildSuccessPrefix = 'Successfully built ';
            if (line.startsWith(buildSuccessPrefix)) {
                imageId = line.substr(buildSuccessPrefix.length, 12);
            }
        });
        const buildProgress = (content) => {
            if (progress) {
                progress(content);
            }
            lineSplitter.write(content);
        };
        await this.processProvider.exec(command, { progress: buildProgress });
        lineSplitter.close();
        if (!imageId) {
            throw new Error('The Docker image was built successfully but the image ID could not be retrieved.');
        }
        return imageId;
    }
    async getVersion(options) {
        options = options || {};
        const command = commandLineBuilder_1.default
            .create('docker', 'version')
            .withNamedArg('--format', options.format)
            .build();
        const result = await this.processProvider.exec(command, {});
        return result.stdout;
    }
    async inspectObject(nameOrId, options) {
        options = options || {};
        const command = commandLineBuilder_1.default
            .create('docker', 'inspect')
            .withNamedArg('--format', options.format)
            .withQuotedArg(nameOrId)
            .build();
        try {
            const output = await this.processProvider.exec(command, {});
            return output.stdout;
        }
        catch (_a) {
            // Failure (typically) means the object wasn't found...
            return undefined;
        }
    }
    async listContainers(options) {
        options = options || {};
        const command = commandLineBuilder_1.default
            .create('docker', 'ps', '-a')
            .withNamedArg('--format', options.format)
            .build();
        const output = await this.processProvider.exec(command, {});
        return output.stdout;
    }
    matchId(id1, id2) {
        const validateArgument = id => {
            if (id === undefined || id1.length < 12) {
                throw new Error(`'${id}' must be defined and at least 12 characters.`);
            }
        };
        validateArgument(id1);
        validateArgument(id2);
        return id1.length < id2.length
            ? id2.startsWith(id1)
            : id1.startsWith(id2);
    }
    async removeContainer(containerNameOrId, options) {
        options = options || {};
        const command = commandLineBuilder_1.default
            .create('docker', 'rm')
            .withFlagArg('--force', options.force)
            .withQuotedArg(containerNameOrId)
            .build();
        await this.processProvider.exec(command, {});
    }
    async runContainer(imageTagOrId, options) {
        options = options || {};
        const command = commandLineBuilder_1.default
            .create('docker', 'run', '-dt', '-P')
            .withNamedArg('--name', options.containerName)
            .withKeyValueArgs('-e', options.env)
            .withArrayArgs('--env-file', options.envFiles)
            .withKeyValueArgs('--label', options.labels)
            .withArrayArgs('-v', options.volumes, volume => `${volume.localPath}:${volume.containerPath}${volume.permissions ? ':' + volume.permissions : ''}`)
            .withNamedArg('--entrypoint', options.entrypoint)
            .withQuotedArg(imageTagOrId)
            .withArg(options.command)
            .build();
        const result = await this.processProvider.exec(command, {});
        // The '-d' option returns the container ID (with whitespace) upon completion.
        const containerId = result.stdout.trim();
        if (!containerId) {
            throw new Error('The Docker container was run successfully but the container ID could not be retrieved.');
        }
        return containerId;
    }
    trimId(id) {
        if (!id) {
            throw new Error('The ID to be trimmed must be non-empty.');
        }
        const trimmedId = id.trim();
        if (trimmedId.length < 12) {
            throw new Error('The ID to be trimmed must be at least 12 characters.');
        }
        return id.substring(0, 12);
    }
}
exports.CliDockerClient = CliDockerClient;
exports.default = CliDockerClient;
//# sourceMappingURL=dockerClient.js.map