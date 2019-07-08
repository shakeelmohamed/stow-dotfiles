"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return (XmlFormatterFactory._xmlFormatter = xmlFormatterImplementation);
    }
}
exports.XmlFormatterFactory = XmlFormatterFactory;
//# sourceMappingURL=xml-formatter.js.map