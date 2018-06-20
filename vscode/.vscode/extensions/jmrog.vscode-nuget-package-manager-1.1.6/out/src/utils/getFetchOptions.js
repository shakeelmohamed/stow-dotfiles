"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const HttpsProxyAgent = require("https-proxy-agent");
const constants_1 = require("../constants");
// Cache a few things since this stuff will rarely change, and there's no need to recreate an agent
// if no change has occurred, etc.
let lastProxy = '';
let lastProxyStrictSSL;
let lastHttpsProxyAgent;
function getFetchOptions(configuration) {
    const { proxy, proxyAuthorization, proxyStrictSSL } = configuration || {};
    const fetchOptions = { timeout: constants_1.RESPONSE_TIMEOUT };
    if (!proxy) {
        lastProxy = '';
        return fetchOptions; // no proxy, so ignore everything but timeout
    }
    if (proxy === lastProxy && proxyStrictSSL === lastProxyStrictSSL) {
        fetchOptions.agent = lastHttpsProxyAgent;
    }
    else {
        const parsedProxy = url.parse(proxy);
        const useStrictSSL = !!proxyStrictSSL; // coerce to boolean just in case
        fetchOptions.agent = new HttpsProxyAgent(Object.assign({}, parsedProxy, { secureEndpoint: useStrictSSL, rejectUnauthorized: useStrictSSL }));
        lastHttpsProxyAgent = fetchOptions.agent;
        lastProxyStrictSSL = proxyStrictSSL;
        lastProxy = proxy;
    }
    if (proxyAuthorization) {
        fetchOptions.headers = {
            'Proxy-Authorization': proxyAuthorization
        };
    }
    return fetchOptions;
}
exports.default = getFetchOptions;
//# sourceMappingURL=getFetchOptions.js.map