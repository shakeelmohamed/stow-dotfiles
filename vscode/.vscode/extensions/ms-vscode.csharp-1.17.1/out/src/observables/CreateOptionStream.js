"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../omnisharp/options");
require("rxjs/add/operator/take");
require("rxjs/add/operator/publishBehavior");
const Observable_1 = require("rxjs/Observable");
function createOptionStream(vscode) {
    return Observable_1.Observable.create((observer) => {
        let disposable = vscode.workspace.onDidChangeConfiguration(e => {
            //if the omnisharp or csharp configuration are affected only then read the options
            if (e.affectsConfiguration('omnisharp') || e.affectsConfiguration('csharp')) {
                observer.next(options_1.Options.Read(vscode));
            }
        });
        return () => disposable.dispose();
    }).publishBehavior(options_1.Options.Read(vscode)).refCount();
}
exports.default = createOptionStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlT3B0aW9uU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmFibGVzL0NyZWF0ZU9wdGlvblN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLGtEQUErQztBQUUvQyxrQ0FBZ0M7QUFDaEMsNkNBQTJDO0FBQzNDLGdEQUE2QztBQUc3Qyw0QkFBMkMsTUFBYztJQUNyRCxPQUFPLHVCQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBMkIsRUFBRSxFQUFFO1FBQ3JELElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0Qsa0ZBQWtGO1lBQ2xGLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDekUsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3ZDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN0QyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN4RCxDQUFDO0FBWEQscUNBV0MifQ==