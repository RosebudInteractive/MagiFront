'use strict'
const _ = require('lodash');
const { RedisConnections, ConnectionWrapper } = require('../database/providers/redis/redis-connections');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const SCAN_PAGE_SIZE = 100;

exports.CacheableObject = class CacheableObject {
    constructor(options) {
        let opts = options || {};
        this._cache = {};
        this._prefix = opts.prefix ? opts.prefix : "";
        this._isRedis = opts.redis ? true : false;
        this._scanPageSize = typeof (opts.scanPageSize) === "number" ? opts.scanPageSize : SCAN_PAGE_SIZE;
        if (opts.redis) {
            RedisConnections(opts.redis);
        }
    }

    cacheGetKey(key) {
        return this._prefix + key;
    }

    cacheGetKeyList(filter) {
        let rc;
        return new Promise(resolve => {
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return connection.getKeyList(this.cacheGetKey(filter), this._scanPageSize);
                });
            }
            else {
                if (filter !== "*")
                    throw new Error(`CacheBase::getKeyList: Invalid parameter "filter": "${JSON.stringify(filter)}". Only "*" is allowed.`)
                rc = Object.keys(this._cache);
            }
            resolve(rc);
        });
    }

    cacheDelKeyList(filter) {
        let res = [];
        return this.getKeyList(filter)
            .then(list => {
                return Utils.seqExec(list, (elem) => {
                    return this.cacheDel(elem, true)
                        .then(() => {
                            res.push(elem);
                        });
                });
            })
            .then(() => res);
    }

    cacheTtl(key, inMsec) {
        return new Promise(resolve => {
            let rc = null;
            let id = this.cacheGetKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return (inMsec ? connection.pttlAsync(id) : connection.ttlAsync(id))
                        .then(result => {
                            return result >= 0 ? result : (result === -2 ? 0 : result);
                        });
                });
            }
            else
                rc = this._cache[id] ? -1 : 0;
            resolve(rc);
        });
    }

    cacheGet(key, options) {
        return new Promise(resolve => {
            let rc;
            let id = this.cacheGetKey(key);
            let opts = options || {};
            let value;
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return connection.getAsync(id)
                        .then(result => {
                            let res = value = result;
                            if (value)
                                if (opts.withTtl || opts.withPttl) {
                                    if (opts.withTtl)
                                        res = connection.ttlAsync(id)
                                    else
                                        res = connection.pttlAsync(id);
                                    res = res.then(result => {
                                        if (result === -2) {
                                            return null;
                                        }
                                        else {
                                            return {
                                                value: value,
                                                time: result === -1 ? null : result
                                            };
                                        }
                                    });
                                }
                            return res;
                        });
                });
            }
            else
                rc = this._cache[id];
            resolve(rc);
        });
    }

    cacheSet(key, data, options) {
        let opts = options || {};
        return new Promise(resolve => {
            let rc;
            let id = this.cacheGetKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    let args = [id, data];
                    if ((typeof (opts.ttlInMSec) === "number") && (opts.ttlInMSec > 0)) {
                        args.push("PX");
                        args.push(opts.ttlInMSec);
                    }
                    else
                        if ((typeof (opts.ttlInSec) === "number") && (opts.ttlInSec > 0)) {
                            args.push("EX");
                            args.push(opts.ttlInSec);
                        }
                    return connection.setAsync(args);
                });
            }
            else
                this._cache[id] = data;
            resolve(rc);
        });
    }

    cacheDel(key, isInternal) {
        return new Promise(resolve => {
            let rc;
            let id = isInternal ? key : this.cacheGetKey(key);
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

    cacheRename(old_key, new_key, withError) {
        return new Promise(resolve => {
            let rc;
            let old_id = this.cacheGetKey(old_key);
            let new_id = this.cacheGetKey(new_key);
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
