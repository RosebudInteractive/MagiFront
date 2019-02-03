'use strict'
const _ = require('lodash');
const config = require('config');
const { SEO } = require('../../const/common');
const { HttpCode } = require('../../const/http-codes');
const { buildLogString } = require('../../utils');
const { CacheableObject } = require('../../utils/cache-base');

exports.setupCache = (app) => {
    let optsCache = {};
    if (config.has("connections.redis"))
        optsCache.redis = _.cloneDeep(config.connections.redis);
    let cache = new CacheableObject(optsCache);

    app.get('/api/adm/cache', (req, res, next) => {
        new Promise(resolve => {
            let mode = (req.query && req.query.mode) ? req.query.mode : null;
            if (!mode)
                throw new Error(`Query argument "mode" is missing. It can be "list", "get", "set", "hget", "hset", "count" or "clear".`);

            let filter = (req.query && req.query.filter) ? req.query.filter : null;
            let key = (req.query && req.query.key) ? req.query.key : null;
            let value = (req.query && req.query.value) ? req.query.value : null;
            let json = (req.query && req.query.json) ? (((req.query.json === "true") || (req.query.json === "1")) ? true : false) : true;
            let ttl = (req.query && req.query.ttl) ? parseInt(req.query.ttl) : null;
            ttl = isNaN(ttl) ? null : ttl;

            let rc;
            switch (mode) {

                case "list":
                case "count":
                    if (!filter)
                        throw new Error(`Query argument "filter" is missing.`);
                    rc = cache.cacheGetKeyList(filter)
                        .then(data => {
                            let res = { result: "OK", keysAffected: data.length };
                            if (mode === "list")
                                res.keys = data;
                            return res;
                        });
                    break;

                case "clear":
                    if(filter)
                        rc = cache.cacheDelKeyList(filter)
                    else
                        if(key)
                            rc = cache.cacheDel(key)
                                .then(num => { return num === 1 ? [key] : [] });
                    else
                            throw new Error(`Query argument "filter" (or "key") is missing.`);

                    rc = rc.then(data => {
                        let res = { result: "OK", keysAffected: data.length, keys: data };
                        return res;
                    });
                    break;

                case "get":
                    if (!key)
                        throw new Error(`Query argument "key" is missing.`);
                    let withTtl = (req.query && req.query.ttl && ((req.query.ttl === "true") || (req.query.ttl === "1"))) ? true : false;
                    rc = cache.cacheGet(key, { json: json, withTtl: withTtl })
                        .then(val => { return { result: "OK", value: val } });
                    break;

                case "set":
                    if (!key)
                        throw new Error(`Query argument "key" is missing.`);
                    if (!value)
                        throw new Error(`Query argument "value" is missing.`);
                    if (json)
                        value = JSON.parse(value);
                    rc = cache.cacheSet(key, value, { json: json, ttlInSec: ttl })
                        .then(() => { return { result: "OK" } });
                    break;

                case "hget":
                    if (!key)
                        throw new Error(`Query argument "key" is missing.`);
                    rc = cache.cacheHgetAll(key, { json: json })
                        .then(val => { return { result: "OK", value: val } });
                    break;

                case "hset":
                    let hkey = (req.query && req.query.hkey) ? req.query.hkey : null;
                    if (!hkey)
                        throw new Error(`Query argument "hkey" is missing.`);
                    if (!key)
                        throw new Error(`Query argument "key" is missing.`);
                    if (!value)
                        throw new Error(`Query argument "value" is missing.`);
                    if (json)
                        value = JSON.parse(value);
                    rc = cache.cacheHset(hkey, key, value, { json: json, ttlInSec: ttl })
                        .then(() => { return { result: "OK" } });
                    break;

                default:
                    throw new Error(`Query argument "mode" is invalid: "${mode}".`);
            }
            resolve(rc);
        })
            .then(result => {
                res.send(result);
            })
            .catch(err => {
                next(err);
            });
    });
};
