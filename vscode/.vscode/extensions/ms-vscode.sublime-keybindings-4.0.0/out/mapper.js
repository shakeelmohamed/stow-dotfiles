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
const path_1 = require("path");
const rjson = require("relaxed-json");
const vscode = require("vscode");
const fsWrapper_1 = require("./fsWrapper");
const settings_1 = require("./settings");
class Mapper {
    constructor(settings, mockConfig) {
        this.settings = settings;
        this.mockConfig = mockConfig;
    }
    getMappedSettings(sublimeSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            const settingsMappings = yield this.getSettings();
            let parsedSublimeSettings;
            try {
                parsedSublimeSettings = rjson.parse(sublimeSettings);
            }
            catch (e) {
                vscode.window.showErrorMessage('The sublime settings file could not be parsed. Please check if it contains syntax errors.');
                throw (e);
            }
            return this.mapAllSettings(settingsMappings, parsedSublimeSettings);
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.settings) {
                const [mappingsFile, defaultsFile] = yield Promise.all([fsWrapper_1.readFileAsync(path_1.resolve(__dirname, '..', 'settings/mappings.json'), 'utf-8'), fsWrapper_1.readFileAsync(path_1.resolve(__dirname, '..', 'settings/defaults.json'), 'utf-8')]);
                this.settings = {
                    mappings: rjson.parse(mappingsFile),
                    defaults: rjson.parse(defaultsFile).map((setting) => new settings_1.VscodeSetting(setting[0], setting[1])),
                };
            }
            return this.settings;
        });
    }
    mapAllSettings(settings, sublimeSettings) {
        const analyzedSettings = new settings_1.CategorizedSettings();
        const config = this.mockConfig || vscode.workspace.getConfiguration();
        for (const sublimeKey of Object.keys(sublimeSettings)) {
            const sublimeSetting = { name: sublimeKey, value: sublimeSettings[sublimeKey] };
            const vscodeSetting = this.mapSetting(sublimeSetting, settings.mappings[sublimeKey]);
            if (vscodeSetting) {
                const configTest = this.checkWithExistingSettings(vscodeSetting, config);
                const mappedSetting = new settings_1.MappedSetting(sublimeSetting, vscodeSetting);
                if (configTest.alreadyExists) {
                    analyzedSettings.alreadyExisting.push(mappedSetting); // setting with same key-value pair already exists
                }
                else {
                    if (configTest.existingValue) {
                        mappedSetting.vscode.markAsOverride(configTest.existingValue); // setting with same key but different value exists
                    }
                    analyzedSettings.mappedSettings.push(mappedSetting);
                }
            }
            else {
                analyzedSettings.noMappings.push(sublimeSetting);
            }
        }
        return this.appendDefaultSublimeSettings(analyzedSettings, settings.defaults, config);
    }
    checkWithExistingSettings(vscodeSetting, config) {
        const returnVal = { alreadyExists: false, existingValue: '' };
        const info = config.inspect(vscodeSetting.name);
        if (info && info.globalValue !== undefined) {
            if (info.globalValue === vscodeSetting.value) {
                returnVal.alreadyExists = true;
            }
            else {
                returnVal.existingValue = info.globalValue.toString();
            }
        }
        return returnVal;
    }
    appendDefaultSublimeSettings(settings, defaultSettings, config) {
        const mappedAndExisting = [...settings.mappedSettings, ...settings.alreadyExisting];
        // filter out default settings that will be imported as mapped settings or already exist in the user settings
        const uniqueDefaultSettings = mappedAndExisting.length
            ? defaultSettings.filter(defaultSetting => !mappedAndExisting.find(mappedSetting => mappedSetting.vscode.name === defaultSetting.name))
            : defaultSettings;
        // don't show settings that already exist in user config
        uniqueDefaultSettings.forEach(defaultSetting => {
            const configTest = this.checkWithExistingSettings(defaultSetting, config);
            if (configTest.alreadyExists) {
                settings.alreadyExisting.push(new settings_1.MappedSetting({ name: 'Default Setting', value: '' }, defaultSetting));
            }
            else {
                if (configTest.existingValue) {
                    defaultSetting.markAsOverride(configTest.existingValue);
                }
                settings.defaultSettings.push(defaultSetting);
            }
        });
        settings.defaultSettings.sort((a, b) => {
            if (a.overwritesValue && b.overwritesValue) {
                return a.name.localeCompare(b.name);
            }
            else if (a.overwritesValue) {
                return 1;
            }
            else if (b.overwritesValue) {
                return -1;
            }
            return a.name.localeCompare(b.name);
        });
        return settings;
    }
    mapSetting(sublimeSetting, mappedValue) {
        if (mappedValue !== undefined) {
            if (typeof mappedValue === 'string') {
                return new settings_1.VscodeSetting(mappedValue, sublimeSetting.value);
            }
            else if (typeof mappedValue === 'object') {
                const obj = mappedValue[sublimeSetting.value];
                if (!obj) {
                    vscode.window.showErrorMessage(`Failed to parse setting: '${sublimeSetting.name}: ${sublimeSetting.value}'. Please check if it contains syntax errors`);
                    return undefined;
                }
                const keys = Object.keys(obj);
                const newKey = keys[0];
                const newValue = obj[newKey];
                return new settings_1.VscodeSetting(newKey, newValue);
            }
        }
        return undefined;
    }
}
exports.Mapper = Mapper;
//# sourceMappingURL=mapper.js.map