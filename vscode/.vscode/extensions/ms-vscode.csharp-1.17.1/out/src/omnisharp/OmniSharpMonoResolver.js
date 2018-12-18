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
const semver_1 = require("semver");
const path = require("path");
class OmniSharpMonoResolver {
    constructor(getMonoVersion) {
        this.getMonoVersion = getMonoVersion;
        this.minimumMonoVersion = "5.8.1";
    }
    configureEnvironmentAndGetInfo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let env = Object.assign({}, process.env);
            let monoPath;
            if (options.useGlobalMono !== "never" && options.monoPath !== undefined) {
                env['PATH'] = path.join(options.monoPath, 'bin') + path.delimiter + env['PATH'];
                env['MONO_GAC_PREFIX'] = options.monoPath;
                monoPath = options.monoPath;
            }
            let version = yield this.getMonoVersion(env);
            return {
                version,
                path: monoPath,
                env
            };
        });
    }
    getGlobalMonoInfo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let monoInfo = yield this.configureEnvironmentAndGetInfo(options);
            let isValid = monoInfo.version && semver_1.satisfies(monoInfo.version, `>=${this.minimumMonoVersion}`);
            if (options.useGlobalMono === "always") {
                if (!isValid) {
                    throw new Error(`Cannot start OmniSharp because Mono version >=${this.minimumMonoVersion} is required.`);
                }
                return monoInfo;
            }
            else if (options.useGlobalMono === "auto" && isValid) {
                return monoInfo;
            }
            return undefined;
        });
    }
}
exports.OmniSharpMonoResolver = OmniSharpMonoResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaVNoYXJwTW9ub1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9PbW5pU2hhcnBNb25vUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLG1DQUFtQztBQUNuQyw2QkFBNkI7QUFNN0I7SUFFSSxZQUFvQixjQUErQjtRQUEvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7UUFEM0MsdUJBQWtCLEdBQUcsT0FBTyxDQUFDO0lBRXJDLENBQUM7SUFFYSw4QkFBOEIsQ0FBQyxPQUFnQjs7WUFDekQsSUFBSSxHQUFHLHFCQUFRLE9BQU8sQ0FBQyxHQUFHLENBQUUsQ0FBQztZQUM3QixJQUFJLFFBQWdCLENBQUM7WUFDckIsSUFBSSxPQUFPLENBQUMsYUFBYSxLQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDckUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEYsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztnQkFDMUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDL0I7WUFFRCxJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFN0MsT0FBTztnQkFDSCxPQUFPO2dCQUNQLElBQUksRUFBRSxRQUFRO2dCQUNkLEdBQUc7YUFDTixDQUFDO1FBQ04sQ0FBQztLQUFBO0lBRVksaUJBQWlCLENBQUMsT0FBZ0I7O1lBQzNDLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xFLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksa0JBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztZQUU5RixJQUFJLE9BQU8sQ0FBQyxhQUFhLEtBQUssUUFBUSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELElBQUksQ0FBQyxrQkFBa0IsZUFBZSxDQUFDLENBQUM7aUJBQzVHO2dCQUVELE9BQU8sUUFBUSxDQUFDO2FBQ25CO2lCQUNJLElBQUksT0FBTyxDQUFDLGFBQWEsS0FBSyxNQUFNLElBQUksT0FBTyxFQUFFO2dCQUNsRCxPQUFPLFFBQVEsQ0FBQzthQUNuQjtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7S0FBQTtDQUNKO0FBeENELHNEQXdDQyJ9