const _ = require('lodash');
const config = require('config');
const { EventService } = require('./event-api');
const { getTimeStr, buildLogString } = require('../../utils');

function setupEvents(app) {

    const pmEnabled = config.has("server.pmEnabled") && (config.server.pmEnabled === true) ? true : false;

    if (!global.$Services)
        global.$Services = {};
    global.$Services.events = EventService;

    if (app) {

        if (pmEnabled) {
            app.get(`/api/pm/event-list`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().getEventList(opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.post(`/api/pm/event`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().newEvent(req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });
        }
    }
}

exports.setupEvents = setupEvents;