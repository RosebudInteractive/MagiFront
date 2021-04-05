const path = require('path');
const os = require('os');
const defer = require('config/defer').deferConfig;
const pk = require('/app/keys');

const uploadPath = '/app/uploads';
const dockerHostIP = '172.17.0.1';

module.exports = {
    root: process.cwd(),
    uploadPath: path.join(uploadPath, path.sep),
    proxyServer: {
        protocol: 'https',
        address: 'new.magisteria.ru',
        port: null
    },
    mobileApp: {
        ios: {
            showPaidFor: "1.0.6"
        },
        android: {

        }
    },
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        publicEnabled: true,
        adminEnabled: true,
        pushNotifications: true,
        corsEnabled: true,
        prerender: {
            usePrerender: true,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 1 * 24 * 60 * 60,
            maxDevSec: 1 * 24 * 60 * 60,
            url: `http://${dockerHostIP}:8000`,
            logRequest: true
        },
    },
    admin: {
        logFileUpload: true,
        logModif: true
    },
    dbProvider: 'mysql',
    session: {
        name: 'magisteria.sid',
        secret: 'vdsadfrwer46546fdgrtj',
        resave: false,
        saveUninitialized: false,
        logCampaign: true
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
        debug: true,
        storage: 'redis',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:',
        keyHistPrefix: 'lhist:',
        histTTL: 30 * 24 * 60 * 60, // 30 days
        maxIdle: 10 * 60, // 10 min
        maxInterval: 1 * 60 * 60 // 1 hour
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
            testrecovery: true
        }
    },
    general: {
        paid_truncate: { length: 30, inPerc: true, reserveLastWord: 25 }
    },
    statistics: {
        srcList: ["fb", "vk", "ya", "gl", "mt"],
        serverTimeout: 30, // 30 sec
        clientTimeout: 60, // 60 sec
    },
    billing: {
        module: "./yandex-kassa",
        enabled: true,
        debug: true,
        billing_test: false,
        self_refund: true,
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
        strikePromo: {
            prefix: "STP",
            key: "STRIKE_PROMO",
            values: [
                { value: 20, descr: "При покупке следующего курса в течение 2 дней Вы получите скидку 20% по промокоду" },
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
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis',// 'redis' or  'local' (not applicable for cluster mode)
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
        feedback: {
            type: "smtp",
            template: "./templates/mail/feedback.tmpl",
            subject: "Предложение от \"<%= sender %>\", ( <%= dt %> ).",
            sender: '"Magisteria" <test@magisteria.ru>',
            recipients: 'test@magisteria.ru',
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
        sendPulse: {
            apiUserId: "1d64cc29ab7ee05f1b339b4e981ec88f",
            apiSecret: "2593d02228f842c412e51d24de824dde",
            scriptPath: "//cdn.sendpulse.com/js/push/700d4d64866e5acf0b24dfead24eac1d_1.js",
            tmpPath: path.join(os.tmpdir(), path.sep),
        },
        mailing: {
            newCourse: {
                addressBook: "Магистерия",
                sender: "test@magisteria.ru",
                senderName: "Magisteria.ru",
                host: "https://new.magisteria.ru"
            }
        },
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
        },
        promoCourse: {
            type: "smtp",
            template: "./templates/mail/promo-course.tmpl",
            subject: "Промокод на активацию курса \"<%= course %>\".",
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
        purchaseCourse: {
            type: "smtp",
            subject: "Вы приобрели курс \"<%= course %>\".",
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
            appId: '902617006551-8ujt3v40c9js88cllafccbuhop4qjg3l.apps.googleusercontent.com',
            appSecret: 'xOnkj8eFwydDegfbY6lmgzrC',
            // appId: '504142380752-pci0l3pues6v9kfsi9pkcqg5e8ohi5js.apps.googleusercontent.com',
            // appSecret: 'DY1WmSp__2xXW3Ew1zDV_-UR',
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
                node: `http://${dockerHostIP}:9200`,
                log: 'trace'
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
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
            username: 'magisteria',
            password: 'ukko89QH',
            database: 'magisteria',
            connection_options: {},
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 60000
            }
        }
    },
    mobileApp: {
        ios: {
            apiKeyId: pk.mobileApp && pk.mobileApp.ios && pk.mobileApp.ios.apiKeyId ? pk.mobileApp.ios.apiKeyId : undefined,
            issuerId: pk.mobileApp && pk.mobileApp.ios && pk.mobileApp.ios.issuerId ? pk.mobileApp.ios.issuerId : undefined,
            pkPath: pk.mobileApp && pk.mobileApp.ios && pk.mobileApp.ios.pkPath ? pk.mobileApp.ios.pkPath : undefined,
            inApps: pk.mobileApp && pk.mobileApp.ios && pk.mobileApp.ios.inApps ? pk.mobileApp.ios.inApps : undefined,
            template: pk.mobileApp && pk.mobileApp.ios && pk.mobileApp.ios.template ? pk.mobileApp.ios.template : undefined
        }
    }
};
