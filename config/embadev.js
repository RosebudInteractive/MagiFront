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
        useCapture: false,
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis'// Also can be 'local' (not applicable for cluster mode)
    },
    mail: {
        userReg: {
            type: "smtp",
            template: "./templates/mail/registration.tmpl",
            subject: "Registration on \"Magisteria.Ru\".",
            sender: '"Magisteria" <' + process.env.YANDEX_USER + '@yandex.ru>',
            options: {
                disableUrlAccess: false,
                host: process.env.YANDEX_SMTP_HOST,
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.YANDEX_USER,
                    pass: process.env.YANDEX_PWD
                }
            }
        },
        pwdRecovery: {
            type: "smtp",
            template: "./templates/mail/pwd-recovery.tmpl",
            subject: "Password recovery on \"Magisteria.Ru\".",
            sender: '"Magisteria" <' + process.env.GMAIL_USER + '@gmail.com>',
            options: {
                disableUrlAccess: false,
                host: process.env.GMAIL_SMTP_HOST,
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PWD
                }
            }
        }
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

// Ilia Kantor's APP 
// login: 'course.test.facebook@gmail.com',
// password: 'course-test-facebook'

if (process.env.EMBA_TEST_HOST !== "dragonegg") {
    options.snets= {
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
    }
};

module.exports = options;