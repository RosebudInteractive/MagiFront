'use strict';
const { NotificationTask } = require('./notification-task');

module.exports = (name, options) => {
    let notificationTask = new NotificationTask(name, options);
    return notificationTask.run.bind(notificationTask);
};