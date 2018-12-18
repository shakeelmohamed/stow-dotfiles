"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const prereqManager_1 = require("../../../debugging/coreclr/prereqManager");
suite('debugging/coreclr/prereqManager', () => {
    suite('DockerDaemonIsLinuxPrerequisite', () => {
        const generateTest = (name, result, os) => {
            test(name, async () => {
                let gotVersion = false;
                const dockerClient = {
                    getVersion: (options) => {
                        gotVersion = true;
                        assert.deepEqual(options, { format: '{{json .Server.Os}}' }, 'The server OS should be requested, in JSON format.');
                        return Promise.resolve(`"${os.toLowerCase()}"`);
                    }
                };
                let shown = false;
                const showErrorMessage = (message, ...items) => {
                    shown = true;
                    return Promise.resolve(undefined);
                };
                const prerequisite = new prereqManager_1.DockerDaemonIsLinuxPrerequisite(dockerClient, showErrorMessage);
                const prereqResult = await prerequisite.checkPrerequisite();
                assert.equal(gotVersion, true, 'The Docker version should have been requested.');
                assert.equal(prereqResult, result, 'The prerequisite should return `false`.');
                assert.equal(shown, !result, `An error message should ${result ? 'not ' : ''} have been shown.`);
            });
        };
        generateTest('Linux daemon', true, 'Linux');
        generateTest('Windows daemon', false, 'Windows');
    });
    suite('DotNetSdkInstalledPrerequisite', () => {
        test('Installed', async () => {
            const msBuildClient = {
                getVersion: () => Promise.resolve('2.1.402')
            };
            let shown = false;
            const showErrorMessage = (message, ...items) => {
                shown = true;
                return Promise.resolve(undefined);
            };
            const prerequisite = new prereqManager_1.DotNetSdkInstalledPrerequisite(msBuildClient, showErrorMessage);
            const prereqResult = await prerequisite.checkPrerequisite();
            assert.equal(prereqResult, true, 'The prerequisite should pass if the SDK is installed.');
            assert.equal(shown, false, 'No error should be shown.');
        });
        test('Not installed', async () => {
            const msBuildClient = {
                getVersion: () => Promise.resolve(undefined)
            };
            let shown = false;
            const showErrorMessage = (message, ...items) => {
                shown = true;
                return Promise.resolve(undefined);
            };
            const prerequisite = new prereqManager_1.DotNetSdkInstalledPrerequisite(msBuildClient, showErrorMessage);
            const prereqResult = await prerequisite.checkPrerequisite();
            assert.equal(prereqResult, false, 'The prerequisite should fail if no SDK is installed.');
            assert.equal(shown, true, 'An error should be shown.');
        });
    });
    suite('LinuxUserInDockerGroupPrerequisite', () => {
        const generateTest = (name, result, os, isMac, inGroup) => {
            test(name, async () => {
                const osProvider = {
                    os,
                    isMac
                };
                let processProvider = {};
                let listed = false;
                if (os === 'Linux' && !isMac) {
                    processProvider = {
                        exec: (command, _) => {
                            listed = true;
                            assert.equal(command, 'id -Gn', 'The prerequisite should list the user\'s groups.');
                            const groups = inGroup ? 'groupA docker groupB' : 'groupA groupB';
                            return Promise.resolve({ stdout: groups, stderr: '' });
                        }
                    };
                }
                let shown = false;
                const showErrorMessage = (message, ...items) => {
                    shown = true;
                    return Promise.resolve(undefined);
                };
                const prerequisite = new prereqManager_1.LinuxUserInDockerGroupPrerequisite(osProvider, processProvider, showErrorMessage);
                const prereqResult = await prerequisite.checkPrerequisite();
                if (os === 'Linux' && !isMac) {
                    assert.equal(listed, true, 'The user\'s groups should have been listed.');
                }
                assert.equal(prereqResult, result, 'The prerequisite should return `false`.');
                assert.equal(shown, !result, `An error message should ${result ? 'not ' : ''} have been shown.`);
            });
        };
        generateTest('Windows: No-op', true, 'Windows');
        generateTest('Mac: No-op', true, 'Linux', true);
        generateTest('Linux: In group', true, 'Linux', false, true);
        generateTest('Linux: Not in group', false, 'Linux', false, false);
    });
    suite('MacNuGetFallbackFolderSharedPrerequisite', () => {
        const generateTest = (name, fileContents, result) => {
            const settingsPath = '/Users/User/Library/Group Containers/group.com.docker/settings.json';
            test(name, async () => {
                const fsProvider = {
                    fileExists: (path) => {
                        assert.equal(settingsPath, path, 'The prerequisite should check for the settings file in the user\'s home directory.');
                        return Promise.resolve(fileContents !== undefined);
                    },
                    readFile: (path) => {
                        if (fileContents === undefined) {
                            assert.fail('The prerequisite should not attempt to read a file that does not exist.');
                        }
                        assert.equal(settingsPath, path, 'The prerequisite should read the settings file in the user\'s home directory.');
                        return Promise.resolve(fileContents);
                    }
                };
                const osProvider = {
                    homedir: '/Users/User',
                    isMac: true
                };
                let shown = false;
                const showErrorMessage = (message, ...items) => {
                    shown = true;
                    return Promise.resolve(undefined);
                };
                const prereq = new prereqManager_1.MacNuGetFallbackFolderSharedPrerequisite(fsProvider, osProvider, showErrorMessage);
                const prereqResult = await prereq.checkPrerequisite();
                assert.equal(prereqResult, result, 'The prerequisite should return `false`.');
                assert.equal(shown, !result, `An error message should ${result ? 'not ' : ''} have been shown.`);
            });
        };
        generateTest('Mac: no Docker settings file', undefined, true);
        generateTest('Mac: no shared folders in Docker settings file', '{}', true);
        generateTest('Mac: no NuGetFallbackFolder in Docker settings file', '{ "filesharingDirectories": [] }', false);
        generateTest('Mac: NuGetFallbackFolder in Docker settings file', '{ "filesharingDirectories": [ "/usr/local/share/dotnet/sdk/NuGetFallbackFolder" ] }', true);
        test('Non-Mac: No-op', async () => {
            const osProvider = {
                isMac: false
            };
            const showErrorMessage = (message, ...items) => {
                assert.fail('Should not be called on non-Mac.');
                return Promise.resolve(undefined);
            };
            const prereq = new prereqManager_1.MacNuGetFallbackFolderSharedPrerequisite({}, osProvider, showErrorMessage);
            const result = await prereq.checkPrerequisite();
            assert.equal(true, result, 'The prerequisite should return `true` on non-Mac.');
        });
    });
});
//# sourceMappingURL=prereqManager.test.js.map