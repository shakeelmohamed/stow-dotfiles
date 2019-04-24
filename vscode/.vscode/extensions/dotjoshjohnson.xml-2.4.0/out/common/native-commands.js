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
const vscode_1 = require("vscode");
class NativeCommands {
    static cursorMove(to, by) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode_1.commands.executeCommand("cursorMove", {
                to: to,
                by: by
            });
        });
    }
    static openGlobalSettings() {
        vscode_1.commands.executeCommand("workbench.action.openGlobalSettings");
    }
    static setContext(key, value) {
        vscode_1.commands.executeCommand("setContext", key, value);
    }
}
exports.NativeCommands = NativeCommands;
//# sourceMappingURL=native-commands.js.map