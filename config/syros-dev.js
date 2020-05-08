const path = require('path');
const defer = require('config/defer').deferConfig;
const os = require('os');

module.exports = {
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    proxyServer: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000
    },
    billing: {
        module: "./yandex-kassa",
        enabled: true,
        debug: true,
        billing_test: false,
        self_refund: true,
        mode: { courses: true, subscription: false },
        subsExtPeriod: 6, // free period after subscription has expired in HOURS
        yandexKassa: {
            shopId: "536331",
            secretKey: "test_iQPErgDbxTKcp1f3LqzgTjjz2by-Xavob1ZRX07QQOw",
            callBack: "/api/yandex-kassa/callback",
            returnUrl: "/"
        },
        strikePromo: {
            prefix: "STP",
            key: "STRIKE_PROMO",
            values: [20, 30, 35, 40, 45, 50],
            durationInHours: 49
        }
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        corsEnabled: true,
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
        debug: true,
        storage: 'local',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:',
        keyHistPrefix: 'lhist:',
        histTTL: 30 * 24 * 60 * 60, // 30 days
        maxIdle: 10 * 60, // 10 min
        maxInterval: 1 * 60 * 60 // 1 hour
    },
    debug: {
        routes: {
            "set-user-subscription": true
        }
    },
    statistics: {
        srcList: ["fb", "vk", "ya", "gl", "cq", "mt"],
        serverTimeout: 30, // 30 sec
        clientTimeout: 60, // 60 sec
    },
    authentication: {
        enabled: true,
        useJWT: true,
        useCapture: true,
        appLoginUrl: "https://magisteria.ru",
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'local',// Use 'redis' for production! Also can be 'local' (not applicable for cluster mode)
        reCapture: {
            siteKey: "6Le8aHUUAAAAAE3d9H-9fqzTFE7flJkL0n3o08Mj",
            secretKey: "6Le8aHUUAAAAAHA_EPD2G0qwlG_tw31lWMIiU3il"
        }
    },
    mail: {
        autosubscribe: {
            enabled: true,
            mailList: "Магистерия"
        },
        sendPulse: {
            apiUserId: "1d64cc29ab7ee05f1b339b4e981ec88f",
            apiSecret: "2593d02228f842c412e51d24de824dde",
            tmpPath: path.join(os.tmpdir(), path.sep),
        },
        feedback: {
            type: "test",
            template: "./templates/mail/feedback.tmpl",
            subject: "Предложение от \"<%= sender %>\", ( <%= dt %> ).",
            sender: '"Magisteria" <administrator@magisteria.ru>',
            recipients: 'administrator@magisteria.ru'
        },
        userReg: {
            type: "test",
            template: "./templates/mail/registration.tmpl",
            subject: "Registration on \"Magisteria.Ru\".",
            sender: '"Magisteria" <administrator@magisteria.ru>'
        },
        pwdRecovery: {
            type: "test",
            template: "./templates/mail/pwd-recovery.tmpl",
            subject: "Password recovery on \"Magisteria.Ru\".",
            sender: '"Magisteria" <administrator@magisteria.ru>'
        }
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
        redis: null,
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
