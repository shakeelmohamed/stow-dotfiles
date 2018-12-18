"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
class ParsedEnvironmentFile {
    constructor(env, warning) {
        this.Env = env;
        this.Warning = warning;
    }
    static CreateFromFile(envFile, initialEnv) {
        let content = fs.readFileSync(envFile, "utf8");
        return this.CreateFromContent(content, envFile, initialEnv);
    }
    static CreateFromContent(content, envFile, initialEnv) {
        // Remove UTF-8 BOM if present
        if (content.charAt(0) === '\uFEFF') {
            content = content.substr(1);
        }
        let parseErrors = [];
        let env = initialEnv;
        if (!env) {
            env = {};
        }
        content.split("\n").forEach(line => {
            // Split the line between key and value
            const r = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
            if (r !== null) {
                const key = r[1];
                let value = r[2] || "";
                if ((value.length > 0) && (value.charAt(0) === '"') && (value.charAt(value.length - 1) === '"')) {
                    value = value.replace(/\\n/gm, "\n");
                }
                value = value.replace(/(^['"]|['"]$)/g, "");
                env[key] = value;
            }
            else {
                // Blank lines and lines starting with # are no parse errors
                const comments = new RegExp(/^\s*(#|$)/);
                if (!comments.test(line)) {
                    parseErrors.push(line);
                }
            }
        });
        // show error message if single lines cannot get parsed
        let warning = null;
        if (parseErrors.length !== 0) {
            warning = "Ignoring non-parseable lines in envFile " + envFile + ": ";
            parseErrors.forEach(function (value, idx, array) {
                warning += "\"" + value + "\"" + ((idx !== array.length - 1) ? ", " : ".");
            });
        }
        return new ParsedEnvironmentFile(env, warning);
    }
}
exports.ParsedEnvironmentFile = ParsedEnvironmentFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VkRW52aXJvbm1lbnRGaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmVjbHItZGVidWcvUGFyc2VkRW52aXJvbm1lbnRGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsK0JBQStCO0FBRS9CO0lBS0ksWUFBb0IsR0FBMkIsRUFBRSxPQUFzQjtRQUVuRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQWUsRUFBRSxVQUE4QztRQUN4RixJQUFJLE9BQU8sR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2RCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBZSxFQUFFLE9BQWUsRUFBRSxVQUE4QztRQUU1Ryw4QkFBOEI7UUFDOUIsSUFBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUMvQixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUMvQixJQUFJLEdBQUcsR0FBMkIsVUFBVSxDQUFDO1FBQzdDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixHQUFHLEdBQUcsRUFBRSxDQUFDO1NBQ1o7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQix1Q0FBdUM7WUFDdkMsTUFBTSxDQUFDLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztZQUUxRSxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ1osTUFBTSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLEtBQUssR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQzdGLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDeEM7Z0JBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRTVDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDcEI7aUJBQ0k7Z0JBQ0QsNERBQTREO2dCQUM1RCxNQUFNLFFBQVEsR0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3RCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzFCO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILHVEQUF1RDtRQUN2RCxJQUFJLE9BQU8sR0FBVyxJQUFJLENBQUM7UUFDM0IsSUFBRyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6QixPQUFPLEdBQUcsMENBQTBDLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0RSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLO2dCQUMzQyxPQUFPLElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxPQUFPLElBQUkscUJBQXFCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDSjtBQWhFRCxzREFnRUMifQ==