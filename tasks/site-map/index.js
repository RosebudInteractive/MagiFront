'use strict';
const { SiteMapTask } = require('./site-map-task');

module.exports = (name, options) => {
    let siteMapTask = new SiteMapTask(name, options);
    return siteMapTask.run.bind(siteMapTask);
};