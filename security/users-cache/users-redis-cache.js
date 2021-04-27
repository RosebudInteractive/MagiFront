'use strict';

const config = require('config');
const { UsersBaseCache } = require('./users-base-cache');
const { RedisConnections, ConnectionWrapper } = require('../../database/providers/redis/redis-connections');
const { TokenType } = require('../../const/common');

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

    _setToken(token, data, options) {
        return ConnectionWrapper(async (conn) => {
            let opts = options || {};
            let expTime = opts.expTime ? opts.expTime : this._tokenExpTime;
            let _data = data;
            if (opts.json)
                _data = JSON.stringify(data);
            await conn.setAsync(token, _data, "px", expTime);
        });
    }

    _checkToken(token, isNew, options) {
        return ConnectionWrapper(async (conn) => {
            let opts = options || {};
            let ttype = opts.type ? opts.type : TokenType.Renewable;
            let expTime = opts.expTime ? opts.expTime : this._tokenExpTime;
            let time = await conn.pttlAsync(token);
            let renewToken = false;
            let result = 0;
            if ((time >= 0) && (!isNew)) {
                let val = await conn.getAsync(token);
                if (val) {
                    ttype = +val;
                    if (ttype === TokenType.Renewable)
                        renewToken = (this._tokenExpTime - time) >= this._tokenUpdTime;
                    result = ttype;
                }
            }
            if (renewToken || isNew) {
                await conn.setAsync(token, ttype, "px", expTime);
                result = ttype;
            }
            return result;
        });
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