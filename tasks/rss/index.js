'use strict';
const { RssTask } = require('./rss-task');

module.exports = (name, options) => {
    let rssTask = new RssTask(name, options);
    return rssTask.run.bind(rssTask);
};