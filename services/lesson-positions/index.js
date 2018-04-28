'use strict'
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const LessonPositionsMem = require('./lesson-pos-mem');
const LessonPositionsRedis = require('./lesson-pos-redis');

module.exports = (app) => {
    let options = { keyPrefix: config.lessonPositions.keyPrefix };
    let positions = null;
    switch (config.lessonPositions.storage) {

        case "local":
            positions = LessonPositionsMem(options);
            break;

        case "redis":
            positions = LessonPositionsRedis(options);
            break;

        default:
            throw new Error(`Unknown storage type: "${config.lessonPositions.storage}".`)    
            break;
    }
    app.post("/api/lsnpos", (req, res, next) => {
        if (req.user) {
            positions.setLessonPositions(req.user.Id, req.body)
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
};