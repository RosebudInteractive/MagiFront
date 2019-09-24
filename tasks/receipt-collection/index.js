'use strict';
const { ReceiptCollectionTask } = require('./receipt-collection-task');

module.exports = (name, options) => {
    let receiptCollectionTask = new ReceiptCollectionTask(name, options);
    return receiptCollectionTask.run.bind(receiptCollectionTask);
};