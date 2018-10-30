"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class NestedError extends Error {
    constructor(message, err = null) {
        super(message);
        this.message = message;
        this.err = err;
    }
}
exports.NestedError = NestedError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmVzdGVkRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvTmVzdGVkRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyxpQkFBeUIsU0FBUSxLQUFLO0lBQ2xDLFlBQW1CLE9BQWUsRUFBUyxNQUFhLElBQUk7UUFDeEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBREEsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQWM7SUFFNUQsQ0FBQztDQUNKO0FBSkQsa0NBSUMifQ==