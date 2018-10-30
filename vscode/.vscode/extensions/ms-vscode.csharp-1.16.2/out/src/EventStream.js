"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const Subject_1 = require("rxjs/Subject");
class EventStream {
    constructor() {
        this.sink = new Subject_1.Subject();
    }
    post(event) {
        this.sink.next(event);
    }
    subscribe(eventHandler) {
        return this.sink.subscribe(eventHandler);
    }
}
exports.EventStream = EventStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRXZlbnRTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7O2dHQUdnRztBQUNoRywwQ0FBdUM7QUFJdkM7SUFHSTtRQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxpQkFBTyxFQUFhLENBQUM7SUFDekMsQ0FBQztJQUVNLElBQUksQ0FBQyxLQUFnQjtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sU0FBUyxDQUFDLFlBQXdDO1FBQ3JELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKO0FBZEQsa0NBY0MifQ==