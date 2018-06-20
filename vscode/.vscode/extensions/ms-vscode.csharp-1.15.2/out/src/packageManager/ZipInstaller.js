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
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const yauzl = require("yauzl");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const NestedError_1 = require("../NestedError");
function InstallZip(buffer, description, destinationInstallPath, binaries, eventStream) {
    return __awaiter(this, void 0, void 0, function* () {
        eventStream.post(new loggingEvents_1.InstallationStart(description));
        return new Promise((resolve, reject) => {
            yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
                if (err) {
                    let message = "C# Extension was unable to download its dependencies. Please check your internet connection. If you use a proxy server, please visit https://aka.ms/VsCodeCsharpNetworking";
                    eventStream.post(new loggingEvents_1.ZipError(message));
                    return reject(new NestedError_1.NestedError(message));
                }
                zipFile.readEntry();
                zipFile.on('entry', (entry) => {
                    let absoluteEntryPath = path.resolve(destinationInstallPath, entry.fileName);
                    if (entry.fileName.endsWith('/')) {
                        // Directory - create it
                        mkdirp(absoluteEntryPath, { mode: 0o775 }, err => {
                            if (err) {
                                return reject(new NestedError_1.NestedError('Error creating directory for zip directory entry:' + err.code || '', err));
                            }
                            zipFile.readEntry();
                        });
                    }
                    else {
                        // File - extract it
                        zipFile.openReadStream(entry, (err, readStream) => {
                            if (err) {
                                return reject(new NestedError_1.NestedError('Error reading zip stream', err));
                            }
                            mkdirp(path.dirname(absoluteEntryPath), { mode: 0o775 }, err => {
                                if (err) {
                                    return reject(new NestedError_1.NestedError('Error creating directory for zip file entry', err));
                                }
                                // Make sure executable files have correct permissions when extracted
                                let fileMode = binaries && binaries.indexOf(absoluteEntryPath) !== -1
                                    ? 0o755
                                    : 0o664;
                                readStream.pipe(fs.createWriteStream(absoluteEntryPath, { mode: fileMode }));
                                readStream.on('end', () => zipFile.readEntry());
                            });
                        });
                    }
                });
                zipFile.on('end', () => {
                    resolve();
                });
                zipFile.on('error', err => {
                    reject(new NestedError_1.NestedError('Zip File Error:' + err.code || '', err));
                });
            });
        });
    });
}
exports.InstallZip = InstallZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmlwSW5zdGFsbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VNYW5hZ2VyL1ppcEluc3RhbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcseUJBQXlCO0FBQ3pCLGlDQUFpQztBQUNqQyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBRS9CLDhEQUF5RTtBQUN6RSxnREFBNkM7QUFFN0Msb0JBQWlDLE1BQWMsRUFBRSxXQUFtQixFQUFFLHNCQUE4QixFQUFFLFFBQWtCLEVBQUUsV0FBd0I7O1FBQzlJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXJELE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzdELElBQUksR0FBRyxFQUFFO29CQUNMLElBQUksT0FBTyxHQUFHLDRLQUE0SyxDQUFDO29CQUMzTCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFDM0M7Z0JBRUQsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUVwQixPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQWtCLEVBQUUsRUFBRTtvQkFDdkMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFN0UsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDOUIsd0JBQXdCO3dCQUN4QixNQUFNLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7NEJBQzdDLElBQUksR0FBRyxFQUFFO2dDQUNMLE9BQU8sTUFBTSxDQUFDLElBQUkseUJBQVcsQ0FBQyxtREFBbUQsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDOzZCQUM3Rzs0QkFFRCxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ3hCLENBQUMsQ0FBQyxDQUFDO3FCQUNOO3lCQUNJO3dCQUNELG9CQUFvQjt3QkFDcEIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUU7NEJBQzlDLElBQUksR0FBRyxFQUFFO2dDQUNMLE9BQU8sTUFBTSxDQUFDLElBQUkseUJBQVcsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDOzZCQUNuRTs0QkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dDQUMzRCxJQUFJLEdBQUcsRUFBRTtvQ0FDTCxPQUFPLE1BQU0sQ0FBQyxJQUFJLHlCQUFXLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztpQ0FDdEY7Z0NBRUQscUVBQXFFO2dDQUNyRSxJQUFJLFFBQVEsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQ0FDakUsQ0FBQyxDQUFDLEtBQUs7b0NBQ1AsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQ0FFWixVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQzdFLFVBQVUsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzRCQUNwRCxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQztxQkFDTjtnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7b0JBQ25CLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUN0QixNQUFNLENBQUMsSUFBSSx5QkFBVyxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQTNERCxnQ0EyREMifQ==