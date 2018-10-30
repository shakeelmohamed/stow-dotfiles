"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nls = require("vscode-nls");
const vscode_1 = require("vscode");
const request_light_1 = require("request-light");
const localize = nls.loadMessageBundle();
const FEED_INDEX_URL = 'https://api.nuget.org/v3/index.json';
const LIMIT = 30;
class ProjectJSONContribution {
    constructor(requestService) {
        this.requestService = requestService;
    }
    getDocumentSelector() {
        return [{ language: 'json', pattern: '**/project.json' }];
    }
    getNugetIndex() {
        if (!this.nugetIndexPromise) {
            this.nugetIndexPromise = this.makeJSONRequest(FEED_INDEX_URL).then(indexContent => {
                let services = {};
                if (indexContent && Array.isArray(indexContent.resources)) {
                    let resources = indexContent.resources;
                    for (let i = resources.length - 1; i >= 0; i--) {
                        let type = resources[i]['@type'];
                        let id = resources[i]['@id'];
                        if (type && id) {
                            services[type] = id;
                        }
                    }
                }
                return services;
            });
        }
        return this.nugetIndexPromise;
    }
    getNugetService(serviceType) {
        return this.getNugetIndex().then(services => {
            let serviceURL = services[serviceType];
            if (!serviceURL) {
                return Promise.reject(localize('json.nugget.error.missingservice', 'NuGet index document is missing service {0}', serviceType));
            }
            return serviceURL;
        });
    }
    makeJSONRequest(url) {
        return this.requestService({
            url: url
        }).then(success => {
            if (success.status === 200) {
                try {
                    return JSON.parse(success.responseText);
                }
                catch (e) {
                    return Promise.reject(localize('json.nugget.error.invalidformat', '{0} is not a valid JSON document', url));
                }
            }
            return Promise.reject(localize('json.nugget.error.indexaccess', 'Request to {0} failed: {1}', url, success.responseText));
        }, (error) => __awaiter(this, void 0, void 0, function* () {
            return Promise.reject(localize('json.nugget.error.access', 'Request to {0} failed: {1}', url, request_light_1.getErrorStatusDescription(error.status)));
        }));
    }
    collectPropertySuggestions(resource, location, currentWord, addValue, isLast, result) {
        if ((location.matches(['dependencies']) || location.matches(['frameworks', '*', 'dependencies']) || location.matches(['frameworks', '*', 'frameworkAssemblies']))) {
            return this.getNugetService('SearchAutocompleteService').then(service => {
                let queryUrl;
                if (currentWord.length > 0) {
                    queryUrl = service + '?q=' + encodeURIComponent(currentWord) + '&take=' + LIMIT;
                }
                else {
                    queryUrl = service + '?take=' + LIMIT;
                }
                return this.makeJSONRequest(queryUrl).then(resultObj => {
                    if (Array.isArray(resultObj.data)) {
                        let results = resultObj.data;
                        for (let i = 0; i < results.length; i++) {
                            let name = results[i];
                            let insertText = JSON.stringify(name);
                            if (addValue) {
                                insertText += ': "{{}}"';
                                if (!isLast) {
                                    insertText += ',';
                                }
                            }
                            let proposal = new vscode_1.CompletionItem(name);
                            proposal.kind = vscode_1.CompletionItemKind.Property;
                            proposal.insertText = insertText;
                            proposal.filterText = JSON.stringify(name);
                            result.add(proposal);
                        }
                        if (results.length === LIMIT) {
                            result.setAsIncomplete();
                        }
                    }
                }, error => {
                    result.error(error);
                });
            }, error => {
                result.error(error);
            });
        }
        return null;
    }
    collectValueSuggestions(resource, location, result) {
        if ((location.matches(['dependencies', '*']) || location.matches(['frameworks', '*', 'dependencies', '*']) || location.matches(['frameworks', '*', 'frameworkAssemblies', '*']))) {
            return this.getNugetService('PackageBaseAddress/3.0.0').then(service => {
                let currentKey = location.path[location.path.length - 1];
                if (typeof currentKey === 'string') {
                    let queryUrl = service + currentKey + '/index.json';
                    return this.makeJSONRequest(queryUrl).then(obj => {
                        if (Array.isArray(obj.versions)) {
                            let results = obj.versions;
                            for (let i = 0; i < results.length; i++) {
                                let curr = results[i];
                                let name = JSON.stringify(curr);
                                let proposal = new vscode_1.CompletionItem(name);
                                proposal.kind = vscode_1.CompletionItemKind.Class;
                                proposal.insertText = name;
                                proposal.documentation = '';
                                result.add(proposal);
                            }
                            if (results.length === LIMIT) {
                                result.setAsIncomplete();
                            }
                        }
                    }, error => {
                        result.error(error);
                    });
                }
            }, error => {
                result.error(error);
            });
        }
        return null;
    }
    collectDefaultSuggestions(resource, result) {
        let defaultValue = {
            'version': '{{1.0.0-*}}',
            'dependencies': {},
            'frameworks': {
                'dnx451': {},
                'dnxcore50': {}
            }
        };
        let proposal = new vscode_1.CompletionItem(localize('json.project.default', 'Default project.json'));
        proposal.kind = vscode_1.CompletionItemKind.Module;
        proposal.insertText = JSON.stringify(defaultValue, null, '\t');
        result.add(proposal);
        return null;
    }
    resolveSuggestion(item) {
        if (item.kind === vscode_1.CompletionItemKind.Property) {
            let pack = item.label;
            return this.getInfo(pack).then(info => {
                if (info.description) {
                    item.documentation = info.description;
                }
                if (info.version) {
                    item.detail = info.version;
                    item.insertText = item.insertText.replace(/\{\{\}\}/, '{{' + info.version + '}}');
                }
                return item;
            });
        }
        return null;
    }
    getInfo(pack) {
        return this.getNugetService('SearchQueryService').then(service => {
            let queryUrl = service + '?q=' + encodeURIComponent(pack) + '&take=' + 5;
            return this.makeJSONRequest(queryUrl).then(resultObj => {
                if (Array.isArray(resultObj.data)) {
                    let results = resultObj.data;
                    let info = {};
                    for (let i = 0; i < results.length; i++) {
                        let res = results[i];
                        if (res.id === pack) {
                            info.description = res.description;
                            info.version = localize('json.nugget.version.hover', 'Latest version: {0}', res.version);
                        }
                    }
                    return info;
                }
                return null;
            }, (error) => {
                return null;
            });
        }, (error) => {
            return null;
        });
    }
    getInfoContribution(resource, location) {
        if ((location.matches(['dependencies', '*']) || location.matches(['frameworks', '*', 'dependencies', '*']) || location.matches(['frameworks', '*', 'frameworkAssemblies', '*']))) {
            let pack = location.path[location.path.length - 1];
            if (typeof pack === 'string') {
                return this.getInfo(pack).then(info => {
                    let htmlContent = [];
                    htmlContent.push(localize('json.nugget.package.hover', '{0}', pack));
                    if (info.description) {
                        htmlContent.push(info.description);
                    }
                    if (info.version) {
                        htmlContent.push(info.version);
                    }
                    return htmlContent;
                });
            }
        }
        return null;
    }
}
exports.ProjectJSONContribution = ProjectJSONContribution;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdEpTT05Db250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmVhdHVyZXMvanNvbi9wcm9qZWN0SlNPTkNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsa0NBQWtDO0FBRWxDLG1DQUE0RjtBQUU1RixpREFBbUY7QUFRbkYsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFFekMsTUFBTSxjQUFjLEdBQUcscUNBQXFDLENBQUM7QUFDN0QsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBU2pCO0lBSUksWUFBMkIsY0FBMEI7UUFBMUIsbUJBQWMsR0FBZCxjQUFjLENBQVk7SUFDckQsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLGFBQWE7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN6QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBcUIsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNsRyxJQUFJLFFBQVEsR0FBa0IsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLFlBQVksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDdkQsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztvQkFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM1QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxD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