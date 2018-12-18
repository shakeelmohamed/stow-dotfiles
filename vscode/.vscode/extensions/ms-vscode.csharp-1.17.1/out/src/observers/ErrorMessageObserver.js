"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const ShowErrorMessage_1 = require("./utils/ShowErrorMessage");
class ErrorMessageObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.ZipError.name:
                    this.handleZipError(event);
                    break;
                case loggingEvents_1.DotNetTestRunFailure.name:
                    this.handleDotnetTestRunFailure(event);
                    break;
                case loggingEvents_1.DotNetTestDebugStartFailure.name:
                    this.handleDotNetTestDebugStartFailure(event);
                    break;
            }
        };
    }
    handleZipError(event) {
        ShowErrorMessage_1.default(this.vscode, event.message);
    }
    handleDotnetTestRunFailure(event) {
        ShowErrorMessage_1.default(this.vscode, `Failed to run test because ${event.message}.`);
    }
    handleDotNetTestDebugStartFailure(event) {
        ShowErrorMessage_1.default(this.vscode, `Failed to start debugger: ${event.message}`);
    }
}
exports.ErrorMessageObserver = ErrorMessageObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJyb3JNZXNzYWdlT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JzZXJ2ZXJzL0Vycm9yTWVzc2FnZU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsOERBQW9IO0FBRXBILCtEQUF3RDtBQUV4RDtJQUVJLFlBQW9CLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRzNCLFNBQUksR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtZQUMvQixRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUM1QixLQUFLLHdCQUFRLENBQUMsSUFBSTtvQkFDZCxJQUFJLENBQUMsY0FBYyxDQUFXLEtBQUssQ0FBQyxDQUFDO29CQUNyQyxNQUFNO2dCQUNWLEtBQUssb0NBQW9CLENBQUMsSUFBSTtvQkFDMUIsSUFBSSxDQUFDLDBCQUEwQixDQUF1QixLQUFLLENBQUMsQ0FBQztvQkFDN0QsTUFBTTtnQkFDVixLQUFLLDJDQUEyQixDQUFDLElBQUk7b0JBQ2pDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBOEIsS0FBSyxDQUFDLENBQUM7b0JBQzNFLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQWRELENBQUM7SUFnQk8sY0FBYyxDQUFDLEtBQWU7UUFDbEMsMEJBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVPLDBCQUEwQixDQUFDLEtBQTJCO1FBQzFELDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsOEJBQThCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFTyxpQ0FBaUMsQ0FBQyxLQUFrQztRQUN4RSwwQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLDZCQUE2QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNoRixDQUFDO0NBQ0o7QUE5QkQsb0RBOEJDIn0=