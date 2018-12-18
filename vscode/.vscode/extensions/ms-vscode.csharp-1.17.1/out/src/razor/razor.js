"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const Razor = require("microsoft.aspnetcore.razor.vscode");
function activateRazorExtension(context, extensionPath, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        const razorConfig = vscode.workspace.getConfiguration('razor');
        const configuredLanguageServerDir = razorConfig.get('languageServer.directory', null);
        const languageServerDir = configuredLanguageServerDir || path.join(extensionPath, '.razor');
        if (fs.existsSync(languageServerDir)) {
            yield Razor.activate(context, languageServerDir, eventStream);
        }
        else if (configuredLanguageServerDir) {
            // It's only an error if the nonexistent dir was explicitly configured
            // If it's the default dir, this is expected for unsupported platforms
            vscode.window.showErrorMessage(`Cannot load Razor language server because the configured directory was not found: '${languageServerDir}'`);
        }
    });
}
exports.activateRazorExtension = activateRazorExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF6b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmF6b3IvcmF6b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLDJEQUEyRDtBQUczRCxnQ0FBNkMsT0FBZ0MsRUFBRSxhQUFxQixFQUFFLFdBQXdCOztRQUMxSCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELE1BQU0sMkJBQTJCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBUywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RixNQUFNLGlCQUFpQixHQUFHLDJCQUEyQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTVGLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDakU7YUFBTSxJQUFJLDJCQUEyQixFQUFFO1lBQ3BDLHNFQUFzRTtZQUN0RSxzRUFBc0U7WUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FDMUIsc0ZBQXNGLGlCQUFpQixHQUFHLENBQUMsQ0FBQztTQUNuSDtJQUNMLENBQUM7Q0FBQTtBQWJELHdEQWFDIn0=