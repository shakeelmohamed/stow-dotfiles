"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/*Custom asyncpool
 * Author: Esteban Rey L
 * To limit the number of asynchonous calls being done, this is helpful to limit
 * Connection requests and avoid throttling.
 */
class AsyncPool {
    constructor(asyncLimit) {
        this.asyncLimit = asyncLimit;
        this.runnableQueue = [];
        this.workers = [];
    }
    /*Runs all functions in runnableQueue by launching asyncLimit worker instances
      each of which calls an async task extracted from runnableQueue. This will
      wait for all scheduled tasks to be completed.*/
    async runAll() {
        for (let i = 0; i < this.asyncLimit; i++) {
            this.workers.push(this.worker());
        }
        try {
            await Promise.all(this.workers);
        }
        catch (error) {
            throw error;
        }
    }
    /*Takes in an async Thunk to be executed by the asyncpool*/
    addTask(func) {
        this.runnableQueue.push(func);
    }
    /*Executes each passed in async function blocking while each function is run.
      Moves on to the next available thunk on completion of the previous thunk.*/
    async worker() {
        while (this.runnableQueue.length > 0) {
            let func = this.runnableQueue.pop();
            //Avoids possible race condition
            if (func) {
                await func();
            }
        }
    }
}
exports.AsyncPool = AsyncPool;
//# sourceMappingURL=asyncpool.js.map