"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Delayer {
    constructor(defaultDelay) {
        this.defaultDelay = defaultDelay;
        this.timeout = null;
        this.completionPromise = null;
        this.onSuccess = null;
        this.task = null;
    }
    trigger(task, delay = this.defaultDelay) {
        this.task = task;
        this.cancelTimeout();
        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve) => {
                this.onSuccess = resolve;
            }).then(() => {
                this.completionPromise = null;
                this.onSuccess = null;
                var result = this.task();
                this.task = null;
                return result;
            });
        }
        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve) => {
                this.onSuccess = resolve;
            }).then(() => {
                this.completionPromise = null;
                this.onSuccess = null;
                const task = this.task;
                this.task = null;
                return task();
            });
        }
        this.timeout = setTimeout(() => {
            this.timeout = null;
            this.onSuccess(null);
        }, delay);
        return this.completionPromise;
    }
    isTriggered() {
        return this.timeout !== null;
    }
    cancel() {
        this.cancelTimeout();
        this.completionPromise = null;
    }
    cancelTimeout() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}
exports.Delayer = Delayer;
//# sourceMappingURL=delayer.js.map