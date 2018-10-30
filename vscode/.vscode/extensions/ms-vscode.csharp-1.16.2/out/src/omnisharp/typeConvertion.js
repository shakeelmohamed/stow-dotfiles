"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function toLocation(location) {
    const fileName = vscode.Uri.file(location.FileName);
    return toLocationFromUri(fileName, location);
}
exports.toLocation = toLocation;
function toLocationFromUri(uri, location) {
    const position = new vscode.Position(location.Line - 1, location.Column - 1);
    const endLine = location.EndLine;
    const endColumn = location.EndColumn;
    if (endLine !== undefined && endColumn !== undefined) {
        const endPosition = new vscode.Position(endLine - 1, endColumn - 1);
        return new vscode.Location(uri, new vscode.Range(position, endPosition));
    }
    return new vscode.Location(uri, position);
}
exports.toLocationFromUri = toLocationFromUri;
function toRange(rangeLike) {
    let { Line, Column, EndLine, EndColumn } = rangeLike;
    return new vscode.Range(Line - 1, Column - 1, EndLine - 1, EndColumn - 1);
}
exports.toRange = toRange;
function toRange2(rangeLike) {
    let { StartLine, StartColumn, EndLine, EndColumn } = rangeLike;
    return new vscode.Range(StartLine - 1, StartColumn - 1, EndLine - 1, EndColumn - 1);
}
exports.toRange2 = toRange2;
function createRequest(document, where, includeBuffer = false) {
    let Line, Column;
    if (where instanceof vscode.Position) {
        Line = where.line + 1;
        Column = where.character + 1;
    }
    else if (where instanceof vscode.Range) {
        Line = where.start.line + 1;
        Column = where.start.character + 1;
    }
    // for metadata sources, we need to remove the [metadata] from the filename, and prepend the $metadata$ authority
    // this is expected by the Omnisharp server to support metadata-to-metadata navigation
    let fileName = document.uri.scheme === "omnisharp-metadata" ?
        `${document.uri.authority}${document.fileName.replace("[metadata] ", "")}` :
        document.fileName;
    let request = {
        FileName: fileName,
        Buffer: includeBuffer ? document.getText() : undefined,
        Line,
        Column
    };
    return request;
}
exports.createRequest = createRequest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUNvbnZlcnRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3R5cGVDb252ZXJ0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcsaUNBQWlDO0FBRWpDLG9CQUEyQixRQUF1RDtJQUM5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEQsT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUhELGdDQUdDO0FBRUQsMkJBQWtDLEdBQWUsRUFBRSxRQUF1RDtJQUN0RyxNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUU3RSxNQUFNLE9BQU8sR0FBdUIsUUFBUyxDQUFDLE9BQU8sQ0FBQztJQUN0RCxNQUFNLFNBQVMsR0FBdUIsUUFBUyxDQUFDLFNBQVMsQ0FBQztJQUUxRCxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtRQUNsRCxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUM1RTtJQUVELE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBWkQsOENBWUM7QUFFRCxpQkFBd0IsU0FBZ0Y7SUFDcEcsSUFBSSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBQyxHQUFHLFNBQVMsQ0FBQztJQUNuRCxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUUsQ0FBQztBQUhELDBCQUdDO0FBRUQsa0JBQXlCLFNBQTBGO0lBQy9HLElBQUksRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUMsR0FBRyxTQUFTLENBQUM7SUFDN0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFIRCw0QkFHQztBQUVELHVCQUEwRCxRQUE2QixFQUFFLEtBQXFDLEVBQUUsZ0JBQXlCLEtBQUs7SUFFMUosSUFBSSxJQUFZLEVBQUUsTUFBYyxDQUFDO0lBRWpDLElBQUksS0FBSyxZQUFZLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDbEMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztLQUNoQztTQUFNLElBQUksS0FBSyxZQUFZLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDdEMsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUM1QixNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsaUhBQWlIO0lBQ2pILHNGQUFzRjtJQUN0RixJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pELEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RSxRQUFRLENBQUMsUUFBUSxDQUFDO0lBRXRCLElBQUksT0FBTyxHQUFxQjtRQUM1QixRQUFRLEVBQUUsUUFBUTtRQUNsQixNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDdEQsSUFBSTtRQUNKLE1BQU07S0FDVCxDQUFDO0lBRUYsT0FBVSxPQUFPLENBQUM7QUFDdEIsQ0FBQztBQTFCRCxzQ0EwQkMifQ==