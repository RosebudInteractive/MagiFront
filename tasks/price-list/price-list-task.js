'use strict';
const _ = require('lodash');
const { Task } = require('../lib/task');
const { CoursesService } = require('../../database/db-course');

const dfltSettings = {
};

exports.PriceListTask = class PriceListTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._settings = _.defaultsDeep(opts, dfltSettings);
    }

    async _fbPriceList(options) {
        let opts = options || {};
        return CoursesService().createFbPriceList(opts);
    }

    async run(fireDate) {
        let keys = Object.keys(this._settings);
        for (let i = 0; i < keys.length; i++){
            switch (keys[i]) {
                case "fb":
                    await this._fbPriceList(this._settings[keys[i]]);
                    break;
                default:
                    throw new Error(`Unknown price list type: "${keys[i]}".`);
            }
        }
    }
};
