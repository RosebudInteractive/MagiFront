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

            app.get(`/api/pm/period-list`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().getPeriodList(opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.get(`/api/pm/period/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().getPeriod(parseInt(req.params.id), opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.post(`/api/pm/period`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().newPeriod(req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.put(`/api/pm/period/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().updatePeriod(parseInt(req.params.id), req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.delete(`/api/pm/period/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().deletePeriod(parseInt(req.params.id), req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

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

            app.get(`/api/pm/event/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().getEvent(parseInt(req.params.id), opts);
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

            app.put(`/api/pm/event/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().updateEvent(parseInt(req.params.id), req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.delete(`/api/pm/event/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await EventService().deleteEvent(parseInt(req.params.id), req.body, opts);
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