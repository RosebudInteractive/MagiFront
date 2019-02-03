'use strict';
const { LsnHistTask } = require('./lsn-hist-task');

module.exports = (name, options) => {
    let lsnHistTask = new LsnHistTask(name, options);
    return lsnHistTask.run.bind(lsnHistTask);
};