'use strict';
const { URL, URLSearchParams } = require('url');

exports.Task = class Task {
    get name() { return this._name; }

    constructor(name, options) {
        this._name = name;
    }

    _href(rawUrl) {
        let url = new URL(rawUrl);
        return url.href;
    }

    run(fireDate) {
        Promise.reject(new Error("Task::run: Should be implemented in descendand!"));
    }
};