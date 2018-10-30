"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const BaseStatusBarItemObserver_1 = require("./BaseStatusBarItemObserver");
var StatusBarColors;
(function (StatusBarColors) {
    StatusBarColors["Red"] = "rgb(218,0,0)";
    StatusBarColors["Green"] = "rgb(0,218,0)";
    StatusBarColors["Yellow"] = "rgb(218,218,0)";
})(StatusBarColors = exports.StatusBarColors || (exports.StatusBarColors = {}));
class OmnisharpStatusBarObserver extends BaseStatusBarItemObserver_1.BaseStatusBarItemObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OmnisharpServerOnServerError.name:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Red, 'Error starting OmniSharp');
                    break;
                case loggingEvents_1.OmnisharpServerOnStdErr.name:
                    let msg = event.message;
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Red, `OmniSharp process errored:${msg}`);
                    break;
                case loggingEvents_1.OmnisharpOnBeforeServerInstall.name:
                    this.SetAndShowStatusBar('$(flame) Installing OmniSharp...', 'o.showOutput');
                    break;
                case loggingEvents_1.OmnisharpOnBeforeServerStart.name:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Yellow, 'Starting OmniSharp server');
                    break;
                case loggingEvents_1.OmnisharpServerOnStop.name:
                    this.ResetAndHideStatusBar();
                    break;
                case loggingEvents_1.OmnisharpServerOnStart.name:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', StatusBarColors.Green, 'OmniSharp server is running');
                    break;
                case loggingEvents_1.DownloadStart.name:
                    this.SetAndShowStatusBar("$(cloud-download) Downloading packages", '', '', `Downloading package '${event.packageDescription}...' `);
                    break;
                case loggingEvents_1.InstallationStart.name:
                    this.SetAndShowStatusBar("$(desktop-download) Installing packages...", '', '', `Installing package '${event.packageDescription}'`);
                    break;
                case loggingEvents_1.DownloadProgress.name:
                    let progressEvent = event;
                    this.SetAndShowStatusBar("$(cloud-download) Downloading packages", '', '', `Downloading package '${progressEvent.packageDescription}'... ${progressEvent.downloadPercentage}%`);
                    break;
            }
        };
    }
}
exports.OmnisharpStatusBarObserver = OmnisharpStatusBarObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwU3RhdHVzQmFyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL09tbmlzaGFycFN0YXR1c0Jhck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsOERBQStRO0FBQy9RLDJFQUF3RTtBQUV4RSxJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDdkIsdUNBQW9CLENBQUE7SUFDcEIseUNBQXNCLENBQUE7SUFDdEIsNENBQXlCLENBQUE7QUFDN0IsQ0FBQyxFQUpXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSTFCO0FBRUQsZ0NBQXdDLFNBQVEscURBQXlCO0lBQXpFOztRQUNXLFNBQUksR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtZQUMvQixRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLDRDQUE0QixDQUFDLElBQUk7b0JBQ2xDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLGVBQWUsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztvQkFDdEcsTUFBTTtnQkFDVixLQUFLLHVDQUF1QixDQUFDLElBQUk7b0JBQzdCLElBQUksR0FBRyxHQUE2QixLQUFNLENBQUMsT0FBTyxDQUFDO29CQUNuRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLENBQUMsR0FBRyxFQUFFLDZCQUE2QixHQUFHLEVBQUUsQ0FBQyxDQUFDO29CQUM5RyxNQUFNO2dCQUNWLEtBQUssOENBQThCLENBQUMsSUFBSTtvQkFDcEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtDQUFrQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUM3RSxNQUFNO2dCQUNWLEtBQUssNENBQTRCLENBQUMsSUFBSTtvQkFDbEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDLE1BQU0sRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO29CQUMxRyxNQUFNO2dCQUNWLEtBQUsscUNBQXFCLENBQUMsSUFBSTtvQkFDM0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQzdCLE1BQU07Z0JBQ1YsS0FBSyxzQ0FBc0IsQ0FBQyxJQUFJO29CQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLENBQUMsS0FBSyxFQUFFLDZCQUE2QixDQUFDLENBQUM7b0JBQzNHLE1BQU07Z0JBQ1YsS0FBSyw2QkFBYSxDQUFDLElBQUk7b0JBQ25CLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3Q0FBd0MsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLHdCQUF3QyxLQUFNLENBQUMsa0JBQWtCLE9BQU8sQ0FBQyxDQUFDO29CQUNySixNQUFNO2dCQUNWLEtBQUssaUNBQWlCLENBQUMsSUFBSTtvQkFDdkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDRDQUE0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsdUJBQTJDLEtBQU0sQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7b0JBQ3hKLE1BQU07Z0JBQ1YsS0FBSyxnQ0FBZ0IsQ0FBQyxJQUFJO29CQUN0QixJQUFJLGFBQWEsR0FBcUIsS0FBSyxDQUFDO29CQUM1QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsd0NBQXdDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSx3QkFBd0IsYUFBYSxDQUFDLGtCQUFrQixRQUFRLGFBQWEsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7b0JBQ2hMLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQUNMLENBQUM7Q0FBQTtBQWxDRCxnRUFrQ0MifQ==