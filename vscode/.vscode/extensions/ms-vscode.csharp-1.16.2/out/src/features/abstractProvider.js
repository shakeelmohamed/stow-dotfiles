"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CompositeDisposable_1 = require("../CompositeDisposable");
class AbstractProvider {
    constructor(server) {
        this.dispose = () => {
            this._disposables.dispose();
        };
        this._server = server;
        this._disposables = new CompositeDisposable_1.default();
    }
    addDisposables(disposables) {
        this._disposables.add(disposables);
    }
}
exports.default = AbstractProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9hYnN0cmFjdFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcsZ0VBQXlEO0FBRXpEO0lBS0ksWUFBWSxNQUF1QjtRQVNuQyxZQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ1gsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUE7UUFWRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksNkJBQW1CLEVBQUUsQ0FBQztJQUNsRCxDQUFDO0lBRVMsY0FBYyxDQUFDLFdBQWdDO1FBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Q0FLSjtBQWpCRCxtQ0FpQkMifQ==