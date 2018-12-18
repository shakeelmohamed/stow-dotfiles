"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const NestedError_1 = require("../NestedError");
class PackageError extends NestedError_1.NestedError {
    // Do not put PII (personally identifiable information) in the 'message' field as it will be logged to telemetry
    constructor(message, pkg = null, innerError = null) {
        super(message, innerError);
        this.message = message;
        this.pkg = pkg;
        this.innerError = innerError;
    }
}
exports.PackageError = PackageError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZUVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VNYW5hZ2VyL1BhY2thZ2VFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLGdEQUE2QztBQUc3QyxrQkFBMEIsU0FBUSx5QkFBVztJQUN6QyxnSEFBZ0g7SUFDaEgsWUFBbUIsT0FBZSxFQUN2QixNQUFnQixJQUFJLEVBQ3BCLGFBQWtCLElBQUk7UUFDN0IsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUhaLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDdkIsUUFBRyxHQUFILEdBQUcsQ0FBaUI7UUFDcEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUVqQyxDQUFDO0NBQ0o7QUFQRCxvQ0FPQyJ9