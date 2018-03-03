'use strict'

const redis = require('redis');
const { UsersBaseCache } = require('./users-base-cache');
const RedisConnectionManager = require('../database/providers/redis/connection-mgr');

exports.UsersRedisCache = class UsersRedisCache extends UsersBaseCache {

    constructor(userFields, opts) {
        super(userFields, opts);
        let options = opts || {};
        this._conMgr = RedisConnectionManager(null, options.redis);
        this._conMgr.initPools();
    }

    _connectionWrapper(func) {
        return this._conMgr.getConnection()
            .then(((connection) => {
                return func(connection)
                    .then((result) => {
                        return this._conMgr.releaseConnection(connection)
                            .then(() => {
                                return result;
                            });
                    })
                    .catch((err) => {
                        this._conMgr.releaseConnection(connection)
                            .then(() => {
                                throw err;
                            });
                    });
            }).bind(this));
    }

    _storeUser(user) {
        return this._connectionWrapper(((connection) => {
            return connection.setAsync("uid:" + user.Id, JSON.stringify(user), "px", this._userUpdTime)
                .then(() => {
                    return user;
                });
        }).bind(this));
    }

    _getUser(id) {
        return this._connectionWrapper(((connection) => {
            return connection.getAsync("uid:" + id)
            .then((result) => {
                return result ? JSON.parse(result) : null;
            });
        }).bind(this));
    }

    _checkToken(token, isNew) {
        return this._connectionWrapper(((connection) => {
            return connection.pttlAsync(token)
                .then(((time) => {
                    let addToken = isNew;
                    let result = time >= 0;
                    if (result)
                        addToken = (this._tokenExpTime - time) >= this._tokenUpdTime;
                    if (addToken)
                        result = connection.setAsync(token, 1, "px", this._tokenExpTime)
                            .then(() => true);
                    return result;
                }).bind(this));
        }).bind(this));
    }
}
