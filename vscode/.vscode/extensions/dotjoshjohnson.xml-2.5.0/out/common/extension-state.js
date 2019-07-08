"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExtensionState {
    static get global() {
        return this._context.globalState;
    }
    static get workspace() {
        return this._context.workspaceState;
    }
    static configure(context) {
        this._context = context;
    }
}
exports.ExtensionState = ExtensionState;
//# sourceMappingURL=extension-state.js.map