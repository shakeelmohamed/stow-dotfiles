"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Subscription_1 = require("rxjs/Subscription");
const Disposable_1 = require("./Disposable");
class CompositeDisposable extends Disposable_1.default {
    constructor(...disposables) {
        super(() => this.disposables.unsubscribe());
        this.disposables = new Subscription_1.Subscription();
        for (const disposable of disposables) {
            if (disposable) {
                this.add(disposable);
            }
            else {
                throw new Error("null disposables are not supported");
            }
        }
    }
    add(disposable) {
        if (!disposable) {
            throw new Error("disposable cannot be null");
        }
        this.disposables.add(() => disposable.dispose());
    }
}
exports.default = CompositeDisposable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9zaXRlRGlzcG9zYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db21wb3NpdGVEaXNwb3NhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsb0RBQWlEO0FBQ2pELDZDQUF1RDtBQUV2RCx5QkFBeUMsU0FBUSxvQkFBVTtJQUd2RCxZQUFZLEdBQUcsV0FBMEI7UUFDckMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUh4QyxnQkFBVyxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO1FBS3JDLEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO1lBQ2xDLElBQUksVUFBVSxFQUFFO2dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDeEI7aUJBQ0k7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2FBQ3pEO1NBQ0o7SUFDTCxDQUFDO0lBRU0sR0FBRyxDQUFDLFVBQXVCO1FBQzlCLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0o7QUF2QkQsc0NBdUJDIn0=