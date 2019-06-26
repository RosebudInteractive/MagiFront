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

    getService(service_name, isSilent) {
        let result = null;
        if (global.$Services && global.$Services[service_name])
            result = global.$Services[service_name]();
        if ((!result) && (!isSilent))
            throw new Error(`Service "${service_name}" isn't registered.`);
        return result;        
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
                    throw new Error(`CacheBase::cacheGetKeyList: Invalid parameter "filter": "${JSON.stringify(filter)}". Only "*" is allowed.`)
                rc = Object.keys(this._cache);
            }
            resolve(rc);
        });
    }

    cacheDelKeyList(filter) {
        let res = [];
        return new Promise(resolve => {
            let rc = Array.isArray(filter) ? filter : this.cacheGetKeyList(filter);
            resolve(rc);
        })
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
            let opts = options || {};
            let id = opts.isInternal ? key : this.cacheGetKey(key);
            let value;
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return connection.getAsync(id)
                        .then(result => {
                            let res = result;
                            if (res)
                                res = value = opts.json ? JSON.parse(res) : res;
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
                rc = opts.json ? JSON.parse(typeof (this._cache[id]) !== "undefined" ? this._cache[id] : null) : this._cache[id];
            resolve(rc);
        });
    }

    cacheSet(key, data, options) {
        return new Promise(resolve => {
            let rc;
            let opts = options || {};
            let id = opts.isInternal ? key : this.cacheGetKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    let args = [id, opts.json ? JSON.stringify(data) : data];
                    if ((typeof (opts.ttlInMSec) === "number") && (opts.ttlInMSec > 0)) {
                        args.push("PX");
                        args.push(opts.ttlInMSec);
                    }
                    else
                        if ((typeof (opts.ttlInSec) === "number") && (opts.ttlInSec > 0)) {
                            args.push("EX");
                            args.push(opts.ttlInSec);
                        }
                    if ((typeof (opts.nx) === "boolean") && opts.nx) {
                        args.push("NX");
                    }
                    else
                        if ((typeof (opts.xx) === "boolean") && opts.xx) {
                            args.push("XX");
                        }
                    return connection.setAsync(args);
                });
            }
            else
                this._cache[id] = opts.json ? JSON.stringify(data) : data;
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

    cacheHgetAll(key, options) {
        return new Promise(resolve => {
            let rc = {};
            let opts = options || {};
            let id = opts.isInternal ? key : this.cacheGetKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper(((connection) => {
                    return connection.hgetAllAsync(id)
                        .then((result) => {
                            let res = {};
                            if (result)
                                for (let id in result) {
                                    let data = opts.json ? JSON.parse(result[id]) : result[id];
                                    res[id] = data;
                                };
                            return res;
                        });
                }).bind(this));
            }
            resolve(rc);
        });
    }

    cacheHset(hKey, key, data, options) {
        return new Promise(resolve => {
            let rc = {};
            let opts = options || {};
            let id = opts.isInternal ? hKey : this.cacheGetKey(hKey);
            if (this._isRedis) {
                rc = ConnectionWrapper(((connection) => {
                    return connection.hsetAsync(id, key, opts.json ? JSON.stringify(data) : data)
                        .then(result => {
                            return;
                        });
                }).bind(this));
            }
            resolve(rc);
        });
    }
}
