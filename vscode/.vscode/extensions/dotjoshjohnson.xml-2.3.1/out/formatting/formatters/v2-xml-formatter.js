"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classic_xml_formatter_1 = require("./classic-xml-formatter");
const MagicalStringOfWonders = "~::~MAAAGIC~::~";
/* tslint:disable no-use-before-declare */
class V2XmlFormatter {
    formatXml(xml, options) {
        // this replaces all "<" brackets inside of comments to a magical string
        // so the following minification steps don't mess with comment formatting
        xml = this._sanitizeComments(xml);
        // remove whitespace from between tags, except for line breaks
        xml = xml.replace(/>\s{0,}</g, (match) => {
            return match.replace(/[^\S\r\n]/g, "");
        });
        // do some light minification to get rid of insignificant whitespace
        xml = xml.replace(/"\s+(?=[^\s]+=)/g, "\" "); // spaces between attributes
        xml = xml.replace(/"\s+(?=>)/g, "\""); // spaces between the last attribute and tag close (>)
        xml = xml.replace(/"\s+(?=\/>)/g, "\" "); // spaces between the last attribute and tag close (/>)
        xml = xml.replace(/[^ <>="]\s+[^ <>="]+=/g, (match) => {
            return match.replace(/\s+/g, " ");
        });
        // the coast is clear - we can drop those "<" brackets back in
        xml = this._unsanitizeComments(xml);
        let output = "";
        let indentLevel = 0;
        let location = Location.Text;
        let lastNonTextLocation = Location.Text; // hah
        let attributeQuote = "";
        let lineBreakSpree = false;
        // NOTE: all "exiting" checks should appear after their associated "entering" checks
        for (let i = 0; i < xml.length; i++) {
            const cc = xml[i];
            const nc = xml.charAt(i + 1);
            const nnc = xml.charAt(i + 2);
            const pc = xml.charAt(i - 1);
            const ppc = xml.charAt(i - 2);
            // entering CData
            if (location === Location.Text && cc === "<" && nc === "!" && nnc === "[") {
                if (pc === ">" && ppc !== "/") {
                    output += "<";
                }
                else {
                    output += `${this._getIndent(options, indentLevel)}<`;
                }
                location = Location.CData;
            }
            else if (location === Location.CData && cc === "]" && nc === "]" && nnc === ">") {
                output += "]]>";
                i += 2;
                lastNonTextLocation = location;
                location = Location.Text;
            }
            else if (location === Location.Text && cc === "<" && nc === "!" && nnc === "-") {
                output += `${this._getIndent(options, indentLevel)}<`;
                location = Location.Comment;
            }
            else if (location === Location.Comment && cc === "-" && nc === "-" && nnc === ">") {
                output += "-->";
                i += 2;
                lastNonTextLocation = location;
                location = Location.Text;
            }
            else if (location === Location.Text && cc === "<" && (nc === "!" || nc === "?")) {
                output += `${this._getIndent(options, indentLevel)}<`;
                location = Location.SpecialTag;
            }
            else if (location === Location.SpecialTag && cc === ">") {
                output += `>`;
                lastNonTextLocation = location;
                location = Location.Text;
            }
            else if (location === Location.Text && cc === "<" && ["/", "!"].indexOf(nc) === -1) {
                // if this occurs after another tag, prepend a line break
                // but do not add one if the previous tag was self-closing (it already adds its own)
                if (pc === ">" && ppc !== "/") {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}<`;
                }
                else {
                    // removing trailing non-breaking whitespace here prevents endless indentations (issue #193)
                    output = this._removeTrailingNonBreakingWhitespace(output);
                    output += `${this._getIndent(options, indentLevel)}<`;
                }
                indentLevel++;
                location = Location.StartTagName;
            }
            else if (location === Location.StartTagName && cc === " ") {
                output += " ";
                lastNonTextLocation = location;
                location = Location.StartTag;
            }
            else if (location === Location.StartTag && [" ", "/", ">"].indexOf(cc) === -1) {
                if (lastNonTextLocation === Location.AttributeValue
                    && ((options.splitXmlnsOnFormat
                        && xml.substr(i, 5).toLowerCase() === "xmlns")
                        || options.splitAttributesOnFormat)) {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}`;
                }
                output += cc;
                lastNonTextLocation = location;
                location = Location.Attribute;
            }
            else if (location === Location.Attribute && (cc === "\"" || cc === "'")) {
                output += cc;
                lastNonTextLocation = location;
                location = Location.AttributeValue;
                attributeQuote = cc;
            }
            else if (location === Location.AttributeValue && cc === attributeQuote) {
                output += cc;
                lastNonTextLocation = location;
                location = Location.StartTag;
                attributeQuote = undefined;
            }
            else if ((location === Location.StartTag || location === Location.StartTagName)
                && cc === "/"
                && pc !== " "
                && options.enforcePrettySelfClosingTagOnFormat) {
                output += " /";
            }
            else if ((location === Location.StartTag || location === Location.StartTagName) && cc === ">") {
                // if this was a self-closing tag, we need to decrement the indent level and add a newLine
                if (pc === "/") {
                    indentLevel--;
                    output += ">";
                    // only add a newline here if one doesn't already exist (issue #147)
                    if (nc !== "\r" && nc !== "\n") {
                        output += options.newLine;
                    }
                }
                else {
                    output += ">";
                }
                lastNonTextLocation = location;
                location = Location.Text;
            }
            else if (location === Location.Text && cc === "<" && nc === "/") {
                indentLevel--;
                // if the end tag immediately follows a line break, just add an indentation
                // if the end tag immediately follows another end tag or a self-closing tag (issue #185), add a line break and indent
                // otherwise, this should be treated as a same-line end tag(ex. <element>text</element>)
                if (pc === "\n" || lineBreakSpree) {
                    // removing trailing non-breaking whitespace here prevents endless indentations (issue #193)
                    output = this._removeTrailingNonBreakingWhitespace(output);
                    output += `${this._getIndent(options, indentLevel)}<`;
                    lineBreakSpree = false;
                }
                else if (lastNonTextLocation === Location.EndTag) {
                    output += `${options.newLine}${this._getIndent(options, indentLevel)}<`;
                }
                else if (pc === ">" && ppc === "/") {
                    output += `${this._getIndent(options, indentLevel)}<`;
                }
                else {
                    output += "<";
                }
                location = Location.EndTag;
            }
            else if (location === Location.EndTag && cc === ">") {
                output += ">";
                lastNonTextLocation = location;
                location = Location.Text;
            }
            else {
                if (cc === "\n") {
                    lineBreakSpree = true;
                }
                else if (lineBreakSpree && /\S/.test(cc)) {
                    lineBreakSpree = false;
                }
                output += cc;
            }
        }
        return output;
    }
    minifyXml(xml, options) {
        return new classic_xml_formatter_1.ClassicXmlFormatter().minifyXml(xml, options);
    }
    _getIndent(options, indentLevel) {
        return ((options.editorOptions.insertSpaces) ? " ".repeat(options.editorOptions.tabSize) : "\t").repeat(indentLevel);
    }
    _removeTrailingNonBreakingWhitespace(text) {
        return text.replace(/[^\r\n\S]+$/, "");
    }
    _sanitizeComments(xml) {
        let output = "";
        let inComment = false;
        for (let i = 0; i < xml.length; i++) {
            const cc = xml[i];
            const nc = xml.charAt(i + 1);
            const nnc = xml.charAt(i + 2);
            const pc = xml.charAt(i - 1);
            if (!inComment && cc === "<" && nc === "!" && nnc === "-") {
                inComment = true;
                output += "<!--";
                i += 3;
            }
            else if (inComment && cc === "<") {
                output += MagicalStringOfWonders;
            }
            else if (inComment && cc === "-" && nc === "-" && nnc === ">") {
                inComment = false;
                output += "-->";
                i += 2;
            }
            else {
                output += cc;
            }
        }
        return output;
    }
    _unsanitizeComments(xml) {
        return xml.replace(new RegExp(MagicalStringOfWonders, "g"), "<");
    }
}
exports.V2XmlFormatter = V2XmlFormatter;
var Location;
(function (Location) {
    Location[Location["Attribute"] = 0] = "Attribute";
    Location[Location["AttributeValue"] = 1] = "AttributeValue";
    Location[Location["CData"] = 2] = "CData";
    Location[Location["Comment"] = 3] = "Comment";
    Location[Location["EndTag"] = 4] = "EndTag";
    Location[Location["SpecialTag"] = 5] = "SpecialTag";
    Location[Location["StartTag"] = 6] = "StartTag";
    Location[Location["StartTagName"] = 7] = "StartTagName";
    Location[Location["Text"] = 8] = "Text";
})(Location || (Location = {}));
//# sourceMappingURL=v2-xml-formatter.js.map