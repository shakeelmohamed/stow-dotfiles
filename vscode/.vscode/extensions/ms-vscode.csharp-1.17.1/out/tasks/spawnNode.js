/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const async_child_process_1 = require("async-child-process");
const projectPaths_1 = require("./projectPaths");
function spawnNode(args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options) {
            options = {
                env: {}
            };
        }
        let optionsWithFullEnvironment = Object.assign({ cwd: projectPaths_1.rootPath, stdio: 'inherit' }, options, { env: Object.assign({}, process.env, options.env) });
        console.log(`starting ${projectPaths_1.nodePath} ${args.join(' ')}`);
        let spawned = child_process_1.spawn(projectPaths_1.nodePath, args, optionsWithFullEnvironment);
        // spawned.stderr.pipe(process.stdout);
        // spawned.stdout.pipe(process.stdout);
        return async_child_process_1.join(spawned);
    });
}
exports.default = spawnNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bhd25Ob2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGFza3Mvc3Bhd25Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQUViLGlEQUFvRDtBQUNwRCw2REFBbUQ7QUFDbkQsaURBQW9EO0FBRXBELG1CQUF3QyxJQUFlLEVBQUUsT0FBc0I7O1FBQzNFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixPQUFPLEdBQUc7Z0JBQ04sR0FBRyxFQUFFLEVBQUU7YUFDVixDQUFDO1NBQ0w7UUFFRCxJQUFJLDBCQUEwQixtQkFDMUIsR0FBRyxFQUFFLHVCQUFRLEVBQ2IsS0FBSyxFQUFFLFNBQVMsSUFDYixPQUFPLElBQ1YsR0FBRyxvQkFDSSxPQUFPLENBQUMsR0FBRyxFQUNYLE9BQU8sQ0FBQyxHQUFHLElBRXJCLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksdUJBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV0RCxJQUFJLE9BQU8sR0FBRyxxQkFBSyxDQUFDLHVCQUFRLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFFaEUsdUNBQXVDO1FBQ3ZDLHVDQUF1QztRQUV2QyxPQUFPLDBCQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekIsQ0FBQztDQUFBO0FBekJELDRCQXlCQyJ9