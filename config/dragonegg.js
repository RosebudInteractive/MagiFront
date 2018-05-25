const path = require('path');
const defer = require('config/defer').deferConfig;

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
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    proxyServer: proxyServer,
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000
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
        enabled: true,
        prefix: 'ses:',
        scanCount: 100
    },
    lessonPositions: {
        storage: 'redis',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:'
    },
    authentication: {
        enabled: true,
        useJWT: true,
        useCapture: true,
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis'// Also can be 'local' (not applicable for cluster mode)
    },
    mail: {
        userReg: {
            type: "smtp",
            template: "./templates/mail/registration.tmpl",
            subject: "Registration on \"Magisteria.Ru\".",
            sender: '"Magisteria" <test@magisteria.ru>',
            options: {
                disableUrlAccess: false,
                host: "smtp.yandex.ru",
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: "test@magisteria.ru",
                    pass: "S4zf4ckK"
                }
            }
        },
        pwdRecovery: {
            type: "smtp",
            template: "./templates/mail/pwd-recovery.tmpl",
            subject: "Password recovery on \"Magisteria.Ru\".",
            sender: '"Magisteria" <test@magisteria.ru>',
            options: {
                disableUrlAccess: false,
                host: "smtp.yandex.ru",
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: "test@magisteria.ru",
                    pass: "S4zf4ckK"
                }
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

module.exports = options;