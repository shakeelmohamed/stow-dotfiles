"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../../common/configuration");
const di_1 = require("../../common/di");
const formatters_1 = require("../formatters");
const index_1 = require("../index");
function configureServices() {
    di_1.ServiceContainer.default.addTransient(index_1.XmlFormatterToken, x => {
        const config = x.get(configuration_1.ConfigService);
        if (config.xmlFormatterImplementation === "classic") {
            return new formatters_1.ClassicXmlFormatter();
        }
        else if (config.xmlFormatterImplementation === "v2") {
            return new formatters_1.V2XmlFormatter();
        }
    });
}
exports.configureServices = configureServices;
//# sourceMappingURL=configure-services.js.map