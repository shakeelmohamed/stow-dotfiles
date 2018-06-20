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
const vscode = require("vscode");
const fsWrapper_1 = require("./fsWrapper");
const mapper_1 = require("./mapper");
const settings_1 = require("./settings");
const sublimeFolderFinder = require("./sublimeFolderFinder");
const path = require("path");
const mapper = new mapper_1.Mapper();
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublime', () => start()));
        const hasPrompted = context.globalState.get('alreadyPrompted') || false;
        if (!hasPrompted) {
            yield showPrompt();
            yield context.globalState.update('alreadyPrompted', true);
        }
    });
}
exports.activate = activate;
function showPrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield vscode.window.showInformationMessage('Would you like to customize VS Code to behave more like Sublime Text?', 'Yes', 'No');
        if (answer && answer === 'Yes') {
            start();
        }
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const categorizedSettings = yield getCategorizedSettings();
        if (categorizedSettings) {
            if (categorizedSettings.mappedSettings.length || categorizedSettings.defaultSettings.length) {
                const selectedSettings = yield showPicker(categorizedSettings);
                if (selectedSettings && selectedSettings.length) {
                    yield importSettings(selectedSettings);
                    yield vscode.commands.executeCommand('workbench.action.openGlobalSettings');
                }
            }
            else {
                vscode.window.showInformationMessage('Nothing to import. All settings have already been imported');
            }
        }
    });
}
function getCategorizedSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        const settingsPath = yield getSublimeFolderPath();
        if (settingsPath) {
            return getSettings(settingsPath);
        }
        return null;
    });
}
function getSublimeFolderPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const sublimeSettingsPath = yield sublimeFolderFinder.getExistingDefaultPaths();
        if (sublimeSettingsPath) {
            return sublimeSettingsPath.fsPath;
        }
        return yield browsePrompt(`No Sublime settings file found at the default location: ${path.join(sublimeFolderFinder.getOSDefaultPaths()[0], sublimeFolderFinder.sublimeSettingsFilename)} `);
    });
}
function browsePrompt(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode.window.showInformationMessage(msg, 'Browse...');
        if (result) {
            const sublimeSettingsFiles = yield vscode.window.showOpenDialog({ canSelectFiles: true });
            if (sublimeSettingsFiles && sublimeSettingsFiles.length) {
                const filePath = sublimeSettingsFiles[0].fsPath;
                const isValidFilePath = yield validate(filePath);
                if (isValidFilePath) {
                    return filePath;
                }
                else {
                    vscode.window.showErrorMessage(`Could not find ${sublimeFolderFinder.sublimeSettingsFilename} at ${sublimeSettingsFiles[0].fsPath} `);
                }
            }
        }
        return undefined;
    });
}
function validate(settingsFilePath) {
    return settingsFilePath.endsWith(sublimeFolderFinder.sublimeSettingsFilename);
}
function getSettings(sublimeSettingsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = yield mapper.getMappedSettings(yield fsWrapper_1.readFileAsync(sublimeSettingsPath, 'utf-8'));
        settings.mappedSettings.sort((a, b) => {
            if (a.vscode.overwritesValue && b.vscode.overwritesValue) {
                return a.sublime.name.localeCompare(b.sublime.name);
            }
            else if (a.vscode.overwritesValue) {
                return -1;
            }
            else if (b.vscode.overwritesValue) {
                return 1;
            }
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        return settings;
    });
}
function showPicker(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        // showing mapped & default settings
        const pickedItems = yield vscode.window.showQuickPick([...settings.mappedSettings.map((ms) => setting2QuickPickItem(ms.vscode, ms.sublime.name)),
            ...settings.defaultSettings.map((s) => setting2QuickPickItem(s))], { canPickMany: true, ignoreFocusOut: true });
        // converting all selected entries to VscodeSettings
        return pickedItems ? pickedItems.map(pickItem => pickItem.setting instanceof settings_1.MappedSetting ? pickItem.setting.vscode : pickItem.setting) : [];
    });
}
function setting2QuickPickItem(setting, sublimeName) {
    const icons = { exclamationPoint: '$(issue-opened)', arrowRight: '$(arrow-right)' }; // stored in var because auto-format adds spaces to hypens
    return {
        detail: setting.overwritesValue
            ? `${icons.exclamationPoint} Overwrites existing value: '${setting.oldValue}' with '${setting.value}'`
            : '',
        label: sublimeName
            ? `${sublimeName} ${icons.arrowRight} ${setting.name}`
            : `${setting.name}: ${setting.value}`,
        picked: !setting.overwritesValue,
        setting,
    };
}
function importSettings(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Importing Settings',
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            progress.report({ increment: 0 });
            const incrementSize = 100.0 / settings.length;
            const config = vscode.workspace.getConfiguration();
            for (const setting of settings) {
                try {
                    yield config.update(setting.name, setting.value, vscode.ConfigurationTarget.Global);
                    progress.report({ increment: incrementSize, message: setting.name });
                }
                catch (e) {
                    vscode.window.showErrorMessage(e.message);
                    return;
                }
            }
        }));
    });
}
//# sourceMappingURL=extension.js.map