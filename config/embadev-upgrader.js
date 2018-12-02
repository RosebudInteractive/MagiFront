const path = require('path');

let proxyServer = {
    protocol: 'http',
    address: '0.0.0.0',
    port: 3000
};

if (process.env.EMBA_TEST_HOST === "dragonegg") {
    proxyServer = {
        protocol: 'https',
        address: '172.16.0.12',
        port: null
    }
}

let options = {
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../../uploads', path.sep),
    dataUrl: '/data',
    proxyServer: proxyServer,
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        prerender: {
            usePrerender: false,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 14 * 24 * 60 * 60,
            url: 'http://127.0.0.1:8000'
        }
    },
    dbProvider: 'mssql',
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    connections: {
        redis: {
            host: "dragonegg",
            port: 6379,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
        mssql: {
            host: 'dragonegg',
            port: 1435,
            username: 'sa',
            database: 'mag_admin',
            connection_options: { requestTimeout: 0 },
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 60000
            }
        },
        mysql: {
            host: 'dragonegg',
            username: 'sa',
            database: 'mag_admin',
            connection_options: {},
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 60000
            }
        }
    }
};

module.exports = options;