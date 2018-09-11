'use strict';
const { MailingTask } = require('./mailing-task');

module.exports = (name, options) => {
    let mailingTask = new MailingTask(name, options);
    return mailingTask.run.bind(mailingTask);
};