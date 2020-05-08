const path = require('path');
const defer = require('config/defer').deferConfig;

const SESSION_MAX_AGE = 20 * 24 * 3600 * 1000; // 20 days
const SESSION_UPD_TIME = 1 * 3600 * 1000; // 1 hour

module.exports = {
    root: process.cwd(),
    uccelloDir: path.join(__dirname, '../../Uccello2'),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    dataUrl: '/data',
    oldDataUrl: '/wp-content/uploads',
    downLoadUrl: '/_dwld_',
    courseUrl: '/category',
    authorUrl: '/autor',
    categoryUrl: '/razdel',
    testUrl: '/test',
    testInstUrl: '/test-instance',
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
            url: 'http://127.0.0.1:8000',
            logRequest: false
        },
        siteHost: defer(function () {
            return this.server.protocol + '://' +
                (this.server.address === '0.0.0.0' ? 'localhost' : this.server.address) +
                (this.server.port ? (':' + this.server.port) : '');
        })
    },
    client: {
        devHotReload: true  
    },
    admin: {
        logFileUpload: false,
        logModif: false
    },
    dbProvider: 'mysql',
    integration: {
        carrotquest: {
            userAuthKey: "carrotquest-test-userAuthKey"
        }
    },
    session: {
        name: 'magisteria.sid',
        secret: 'vdsadfrwer46546fdgrtj',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: SESSION_MAX_AGE
        },
        appSettings: {
            updPeriod: SESSION_UPD_TIME
        },
        logCampaign: false
    },
    redisSession: {
        enabled: false,
        prefix: 'ses:',
        scanCount: 100,
        maxAge: SESSION_MAX_AGE,
        updPeriod: SESSION_UPD_TIME
    },
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    lessonPositions: {
        debug: false,
        storage: 'local',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:',
        keyHistPrefix: 'lhist:',
        histTTL: 30 * 24 * 60 * 60, // 30 days
        maxIdle: 10 * 60, // 10 min
        maxInterval: 1 * 60 * 60 // 1 hour
    },
    debug: {
        clientTrace: {
            gtm: true  
        },
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
            testrecovery: true
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
    knowledge_testing: {
        previewUrl: "/test-result-preview",
        imgDir: "tests",
        imgUrl: "tests",
        images: {
            og: {
                imageType: "jpeg",
                width: 1200,
                height: 630
            },
            // twitter: {
            //     imageType: "jpeg",
            //     width: 1008,
            //     height: 530
            // }
        }
    },
    billing: {
        module: "./yandex-kassa",
        enabled: false,
        debug: false,
        billing_test: true,
        self_refund: false,
        mode: { courses: true, subscription: false },
        subsExtPeriod: 6, // free period after suscription has expired in HOURS
        yandexKassa: {
            shopId: "536331",
            secretKey: "test_iQPErgDbxTKcp1f3LqzgTjjz2by-Xavob1ZRX07QQOw",
            callBack: "/api/yandex-kassa/callback",
            trace_callback: true,
            returnUrl: "/",
            payment_mode: "full_payment",
            chequePendingPeriod: 60 * 60 // cheque pending period in sec - 60 min
        },
        productReqParams: {
            TypeCode: "SUBS",
            Detail: "true",
            Discontinued: "0"
        },
        strikePromo: {
            prefix: "STP",
            key: "STRIKE_PROMO",
            values: [20, 30, 35, 40, 45, 50],
            durationInHours: 49
        }
    },
    partnership: {
        "www.ozon.ru": {
            "partner": "magisteria",
            "utm_content": "link"
        },
        "www.labirint.ru": {
            "p": "27672"
        }
    },
    authentication: {
        enabled: false,
        useJWT: false,
        useCapture: true,
        saltRounds: 10,
        appLoginUrl: "magisteria://signin",
        activationRoute: "/activation-confirm",
        recoveryRoute: "/recovery",
        redirectParam: "redirect",
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis',// 'redis' or  'local' (not applicable for cluster mode)
        tokenExpTime: SESSION_MAX_AGE,
        tokenUpdTime: SESSION_UPD_TIME,
        reCapture: {
            siteKey: "6Le8aHUUAAAAAE3d9H-9fqzTFE7flJkL0n3o08Mj",
            secretKey: "6Le8aHUUAAAAAHA_EPD2G0qwlG_tw31lWMIiU3il"
        },
        googleAppId: "AIzaSyAcqC46EVwt7voascHI5j9CrGVbeiiwgVQ",
        appleMobileAppAud: "ru.magisteria.Magisteria.dev"
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
        },
        promoCourse: {
            type: "test",
            template: "./templates/mail/promo-course.tmpl",
            subject: "Промокод на активацию курса \"<%= course %>\".",
            sender: '"Magisteria" <administrator@magisteria.ru>'
        },
        purchaseCourse: {
            type: "test",
            subject: "Вы приобрели курс \"<%= course %>\".",
            sender: '"Magisteria" <administrator@magisteria.ru>'
        }
    },
    snets: {
        facebook: {
            appId: '591000364592228',
            appSecret: '386e5c11ab88a43c5c96b7df69c9e06d',
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
    pricelist: {
        fb: {
            path: path.normalize(path.join(process.cwd(), "..", "pricelist", "fb")),
            file: "products.tsv",
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
            connection_options: { requestTimeout: 0, useUTC: false },
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
