const path = require('path');
const defer = require('config/defer').deferConfig;

module.exports = {
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    proxyServer: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000
    },
    dbProvider: 'mssql',
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
    lessonPositions: {
        storage: 'local',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:'
    },
    authentication: {
        enabled: false,
        useJWT: false,
        useCapture: true,
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'local'// Use 'redis' for production! Also can be 'local' (not applicable for cluster mode)
    },
    snets: {
        facebook: {
            appId: '1584514044907807',
            appSecret: 'f0f14ef63e0c6b9ec549b9b15f63a808',
            callBack: '/oauth/facebook',
            profileURL: 'https://graph.facebook.com/v2.12/me',
            profileFields: ['id', 'about', 'email', 'gender', 'name', 'photos', 'address', 'birthday', 'hometown', 'link'],
            passportOptions: {
                display: 'popup',
                scope: ['email', 'public_profile'] // don't require application review
                // scope: ['email', 'user_about_me', 'user_birthday', 'user_hometown']
            }
        }
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
        mssql: {
            host: 'localhost',
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
            host: 'localhost',
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
