const path = require('path');
const defer = require('config/defer').deferConfig;

module.exports = {
    proxyServer: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 8090
    },
    dbProvider: 'mysql',
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    session: {
        name: 'magisteria.sid',
        secret: 'vdsadfrwer46546fdgrtj',
        resave: false,
        saveUninitialized: false
    },
    redisSession: {
        enabled: false,
        prefix: 'ses:',
        scanCount: 100
    },
    authentication: {
        enabled: false,
        useJWT: false,
        useCapture: true,
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis'// Also can be 'local' (not applicable for cluster mode)
    },
    connections: {
        redis: {
            host: "localhost",
            port: 6379,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
        mysql: {
            host: 'localhost',
            username: 'magadmin',
            password: 'magadmin12345',
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
