const path = require('path');
const os = require('os');
const defer = require('config/defer').deferConfig;

const siteMapsPath = path.normalize(path.join(process.cwd(), "..", "..", "sitemaps"));

module.exports = {
    tasks: [
        {
            name: "Auto Subscription",
            module: "./auto-subscription",
            type: "scheduled-task",
            disabled: false,
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
            // schedule: "0 35 5 * * mon", // run at 5:35 on monday
            schedule: "33 0 11,20 * * *", // run twice a day
            options: {
                period: "week",
                sender: "test@magisteria.ru",
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
                path: siteMapsPath,
                mapFiles: ["category-sitemap.xml", "post-sitemap.xml", "author-sitemap.xml", "page-sitemap.xml"],
                maxLinksLimit: 100,
                maxAgeSec: 365 * 24 * 60 * 60, // max link age
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
            schedule: "0 33 19 * * *", // run at 19:33
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
                path: path.normalize(path.join(process.cwd(), "..", "..", "feed")),
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
                xslUrl: "/main-sitemap.xsl",
                maps: {
                    lesson: {
                        firstTranscriptDate: "2018-06-07"
                    },
                    page: {
                        firstAboutDate: "2018-06-05"
                    }
                }
            }
        }
    ],
    root: process.cwd(),
    uploadPath: path.join(process.cwd(), path.sep, '../../uploads', path.sep),
    dataUrl: '/data',
    proxyServer: {
        protocol: 'https',
        address: 'magisteria.ru',
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
            usePrerender: false,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 14 * 24 * 60 * 60,
            maxDevSec: 14 * 24 * 60 * 60,
            url: 'http://127.0.0.1:8000'
        }
    },
    dbProvider: 'mysql',
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    lessonPositions: {
        storage: 'redis',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:'
    },
    billing: {
        module: "../../services/billing/yandex-kassa",
        enabled: true,
        debug: false,
        subsExtPeriod: 6, // free period after suscription has expired in HOURS
        yandexKassa: {
            shopId: "536331",
            secretKey: "test_iQPErgDbxTKcp1f3LqzgTjjz2by-Xavob1ZRX07QQOw",
            callBack: "/api/yandex-kassa/callback",
            returnUrl: "/"
        }
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
            apiUserId: "1d64cc29ab7ee05f1b339b4e981ec88f",
            apiSecret: "2593d02228f842c412e51d24de824dde",
            tmpPath: path.join(os.tmpdir(), path.sep),
            scriptPath: "//cdn.sendpulse.com/js/push/700d4d64866e5acf0b24dfead24eac1d_1.js",
        },
        mailing: {
            type: "smtp",
            sender: '"Magisteria.ru" <test@magisteria.ru>',
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
        userReg: {
            type: "smtp",
            template: "./templates/mail/registration.tmpl",
            subject: "Registration on \"Magisteria.Ru\".",
            sender: '"Magisteria.ru" <test@magisteria.ru>',
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
            sender: '"Magisteria.ru" <test@magisteria.ru>',
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
            username: 'mag2',
            password: 'AV5mvwe1',
            database: 'new_magisteria',
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
