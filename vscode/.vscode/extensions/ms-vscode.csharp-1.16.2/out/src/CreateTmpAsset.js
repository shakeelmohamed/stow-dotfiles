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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const tmp = require("tmp");
const async_file_1 = require("async-file");
const NestedError_1 = require("./NestedError");
function CreateTmpFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpFile = yield new Promise((resolve, reject) => {
            tmp.file({ prefix: 'package-' }, (err, path, fd, cleanupCallback) => {
                if (err) {
                    return reject(new NestedError_1.NestedError('Error from tmp.file', err));
                }
                if (fd == 0) {
                    return reject(new NestedError_1.NestedError("Temporary package file unavailable"));
                }
                resolve({ name: path, fd: fd, removeCallback: cleanupCallback });
            });
        });
        return {
            fd: tmpFile.fd,
            name: tmpFile.name,
            dispose: tmpFile.removeCallback
        };
    });
}
exports.CreateTmpFile = CreateTmpFile;
function CreateTmpDir(unsafeCleanup) {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpDir = yield new Promise((resolve, reject) => {
            tmp.dir({ unsafeCleanup }, (err, path, cleanupCallback) => {
                if (err) {
                    return reject(new NestedError_1.NestedError('Error from tmp.dir', err));
                }
                resolve({ name: path, removeCallback: cleanupCallback });
            });
        });
        return {
            fd: tmpDir.fd,
            name: tmpDir.name,
            dispose: () => {
                if (unsafeCleanup) {
                    async_file_1.rimraf(tmpDir.name); //to delete directories that have folders inside them
                }
                else {
                    tmpDir.removeCallback();
                }
            }
        };
    });
}
exports.CreateTmpDir = CreateTmpDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlVG1wQXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQ3JlYXRlVG1wQXNzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7Z0dBR2dHO0FBQ2hHLDJCQUEyQjtBQUMzQiwyQ0FBb0M7QUFDcEMsK0NBQTRDO0FBRTVDOztRQUNJLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQXlCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxlQUFlLEVBQUUsRUFBRTtnQkFDaEUsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsT0FBTyxNQUFNLENBQUMsSUFBSSx5QkFBVyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzlEO2dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDVCxPQUFPLE1BQU0sQ0FBQyxJQUFJLHlCQUFXLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO2lCQUN4RTtnQkFFRCxPQUFPLENBQXlCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0gsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ2QsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLE9BQU8sRUFBRSxPQUFPLENBQUMsY0FBYztTQUNsQyxDQUFDO0lBQ04sQ0FBQztDQUFBO0FBbkJELHNDQW1CQztBQUVELHNCQUFtQyxhQUFzQjs7UUFDckQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBeUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBRTtnQkFDdEQsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsT0FBTyxNQUFNLENBQUMsSUFBSSx5QkFBVyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzdEO2dCQUVELE9BQU8sQ0FBeUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0gsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ2IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxhQUFhLEVBQUU7b0JBQ2YsbUJBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQSxxREFBcUQ7aUJBQzVFO3FCQUNJO29CQUNELE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztpQkFDM0I7WUFDTCxDQUFDO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FBQTtBQXZCRCxvQ0F1QkMifQ==