"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const summaryStartTag = /<summary>/i;
const summaryEndTag = /<\/summary>/i;
function extractSummaryText(xmlDocComment) {
    if (!xmlDocComment) {
        return xmlDocComment;
    }
    let summary = xmlDocComment;
    let startIndex = summary.search(summaryStartTag);
    if (startIndex < 0) {
        return summary;
    }
    summary = summary.slice(startIndex + '<summary>'.length);
    let endIndex = summary.search(summaryEndTag);
    if (endIndex < 0) {
        return summary;
    }
    return summary.slice(0, endIndex);
}
exports.extractSummaryText = extractSummaryText;
function GetDocumentationString(structDoc) {
    let newLine = "\n\n";
    let indentSpaces = "\t\t";
    let documentation = "";
    if (structDoc) {
        if (structDoc.SummaryText) {
            documentation += structDoc.SummaryText + newLine;
        }
        if (structDoc.TypeParamElements && structDoc.TypeParamElements.length > 0) {
            documentation += "Type Parameters:" + newLine;
            documentation += indentSpaces + structDoc.TypeParamElements.map(displayDocumentationObject).join("\n" + indentSpaces) + newLine;
        }
        if (structDoc.ParamElements && structDoc.ParamElements.length > 0) {
            documentation += "Parameters:" + newLine;
            documentation += indentSpaces + structDoc.ParamElements.map(displayDocumentationObject).join("\n" + indentSpaces) + newLine;
        }
        if (structDoc.ReturnsText) {
            documentation += structDoc.ReturnsText + newLine;
        }
        if (structDoc.RemarksText) {
            documentation += structDoc.RemarksText + newLine;
        }
        if (structDoc.ExampleText) {
            documentation += structDoc.ExampleText + newLine;
        }
        if (structDoc.ValueText) {
            documentation += structDoc.ValueText + newLine;
        }
        if (structDoc.Exception && structDoc.Exception.length > 0) {
            documentation += "Exceptions:" + newLine;
            documentation += indentSpaces + structDoc.Exception.map(displayDocumentationObject).join("\n" + indentSpaces) + newLine;
        }
        documentation = documentation.trim();
    }
    return documentation;
}
exports.GetDocumentationString = GetDocumentationString;
function displayDocumentationObject(obj) {
    return obj.Name + ": " + obj.Documentation;
}
exports.displayDocumentationObject = displayDocumentationObject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFJaEcsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDO0FBQ3JDLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUVyQyw0QkFBbUMsYUFBcUI7SUFDcEQsSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUNoQixPQUFPLGFBQWEsQ0FBQztLQUN4QjtJQUVELElBQUksT0FBTyxHQUFHLGFBQWEsQ0FBQztJQUU1QixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTtRQUNoQixPQUFPLE9BQU8sQ0FBQztLQUNsQjtJQUVELE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFekQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3QyxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7UUFDZCxPQUFPLE9BQU8sQ0FBQztLQUNsQjtJQUVELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQXBCRCxnREFvQkM7QUFFRCxnQ0FBdUMsU0FBd0M7SUFDM0UsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3JCLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQztJQUMxQixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFFdkIsSUFBSSxTQUFTLEVBQUU7UUFDWCxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7WUFDdkIsYUFBYSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxTQUFTLENBQUMsaUJBQWlCLElBQUksU0FBUyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdkUsYUFBYSxJQUFJLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztZQUM5QyxhQUFhLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQztTQUNuSTtRQUVELElBQUksU0FBUyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDL0QsYUFBYSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUM7WUFDekMsYUFBYSxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQy9IO1FBRUQsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO1lBQ3ZCLGFBQWEsSUFBSSxTQUFTLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztTQUNwRDtRQUVELElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRTtZQUN2QixhQUFhLElBQUksU0FBUyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7U0FDcEQ7UUFFRCxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7WUFDdkIsYUFBYSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQ3JCLGFBQWEsSUFBSSxTQUFTLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztTQUNsRDtRQUVELElBQUksU0FBUyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdkQsYUFBYSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUM7WUFDekMsYUFBYSxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQzNIO1FBRUQsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN4QztJQUVELE9BQU8sYUFBYSxDQUFDO0FBQ3pCLENBQUM7QUE3Q0Qsd0RBNkNDO0FBRUQsb0NBQTJDLEdBQStCO0lBQ3RFLE9BQU8sR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQztBQUMvQyxDQUFDO0FBRkQsZ0VBRUMifQ==