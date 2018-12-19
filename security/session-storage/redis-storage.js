'use strict';

const redis = require('redis');
const _ = require('lodash');
const { RedisConnections, ConnectionWrapper } = require('../../database/providers/redis/redis-connections');

/*!
 * Connect - Redis
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca> (https://github.com/tj/connect-redis)
 * 2018-03-13 Refactored by Alexander Sokolov <alexander.f.sokolov@gmail.com>
 * MIT Licensed
 */

var noop = function () { };

const oneHour = 3600 * 1000;
const oneDay = 24 * oneHour;

function getTTL(store, sess, sid) {
    if (typeof store.ttl === 'number' || typeof store.ttl === 'string') return store.ttl;
    if (typeof store.ttl === 'function') return store.ttl(store, sess, sid);
    if (store.ttl) throw new TypeError('`store.ttl` must be a number or function.');

    var maxAge = sess.cookie.maxAge;
    return (typeof maxAge === 'number' ? maxAge : store.maxAge);
}

/**
 * Return the `RedisStore` extending `express`'s session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */

module.exports = function (session) {
    /**
     * Express's session Store.
     */
    const Store = session.Store;

    /**
     * Fetch all sessions' Redis keys using non-blocking SCAN command
     *
     * @param {Function} fn
     * @api private
     */

    function allKeys(store, connection) {
        var keysObj = {}; // Use an object to dedupe as scan can return duplicates
        var pattern = store.prefix + '*';
        var scanCount = store.scanCount;
        let nextBatch = (cursorId) => {
            return connection.scanAsync(cursorId, 'match', pattern, 'count', scanCount)
            .then((result)=>{
                var nextCursorId = result[0];
                var keys = result[1];
                keys.forEach(function (key) {
                    keysObj[key] = 1;
                });

                if (nextCursorId != 0) {
                    // next batch
                    return nextBatch(nextCursorId);
                }
                // end of cursor
                return Object.keys(keysObj);
            });
        };
        return nextBatch(0);
    }

    /**
     * Inherit `RedisStore` from `Store`.
     */
    return class RedisStore extends Store {

        /**
         * Initialize RedisStore with the given `options`.
         *
         * @param {Object} options
         * @api public
         */

        constructor(opts) {
            let options = opts ? _.cloneDeep(opts) : {};
            super(options);

            var self = this;
            this.prefix = options.prefix == null
                ? 'sess:'
                : options.prefix;

            delete options.prefix;

            this.scanCount = Number(options.scanCount) || 100;
            delete options.scanCount;

            this.serializer = options.serializer || JSON;

            this.ttl = options.ttl;
            this.disableTTL = options.disableTTL;

            this.maxAge = options.maxAge ? options.maxAge : oneDay;
            this.updPeriod = options.updPeriod ? options.updPeriod : oneHour;

            this._conections = RedisConnections(options.redis);
            setImmediate(() => {
                self.emit('connect');
            });
        }

        /**
         * Attempt to fetch session by the given `sid`.
         *
         * @param {String} sid
         * @param {Function} fn
         * @api public
         */

        get(sid, fn) {
            var store = this;
            var psid = store.prefix + sid;
            if (!fn) fn = noop;

            ConnectionWrapper((connection) => {
                return connection.getAsync(psid)
                    .then((data) => {
                        if (!data) return data;

                        data = data.toString();
                        return store.serializer.parse(data);
                    })
            })
                .then((result) => {
                    return fn(null, result);
                })
                .catch((err) => {
                    fn(err);
                })
        };

        /**
         * Commit the given `sess` object associated with the given `sid`.
         *
         * @param {String} sid
         * @param {Session} sess
         * @param {Function} fn
         * @api public
         */

        set(sid, sess, fn) {
            var store = this;
            var args = [store.prefix + sid];
            if (!fn) fn = noop;

            ConnectionWrapper((connection) => {
                let jsess = store.serializer.stringify(sess);
                args.push(jsess);

                if (!store.disableTTL) {
                    var ttl = getTTL(store, sess, sid);
                    args.push('PX', ttl);
                }
                return connection.setAsync(args);
            })
                .then((result) => {
                    return fn();
                })
                .catch((err) => {
                    fn(err);
                })
        };

        /**
         * Destroy the session associated with the given `sid`.
         *
         * @param {String} sid
         * @api public
         */

        destroy(sid, fn) {
            ConnectionWrapper(((connection) => {
                let result;
                if (Array.isArray(sid)) {
                    var multi = connection.client().multi();
                    var prefix = this.prefix;
                    sid.forEach((s) => {
                        multi.del(prefix + s);
                    });
                    result = new Promise((resolve, reject) => {
                        multi.exec((err, result) => {
                            if (err) reject(err)
                            else resolve(result);
                        });                        
                    })
                } else {
                    sid = this.prefix + sid;
                    result = connection.delAsync(sid);
                }
                return result;
            }).bind(this))
                .then((result) => {
                    return fn();
                })
                .catch((err) => {
                    fn(err);
                });
        };

        /**
         * Refresh the time-to-live for the session with the given `sid`.
         *
         * @param {String} sid
         * @param {Session} sess
         * @param {Function} fn
         * @api public
         */

        touch(sid, sess, fn) {
            let store = this;
            let psid = store.prefix + sid;
            if (!fn) fn = noop;
            if (store.disableTTL) return fn();
            let ttl;
            let conn;
            ConnectionWrapper((connection) => {
                conn = connection;
                ttl = getTTL(store, sess);
                return conn.pttlAsync(psid);
            })
                .then((time) => {
                    ttl = ttl < time ? ttl : time;
                    let result = time >= 0;
                    if (result)
                        result = (store.maxAge - ttl) >= store.updPeriod;
                    if (result)
                        result = conn.pexpireAsync(psid, store.maxAge);
                    return result;
                })
                .then((result) => {
                    return fn(null, result);
                })
                .catch((err) => {
                    fn(err);
                })
        };

        /**
         * Fetch all sessions' ids
         *
         * @param {Function} fn
         * @api public
         */

        ids(fn) {
            var store = this;
            var prefixLength = store.prefix.length;
            if (!fn) fn = noop;

            ConnectionWrapper((connection) => {
                return allKeys(store, connection)
                    .then((keys) => {
                        keys = keys.map(function (key) {
                            return key.substr(prefixLength);
                        });
                        return keys;                    
                    });
            })
                .then((result) => {
                    return fn(null, result);
                })
                .catch((err) => {
                    fn(err);
                })

        };

        /**
         * Fetch all sessions
         *
         * @param {Function} fn
         * @api public
         */

        all(fn) {
            let store = this;
            let prefixLength = store.prefix.length;
            if (!fn) fn = noop;
            let keys;
            let conn;

            ConnectionWrapper((connection) => {
                conn = connection;
                return allKeys(store, conn)
                    .then((result) => {
                        keys = result;
                        if (keys.length === 0) return [];
                        return conn.mgetAsync(keys);
                    })
                    .then((sessions) => {
                        return sessions.map(function (data, index) {
                            data = data.toString();
                            data = store.serializer.parse(data);
                            data.id = keys[index].substr(prefixLength);
                            return data;
                        });
                    });
            })
                .then((result) => {
                    return fn(null, result);
                })
                .catch((err) => {
                    fn(err);
                });
        };

    };
};

