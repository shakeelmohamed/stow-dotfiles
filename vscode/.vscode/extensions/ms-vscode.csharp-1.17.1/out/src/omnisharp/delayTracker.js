"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const ImmedateDelayMax = 25;
const NearImmediateDelayMax = 50;
const ShortDelayMax = 250;
const MediumDelayMax = 500;
const IdleDelayMax = 1500;
const NonFocusDelayMax = 3000;
class DelayTracker {
    constructor(name) {
        this._immediateDelays = 0; // 0-25 milliseconds
        this._nearImmediateDelays = 0; // 26-50 milliseconds
        this._shortDelays = 0; // 51-250 milliseconds
        this._mediumDelays = 0; // 251-500 milliseconds
        this._idleDelays = 0; // 501-1500 milliseconds
        this._nonFocusDelays = 0; // 1501-3000 milliseconds
        this._bigDelays = 0; // 3000+ milliseconds
        this._name = name;
    }
    reportDelay(elapsedTime) {
        if (elapsedTime <= ImmedateDelayMax) {
            this._immediateDelays += 1;
        }
        else if (elapsedTime <= NearImmediateDelayMax) {
            this._nearImmediateDelays += 1;
        }
        else if (elapsedTime <= ShortDelayMax) {
            this._shortDelays += 1;
        }
        else if (elapsedTime <= MediumDelayMax) {
            this._mediumDelays += 1;
        }
        else if (elapsedTime <= IdleDelayMax) {
            this._idleDelays += 1;
        }
        else if (elapsedTime <= NonFocusDelayMax) {
            this._nonFocusDelays += 1;
        }
        else {
            this._bigDelays += 1;
        }
    }
    name() {
        return this._name;
    }
    clearMeasures() {
        this._immediateDelays = 0;
        this._nearImmediateDelays = 0;
        this._shortDelays = 0;
        this._mediumDelays = 0;
        this._idleDelays = 0;
        this._nonFocusDelays = 0;
        this._bigDelays = 0;
    }
    hasMeasures() {
        return this._immediateDelays > 0
            || this._nearImmediateDelays > 0
            || this._shortDelays > 0
            || this._mediumDelays > 0
            || this._idleDelays > 0
            || this._nonFocusDelays > 0
            || this._bigDelays > 0;
    }
    getMeasures() {
        return {
            immediateDelays: this._immediateDelays,
            nearImmediateDelays: this._nearImmediateDelays,
            shortDelays: this._shortDelays,
            mediumDelays: this._mediumDelays,
            idleDelays: this._idleDelays,
            nonFocusDelays: this._nonFocusDelays,
            bigDelays: this._bigDelays
        };
    }
}
exports.DelayTracker = DelayTracker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsYXlUcmFja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9kZWxheVRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyxNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQUM1QixNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztBQUNqQyxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7QUFDMUIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBQzNCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQztBQUMxQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUU5QjtJQVdJLFlBQVksSUFBWTtRQVJoQixxQkFBZ0IsR0FBVyxDQUFDLENBQUMsQ0FBTSxvQkFBb0I7UUFDdkQseUJBQW9CLEdBQVcsQ0FBQyxDQUFDLENBQUUscUJBQXFCO1FBQ3hELGlCQUFZLEdBQVcsQ0FBQyxDQUFDLENBQVUsc0JBQXNCO1FBQ3pELGtCQUFhLEdBQVcsQ0FBQyxDQUFDLENBQVMsdUJBQXVCO1FBQzFELGdCQUFXLEdBQVcsQ0FBQyxDQUFDLENBQVcsd0JBQXdCO1FBQzNELG9CQUFlLEdBQVcsQ0FBQyxDQUFDLENBQU8seUJBQXlCO1FBQzVELGVBQVUsR0FBVyxDQUFDLENBQUMsQ0FBWSxxQkFBcUI7UUFHNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVNLFdBQVcsQ0FBQyxXQUFtQjtRQUNsQyxJQUFJLFdBQVcsSUFBSSxnQkFBZ0IsRUFBRTtZQUNqQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxDQUFDO1NBQzlCO2FBQ0ksSUFBSSxXQUFXLElBQUkscUJBQXFCLEVBQUU7WUFDM0MsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsQ0FBQztTQUNsQzthQUNJLElBQUksV0FBVyxJQUFJLGFBQWEsRUFBRTtZQUNuQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztTQUMxQjthQUNJLElBQUksV0FBVyxJQUFJLGNBQWMsRUFBRTtZQUNwQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQztTQUMzQjthQUNJLElBQUksV0FBVyxJQUFJLFlBQVksRUFBRTtZQUNsQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztTQUN6QjthQUNJLElBQUksV0FBVyxJQUFJLGdCQUFnQixFQUFFO1lBQ3RDLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDO1NBQzdCO2FBQ0k7WUFDRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztTQUN4QjtJQUNMLENBQUM7SUFFTSxJQUFJO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFTSxhQUFhO1FBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUM7ZUFDekIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUM7ZUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDO2VBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQztlQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUM7ZUFDcEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDO2VBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxXQUFXO1FBQ2QsT0FBTztZQUNILGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3RDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7WUFDOUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO1lBQzlCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNoQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDNUIsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3BDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtTQUM3QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBMUVELG9DQTBFQyJ9