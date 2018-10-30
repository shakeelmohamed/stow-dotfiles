"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const protocol = require("./protocol");
const priorityCommands = [
    protocol.Requests.ChangeBuffer,
    protocol.Requests.FormatAfterKeystroke,
    protocol.Requests.FormatRange,
    protocol.Requests.UpdateBuffer
];
const normalCommands = [
    protocol.Requests.AutoComplete,
    protocol.Requests.FilesChanged,
    protocol.Requests.FindSymbols,
    protocol.Requests.FindUsages,
    protocol.Requests.GetCodeActions,
    protocol.Requests.GoToDefinition,
    protocol.Requests.RunCodeAction,
    protocol.Requests.SignatureHelp,
    protocol.Requests.TypeLookup
];
const prioritySet = new Set(priorityCommands);
const normalSet = new Set(normalCommands);
const deferredSet = new Set();
const nonDeferredSet = new Set();
for (let command of priorityCommands) {
    nonDeferredSet.add(command);
}
for (let command of normalCommands) {
    nonDeferredSet.add(command);
}
function isPriorityCommand(command) {
    return prioritySet.has(command);
}
exports.isPriorityCommand = isPriorityCommand;
function isNormalCommand(command) {
    return normalSet.has(command);
}
exports.isNormalCommand = isNormalCommand;
function isDeferredCommand(command) {
    if (deferredSet.has(command)) {
        return true;
    }
    if (nonDeferredSet.has(command)) {
        return false;
    }
    deferredSet.add(command);
    return true;
}
exports.isDeferredCommand = isDeferredCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpb3JpdGl6YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3ByaW9yaXRpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsdUNBQXVDO0FBRXZDLE1BQU0sZ0JBQWdCLEdBQUc7SUFDckIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZO0lBQzlCLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CO0lBQ3RDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVztJQUM3QixRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVk7Q0FDakMsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHO0lBQ25CLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWTtJQUM5QixRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVk7SUFDOUIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXO0lBQzdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVTtJQUM1QixRQUFRLENBQUMsUUFBUSxDQUFDLGNBQWM7SUFDaEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjO0lBQ2hDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYTtJQUMvQixRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWE7SUFDL0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVO0NBQy9CLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBUyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFTLGNBQWMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7QUFFdEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztBQUV6QyxLQUFLLElBQUksT0FBTyxJQUFJLGdCQUFnQixFQUFFO0lBQ2xDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDL0I7QUFFRCxLQUFLLElBQUksT0FBTyxJQUFJLGNBQWMsRUFBRTtJQUNoQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQy9CO0FBRUQsMkJBQWtDLE9BQWU7SUFDN0MsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFGRCw4Q0FFQztBQUVELHlCQUFnQyxPQUFlO0lBQzNDLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRkQsMENBRUM7QUFFRCwyQkFBa0MsT0FBZTtJQUM3QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekIsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQVhELDhDQVdDIn0=