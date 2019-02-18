'use strict'
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const LessonPositionsMem = require('./lesson-pos-mem');
const LessonPositionsRedis = require('./lesson-pos-redis');

let positions = null;

let positionsService = () => {
    let initPositions = () => {
        let result = null;
        let options = {
            keyPrefix: config.lessonPositions.keyPrefix,
            keyHistPrefix: config.lessonPositions.keyHistPrefix,
            histTTL: config.lessonPositions.histTTL,
            maxIdle: config.lessonPositions.maxIdle,
            maxInterval: config.lessonPositions.maxInterval
        };
        switch (config.lessonPositions.storage) {

            case "local":
                result = LessonPositionsMem(options);
                break;

            case "redis":
                result = LessonPositionsRedis(options);
                break;

            default:
                throw new Error(`Unknown storage type: "${config.lessonPositions.storage}".`)
                break;
        }
        return result;
    }
    return positions ? positions : positions = initPositions();
}

exports.PositionsService = positionsService;

exports.SetupRoute = (app) => {
 
    app.get("/api/lsnposdbg", (req, res, next) => {
        let isAuth = false;
        let errAuthMsg = "Not authorized.";
        if (req.user) {
            let userId = (req.query && req.query.userId) ? parseInt(req.query.userId) : null;
            errAuthMsg = `Invalid or missing parameter "userId": "${req.query.userId}" vs "${req.user.Id}"`;
            if (userId === req.user.Id) {
                isAuth = true;
                let isParamsOK = false;
                let errMsg;
                let data = { lsn: {} };
                try {
                    let ts = (req.query && req.query.ts) ? parseInt(req.query.ts) : null;
                    if ((typeof (ts) !== "number") || isNaN(ts))
                        throw new Error(`Invalid or missing parameter "ts": "${req.query.ts}"`);
                    data.ts = ts;
                    let lessonId = (req.query && req.query.lessonId) ? parseInt(req.query.lessonId) : null;
                    if (lessonId && ((typeof (lessonId) !== "number") || isNaN(lessonId)))
                        throw new Error(`Invalid parameter "lessonId": "${req.query.lessonId}"`);
                    let isFinished = (req.query && req.query.isFinished && (req.query.isFinished === "true")) ? true : false;
                    let pos = (req.query && req.query.pos) ? parseFloat(req.query.pos) : null;
                    if (!isFinished)
                        if (lessonId && ((typeof (pos) !== "number") || isNaN(pos)))
                            throw new Error(`Invalid or missing parameter "pos": "${req.query.pos}"`);
                    let dt = (req.query && req.query.dt) ? parseFloat(req.query.dt) : null;
                    if (lessonId && ((typeof (dt) !== "number") || isNaN(dt)))
                        throw new Error(`Invalid or missing parameter "dt": "${req.query.dt}"`);
                    let r = (req.query && req.query.r) ? parseFloat(req.query.r) : null;
                    if (r && ((typeof (r) !== "number") || isNaN(r)))
                        throw new Error(`Invalid parameter "r": "${req.query.r}"`);
                    if (lessonId) {
                        let lsn = data.lsn[lessonId] = {};
                        if (isFinished)
                            lsn.isFinished = isFinished
                        else
                            lsn.pos = pos;
                        lsn.dt = dt;
                        if (r)
                            lsn.r = r;
                    }
                    isParamsOK = true;
                }
                catch (err) {
                    errMsg = err.message;
                }
                if (isParamsOK)
                    positionsService().setLessonPositions(userId, data)
                        .then((result) => {
                            res.send(result);
                        })
                        .catch((err) => {
                            next(err);
                        })
                else
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: errMsg });
            }
        }
        if (!isAuth)
            res.status(HttpCode.ERR_UNAUTH).json({ message: errAuthMsg });
    });

    app.post("/api/lsnpos", (req, res, next) => {
        if (req.user) {
            positionsService().setLessonPositions(req.user.Id, req.body)
                .then((result) => {
                    res.send(result);
                })
                .catch((err) => {
                    next(err);
                });
        }
        else
            res.status(HttpCode.ERR_UNAUTH).json({ message: "Not authorized." });
    });

    app.post("/api/adm/lsnpos", (req, res, next) => {
        if (req.body && req.body.userId)
            positionsService().setLessonPositions(req.body.userId, req.body)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                next(err);
            })
        else
            res.status(HttpCode.ERR_BAD_REQ).json({ message: "Missing \"userId\" field." });
    });
};