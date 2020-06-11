const path = require('path');
const os = require('os');
const defer = require('config/defer').deferConfig;
const pk = require('../../keys');

module.exports = {
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    proxyServer: {
        protocol: 'https',
        address: 'magisteria.ru',
        port: null
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        publicEnabled: true,
        adminEnabled: false,
        pushNotifications: true,
        prerender: {
            usePrerender: true,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 1 * 24 * 60 * 60,
            maxDevSec: 1 * 24 * 60 * 60,
            url: 'http://127.0.0.1:8000',
            logRequest: false
        },
    },
    admin: {
        logFileUpload: false,
        logModif: false
    },
    dbProvider: 'mysql',
    integration: {
        carrotquest: {
            userAuthKey: pk.integration && pk.integration.carrotquest
                && pk.integration.carrotquest.userAuthKey ? pk.integration.carrotquest.userAuthKey : null
        }
    },
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
        debug: false,
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
    statistics: {
        srcList: ["fb", "vk", "ya", "gl", "cq", "mt"],
        serverTimeout: 60 * 9, // 9 min
        clientTimeout: 60 * 10, // 10 min
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
        },
        strikePromo: {
            prefix: "STP",
            key: "STRIKE_PROMO",
            values: [
                { value: 25, descr: "При покупке следующего курса в течение 2 дней Вы получите скидку 25% по промокоду" },
                { value: 30, descr: "Если Вы приобретете еще один курс в течение 48 часов, то получите скидку 30% по промокоду" },
                { value: 35, descr: "На очередной курс, приобретенный сегодня или завтра Вы получаете скидку 35% по промокоду" },
                { value: 40, descr: "Теперь Вы получите скидку 40%, если купите один из курсов Магистерии не позднее завтрашнего вечера - используйте промокод" },
                { value: 45, descr: "А теперь скидка выросла еще на 5%. Купите в течение 2 дней еще 1 курс с дисконтом 45% по промокоду" },
                { value: 50, descr: "Вы достигли суперскидки и можете купить любой наш курс в 2 раза дешевле, используйте для этого ограниченный по времени (2 суток) промокод" },
            ],
            durationInHours: 49
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
            recipients: 'alexander.f.sokolov@gmail.com,ivan@magisteria.ru,adm@magisteria.ru',
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
            subject: "Регистрация на \"Magisteria.Ru\".",
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
            subject: "Восстановление пароля на \"Magisteria.Ru\".",
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
        },
        promoCourse: {
            type: "smtp",
            template: "./templates/mail/promo-course.tmpl",
            subject: "Промокод на активацию курса \"<%= course %>\".",
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
        },
        purchaseCourse: {
            type: "smtp",
            subject: "Вы приобрели курс \"<%= course %>\".",
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
        },
        userWelcome: {
            type: "sendpulse",
            subject: "Добро пожаловать на Магистерию!",
            sender: '"Magisteria" <adm@magisteria.ru>'
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
            apiVersion: '5.107',
            redirectURL: { success: '/', error: '/auth/error' },
            callBack: '/api/vk/oauth',
            passportOptions: {
                display: 'popup',
                scope: ['status', 'email', 'friends']
            }
        }
    },
    search: {
        baseURL: "https://magisteria.ru",
        keep_up_to_date: false
    },
    connections: {
        elastic: {
            connection_options: {
                node: 'http://localhost:9200',
                log: 'trace'
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
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
