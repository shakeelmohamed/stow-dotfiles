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
const serverUtils = require("../omnisharp/utils");
const vscode_1 = require("vscode");
const typeConversion_1 = require("../omnisharp/typeConversion");
const abstractProvider_1 = require("./abstractProvider");
class CSharpDefinitionProvider extends abstractProvider_1.default {
    constructor(server, definitionMetadataDocumentProvider) {
        super(server);
        this._definitionMetadataDocumentProvider = definitionMetadataDocumentProvider;
    }
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let req = typeConversion_1.createRequest(document, position);
            req.WantMetadata = true;
            return serverUtils.goToDefinition(this._server, req, token).then(gotoDefinitionResponse => {
                // the defintion is in source
                if (gotoDefinitionResponse && gotoDefinitionResponse.FileName) {
                    // if it is part of an already used metadata file, retrieve its uri instead of going to the physical file
                    if (gotoDefinitionResponse.FileName.startsWith("$metadata$")) {
                        const uri = this._definitionMetadataDocumentProvider.getExistingMetadataResponseUri(gotoDefinitionResponse.FileName);
                        return typeConversion_1.toLocationFromUri(uri, gotoDefinitionResponse);
                    }
                    // if it is a normal source definition, convert the response to a location
                    return typeConversion_1.toLocation(gotoDefinitionResponse);
                    // the definition is in metadata
                }
                else if (gotoDefinitionResponse.MetadataSource) {
                    const metadataSource = gotoDefinitionResponse.MetadataSource;
                    // go to metadata endpoint for more information
                    return serverUtils.getMetadata(this._server, {
                        Timeout: 5000,
                        AssemblyName: metadataSource.AssemblyName,
                        VersionNumber: metadataSource.VersionNumber,
                        ProjectName: metadataSource.ProjectName,
                        Language: metadataSource.Language,
                        TypeName: metadataSource.TypeName
                    }).then(metadataResponse => {
                        if (!metadataResponse || !metadataResponse.Source || !metadataResponse.SourceName) {
                            return;
                        }
                        const uri = this._definitionMetadataDocumentProvider.addMetadataResponse(metadataResponse);
                        return new vscode_1.Location(uri, new vscode_1.Position(gotoDefinitionResponse.Line - 1, gotoDefinitionResponse.Column - 1));
                    });
                }
            });
        });
    }
}
exports.default = CSharpDefinitionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL2RlZmluaXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsa0RBQWtEO0FBQ2xELG1DQUFvRztBQUVwRyxnRUFBeUY7QUFDekYseURBQWlEO0FBSWpELDhCQUE4QyxTQUFRLDBCQUFlO0lBR2pFLFlBQVksTUFBdUIsRUFBRSxrQ0FBc0U7UUFDdkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWQsSUFBSSxDQUFDLG1DQUFtQyxHQUFHLGtDQUFrQyxDQUFDO0lBQ2xGLENBQUM7SUFFWSxpQkFBaUIsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7O1lBRS9GLElBQUksR0FBRyxHQUEwQiw4QkFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRSxHQUFHLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUV4QixPQUFPLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7Z0JBRXRGLDZCQUE2QjtnQkFDN0IsSUFBSSxzQkFBc0IsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLEVBQUU7b0JBRTNELHlHQUF5RztvQkFDekcsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO3dCQUMxRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUNBQW1DLENBQUMsOEJBQThCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3JILE9BQU8sa0NBQWlCLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7cUJBQ3pEO29CQUVELDBFQUEwRTtvQkFDMUUsT0FBTywyQkFBVSxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBRTlDLGdDQUFnQztpQkFDL0I7cUJBQU0sSUFBSSxzQkFBc0IsQ0FBQyxjQUFjLEVBQUU7b0JBQzlDLE1BQU0sY0FBYyxHQUFtQixzQkFBc0IsQ0FBQyxjQUFjLENBQUM7b0JBRTdFLCtDQUErQztvQkFDL0MsT0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQW9CO3dCQUMzRCxPQUFPLEVBQUUsSUFBSTt3QkFDYixZQUFZLEVBQUUsY0FBYyxDQUFDLFlBQVk7d0JBQ3pDLGFBQWEsRUFBRSxjQUFjLENBQUMsYUFBYTt3QkFDM0MsV0FBVyxFQUFFLGNBQWMsQ0FBQyxXQUFXO3dCQUN2QyxRQUFRLEVBQUUsY0FBYyxDQUFDLFFBQVE7d0JBQ2pDLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUTtxQkFDcEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO3dCQUN2QixJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7NEJBQy9FLE9BQU87eUJBQ1Y7d0JBRUQsTUFBTSxHQUFHLEdBQVEsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ2hHLE9BQU8sSUFBSSxpQkFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFRLENBQUMsc0JBQXNCLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0csQ0FBQyxDQUFDLENBQUM7aUJBQ047WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtDQUNKO0FBbkRELDJDQW1EQyJ9