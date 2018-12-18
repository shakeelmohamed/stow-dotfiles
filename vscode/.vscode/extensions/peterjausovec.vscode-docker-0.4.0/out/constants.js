"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
//AsyncPool Constants
exports.MAX_CONCURRENT_REQUESTS = 8;
exports.MAX_CONCURRENT_SUBSCRIPTON_REQUESTS = 5;
// Consider downloading multiple pages (images, tags, etc)
exports.PAGE_SIZE = 100;
var keytarConstants;
(function (keytarConstants) {
    keytarConstants.serviceId = 'vscode-docker';
    keytarConstants.dockerHubTokenKey = 'dockerhub.token';
    keytarConstants.dockerHubUserNameKey = 'dockerhub.username';
    keytarConstants.dockerHubPasswordKey = 'dockerhub.password';
})(keytarConstants = exports.keytarConstants || (exports.keytarConstants = {}));
var configurationKeys;
(function (configurationKeys) {
    configurationKeys.defaultRegistryPath = "defaultRegistryPath";
})(configurationKeys = exports.configurationKeys || (exports.configurationKeys = {}));
//Credentials Constants
exports.NULL_GUID = '00000000-0000-0000-0000-000000000000'; //Empty GUID is a special username to indicate the login credential is based on JWT token.
//Azure Container Registries
exports.skus = ["Standard", "Basic", "Premium"];
//Repository + Tag format
exports.imageTagRegExp = new RegExp('^[a-zA-Z0-9.-_/]{1,256}:(?![.-])[a-zA-Z0-9.-_]{1,128}$');
//# sourceMappingURL=constants.js.map