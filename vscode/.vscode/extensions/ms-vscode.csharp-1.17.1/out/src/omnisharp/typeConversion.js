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
    return toVSCodeRange(Line, Column, EndLine, EndColumn);
}
exports.toRange = toRange;
function toRange2(rangeLike) {
    let { StartLine, StartColumn, EndLine, EndColumn } = rangeLike;
    return toVSCodeRange(StartLine, StartColumn, EndLine, EndColumn);
}
exports.toRange2 = toRange2;
function toRange3(range) {
    return toVSCodeRange(range.Start.Line, range.Start.Column, range.End.Line, range.End.Column);
}
exports.toRange3 = toRange3;
function toVSCodeRange(StartLine, StartColumn, EndLine, EndColumn) {
    return new vscode.Range(StartLine - 1, StartColumn - 1, EndLine - 1, EndColumn - 1);
}
exports.toVSCodeRange = toVSCodeRange;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUNvbnZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3R5cGVDb252ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcsaUNBQWlDO0FBRWpDLG9CQUEyQixRQUF1RDtJQUM5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEQsT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUhELGdDQUdDO0FBRUQsMkJBQWtDLEdBQWUsRUFBRSxRQUF1RDtJQUN0RyxNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUU3RSxNQUFNLE9BQU8sR0FBdUIsUUFBUyxDQUFDLE9BQU8sQ0FBQztJQUN0RCxNQUFNLFNBQVMsR0FBdUIsUUFBUyxDQUFDLFNBQVMsQ0FBQztJQUUxRCxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtRQUNsRCxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUM1RTtJQUVELE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBWkQsOENBWUM7QUFFRCxpQkFBd0IsU0FBZ0Y7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