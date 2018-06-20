"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../common");
const constants = require("../constants");
const classic_xml_formatter_1 = require("./formatters/classic-xml-formatter");
const v2_xml_formatter_1 = require("./formatters/v2-xml-formatter");
class XmlFormatterFactory {
    static getXmlFormatter() {
        if (XmlFormatterFactory._xmlFormatter) {
            return XmlFormatterFactory._xmlFormatter;
        }
        const xmlFormatterImplementationSetting = common_1.Configuration.xmlFormatterImplementation;
        let xmlFormatterImplementation;
        switch (xmlFormatterImplementationSetting) {
            case constants.xmlFormatterImplementations.classic:
                xmlFormatterImplementation = new classic_xml_formatter_1.ClassicXmlFormatter();
                break;
            case constants.xmlFormatterImplementations.v2:
            default:
                xmlFormatterImplementation = new v2_xml_formatter_1.V2XmlFormatter();
                break;
        }
        // warn users about the new formatter
        const formatterWarningKey = "xmlTools.v2FormatterWarning.shown";
        if (!common_1.ExtensionState.global.get(formatterWarningKey) && xmlFormatterImplementation instanceof v2_xml_formatter_1.V2XmlFormatter) {
            // tslint:disable-next-line:max-line-length
            vscode_1.window.showInformationMessage("Heads up! We've rewritten the XML formatter. If you liked the old one better, it's still there. Just set the 'xmlTools.xmlFormatterImplementation' setting to 'classic'.")
                .then(() => {
                common_1.ExtensionState.global.update(formatterWarningKey, true);
            });
        }
        return (XmlFormatterFactory._xmlFormatter = xmlFormatterImplementation);
    }
}
exports.XmlFormatterFactory = XmlFormatterFactory;
//# sourceMappingURL=xml-formatter.js.map