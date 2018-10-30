"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ContextService {
    setContext(key, value) {
        vscode_1.commands.executeCommand("setContext", key, value);
    }
}
exports.ContextService = ContextService;
//# sourceMappingURL=context-service.js.map