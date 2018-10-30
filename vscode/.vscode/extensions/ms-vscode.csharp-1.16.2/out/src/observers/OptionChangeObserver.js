"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const ShowInformationMessage_1 = require("./utils/ShowInformationMessage");
const Disposable_1 = require("../Disposable");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/distinctUntilChanged");
function ConfigChangeObservable(optionObservable) {
    let options;
    return optionObservable.filter(newOptions => {
        let changed = (options && hasChanged(options, newOptions));
        options = newOptions;
        return changed;
    });
}
function ShowOmniSharpConfigChangePrompt(optionObservable, vscode) {
    let subscription = ConfigChangeObservable(optionObservable)
        .subscribe(_ => {
        let message = "OmniSharp configuration has changed. Would you like to relaunch the OmniSharp server with your changes?";
        ShowInformationMessage_1.default(vscode, message, { title: "Restart OmniSharp", command: 'o.restart' });
    });
    return new Disposable_1.default(subscription);
}
exports.ShowOmniSharpConfigChangePrompt = ShowOmniSharpConfigChangePrompt;
function hasChanged(oldOptions, newOptions) {
    return (oldOptions.path != newOptions.path ||
        oldOptions.useGlobalMono != newOptions.useGlobalMono ||
        oldOptions.waitForDebugger != newOptions.waitForDebugger);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uQ2hhbmdlT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL09wdGlvbkNoYW5nZU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFJaEcsMkVBQW9FO0FBRXBFLDhDQUF1QztBQUN2QyxvQ0FBa0M7QUFDbEMsa0RBQWdEO0FBRWhELGdDQUFnQyxnQkFBcUM7SUFDakUsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLE9BQU8sZ0JBQWdCLENBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQ3pDLElBQUksT0FBTyxHQUFHLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzRCxPQUFPLEdBQUcsVUFBVSxDQUFDO1FBQ3JCLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHlDQUFnRCxnQkFBcUMsRUFBRSxNQUFjO0lBQ2pHLElBQUksWUFBWSxHQUFHLHNCQUFzQixDQUFDLGdCQUFnQixDQUFDO1NBQ3RELFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNYLElBQUksT0FBTyxHQUFHLHlHQUF5RyxDQUFDO1FBQ3hILGdDQUFzQixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDbEcsQ0FBQyxDQUFDLENBQUM7SUFFUCxPQUFPLElBQUksb0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBUkQsMEVBUUM7QUFFRCxvQkFBb0IsVUFBbUIsRUFBRSxVQUFtQjtJQUN4RCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSTtRQUN0QyxVQUFVLENBQUMsYUFBYSxJQUFJLFVBQVUsQ0FBQyxhQUFhO1FBQ3BELFVBQVUsQ0FBQyxlQUFlLElBQUksVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2xFLENBQUMifQ==