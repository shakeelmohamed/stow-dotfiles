"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function isLineBreak(code) {
    return code === 10 /* lineFeed */
        || code === 13 /* carriageReturn */
        || code === 11 /* verticalTab */
        || code === 12 /* formFeed */
        || code === 8232 /* lineSeparator */
        || code === 8233 /* paragraphSeparator */;
}
function isWhitespace(code) {
    return code === 32 /* space */
        || code === 9 /* tab */
        || code === 10 /* lineFeed */
        || code === 11 /* verticalTab */
        || code === 12 /* formFeed */
        || code === 13 /* carriageReturn */
        || code === 133 /* nextLine */
        || code === 160 /* nonBreakingSpace */
        || code === 5760 /* ogham */
        || (code >= 8192 /* enQuad */ && code <= 8203 /* zeroWidthSpace */)
        || code === 8232 /* lineSeparator */
        || code === 8233 /* paragraphSeparator */
        || code === 8239 /* narrowNoBreakSpace */
        || code === 8287 /* mathematicalSpace */
        || code === 12288 /* ideographicSpace */
        || code === 65279 /* byteOrderMark */;
}
function cleanJsonText(text) {
    let parts = [];
    let partStart = 0;
    let index = 0;
    let length = text.length;
    function next() {
        const result = peek();
        index++;
        return result;
    }
    function peek(offset = 0) {
        if ((index + offset) < length) {
            return text.charCodeAt(index + offset);
        }
        else {
            return undefined;
        }
    }
    function peekPastWhitespace() {
        let pos = index;
        let code = undefined;
        do {
            code = text.charCodeAt(pos);
            pos++;
        } while (isWhitespace(code));
        return code;
    }
    function scanString() {
        while (true) {
            if (index >= length) { // string ended unexpectedly
                break;
            }
            let code = next();
            if (code === 34 /* doubleQuote */) {
                // End of string. We're done
                break;
            }
            if (code === 92 /* backSlash */) {
                // Skip escaped character. We don't care about verifying the escape sequence.
                // We just don't want to accidentally scan an escaped double-quote as the end of the string.
                index++;
            }
            if (isLineBreak(code)) {
                // string ended unexpectedly
                break;
            }
        }
    }
    while (true) {
        let code = next();
        switch (code) {
            // byte-order mark
            case 65279 /* byteOrderMark */:
                // We just skip the byte-order mark
                parts.push(text.substring(partStart, index - 1));
                partStart = index;
                break;
            // strings
            case 34 /* doubleQuote */:
                scanString();
                break;
            // comments
            case 47 /* slash */:
                // Single-line comment
                if (peek() === 47 /* slash */) {
                    // Be careful not to include the first slash in the text part.
                    parts.push(text.substring(partStart, index - 1));
                    // Start after the second slash and scan until a line-break character is encountered.
                    index++;
                    while (index < length) {
                        if (isLineBreak(peek())) {
                            break;
                        }
                        index++;
                    }
                    partStart = index;
                }
                // Multi-line comment
                if (peek() === 42 /* asterisk */) {
                    // Be careful not to include the first slash in the text part.
                    parts.push(text.substring(partStart, index - 1));
                    // Start after the asterisk and scan until a */ is encountered.
                    index++;
                    while (index < length) {
                        if (peek() === 42 /* asterisk */ && peek(1) === 47 /* slash */) {
                            index += 2;
                            break;
                        }
                        index++;
                    }
                    partStart = index;
                }
                break;
            case 44 /* comma */:
                // Ignore trailing commas in object member lists and array element lists
                let nextCode = peekPastWhitespace();
                if (nextCode === 125 /* closeBrace */ || nextCode === 93 /* closeBracket */) {
                    parts.push(text.substring(partStart, index - 1));
                    partStart = index;
                }
                break;
            default:
        }
        if (index >= length && index > partStart) {
            parts.push(text.substring(partStart, length));
            break;
        }
    }
    return parts.join('');
}
function tolerantParse(text) {
    text = cleanJsonText(text);
    return JSON.parse(text);
}
exports.tolerantParse = tolerantParse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUE0Q2hHLHFCQUFxQixJQUFZO0lBQzdCLE9BQU8sSUFBSSxzQkFBc0I7V0FDMUIsSUFBSSw0QkFBNEI7V0FDaEMsSUFBSSx5QkFBeUI7V0FDN0IsSUFBSSxzQkFBc0I7V0FDMUIsSUFBSSw2QkFBMkI7V0FDL0IsSUFBSSxrQ0FBZ0MsQ0FBQztBQUNoRCxDQUFDO0FBRUQsc0JBQXNCLElBQVk7SUFDOUIsT0FBTyxJQUFJLG1CQUFtQjtXQUN2QixJQUFJLGdCQUFpQjtXQUNyQixJQUFJLHNCQUFzQjtXQUMxQixJQUFJLHlCQUF5QjtXQUM3QixJQUFJLHNCQUFzQjtXQUMxQixJQUFJLDRCQUE0QjtXQUNoQyxJQUFJLHVCQUFzQjtXQUMxQixJQUFJLCtCQUE4QjtXQUNsQyxJQUFJLHFCQUFtQjtXQUN2QixDQUFDLElBQUkscUJBQW1CLElBQUksSUFBSSw2QkFBMkIsQ0FBQztXQUM1RCxJQUFJLDZCQUEyQjtXQUMvQixJQUFJLGtDQUFnQztXQUNwQyxJQUFJLGtDQUFnQztXQUNwQyxJQUFJLGlDQUErQjtXQUNuQyxJQUFJLGlDQUE4QjtXQUNsQyxJQUFJLDhCQUEyQixDQUFDO0FBQzNDLENBQUM7QUFFRCx1QkFBdUIsSUFBWTtJQUUvQixJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDekIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBRWxCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFekI7UUFDSSxNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUN0QixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxjQUFjLFNBQWlCLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxNQUFNLEVBQUU7WUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztTQUMxQzthQUNJO1lBQ0QsT0FBTyxTQUFTLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBRUQ7UUFDSSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBRXJCLEdBQUc7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixHQUFHLEVBQUUsQ0FBQztTQUNULFFBQ00sWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBRTNCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDtRQUNJLE9BQU8sSUFBSSxFQUFFO1lBQ1QsSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLEVBQUUsNEJBQTRCO2dCQUMvQyxNQUFNO2FBQ1Q7WUFFRCxJQUFJLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQztZQUVsQixJQUFJLElBQUkseUJBQXlCLEVBQUU7Z0JBQy9CLDRCQUE0QjtnQkFDNUIsTUFBTTthQUNUO1lBRUQsSUFBSSxJQUFJLHVCQUF1QixFQUFFO2dCQUM3Qiw2RUFBNkU7Z0JBQzdFLDRGQUE0RjtnQkFDNUYsS0FBSyxFQUFFLENBQUM7YUFDWDtZQUVELElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNuQiw0QkFBNEI7Z0JBQzVCLE1BQU07YUFDVDtTQUNKO0lBQ0wsQ0FBQztJQUVELE9BQU8sSUFBSSxFQUFFO1FBQ1QsSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFFbEIsUUFBUSxJQUFJLEVBQUU7WUFDVixrQkFBa0I7WUFDbEI7Z0JBQ0ksbUNBQW1DO2dCQUNuQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxTQUFTLEdBQUcsS0FBSyxDQUFDO2dCQUNsQixNQUFNO1lBRVYsVUFBVTtZQUNWO2dCQUNJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLE1BQU07WUFFVixXQUFXO1lBQ1g7Z0JBQ0ksc0JBQXNCO2dCQUN0QixJQUFJLElBQUksRUFBRSxtQkFBbUIsRUFBRTtvQkFDM0IsOERBQThEO29CQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVqRCxxRkFBcUY7b0JBQ3JGLEtBQUssRUFBRSxDQUFDO29CQUNSLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRTt3QkFDbkIsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTs0QkFDckIsTUFBTTt5QkFDVDt3QkFFRCxLQUFLLEVBQUUsQ0FBQztxQkFDWDtvQkFFRCxTQUFTLEdBQUcsS0FBSyxDQUFDO2lCQUNyQjtnQkFFRCxxQkFBcUI7Z0JBQ3JCLElBQUksSUFBSSxFQUFFLHNCQUFzQixFQUFFO29CQUM5Qiw4REFBOEQ7b0JBQzlELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWpELCtEQUErRDtvQkFDL0QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFO3dCQUNuQixJQUFJLElBQUksRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFOzRCQUM1RCxLQUFLLElBQUksQ0FBQyxDQUFDOzRCQUNYLE1BQU07eUJBQ1Q7d0JBRUQsS0FBSyxFQUFFLENBQUM7cUJBQ1g7b0JBRUQsU0FBUyxHQUFHLEtBQUssQ0FBQztpQkFDckI7Z0JBRUQsTUFBTTtZQUVWO2dCQUNJLHdFQUF3RTtnQkFDeEUsSUFBSSxRQUFRLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxRQUFRLHlCQUF3QixJQUFJLFFBQVEsMEJBQTBCLEVBQUU7b0JBQ3hFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELFNBQVMsR0FBRyxLQUFLLENBQUM7aUJBQ3JCO2dCQUVELE1BQU07WUFDVixRQUFRO1NBQ1g7UUFFRCxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksS0FBSyxHQUFHLFNBQVMsRUFBRTtZQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDOUMsTUFBTTtTQUNUO0tBQ0o7SUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELHVCQUE4QixJQUFZO0lBQ3RDLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFIRCxzQ0FHQyJ9