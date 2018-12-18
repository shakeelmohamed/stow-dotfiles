"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
function AppendFieldsToObject(reference, obj) {
    // Make sure it is an object type
    if (typeof obj == 'object') {
        for (let referenceKey in reference) {
            // If key exists in original object and is an object. 
            if (obj.hasOwnProperty(referenceKey)) {
                obj[referenceKey] = AppendFieldsToObject(reference[referenceKey], obj[referenceKey]);
            }
            else {
                // Does not exist in current object context
                obj[referenceKey] = reference[referenceKey];
            }
        }
    }
    return obj;
}
// Combines two object's fields, giving the parentDefault a higher precedence. 
function MergeDefaults(parentDefault, childDefault) {
    let newDefault = {};
    for (let attrname in childDefault) {
        newDefault[attrname] = childDefault[attrname];
    }
    for (let attrname in parentDefault) {
        newDefault[attrname] = parentDefault[attrname];
    }
    return newDefault;
}
function UpdateDefaults(object, defaults) {
    if (defaults != null) {
        for (let key in object) {
            if (object[key].hasOwnProperty('type') && object[key].type === 'object' && object[key].properties !== null) {
                object[key].properties = UpdateDefaults(object[key].properties, MergeDefaults(defaults, object[key].default));
            }
            else if (key in defaults) {
                object[key].default = defaults[key];
            }
        }
    }
    return object;
}
function ReplaceReferences(definitions, objects) {
    for (let key in objects) {
        if (objects[key].hasOwnProperty('$ref')) {
            // $ref is formatted as "#/definitions/ObjectName"
            let referenceStringArray = objects[key]['$ref'].split('/');
            // Getting "ObjectName"
            let referenceName = referenceStringArray[referenceStringArray.length - 1];
            // Make sure reference has replaced its own $ref fields and hope there are no recursive references.
            definitions[referenceName] = ReplaceReferences(definitions, definitions[referenceName]);
            // Retrieve ObjectName from definitions. (TODO: Does not retrieve inner objects)
            // Need to deep copy, there are no functions in these objects.
            let reference = JSON.parse(JSON.stringify(definitions[referenceName]));
            objects[key] = AppendFieldsToObject(reference, objects[key]);
            // Remove $ref field
            delete objects[key]['$ref'];
        }
        // Recursively replace references if this object has properties. 
        if (objects[key].hasOwnProperty('type') && objects[key].type === 'object' && objects[key].properties !== null) {
            objects[key].properties = ReplaceReferences(definitions, objects[key].properties);
            objects[key].properties = UpdateDefaults(objects[key].properties, objects[key].default);
        }
    }
    return objects;
}
function mergeReferences(baseDefinitions, additionalDefinitions) {
    for (let key in additionalDefinitions) {
        if (baseDefinitions[key]) {
            throw `Error: '${key}' defined in multiple schema files.`;
        }
        baseDefinitions[key] = additionalDefinitions[key];
    }
}
function GenerateOptionsSchema() {
    let packageJSON = JSON.parse(fs.readFileSync('package.json').toString());
    let schemaJSON = JSON.parse(fs.readFileSync('src/tools/OptionsSchema.json').toString());
    let symbolSettingsJSON = JSON.parse(fs.readFileSync('src/tools/VSSymbolSettings.json').toString());
    mergeReferences(schemaJSON.definitions, symbolSettingsJSON.definitions);
    schemaJSON.definitions = ReplaceReferences(schemaJSON.definitions, schemaJSON.definitions);
    // Hard Code adding in configurationAttributes launch and attach.
    // .NET Core
    packageJSON.contributes.debuggers[0].configurationAttributes.launch = schemaJSON.definitions.LaunchOptions;
    packageJSON.contributes.debuggers[0].configurationAttributes.attach = schemaJSON.definitions.AttachOptions;
    // Full .NET Framework
    packageJSON.contributes.debuggers[1].configurationAttributes.launch = schemaJSON.definitions.LaunchOptions;
    packageJSON.contributes.debuggers[1].configurationAttributes.attach = schemaJSON.definitions.AttachOptions;
    // Make a copy of the options for unit test debugging
    let unitTestDebuggingOptions = JSON.parse(JSON.stringify(schemaJSON.definitions.AttachOptions.properties));
    // Remove the options we don't want
    delete unitTestDebuggingOptions.processName;
    delete unitTestDebuggingOptions.processId;
    delete unitTestDebuggingOptions.pipeTransport;
    // Add the additional options we do want
    unitTestDebuggingOptions["type"] = {
        "type": "string",
        "enum": [
            "coreclr",
            "clr"
        ],
        "description": "Type type of code to debug. Can be either 'coreclr' for .NET Core debugging, or 'clr' for Desktop .NET Framework. 'clr' only works on Windows as the Desktop framework is Windows-only.",
        "default": "coreclr"
    };
    unitTestDebuggingOptions["debugServer"] = {
        "type": "number",
        "description": "For debug extension development only: if a port is specified VS Code tries to connect to a debug adapter running in server mode",
        "default": 4711
    };
    packageJSON.contributes.configuration.properties["csharp.unitTestDebuggingOptions"].properties = unitTestDebuggingOptions;
    let content = JSON.stringify(packageJSON, null, 2);
    if (os.platform() === 'win32') {
        content = content.replace(/\n/gm, "\r\n");
    }
    // We use '\u200b' (unicode zero-length space character) to break VS Code's URL detection regex for URLs that are examples. This process will
    // convert that from the readable espace sequence, to just an invisible character. Convert it back to the visible espace sequence.
    content = content.replace(/\u200b/gm, "\\u200b");
    fs.writeFileSync('package.json', content);
}
exports.GenerateOptionsSchema = GenerateOptionsSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhdGVPcHRpb25zU2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvb2xzL0dlbmVyYXRlT3B0aW9uc1NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLHlCQUF5QjtBQUN6Qix5QkFBeUI7QUFFekIsOEJBQThCLFNBQWMsRUFBRSxHQUFRO0lBRWxELGlDQUFpQztJQUNqQyxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFBRTtRQUN4QixLQUFLLElBQUksWUFBWSxJQUFJLFNBQVMsRUFBRTtZQUNoQyxzREFBc0Q7WUFDdEQsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNsQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQ3hGO2lCQUFNO2dCQUNILDJDQUEyQztnQkFDM0MsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUMvQztTQUNKO0tBQ0o7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRCwrRUFBK0U7QUFDL0UsdUJBQXVCLGFBQWtCLEVBQUUsWUFBaUI7SUFDeEQsSUFBSSxVQUFVLEdBQVEsRUFBRSxDQUFDO0lBRXpCLEtBQUssSUFBSSxRQUFRLElBQUksWUFBWSxFQUFFO1FBQy9CLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDakQ7SUFFRCxLQUFLLElBQUksUUFBUSxJQUFJLGFBQWEsRUFBRTtRQUNoQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2xEO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQztBQUVELHdCQUF3QixNQUFXLEVBQUUsUUFBYTtJQUM5QyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7UUFDbEIsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUU7WUFDcEIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUN4RyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDakg7aUJBQU0sSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFO2dCQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN2QztTQUNKO0tBQ0o7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsMkJBQTJCLFdBQWdCLEVBQUUsT0FBWTtJQUNyRCxLQUFLLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRTtRQUNyQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDckMsa0RBQWtEO1lBQ2xELElBQUksb0JBQW9CLEdBQWEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVyRSx1QkFBdUI7WUFDdkIsSUFBSSxhQUFhLEdBQVcsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWxGLG1HQUFtRztZQUNuRyxXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBRXhGLGdGQUFnRjtZQUNoRiw4REFBOEQ7WUFDOUQsSUFBSSxTQUFTLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU3RCxvQkFBb0I7WUFDcEIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0I7UUFFRCxpRUFBaUU7UUFDakUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQzNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzRjtLQUNKO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQUVELHlCQUF5QixlQUFvQixFQUFFLHFCQUEwQjtJQUNyRSxLQUFLLElBQUksR0FBRyxJQUFJLHFCQUFxQixFQUFFO1FBQ25DLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sV0FBVyxHQUFHLHFDQUFxQyxDQUFDO1NBQzdEO1FBQ0QsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3JEO0FBQ0wsQ0FBQztBQUVEO0lBQ0ksSUFBSSxXQUFXLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDOUUsSUFBSSxVQUFVLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLDhCQUE4QixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RixJQUFJLGtCQUFrQixHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDeEcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFeEUsVUFBVSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUzRixpRUFBaUU7SUFDakUsWUFBWTtJQUNaLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztJQUMzRyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFFM0csc0JBQXNCO0lBQ3RCLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztJQUMzRyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFFM0cscURBQXFEO0lBQ3JELElBQUksd0JBQXdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDM0csbUNBQW1DO0lBQ25DLE9BQU8sd0JBQXdCLENBQUMsV0FBVyxDQUFDO0lBQzVDLE9BQU8sd0JBQXdCLENBQUMsU0FBUyxDQUFDO0lBQzFDLE9BQU8sd0JBQXdCLENBQUMsYUFBYSxDQUFDO0lBQzlDLHdDQUF3QztJQUN4Qyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsR0FBRztRQUMvQixNQUFNLEVBQUUsUUFBUTtRQUNoQixNQUFNLEVBQUU7WUFDSixTQUFTO1lBQ1QsS0FBSztTQUNSO1FBQ0QsYUFBYSxFQUFFLHlMQUF5TDtRQUN4TSxTQUFTLEVBQUUsU0FBUztLQUN2QixDQUFDO0lBQ0Ysd0JBQXdCLENBQUMsYUFBYSxDQUFDLEdBQUc7UUFDdEMsTUFBTSxFQUFFLFFBQVE7UUFDaEIsYUFBYSxFQUFFLGlJQUFpSTtRQUNoSixTQUFTLEVBQUUsSUFBSTtLQUNsQixDQUFDO0lBQ0YsV0FBVyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxDQUFDLENBQUMsVUFBVSxHQUFHLHdCQUF3QixDQUFDO0lBRTFILElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuRCxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7UUFDM0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzdDO0lBRUQsNklBQTZJO0lBQzdJLGtJQUFrSTtJQUNsSSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFakQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQWxERCxzREFrREMifQ==