'use strict'
const _ = require('lodash');
const config = require('config');
const { RedisConnections, ConnectionWrapper } = require('../database/providers/redis/redis-connections');

const KEY_PREFIX = "pg:";
const DFLT_EXPIRATION = 0;
const SCAN_PAGE_SIZE = 100;

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

    getList() {
        let rc;
        return new Promise((resolve, reject) => {
            if (this._isRedis) {
                let filter = this._prefix + "*";
                rc = ConnectionWrapper((connection) => {
                    return connection.getKeyList(filter, SCAN_PAGE_SIZE);
                });
            }
            else
                rc = Object.keys(this._cache);
            resolve(rc);
        });
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
                    // return connection.unlinkAsync(id);// Available since Redis 4.0
                });
            }
            else
                delete this._cache[id];
            resolve(rc);
        });
    }

    rename(old_key, new_key, withError) {
        return new Promise((resolve, reject) => {
            let rc;
            let old_id = this._prepareKey(old_key);
            let new_id = this._prepareKey(new_key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return connection.renameAsync(old_id, new_id);
                })
                    .then((result) => {
                        return ({ isErr: false, result: result });
                    })
                    .catch((err) => {
                        if (withError)
                            throw err;
                        return ({ isErr: true, result: err });
                    });
            }
            else {
                let val = this._cache[old_id];
                if (typeof (val) !== "undefined") {
                    delete this._cache[old_id];
                    this._cache[new_id] = val;
                }
            }
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