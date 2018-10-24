'use strict';
const { AutoSubsTask } = require('./auto-subs-task');

module.exports = (name, options) => {
    let autoSubsTask = new AutoSubsTask(name, options);
    return autoSubsTask.run.bind(autoSubsTask);
};