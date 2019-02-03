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

    _getHist(userId, lsnId, ts) {
        return new Promise(resolve => {
            let rc;
            let id = this.keyHistPrefix + userId + ":" + lsnId + ":" + ts;
            rc = ConnectionWrapper((connection) => {
                return connection.getAsync(id)
                    .then(result => {
                        return result ? JSON.parse(result) : null;
                    });
            });
            resolve(rc);
        });
    }

    _setHist(userId, lsnId, ts, data, ttl) {
        return new Promise(resolve => {
            let rc;
            let id = this.keyHistPrefix + userId + ":" + lsnId + ":" + ts;
            rc = ConnectionWrapper((connection) => {
                let args = [id, JSON.stringify(data)];
                if ((typeof (ttl) === "number") && (ttl > 0)) {
                    args.push("EX");
                    args.push(ttl);
                }
                return connection.setAsync(args);
            });
            resolve(rc);
        });
    }
};

let lessonPositionsRedis = null;
module.exports = (options) => {
    return lessonPositionsRedis ? lessonPositionsRedis : lessonPositionsRedis = new LessonPositionsRedis(options);
};