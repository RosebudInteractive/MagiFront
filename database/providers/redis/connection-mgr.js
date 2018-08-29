'use strict';
const redis = require('redis');
const Base = require(UCCELLO_CONFIG.uccelloPath + 'dataman/providers/base/connection-mgr');

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

    static createConnection(opts) {
        return new Promise((resolve, reject) => {
            let conn = new RedisConnection(opts);
            conn._client
                .on("connect", () =>{
                    resolve(conn);
                })    
                .on('error', (err) => {
                    console.error(`###RedisConnection: ${err}`);
                    reject(err);
                });
        })
    }

    constructor(opts) {
        let options = opts || {};
        this._client = redis.createClient(
            {
                host: options.host ? options.host : REDIS_HOST,
                port: options.port ? options.port : REDIS_PORT
            });
        this.setAsync = promisify(this._client.set).bind(this._client);
        this.getAsync = promisify(this._client.get).bind(this._client);
        this.delAsync = promisify(this._client.del).bind(this._client);
        this.pttlAsync = promisify(this._client.pttl).bind(this._client);
        this.ttlAsync = promisify(this._client.ttl).bind(this._client);
        this.scanAsync = promisify(this._client.scan).bind(this._client);
        this.expireAsync = promisify(this._client.expire).bind(this._client);
        this.pexpireAsync = promisify(this._client.pexpire).bind(this._client);
        this.mgetAsync = promisify(this._client.mget).bind(this._client);
        this.renameAsync = promisify(this._client.rename).bind(this._client);
        this.unlinkAsync = promisify(this._client.unlink).bind(this._client);
        this.hgetAll = promisify(this._client.hgetall).bind(this._client);
        this.hset = promisify(this._client.hset).bind(this._client);
        this.hget = promisify(this._client.hget).bind(this._client);
        this.hdel = promisify(this._client.hdel).bind(this._client);
    }

    client() { return this._client; }

    getKeyList(match, count) {
        return new Promise((resolve, reject) => {
            let list = {};
            let scanFunc = (cursor) => {
                let args = [cursor];
                if (match) {
                    args.push("MATCH");
                    args.push(match);
                }
                if (count) {
                    args.push("COUNT");
                    args.push(count);
                }
                return this.scanAsync(args)
                    .then((result) => {
                        console.log(result);
                        if (Array.isArray(result) && (result.length == 2)) {
                            if (Array.isArray(result[1])) {
                                result[1].forEach((elem) => {
                                    list[elem] = true;
                                })
                            }
                            if (result[0] !== "0")
                                return scanFunc(result[0])
                            else
                                return Object.keys(list);
                        }
                    });
            };
            resolve(scanFunc("0"));
        });
    }

    close() {
        return new Promise((resolve) => {
            this._client.on('end', () => {
                resolve();
            });
            this._client.quit();
        });
    }
}

module.exports = class RedisConnectionManager extends Base{
    constructor(engine, options) {
        super(engine, options);
    }

    connect(config) {
        return RedisConnection.createConnection(config);
    }

    disconnect(connection) {
        return connection.close();
    }
}
