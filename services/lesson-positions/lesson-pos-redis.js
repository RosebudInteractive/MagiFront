'use strict'
const { LessonPositionsBase } = require('./lesson-pos-base');
const { RedisConnections, ConnectionWrapper } = require('../../database/providers/redis/redis-connections');

const LessonPositionsRedis = class LessonPositionsRedis extends LessonPositionsBase {

    constructor(options) {
        super(options);
        let opts = options || {};
        this._conections = RedisConnections(opts.redis);
    }

    _getAllPos(userId) {
        return ConnectionWrapper(((connection) => {
            return connection.hgetAllAsync(this.keyPrefix + userId)
                .then((result) => {
                    let res = {};
                    if (result)
                        for (let id in result) {
                            let data = JSON.parse(result[id]);
                            res[id] = data;
                        };
                    return res;
                });
        }).bind(this));
    }

    _setPos(userId, pos) {
        return ConnectionWrapper(((connection) => {
            return connection.hsetAsync(this.keyPrefix + userId, pos.id, JSON.stringify(pos.data))
                .then((result) => {
                    return;
                });
        }).bind(this));
    }
};

let lessonPositionsRedis = null;
module.exports = (options) => {
    return lessonPositionsRedis ? lessonPositionsRedis : lessonPositionsRedis = new LessonPositionsRedis(options);
};