"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const AbsolutePath_1 = require("./AbsolutePath");
class AbsolutePathPackage {
    constructor(description, url, platforms, architectures, binaries, installPath, installTestPath, fallbackUrl, platformId) {
        this.description = description;
        this.url = url;
        this.platforms = platforms;
        this.architectures = architectures;
        this.binaries = binaries;
        this.installPath = installPath;
        this.installTestPath = installTestPath;
        this.fallbackUrl = fallbackUrl;
        this.platformId = platformId;
    }
    static getAbsolutePathPackage(pkg, extensionPath) {
        return new AbsolutePathPackage(pkg.description, pkg.url, pkg.platforms, pkg.architectures, getAbsoluteBinaries(pkg, extensionPath), getAbsoluteInstallPath(pkg, extensionPath), getAbsoluteInstallTestPath(pkg, extensionPath), pkg.fallbackUrl, pkg.platformId);
    }
}
exports.AbsolutePathPackage = AbsolutePathPackage;
function getAbsoluteInstallTestPath(pkg, extensionPath) {
    if (pkg.installTestPath) {
        return AbsolutePath_1.AbsolutePath.getAbsolutePath(extensionPath, pkg.installTestPath);
    }
    return null;
}
function getAbsoluteBinaries(pkg, extensionPath) {
    let basePath = getAbsoluteInstallPath(pkg, extensionPath).value;
    if (pkg.binaries) {
        return pkg.binaries.map(value => AbsolutePath_1.AbsolutePath.getAbsolutePath(basePath, value));
    }
    return null;
}
function getAbsoluteInstallPath(pkg, extensionPath) {
    if (pkg.installPath) {
        return AbsolutePath_1.AbsolutePath.getAbsolutePath(extensionPath, pkg.installPath);
    }
    return new AbsolutePath_1.AbsolutePath(extensionPath);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzb2x1dGVQYXRoUGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wYWNrYWdlTWFuYWdlci9BYnNvbHV0ZVBhdGhQYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFJaEcsaURBQThDO0FBRTlDO0lBQ0ksWUFBbUIsV0FBbUIsRUFDM0IsR0FBVyxFQUNYLFNBQW1CLEVBQ25CLGFBQXVCLEVBQ3ZCLFFBQXdCLEVBQ3hCLFdBQTBCLEVBQzFCLGVBQThCLEVBQzlCLFdBQW9CLEVBQ3BCLFVBQW1CO1FBUlgsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDM0IsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUNYLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDbkIsa0JBQWEsR0FBYixhQUFhLENBQVU7UUFDdkIsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7UUFDeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWU7UUFDMUIsb0JBQWUsR0FBZixlQUFlLENBQWU7UUFDOUIsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFDcEIsZUFBVSxHQUFWLFVBQVUsQ0FBUztJQUM5QixDQUFDO0lBRU0sTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQVksRUFBRSxhQUFxQjtRQUNwRSxPQUFPLElBQUksbUJBQW1CLENBQzFCLEdBQUcsQ0FBQyxXQUFXLEVBQ2YsR0FBRyxDQUFDLEdBQUcsRUFDUCxHQUFHLENBQUMsU0FBUyxFQUNiLEdBQUcsQ0FBQyxhQUFhLEVBQ2pCLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsRUFDdkMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxFQUMxQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEVBQzlDLEdBQUcsQ0FBQyxXQUFXLEVBQ2YsR0FBRyxDQUFDLFVBQVUsQ0FDakIsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQXpCRCxrREF5QkM7QUFFRCxvQ0FBb0MsR0FBWSxFQUFFLGFBQXFCO0lBQ25FLElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRTtRQUNyQixPQUFPLDJCQUFZLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDM0U7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsNkJBQTZCLEdBQVksRUFBRSxhQUFxQjtJQUM1RCxJQUFJLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2hFLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtRQUNkLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywyQkFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNuRjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxnQ0FBZ0MsR0FBWSxFQUFFLGFBQXFCO0lBQy9ELElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRTtRQUNqQixPQUFPLDJCQUFZLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDdkU7SUFFRCxPQUFPLElBQUksMkJBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQyxDQUFDIn0=