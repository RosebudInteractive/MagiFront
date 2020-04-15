'use strict';
const { PriceListTask } = require('./price-list-task');

module.exports = (name, options) => {
    let priceListTask = new PriceListTask(name, options);
    return priceListTask.run.bind(priceListTask);
};