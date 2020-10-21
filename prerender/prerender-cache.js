'use strict'
const _ = require('lodash');
const config = require('config');
const request = require('request');
const { RedisConnections, ConnectionWrapper } = require('../database/providers/redis/redis-connections');
const { CacheableObject } = require('../utils/cache-base');
const { SEO } = require('../const/common');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const KEY_PREFIX = "pg:";
const SCAN_PAGE_SIZE = 100;

const DFLT_RENDER_MAX_COUNT = 5;
const DFLT_RENDER_DELAY = 10 * 1000; // 10sec

let PrerenderCache = class PrerenderCache extends CacheableObject {
    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.prefix = config.has("server.prerender.redisPrefix") ? config.get("server.prerender.redisPrefix") : KEY_PREFIX;
        let isRedis = config.get("server.prerender.useRedis");
        if (!isRedis)
            delete opts.redis
        else {
            if (!opts.redis) {
                if (config.has("connections.redis"))
                    opts.redis = _.cloneDeep(config.connections.redis);
            }
        }
        super(opts);
        let targetHost = config.has("server.prerender.targetHost") ? config.server.prerender.targetHost : null;
        this._renderHost = opts.host ? opts.host : (targetHost ? targetHost : config.proxyServer.siteHost);
    }

    cacheGetKey(key) {
        if ((!key) || (typeof (key) !== "string"))
            throw new Error("PrerenderCache::cacheGetKey: Key is missing or invalid!");
        let rc = key;
        if ((rc.length === 0) || (rc[rc.length - 1] !== "/"))
            rc += "/";
        return this._prefix + rc;
    }

    getKey(key) {
        return this.cacheGetKey(key);
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
                if (mode !== "all")
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

    prerender(path, isPersist, headers, options) {
        let opts = options || {};
        let rc;
        return new Promise((resolve, reject) => {
            let url = (opts.host ? opts.host : this._renderHost) + path;
            let hs = headers ? headers : { "User-Agent": SEO.FORCE_RENDER_USER_AGENT };
            request({ url: url, headers: hs, strictSSL: false }, (error, response, body) => {
                if (error)
                    reject(error)
                else {
                    if (opts.response) {
                        rc = { statusCode: response.statusCode, body: body };
                    }
                    resolve();
                }
            });
        })
            .then(() => {
                if (isPersist) {
                    let id = this.getKey(path);
                    return ConnectionWrapper((connection) => {
                        return connection.persistAsync(id);
                    });
                }
            })
            .then(() => { return rc; });
    }

    ttl(key, inMsec) {
        return this.cacheTtl(key, inMsec);
    }

    get(key, options) {
        return this.cacheGet(key, options);
    }

    set(key, data, ttlInSec) {
        return this.cacheSet(key, data, { ttlInSec: ttlInSec });
    }

    del(key, isInternal) {
        return this.cacheDel(key, isInternal);
    }

    rename(old_key, new_key, withError) {
        return this.cacheRename(old_key, new_key, withError);
    }
}

let prerenderCache = null;

exports.PrerenderCache = ((options) => {
    if (!prerenderCache)
        prerenderCache = new PrerenderCache(options);
    return prerenderCache;
})