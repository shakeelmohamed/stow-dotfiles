"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const prioritization = require("./prioritization");
const loggingEvents_1 = require("./loggingEvents");
/**
 * This data structure manages a queue of requests that have been made and requests that have been
 * sent to the OmniSharp server and are waiting on a response.
 */
class RequestQueue {
    constructor(_name, _maxSize, eventStream, _makeRequest) {
        this._name = _name;
        this._maxSize = _maxSize;
        this.eventStream = eventStream;
        this._makeRequest = _makeRequest;
        this._pending = [];
        this._waiting = new Map();
    }
    /**
     * Enqueue a new request.
     */
    enqueue(request) {
        this.eventStream.post(new loggingEvents_1.OmnisharpServerEnqueueRequest(this._name, request.command));
        this._pending.push(request);
    }
    /**
     * Dequeue a request that has completed.
     */
    dequeue(id) {
        const request = this._waiting.get(id);
        if (request) {
            this._waiting.delete(id);
            this.eventStream.post(new loggingEvents_1.OmnisharpServerDequeueRequest(this._name, request.command, id));
        }
        return request;
    }
    cancelRequest(request) {
        let index = this._pending.indexOf(request);
        if (index !== -1) {
            this._pending.splice(index, 1);
            // Note: This calls reject() on the promise returned by OmniSharpServer.makeRequest
            request.onError(new Error(`Pending request cancelled: ${request.command}`));
        }
        // TODO: Handle cancellation of a request already waiting on the OmniSharp server.
    }
    /**
     * Returns true if there are any requests pending to be sent to the OmniSharp server.
     */
    hasPending() {
        return this._pending.length > 0;
    }
    /**
     * Returns true if the maximum number of requests waiting on the OmniSharp server has been reached.
     */
    isFull() {
        return this._waiting.size >= this._maxSize;
    }
    /**
     * Process any pending requests and send them to the OmniSharp server.
     */
    processPending() {
        if (this._pending.length === 0) {
            return;
        }
        this.eventStream.post(new loggingEvents_1.OmnisharpServerProcessRequestStart(this._name));
        const slots = this._maxSize - this._waiting.size;
        for (let i = 0; i < slots && this._pending.length > 0; i++) {
            const item = this._pending.shift();
            item.startTime = Date.now();
            const id = this._makeRequest(item);
            this._waiting.set(id, item);
            if (this.isFull()) {
                break;
            }
        }
        this.eventStream.post(new loggingEvents_1.OmnisharpServerProcessRequestComplete());
    }
}
class RequestQueueCollection {
    constructor(eventStream, concurrency, makeRequest) {
        this._priorityQueue = new RequestQueue('Priority', 1, eventStream, makeRequest);
        this._normalQueue = new RequestQueue('Normal', concurrency, eventStream, makeRequest);
        this._deferredQueue = new RequestQueue('Deferred', Math.max(Math.floor(concurrency / 4), 2), eventStream, makeRequest);
    }
    getQueue(command) {
        if (prioritization.isPriorityCommand(command)) {
            return this._priorityQueue;
        }
        else if (prioritization.isNormalCommand(command)) {
            return this._normalQueue;
        }
        else {
            return this._deferredQueue;
        }
    }
    isEmpty() {
        return !this._deferredQueue.hasPending()
            && !this._normalQueue.hasPending()
            && !this._priorityQueue.hasPending();
    }
    enqueue(request) {
        const queue = this.getQueue(request.command);
        queue.enqueue(request);
        this.drain();
    }
    dequeue(command, seq) {
        const queue = this.getQueue(command);
        return queue.dequeue(seq);
    }
    cancelRequest(request) {
        const queue = this.getQueue(request.command);
        queue.cancelRequest(request);
    }
    drain() {
        if (this._isProcessing) {
            return false;
        }
        if (this._priorityQueue.isFull()) {
            return false;
        }
        if (this._normalQueue.isFull() && this._deferredQueue.isFull()) {
            return false;
        }
        this._isProcessing = true;
        if (this._priorityQueue.hasPending()) {
            this._priorityQueue.processPending();
            this._isProcessing = false;
            return;
        }
        if (this._normalQueue.hasPending()) {
            this._normalQueue.processPending();
        }
        if (this._deferredQueue.hasPending()) {
            this._deferredQueue.processPending();
        }
        this._isProcessing = false;
    }
}
exports.RequestQueueCollection = RequestQueueCollection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9yZXF1ZXN0UXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyxtREFBbUQ7QUFDbkQsbURBQTBLO0FBWTFLOzs7R0FHRztBQUNIO0lBSUksWUFDWSxLQUFhLEVBQ2IsUUFBZ0IsRUFDaEIsV0FBd0IsRUFDeEIsWUFBMEM7UUFIMUMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDaEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsaUJBQVksR0FBWixZQUFZLENBQThCO1FBUDlDLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFDekIsYUFBUSxHQUF5QixJQUFJLEdBQUcsRUFBbUIsQ0FBQztJQU9wRSxDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQUMsT0FBZ0I7UUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSw2Q0FBNkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBQyxFQUFVO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXRDLElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSw2Q0FBNkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztT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