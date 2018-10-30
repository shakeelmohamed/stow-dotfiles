"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
class BaseLoggerObserver {
    constructor(channel) {
        if (channel instanceof logger_1.Logger) {
            this.logger = channel;
        }
        else {
            this.logger = new logger_1.Logger((message) => channel.append(message));
        }
    }
}
exports.BaseLoggerObserver = BaseLoggerObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUxvZ2dlck9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9CYXNlTG9nZ2VyT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUdoRyxzQ0FBbUM7QUFHbkM7SUFFSSxZQUFZLE9BQXNDO1FBQzlDLElBQUksT0FBTyxZQUFZLGVBQU0sRUFBRTtZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztTQUN6QjthQUNJO1lBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO0lBQ0wsQ0FBQztDQUdKO0FBWkQsZ0RBWUMifQ==