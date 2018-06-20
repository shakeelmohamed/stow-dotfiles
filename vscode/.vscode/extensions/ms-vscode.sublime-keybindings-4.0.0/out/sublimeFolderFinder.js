"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const fileSystem = require("./fsWrapper");
exports.sublimeSettingsFilename = 'Preferences.sublime-settings';
const defaultSublimeSettingsPaths = new Map([
    ['win32', [path.join(os.homedir(), 'AppData', 'Roaming', 'Sublime Text 3')]],
    ['darwin', [path.join(os.homedir(), 'Library', 'Application Support', 'Sublime Text 3')]],
    ['linux', [path.join(os.homedir(), '.config', 'sublime-text-3')]],
]);
const settingsSubfoldersPath = path.join('Packages', 'User', 'Preferences.sublime-settings');
function getExistingDefaultPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        const foundPaths = yield getOSDefaultPaths();
        if (!foundPaths.length) {
            return undefined;
        }
        return filterForExistingDirsAsync(foundPaths);
    });
}
exports.getExistingDefaultPaths = getExistingDefaultPaths;
function getOSDefaultPaths() {
    const platform = os.platform();
    const foundPaths = defaultSublimeSettingsPaths.get(platform);
    if (!foundPaths) {
        console.error('OS could not be identified. No default paths provided.');
        return [];
    }
    return foundPaths;
}
exports.getOSDefaultPaths = getOSDefaultPaths;
function filterForExistingDirsAsync(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const p of paths) {
            const settingsPath = path.resolve(p, settingsSubfoldersPath);
            if (yield fileSystem.pathExists(settingsPath)) {
                return vscode.Uri.file(settingsPath);
            }
        }
        return undefined;
    });
}
exports.filterForExistingDirsAsync = filterForExistingDirsAsync;
//# sourceMappingURL=sublimeFolderFinder.js.map