"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// This contains the definition of messages that VsDbg-UI can send back to a listener which registers itself via the 'debuggerEventsPipeName'
// property on a launch or attach request.
// 
// All messages are sent as UTF-8 JSON text with a tailing '\n'
var DebuggerEventsProtocol;
(function (DebuggerEventsProtocol) {
    let EventType;
    (function (EventType) {
        // Indicates that the vsdbg-ui has received the attach or launch request and is starting up
        EventType.Starting = "starting";
        // Indicates that vsdbg-ui has successfully launched the specified process.
        // The ProcessLaunchedEvent interface details the event payload.
        EventType.ProcessLaunched = "processLaunched";
        // Debug session is ending
        EventType.DebuggingStopped = "debuggingStopped";
    })(EventType = DebuggerEventsProtocol.EventType || (DebuggerEventsProtocol.EventType = {}));
    // Decodes a packet received from the debugger into an event
    function decodePacket(packet) {
        // Verify the message ends in a newline
        if (packet[packet.length - 1] != 10 /*\n*/) {
            throw new Error("Unexpected message received from debugger.");
        }
        const message = packet.toString('utf-8', 0, packet.length - 1);
        return JSON.parse(message);
    }
    DebuggerEventsProtocol.decodePacket = decodePacket;
})(DebuggerEventsProtocol = exports.DebuggerEventsProtocol || (exports.DebuggerEventsProtocol = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdnZXJFdmVudHNQcm90b2NvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlY2xyLWRlYnVnL2RlYnVnZ2VyRXZlbnRzUHJvdG9jb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyw2SUFBNkk7QUFDN0ksMENBQTBDO0FBQzFDLEdBQUc7QUFDSCwrREFBK0Q7QUFDL0QsSUFBaUIsc0JBQXNCLENBK0J0QztBQS9CRCxXQUFpQixzQkFBc0I7SUFDbkMsSUFBYyxTQUFTLENBUXRCO0lBUkQsV0FBYyxTQUFTO1FBQ25CLDJGQUEyRjtRQUM5RSxrQkFBUSxHQUFHLFVBQVUsQ0FBQztRQUNuQywyRUFBMkU7UUFDM0UsZ0VBQWdFO1FBQ25ELHlCQUFlLEdBQUcsaUJBQWlCLENBQUM7UUFDakQsMEJBQTBCO1FBQ2IsMEJBQWdCLEdBQUcsa0JBQWtCLENBQUM7SUFDdkQsQ0FBQyxFQVJhLFNBQVMsR0FBVCxnQ0FBUyxLQUFULGdDQUFTLFFBUXRCO0lBWUQsNERBQTREO0lBQzVELHNCQUE2QixNQUFjO1FBQ3ZDLHVDQUF1QztRQUN2QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFSZSxtQ0FBWSxlQVEzQixDQUFBO0FBQ0wsQ0FBQyxFQS9CZ0Isc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUErQnRDIn0=