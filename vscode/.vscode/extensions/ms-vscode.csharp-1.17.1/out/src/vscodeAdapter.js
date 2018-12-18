"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ViewColumn;
(function (ViewColumn) {
    /**
     * A *symbolic* editor column representing the currently
     * active column. This value can be used when opening editors, but the
     * *resolved* [viewColumn](#TextEditor.viewColumn)-value of editors will always
     * be `One`, `Two`, `Three`, or `undefined` but never `Active`.
     */
    ViewColumn[ViewColumn["Active"] = -1] = "Active";
    /**
     * The left most editor column.
     */
    ViewColumn[ViewColumn["One"] = 1] = "One";
    /**
     * The center editor column.
     */
    ViewColumn[ViewColumn["Two"] = 2] = "Two";
    /**
     * The right most editor column.
     */
    ViewColumn[ViewColumn["Three"] = 3] = "Three";
})(ViewColumn = exports.ViewColumn || (exports.ViewColumn = {}));
/**
 * The configuration target
 */
var ConfigurationTarget;
(function (ConfigurationTarget) {
    /**
     * Global configuration
    */
    ConfigurationTarget[ConfigurationTarget["Global"] = 1] = "Global";
    /**
     * Workspace configuration
     */
    ConfigurationTarget[ConfigurationTarget["Workspace"] = 2] = "Workspace";
    /**
     * Workspace folder configuration
     */
    ConfigurationTarget[ConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
})(ConfigurationTarget = exports.ConfigurationTarget || (exports.ConfigurationTarget = {}));
/**
 * Represents the alignment of status bar items.
 */
var StatusBarAlignment;
(function (StatusBarAlignment) {
    /**
     * Aligned to the left side.
     */
    StatusBarAlignment[StatusBarAlignment["Left"] = 1] = "Left";
    /**
     * Aligned to the right side.
     */
    StatusBarAlignment[StatusBarAlignment["Right"] = 2] = "Right";
})(StatusBarAlignment = exports.StatusBarAlignment || (exports.StatusBarAlignment = {}));
/**
 * Represents an end of line character sequence in a [document](#TextDocument).
 */
var EndOfLine;
(function (EndOfLine) {
    /**
     * The line feed `\n` character.
     */
    EndOfLine[EndOfLine["LF"] = 1] = "LF";
    /**
     * The carriage return line feed `\r\n` sequence.
     */
    EndOfLine[EndOfLine["CRLF"] = 2] = "CRLF";
})(EndOfLine = exports.EndOfLine || (exports.EndOfLine = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnNjb2RlQWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92c2NvZGVBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUErQ2hHLElBQVksVUFvQlg7QUFwQkQsV0FBWSxVQUFVO0lBQ2xCOzs7OztPQUtHO0lBQ0gsZ0RBQVcsQ0FBQTtJQUNYOztPQUVHO0lBQ0gseUNBQU8sQ0FBQTtJQUNQOztPQUVHO0lBQ0gseUNBQU8sQ0FBQTtJQUNQOztPQUVHO0lBQ0gsNkNBQVMsQ0FBQTtBQUNiLENBQUMsRUFwQlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFvQnJCO0FBMEZEOztHQUVHO0FBQ0gsSUFBWSxtQkFlWDtBQWZELFdBQVksbUJBQW1CO0lBQzNCOztNQUVFO0lBQ0YsaUVBQVUsQ0FBQTtJQUVWOztPQUVHO0lBQ0gsdUVBQWEsQ0FBQTtJQUViOztPQUVHO0lBQ0gsbUZBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQWZXLG1CQUFtQixHQUFuQiwyQkFBbUIsS0FBbkIsMkJBQW1CLFFBZTlCO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLGtCQVdYO0FBWEQsV0FBWSxrQkFBa0I7SUFFMUI7O09BRUc7SUFDSCwyREFBUSxDQUFBO0lBRVI7O09BRUc7SUFDSCw2REFBUyxDQUFBO0FBQ2IsQ0FBQyxFQVhXLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBVzdCO0FBeVlEOztHQUVHO0FBQ0gsSUFBWSxTQVNYO0FBVEQsV0FBWSxTQUFTO0lBQ2pCOztPQUVHO0lBQ0gscUNBQU0sQ0FBQTtJQUNOOztPQUVHO0lBQ0gseUNBQVEsQ0FBQTtBQUNaLENBQUMsRUFUVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVNwQiJ9