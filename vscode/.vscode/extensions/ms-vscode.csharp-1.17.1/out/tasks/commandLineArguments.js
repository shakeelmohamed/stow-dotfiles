/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require("minimist");
const path = require("path");
let argv = minimist(process.argv.slice(2), {
    boolean: ['retainVsix']
});
exports.commandLineOptions = {
    retainVsix: !!argv['retainVsix'],
    outputFolder: makePathAbsolute(argv['o']),
    codeExtensionPath: makePathAbsolute(argv['codeExtensionPath'])
};
function makePathAbsolute(originalPath) {
    if (!originalPath || originalPath == '') {
        return undefined;
    }
    return path.resolve(originalPath);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZExpbmVBcmd1bWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90YXNrcy9jb21tYW5kTGluZUFyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxZQUFZLENBQUM7O0FBRWIscUNBQXFDO0FBQ3JDLDZCQUE2QjtBQUU3QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDdkMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO0NBQzFCLENBQUMsQ0FBQztBQUVVLFFBQUEsa0JBQWtCLEdBQUc7SUFDOUIsVUFBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ2hDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Q0FDakUsQ0FBQztBQUVGLDBCQUEwQixZQUFvQjtJQUMxQyxJQUFJLENBQUMsWUFBWSxJQUFJLFlBQVksSUFBSSxFQUFFLEVBQUU7UUFDckMsT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdEMsQ0FBQyJ9