const path = require('path');
const os = require('os');
const defer = require('config/defer').deferConfig;
const pk = require('/app/keys');

const notifProvider = pk.notifications && pk.notifications.provider ? pk.notifications.provider : undefined;
const notifProviderOpts = notifProvider ? pk.notifications[notifProvider] : undefined;

const feedPath = '/app/feed';
const uploadPath = '/app/uploads';
const pricelistPath = '/app/pricelist';
const siteMapsPath = path.normalize('/app/sitemaps');
const dockerHostIP = '172.17.0.1';

module.exports = {
    tasks: [
        {
            name: "Push notifications",
            module: "./notification",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 2,22,42 * * * *", // run every 20 min
            options: {}
        },
        {
            name: "Price List update",
            module: "./price-list",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 56 * * * *", // run every hour
            options: {
                fb: {
                    path: path.normalize(path.join(pricelistPath, "fb")),
                    file: "products.tsv",
                    baseUrl: "https://magisteria.ru"
                }
            }
        },
        {
            name: "Receipt collection",
            module: "./receipt-collection",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 44 0,2,4,6,8,10,12,14,16,18,20,22 * * *", // run every 2 hours
            options: {
                maxRecNum: 100,
                maxTrial: 24,
                startDate: "2020-04-30 00:00:00"
            }
        },
        {
            name: "Listening history import",
            module: "./lsn-history",
            type: "scheduled-task",
            disabled: false,
            // schedule: "0 33 1 * * *", // run at 01:33
            schedule: "0 27 * * * *", // run every hour
            options: {
                maxInsertNum: 10,
                completion: {
                    maxInsertNum: 20,
                    limit: 10000,
                    coeff: 0.95,
                },
                logStat: true
            }
        },
        {
            name: "Auto Subscription",
            module: "./auto-subscription",
            type: "scheduled-task",
            disabled: true,
            schedule: "0 */30 * * * *", // run every 30 min
            options: {
                autoPay: false,
                checkExpire: false,
                checkExpirePeriods: [1, 3],
                priceListCode: "MAIN",
                errRecipients: "alexander.f.sokolov@gmail.com, sokolov-af@yandex.ru"
            }
        },
        {
            name: "Mailing",
            module: "./mailing",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 57 9 * * mon", // run at 9:57 on monday
            // schedule: "33 11 10,19 * * *", // run twice a day
            options: {
                host: "https://magisteria.ru",
                period: "week",
                sender: "sys@magisteria.ru",
                senderName: "Magisteria.ru",
                mailList: "Магистерия",
                infoRecipients: "alexander.f.sokolov@gmail.com, sokolov-af@yandex.ru",
                errRecipients: "alexander.f.sokolov@gmail.com, sokolov-af@yandex.ru"
            }
        },
        {
            name: "Prerender",
            module: "./prerender",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 3 1,7,13,19 * * *", // run every 6 hours
            options: {
                renderCache: {
                    host: "https://magisteria.ru"
                },
                path: siteMapsPath,
                mapFiles: ["category-sitemap.xml", "post-sitemap.xml", "author-sitemap.xml", "page-sitemap.xml", "razdel-sitemap.xml"],
                maxLinksLimit: 500,
                renderPermanent: true,
                maxAgeSec: 0, // max link age
                minTimeToExpInSec: 6 * 60 * 60, // render if TTL < minTimeToExpInSec
                renderDelay: 10 * 1000 // render request delay in ms
            }
        },
        {
            name: "5 TOP Share Counters Update",
            module: "./sn-counters",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 37 * * * *", // run every hour
            options: {
                baseUrl: "https://magisteria.ru",
                snets: ["facebook", "vkontakte", "odnoklassniki"],
                urlDelay: 0,
                offset: 0,
                maxUrls: 5,
                snPrefs: {
                    facebook: {
                        usageLimitPerc: 90,
                        repairTime: 65 * 60 * 1000,
                        minDelay: 1 * 1000
                    }
                }
            }
        },
        {
            name: "500 LAST Share Counters Update",
            module: "./sn-counters",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 33 23 * * *", // run at 23:33
            options: {
                baseUrl: "https://magisteria.ru",
                snets: ["facebook", "vkontakte", "odnoklassniki"],
                urlDelay: 0,
                offset: 5,
                maxUrls: 500,
                snPrefs: {
                    facebook: {
                        usageLimitPerc: 90,
                        repairTime: 65 * 60 * 1000,
                        minDelay: 30 * 1000
                    }
                }
            }
        },
        {
            name: "RSS Generation",
            module: "./rss",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 5,15,25,35,45,55 * * * *", // run every 10 min
            options: {
                path: path.normalize(feedPath),
                host: "https://magisteria.ru",
                channels: {
                    'yandex-zen': {
                        enabled: true
                    },
                    'rss': {
                        enabled: true
                    }
                }
            }
        },
        {
            name: "Sitemap Generation",
            module: "./site-map",
            type: "scheduled-task",
            disabled: false,
            schedule: "0 */10 * * * *", // run every 10 min
            options: {
                path: siteMapsPath,
                host: "https://magisteria.ru",
                xslUrl: "/main-sitemap.xsl",
                maps: {
                    lesson: {
                        firstTranscriptDate: "2018-06-07"
                    },
                    page: {
                        firstAboutDate: "2018-11-15"
                    }
                }
            }
        }
    ],
    root: process.cwd(),
    uploadPath: path.join(uploadPath, path.sep),
    dataUrl: '/data',
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
        adminEnabled: true,
        pushNotifications: false,
        prerender: {
            usePrerender: false,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 1 * 24 * 60 * 60,
            maxDevSec: 1 * 24 * 60 * 60,
            targetHost: "https://magisteria.ru",
            url: `http://${dockerHostIP}:8000`,
            logRequest: false
        }
    },
    dbProvider: 'mysql',
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
    general: {
        paid_truncate: { length: 30, inPerc: true, reserveLastWord: 25 }
    },
    billing: {
        module: "../../services/billing/yandex-kassa",
        enabled: true,
        debug: false,
        billing_test: false,
        subsExtPeriod: 6, // free period after suscription has expired in HOURS
        yandexKassa: {
            shopId: pk.billing.yandexKassa.shopId,
            secretKey: pk.billing.yandexKassa.secretKey,
            callBack: "/api/yandex-kassa/callback",
            returnUrl: "/",
            payment_mode: "full_payment",
            chequePendingPeriod: 60 * 60 // cheque pending period in sec - 60 min
        }
    },
    authentication: {
        googleAppId: pk.authentication.googleAppId
    },
    debug: {
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
    mail: {
        sendPulse: {
            apiUserId: pk.mail.sendPulse.apiUserId,
            apiSecret: pk.mail.sendPulse.apiSecret,
            scriptPath: pk.mail.sendPulse.scriptPath,
            tmpPath: path.join(os.tmpdir(), path.sep)
        },
        mailing: {
            type: "smtp",
            sender: pk.mail.mailing.sender,
            options: {
                disableUrlAccess: false,
                host: "smtp.yandex.ru",
                port: 465,//587
                secure: true, // true for 465, false for other ports
                auth: {
                    user: pk.mail.mailing.user,
                    pass: pk.mail.mailing.pass
                }
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
            apiVersion: '5.131',
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
            host: `${dockerHostIP}`,
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
            host: `${dockerHostIP}`,
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
    },
    notifications: {
        provider: notifProvider,
        accessKeyId: notifProviderOpts && notifProviderOpts.accessKeyId ? notifProviderOpts.accessKeyId : undefined,
        secretAccessKey: notifProviderOpts && notifProviderOpts.secretAccessKey ? notifProviderOpts.secretAccessKey : undefined,
        region: notifProviderOpts && notifProviderOpts.region ? notifProviderOpts.region : undefined,
        platformApp: notifProviderOpts && notifProviderOpts.platformApp ? notifProviderOpts.platformApp : undefined,
        providerLogs: notifProviderOpts && notifProviderOpts.logs ? notifProviderOpts.logs : undefined
    }
};
