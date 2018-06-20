"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const BaseStatusBarItemObserver_1 = require("./BaseStatusBarItemObserver");
class ProjectStatusBarObserver extends BaseStatusBarItemObserver_1.BaseStatusBarItemObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OmnisharpOnMultipleLaunchTargets.name:
                    this.SetAndShowStatusBar('$(file-submodule) Select project', 'o.pickProjectAndStart', 'rgb(90, 218, 90)');
                    break;
                case loggingEvents_1.OmnisharpServerOnStop.name:
                    this.ResetAndHideStatusBar();
                    break;
                case loggingEvents_1.WorkspaceInformationUpdated.name:
                    this.handleWorkspaceInformationUpdated(event);
            }
        };
    }
    handleWorkspaceInformationUpdated(event) {
        let label;
        let info = event.info;
        if (info.MsBuild && info.MsBuild.SolutionPath) {
            label = path_1.basename(info.MsBuild.SolutionPath); //workspace.getRelativePath(info.MsBuild.SolutionPath);
            this.SetAndShowStatusBar('$(file-directory) ' + label, 'o.pickProjectAndStart');
        }
        else {
            this.ResetAndHideStatusBar();
        }
    }
}
exports.ProjectStatusBarObserver = ProjectStatusBarObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvamVjdFN0YXR1c0Jhck9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9Qcm9qZWN0U3RhdHVzQmFyT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRywrQkFBZ0M7QUFDaEMsOERBQTZJO0FBQzdJLDJFQUF3RTtBQUV4RSw4QkFBc0MsU0FBUSxxREFBeUI7SUFBdkU7O1FBRVcsU0FBSSxHQUFHLENBQUMsS0FBZ0IsRUFBRSxFQUFFO1lBQy9CLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssZ0RBQWdDLENBQUMsSUFBSTtvQkFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtDQUFrQyxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixDQUFDLENBQUM7b0JBQzFHLE1BQU07Z0JBQ1YsS0FBSyxxQ0FBcUIsQ0FBQyxJQUFJO29CQUMzQixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDN0IsTUFBTTtnQkFDVixLQUFLLDJDQUEyQixDQUFDLElBQUk7b0JBQ2pDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBOEIsS0FBSyxDQUFDLENBQUM7YUFDbEY7UUFDTCxDQUFDLENBQUE7SUFhTCxDQUFDO0lBWFcsaUNBQWlDLENBQUMsS0FBa0M7UUFDeEUsSUFBSSxLQUFhLENBQUM7UUFDbEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7WUFDM0MsS0FBSyxHQUFHLGVBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsdURBQXVEO1lBQ3BHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztTQUNuRjthQUNJO1lBQ0QsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7U0FDaEM7SUFDTCxDQUFDO0NBQ0o7QUExQkQsNERBMEJDIn0=