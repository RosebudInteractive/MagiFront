'use strict';
const { PrerenderTask } = require('./prerender-task');

module.exports = (name, options) => {
    let prerenderTask = new PrerenderTask(name, options);
    return prerenderTask.run.bind(prerenderTask);
};
