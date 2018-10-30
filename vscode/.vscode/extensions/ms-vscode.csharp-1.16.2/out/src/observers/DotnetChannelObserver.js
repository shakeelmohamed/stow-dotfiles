"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const BaseChannelObserver_1 = require("./BaseChannelObserver");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class DotNetChannelObserver extends BaseChannelObserver_1.BaseChannelObserver {
    constructor() {
        super(...arguments);
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.CommandDotNetRestoreStart.name:
                    this.clearChannel();
                    this.showChannel();
                    break;
            }
        };
    }
}
exports.DotNetChannelObserver = DotNetChannelObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG90bmV0Q2hhbm5lbE9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9Eb3RuZXRDaGFubmVsT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRywrREFBNEQ7QUFDNUQsOERBQWtGO0FBRWxGLDJCQUFtQyxTQUFRLHlDQUFtQjtJQUE5RDs7UUFDVyxTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyx5Q0FBeUIsQ0FBQyxJQUFJO29CQUMvQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbkIsTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztDQUFBO0FBVEQsc0RBU0MifQ==