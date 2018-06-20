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
const options_1 = require("./options");
const launcher_2 = require("./launcher");
const timers_1 = require("timers");
const OmnisharpDownloader_1 = require("./OmnisharpDownloader");
const ObservableEvents = require("./loggingEvents");
const Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/debounceTime");
const CompositeDisposable_1 = require("../CompositeDisposable");
const Disposable_1 = require("../Disposable");
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
    constructor(vscode, networkSettingsProvider, eventStream, packageJSON, platformInfo) {
        this.vscode = vscode;
        this.eventStream = eventStream;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
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
        let downloader = new OmnisharpDownloader_1.OmnisharpDownloader(networkSettingsProvider, this.eventStream, this.packageJSON, platformInfo);
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
            if (options.waitForDebugger === true) {
                args.push('--debug');
            }
            let launchInfo;
            try {
                let extensionPath = utils.getExtensionPath();
                launchInfo = yield this._omnisharpManager.GetOmniSharpLaunchInfo(this.packageJSON.defaults.omniSharp, options.path, serverUrl, latestVersionFileServerPath, installPath, extensionPath);
            }
            catch (error) {
                this.eventStream.post(new ObservableEvents.OmnisharpFailure(`Error occured in loading omnisharp from omnisharp.path\nCould not start the server due to ${error.toString()}`, error));
                return;
            }
            this.eventStream.post(new ObservableEvents.OmnisharpInitialisation(new Date(), solutionPath));
            this._fireEvent(Events.BeforeServerStart, solutionPath);
            try {
                let launchResult = yield launcher_2.launchOmniSharp(cwd, args, launchInfo, this.platformInfo, options);
                this.eventStream.post(new ObservableEvents.OmnisharpLaunch(launchResult.monoVersion, launchResult.command, launchResult.process.pid));
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
                const options = options_1.Options.Read(this.vscode);
                yield this._start(launchTarget, options);
            }
        });
    }
    autoStart(preferredPath) {
        return launcher_1.findLaunchTargets().then((launchTargets) => __awaiter(this, void 0, void 0, function* () {
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
                this._fireEvent('stderr', String(data));
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
        line = line.trim();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLDZCQUE2QjtBQUU3QixtQ0FBbUM7QUFDbkMsa0RBQWtEO0FBR2xELGlEQUFtRDtBQUNuRCx5Q0FBNkQ7QUFDN0QsdUNBQXFEO0FBQ3JELGlEQUFpRTtBQUNqRSxpREFBOEM7QUFDOUMsbUNBQXNDO0FBQ3RDLHlEQUFrRTtBQUNsRSx1Q0FBb0M7QUFFcEMseUNBQTZDO0FBQzdDLG1DQUFvQztBQUNwQywrREFBNEQ7QUFDNUQsb0RBQW9EO0FBR3BELDBDQUF1QztBQUN2QywwQ0FBd0M7QUFDeEMsZ0VBQXlEO0FBQ3pELDhDQUF1QztBQUV2QyxJQUFLLFdBSUo7QUFKRCxXQUFLLFdBQVc7SUFDWixxREFBUSxDQUFBO0lBQ1IsbURBQU8sQ0FBQTtJQUNQLG1EQUFPLENBQUE7QUFDWCxDQUFDLEVBSkksV0FBVyxLQUFYLFdBQVcsUUFJZjtBQUVELElBQU8sTUFBTSxDQTZCWjtBQTdCRCxXQUFPLE1BQU07SUFDSSxtQkFBWSxHQUFHLGNBQWMsQ0FBQztJQUU5QixhQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ2xCLGFBQU0sR0FBRyxRQUFRLENBQUM7SUFFbEIsWUFBSyxHQUFHLE9BQU8sQ0FBQztJQUNoQixrQkFBVyxHQUFHLGFBQWEsQ0FBQztJQUU1Qiw2QkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztJQUNsRCw0QkFBcUIsR0FBRyx1QkFBdUIsQ0FBQztJQUNoRCw2QkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztJQUVsRCxxQkFBYyxHQUFHLGdCQUFnQixDQUFDO0lBQ2xDLG1CQUFZLEdBQUcsY0FBYyxDQUFDO0lBQzlCLHFCQUFjLEdBQUcsZ0JBQWdCLENBQUM7SUFFbEMsZ0NBQXlCLEdBQUcsMkJBQTJCLENBQUM7SUFFeEQsa0JBQVcsR0FBRyxhQUFhLENB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