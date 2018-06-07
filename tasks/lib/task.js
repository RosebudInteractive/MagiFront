'use strict';
exports.Task = class Task {
    get name() { return this._name; }

    constructor(name, options) {
        this._name = name;
    }

    run(fireDate) {
        Promise.reject(new Error("Task::run: Should be implemented in descendand!"));
    }
};