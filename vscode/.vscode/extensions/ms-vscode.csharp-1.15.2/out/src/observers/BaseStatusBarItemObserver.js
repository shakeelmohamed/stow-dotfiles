"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class BaseStatusBarItemObserver {
    constructor(statusBarItem) {
        this.statusBarItem = statusBarItem;
    }
    SetAndShowStatusBar(text, command, color, tooltip) {
        this.statusBarItem.text = text;
        this.statusBarItem.command = command;
        this.statusBarItem.color = color;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.show();
    }
    ResetAndHideStatusBar() {
        this.statusBarItem.text = undefined;
        this.statusBarItem.command = undefined;
        this.statusBarItem.color = undefined;
        this.statusBarItem.tooltip = undefined;
        this.statusBarItem.hide();
    }
}
exports.BaseStatusBarItemObserver = BaseStatusBarItemObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVN0YXR1c0Jhckl0ZW1PYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYnNlcnZlcnMvQmFzZVN0YXR1c0Jhckl0ZW1PYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBS2hHO0lBRUksWUFBb0IsYUFBNEI7UUFBNUIsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDaEQsQ0FBQztJQUVNLG1CQUFtQixDQUFDLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBYyxFQUFFLE9BQWdCO1FBQ3RGLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTSxxQkFBcUI7UUFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDOUIsQ0FBQztDQUdKO0FBdEJELDhEQXNCQyJ9