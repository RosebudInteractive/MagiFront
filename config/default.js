const path = require('path');
const defer = require('config/defer').deferConfig;

module.exports = {
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    dataUrl: '/data',
    courseUrl: '/category',
    authorUrl: '/autor',
    categoryUrl: '/razdel',
    proxyServer: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        siteHost: defer(function () {
            return this.proxyServer.protocol + '://' +
                (this.proxyServer.address === '0.0.0.0' ? 'localhost' : this.proxyServer.address) +
                (this.proxyServer.port ? (':' + this.proxyServer.port) : '');
        })
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        publicEnabled: true,
        adminEnabled: true,
        pushNotifications: false,
        corsEnabled: false,
        prerender: {
            usePrerender: false,
            useRedis: false,
            redisPrefix: "pg:",
            expInSec: 14 * 24 * 60 * 60,
            maxDevSec: 7 * 24 * 60 * 60,
            url: 'http://127.0.0.1:8000'
        },
        siteHost: defer(function () {
            return this.server.protocol + '://' +
                (this.server.address === '0.0.0.0' ? 'localhost' : this.server.address) + ':' +
                (this.server.port ? (':' + this.server.port) : '');
        })
    },
    dbProvider: 'mysql',
    session: {
        name: 'magisteria.sid',
        secret: 'vdsadfrwer46546fdgrtj',
        resave: false,
        saveUninitialized: false
    },
    redisSession: {
        enabled: false,
        prefix: 'ses:',
        scanCount: 100,
        maxAge: 4 * 24 * 3600 * 1000 // 4 days
    },
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    lessonPositions: {
        storage: 'local',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:'
    },
    debug: {
        routes: {
            "set-user-subscription": false,
            player: true,
            testupload: true,
            testimport: true,
            logintest: true,
            feedbacktest: true,
            paymenttest: true,
            regtest: true,
            pushtest: true,
            testrecovery: true        }
    },
    billing: {
        module: "./yandex-kassa",
        enabled: false,
        debug: false,
        subsExtPeriod: 6, // free period after suscription has expired in HOURS
        yandexKassa: {
            shopId: "536331",
            secretKey: "test_iQPErgDbxTKcp1f3LqzgTjjz2by-Xavob1ZRX07QQOw",
            callBack: "/api/yandex-kassa/callback",
            returnUrl: "/"
        }
    },
    authentication: {
        enabled: false,
        useJWT: false,
        useCapture: true,
        saltRounds: 10,
        activationRoute: "/activation-confirm",
        recoveryRoute: "/recovery",
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis',// 'redis' or  'local' (not applicable for cluster mode)
        reCapture: {
            siteKey: "6LfobE8UAAAAAMR-Sj4I2ZYe_N74atRFN5jqhk6t",
            secretKey: "6LfobE8UAAAAAOIpLL4jothsvn8IgogqdkM8ie0r"
        }
    },
    mail: {
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
            appId: '591000364592228',
            appSecret: '386e5c11ab88a43c5c96b7df69c9e06d',
            redirectURL: { success: '/', error: '/auth/error' },
            callBack: '/api/facebook/oauth',
            profileURL: 'https://graph.facebook.com/v2.12/me',
            // profileFields: ['id', 'about', 'email', 'gender', 'name', 'photos', 'address', 'birthday', 'hometown', 'link'],
            profileFields: ['id', 'about', 'email', 'name', 'photos'],
            passportOptions: {
                display: 'popup',
                scope: ['email', 'public_profile'] // don't require application review
                // scope: ['email', 'user_about_me', 'user_birthday', 'user_hometown']
            }
        },
        google: {
            appId: '504142380752-pci0l3pues6v9kfsi9pkcqg5e8ohi5js.apps.googleusercontent.com',
            appSecret: 'DY1WmSp__2xXW3Ew1zDV_-UR',
            redirectURL: { success: '/', error: '/auth/error' },
            callBack: '/api/google/oauth',
            // appId: '794235726914-7bkpl8nhtulqo4thna0kha48db611jg9.apps.googleusercontent.com',
            // appSecret: 'C28iY7NssUCe-yGgpS3wFSiW',
            // callBack: '/google/callback',
            passportOptions: {
                scope: ['profile', 'email']
            }
        },
        vk: {
            appId: '6400839',
            appSecret: 'LsrNgANtMnP0ofdT4dKB',
            profileFields: ['about', 'bdate', 'city', 'first_name', 'last_name', 'country'],
            apiVersion: '5.17',
            redirectURL: { success: '/', error: '/auth/error' },
            callBack: '/api/vk/oauth',
            passportOptions: {
                display: 'popup',
                scope: ['status', 'email', 'friends']
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
            password: 'system',
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
            password: 'system',
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
