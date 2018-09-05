'use strict';
const { URL, URLSearchParams } = require('url');

exports.Task = class Task {
    get name() { return this._name; }

    constructor(name, options) {
        this._name = name;
        this._dfltDelay = 0;
    }

    _setDfltDelay(d) {
        this._dfltDelay = d;
    }

    _delay(dt) {
        let delay = dt ? (dt > 0 ? dt : 0) : this._dfltDelay;
        let rc = Promise.resolve();
        if (delay) {
            rc = rc.then(() => {
                return new Promise((resolve) => {
                    setTimeout(() => { resolve() }, delay);
                })
            })
        }
        return rc;
    }

    _href(rawUrl) {
        let url = new URL(rawUrl);
        return url.href;
    }

    _urlObj(rawUrl) {
        return new URL(rawUrl);
    }

    run(fireDate) {
        Promise.reject(new Error("Task::run: Should be implemented in descendand!"));
    }
};