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
const fs = require("fs");
const path = require("path");
const utils = require("../common");
const serverUtils = require("../omnisharp/utils");
const child_process_1 = require("child_process");
const launcher_1 = require("./launcher");
const readline_1 = require("readline");
const requestQueue_1 = require("./requestQueue");
const delayTracker_1 = require("./delayTracker");
const events_1 = require("events");
const OmnisharpManager_1 = require("./OmnisharpManager");
const launcher_2 = require("./launcher");
const timers_1 = require("timers");
const OmnisharpDownloader_1 = require("./OmnisharpDownloader");
const ObservableEvents = require("./loggingEvents");
const Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/debounceTime");
const CompositeDisposable_1 = require("../CompositeDisposable");
const Disposable_1 = require("../Disposable");
const removeBOM_1 = require("../utils/removeBOM");
var ServerState;
(function (ServerState) {
    ServerState[ServerState["Starting"] = 0] = "Starting";
    ServerState[ServerState["Started"] = 1] = "Started";
    ServerState[ServerState["Stopped"] = 2] = "Stopped";
})(ServerState || (ServerState = {}));
var Events;
(function (Events) {
    Events.StateChanged = 'stateChanged';
    Events.StdOut = 'stdout';
    Events.StdErr = 'stderr';
    Events.Error = 'Error';
    Events.ServerError = 'ServerError';
    Events.UnresolvedDependencies = 'UnresolvedDependencies';
    Events.PackageRestoreStarted = 'PackageRestoreStarted';
    Events.PackageRestoreFinished = 'PackageRestoreFinished';
    Events.ProjectChanged = 'ProjectChanged';
    Events.ProjectAdded = 'ProjectAdded';
    Events.ProjectRemoved = 'ProjectRemoved';
    Events.MsBuildProjectDiagnostics = 'MsBuildProjectDiagnostics';
    Events.TestMessage = 'TestMessage';
    Events.BeforeServerInstall = 'BeforeServerInstall';
    Events.BeforeServerStart = 'BeforeServerStart';
    Events.ServerStart = 'ServerStart';
    Events.ServerStop = 'ServerStop';
    Events.MultipleLaunchTargets = 'server:MultipleLaunchTargets';
    Events.Started = 'started';
})(Events || (Events = {}));
const TelemetryReportingDelay = 2 * 60 * 1000; // two minutes
const serverUrl = "https://roslynomnisharp.blob.core.windows.net";
const installPath = ".omnisharp";
const latestVersionFileServerPath = 'releases/versioninfo.txt';
class OmniSharpServer {
    constructor(vscode, networkSettingsProvider, packageJSON, platformInfo, eventStream, optionProvider, extensionPath, monoResolver) {
        this.vscode = vscode;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.eventStream = eventStream;
        this.optionProvider = optionProvider;
        this.extensionPath = extensionPath;
        this.monoResolver = monoResolver;
        this._telemetryIntervalId = undefined;
        this._eventBus = new events_1.EventEmitter();
        this._state = ServerState.Stopped;
        this.updateProjectDebouncer = new Subject_1.Subject();
        this.debounceUpdateProjectWithLeadingTrue = () => {
            // Call the updateProjectInfo directly if it is the first time, otherwise debounce the request
            // This needs to be done so that we have a project information for the first incoming request
            if (this.firstUpdateProject) {
                this.updateProjectInfo();
            }
            else {
                this.updateProjectDebouncer.next(new ObservableEvents.ProjectModified());
            }
        };
        this.updateProjectInfo = () => __awaiter(this, void 0, void 0, function* () {
            this.firstUpdateProject = false;
            let info = yield serverUtils.requestWorkspaceInformation(this);
            //once we get the info, push the event into the event stream
            this.eventStream.post(new ObservableEvents.WorkspaceInformationUpdated(info));
        });
        this._requestQueue = new requestQueue_1.RequestQueueCollection(this.eventStream, 8, request => this._makeRequest(request));
        let downloader = new OmnisharpDownloader_1.OmnisharpDownloader(networkSettingsProvider, this.eventStream, this.packageJSON, platformInfo, extensionPath);
        this._omnisharpManager = new OmnisharpManager_1.OmnisharpManager(downloader, platformInfo);
        this.updateProjectDebouncer.debounceTime(1500).subscribe((event) => { this.updateProjectInfo(); });
        this.firstUpdateProject = true;
    }
    isRunning() {
        return this._state === ServerState.Started;
    }
    waitForEmptyEventQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this._requestQueue.isEmpty()) {
                let p = new Promise((resolve) => timers_1.setTimeout(resolve, 100));
                yield p;
            }
        });
    }
    _getState() {
        return this._state;
    }
    _setState(value) {
        if (typeof value !== 'undefined' && value !== this._state) {
            this._state = value;
            this._fireEvent(Events.StateChanged, this._state);
        }
    }
    _recordRequestDelay(requestName, elapsedTime) {
        let tracker = this._delayTrackers[requestName];
        if (!tracker) {
            tracker = new delayTracker_1.DelayTracker(requestName);
            this._delayTrackers[requestName] = tracker;
        }
        tracker.reportDelay(elapsedTime);
    }
    _reportTelemetry() {
        const delayTrackers = this._delayTrackers;
        for (const requestName in delayTrackers) {
            const tracker = delayTrackers[requestName];
            const eventName = 'omnisharp' + requestName;
            if (tracker.hasMeasures()) {
                const measures = tracker.getMeasures();
                tracker.clearMeasures();
                this.eventStream.post(new ObservableEvents.OmnisharpDelayTrackerEventMeasures(eventName, measures));
            }
        }
    }
    getSolutionPathOrFolder() {
        return this._launchTarget
            ? this._launchTarget.target
            : undefined;
    }
    // --- eventing
    onStdout(listener, thisArg) {
        return this._addListener(Events.StdOut, listener, thisArg);
    }
    onStderr(listener, thisArg) {
        return this._addListener(Events.StdErr, listener, thisArg);
    }
    onError(listener, thisArg) {
        return this._addListener(Events.Error, listener, thisArg);
    }
    onServerError(listener, thisArg) {
        return this._addListener(Events.ServerError, listener, thisArg);
    }
    onUnresolvedDependencies(listener, thisArg) {
        return this._addListener(Events.UnresolvedDependencies, listener, thisArg);
    }
    onBeforePackageRestore(listener, thisArg) {
        return this._addListener(Events.PackageRestoreStarted, listener, thisArg);
    }
    onPackageRestore(listener, thisArg) {
        return this._addListener(Events.PackageRestoreFinished, listener, thisArg);
    }
    onProjectChange(listener, thisArg) {
        return this._addListener(Events.ProjectChanged, listener, thisArg);
    }
    onProjectAdded(listener, thisArg) {
        return this._addListener(Events.ProjectAdded, listener, thisArg);
    }
    onProjectRemoved(listener, thisArg) {
        return this._addListener(Events.ProjectRemoved, listener, thisArg);
    }
    onMsBuildProjectDiagnostics(listener, thisArg) {
        return this._addListener(Events.MsBuildProjectDiagnostics, listener, thisArg);
    }
    onTestMessage(listener, thisArg) {
        return this._addListener(Events.TestMessage, listener, thisArg);
    }
    onBeforeServerInstall(listener) {
        return this._addListener(Events.BeforeServerInstall, listener);
    }
    onBeforeServerStart(listener) {
        return this._addListener(Events.BeforeServerStart, listener);
    }
    onServerStart(listener) {
        return this._addListener(Events.ServerStart, listener);
    }
    onServerStop(listener) {
        return this._addListener(Events.ServerStop, listener);
    }
    onMultipleLaunchTargets(listener, thisArg) {
        return this._addListener(Events.MultipleLaunchTargets, listener, thisArg);
    }
    onOmnisharpStart(listener) {
        return this._addListener(Events.Started, listener);
    }
    _addListener(event, listener, thisArg) {
        listener = thisArg ? listener.bind(thisArg) : listener;
        this._eventBus.addListener(event, listener);
        return new Disposable_1.default(() => this._eventBus.removeListener(event, listener));
    }
    _fireEvent(event, args) {
        this._eventBus.emit(event, args);
    }
    // --- start, stop, and connect
    _start(launchTarget, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let disposables = new CompositeDisposable_1.default();
            disposables.add(this.onServerError(err => this.eventStream.post(new ObservableEvents.OmnisharpServerOnServerError(err))));
            disposables.add(this.onError((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerOnError(message))));
            disposables.add(this.onMsBuildProjectDiagnostics((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerMsBuildProjectDiagnostics(message))));
            disposables.add(this.onUnresolvedDependencies((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerUnresolvedDependencies(message))));
            disposables.add(this.onStderr((message) => this.eventStream.post(new ObservableEvents.OmnisharpServerOnStdErr(message))));
            disposables.add(this.onMultipleLaunchTargets((targets) => this.eventStream.post(new ObservableEvents.OmnisharpOnMultipleLaunchTargets(targets))));
            disposables.add(this.onBeforeServerInstall(() => this.eventStream.post(new ObservableEvents.OmnisharpOnBeforeServerInstall())));
            disposables.add(this.onBeforeServerStart(() => {
                this.eventStream.post(new ObservableEvents.OmnisharpOnBeforeServerStart());
            }));
            disposables.add(this.onServerStop(() => this.eventStream.post(new ObservableEvents.OmnisharpServerOnStop())));
            disposables.add(this.onServerStart(() => {
                this.eventStream.post(new ObservableEvents.OmnisharpServerOnStart());
            }));
            disposables.add(this.onProjectAdded(this.debounceUpdateProjectWithLeadingTrue));
            disposables.add(this.onProjectChange(this.debounceUpdateProjectWithLeadingTrue));
            disposables.add(this.onProjectRemoved(this.debounceUpdateProjectWithLeadingTrue));
            this._disposables = disposables;
            this._setState(ServerState.Starting);
            this._launchTarget = launchTarget;
            const solutionPath = launchTarget.target;
            const cwd = path.dirname(solutionPath);
            let args = [
                '-s', solutionPath,
                '--hostPID', process.pid.toString(),
                '--stdio',
                'DotNet:enablePackageRestore=false',
                '--encoding', 'utf-8',
                '--loglevel', options.loggingLevel
            ];
            let razorPluginPath;
            if (!options.razorDisabled) {
                // Razor support only exists for certain platforms, so only load the plugin if present
                razorPluginPath = options.razorPluginPath || path.join(this.extensionPath, '.razor', 'OmniSharpPlugin', 'Microsoft.AspNetCore.Razor.OmniSharpPlugin.dll');
                if (fs.existsSync(razorPluginPath)) {
                    args.push('--plugin', razorPluginPath);
                }
            }
            if (options.waitForDebugger === true) {
                args.push('--debug');
            }
            let launchInfo;
            try {
                launchInfo = yield this._omnisharpManager.GetOmniSharpLaunchInfo(this.packageJSON.defaults.omniSharp, options.path, serverUrl, latestVersionFileServerPath, installPath, this.extensionPath);
            }
            catch (error) {
                this.eventStream.post(new ObservableEvents.OmnisharpFailure(`Error occured in loading omnisharp from omnisharp.path\nCould not start the server due to ${error.toString()}`, error));
                return;
            }
            this.eventStream.post(new ObservableEvents.OmnisharpInitialisation(new Date(), solutionPath));
            this._fireEvent(Events.BeforeServerStart, solutionPath);
            try {
                let launchResult = yield launcher_2.launchOmniSharp(cwd, args, launchInfo, this.platformInfo, options, this.monoResolver);
                this.eventStream.post(new ObservableEvents.OmnisharpLaunch(launchResult.monoVersion, launchResult.monoPath, launchResult.command, launchResult.process.pid));
                if (razorPluginPath && options.razorPluginPath) {
                    if (fs.existsSync(razorPluginPath)) {
                        this.eventStream.post(new ObservableEvents.RazorPluginPathSpecified(razorPluginPath));
                    }
                    else {
                        this.eventStream.post(new ObservableEvents.RazorPluginPathDoesNotExist(razorPluginPath));
                    }
                }
                this._serverProcess = launchResult.process;
                this._delayTrackers = {};
                this._setState(ServerState.Started);
                this._fireEvent(Events.ServerStart, solutionPath);
                yield this._doConnect(options);
                this._telemetryIntervalId = setInterval(() => this._reportTelemetry(), TelemetryReportingDelay);
                this._requestQueue.drain();
            }
            catch (err) {
                this._fireEvent(Events.ServerError, err);
                return this.stop();
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            let cleanupPromise;
            if (this._telemetryIntervalId !== undefined) {
                // Stop reporting telemetry
                clearInterval(this._telemetryIntervalId);
                this._telemetryIntervalId = undefined;
                this._reportTelemetry();
            }
            if (!this._serverProcess) {
                // nothing to kill
                cleanupPromise = Promise.resolve();
            }
            else if (process.platform === 'win32') {
                // when killing a process in windows its child
                // processes are *not* killed but become root
                // processes. Therefore we use TASKKILL.EXE
                cleanupPromise = new Promise((resolve, reject) => {
                    const killer = child_process_1.exec(`taskkill /F /T /PID ${this._serverProcess.pid}`, (err, stdout, stderr) => {
                        if (err) {
                            return reject(err);
                        }
                    });
                    killer.on('exit', resolve);
                    killer.on('error', reject);
                });
            }
            else {
                // Kill Unix process and children
                cleanupPromise = utils.getUnixChildProcessIds(this._serverProcess.pid)
                    .then(children => {
                    for (let child of children) {
                        process.kill(child, 'SIGTERM');
                    }
                    this._serverProcess.kill('SIGTERM');
                });
            }
            let disposables = this._disposables;
            this._disposables = null;
            return cleanupPromise.then(() => {
                this._serverProcess = null;
                this._setState(ServerState.Stopped);
                this._fireEvent(Events.ServerStop, this);
                if (disposables) {
                    disposables.dispose();
                }
            });
        });
    }
    restart(launchTarget = this._launchTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            if (launchTarget) {
                yield this.stop();
                this.eventStream.post(new ObservableEvents.OmnisharpRestart());
                const options = this.optionProvider.GetLatestOptions();
                yield this._start(launchTarget, options);
            }
        });
    }
    autoStart(preferredPath) {
        const options = this.optionProvider.GetLatestOptions();
        return launcher_1.findLaunchTargets(options).then((launchTargets) => __awaiter(this, void 0, void 0, function* () {
            // If there aren't any potential launch targets, we create file watcher and try to
            // start the server again once a *.sln, *.csproj, project.json, CSX or Cake file is created.
            if (launchTargets.length === 0) {
                return new Promise((resolve, reject) => {
                    // 1st watch for files
                    let watcher = this.vscode.workspace.createFileSystemWatcher('{**/*.sln,**/*.csproj,**/project.json,**/*.csx,**/*.cake}', 
                    /*ignoreCreateEvents*/ false, 
                    /*ignoreChangeEvents*/ true, 
                    /*ignoreDeleteEvents*/ true);
                    watcher.onDidCreate(uri => {
                        watcher.dispose();
                        resolve();
                    });
                }).then(() => {
                    // 2nd try again
                    return this.autoStart(preferredPath);
                });
            }
            const defaultLaunchSolutionConfigValue = this.optionProvider.GetLatestOptions().defaultLaunchSolution;
            // First, try to launch against something that matches the user's preferred target
            const defaultLaunchSolutionTarget = launchTargets.find((a) => (path.basename(a.target) === defaultLaunchSolutionConfigValue));
            if (defaultLaunchSolutionTarget) {
                return this.restart(defaultLaunchSolutionTarget);
            }
            // If there's more than one launch target, we start the server if one of the targets
            // matches the preferred path. Otherwise, we fire the "MultipleLaunchTargets" event,
            // which is handled in status.ts to display the launch target selector.
            if (launchTargets.length > 1 && preferredPath) {
                for (let launchTarget of launchTargets) {
                    if (launchTarget.target === preferredPath) {
                        // start preferred path
                        return this.restart(launchTarget);
                    }
                }
                this._fireEvent(Events.MultipleLaunchTargets, launchTargets);
                return Promise.reject(undefined);
            }
            // If there's only one target, just start
            return this.restart(launchTargets[0]);
        }));
    }
    // --- requests et al
    makeRequest(command, data, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._getState() !== ServerState.Started) {
                return Promise.reject('server has been stopped or not started');
            }
            let startTime;
            let request;
            let promise = new Promise((resolve, reject) => {
                startTime = Date.now();
                request = {
                    command,
                    data,
                    onSuccess: value => resolve(value),
                    onError: err => reject(err)
                };
                this._requestQueue.enqueue(request);
            });
            if (token) {
                token.onCancellationRequested(() => {
                    this._requestQueue.cancelRequest(request);
                });
            }
            return promise.then(response => {
                let endTime = Date.now();
                let elapsedTime = endTime - startTime;
                this._recordRequestDelay(command, elapsedTime);
                return response;
            });
        });
    }
    _doConnect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._serverProcess.stderr.on('data', (data) => {
                let trimData = removeBOM_1.removeBOMFromBuffer(data);
                if (trimData.length > 0) {
                    this._fireEvent(Events.StdErr, trimData.toString());
                }
            });
            this._readLine = readline_1.createInterface({
                input: this._serverProcess.stdout,
                output: this._serverProcess.stdin,
                terminal: false
            });
            const promise = new Promise((resolve, reject) => {
                let listener;
                // Convert the timeout from the seconds to milliseconds, which is required by setTimeout().
                const timeoutDuration = options.projectLoadTimeout * 1000;
                // timeout logic
                const handle = timers_1.setTimeout(() => {
                    if (listener) {
                        listener.dispose();
                    }
                    reject(new Error("OmniSharp server load timed out. Use the 'omnisharp.projectLoadTimeout' setting to override the default delay (one minute)."));
                }, timeoutDuration);
                // handle started-event
                listener = this.onOmnisharpStart(() => {
                    if (listener) {
                        listener.dispose();
                    }
                    clearTimeout(handle);
                    resolve();
                });
            });
            const lineReceived = this._onLineReceived.bind(this);
            this._readLine.addListener('line', lineReceived);
            this._disposables.add(new Disposable_1.default(() => {
                this._readLine.removeListener('line', lineReceived);
            }));
            return promise;
        });
    }
    _onLineReceived(line) {
        line = removeBOM_1.removeBOMFromString(line);
        if (line[0] !== '{') {
            this.eventStream.post(new ObservableEvents.OmnisharpServerMessage(line));
            return;
        }
        let packet;
        try {
            packet = JSON.parse(line);
        }
        catch (err) {
            // This isn't JSON
            return;
        }
        if (!packet.Type) {
            // Bogus packet
            return;
        }
        switch (packet.Type) {
            case 'response':
                this._handleResponsePacket(packet);
                break;
            case 'event':
                this._handleEventPacket(packet);
                break;
            default:
                this.eventStream.post(new ObservableEvents.OmnisharpServerMessage(`Unknown packet type: ${packet.Type}`));
                break;
        }
    }
    _handleResponsePacket(packet) {
        const request = this._requestQueue.dequeue(packet.Command, packet.Request_seq);
        if (!request) {
            this.eventStream.post(new ObservableEvents.OmnisharpServerMessage(`Received response for ${packet.Command} but could not find request.`));
            return;
        }
        this.eventStream.post(new ObservableEvents.OmnisharpServerVerboseMessage(`handleResponse: ${packet.Command} (${packet.Request_seq})`));
        if (packet.Success) {
            request.onSuccess(packet.Body);
        }
        else {
            request.onError(packet.Message || packet.Body);
        }
        this._requestQueue.drain();
    }
    _handleEventPacket(packet) {
        if (packet.Event === 'log') {
            const entry = packet.Body;
            this.eventStream.post(new ObservableEvents.OmnisharpEventPacketReceived(entry.LogLevel, entry.Name, entry.Message));
        }
        else {
            // fwd all other events
            this._fireEvent(packet.Event, packet.Body);
        }
    }
    _makeRequest(request) {
        const id = OmniSharpServer._nextId++;
        const requestPacket = {
            Type: 'request',
            Seq: id,
            Command: request.command,
            Arguments: request.data
        };
        this.eventStream.post(new ObservableEvents.OmnisharpRequestMessage(request, id));
        this._serverProcess.stdin.write(JSON.stringify(requestPacket) + '\n');
        return id;
    }
}
OmniSharpServer._nextId = 1;
exports.OmniSharpServer = OmniSharpServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFFN0IsbUNBQW1DO0FBQ25DLGtEQUFrRDtBQUVsRCxpREFBbUQ7QUFDbkQseUNBQTZEO0FBQzdELHVDQUFxRDtBQUNyRCxpREFBaUU7QUFDakUsaURBQThDO0FBQzlDLG1DQUFzQztBQUN0Qyx5REFBa0U7QUFHbEUseUNBQTZDO0FBQzdDLG1DQUFvQztBQUNwQywrREFBNEQ7QUFDNUQsb0RBQW9EO0FBR3BELDBDQUF1QztBQUN2QywwQ0FBd0M7QUFDeEMsZ0VBQXlEO0FBQ3pELDhDQUF1QztBQUd2QyxrREFBOEU7QUFFOUUsSUFBSyxXQUlKO0FBSkQsV0FBSyxXQUFXO0lBQ1oscURBQVEsQ0FBQTtJQUNSLG1EQUFPLENBQUE7SUFDUCxtREFBTyxDQUFBO0FBQ1gsQ0FBQyxFQUpJLFdBQVcsS0FBWCxXQUFXLFFBSWY7QUFFRCxJQUFPLE1BQU0sQ0E2Qlo7QUE3QkQsV0FBTyxNQUFNO0lBQ0ksbUJBQVksR0FBRyxjQUFjLENBQUM7SUFFOUIsYUFBTSxHQUFHLFFBQVEsQ0FBQztJQUNsQixhQUFNLEdBQUcsUUFBUSxDQUFDO0lBRWxCLFlBQUssR0FBRyxPQUFPLENBQUM7SUFDaEIsa0JBQVcsR0FBRyxhQUFhLENBQUM7SUFFNUIsNkJBQXNCLEdBQUcsd0JBQXdCLENBQUM7SUFDbEQsNEJBQXFCLEdBQUcsdUJBQXVCLENBQUM7SUFDaEQsNkJBQXNCLEdBQUcsd0JBQXdCLENBQUM7SUFFbEQscUJBQWMsR0FBRyxnQkFBZ0IsQ0FBQztJQUNsQyxtQkFBWSxHQUFHLGNBQWMsQ0FBQztJQUM5QixxQkFBYyxHQUFHLGdCQUFnQixDQUFDO0lBRWxDLGdDQUF5QixHQUFHLDJCQUEyQixDQUFDO0lBRXhELGtCQUFX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