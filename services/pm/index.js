const _ = require('lodash');
const config = require('config');
const { ProcessService } = require('./process-api');

const ROUTE_PREFIX = "/api/pm/";

function setupProcesses(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.processes = ProcessService;

    if (app) {

        app.get(`${ROUTE_PREFIX}process-list`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getProcessList(opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}task-list`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getTaskList(opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}process-elem/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getProcessElem(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.put(`${ROUTE_PREFIX}process-elem/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().setElemProc(parseInt(req.params.id), req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.delete(`${ROUTE_PREFIX}process-elem/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().delElemProc(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post(`${ROUTE_PREFIX}process-elem`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().addElemProc(req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.delete(`${ROUTE_PREFIX}task-dep`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().delTaskDep(req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post(`${ROUTE_PREFIX}task-dep`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().newTaskDep(req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.delete(`${ROUTE_PREFIX}task-log/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().delTasklog(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.put(`${ROUTE_PREFIX}task-log/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().updateTasklog(parseInt(req.params.id), req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}task/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getTask(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.delete(`${ROUTE_PREFIX}task/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().delTask(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.put(`${ROUTE_PREFIX}task/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().updateTask(parseInt(req.params.id), req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post(`${ROUTE_PREFIX}task`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().newTask(req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}process/:id/elements`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getProcessElems(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}process/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getProcess(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.put(`${ROUTE_PREFIX}process/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().updateProcess(parseInt(req.params.id), req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post(`${ROUTE_PREFIX}process`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().newProcess(req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}process-struct/:id/elements`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getProcessStructElems(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.get(`${ROUTE_PREFIX}process-struct/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().getProcessStruct(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post(`${ROUTE_PREFIX}process-struct`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().newProcessStruct(req.body, opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.delete(`${ROUTE_PREFIX}process-struct/:id`, async (req, res, next) => {
            try {
                let opts = _.defaultsDeep({ user: req.user }, req.query);
                let rows = await ProcessService().delProcessStruct(parseInt(req.params.id), opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });
    }
}

exports.setupProcesses = setupProcesses;