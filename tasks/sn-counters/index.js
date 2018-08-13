'use strict';
const { SnCounterTask } = require('./sn-counter-task');

module.exports = (name, options) => {
    let snCounterTask = new SnCounterTask(name, options);
    return snCounterTask.run.bind(snCounterTask);
};