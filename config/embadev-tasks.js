const path = require('path');
const os = require('os');
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
    tasks: [
        {
            name: "Mailing",
            module: "./mailing",
            type: "scheduled-task",
            disabled: false,
            // schedule: "0 35 5 * * mon", // run at 5:35 on monday
            schedule: "*/10 * * * * *", // run every 10 sec
            options: {
                testUrl: "https://new.magisteria.ru",
                first_date: "2018-3-1",
                period: "week",
                sender: "test@magisteria.ru",
                senderName: "Magisteria.ru",
                mailList: "Магистерия",
                infoRecipients: "vadym.zobnin@gmail.com, vadym.zobnin@yandex.ru",
                errRecipients: "vadym.zobnin@gmail.com, vadym.zobnin@yandex.ru"
            }
        },
        {
            name: "Prerender",
            module: "./prerender",
            type: "scheduled-task",
            disabled: true,
            schedule: "*/10 * * * * *", // run every 10 sec
            options: {
                path: path.normalize(path.join(process.cwd(), "..", "..", "sitemaps")),
                mapFiles: ["category-sitemap.xml", "post-sitemap.xml", "author-sitemap.xml", "page-sitemap.xml"],
                maxLinksLimit: 10,
                maxAgeSec: 365 * 24 * 60 * 60, // max link age
                renderDelay: 5 * 1000 // render request delay in ms
            }
        },
        {
            name: "Share Counters Update",
            module: "./sn-counters",
            type: "scheduled-task",
            disabled: true,
            // schedule: "0/30 * * * * *", // run every 30 sec
            schedule: "0 42 16 * * *", // run at 10:00
            options: {
                baseUrl: "https://magisteria.ru",
                snets: ["facebook", "vkontakte", "odnoklassniki"],
                urlDelay: 0,
                offset: 0,
                maxUrls: 1000,
                snPrefs: {
                    facebook: {
                        usageLimitPerc: 90,
                        repairTime: 65 * 60 * 1000,
                        minDelay: 30 * 1000                    }
                }
            }
        },
        {
            name: "RSS Generation",
            module: "./rss",
            type: "scheduled-task",
            disabled: true,
            schedule: "5,15,25,35,45,55 * * * * *", // run every 10 sec
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
            disabled: true,
            schedule: "*/10 * * * * *", // run every 10 sec
            options: {
                path: path.normalize(path.join(process.cwd(), "..", "..", "sitemaps")),
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
    proxyServer: proxyServer,
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        prerender: {
            usePrerender: false,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 14 * 24 * 60 * 60,
            url: 'http://127.0.0.1:8000'
        }
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
        useCapture: true,
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis'// Also can be 'local' (not applicable for cluster mode)
    },
    mail: {
        sendPulse: {
            apiUserId: "1d64cc29ab7ee05f1b339b4e981ec88f",
            apiSecret: "2593d02228f842c412e51d24de824dde",
            tmpPath: path.join(os.tmpdir(), path.sep),
        },
        mailing: {
            type: "test",//"smtp",
            sender: '"Magisteria.ru" <' + process.env.GMAIL_USER + '@gmail.com>',
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
        },
        userReg: {
            type: "test",//,"smtp"
            template: "./templates/mail/registration.tmpl",
            subject: "Registration on \"Magisteria.Ru\".",
            sender: '"Magisteria.ru" <' + process.env.YANDEX_USER + '@yandex.ru>',
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
            type: "test",//"smtp",
            template: "./templates/mail/pwd-recovery.tmpl",
            subject: "Password recovery on \"Magisteria.Ru\".",
            sender: '"Magisteria.ru" <' + process.env.GMAIL_USER + '@gmail.com>',
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
            // profileFields: ['id', 'about', 'email', 'gender', 'name', 'photos', 'address', 'birthday', 'hometown', 'link'],
            profileFields: ['id', 'about', 'email', 'name', 'photos'],
            passportOptions: {
                display: 'popup',
                scope: ['email', 'public_profile'] // don't require application review
                // scope: ['email', 'user_about_me', 'user_birthday', 'user_hometown']
            }
        }
    }
};

module.exports = options;