"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const getTargetPathProjectFileContent = `<Project>
    <Target Name="GetTargetPath">
        <MSBuild
            Projects="$(ProjectFilename)"
            Targets="GetTargetPath">
        <Output
            TaskParameter="TargetOutputs"
            ItemName="TargetOutput" />
        </MSBuild>
        <WriteLinesToFile
            File="$(TargetOutputFilename)"
            Lines="@(TargetOutput)"
            Overwrite="True" />
    </Target>
</Project>`;
class MsBuildNetCoreProjectProvider {
    constructor(fsProvider, msBuildClient, tempFileProvider) {
        this.fsProvider = fsProvider;
        this.msBuildClient = msBuildClient;
        this.tempFileProvider = tempFileProvider;
    }
    async getTargetPath(projectFile) {
        const getTargetPathProjectFile = this.tempFileProvider.getTempFilename();
        const targetOutputFilename = this.tempFileProvider.getTempFilename();
        await this.fsProvider.writeFile(getTargetPathProjectFile, getTargetPathProjectFileContent);
        try {
            await this.msBuildClient.execTarget(getTargetPathProjectFile, {
                target: 'GetTargetPath',
                properties: {
                    'ProjectFilename': projectFile,
                    'TargetOutputFilename': targetOutputFilename
                }
            });
            const targetOutputContent = await this.fsProvider.readFile(targetOutputFilename);
            return targetOutputContent.split(/\r?\n/)[0];
        }
        finally {
            await this.fsProvider.unlinkFile(getTargetPathProjectFile);
            await this.fsProvider.unlinkFile(targetOutputFilename);
        }
    }
}
exports.MsBuildNetCoreProjectProvider = MsBuildNetCoreProjectProvider;
//# sourceMappingURL=netCoreProjectProvider.js.map