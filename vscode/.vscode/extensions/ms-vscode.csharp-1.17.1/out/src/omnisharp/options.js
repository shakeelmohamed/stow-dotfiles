"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class Options {
    constructor(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning, minFindSymbolsFilterLength, maxFindSymbolsItems, razorDisabled, razorDevMode, razorPluginPath, defaultLaunchSolution, monoPath) {
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
        this.minFindSymbolsFilterLength = minFindSymbolsFilterLength;
        this.maxFindSymbolsItems = maxFindSymbolsItems;
        this.razorDisabled = razorDisabled;
        this.razorDevMode = razorDevMode;
        this.razorPluginPath = razorPluginPath;
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
        const razorConfig = vscode.workspace.getConfiguration('razor');
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
        const minFindSymbolsFilterLength = omnisharpConfig.get('minFindSymbolsFilterLength', 0);
        const maxFindSymbolsItems = omnisharpConfig.get('maxFindSymbolsItems', 1000); // The limit is applied only when this setting is set to a number greater than zero
        const razorDisabled = !!razorConfig && razorConfig.get('disabled', false);
        const razorDevMode = !!razorConfig && razorConfig.get('devmode', false);
        const razorPluginPath = razorConfig ? razorConfig.get('plugin.path', undefined) : undefined;
        return new Options(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning, minFindSymbolsFilterLength, maxFindSymbolsItems, razorDisabled, razorDevMode, razorPluginPath, defaultLaunchSolution, monoPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBSWhHO0lBQ0ksWUFDVyxJQUFZLEVBQ1osYUFBcUIsRUFDckIsZUFBd0IsRUFDeEIsWUFBb0IsRUFDcEIsU0FBa0IsRUFDbEIsa0JBQTBCLEVBQzFCLGlCQUF5QixFQUN6QiwyQkFBb0MsRUFDcEMsYUFBc0IsRUFDdEIsc0JBQStCLEVBQy9CLGlCQUEwQixFQUMxQixrQkFBMkIsRUFDM0IsK0JBQXdDLEVBQ3hDLDBCQUFrQyxFQUNsQyxtQkFBMkIsRUFDM0IsYUFBc0IsRUFDdEIsWUFBcUIsRUFDckIsZUFBd0IsRUFDeEIscUJBQThCLEVBQzlCLFFBQWlCO1FBbkJqQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osa0JBQWEsR0FBYixhQUFhLENBQVE7UUFDckIsb0JBQWUsR0FBZixlQUFlLENBQVM7UUFDeEIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUNsQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7UUFDMUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFRO1FBQ3pCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBUztRQUNwQyxrQkFBYSxHQUFiLGFBQWEsQ0FBUztRQUN0QiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQVM7UUFDL0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztRQUMzQixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQVM7UUFDeEMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFRO1FBQ2xDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtRQUMzQixrQkFBYSxHQUFiLGFBQWEsQ0FBUztRQUN0QixpQkFBWSxHQUFaLFlBQVksQ0FBUztRQUNyQixvQkFBZSxH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