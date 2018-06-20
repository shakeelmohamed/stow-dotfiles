"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class Options {
    constructor(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning) {
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
        const waitForDebugger = omnisharpConfig.get('waitForDebugger', false);
        // support the legacy "verbose" level as "debug"
        let loggingLevel = omnisharpConfig.get('loggingLevel', 'information');
        if (loggingLevel && loggingLevel.toLowerCase() === 'verbose') {
            loggingLevel = 'debug';
        }
        const autoStart = omnisharpConfig.get('autoStart', true);
        const projectLoadTimeout = omnisharpConfig.get('projectLoadTimeout', 60);
        const maxProjectResults = omnisharpConfig.get('maxProjectResults', 250);
        const useEditorFormattingSettings = omnisharpConfig.get('useEditorFormattingSettings', true);
        const useFormatting = csharpConfig.get('format.enable', true);
        const showReferencesCodeLens = csharpConfig.get('referencesCodeLens.enabled', true);
        const showTestsCodeLens = csharpConfig.get('testsCodeLens.enabled', true);
        const disableCodeActions = csharpConfig.get('disableCodeActions', false);
        const disableMSBuildDiagnosticWarning = omnisharpConfig.get('disableMSBuildDiagnosticWarning', false);
        return new Options(path, useGlobalMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions, disableMSBuildDiagnosticWarning);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBSWhHO0lBQ0ksWUFDVyxJQUFZLEVBQ1osYUFBcUIsRUFDckIsZUFBd0IsRUFDeEIsWUFBb0IsRUFDcEIsU0FBa0IsRUFDbEIsa0JBQTBCLEVBQzFCLGlCQUF5QixFQUN6QiwyQkFBb0MsRUFDcEMsYUFBc0IsRUFDdEIsc0JBQStCLEVBQy9CLGlCQUEwQixFQUMxQixrQkFBMkIsRUFDM0IsK0JBQXdDO1FBWnhDLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUNyQixvQkFBZSxHQUFmLGVBQWUsQ0FBUztRQUN4QixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixjQUFTLEdBQVQsU0FBUyxDQUFTO1FBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUTtRQUMxQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVE7UUFDekIsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFTO1FBQ3BDLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1FBQ3RCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBUztRQUMvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFDMUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFTO1FBQzNCLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBUztJQUFJLENBQUM7SUFFakQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFjO1FBQzdCLHdFQUF3RTtRQUN4RSxpREFBaUQ7UUFDakQsRUFBRTtRQUNGLDJDQUEyQztRQUMzQyxzREFBc0Q7UUFDdEQscURBQXFEO1FBRXJELE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkUsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNuRSxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRXJGLE1BQU0sZUFBZSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQVUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFL0UsZ0RBQWdEO1FBQ2hELElBQUksWUFBWSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQVMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzlFLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxTQUFTLEVBQUU7WUFDMUQsWUFBWSxHQUFHLE9BQU8sQ0FBQztTQUMxQjtRQUVELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQVUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxFLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBUyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRixNQUFNLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQVMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEYsTUFBTSwyQkFBMkIsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFVLDZCQUE2QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXRHLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQVUsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZFLE1BQU0sc0JBQXNCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBVSw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RixNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQVUsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbkYsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFVLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxGLE1BQU0sK0JBQStCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBVSxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUvRyxPQUFPLElBQUksT0FBTyxDQUNkLElBQUksRUFDSixhQUFhLEVBQ2IsZUFBZSxFQUNmLFlBQVksRUFDWixTQUFTLEVBQ1Qsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQiwyQkFBMkIsRUFDM0IsYUFBYSxFQUNiLHNCQUFzQixFQUN0QixpQkFBaUIsRUFDakIsa0JBQWtCLEVBQ2xCLCtCQUErQixDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVPLE1BQU0sQ0FBQyxjQUFjLENBQUMsWUFBb0MsRUFBRSxlQUF1QztRQUN2RyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDN0IsaURBQWlEO1lBQ2pELE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBUyxNQUFNLENBQUMsQ0FBQztTQUM5QzthQUNJLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNwQywrREFBK0Q7WUFDL0QsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFTLFdBQVcsQ0FBQyxDQUFDO1NBQ2hEO2FBQ0k7WUFDRCxtQkFBbUI7WUFDbkIsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsdUJBQXVCLENBQUMsZUFBdUMsRUFBRSxZQUFvQztRQUNoSCw4QkFBOEIsS0FBYztZQUN4Qyw4Q0FBOEM7WUFDOUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDdEMsK0RBQStEO1lBQy9ELE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBUyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDL0Q7YUFDSSxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDckMsdUdBQXVHO1lBQ3ZHLE9BQU8sb0JBQW9CLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBVSxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ3hFO2FBQ0ksSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLEVBQUU7WUFDNUMsK0dBQStHO1lBQy9HLE9BQU8sb0JBQW9CLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBVSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7U0FDL0U7YUFDSTtZQUNELDBDQUEwQztZQUMxQyxPQUFPLE1BQU0sQ0FBQztTQUNqQjtJQUNMLENBQUM7Q0FDSjtBQTNHRCwwQkEyR0MifQ==