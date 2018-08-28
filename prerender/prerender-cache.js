'use strict'
const _ = require('lodash');
const config = require('config');
const { RedisConnections, ConnectionWrapper } = require('../database/providers/redis/redis-connections');

const KEY_PREFIX = "pg:";
const DFLT_EXPIRATION = 0;

let PrerenderCache = class {
    constructor(options) {
        this._cache = {};
        this._prefix = config.has("server.prerender.redisPrefix") ? config.get("server.prerender.redisPrefix") : KEY_PREFIX;
        this._dfltExpSec = config.has("server.prerender.expInSec") ? config.get("server.prerender.expInSec") : DFLT_EXPIRATION;
        this._isRedis = config.get("server.prerender.useRedis");
        if (this._isRedis) {
            RedisConnections(options);
        }
    }

    _prepareKey(key) {
        if ((!key) || (typeof (key) !== "string"))
            throw new Error("PrerenderCache::_prepareKey; Key is missing or invalid!");
        let rc = key;
        if ((rc.length === 0) || (rc[rc.length - 1] !== "/"))
            rc += "/";
        return this._prefix + rc;
    }

    get(key) {
        return new Promise((resolve, reject) => {
            let rc;
            let id = this._prepareKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return connection.getAsync(id);
                });
            }
            else
                rc = this._cache[id];
            resolve(rc);
        });
    }

    set(key, data, expInSec) {
        let self = this;
        return new Promise((resolve, reject) => {
            let rc;
            let id = this._prepareKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    let args = [id, data];
                    if ((typeof (expInSec) === "number") && (expInSec > 0)) {
                        args.push("EX");
                        args.push(expInSec);
                    }
                    else
                        if (self._dfltExpSec) {
                            args.push("EX");
                            args.push(self._dfltExpSec);
                        }
                    return connection.setAsync(args);
                });
            }
            else
                this._cache[id] = data;
            resolve(rc);
        });
    }

    del(key) {
        return new Promise((resolve, reject) => {
            let rc;
            let id = this._prepareKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return connection.delAsync(id);
                });
            }
            else
                delete this._cache[id];
            resolve(rc);
        });
    }
}

let prerenderCache = null;

exports.PrerenderCache = ((options) => {
    if (!prerenderCache)
        prerenderCache = new PrerenderCache(options);
    return prerenderCache;
})