"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../../common/configuration");
const formatters_1 = require("../formatters");
const index_1 = require("../index");
function configureFormattingServices(services) {
    services.addSingleton(index_1.XmlFormatterToken, x => {
        const config = x.get(configuration_1.ConfigService);
        if (config.xmlFormatterImplementation === "classic") {
            return new formatters_1.ClassicXmlFormatter();
        }
        else if (config.xmlFormatterImplementation === "v2") {
            return new formatters_1.V2XmlFormatter();
        }
    });
    services.addSingleton(index_1.XmlFormattingEditProvider, x => {
        const config = x.get(configuration_1.ConfigService);
        const formatter = x.get(index_1.XmlFormatterToken);
        return new index_1.XmlFormattingEditProvider(config, formatter);
    });
}
exports.configureFormattingServices = configureFormattingServices;
//# sourceMappingURL=configure-formatting-services.js.map