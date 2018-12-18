/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dockerExtension_1 = require("../dockerExtension");
const helper = require("../helpers/suggestSupportHelper");
// IntelliSense
class DockerfileCompletionItemProvider {
    constructor() {
        this.triggerCharacters = [];
        this.excludeTokens = [];
    }
    // tslint:disable-next-line:promise-function-async // Grandfathered in
    provideCompletionItems(document, position, token) {
        let dockerSuggestSupport = new helper.SuggestSupportHelper();
        let textLine = document.lineAt(position.line);
        let fromTextDocker = textLine.text.match(dockerExtension_1.FROM_DIRECTIVE_PATTERN);
        if (fromTextDocker) {
            return dockerSuggestSupport.suggestImages(fromTextDocker[1]);
        }
        return Promise.resolve([]);
    }
}
exports.DockerfileCompletionItemProvider = DockerfileCompletionItemProvider;
//# sourceMappingURL=dockerfileCompletionItemProvider.js.map