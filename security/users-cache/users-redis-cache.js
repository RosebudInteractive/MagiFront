'use strict';

const config = require('config');
const { UsersBaseCache } = require('./users-base-cache');
const { RedisConnections, ConnectionWrapper } = require('../../database/providers/redis/redis-connections');

class UsersRedisCache extends UsersBaseCache {

    constructor(opts) {
        super(opts);
        let options = opts || {};
        this._conections = RedisConnections(options.redis);
    }

    _storeUser(user) {
        return ConnectionWrapper(((connection) => {
            return connection.setAsync("uid:" + user.Id, this._serializeFn(user), "px", this._userUpdTime)
                .then(() => {
                    return user;
                });
        }).bind(this));
    }

    _getUser(id) {
        return ConnectionWrapper(((connection) => {
            return connection.getAsync("uid:" + id)
                .then((result) => {
                    return result ? this._deSerializeFn(result) : null;
                });
        }).bind(this));
    }

    _checkToken(token, isNew) {
        let conn;
        return ConnectionWrapper(((connection) => {
            conn = connection;
            return conn.pttlAsync(token)
                .then(((time) => {
                    let addToken = isNew;
                    let result = time >= 0;
                    if (result)
                        addToken = (this._tokenExpTime - time) >= this._tokenUpdTime;
                    if (addToken)
                        result = conn.setAsync(token, 1, "px", this._tokenExpTime)
                            .then(() => true);
                    return result;
                }).bind(this));
        }).bind(this));
    }
    _destroyToken(token) {
        return ConnectionWrapper(((connection) => {
            return connection.delAsync(token);
        }).bind(this));
    }
}

let usersRedisCache = null;
exports.UsersRedisCache = (opts) => {
    return usersRedisCache = (usersRedisCache ? usersRedisCache : new UsersRedisCache(opts));
}