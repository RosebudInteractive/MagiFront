'use strict'
const _ = require('lodash');
const config = require('config');
const request = require('request');
const { RedisConnections, ConnectionWrapper } = require('../database/providers/redis/redis-connections');
const { SEO } = require('../const/common');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const KEY_PREFIX = "pg:";
const SCAN_PAGE_SIZE = 100;

const DFLT_RENDER_MAX_COUNT = 5;
const DFLT_RENDER_DELAY = 10 * 1000; // 10sec

let PrerenderCache = class {
    constructor(options) {
        let opts = options || {};
        this._cache = {};
        this._prefix = config.has("server.prerender.redisPrefix") ? config.get("server.prerender.redisPrefix") : KEY_PREFIX;
        this._isRedis = config.get("server.prerender.useRedis");
        let targetHost = config.has("server.prerender.targetHost") ? config.server.prerender.targetHost : null;
        this._renderHost = opts.host ? opts.host : (targetHost ? targetHost : config.proxyServer.siteHost);
        if (this._isRedis) {
            RedisConnections(opts.redis);
        }
    }

    getKey(key) {
        if ((!key) || (typeof (key) !== "string"))
            throw new Error("PrerenderCache::getKey; Key is missing or invalid!");
        let rc = key;
        if ((rc.length === 0) || (rc[rc.length - 1] !== "/"))
            rc += "/";
        return this._prefix + rc;
    }

    getList(mode) {
        let rc;
        return new Promise((resolve, reject) => {
            if (this._isRedis) {
                let filter = this._prefix + "*";
                switch (mode) {
                    case "all":
                        break;
                    case "courses":
                        filter = this._prefix + "/category/*";
                        break;
                    case "authors":
                        filter = this._prefix + "/autor/*";
                        break;
                    case "categories":
                        filter = this._prefix + "/razdel/*";
                        break;
                    default:
                        if (mode)
                            if (mode.indexOf("*") >= 0)
                                filter = this._prefix + mode
                            else
                                filter = this.getKey(mode);
                }
                rc = ConnectionWrapper((connection) => {
                    return connection.getKeyList(filter, SCAN_PAGE_SIZE);
                });
            }
            else {
                if (mode!=="all")
                    throw new Error(`PrerenderCache::getList: Invalid parameter "mode": "${JSON.stringify(mode)}". Only "all" is allowed.`)
                rc = Object.keys(this._cache);
            }
            resolve(rc);
        });
    }

    delList(mode) {
        let res = [];
        return this.getList(mode)
            .then(list => {
                return Utils.seqExec(list, (elem) => {
                    return this.del(elem, true)
                        .then(() => {
                            res.push(elem);
                        });
                });
            })
            .then(() => res);
    }

    prerenderList(mode, count, delay) {
        let prfxLen = this._prefix.length;
        let res = [];
        let maxCount = (typeof (count) === "number") && (!isNaN(count)) && (count >= 0) ? count : DFLT_RENDER_MAX_COUNT;
        let dt = (typeof (delay) === "number") && (!isNaN(delay)) && (delay > 0) ? delay * 1000 : DFLT_RENDER_DELAY;
        let delayFun = (t) => {
            return new Promise(resolve => {
                let rc;
                if (t > 0)
                    setTimeout(() => resolve(), t)
                else resolve();
            });
        }
        return this.getList(mode)
            .then(list => {
                let lastTs = null;
                return Utils.seqExec(list, (elem) => {
                    if (res.length < maxCount) {
                        let path = elem.substring(prfxLen);
                        let now = new Date();
                        return delayFun(lastTs ? (dt - (now - lastTs)) : 0)
                            .then(() => {
                                lastTs = new Date();
                                return this.prerender(path)
                                    .then(() => {
                                        res.push(path);
                                    });
                            });
                    }
                });
            })
            .then(() => res);
    }

    prerender(path, isPersist, headers) {
        return new Promise((resolve, reject) => {
            let url = this._renderHost + path;
            let hs = headers ? headers : { "User-Agent": SEO.FORCE_RENDER_USER_AGENT };
            request({ url: url, headers: hs, strictSSL: false }, (error, response, body) => {
                if (error)
                    reject(error)
                else
                    resolve();
            });
        })
            .then(() => {
                if (isPersist) {
                    let id = this.getKey(path);
                    return ConnectionWrapper((connection) => {
                        return connection.persistAsync(id);
                    });
                }
            });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            let rc;
            let id = this.getKey(key);
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

    set(key, data, ttlInSec) {
        return new Promise((resolve, reject) => {
            let rc;
            let id = this.getKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    let args = [id, data];
                    if ((typeof (ttlInSec) === "number") && (ttlInSec > 0)) {
                        args.push("EX");
                        args.push(ttlInSec);
                    }
                    return connection.setAsync(args);
                });
            }
            else
                this._cache[id] = data;
            resolve(rc);
        });
    }

    del(key, isInternal) {
        return new Promise((resolve, reject) => {
            let rc;
            let id = isInternal ? key : this.getKey(key);
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
            let old_id = this.getKey(old_key);
            let new_id = this.getKey(new_key);
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