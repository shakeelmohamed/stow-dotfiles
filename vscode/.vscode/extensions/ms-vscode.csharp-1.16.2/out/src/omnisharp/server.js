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
    constructor(vscode, networkSettingsProvider, packageJSON, platformInfo, eventStream, optionProvider, extensionPath) {
        this.vscode = vscode;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.eventStream = eventStream;
        this.optionProvider = optionProvider;
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
                this.eventStream.post(new ObservableEvents.OmnisharpLaunch(launchResult.monoVersion, launchResult.monoPath, launchResult.command, launchResult.process.pid));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLDZCQUE2QjtBQUU3QixtQ0FBbUM7QUFDbkMsa0RBQWtEO0FBRWxELGlEQUFtRDtBQUNuRCx5Q0FBNkQ7QUFDN0QsdUNBQXFEO0FBQ3JELGlEQUFpRTtBQUNqRSxpREFBOEM7QUFDOUMsbUNBQXNDO0FBQ3RDLHlEQUFrRTtBQUdsRSx5Q0FBNkM7QUFDN0MsbUNBQW9DO0FBQ3BDLCtEQUE0RDtBQUM1RCxvREFBb0Q7QUFHcEQsMENBQXVDO0FBQ3ZDLDBDQUF3QztBQUN4QyxnRUFBeUQ7QUFDekQsOENBQXVDO0FBRXZDLGtEQUE4RTtBQUc5RSxJQUFLLFdBSUo7QUFKRCxXQUFLLFdBQVc7SUFDWixxREFBUSxDQUFBO0lBQ1IsbURBQU8sQ0FBQTtJQUNQLG1EQUFPLENBQUE7QUFDWCxDQUFDLEVBSkksV0FBVyxLQUFYLFdBQVcsUUFJZjtBQUVELElBQU8sTUFBTSxDQTZCWjtBQTdCRCxXQUFPLE1BQU07SUFDSSxtQkFBWSxHQUFHLGNBQWMsQ0FBQztJQUU5QixhQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ2xCLGFBQU0sR0FBRyxRQUFRLENBQUM7SUFFbEIsWUFBSyxHQUFHLE9BQU8sQ0FBQztJQUNoQixrQkFBVyxHQUFHLGFBQWEsQ0FBQztJQUU1Qiw2QkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztJQUNsRCw0QkFBcUIsR0FBRyx1QkFBdUIsQ0FBQztJQUNoRCw2QkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztJQUVsRCxxQkFBYyxHQUFHLGdCQUFnQixDQUFDO0lBQ2xDLG1CQUFZLEdBQUcsY0FBYyxDQUFDO0lBQzlCLHFCQUFjLEdBQUcsZ0JBQWdCLENBQUM7SUFFbEMsZ0NBQXlCLEdBQUcsMkJBQTJCLENBQUM7SUFFeEQsa0JBQVcsR0FBRyxhQUFhLENB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