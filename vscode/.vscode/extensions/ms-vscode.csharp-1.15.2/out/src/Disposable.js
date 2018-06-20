"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const Subscription_1 = require("rxjs/Subscription");
class Disposable {
    constructor(onDispose) {
        this.dispose = () => {
            this.onDispose();
        };
        if (!onDispose) {
            throw new Error("onDispose cannot be null or empty.");
        }
        if (onDispose instanceof Subscription_1.Subscription) {
            this.onDispose = () => onDispose.unsubscribe();
        }
        else {
            this.onDispose = onDispose;
        }
    }
}
exports.default = Disposable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcG9zYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EaXNwb3NhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7OztnR0FHZ0c7QUFDaEcsb0RBQWlEO0FBRWpEO0lBR0ksWUFBWSxTQUFzQztRQWEzQyxZQUFPLEdBQUcsR0FBUyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUE7UUFkRyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsSUFBSSxTQUFTLFlBQVksMkJBQVksRUFBRTtZQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNsRDthQUNJO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDOUI7SUFDTCxDQUFDO0NBS0o7QUFuQkQsNkJBbUJDIn0=