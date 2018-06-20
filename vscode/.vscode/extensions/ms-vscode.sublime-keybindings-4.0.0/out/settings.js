"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VscodeSetting {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    markAsOverride(oldValue) {
        this.overwritesValue = true;
        this.oldValue = oldValue;
    }
}
exports.VscodeSetting = VscodeSetting;
class MappedSetting {
    constructor(sublime, vscode) {
        this.sublime = sublime;
        this.vscode = vscode;
    }
}
exports.MappedSetting = MappedSetting;
class CategorizedSettings {
    constructor() {
        this.mappedSettings = [];
        this.alreadyExisting = [];
        this.noMappings = [];
        this.defaultSettings = []; // default sublime settings that are not in the mappings file but improve the sublime feel & look in VS Code
    }
}
exports.CategorizedSettings = CategorizedSettings;
//# sourceMappingURL=settings.js.map