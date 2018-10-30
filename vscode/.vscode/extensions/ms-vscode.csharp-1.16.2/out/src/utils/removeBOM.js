"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const removeBomBuffer = require("remove-bom-buffer");
const removeBomString = require("strip-bom");
function removeBOMFromBuffer(buffer) {
    return removeBomBuffer(buffer);
}
exports.removeBOMFromBuffer = removeBOMFromBuffer;
function removeBOMFromString(line) {
    return removeBomString(line.trim());
}
exports.removeBOMFromString = removeBOMFromString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQk9NLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3JlbW92ZUJPTS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUU3Qyw2QkFBb0MsTUFBYztJQUM5QyxPQUFnQixlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUZELGtEQUVDO0FBRUQsNkJBQW9DLElBQVk7SUFDNUMsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUZELGtEQUVDIn0=