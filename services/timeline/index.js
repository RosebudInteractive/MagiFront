const _ = require('lodash');
const config = require('config');
const { TimelineService } = require('./timeline-api');
const { getTimeStr, buildLogString } = require('../../utils');

function setupTimelines(app) {

    const pmEnabled = config.has("server.pmEnabled") && (config.server.pmEnabled === true) ? true : false;

    if (!global.$Services)
        global.$Services = {};
    global.$Services.timelines = TimelineService;

    if (app) {

        if (pmEnabled) {
            app.get(`/api/pm/timeline-list`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().getTimelineList(opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.get(`/api/pm/timeline/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().getTimeline(parseInt(req.params.id), opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.post(`/api/pm/timeline`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().newTimeline(req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.put(`/api/pm/timeline/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().updateTimeline(parseInt(req.params.id), req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });
        }
    }
}

exports.setupTimelines = setupTimelines;