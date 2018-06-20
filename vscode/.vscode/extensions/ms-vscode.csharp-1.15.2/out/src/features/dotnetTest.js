"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const os = require("os");
const path = require("path");
const protocol = require("../omnisharp/protocol");
const serverUtils = require("../omnisharp/utils");
const utils = require("../common");
const vscode = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const debuggerEventsProtocol_1 = require("../coreclr-debug/debuggerEventsProtocol");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const Disposable_1 = require("../Disposable");
const CompositeDisposable_1 = require("../CompositeDisposable");
const TelemetryReportingDelay = 2 * 60 * 1000; // two minutes
class TestManager extends abstractProvider_1.default {
    constructor(server, eventStream) {
        super(server);
        this._telemetryIntervalId = undefined;
        this._eventStream = eventStream;
        // register commands
        let d1 = vscode.commands.registerCommand('dotnet.test.run', (testMethod, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this._runDotnetTest(testMethod, fileName, testFrameworkName); }));
        let d2 = vscode.commands.registerCommand('dotnet.test.debug', (testMethod, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this._debugDotnetTest(testMethod, fileName, testFrameworkName); }));
        let d4 = vscode.commands.registerCommand('dotnet.classTests.run', (methodsInClass, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this._runDotnetTestsInClass(methodsInClass, fileName, testFrameworkName); }));
        let d5 = vscode.commands.registerCommand('dotnet.classTests.debug', (methodsInClass, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this._debugDotnetTestsInClass(methodsInClass, fileName, testFrameworkName); }));
        this._telemetryIntervalId = setInterval(() => this._reportTelemetry(), TelemetryReportingDelay);
        let d3 = new Disposable_1.default(() => {
            if (this._telemetryIntervalId !== undefined) {
                // Stop reporting telemetry
                clearInterval(this._telemetryIntervalId);
                this._telemetryIntervalId = undefined;
                this._reportTelemetry();
            }
        });
        this.addDisposables(new CompositeDisposable_1.default(d1, d2, d3, d4, d5));
    }
    _getOutputChannel() {
        if (this._channel === undefined) {
            this._channel = vscode.window.createOutputChannel(".NET Test Log");
            this.addDisposables(new CompositeDisposable_1.default(this._channel));
        }
        return this._channel;
    }
    _recordRunRequest(testFrameworkName) {
        if (this._runCounts === undefined) {
            this._runCounts = {};
        }
        let count = this._runCounts[testFrameworkName];
        if (!count) {
            count = 1;
        }
        else {
            count += 1;
        }
        this._runCounts[testFrameworkName] = count;
    }
    _recordDebugRequest(testFrameworkName) {
        if (this._debugCounts === undefined) {
            this._debugCounts = {};
        }
        let count = this._debugCounts[testFrameworkName];
        if (!count) {
            count = 1;
        }
        else {
            count += 1;
        }
        this._debugCounts[testFrameworkName] = count;
    }
    _reportTelemetry() {
        this._eventStream.post(new loggingEvents_1.TestExecutionCountReport(this._debugCounts, this._runCounts));
        this._runCounts = undefined;
        this._debugCounts = undefined;
    }
    _saveDirtyFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(vscode.workspace.saveAll(/*includeUntitled*/ false));
        });
    }
    _runTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            return serverUtils.runTest(this._server, request)
                .then(response => response.Results);
        });
    }
    _reportResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalTests = results.length;
            const output = this._getOutputChannel();
            let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
            for (let result of results) {
                output.appendLine(`${result.MethodName}: ${result.Outcome}`);
                switch (result.Outcome) {
                    case protocol.V2.TestOutcomes.Failed:
                        totalFailed += 1;
                        break;
                    case protocol.V2.TestOutcomes.Passed:
                        totalPassed += 1;
                        break;
                    case protocol.V2.TestOutcomes.Skipped:
                        totalSkipped += 1;
                        break;
                }
            }
            output.appendLine('');
            output.appendLine(`Total tests: ${totalTests}. Passed: ${totalPassed}. Failed: ${totalFailed}. Skipped: ${totalSkipped}`);
            output.appendLine('');
            return Promise.resolve();
        });
    }
    _recordRunAndGetFrameworkVersion(fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._saveDirtyFiles();
            this._recordRunRequest(testFrameworkName);
            let projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
            let targetFrameworkVersion;
            if (projectInfo.DotNetProject) {
                targetFrameworkVersion = undefined;
            }
            else if (projectInfo.MsBuildProject) {
                targetFrameworkVersion = projectInfo.MsBuildProject.TargetFramework;
            }
            else {
                throw new Error('Expected project.json or .csproj project.');
            }
            return targetFrameworkVersion;
        });
    }
    _runDotnetTest(testMethod, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            output.show();
            output.appendLine(`Running test ${testMethod}...`);
            output.appendLine('');
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            return this._runTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion)
                .then((results) => __awaiter(this, void 0, void 0, function* () { return this._reportResults(results); }))
                .then(() => listener.dispose())
                .catch(reason => {
                listener.dispose();
                vscode.window.showErrorMessage(`Failed to run test because ${reason}.`);
            });
        });
    }
    _runDotnetTestsInClass(methodsInClass, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            output.show();
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            return this._runTestsInClass(fileName, testFrameworkName, targetFrameworkVersion, methodsInClass)
                .then((results) => __awaiter(this, void 0, void 0, function* () { return this._reportResults(results); }))
                .then(() => listener.dispose())
                .catch(reason => {
                listener.dispose();
                vscode.window.showErrorMessage(`Failed to run tests because ${reason}.`);
            });
        });
    }
    _runTestsInClass(fileName, testFrameworkName, targetFrameworkVersion, methodsToRun) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                FileName: fileName,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion,
                MethodNames: methodsToRun
            };
            return serverUtils.runTestsInClass(this._server, request)
                .then(response => response.Results);
        });
    }
    _createLaunchConfiguration(program, args, cwd, debuggerEventsPipeName) {
        let debugOptions = vscode.workspace.getConfiguration('csharp').get('unitTestDebuggingOptions');
        // Get the initial set of options from the workspace setting
        let result;
        if (typeof debugOptions === "object") {
            // clone the options object to avoid changing it
            result = JSON.parse(JSON.stringify(debugOptions));
        }
        else {
            result = {};
        }
        let launchConfiguration = Object.assign({}, result, { type: result.type || "coreclr", name: ".NET Test Launch", request: "launch", debuggerEventsPipeName: debuggerEventsPipeName, program: program, args: args, cwd: cwd });
        // Now fill in the rest of the options
        return launchConfiguration;
    }
    _getLaunchConfigurationForVSTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            // Listen for test messages while getting start info.
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            return serverUtils.debugTestGetStartInfo(this._server, request)
                .then(response => {
                listener.dispose();
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            });
        });
    }
    _getLaunchConfigurationForLegacy(fileName, testMethod, testFrameworkName, targetFrameworkVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            // Listen for test messages while getting start info.
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            return serverUtils.getTestStartInfo(this._server, request)
                .then(response => {
                listener.dispose();
                return this._createLaunchConfiguration(response.Executable, response.Argument, response.WorkingDirectory, null);
            });
        });
    }
    _getLaunchConfiguration(debugType, fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (debugType) {
                case 'legacy':
                    return this._getLaunchConfigurationForLegacy(fileName, testMethod, testFrameworkName, targetFrameworkVersion);
                case 'vstest':
                    return this._getLaunchConfigurationForVSTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener);
                default:
                    throw new Error(`Unexpected debug type: ${debugType}`);
            }
        });
    }
    _recordDebugAndGetDebugValues(fileName, testFrameworkName, output) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._saveDirtyFiles();
            this._recordDebugRequest(testFrameworkName);
            let projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
            let debugType;
            let debugEventListener = null;
            let targetFrameworkVersion;
            if (projectInfo.DotNetProject) {
                debugType = 'legacy';
                targetFrameworkVersion = '';
            }
            else if (projectInfo.MsBuildProject) {
                debugType = 'vstest';
                targetFrameworkVersion = projectInfo.MsBuildProject.TargetFramework;
                debugEventListener = new DebugEventListener(fileName, this._server, output);
                debugEventListener.start();
            }
            else {
                throw new Error('Expected project.json or .csproj project.');
            }
            return { debugType, debugEventListener, targetFrameworkVersion };
        });
    }
    _debugDotnetTest(testMethod, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            // We support to styles of 'dotnet test' for debugging: The legacy 'project.json' testing, and the newer csproj support
            // using VS Test. These require a different level of communication.
            const output = this._getOutputChannel();
            output.show();
            output.appendLine(`Debugging method '${testMethod}'...`);
            output.appendLine('');
            let { debugType, debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName, output);
            return this._getLaunchConfiguration(debugType, fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener)
                .then(config => {
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            })
                .catch(reason => {
                vscode.window.showErrorMessage(`Failed to start debugger: ${reason}`);
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            });
        });
    }
    _debugDotnetTestsInClass(methodsToRun, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            let { debugType, debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName, output);
            return yield this._getLaunchConfigurationForClass(debugType, fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener)
                .then(config => {
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            })
                .catch(reason => {
                vscode.window.showErrorMessage(`Failed to start debugger: ${reason}`);
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            });
        });
    }
    _getLaunchConfigurationForClass(debugType, fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (debugType == 'vstest') {
                return this._getLaunchConfigurationForVSTestClass(fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener);
            }
            throw new Error(`Unexpected debug type: ${debugType}`);
        });
    }
    _getLaunchConfigurationForVSTestClass(fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            const request = {
                FileName: fileName,
                MethodNames: methodsToRun,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            return serverUtils.debugTestClassGetStartInfo(this._server, request)
                .then(response => {
                listener.dispose();
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            });
        });
    }
}
exports.default = TestManager;
class DebugEventListener {
    constructor(fileName, server, outputChannel) {
        this._isClosed = false;
        this._fileName = fileName;
        this._server = server;
        this._outputChannel = outputChannel;
        // NOTE: The max pipe name on OSX is fairly small, so this name shouldn't bee too long.
        const pipeSuffix = "TestDebugEvents-" + process.pid;
        if (os.platform() === 'win32') {
            this._pipePath = "\\\\.\\pipe\\Microsoft.VSCode.CSharpExt." + pipeSuffix;
        }
        else {
            this._pipePath = path.join(utils.getExtensionPath(), "." + pipeSuffix);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            // We use our process id as part of the pipe name, so if we still somehow have an old instance running, close it.
            if (DebugEventListener.s_activeInstance !== null) {
                DebugEventListener.s_activeInstance.close();
            }
            DebugEventListener.s_activeInstance = this;
            this._serverSocket = net.createServer((socket) => {
                socket.on('data', (buffer) => {
                    let event;
                    try {
                        event = debuggerEventsProtocol_1.DebuggerEventsProtocol.decodePacket(buffer);
                    }
                    catch (e) {
                        this._outputChannel.appendLine("Warning: Invalid event received from debugger");
                        return;
                    }
                    switch (event.eventType) {
                        case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.ProcessLaunched:
                            let processLaunchedEvent = (event);
                            this._outputChannel.appendLine(`Started debugging process #${processLaunchedEvent.targetProcessId}.`);
                            this.onProcessLaunched(processLaunchedEvent.targetProcessId);
                            break;
                        case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.DebuggingStopped:
                            this._outputChannel.appendLine("Debugging complete.\n");
                            this.onDebuggingStopped();
                            break;
                    }
                });
                socket.on('end', () => {
                    this.onDebuggingStopped();
                });
            });
            return this.removeSocketFileIfExists().then(() => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    let isStarted = false;
                    this._serverSocket.on('error', (err) => {
                        if (!isStarted) {
                            reject(err.message);
                        }
                        else {
                            this._outputChannel.appendLine("Warning: Communications error on debugger event channel. " + err.message);
                        }
                    });
                    this._serverSocket.listen(this._pipePath, () => {
                        isStarted = true;
                        resolve();
                    });
                });
            }));
        });
    }
    pipePath() {
        return this._pipePath;
    }
    close() {
        if (this === DebugEventListener.s_activeInstance) {
            DebugEventListener.s_activeInstance = null;
        }
        if (this._isClosed) {
            return;
        }
        this._isClosed = true;
        if (this._serverSocket !== null) {
            this._serverSocket.close();
        }
    }
    onProcessLaunched(targetProcessId) {
        let request = {
            FileName: this._fileName,
            TargetProcessId: targetProcessId
        };
        const disposable = this._server.onTestMessage(e => {
            this._outputChannel.appendLine(e.Message);
        });
        serverUtils.debugTestLaunch(this._server, request)
            .then(_ => {
            disposable.dispose();
        });
    }
    onDebuggingStopped() {
        if (this._isClosed) {
            return;
        }
        let request = {
            FileName: this._fileName
        };
        serverUtils.debugTestStop(this._server, request);
        this.close();
    }
    removeSocketFileIfExists() {
        return __awaiter(this, void 0, void 0, function* () {
            if (os.platform() === 'win32') {
                // Win32 doesn't use the file system for pipe names
                return Promise.resolve();
            }
            else {
                return utils.deleteIfExists(this._pipePath);
            }
        });
    }
}
DebugEventListener.s_activeInstance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG90bmV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb3RuZXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRywyQkFBMkI7QUFDM0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixrREFBa0Q7QUFDbEQsa0RBQWtEO0FBQ2xELG1DQUFtQztBQUNuQyxpQ0FBaUM7QUFDakMseURBQWtEO0FBQ2xELG9GQUFpRjtBQUVqRiw4REFBc0U7QUFHdEUsOENBQXVDO0FBQ3ZDLGdFQUF5RDtBQUV6RCxNQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYztBQUU3RCxpQkFBaUMsU0FBUSwwQkFBZ0I7SUFRckQsWUFBWSxNQUF1QixFQUFFLFdBQXdCO1FBQ3pELEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUpWLHlCQUFvQixHQUFpQixTQUFTLENBQUM7UUFLbkQsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFFaEMsb0JBQW9CO1FBQ3BCLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUNwQyxpQkFBaUIsRUFDakIsQ0FBTyxVQUFVLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsZ0RBQUMsT0FBQSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQSxHQUFBLENBQUMsQ0FBQztRQUVySCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDcEMsbUJBQW1CLEVBQ25CLENBQU8sVUFBVSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLGdEQUFDLE9BQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQSxHQUFB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