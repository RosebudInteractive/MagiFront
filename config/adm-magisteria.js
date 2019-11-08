const path = require('path');
const os = require('os');
const defer = require('config/defer').deferConfig;
const pk = require('../../keys');

module.exports = {
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    proxyServer: {
        protocol: 'https',
        address: 'adm.magisteria.ru',
        port: 444
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        publicEnabled: true,
        adminEnabled: true,
        pushNotifications: false,
        prerender: {
            usePrerender: true,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 1 * 24 * 60 * 60,
            maxDevSec: 1 * 24 * 60 * 60,
            targetHost: "https://magisteria.ru",
            url: 'http://127.0.0.1:8000',
            logRequest: false
        },
    },
    admin: {
        logFileUpload: true,
        logModif: true
    },
    dbProvider: 'mysql',
    session: {
        name: 'magisteria.sid',
        secret: pk.session.secret,
        resave: false,
        saveUninitialized: false,
        logCampaign: false
    },
    redisSession: {
        enabled: true,
        prefix: 'ses:',
        scanCount: 100
    },
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    lessonPositions: {
        storage: 'redis',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:',
        keyHistPrefix: 'lhist:',
        histTTL: 10 * 24 * 60 * 60, // 10 days
        maxIdle: 10 * 60, // 10 min
        maxInterval: 1 * 60 * 60 // 1 hour
    },
    debug: {
        clientTrace: {
            gtm: false
        },
        routes: {
            "set-user-subscription": false,
            player: false,
            testupload: false,
            testimport: false,
            logintest: false,
            feedbacktest: false,
            paymenttest: false,
            regtest: false,
            pushtest: false,
            testrecovery: false
        }
    },
    general: {
        paid_truncate: { length: 30, inPerc: true, reserveLastWord: 25 }
    },
    billing: {
        module: "./yandex-kassa",
        enabled: true,
        debug: true,
        billing_test: false,
        mode: { courses: true, subscription: false },
        subsExtPeriod: 6, // free period after suscription has expired in HOURS
        yandexKassa: {
            shopId: pk.billing.yandexKassa.shopId,
            secretKey: pk.billing.yandexKassa.secretKey,
            callBack: "/api/yandex-kassa/callback",
            trace_callback: true,
            returnUrl: "/",
            payment_mode: "full_payment",
            chequePendingPeriod: 60 * 60 // cheque pending period in sec - 60 min
        }
    },
    authentication: {
        enabled: true,
        useJWT: true,
        useCapture: true,
        activationRoute: "/activation-confirm",
        recoveryRoute: "/recovery",
        secret: pk.authentication.secret,
        storage: 'redis',// 'redis' or  'local' (not applicable for cluster mode)
        reCapture: {
            siteKey: pk.authentication.reCapture.siteKey,
            secretKey: pk.authentication.reCapture.secretKey
        },
        googleAppId: pk.authentication.googleAppId
    },
    mail: {
        autosubscribe: {
            enabled: true,
            mailList: "Магистерия"
        },
        feedback: {
            type: "smtp",
            template: "./templates/mail/feedback.tmpl",
            subject: "Предложение от \"<%= sender %>\", ( <%= dt %> ).",
            sender: pk.mail.feedback.sender,
            recipients: 'alexander.f.sokolov@gmail.com,ivan@magisteria.ru',
            options: {
                disableUrlAccess: false,
                host: "smtp.yandex.ru",
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: pk.mail.feedback.user,
                    pass: pk.mail.feedback.pass
                }
            }
        },
        sendPulse: {
            apiUserId: pk.mail.sendPulse.apiUserId,
            apiSecret: pk.mail.sendPulse.apiSecret,
            scriptPath: pk.mail.sendPulse.scriptPath,
            tmpPath: path.join(os.tmpdir(), path.sep),
        },
        mailing: {
            newCourse: {
                addressBook: "Магистерия",
                sender: "sys@magisteria.ru",
                senderName: "Magisteria.ru",
                host: "https://magisteria.ru"
            }
        },
        userReg: {
            type: "smtp",
            template: "./templates/mail/registration.tmpl",
            subject: "Registration on \"Magisteria.Ru\".",
            sender: pk.mail.userReg.sender,
            options: {
                disableUrlAccess: false,
                host: "smtp.yandex.ru",
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: pk.mail.userReg.user,
                    pass: pk.mail.userReg.pass
                }
            }
        },
        pwdRecovery: {
            type: "smtp",
            template: "./templates/mail/pwd-recovery.tmpl",
            subject: "Password recovery on \"Magisteria.Ru\".",
            sender: pk.mail.pwdRecovery.sender,
            options: {
                disableUrlAccess: false,
                host: "smtp.yandex.ru",
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: pk.mail.pwdRecovery.user,
                    pass: pk.mail.pwdRecovery.pass
                }

            }
        }
    },
    snets: {
        facebook: {
            appId: pk.app.facebook.appId,
            appSecret: pk.app.facebook.appSecret,
            redirectURL: { success: '/', error: '/auth/error' },
            callBack: '/api/facebook/oauth',
            profileURL: 'https://graph.facebook.com/v5.0/me',
            // profileFields: ['id', 'about', 'email', 'gender', 'name', 'photos', 'address', 'birthday', 'hometown', 'link'],
            profileFields: ['id', 'about', 'email', 'name', 'photos'],
            passportOptions: {
                display: 'popup',
                scope: ['email', 'public_profile'] // don't require application review
                // scope: ['email', 'user_about_me', 'user_birthday', 'user_hometown']
            }
        },
        google: {
            appId: pk.app.google.appId,
            appSecret: pk.app.google.appSecret,
            redirectURL: { success: '/', error: '/auth/error' },
            callBack: '/api/google/oauth',
            passportOptions: {
                scope: ['profile', 'email']
            }
        },
        vk: {
            appId: pk.app.vk.appId,
            appSecret: pk.app.vk.appSecret,
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
    pricelist: {
        fb: {
            path: path.normalize(path.join(process.cwd(), "..", "pricelist", "fb")),
            file: "products.tsv",
            baseUrl: "https://magisteria.ru"
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
            username: pk.connections.mysql.username,
            password: pk.connections.mysql.password,
            database: pk.connections.mysql.database,
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
