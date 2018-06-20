"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
let Subscriber;
function SubscribeToAllLoggers(subscriber) {
    Subscriber = subscriber;
}
exports.SubscribeToAllLoggers = SubscribeToAllLoggers;
class Logger {
    constructor(writer, prefix) {
        this._indentLevel = 0;
        this._indentSize = 4;
        this._atLineStart = false;
        this._writer = writer;
        this._prefix = prefix;
    }
    _appendCore(message) {
        if (this._atLineStart) {
            if (this._indentLevel > 0) {
                const indent = " ".repeat(this._indentLevel * this._indentSize);
                this.write(indent);
            }
            if (this._prefix) {
                this.write(`[${this._prefix}] `);
            }
            this._atLineStart = false;
        }
        this.write(message);
    }
    increaseIndent() {
        this._indentLevel += 1;
    }
    decreaseIndent() {
        if (this._indentLevel > 0) {
            this._indentLevel -= 1;
        }
    }
    append(message) {
        message = message || "";
        this._appendCore(message);
    }
    appendLine(message) {
        message = message || "";
        this._appendCore(message + '\n');
        this._atLineStart = true;
    }
    write(message) {
        this._writer(message);
        if (Subscriber) {
            Subscriber(message);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLElBQUksVUFBcUMsQ0FBQztBQUUxQywrQkFBc0MsVUFBb0M7SUFDdEUsVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM1QixDQUFDO0FBRkQsc0RBRUM7QUFFRDtJQVFJLFlBQVksTUFBaUMsRUFBRSxNQUFlO1FBSnRELGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBQ3pCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBR2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQzFCLENBQUM7SUFFTyxXQUFXLENBQUMsT0FBZTtRQUMvQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN0QjtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7YUFDcEM7WUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztTQUM3QjtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLGNBQWM7UUFDakIsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLGNBQWM7UUFDakIsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBZ0I7UUFDMUIsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0sVUFBVSxDQUFDLE9BQWdCO1FBQzlCLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFFTyxLQUFLLENBQUMsT0FBZTtRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRCLElBQUksVUFBVSxFQUFFO1lBQ1osVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQztDQUNKO0FBMURELHdCQTBEQyJ9