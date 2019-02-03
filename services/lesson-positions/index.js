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