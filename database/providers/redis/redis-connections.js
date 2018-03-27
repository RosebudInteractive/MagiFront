'use strict';
const config = require('config');
const RedisConnectionManager = require('./connection-mgr');

let redisConnections = null;

exports.ConnectionWrapper = (func) => {
    if (redisConnections === null)
        return Promise.reject("ConnectionWrapper: Redis connection hasn't been inintialized.");
    return redisConnections.getConnection()
        .then((connection) => {
            return func(connection)
                .then((result) => {
                    return redisConnections.releaseConnection(connection)
                        .then(() => {
                            return result;
                        });
                })
                .catch((err) => {
                    redisConnections.releaseConnection(connection)
                        .then(() => {
                            throw err;
                        });
                });
        });
}

exports.RedisConnections = (options) => {
    if (!redisConnections) {
        let opts = options || (config.has('connections.redis') ? config.connections.redis : {});
        redisConnections = new RedisConnectionManager(null, opts);
        redisConnections.initPools();
    }
    return redisConnections;
};