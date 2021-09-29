'use strict'
const crypto = require('crypto');
const _ = require('lodash');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { RedisConnections, ConnectionWrapper } = require('../database/providers/redis/redis-connections');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const SCAN_PAGE_SIZE = 100;

class DataCache {

    constructor(cache, prefix, data_load_func, ttl_in_sec, options) {
        let opts = options || {};
        if (cache instanceof CacheableObject)
            this._cache = cache
        else
            throw new Error(`DataCache:: constructor: Invalid or missing argument "cache".`);
        if (typeof (prefix) === "string")
            this._prefix = prefix
        else
            throw new Error(`DataCache:: constructor: Invalid or missing argument "prefix".`);
        if (typeof (data_load_func) === "function")
            this._loadFunc = data_load_func
        else
            throw new Error(`DataCache:: constructor: Invalid or missing argument "data_load_func".`);
        this._ttl_mem_cashe = typeof (opts.ttl_mem_cashe) === "number" ? opts.ttl_mem_cashe : 0;
        if (typeof (ttl_in_sec) === "number")
            this._ttl_in_sec = ttl_in_sec;
        if (typeof (opts.md5_hash) === "boolean")
            this._md5_hash = opts.md5_hash;
        if (typeof (opts.wait_lock_timeout) === "number")
            this._wait_lock_timeout = opts.wait_lock_timeout;
        if (typeof (opts.lock_timeout) === "number")
            this._lock_timeout = opts.lock_timeout;
        if (typeof (opts.check_timeout) === "number")
            this._check_timeout = opts.check_timeout;
        this._data = {};
    }

    async deleteCacheItem(id) {
        let key = `${this._prefix}${id}`;
        await this._cache.cacheDel(key);
        delete this._data[id];
    }

    async getCacheItem(id, options) {
        let result = null;
        let key = `${this._prefix}${id}`;
        let curr_time;
        let getFromCache = async () => {
            let data = null;
            let should_check = true;
            if (this._ttl_mem_cashe > 0) {
                curr_time = Date.now();
                data = this._data[id];
                should_check = !(data && (data.exp_time > curr_time));
                curr_time += this._ttl_mem_cashe;
            }
            if (should_check) {
                let redis_ts = await this._cache.cacheHget(key, "ts", { json: true });
                if (redis_ts) {
                    if ((!this._data[id]) || (this._data[id].ts !== redis_ts)) {
                        let val = await this._cache.cacheHgetAll(key, { json: true });
                        if (val && val.ts && val.data) {
                            this._data[id] = data = val;
                        }
                    }
                    else
                        data = this._data[id];
                    data.exp_time = curr_time;
                }
                else
                    data = null;
            }
            return data;
        }
        result = await getFromCache();
        if (!result) {
            result = await this._cache._lock(`_lock:${key}`, async (trial_number) => {
                let data = null;
                delete this._data[id];
                let is_loaded = true;
                if (trial_number > 1) {
                    data = await getFromCache();
                    is_loaded = false;
                }
                if (!data) {
                    data = await this._loadFunc(id, options);
                    is_loaded = true;
                }
                if (is_loaded && data) {
                    await this._cache.cacheHset(key, "data", data, { json: true });
                    let ts;
                    if (this._md5_hash) {
                        let md5sum = crypto.createHash('md5');
                        md5sum.update(JSON.stringify(data));
                        ts = md5sum.digest('hex');
                    }
                    else
                        ts = 't' + ((new Date()) - 0);
                    await this._cache.cacheHset(key, "ts", ts, { json: true });
                    if (this._ttl_in_sec)
                        await this._cache.cacheExpire(key, this._ttl_in_sec);
                    this._data[id] = data = { ts: ts, data: data, exp_time: curr_time };
                }
                return data;
            },
                this._wait_lock_timeout, {
                lock_timeout: this._lock_timeout,
                check_timeout: this._check_timeout
            });
        }
        return result;
    }

    async getHash(id, options) {
        let item = await this.getCacheItem(id, options);
        return item && item.ts ? item.ts : null;
    }

    async getData(id, options) {
        let item = await this.getCacheItem(id, options);
        return item && item.data ? item.data : null;
    }
}

class CacheableObject {

    static getService(service_name, isSilent) {
        let result = null;
        if (global.$Services && global.$Services[service_name])
            result = global.$Services[service_name]();
        if ((!result) && (!isSilent))
            throw new Error(`Service "${service_name}" isn't registered.`);
        return result;
    }

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

    async _lock(key, func, timeout, options) {
        const DFLT_CHECK_TIMEOUT = 500;
        const DFLT_WAIT_LOCK_TIMEOUT_MSEC = 60 * 1000;
        const DFLT_LOCK_TIMEOUT_SEC = 180;

        let opts = options || {};
        let is_key_set = false;
        try {
            if (typeof (func) === "function") {
                let trial_number = 1;
                await new Promise((resolve, reject) => {
                    let is_rejected = false;
                    let wait_timeout = timeout ? timeout : DFLT_WAIT_LOCK_TIMEOUT_MSEC;
                    let thandler = setTimeout(() => {
                        if (!is_key_set) {
                            is_rejected = true;
                            reject(new HttpError(HttpCode.ERR_TOO_MANY_REQ, opts.err_msg ?
                                opts.err_msg : `CacheableObject::_lock timeout ${(wait_timeout / 1000).toFixed(3)}s (key: "${key}") has expired!`));
                        }
                    }, wait_timeout);
                    let lock = async () => {
                        let lockRes = await this.cacheSet(key, "1", {
                            ttlInSec: opts.lock_timeout ? opts.lock_timeout : DFLT_LOCK_TIMEOUT_SEC,
                            nx: true
                        });
                        if (lockRes === "OK") {
                            if (is_rejected)
                                await this.cacheDel(key)
                            else {
                                is_key_set = true;
                                clearTimeout(thandler);
                                resolve();
                            }
                        }
                        else
                            if (!is_rejected) {
                                trial_number++;
                                setTimeout(lock, opts.check_timeout ? opts.check_timeout : DFLT_CHECK_TIMEOUT);
                            }
                    }
                    lock();
                });
                let result = await func(trial_number);
                await this.cacheDel(key);
                return result;
            }
        }
        catch (err) {
            if (is_key_set && key)
                await this.cacheDel(key);
            throw err;
        }
    }

    getService(service_name, isSilent) {
        return CacheableObject.getService(service_name, isSilent);
    }

    createDataCache(prefix, data_load_func, ttl_in_sec, options) {
        return new DataCache(this, prefix, data_load_func, ttl_in_sec, options);
    }

    cacheGetKey(key) {
        return this._prefix + key;
    }

    getConnectionWrapper() {
        return ConnectionWrapper;
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

    cacheExpire(key, val, inMsec) {
        return new Promise(resolve => {
            let rc = null;
            let id = this.cacheGetKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper((connection) => {
                    return (inMsec ? connection.pexpireAsync(id, val) : connection.expireAsync(id, val))
                        .then(result => {
                            return result;
                        });
                });
            }
            else
                rc = this._cache[id] ? 1 : 0;
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
            else {
                this._cache[id] = opts.json ? JSON.stringify(data) : data;
                rc = "OK";
            }
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
            let rc = null;
            let opts = options || {};
            let id = opts.isInternal ? key : this.cacheGetKey(key);
            if (this._isRedis) {
                rc = ConnectionWrapper(((connection) => {
                    return connection.hgetAllAsync(id)
                        .then((result) => {
                            let res = null;
                            if (result) {
                                res = {};
                                for (let id in result) {
                                    let data = opts.json ? JSON.parse(result[id]) : result[id];
                                    res[id] = data;
                                };
                            }
                            return res;
                        });
                }).bind(this));
            }
            else {
                rc = this._cache[id];
            }
            resolve(rc);
        });
    }

    cacheHget(hkey, key, options) {
        return new Promise(resolve => {
            let rc = null;
            let opts = options || {};
            let id = opts.isInternal ? hkey : this.cacheGetKey(hkey);
            if (this._isRedis) {
                rc = ConnectionWrapper(((connection) => {
                    return connection.hgetAsync(id, key)
                        .then((result) => {
                            let res = null;
                            if (result)
                                res = opts.json ? JSON.parse(result) : result;
                            return res;
                        });
                }).bind(this));
            }
            else {
                rc = this._cache[id] ? this._cache[id][key] : null;
            }
            resolve(rc);
        });
    }

    cacheHset(hKey, key, data, options) {
        return new Promise(resolve => {
            let rc = null;
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
            else {
                if (!this._cache[id])
                    this._cache[id] = {};
                this._cache[id][key] = _.cloneDeep(data);
            }
            resolve(rc);
        });
    }
}

exports.CacheableObject = CacheableObject;
