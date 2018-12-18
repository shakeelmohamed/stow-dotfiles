"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class TelemetryEvent {
    constructor(eventName, properties, measures) {
        this.eventName = eventName;
        this.properties = properties;
        this.measures = measures;
    }
}
exports.TelemetryEvent = TelemetryEvent;
class TelemetryEventWithMeasures {
    constructor(eventName, measures) {
        this.eventName = eventName;
        this.measures = measures;
    }
}
exports.TelemetryEventWithMeasures = TelemetryEventWithMeasures;
class OmnisharpDelayTrackerEventMeasures extends TelemetryEventWithMeasures {
}
exports.OmnisharpDelayTrackerEventMeasures = OmnisharpDelayTrackerEventMeasures;
class OmnisharpStart extends TelemetryEventWithMeasures {
}
exports.OmnisharpStart = OmnisharpStart;
class OmnisharpInitialisation {
    constructor(timeStamp, solutionPath) {
        this.timeStamp = timeStamp;
        this.solutionPath = solutionPath;
    }
}
exports.OmnisharpInitialisation = OmnisharpInitialisation;
class OmnisharpLaunch {
    constructor(monoVersion, monoPath, command, pid) {
        this.monoVersion = monoVersion;
        this.monoPath = monoPath;
        this.command = command;
        this.pid = pid;
    }
}
exports.OmnisharpLaunch = OmnisharpLaunch;
class PackageInstallation {
    constructor(packageInfo) {
        this.packageInfo = packageInfo;
    }
}
exports.PackageInstallation = PackageInstallation;
class LogPlatformInfo {
    constructor(info) {
        this.info = info;
    }
}
exports.LogPlatformInfo = LogPlatformInfo;
class InstallationStart {
    constructor(packageDescription) {
        this.packageDescription = packageDescription;
    }
}
exports.InstallationStart = InstallationStart;
class InstallationFailure {
    constructor(stage, error) {
        this.stage = stage;
        this.error = error;
    }
}
exports.InstallationFailure = InstallationFailure;
class DownloadProgress {
    constructor(downloadPercentage, packageDescription) {
        this.downloadPercentage = downloadPercentage;
        this.packageDescription = packageDescription;
    }
}
exports.DownloadProgress = DownloadProgress;
class OmnisharpFailure {
    constructor(message, error) {
        this.message = message;
        this.error = error;
    }
}
exports.OmnisharpFailure = OmnisharpFailure;
class OmnisharpRequestMessage {
    constructor(request, id) {
        this.request = request;
        this.id = id;
    }
}
exports.OmnisharpRequestMessage = OmnisharpRequestMessage;
class TestExecutionCountReport {
    constructor(debugCounts, runCounts) {
        this.debugCounts = debugCounts;
        this.runCounts = runCounts;
    }
}
exports.TestExecutionCountReport = TestExecutionCountReport;
class OmnisharpServerOnError {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}
exports.OmnisharpServerOnError = OmnisharpServerOnError;
class OmnisharpServerMsBuildProjectDiagnostics {
    constructor(diagnostics) {
        this.diagnostics = diagnostics;
    }
}
exports.OmnisharpServerMsBuildProjectDiagnostics = OmnisharpServerMsBuildProjectDiagnostics;
class OmnisharpServerUnresolvedDependencies {
    constructor(unresolvedDependencies) {
        this.unresolvedDependencies = unresolvedDependencies;
    }
}
exports.OmnisharpServerUnresolvedDependencies = OmnisharpServerUnresolvedDependencies;
class OmnisharpServerEnqueueRequest {
    constructor(name, command) {
        this.name = name;
        this.command = command;
    }
}
exports.OmnisharpServerEnqueueRequest = OmnisharpServerEnqueueRequest;
class OmnisharpServerDequeueRequest {
    constructor(name, command, id) {
        this.name = name;
        this.command = command;
        this.id = id;
    }
}
exports.OmnisharpServerDequeueRequest = OmnisharpServerDequeueRequest;
class OmnisharpServerProcessRequestStart {
    constructor(name) {
        this.name = name;
    }
}
exports.OmnisharpServerProcessRequestStart = OmnisharpServerProcessRequestStart;
class OmnisharpEventPacketReceived {
    constructor(logLevel, name, message) {
        this.logLevel = logLevel;
        this.name = name;
        this.message = message;
    }
}
exports.OmnisharpEventPacketReceived = OmnisharpEventPacketReceived;
class OmnisharpServerOnServerError {
    constructor(err) {
        this.err = err;
    }
}
exports.OmnisharpServerOnServerError = OmnisharpServerOnServerError;
class OmnisharpOnMultipleLaunchTargets {
    constructor(targets) {
        this.targets = targets;
    }
}
exports.OmnisharpOnMultipleLaunchTargets = OmnisharpOnMultipleLaunchTargets;
class WorkspaceInformationUpdated {
    constructor(info) {
        this.info = info;
    }
}
exports.WorkspaceInformationUpdated = WorkspaceInformationUpdated;
class EventWithMessage {
    constructor(message) {
        this.message = message;
    }
}
exports.EventWithMessage = EventWithMessage;
class DownloadStart {
    constructor(packageDescription) {
        this.packageDescription = packageDescription;
    }
}
exports.DownloadStart = DownloadStart;
class DownloadFallBack {
    constructor(fallbackUrl) {
        this.fallbackUrl = fallbackUrl;
    }
}
exports.DownloadFallBack = DownloadFallBack;
class DownloadSizeObtained {
    constructor(packageSize) {
        this.packageSize = packageSize;
    }
}
exports.DownloadSizeObtained = DownloadSizeObtained;
class ZipError {
    constructor(message) {
        this.message = message;
    }
}
exports.ZipError = ZipError;
class ReportDotNetTestResults {
    constructor(results) {
        this.results = results;
    }
}
exports.ReportDotNetTestResults = ReportDotNetTestResults;
class DotNetTestRunStart {
    constructor(testMethod) {
        this.testMethod = testMethod;
    }
}
exports.DotNetTestRunStart = DotNetTestRunStart;
class DotNetTestDebugStart {
    constructor(testMethod) {
        this.testMethod = testMethod;
    }
}
exports.DotNetTestDebugStart = DotNetTestDebugStart;
class DotNetTestDebugProcessStart {
    constructor(targetProcessId) {
        this.targetProcessId = targetProcessId;
    }
}
exports.DotNetTestDebugProcessStart = DotNetTestDebugProcessStart;
class DotNetTestsInClassRunStart {
    constructor(className) {
        this.className = className;
    }
}
exports.DotNetTestsInClassRunStart = DotNetTestsInClassRunStart;
class DotNetTestsInClassDebugStart {
    constructor(className) {
        this.className = className;
    }
}
exports.DotNetTestsInClassDebugStart = DotNetTestsInClassDebugStart;
class DocumentSynchronizationFailure {
    constructor(documentPath, errorMessage) {
        this.documentPath = documentPath;
        this.errorMessage = errorMessage;
    }
}
exports.DocumentSynchronizationFailure = DocumentSynchronizationFailure;
class OpenURL {
    constructor(url) {
        this.url = url;
    }
}
exports.OpenURL = OpenURL;
class RazorPluginPathSpecified {
    constructor(path) {
        this.path = path;
    }
}
exports.RazorPluginPathSpecified = RazorPluginPathSpecified;
class RazorPluginPathDoesNotExist {
    constructor(path) {
        this.path = path;
    }
}
exports.RazorPluginPathDoesNotExist = RazorPluginPathDoesNotExist;
class DebuggerPrerequisiteFailure extends EventWithMessage {
}
exports.DebuggerPrerequisiteFailure = DebuggerPrerequisiteFailure;
class DebuggerPrerequisiteWarning extends EventWithMessage {
}
exports.DebuggerPrerequisiteWarning = DebuggerPrerequisiteWarning;
class CommandDotNetRestoreProgress extends EventWithMessage {
}
exports.CommandDotNetRestoreProgress = CommandDotNetRestoreProgress;
class CommandDotNetRestoreSucceeded extends EventWithMessage {
}
exports.CommandDotNetRestoreSucceeded = CommandDotNetRestoreSucceeded;
class CommandDotNetRestoreFailed extends EventWithMessage {
}
exports.CommandDotNetRestoreFailed = CommandDotNetRestoreFailed;
class DownloadSuccess extends EventWithMessage {
}
exports.DownloadSuccess = DownloadSuccess;
class DownloadFailure extends EventWithMessage {
}
exports.DownloadFailure = DownloadFailure;
class OmnisharpServerOnStdErr extends EventWithMessage {
}
exports.OmnisharpServerOnStdErr = OmnisharpServerOnStdErr;
class OmnisharpServerMessage extends EventWithMessage {
}
exports.OmnisharpServerMessage = OmnisharpServerMessage;
class OmnisharpServerVerboseMessage extends EventWithMessage {
}
exports.OmnisharpServerVerboseMessage = OmnisharpServerVerboseMessage;
class DotNetTestMessage extends EventWithMessage {
}
exports.DotNetTestMessage = DotNetTestMessage;
class DotNetTestRunFailure extends EventWithMessage {
}
exports.DotNetTestRunFailure = DotNetTestRunFailure;
class DotNetTestDebugWarning extends EventWithMessage {
}
exports.DotNetTestDebugWarning = DotNetTestDebugWarning;
class DotNetTestDebugStartFailure extends EventWithMessage {
}
exports.DotNetTestDebugStartFailure = DotNetTestDebugStartFailure;
class RazorDevModeActive {
}
exports.RazorDevModeActive = RazorDevModeActive;
class ProjectModified {
}
exports.ProjectModified = ProjectModified;
class ActivationFailure {
}
exports.ActivationFailure = ActivationFailure;
class ShowOmniSharpChannel {
}
exports.ShowOmniSharpChannel = ShowOmniSharpChannel;
class DebuggerNotInstalledFailure {
}
exports.DebuggerNotInstalledFailure = DebuggerNotInstalledFailure;
class CommandDotNetRestoreStart {
}
exports.CommandDotNetRestoreStart = CommandDotNetRestoreStart;
class InstallationSuccess {
}
exports.InstallationSuccess = InstallationSuccess;
class OmnisharpServerProcessRequestComplete {
}
exports.OmnisharpServerProcessRequestComplete = OmnisharpServerProcessRequestComplete;
class ProjectJsonDeprecatedWarning {
}
exports.ProjectJsonDeprecatedWarning = ProjectJsonDeprecatedWarning;
class OmnisharpOnBeforeServerStart {
}
exports.OmnisharpOnBeforeServerStart = OmnisharpOnBeforeServerStart;
class OmnisharpOnBeforeServerInstall {
}
exports.OmnisharpOnBeforeServerInstall = OmnisharpOnBeforeServerInstall;
class ActiveTextEditorChanged {
}
exports.ActiveTextEditorChanged = ActiveTextEditorChanged;
class OmnisharpServerOnStop {
}
exports.OmnisharpServerOnStop = OmnisharpServerOnStop;
class OmnisharpServerOnStart {
}
exports.OmnisharpServerOnStart = OmnisharpServerOnStart;
class LatestBuildDownloadStart {
}
exports.LatestBuildDownloadStart = LatestBuildDownloadStart;
class OmnisharpRestart {
}
exports.OmnisharpRestart = OmnisharpRestart;
class DotNetTestDebugComplete {
}
exports.DotNetTestDebugComplete = DotNetTestDebugComplete;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZ0V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvbG9nZ2luZ0V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBVWhHO0lBQ0ksWUFBbUIsU0FBaUIsRUFBUyxVQUFzQyxFQUFTLFFBQW9DO1FBQTdHLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUE0QjtRQUFTLGFBQVEsR0FBUixRQUFRLENBQTRCO0lBQUcsQ0FBQztDQUN2STtBQUZELHdDQUVDO0FBRUQ7SUFDSSxZQUFtQixTQUFpQixFQUFTLFFBQW1DO1FBQTdELGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUEyQjtJQUNoRixDQUFDO0NBQ0o7QUFIRCxnRUFHQztBQUVELHdDQUFnRCxTQUFRLDBCQUEwQjtDQUNqRjtBQURELGdGQUNDO0FBRUQsb0JBQTRCLFNBQVEsMEJBQTBCO0NBQzdEO0FBREQsd0NBQ0M7QUFFRDtJQUNJLFlBQW1CLFNBQWUsRUFBUyxZQUFvQjtRQUE1QyxjQUFTLEdBQVQsU0FBUyxDQUFNO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQVE7SUFBSSxDQUFDO0NBQ3ZFO0FBRkQsMERBRUM7QUFFRDtJQUNJLFlBQW1CLFdBQW1CLEVBQVMsUUFBZ0IsRUFBUyxPQUFlLEVBQVMsR0FBVztRQUF4RixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtJQUFJLENBQUM7Q0FDbkg7QUFGRCwwQ0FFQztBQUVEO0lBQ0ksWUFBbUIsV0FBbUI7UUFBbkIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7SUFBSSxDQUFDO0NBQzlDO0FBRkQsa0RBRUM7QUFFRDtJQUNJLFlBQW1CLElBQXlCO1FBQXpCLFNBQUksR0FBSixJQUFJLENBQXFCO0lBQUksQ0FBQztDQUNwRDtBQUZELDBDQUVDO0FBRUQ7SUFDSSxZQUFtQixrQkFBMEI7UUFBMUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFRO0lBQUksQ0FBQztDQUNyRDtBQUZELDhDQUVDO0FBRUQ7SUFDSSxZQUFtQixLQUFhLEVBQVMsS0FBVTtRQUFoQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBSztJQUFJLENBQUM7Q0FDM0Q7QUFGRCxrREFFQztBQUVEO0lBQ0ksWUFBbUIsa0JBQTBCLEVBQVMsa0JBQTBCO1FBQTdELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUTtRQUFTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUTtJQUFJLENBQUM7Q0FDeEY7QUFGRCw0Q0FFQztBQUVEO0lBQ0ksWUFBbUIsT0FBZSxFQUFTLEtBQVk7UUFBcEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQU87SUFBSSxDQUFDO0NBQy9EO0FBRkQsNENBRUM7QUFFRDtJQUNJLFlBQW1CLE9BQWdCLEVBQVMsRUFBVTtRQUFuQyxZQUFPLEdBQVAsT0FBTyxDQUFTO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtJQUFJLENBQUM7Q0FDOUQ7QUFGRCwwREFFQztBQUVEO0lBQ0ksWUFBbUIsV0FBb0QsRUFBUyxTQUFrRDtRQUEvRyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUM7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUF5QztJQUFJLENBQUM7Q0FDMUk7QUFGRCw0REFFQztBQUVEO0lBQ0ksWUFBbUIsWUFBbUM7UUFBbkMsaUJBQVksR0FBWixZQUFZLENBQXVCO0lBQUksQ0FBQztDQUM5RDtBQUZELHdEQUVDO0FBRUQ7SUFDSSxZQUFtQixXQUErQztRQUEvQyxnQkFBVyxHQUFYLFdBQVcsQ0FBb0M7SUFBSSxDQUFDO0NBQzFFO0FBRkQsNEZBRUM7QUFFRDtJQUNJLFlBQW1CLHNCQUE4RDtRQUE5RCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdDO0lBQUksQ0FBQztDQUN6RjtBQUZELHNGQUVDO0FBRUQ7SUFDSSxZQUFtQixJQUFZLEVBQVMsT0FBZTtRQUFwQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFJLENBQUM7Q0FDL0Q7QUFGRCxzRUFFQztBQUVEO0lBQ0ksWUFBbUIsSUFBWSxFQUFTLE9BQWUsRUFBUyxFQUFVO1FBQXZELFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtJQUFJLENBQUM7Q0FDbEY7QUFGRCxzRUFFQztBQUVEO0lBQ0ksWUFBbUIsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7SUFBSSxDQUFDO0NBQ3ZDO0FBRkQsZ0ZBRUM7QUFFRDtJQUNJLFlBQW1CLFFBQWdCLEVBQVMsSUFBWSxFQUFTLE9BQWU7UUFBN0QsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUksQ0FBQztDQUN4RjtBQUZELG9FQUVDO0FBRUQ7SUFDSSxZQUFtQixHQUFRO1FBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztJQUFJLENBQUM7Q0FDbkM7QUFGRCxvRUFFQztBQUVEO0lBQ0ksWUFBbUIsT0FBdUI7UUFBdkIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7SUFBSSxDQUFDO0NBQ2xEO0FBRkQsNEVBRUM7QUFFRDtJQUNJLFlBQW1CLElBQTJDO1FBQTNDLFNBQUksR0FBSixJQUFJLENBQXVDO0lBQUksQ0FBQztDQUN0RTtBQUZELGtFQUVDO0FBRUQ7SUFDSSxZQUFtQixPQUFlO1FBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFJLENBQUM7Q0FDMUM7QUFGRCw0Q0FFQztBQUVEO0lBQ0ksWUFBbUIsa0JBQTBCO1FBQTFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUTtJQUFJLENBQUM7Q0FDckQ7QUFGRCxzQ0FFQztBQUVEO0lBQ0ksWUFBbUIsV0FBbUI7UUFBbkIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7SUFBSSxDQUFDO0NBQzlDO0FBRkQsNENBRUM7QUFFRDtJQUNJLFlBQW1CLFdBQW1CO1FBQW5CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO0lBQUksQ0FBQztDQUM5QztBQUZELG9EQUVDO0FBRUQ7SUFDSSxZQUFtQixPQUFlO1FBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFJLENBQUM7Q0FDMUM7QUFGRCw0QkFFQztBQUVEO0lBQ0ksWUFBbUIsT0FBdUM7UUFBdkMsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7SUFBSSxDQUFDO0NBQ2xFO0FBRkQsMERBRUM7QUFFRDtJQUNJLFlBQW1CLFVBQWtCO1FBQWxCLGVBQVUsR0FBVixVQUFVLENBQVE7SUFBSSxDQUFDO0NBQzdDO0FBRkQsZ0RBRUM7QUFFRDtJQUNJLFlBQW1CLFVBQWtCO1FBQWxCLGVBQVUsR0FBVixVQUFVLENBQVE7SUFBSSxDQUFDO0NBQzdDO0FBRkQsb0RBRUM7QUFFRDtJQUNJLFlBQW1CLGVBQXVCO1FBQXZCLG9CQUFlLEdBQWYsZUFBZSxDQUFRO0lBQUksQ0FBQztDQUNsRDtBQUZELGtFQUVDO0FBRUQ7SUFDSSxZQUFtQixTQUFpQjtRQUFqQixjQUFTLEdBQVQsU0FBUyxDQUFRO0lBQUksQ0FBQztDQUM1QztBQUZELGdFQUVDO0FBRUQ7SUFDSSxZQUFtQixTQUFpQjtRQUFqQixjQUFTLEdBQVQsU0FBUyxDQUFRO0lBQUksQ0FBQztDQUM1QztBQUZELG9FQUVDO0FBRUQ7SUFDSSxZQUFtQixZQUFvQixFQUFTLFlBQW9CO1FBQWpELGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQVE7SUFBSSxDQUFDO0NBQzVFO0FBRkQsd0VBRUM7QUFFRDtJQUNJLFlBQW1CLEdBQVc7UUFBWCxRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQUksQ0FBQztDQUN0QztBQUZELDBCQUVDO0FBRUQ7SUFDSSxZQUFtQixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtJQUFHLENBQUM7Q0FDdEM7QUFGRCw0REFFQztBQUVEO0lBQ0ksWUFBbUIsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7SUFBRyxDQUFDO0NBQ3RDO0FBRkQsa0VBRUM7QUFFRCxpQ0FBeUMsU0FBUSxnQkFBZ0I7Q0FBSTtBQUFyRSxrRUFBcUU7QUFDckUsaUNBQXlDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBckUsa0VBQXFFO0FBQ3JFLGtDQUEwQyxTQUFRLGdCQUFnQjtDQUFJO0FBQXRFLG9FQUFzRTtBQUN0RSxtQ0FBMkMsU0FBUSxnQkFBZ0I7Q0FBSTtBQUF2RSxzRUFBdUU7QUFDdkUsZ0NBQXdDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBcEUsZ0VBQW9FO0FBQ3BFLHFCQUE2QixTQUFRLGdCQUFnQjtDQUFJO0FBQXpELDBDQUF5RDtBQUN6RCxxQkFBNkIsU0FBUSxnQkFBZ0I7Q0FBSTtBQUF6RCwwQ0FBeUQ7QUFDekQsNkJBQXFDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBakUsMERBQWlFO0FBQ2pFLDRCQUFvQyxTQUFRLGdCQUFnQjtDQUFJO0FBQWhFLHdEQUFnRTtBQUNoRSxtQ0FBMkMsU0FBUSxnQkFBZ0I7Q0FBSTtBQUF2RSxzRUFBdUU7QUFDdkUsdUJBQStCLFNBQVEsZ0JBQWdCO0NBQUk7QUFBM0QsOENBQTJEO0FBQzNELDBCQUFrQyxTQUFRLGdCQUFnQjtDQUFJO0FBQTlELG9EQUE4RDtBQUM5RCw0QkFBb0MsU0FBUSxnQkFBZ0I7Q0FBSTtBQUFoRSx3REFBZ0U7QUFDaEUsaUNBQXlDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBckUsa0VBQXFFO0FBRXJFO0NBQXdEO0FBQXhELGdEQUF3RDtBQUN4RDtDQUFxRDtBQUFyRCwwQ0FBcUQ7QUFDckQ7Q0FBdUQ7QUFBdkQsOENBQXVEO0FBQ3ZEO0NBQTBEO0FBQTFELG9EQUEwRDtBQUMxRDtDQUFpRTtBQUFqRSxrRUFBaUU7QUFDakU7Q0FBK0Q7QUFBL0QsOERBQStEO0FBQy9EO0NBQXlEO0FBQXpELGtEQUF5RDtBQUN6RDtDQUEyRTtBQUEzRSxzRkFBMkU7QUFDM0U7Q0FBa0U7QUFBbEUsb0VBQWtFO0FBQ2xFO0NBQWtFO0FBQWxFLG9FQUFrRTtBQUNsRTtDQUFvRTtBQUFwRSx3RUFBb0U7QUFDcEU7Q0FBNkQ7QUFBN0QsMERBQTZEO0FBQzdEO0NBQTJEO0FBQTNELHNEQUEyRDtBQUMzRDtDQUE0RDtBQUE1RCx3REFBNEQ7QUFDNUQ7Q0FBOEQ7QUFBOUQsNERBQThEO0FBQzlEO0NBQXNEO0FBQXRELDRDQUFzRDtBQUN0RDtDQUE2RDtBQUE3RCwwREFBNkQifQ==