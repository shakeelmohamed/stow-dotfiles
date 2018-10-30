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
        let d4 = vscode.commands.registerCommand('dotnet.classTests.run', (className, methodsInClass, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this._runDotnetTestsInClass(className, methodsInClass, fileName, testFrameworkName); }));
        let d5 = vscode.commands.registerCommand('dotnet.classTests.debug', (className, methodsInClass, fileName, testFrameworkName) => __awaiter(this, void 0, void 0, function* () { return this._debugDotnetTestsInClass(className, methodsInClass, fileName, testFrameworkName); }));
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
            let response = yield serverUtils.runTest(this._server, request);
            return response.Results;
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
            this._eventStream.post(new loggingEvents_1.DotNetTestRunStart(testMethod));
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            try {
                let results = yield this._runTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion);
                this._eventStream.post(new loggingEvents_1.ReportDotNetTestResults(results));
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(reason));
            }
            finally {
                listener.dispose();
            }
        });
    }
    _runDotnetTestsInClass(className, methodsInClass, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            //to do: try to get the class name here
            this._eventStream.post(new loggingEvents_1.DotNetTestsInClassRunStart(className));
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            try {
                let results = yield this._runTestsInClass(fileName, testFrameworkName, targetFrameworkVersion, methodsInClass);
                this._eventStream.post(new loggingEvents_1.ReportDotNetTestResults(results));
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestRunFailure(reason));
            }
            finally {
                listener.dispose();
            }
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
            let response = yield serverUtils.runTestsInClass(this._server, request);
            return response.Results;
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
            // Listen for test messages while getting start info.
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            try {
                let response = yield serverUtils.debugTestGetStartInfo(this._server, request);
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            }
            finally {
                listener.dispose();
            }
        });
    }
    _getLaunchConfigurationForLegacy(fileName, testMethod, testFrameworkName, targetFrameworkVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            // Listen for test messages while getting start info.
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            const request = {
                FileName: fileName,
                MethodName: testMethod,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            try {
                let response = yield serverUtils.getTestStartInfo(this._server, request);
                return this._createLaunchConfiguration(response.Executable, response.Argument, response.WorkingDirectory, null);
            }
            finally {
                listener.dispose();
            }
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
    _recordDebugAndGetDebugValues(fileName, testFrameworkName) {
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
                debugEventListener = new DebugEventListener(fileName, this._server, this._eventStream);
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
            this._eventStream.post(new loggingEvents_1.DotNetTestDebugStart(testMethod));
            let { debugType, debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName);
            try {
                let config = yield this._getLaunchConfiguration(debugType, fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener);
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestDebugStartFailure(reason));
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            }
        });
    }
    _debugDotnetTestsInClass(className, methodsToRun, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            this._eventStream.post(new loggingEvents_1.DotNetTestsInClassDebugStart(className));
            let { debugType, debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName);
            try {
                let config = yield this._getLaunchConfigurationForClass(debugType, fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener);
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            }
            catch (reason) {
                this._eventStream.post(new loggingEvents_1.DotNetTestDebugStartFailure(reason));
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            }
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
            const listener = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            const request = {
                FileName: fileName,
                MethodNames: methodsToRun,
                TestFrameworkName: testFrameworkName,
                TargetFrameworkVersion: targetFrameworkVersion
            };
            try {
                let response = yield serverUtils.debugTestClassGetStartInfo(this._server, request);
                return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
            }
            finally {
                listener.dispose();
            }
        });
    }
}
exports.default = TestManager;
class DebugEventListener {
    constructor(fileName, server, eventStream) {
        this._isClosed = false;
        this._fileName = fileName;
        this._server = server;
        this._eventStream = eventStream;
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
                        this._eventStream.post(new loggingEvents_1.DotNetTestDebugWarning("Invalid event received from debugger"));
                        return;
                    }
                    switch (event.eventType) {
                        case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.ProcessLaunched:
                            let processLaunchedEvent = (event);
                            this._eventStream.post(new loggingEvents_1.DotNetTestDebugProcessStart(processLaunchedEvent.targetProcessId));
                            this.onProcessLaunched(processLaunchedEvent.targetProcessId);
                            break;
                        case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.DebuggingStopped:
                            this._eventStream.post(new loggingEvents_1.DotNetTestDebugComplete());
                            this.onDebuggingStopped();
                            break;
                    }
                });
                socket.on('end', () => {
                    this.onDebuggingStopped();
                });
            });
            yield this.removeSocketFileIfExists();
            return new Promise((resolve, reject) => {
                let isStarted = false;
                this._serverSocket.on('error', (err) => {
                    if (!isStarted) {
                        reject(err.message);
                    }
                    else {
                        this._eventStream.post(new loggingEvents_1.DotNetTestDebugWarning(`Communications error on debugger event channel. ${err.message}`));
                    }
                });
                this._serverSocket.listen(this._pipePath, () => {
                    isStarted = true;
                    resolve();
                });
            });
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
        return __awaiter(this, void 0, void 0, function* () {
            let request = {
                FileName: this._fileName,
                TargetProcessId: targetProcessId
            };
            const disposable = this._server.onTestMessage(e => {
                this._eventStream.post(new loggingEvents_1.DotNetTestMessage(e.Message));
            });
            try {
                yield serverUtils.debugTestLaunch(this._server, request);
            }
            finally {
                disposable.dispose();
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG90bmV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb3RuZXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRywyQkFBMkI7QUFDM0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUU3QixrREFBa0Q7QUFDbEQsbUNBQW1DO0FBQ25DLGlDQUFpQztBQUNqQyx5REFBa0Q7QUFDbEQsb0ZBQWlGO0FBRWpGLDhEQUF1VjtBQUd2Viw4Q0FBdUM7QUFDdkMsZ0VBQXlEO0FBRXpELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjO0FBRTdELGlCQUFpQyxTQUFRLDBCQUFnQjtJQU9yRCxZQUFZLE1BQXVCLEVBQUUsV0FBd0I7UUFDekQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBSlYseUJBQW9CLEdBQWlCLFNBQVMsQ0FBQztRQUtuRCxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUVoQyxvQkFBb0I7UUFDcEIsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQ3BDLGlCQUFpQixFQUNqQixDQUFPLFVBQVUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxnREFBQyxPQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO1FBRXJILElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUNwQyxtQkFBbUIsRUFDbkIsQ0FBTyxVQUFVLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsZ0RBQUMsT0FBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO1FB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