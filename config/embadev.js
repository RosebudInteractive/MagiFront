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
    root: process.cwd(),
    uccelloDir: path.join(__dirname, '../../Uccello2'),
    uploadPath: path.join(process.cwd(), path.sep, '../uploads', path.sep),
    proxyServer: proxyServer,
    server: {
        protocol: 'http',
        address: '0.0.0.0',
        port: 3000,
        publicEnabled: true,
        adminEnabled: true,
        prerender: {
            usePrerender: true,
            useRedis: true,
            redisPrefix: "pg:",
            expInSec: 14 * 24 * 60 * 60,
            maxDevSec: 14 * 24 * 60 * 60,
            url: 'http://127.0.0.1:8000', //null
            logRequest: true
        }
    },
    client: {
        devHotReload: false
    },
    admin: {
        logFileUpload: true,
        logModif: true
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
        saveUninitialized: false,
        logCampaign: true
    },
    redisSession: {
        enabled: true,
        prefix: 'ses:',
        scanCount: 100
    },
    lessonPositions: {
        debug: true,
        storage: 'redis',// 'redis' or 'local' (not applicable for cluster mode)
        keyPrefix: 'lpos:uid:',
        keyHistPrefix: 'lhist:',
        histTTL: 1 * 24 * 60 * 60, // 1 day
        maxIdle: 1 * 60, // 1 min
        maxInterval: 5 * 60 // 3 min
    },
    debug: {
        routes: {
            "set-user-subscription": true
        }
    },
    general: {
        paid_truncate: { length: 30, inPerc: true, reserveLastWord: 25 }
    },
    statistics: {
        srcList: ["fb", "vk", "ya", "gl", "cq", "mt"],
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
        secret: 'zxcvv8708xulsajfois23h32',
        storage: 'redis'// Also can be 'local' (not applicable for cluster mode)
    },
    mail: {
        autosubscribe: {
            enabled: true,
            mailList: "Магистерия"
        },
        feedback: {
            type: "test",//"smtp"
            template: "./templates/mail/feedback.tmpl",
            subject: "Предложение от \"<%= sender %>\", ( <%= dt %> ).",
            sender: '"Magisteria" <' + process.env.YANDEX_USER + '@yandex.ru>',
            recipients: process.env.YANDEX_USER + '@yandex.ru',
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
        sendPulse: {
            apiUserId: "1d64cc29ab7ee05f1b339b4e981ec88f",
            apiSecret: "2593d02228f842c412e51d24de824dde",
            tmpPath: path.join(os.tmpdir(), path.sep),
        },
        mailing: {
            newCourse: {
                addressBook: "Магистерия",
                sender: "test@magisteria.ru",
                senderName: "Magisteria.ru",
                host: null
            }            
        },
        userReg: {
            type: "test",//"smtp",
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
            type: "test",//"smtp",
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
        },
        promoCourse: {
            type: "test",
            template: "./templates/mail/promo-course.tmpl",
            subject: "Промокод на активацию курса \"<%= course %>\".",
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
        },
        purchaseCourse: {
            type: "test",
            subject: "Вы приобрели курс \"<%= course %>\".",
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
    pricelist: {
        fb: {
            path: path.normalize(path.join(process.cwd(), "..", "pricelist", "fb")),
            file: "products.tsv",
            baseUrl: "https://magisteria.ru"
        }
    },
    search: {
        // baseURL: "https://magisteria.ru"
        keep_up_to_date: true
    },
    connections: {
        elastic: {
            connection_options: {
                node: 'http://dragonegg:9200',
                // node: 'http://10.1.0.35:9200',
                log: 'trace'
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
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

// if (process.env.EMBA_TEST_HOST !== "dragonegg") {
//     options.snets= {
//         facebook: {
//             appId: '1584514044907807',
//             appSecret: 'f0f14ef63e0c6b9ec549b9b15f63a808',
//             callBack: '/oauth/facebook',
//             profileURL: 'https://graph.facebook.com/v2.12/me',
//             // profileFields: ['id', 'about', 'email', 'gender', 'name', 'photos', 'address', 'birthday', 'hometown', 'link'],
//             profileFields: ['id', 'about', 'email', 'name', 'photos'],
//             passportOptions: {
//                 display: 'popup',
//                 scope: ['email', 'public_profile'] // don't require application review
//                 // scope: ['email', 'user_about_me', 'user_birthday', 'user_hometown']
//             }
//         }
//     }
// };

module.exports = options;