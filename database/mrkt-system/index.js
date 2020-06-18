'use strict';
const config = require('config');
const _ = require('lodash');
const { CarrotQuestService } = require('./carrot-quest');

module.exports = {
    sendEvent: async (event, options) => {
        try {
            let result = {};
            if (config.has("mrktSystem.carrotquest.enabled") && config.get("mrktSystem.carrotquest.enabled"))
                result.carrotquest = await CarrotQuestService().sendEvent(event, options);
            return result;
        }
        catch (err) {
            return { succeeded: false, error: err };
        }
    }
}