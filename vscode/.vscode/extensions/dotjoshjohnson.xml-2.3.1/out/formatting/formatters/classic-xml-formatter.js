"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClassicXmlFormatter {
    formatXml(xml, options) {
        xml = this.minifyXml(xml, options);
        xml = xml.replace(/</g, "~::~<");
        if (options.splitXmlnsOnFormat) {
            xml = xml
                .replace(/xmlns\:/g, "~::~xmlns:")
                .replace(/xmlns\=/g, "~::~xmlns=");
        }
        const parts = xml.split("~::~");
        let inComment = false;
        let level = 0;
        let output = "";
        for (let i = 0; i < parts.length; i++) {
            // <!
            if (parts[i].search(/<!/) > -1) {
                output += this._getIndent(options, level, parts[i]);
                inComment = true;
                // end <!
                if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1 || parts[i].search(/!DOCTYPE/) > -1) {
                    inComment = false;
                }
            }
            else if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1) {
                output += parts[i];
                inComment = false;
            }
            else if (/^<(\w|:)/.test(parts[i - 1]) && /^<\/(\w|:)/.test(parts[i])
                && /^<[\w:\-\.\,\/]+/.exec(parts[i - 1])[0] === /^<\/[\w:\-\.\,]+/.exec(parts[i])[0].replace("/", "")) {
                output += parts[i];
                if (!inComment) {
                    level--;
                }
            }
            else if (parts[i].search(/<(\w|:)/) > -1 && parts[i].search(/<\//) === -1 && parts[i].search(/\/>/) === -1) {
                output = (!inComment) ? output += this._getIndent(options, level++, parts[i]) : output += parts[i];
            }
            else if (parts[i].search(/<(\w|:)/) > -1 && parts[i].search(/<\//) > -1) {
                output = (!inComment) ? output += this._getIndent(options, level, parts[i]) : output += parts[i];
            }
            else if (parts[i].search(/<\//) > -1) {
                output = (!inComment) ? output += this._getIndent(options, --level, parts[i]) : output += parts[i];
            }
            else if (parts[i].search(/\/>/) > -1 && (!options.splitXmlnsOnFormat || parts[i].search(/xmlns(:|=)/) === -1)) {
                output = (!inComment) ? output += this._getIndent(options, level, parts[i]) : output += parts[i];
            }
            else if (parts[i].search(/\/>/) > -1 && parts[i].search(/xmlns(:|=)/) > -1 && options.splitXmlnsOnFormat) {
                output = (!inComment) ? output += this._getIndent(options, level--, parts[i]) : output += parts[i];
            }
            else if (parts[i].search(/<\?/) > -1) {
                output += this._getIndent(options, level, parts[i]);
            }
            else if (options.splitXmlnsOnFormat && (parts[i].search(/xmlns\:/) > -1 || parts[i].search(/xmlns\=/) > -1)) {
                output += this._getIndent(options, level, parts[i]);
            }
            else {
                output += parts[i];
            }
        }
        // remove leading newline
        if (output[0] === options.newLine) {
            output = output.slice(1);
        }
        else if (output.substring(0, 1) === options.newLine) {
            output = output.slice(2);
        }
        return output;
    }
    minifyXml(xml, options) {
        xml = this._stripLineBreaks(options, xml); // all line breaks outside of CDATA elements
        xml = (options.removeCommentsOnMinify) ? xml.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "") : xml;
        xml = xml.replace(/>\s{0,}</g, "><"); // insignificant whitespace between tags
        xml = xml.replace(/"\s+(?=[^\s]+=)/g, "\" "); // spaces between attributes
        xml = xml.replace(/"\s+(?=>)/g, "\""); // spaces between the last attribute and tag close (>)
        xml = xml.replace(/"\s+(?=\/>)/g, "\" "); // spaces between the last attribute and tag close (/>)
        xml = xml.replace(/[^ <>="]\s+[^ <>="]+=/g, (match) => {
            return match.replace(/\s+/g, " ");
        });
        return xml;
    }
    _getIndent(options, level, trailingValue) {
        trailingValue = trailingValue || "";
        const indentPattern = (options.editorOptions.preferSpaces) ? " ".repeat(options.editorOptions.tabSize) : "\t";
        return `${options.newLine}${indentPattern.repeat(level)}${trailingValue}`;
    }
    _stripLineBreaks(options, xml) {
        let output = "";
        const inTag = false;
        const inTagName = false;
        let inCdata = false;
        const inAttribute = false;
        for (let i = 0; i < xml.length; i++) {
            const char = xml.charAt(i);
            const prev = xml.charAt(i - 1);
            const next = xml.charAt(i + 1);
            if (char === "!" && (xml.substr(i, 8) === "![CDATA[" || xml.substr(i, 3) === "!--")) {
                inCdata = true;
            }
            else if (char === "]" && (xml.substr(i, 3) === "]]>")) {
                inCdata = false;
            }
            else if (char === "-" && (xml.substr(i, 3) === "-->")) {
                inCdata = false;
            }
            else if (char.search(/[\r\n]/g) > -1 && !inCdata) {
                if (/\r/.test(char) && /\S|\r|\n/.test(prev) && /\S|\r|\n/.test(xml.charAt(i + options.newLine.length))) {
                    output += char;
                }
                else if (/\n/.test(char) && /\S|\r|\n/.test(xml.charAt(i - options.newLine.length)) && /\S|\r|\n/.test(next)) {
                    output += char;
                }
                continue;
            }
            output += char;
        }
        return output;
    }
}
exports.ClassicXmlFormatter = ClassicXmlFormatter;
//# sourceMappingURL=classic-xml-formatter.js.map