'use strict'

const redis = require('redis');
const { UsersBaseCache } = require('./users-base-cache');
const REDIS_HOST = "localhost";
const REDIS_PORT = "6379";

let promisify = (func) => {
    return function () {
        return new Promise(((resolve, reject) => {
            let args = [];
            for (let i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            args.push((err, res) => {
                if (err) reject(err)
                else resolve(res);
            });

            func.apply(this, args);
        }).bind(this));
    }
};

class RedisConnection {
    constructor(opts) {
        let options = opts || {};
        this._client = redis.createClient(
            {
                host: options.host ? options.host : REDIS_HOST,
                port: options.port ? options.port : REDIS_PORT
            })
            .on('error', (err) => {
                console.error(`###RedisConnection: ${err}`);
            });
        this.setAsync = promisify(this._client.set).bind(this._client);
        this.getAsync = promisify(this._client.get).bind(this._client);
        this.pttlAsync = promisify(this._client.pttl).bind(this._client);
    }

    close() {
        return this._client.quit();
    }
}

exports.UsersRedisCache = class UsersRedisCache extends UsersBaseCache {

    constructor(userFields, opts) {
        super(userFields, opts);
        this._connection = new RedisConnection(opts);
    }

    _storeUser(user) {
        return this._connection.setAsync("uid:" + user.Id, JSON.stringify(user), "px", this._userUpdTime)
            .then(() => {
                return user;
            });
    }

    _getUser(id) {
        return this._connection.getAsync("uid:" + id)
            .then((result) => {
                return result ? JSON.parse(result) : null;
            });
    }

    _checkToken(token, isNew) {
        return this._connection.pttlAsync(token)
            .then(((time) => {
                let addToken = isNew;
                let result = time >= 0;
                if (result)
                    addToken = (this._tokenExpTime - time) >= this._tokenUpdTime;
                if (addToken)
                    result = this._connection.setAsync(token, 1, "px", this._tokenExpTime)
                        .then(() => true);
                return result;
            }).bind(this));
    }
}
