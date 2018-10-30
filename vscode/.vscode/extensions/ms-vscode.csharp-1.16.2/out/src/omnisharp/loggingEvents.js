"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZ0V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvbG9nZ2luZ0V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBVWhHO0lBQ0ksWUFBbUIsU0FBaUIsRUFBUyxRQUFtQztRQUE3RCxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBMkI7SUFDaEYsQ0FBQztDQUNKO0FBSEQsZ0VBR0M7QUFFRCx3Q0FBZ0QsU0FBUSwwQkFBMEI7Q0FDakY7QUFERCxnRkFDQztBQUVELG9CQUE0QixTQUFRLDBCQUEwQjtDQUM3RDtBQURELHdDQUNDO0FBRUQ7SUFDSSxZQUFtQixTQUFlLEVBQVMsWUFBb0I7UUFBNUMsY0FBUyxHQUFULFNBQVMsQ0FBTTtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUFRO0lBQUksQ0FBQztDQUN2RTtBQUZELDBEQUVDO0FBRUQ7SUFDSSxZQUFtQixXQUFtQixFQUFTLFFBQWdCLEVBQVMsT0FBZSxFQUFTLEdBQVc7UUFBeEYsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFBSSxDQUFDO0NBQ25IO0FBRkQsMENBRUM7QUFFRDtJQUNJLFlBQW1CLFdBQW1CO1FBQW5CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO0lBQUksQ0FBQztDQUM5QztBQUZELGtEQUVDO0FBRUQ7SUFDSSxZQUFtQixJQUF5QjtRQUF6QixTQUFJLEdBQUosSUFBSSxDQUFxQjtJQUFJLENBQUM7Q0FDcEQ7QUFGRCwwQ0FFQztBQUVEO0lBQ0ksWUFBbUIsa0JBQTBCO1FBQTFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUTtJQUFJLENBQUM7Q0FDckQ7QUFGRCw4Q0FFQztBQUVEO0lBQ0ksWUFBbUIsS0FBYSxFQUFTLEtBQVU7UUFBaEMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQUs7SUFBSSxDQUFDO0NBQzNEO0FBRkQsa0RBRUM7QUFFRDtJQUNJLFlBQW1CLGtCQUEwQixFQUFTLGtCQUEwQjtRQUE3RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7UUFBUyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7SUFBSSxDQUFDO0NBQ3hGO0FBRkQsNENBRUM7QUFFRDtJQUNJLFlBQW1CLE9BQWUsRUFBUyxLQUFZO1FBQXBDLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO0lBQUksQ0FBQztDQUMvRDtBQUZELDRDQUVDO0FBRUQ7SUFDSSxZQUFtQixPQUFnQixFQUFTLEVBQVU7UUFBbkMsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUFTLE9BQUUsR0FBRixFQUFFLENBQVE7SUFBSSxDQUFDO0NBQzlEO0FBRkQsMERBRUM7QUFFRDtJQUNJLFlBQW1CLFdBQW9ELEVBQVMsU0FBa0Q7UUFBL0csZ0JBQVcsR0FBWCxXQUFXLENBQXlDO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBeUM7SUFBSSxDQUFDO0NBQzFJO0FBRkQsNERBRUM7QUFFRDtJQUNJLFlBQW1CLFlBQW1DO1FBQW5DLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtJQUFJLENBQUM7Q0FDOUQ7QUFGRCx3REFFQztBQUVEO0lBQ0ksWUFBbUIsV0FBK0M7UUFBL0MsZ0JBQVcsR0FBWCxXQUFXLENBQW9DO0lBQUksQ0FBQztDQUMxRTtBQUZELDRGQUVDO0FBRUQ7SUFDSSxZQUFtQixzQkFBOEQ7UUFBOUQsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QztJQUFJLENBQUM7Q0FDekY7QUFGRCxzRkFFQztBQUVEO0lBQ0ksWUFBbUIsSUFBWSxFQUFTLE9BQWU7UUFBcEMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBSSxDQUFDO0NBQy9EO0FBRkQsc0VBRUM7QUFFRDtJQUNJLFlBQW1CLElBQVksRUFBUyxPQUFlLEVBQVMsRUFBVTtRQUF2RCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFTLE9BQUUsR0FBRixFQUFFLENBQVE7SUFBSSxDQUFDO0NBQ2xGO0FBRkQsc0VBRUM7QUFFRDtJQUNJLFlBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO0lBQUksQ0FBQztDQUN2QztBQUZELGdGQUVDO0FBRUQ7SUFDSSxZQUFtQixRQUFnQixFQUFTLElBQVksRUFBUyxPQUFlO1FBQTdELGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFJLENBQUM7Q0FDeEY7QUFGRCxvRUFFQztBQUVEO0lBQ0ksWUFBbUIsR0FBUTtRQUFSLFFBQUcsR0FBSCxHQUFHLENBQUs7SUFBSSxDQUFDO0NBQ25DO0FBRkQsb0VBRUM7QUFFRDtJQUNJLFlBQW1CLE9BQXVCO1FBQXZCLFlBQU8sR0FBUCxPQUFPLENBQWdCO0lBQUksQ0FBQztDQUNsRDtBQUZELDRFQUVDO0FBRUQ7SUFDSSxZQUFtQixJQUEyQztRQUEzQyxTQUFJLEdBQUosSUFBSSxDQUF1QztJQUFJLENBQUM7Q0FDdEU7QUFGRCxrRUFFQztBQUVEO0lBQ0ksWUFBbUIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBSSxDQUFDO0NBQzFDO0FBRkQsNENBRUM7QUFFRDtJQUNJLFlBQW1CLGtCQUEwQjtRQUExQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7SUFBSSxDQUFDO0NBQ3JEO0FBRkQsc0NBRUM7QUFFRDtJQUNJLFlBQW1CLFdBQW1CO1FBQW5CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO0lBQUksQ0FBQztDQUM5QztBQUZELDRDQUVDO0FBRUQ7SUFDSSxZQUFtQixXQUFtQjtRQUFuQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtJQUFJLENBQUM7Q0FDOUM7QUFGRCxvREFFQztBQUVEO0lBQ0ksWUFBbUIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBSSxDQUFDO0NBQzFDO0FBRkQsNEJBRUM7QUFFRDtJQUNJLFlBQW1CLE9BQXVDO1FBQXZDLFlBQU8sR0FBUCxPQUFPLENBQWdDO0lBQUksQ0FBQztDQUNsRTtBQUZELDBEQUVDO0FBRUQ7SUFDSSxZQUFtQixVQUFrQjtRQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO0lBQUksQ0FBQztDQUM3QztBQUZELGdEQUVDO0FBRUQ7SUFDSSxZQUFtQixVQUFrQjtRQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO0lBQUksQ0FBQztDQUM3QztBQUZELG9EQUVDO0FBRUQ7SUFDSSxZQUFtQixlQUF1QjtRQUF2QixvQkFBZSxHQUFmLGVBQWUsQ0FBUTtJQUFJLENBQUM7Q0FDbEQ7QUFGRCxrRUFFQztBQUdEO0lBQ0ksWUFBbUIsU0FBaUI7UUFBakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtJQUFJLENBQUM7Q0FDNUM7QUFGRCxnRUFFQztBQUVEO0lBQ0ksWUFBbUIsU0FBaUI7UUFBakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtJQUFJLENBQUM7Q0FDNUM7QUFGRCxvRUFFQztBQUVEO0lBQ0ksWUFBbUIsWUFBb0IsRUFBUyxZQUFvQjtRQUFqRCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUFRO0lBQUksQ0FBQztDQUM1RTtBQUZELHdFQUVDO0FBRUQsaUNBQXlDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBckUsa0VBQXFFO0FBQ3JFLGlDQUF5QyxTQUFRLGdCQUFnQjtDQUFJO0FBQXJFLGtFQUFxRTtBQUNyRSxrQ0FBMEMsU0FBUSxnQkFBZ0I7Q0FBSTtBQUF0RSxvRUFBc0U7QUFDdEUsbUNBQTJDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBdkUsc0VBQXVFO0FBQ3ZFLGdDQUF3QyxTQUFRLGdCQUFnQjtDQUFJO0FBQXBFLGdFQUFvRTtBQUNwRSxxQkFBNkIsU0FBUSxnQkFBZ0I7Q0FBSTtBQUF6RCwwQ0FBeUQ7QUFDekQscUJBQTZCLFNBQVEsZ0JBQWdCO0NBQUk7QUFBekQsMENBQXlEO0FBQ3pELDZCQUFxQyxTQUFRLGdCQUFnQjtDQUFJO0FBQWpFLDBEQUFpRTtBQUNqRSw0QkFBb0MsU0FBUSxnQkFBZ0I7Q0FBSTtBQUFoRSx3REFBZ0U7QUFDaEUsbUNBQTJDLFNBQVEsZ0JBQWdCO0NBQUk7QUFBdkUsc0VBQXVFO0FBQ3ZFLHVCQUErQixTQUFRLGdCQUFnQjtDQUFJO0FBQTNELDhDQUEyRDtBQUMzRCwwQkFBa0MsU0FBUSxnQkFBZ0I7Q0FBSTtBQUE5RCxvREFBOEQ7QUFDOUQsNEJBQW9DLFNBQVEsZ0JBQWdCO0NBQUk7QUFBaEUsd0RBQWdFO0FBQ2hFLGlDQUF5QyxTQUFRLGdCQUFnQjtDQUFJO0FBQXJFLGtFQUFxRTtBQUVyRTtDQUFxRDtBQUFyRCwwQ0FBcUQ7QUFDckQ7Q0FBdUQ7QUFBdkQsOENBQXVEO0FBQ3ZEO0NBQTBEO0FBQTFELG9EQUEwRDtBQUMxRDtDQUFpRTtBQUFqRSxrRUFBaUU7QUFDakU7Q0FBK0Q7QUFBL0QsOERBQStEO0FBQy9EO0NBQXlEO0FBQXpELGtEQUF5RDtBQUN6RDtDQUEyRTtBQUEzRSxzRkFBMkU7QUFDM0U7Q0FBa0U7QUFBbEUsb0VBQWtFO0FBQ2xFO0NBQWtFO0FBQWxFLG9FQUFrRTtBQUNsRTtDQUFvRTtBQUFwRSx3RUFBb0U7QUFDcEU7Q0FBNkQ7QUFBN0QsMERBQTZEO0FBQzdEO0NBQTJEO0FBQTNELHNEQUEyRDtBQUMzRDtDQUE0RDtBQUE1RCx3REFBNEQ7QUFDNUQ7Q0FBOEQ7QUFBOUQsNERBQThEO0FBQzlEO0NBQXNEO0FBQXRELDRDQUFzRDtBQUN0RDtDQUE2RDtBQUE3RCwwREFBNkQifQ==