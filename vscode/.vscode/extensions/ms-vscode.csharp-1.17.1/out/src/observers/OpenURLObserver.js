"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const loggingEvents_1 = require("../omnisharp/loggingEvents");
class OpenURLObserver {
    constructor(vscode) {
        this.vscode = vscode;
        this.post = (event) => {
            switch (event.constructor.name) {
                case loggingEvents_1.OpenURL.name:
                    let url = event.url;
                    this.vscode.commands.executeCommand("vscode.open", this.vscode.Uri.parse(url));
                    break;
            }
        };
    }
}
exports.OpenURLObserver = OpenURLObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlblVSTE9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29ic2VydmVycy9PcGVuVVJMT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUdoRyw4REFBZ0U7QUFFaEU7SUFFSSxZQUFvQixNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUczQixTQUFJLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7WUFDL0IsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyx1QkFBTyxDQUFDLElBQUk7b0JBQ2IsSUFBSSxHQUFHLEdBQWEsS0FBTSxDQUFDLEdBQUcsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDL0UsTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBVEQsQ0FBQztDQVVKO0FBYkQsMENBYUMifQ==