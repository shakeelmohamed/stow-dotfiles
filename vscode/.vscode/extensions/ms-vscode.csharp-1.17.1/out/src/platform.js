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
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const util = require("./common");
const unknown = 'unknown';
/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
class LinuxDistribution {
    constructor(name, version, idLike) {
        this.name = name;
        this.version = version;
        this.idLike = idLike;
    }
    static GetCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
            // at https://www.freedesktop.org/software/systemd/man/os-release.html.
            return LinuxDistribution.FromFilePath('/etc/os-release')
                .catch(() => __awaiter(this, void 0, void 0, function* () { return LinuxDistribution.FromFilePath('/usr/lib/os-release'); }))
                .catch(() => __awaiter(this, void 0, void 0, function* () { return Promise.resolve(new LinuxDistribution(unknown, unknown)); }));
        });
    }
    toString() {
        return `name=${this.name}, version=${this.version}`;
    }
    /**
     * Returns a string representation of LinuxDistribution that only returns the
     * distro name if it appears on an allowed list of known distros. Otherwise,
     * it returns 'other'.
     */
    toTelemetryString() {
        const allowedList = [
            'antergos', 'arch', 'centos', 'debian', 'deepin', 'elementary', 'fedora',
            'galliumos', 'gentoo', 'kali', 'linuxmint', 'manjoro', 'neon', 'opensuse',
            'parrot', 'rhel', 'ubuntu', 'zorin'
        ];
        if (this.name === unknown || allowedList.indexOf(this.name) >= 0) {
            return this.toString();
        }
        else {
            // Having a hash of the name will be helpful to identify spikes in the 'other'
            // bucket when a new distro becomes popular and needs to be added to the
            // allowed list above.
            const hash = crypto.createHash('sha256');
            hash.update(this.name);
            const hashedName = hash.digest('hex');
            return `other (${hashedName})`;
        }
    }
    static FromFilePath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf8', (error, data) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(LinuxDistribution.FromReleaseInfo(data));
                    }
                });
            });
        });
    }
    static FromReleaseInfo(releaseInfo, eol = os.EOL) {
        let name = unknown;
        let version = unknown;
        let idLike = null;
        const lines = releaseInfo.split(eol);
        for (let line of lines) {
            line = line.trim();
            let equalsIndex = line.indexOf('=');
            if (equalsIndex >= 0) {
                let key = line.substring(0, equalsIndex);
                let value = line.substring(equalsIndex + 1);
                // Strip double quotes if necessary
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                if (key === 'ID') {
                    name = value;
                }
                else if (key === 'VERSION_ID') {
                    version = value;
                }
                else if (key === 'ID_LIKE') {
                    idLike = value.split(" ");
                }
                if (name !== unknown && version !== unknown && idLike !== null) {
                    break;
                }
            }
        }
        return new LinuxDistribution(name, version, idLike);
    }
}
exports.LinuxDistribution = LinuxDistribution;
class PlatformInformation {
    constructor(platform, architecture, distribution = null) {
        this.platform = platform;
        this.architecture = architecture;
        this.distribution = distribution;
    }
    isWindows() {
        return this.platform === 'win32';
    }
    isMacOS() {
        return this.platform === 'darwin';
    }
    isLinux() {
        return this.platform === 'linux';
    }
    toString() {
        let result = this.platform;
        if (this.architecture) {
            if (result) {
                result += ', ';
            }
            result += this.architecture;
        }
        if (this.distribution) {
            if (result) {
                result += ', ';
            }
            result += this.distribution.toString();
        }
        return result;
    }
    static GetCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = os.platform();
            let architecturePromise;
            let distributionPromise;
            switch (platform) {
                case 'win32':
                    architecturePromise = PlatformInformation.GetWindowsArchitecture();
                    distributionPromise = Promise.resolve(null);
                    break;
                case 'darwin':
                    architecturePromise = PlatformInformation.GetUnixArchitecture();
                    distributionPromise = Promise.resolve(null);
                    break;
                case 'linux':
                    architecturePromise = PlatformInformation.GetUnixArchitecture();
                    distributionPromise = LinuxDistribution.GetCurrent();
                    break;
                default:
                    throw new Error(`Unsupported platform: ${platform}`);
            }
            const platformData = yield Promise.all([architecturePromise, distributionPromise]);
            return new PlatformInformation(platform, platformData[0], platformData[1]);
        });
    }
    static GetWindowsArchitecture() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (process.env.PROCESSOR_ARCHITECTURE === 'x86' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
                    resolve('x86');
                }
                else {
                    resolve('x86_64');
                }
            });
        });
    }
    static GetUnixArchitecture() {
        return __awaiter(this, void 0, void 0, function* () {
            return util.execChildProcess('uname -m')
                .then(architecture => {
                if (architecture) {
                    return architecture.trim();
                }
                return null;
            });
        });
    }
    isValidPlatformForMono() {
        return this.isLinux() || this.isMacOS();
    }
}
exports.PlatformInformation = PlatformInformation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLGlDQUFpQztBQUNqQyx5QkFBeUI7QUFDekIseUJBQXlCO0FBQ3pCLGlDQUFpQztBQUVqQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFFMUI7Ozs7O0dBS0c7QUFDSDtJQUNJLFlBQ1csSUFBWSxFQUNaLE9BQWUsRUFDZixNQUFpQjtRQUZqQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLFdBQU0sR0FBTixNQUFNLENBQVc7SUFBSSxDQUFDO0lBRTFCLE1BQU0sQ0FBTyxVQUFVOztZQUMxQiwyRUFBMkU7WUFDM0UsdUVBQXVFO1lBQ3ZFLE9BQU8saUJBQWlCLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO2lCQUNuRCxLQUFLLENBQUMsR0FBUyxFQUFFLGdEQUFDLE9BQUEsaUJBQWlCLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUEsR0FBQSxDQUFDO2lCQUN4RSxLQUFLLENBQUMsR0FBUyxFQUFFLGdEQUFDLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7S0FBQTtJQUVNLFFBQVE7UUFDWCxPQUFPLFFBQVEsSUFBSSxDQUFDLElBQUksYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxpQkFBaUI7UUFDcEIsTUFBTSxXQUFXLEdBQUc7WUFDaEIsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUTtZQUN4RSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1B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