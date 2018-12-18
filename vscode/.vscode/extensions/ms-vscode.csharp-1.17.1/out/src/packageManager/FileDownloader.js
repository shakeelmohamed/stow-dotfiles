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
const https = require("https");
const util = require("../common");
const loggingEvents_1 = require("../omnisharp/loggingEvents");
const NestedError_1 = require("../NestedError");
const url_1 = require("url");
const proxy_1 = require("./proxy");
function DownloadFile(description, eventStream, networkSettingsProvider, url, fallbackUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        eventStream.post(new loggingEvents_1.DownloadStart(description));
        try {
            let buffer = yield downloadFile(description, url, eventStream, networkSettingsProvider);
            eventStream.post(new loggingEvents_1.DownloadSuccess(` Done!`));
            return buffer;
        }
        catch (primaryUrlError) {
            // If the package has a fallback Url, and downloading from the primary Url failed, try again from 
            // the fallback. This is used for debugger packages as some users have had issues downloading from
            // the CDN link
            if (fallbackUrl) {
                eventStream.post(new loggingEvents_1.DownloadFallBack(fallbackUrl));
                try {
                    let buffer = yield downloadFile(description, fallbackUrl, eventStream, networkSettingsProvider);
                    eventStream.post(new loggingEvents_1.DownloadSuccess(' Done!'));
                    return buffer;
                }
                catch (fallbackUrlError) {
                    throw primaryUrlError;
                }
            }
            else {
                throw primaryUrlError;
            }
        }
    });
}
exports.DownloadFile = DownloadFile;
function downloadFile(description, urlString, eventStream, networkSettingsProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = url_1.parse(urlString);
        const networkSettings = networkSettingsProvider();
        const proxy = networkSettings.proxy;
        const strictSSL = networkSettings.strictSSL;
        const options = {
            host: url.hostname,
            path: url.path,
            agent: proxy_1.getProxyAgent(url, proxy, strictSSL),
            port: url.port,
            rejectUnauthorized: util.isBoolean(strictSSL) ? strictSSL : true
        };
        let buffers = [];
        return new Promise((resolve, reject) => {
            let request = https.request(options, response => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    // Redirect - download from new location
                    return resolve(downloadFile(description, response.headers.location, eventStream, networkSettingsProvider));
                }
                else if (response.statusCode != 200) {
                    // Download failed - print error message
                    eventStream.post(new loggingEvents_1.DownloadFailure(`Failed to download from ${urlString}. Error code '${response.statusCode}')`));
                    return reject(new NestedError_1.NestedError(response.statusCode.toString()));
                }
                // Downloading - hook up events
                let packageSize = parseInt(response.headers['content-length'], 10);
                let downloadedBytes = 0;
                let downloadPercentage = 0;
                eventStream.post(new loggingEvents_1.DownloadSizeObtained(packageSize));
                response.on('data', data => {
                    downloadedBytes += data.length;
                    buffers.push(data);
                    // Update status bar item with percentage
                    let newPercentage = Math.ceil(100 * (downloadedBytes / packageSize));
                    if (newPercentage !== downloadPercentage) {
                        downloadPercentage = newPercentage;
                        eventStream.post(new loggingEvents_1.DownloadProgress(downloadPercentage, description));
                    }
                });
                response.on('end', () => {
                    resolve(Buffer.concat(buffers));
                });
                response.on('error', err => {
                    reject(new NestedError_1.NestedError(`Failed to download from ${urlString}. Error Message: ${err.message} || 'NONE'}`, err));
                });
            });
            request.on('error', err => {
                reject(new NestedError_1.NestedError(`Request error: ${err.message || 'NONE'}`, err));
            });
            // Execute the request
            request.end();
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZURvd25sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGFja2FnZU1hbmFnZXIvRmlsZURvd25sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLCtCQUErQjtBQUMvQixrQ0FBa0M7QUFFbEMsOERBQXVKO0FBQ3ZKLGdEQUE2QztBQUM3Qyw2QkFBd0M7QUFDeEMsbUNBQXdDO0FBR3hDLHNCQUFtQyxXQUFtQixFQUFFLFdBQXdCLEVBQUUsdUJBQWdELEVBQUUsR0FBVyxFQUFFLFdBQW9COztRQUNqSyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRWpELElBQUk7WUFDQSxJQUFJLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3hGLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDaEQsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFDRCxPQUFPLGVBQWUsRUFBRTtZQUNwQixrR0FBa0c7WUFDbEcsa0dBQWtHO1lBQ2xHLGVBQWU7WUFDZixJQUFJLFdBQVcsRUFBRTtnQkFDYixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsSUFBSTtvQkFDQSxJQUFJLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO29CQUNoRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksK0JBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxPQUFPLE1BQU0sQ0FBQztpQkFDakI7Z0JBQ0QsT0FBTyxnQkFBZ0IsRUFBRTtv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