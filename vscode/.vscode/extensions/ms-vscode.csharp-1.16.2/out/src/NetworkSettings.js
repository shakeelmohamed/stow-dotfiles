"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class NetworkSettings {
    constructor(proxy, strictSSL) {
        this.proxy = proxy;
        this.strictSSL = strictSSL;
    }
}
exports.default = NetworkSettings;
function vscodeNetworkSettingsProvider(vscode) {
    return () => {
        const config = vscode.workspace.getConfiguration();
        const proxy = config.get('http.proxy');
        const strictSSL = config.get('http.proxyStrictSSL', true);
        return new NetworkSettings(proxy, strictSSL);
    };
}
exports.vscodeNetworkSettingsProvider = vscodeNetworkSettingsProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV0d29ya1NldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL05ldHdvcmtTZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBSWhHO0lBQ0ksWUFBNEIsS0FBYSxFQUFrQixTQUFrQjtRQUFqRCxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQWtCLGNBQVMsR0FBVCxTQUFTLENBQVM7SUFDN0UsQ0FBQztDQUNKO0FBSEQsa0NBR0M7QUFNRCx1Q0FBOEMsTUFBYztJQUN4RCxPQUFPLEdBQUcsRUFBRTtRQUNSLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFTLFlBQVksQ0FBQyxDQUFDO1FBQy9DLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsT0FBTyxJQUFJLGVBQWUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVBELHNFQU9DIn0=