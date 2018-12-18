"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class DockerDebugSessionManager {
    constructor(debugSessionTerminated, dockerManager) {
        this.debugSessionTerminated = debugSessionTerminated;
        this.dockerManager = dockerManager;
    }
    dispose() {
        this.stopListening();
    }
    startListening() {
        if (this.eventSubscription === undefined) {
            this.eventSubscription = this.debugSessionTerminated(() => {
                this.dockerManager
                    .cleanupAfterLaunch()
                    .catch(reason => console.log(`Unable to clean up Docker images after launch: ${reason}`));
                this.stopListening();
            });
        }
    }
    stopListening() {
        if (this.eventSubscription) {
            this.eventSubscription.dispose();
            this.eventSubscription = undefined;
        }
    }
}
exports.DockerDebugSessionManager = DockerDebugSessionManager;
//# sourceMappingURL=debugSessionManager.js.map