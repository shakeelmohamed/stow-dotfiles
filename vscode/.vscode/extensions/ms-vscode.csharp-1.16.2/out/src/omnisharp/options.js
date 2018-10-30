"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class Options {
    constructor(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning, defaultLaunchSolution, monoPath) {
        this.path = path;
        this.useGlobalMono = useGlobalMono;
        this.waitForDebugger = waitForDebugger;
        this.loggingLevel = loggingLevel;
        this.autoStart = autoStart;
        this.projectLoadTimeout = projectLoadTimeout;
        this.maxProjectResults = maxProjectResults;
        this.useEditorFormattingSettings = useEditorFormattingSettings;
        this.useFormatting = useFormatting;
        this.showReferencesCodeLens = showReferencesCodeLens;
        this.showTestsCodeLens = showTestsCodeLens;
        this.disableCodeActions = disableCodeActions;
        this.disableMSBuildDiagnosticWarning = disableMSBuildDiagnosticWarning;
        this.defaultLaunchSolution = defaultLaunchSolution;
        this.monoPath = monoPath;
    }
    static Read(vscode) {
        // Extra effort is taken below to ensure that legacy versions of options
        // are supported below. In particular, these are:
        //
        // - "csharp.omnisharp" -> "omnisharp.path"
        // - "csharp.omnisharpUsesMono" -> "omnisharp.useMono"
        // - "omnisharp.useMono" -> "omnisharp.useGlobalMono"
        const omnisharpConfig = vscode.workspace.getConfiguration('omnisharp');
        const csharpConfig = vscode.workspace.getConfiguration('csharp');
        const path = Options.readPathOption(csharpConfig, omnisharpConfig);
        const useGlobalMono = Options.readUseGlobalMonoOption(omnisharpConfig, csharpConfig);
        const monoPath = omnisharpConfig.get('monoPath', undefined) || undefined;
        const waitForDebugger = omnisharpConfig.get('waitForDebugger', false);
        // support the legacy "verbose" level as "debug"
        let loggingLevel = omnisharpConfig.get('loggingLevel', 'information');
        if (loggingLevel && loggingLevel.toLowerCase() === 'verbose') {
            loggingLevel = 'debug';
        }
        const autoStart = omnisharpConfig.get('autoStart', true);
        const projectLoadTimeout = omnisharpConfig.get('projectLoadTimeout', 60);
        const maxProjectResults = omnisharpConfig.get('maxProjectResults', 250);
        const defaultLaunchSolution = omnisharpConfig.get('defaultLaunchSolution', undefined);
        const useEditorFormattingSettings = omnisharpConfig.get('useEditorFormattingSettings', true);
        const useFormatting = csharpConfig.get('format.enable', true);
        const showReferencesCodeLens = csharpConfig.get('referencesCodeLens.enabled', true);
        const showTestsCodeLens = csharpConfig.get('testsCodeLens.enabled', true);
        const disableCodeActions = csharpConfig.get('disableCodeActions', false);
        const disableMSBuildDiagnosticWarning = omnisharpConfig.get('disableMSBuildDiagnosticWarning', false);
        return new Options(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning, defaultLaunchSolution, monoPath);
    }
    static readPathOption(csharpConfig, omnisharpConfig) {
        if (omnisharpConfig.has('path')) {
            // If 'omnisharp.path' setting was found, use it.
            return omnisharpConfig.get('path');
        }
        else if (csharpConfig.has('omnisharp')) {
            // BACKCOMPAT: If 'csharp.omnisharp' setting was found, use it.
            return csharpConfig.get('omnisharp');
        }
        else {
            // Otherwise, null.
            return null;
        }
    }
    static readUseGlobalMonoOption(omnisharpConfig, csharpConfig) {
        function toUseGlobalMonoValue(value) {
            // True means 'always' and false means 'auto'.
            return value ? "always" : "auto";
        }
        if (omnisharpConfig.has('useGlobalMono')) {
            // If 'omnisharp.useGlobalMono' setting was found, just use it.
            return omnisharpConfig.get('useGlobalMono', "auto");
        }
        else if (omnisharpConfig.has('useMono')) {
            // BACKCOMPAT: If 'omnisharp.useMono' setting was found, true maps to "always" and false maps to "auto"
            return toUseGlobalMonoValue(omnisharpConfig.get('useMono'));
        }
        else if (csharpConfig.has('omnisharpUsesMono')) {
            // BACKCOMPAT: If 'csharp.omnisharpUsesMono' setting was found, true maps to "always" and false maps to "auto" 
            return toUseGlobalMonoValue(csharpConfig.get('omnisharpUsesMono'));
        }
        else {
            // Otherwise, the default value is "auto".
            return "auto";
        }
    }
}
exports.Options = Options;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBSWhHO0lBQ0ksWUFDVyxJQUFZLEVBQ1osYUFBcUIsRUFDckIsZUFBd0IsRUFDeEIsWUFBb0IsRUFDcEIsU0FBa0IsRUFDbEIsa0JBQTBCLEVBQzFCLGlCQUF5QixFQUN6QiwyQkFBb0MsRUFDcEMsYUFBc0IsRUFDdEIsc0JBQStCLEVBQy9CLGlCQUEwQixFQUMxQixrQkFBMkIsRUFDM0IsK0JBQXdDLEVBQ3hDLHFCQUE4QixFQUM5QixRQUFpQjtRQWRqQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osa0JBQWEsR0FBYixhQUFhLENBQVE7UUFDckIsb0JBQWUsR0FBZixlQUFlLENBQVM7UUFDeEIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUNsQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7UUFDMUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFRO1FBQ3pCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBUztRQUNwQyxrQkFBYSxHQUFiLGFBQWEsQ0FBUztRQUN0QiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQVM7UUFDL0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztRQUMzQixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQVM7UUFDeEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFTO1FBQzlCLGFBQVEsR0FBUixRQUFRLENBQVM7SUFBSSxDQUFDO0lBRzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBYztRQUM3Qix3RUFBd0U7UUFDeEUsaURBQWlEO1FBQ2pELEVBQUU7UUFDRiwyQ0FBMkM7UUFDM0Msc0RBQXNEO1FBQ3RELHFEQUFxRDtRQUVyRCxNQUFNLGVBQWUsR0FB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