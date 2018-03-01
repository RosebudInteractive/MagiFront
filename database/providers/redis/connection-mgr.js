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
        this.pttlAsync = promisify(this._client.pttl).bind(this._client);
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

const RedisConnectionManager = class RedisConnectionManager extends Base{
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

let redisConnectionManager = null;
module.exports = (engine, options) => {
    return redisConnectionManager ? redisConnectionManager : redisConnectionManager = new RedisConnectionManager(engine, options);
};