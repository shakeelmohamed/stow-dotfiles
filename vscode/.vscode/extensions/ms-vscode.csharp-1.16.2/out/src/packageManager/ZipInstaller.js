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
                    let absoluteEntryPath = path.resolve(destinationInstallPath.value, entry.fileName);
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
                                let binaryPaths = binaries && binaries.map(binary => binary.value);
                                // Make sure executable files have correct permissions when extracted
                                let fileMode = binaryPaths && binaryPaths.indexOf(absoluteEntryPath) !== -1
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmlwSW5zdGFsbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VNYW5hZ2VyL1ppcEluc3RhbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcseUJBQXlCO0FBQ3pCLGlDQUFpQztBQUNqQyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBRS9CLDhEQUF5RTtBQUN6RSxnREFBNkM7QUFHN0Msb0JBQWlDLE1BQWMsRUFBRSxXQUFtQixFQUFFLHNCQUFvQyxFQUFFLFFBQXdCLEVBQUUsV0FBd0I7O1FBQzFKLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQ0FBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXJELE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzdELElBQUksR0FBRyxFQUFFO29CQUNMLElBQUksT0FBTyxHQUFHLDRLQUE0SyxDQUFDO29CQUMzTCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFDM0M7Z0JBRUQsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUVwQixPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQWtCLEVBQUUsRUFBRTtvQkFDdkMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRW5GLElBQUksS0FBSyxDQUFD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