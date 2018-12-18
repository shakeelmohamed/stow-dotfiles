/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const httpRequest_1 = require("./utils/httpRequest");
function tagsForImage(image) {
    let tags = [];
    if (image.is_automated) {
        tags.push('Automated');
    }
    else if (image.is_trusted) {
        tags.push('Trusted');
    }
    else if (image.is_official) {
        tags.push('Official');
    }
    if (tags.length > 0) {
        return '[' + tags.join('] [') + ']';
    }
    return '';
}
exports.tagsForImage = tagsForImage;
// tslint:disable-next-line:promise-function-async // Grandfathered in
function searchImageInRegistryHub(imageName, cache) {
    return invokeHubSearch(imageName, 1, cache).then((data) => {
        if (data.results.length === 0) {
            return undefined;
        }
        return data.results[0];
    });
}
exports.searchImageInRegistryHub = searchImageInRegistryHub;
let popular = [
    { "is_automated": false, "name": "redis", "is_trusted": false, "is_official": true, "star_count": 1300, "description": "Redis is an open source key-value store that functions as a data structure server." },
    { "is_automated": false, "name": "ubuntu", "is_trusted": false, "is_official": true, "star_count": 2600, "description": "Ubuntu is a Debian-based Linux operating system based on free software." },
    { "is_automated": false, "name": "wordpress", "is_trusted": false, "is_official": true, "star_count": 582, "description": "The WordPress rich content management system can utilize plugins, widgets, and themes." },
    { "is_automated": false, "name": "mysql", "is_trusted": false, "is_official": true, "star_count": 1300, "description": "MySQL is a widely used, open-source relational database management system (RDBMS)." },
    { "is_automated": false, "name": "mongo", "is_trusted": false, "is_official": true, "star_count": 1100, "description": "MongoDB document databases provide high availability and easy scalability." },
    { "is_automated": false, "name": "centos", "is_trusted": false, "is_official": true, "star_count": 1600, "description": "The official build of CentOS." },
    { "is_automated": false, "name": "node", "is_trusted": false, "is_official": true, "star_count": 1200, "description": "Node.js is a JavaScript-based platform for server-side and networking applications." },
    { "is_automated": false, "name": "nginx", "is_trusted": false, "is_official": true, "star_count": 1600, "description": "Official build of Nginx." },
    { "is_automated": false, "name": "postgres", "is_trusted": false, "is_official": true, "star_count": 1200, "description": "The PostgreSQL object-relational database system provides reliability and data integrity." },
    { "is_automated": true, "name": "microsoft/aspnet", "is_trusted": true, "is_official": false, "star_count": 277, "description": "ASP.NET is an open source server-side Web application framework" }
];
// tslint:disable-next-line:promise-function-async // Grandfathered in
function searchImagesInRegistryHub(prefix, cache) {
    if (prefix.length === 0) {
        // return the popular images if user invoked intellisense
        // right after typing the keyword and ':' (e.g. 'image:').
        return Promise.resolve(popular.slice(0));
    }
    // Do an image search on Docker hub and return the results
    return invokeHubSearch(prefix, 100, cache).then((data) => {
        return data.results;
    });
}
exports.searchImagesInRegistryHub = searchImagesInRegistryHub;
// https://registry.hub.docker.com/v1/search?q=redis&n=1
// {
//     "num_pages": 10,
//     "num_results": 10,
//     "results": [
//         {
//             "is_automated": false,
//             "name": "redis",
//             "is_trusted": false,
//             "is_official": true,
//             "star_count": 830,
//             "description": "Redis is an open source key-value store that functions as a data structure server."
//         }
//     ],
//     "page_size": 1,
//     "query": "redis",
//     "page": 1
// }
// tslint:disable-next-line:promise-function-async // Grandfathered in
function invokeHubSearch(imageName, count, cache) {
    // https://registry.hub.docker.com/v1/search?q=redis&n=1
    return fetchHttpsJson({
        hostname: 'registry.hub.docker.com',
        port: 443,
        path: '/v1/search?q=' + encodeURIComponent(imageName) + '&n=' + count,
        method: 'GET',
    }, cache);
}
// tslint:disable-next-line:no-any
let JSON_CACHE = {};
// tslint:disable-next-line:promise-function-async // Grandfathered in
function fetchHttpsJson(opts, cache) {
    if (!cache) {
        return doFetchHttpsJson(opts);
    }
    let cache_key = (opts.method + ' ' + opts.hostname + ' ' + opts.path);
    if (!JSON_CACHE[cache_key]) {
        JSON_CACHE[cache_key] = doFetchHttpsJson(opts);
    }
    // new promise to avoid cancelling
    return new Promise((resolve, reject) => {
        JSON_CACHE[cache_key].then(resolve, reject);
    });
}
// tslint:disable-next-line:promise-function-async // Grandfathered in
function doFetchHttpsJson(opts) {
    opts.headers = opts.headers || {};
    opts.headers.Accept = 'application/json';
    return httpRequest_1.httpsRequest(opts).then((data) => {
        return JSON.parse(data);
    });
}
//# sourceMappingURL=dockerHubSearch.js.map