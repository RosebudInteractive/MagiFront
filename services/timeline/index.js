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

        app.get(`/api/timelines/course/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ CourseId: req.params.id, State: [2], SortOrder: "Order", isDetailed: true, allow_unauth: true }, req.query);
                let rows = await TimelineService().getTimelineList(opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`/api/timelines/lesson/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ LessonId: req.params.id, State: [2],SortOrder: "Order", isDetailed: true, allow_unauth: true }, req.query);
                let rows = await TimelineService().getTimelineList(opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`/api/timelines/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ Id: req.params.id, isDetailed: true, allow_unauth: true }, req.query);
                let rows = await TimelineService().getTimelineList(opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

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

            app.put(`/api/pm/timeline/add-item/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().addItem(parseInt(req.params.id), req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.put(`/api/pm/timeline/delete-item/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().deleteItem(parseInt(req.params.id), req.body, opts);
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

            app.delete(`/api/pm/timeline/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await TimelineService().deleteTimeline(parseInt(req.params.id), opts);
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