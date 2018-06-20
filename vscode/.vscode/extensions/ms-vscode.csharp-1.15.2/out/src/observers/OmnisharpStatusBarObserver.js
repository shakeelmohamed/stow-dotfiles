"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const BaseStatusBarItemObserver_1 = require("./BaseStatusBarItemObserver");
class OmnisharpStatusBarObserver extends BaseStatusBarItemObserver_1.BaseStatusBarItemObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OmnisharpServerOnServerError.name:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', 'rgb(218,0,0)', 'Error starting OmniSharp');
                    break;
                case loggingEvents_1.OmnisharpOnBeforeServerInstall.name:
                    this.SetAndShowStatusBar('$(flame) Installing OmniSharp...', 'o.showOutput');
                    break;
                case loggingEvents_1.OmnisharpOnBeforeServerStart.name:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', 'rgb(218,218,0)', 'Starting OmniSharp server');
                    break;
                case loggingEvents_1.OmnisharpServerOnStop.name:
                    this.ResetAndHideStatusBar();
                    break;
                case loggingEvents_1.OmnisharpServerOnStart.name:
                    this.SetAndShowStatusBar('$(flame)', 'o.showOutput', 'rgb(0, 218, 0)', 'OmniSharp server is running');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwU3RhdHVzQmFyT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL09tbmlzaGFycFN0YXR1c0Jhck9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsOERBQXNQO0FBQ3RQLDJFQUF3RTtBQUV4RSxnQ0FBd0MsU0FBUSxxREFBeUI7SUFBekU7O1FBQ1csU0FBSSxHQUFHLENBQUMsS0FBZ0IsRUFBRSxFQUFFO1lBQy9CLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssNENBQTRCLENBQUMsSUFBSTtvQkFDbEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixDQUFDLENBQUM7b0JBQ2pHLE1BQU07Z0JBQ1YsS0FBSyw4Q0FBOEIsQ0FBQyxJQUFJO29CQUNwQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsa0NBQWtDLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQzdFLE1BQU07Z0JBQ1YsS0FBSyw0Q0FBNEIsQ0FBQyxJQUFJO29CQUNsQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO29CQUNwRyxNQUFNO2dCQUNWLEtBQUsscUNBQXFCLENBQUMsSUFBSTtvQkFDM0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQzdCLE1BQU07Z0JBQ1YsS0FBSyxzQ0FBc0IsQ0FBQyxJQUFJO29CQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29CQUN0RyxNQUFNO2dCQUNWLEtBQUssNkJBQWEsQ0FBQyxJQUFJO29CQUNuQixJQUFJLENBQUMsbUJBQW1CLENBQUMsd0NBQXdDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSx3QkFBd0MsS0FBTSxDQUFDLGtCQUFrQixPQUFPLENBQUMsQ0FBQztvQkFDckosTUFBTTtnQkFDVixLQUFLLGlDQUFpQixDQUFDLElBQUk7b0JBQ3ZCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyw0Q0FBNEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLHVCQUEyQyxLQUFNLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO29CQUN4SixNQUFNO2dCQUNWLEtBQUssZ0NBQWdCLENBQUMsSUFBSTtvQkFDdEIsSUFBSSxhQUFhLEdBQXFCLEtBQUssQ0FBQztvQkFDNUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHdDQUF3QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsd0JBQXdCLGFBQWEsQ0FBQyxrQkFBa0IsUUFBUSxhQUFhLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO29CQUNoTCxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0NBQUE7QUE5QkQsZ0VBOEJDIn0=