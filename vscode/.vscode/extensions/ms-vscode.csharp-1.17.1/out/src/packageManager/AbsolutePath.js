"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
class AbsolutePath {
    constructor(value) {
        this.value = value;
        if (!path_1.isAbsolute(value)) {
            throw new Error("The path must be absolute");
        }
    }
    static getAbsolutePath(...pathSegments) {
        return new AbsolutePath(path_1.resolve(...pathSegments));
    }
}
exports.AbsolutePath = AbsolutePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzb2x1dGVQYXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VNYW5hZ2VyL0Fic29sdXRlUGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLCtCQUEyQztBQUUzQztJQUNJLFlBQW1CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQzVCLElBQUksQ0FBQyxpQkFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUNoRDtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsWUFBc0I7UUFDbkQsT0FBTyxJQUFJLFlBQVksQ0FBQyxjQUFPLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FDSjtBQVZELG9DQVVDIn0=