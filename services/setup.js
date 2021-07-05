/**
 * Created by levan.kiknadze on 14/11/2017.
 */

const config = require('config');
const _ = require('lodash');
const log = require('../logger/log')(module);
//const exprLogger = require("express-logger");
const bodyParser  = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

const { HttpCode } = require("../const/http-codes");
const { HttpError } = require('../errors/http-error');
const { AccessFlags } = require('../const/common');
const { AuthJWTInit, AuthenticateJWT, InitGetDisposableToken } = require('../security/jwt-auth');
const { AuthLocalInit, AuthenticateLocal, SetupWhoAmI, SetupLogOut } = require('../security/local-auth');
const { AuthVKInit } = require('../security/vk-auth');
const { AuthFBInit } = require('../security/fb-auth');
const { AuthGoogleInit } = require('../security/google-auth');
const { AuthAppleInit } = require('../security/apple-auth');
const { setupEpisodes } = require('./episodes');
const { setupAuthors } = require('./authors');
const { setupUsers } = require('./users');
const { setupCategories } = require('./categories');
const { setupCourses } = require('./courses');
const { setupLanguages } = require('./languages');
const { setupLessons } = require('./lessons');
const { setupParameters } = require('./parameters');
const { setupProducts } = require('./products');
const { setupTests } = require('./tests');
const { setupSearch } = require('./search');
const { setupInvoices } = require('./invoices');
const { setupBooks } = require('./books');
const { setupPromoCodes } = require('./promo-codes');
const { setupReviews } = require('./reviews');
const { setupStatistics } = require('./statistics');
const { setupProtectedStatic } = require('./protected-static');
const RedisStoreSession = require('../security/session-storage/redis-storage');
const { SetupRoute: setupLessonPositions } = require('./lesson-positions');
const { SetupRoute: setupDebugRoutes } = require('./debug');
const { SetupRoute: setupSessions } = require('./sessions');
const { setupPrerender } = require('../prerender');
const { setupCache } = require('./cache');
const { SetupRoute: setupMailSubscription } = require('./mail-subscription');
const { SetupRoute: setupFeedback } = require('./feedback');
const { SetupRoute: setupBilling } = require('./billing');
const { setupProcesses } = require('./pm');
const { setupTimelines } = require('./timeline');
const { setupEvents } = require('./event');
const { buildLogString } = require('../utils');
const { FileUpload } = require("../database/file-upload");
const { ImportEpisode, ImportEpisodeParams, ImportTest, ImportTestParams } = require('../database/import');

const SESSION_UPD_TIME = 1 * 3600 * 1000; // 1 Hour
const DFLT_CLIENT_TIMEOUT = 60 * 10; // 10 min

function errorHandler(err, req, res, next) {
    let errStr = err.message ? err.message : err.toString();
    let error = null;
    let statusCode = err instanceof HttpError ? err.statusCode : HttpCode.ERR_INTERNAL;
    if (err.statusCode && err.error) {
        statusCode = err.statusCode;
        error = err.error;
        errStr = JSON.stringify(err.error);
    }
    let jsonRes = { statusCode: statusCode, message: errStr, error: error };
    if (err instanceof HttpError) {
        error = jsonRes = err.errObject;
    }
    console.error(buildLogString(`setup::errorHandler [${statusCode}] ==> ${errStr}${error ? "\nErrorObject: " + JSON.stringify(error, null, 2) : ""}`));
    res.status(statusCode).json(jsonRes);
}

function setupAPI(express, app) {
    var path = require('path');

    let sessionOpts = _.cloneDeep(config.session);
    const updPeriod = sessionOpts.appSettings && sessionOpts.appSettings.updPeriod ? sessionOpts.appSettings.updPeriod : SESSION_UPD_TIME;
    delete sessionOpts.appSettings;

    if (config.proxyServer.protocol === 'https') {
        app.set("trust proxy", 1); // trust first proxy (we are behind NGINX)
        if (!sessionOpts.cookie)
            sessionOpts.cookie = {};
        sessionOpts.cookie.secure = true;
    }

    //app.use(express.favicon()); // отдаем стандартную фавиконку, можем здесь же свою задать
    //app.use("/api", exprLogger('dev')); // выводим все запросы со статусами в консоль
    app.use("/api", bodyParser.json({ limit: '128mb' })); // стандартный модуль, для парсинга JSON в запросах
    app.use("/api", bodyParser.urlencoded({ extended: true }));

    if (config.has('redisSession.enabled') && config.redisSession.enabled) {
        let RedisStore = RedisStoreSession(expressSession);
        sessionOpts.store = new RedisStore(config.redisSession);
    };

    let sessionMiddleware = {
        express: expressSession(sessionOpts),
        passportInit: passport.initialize(),
        passportSession: passport.session()
    };

    if (sessionOpts.cookie && (typeof (sessionOpts.cookie.maxAge) === "number")) {
        sessionMiddleware.rollSession = (req, res, next) => {
            if (req.user) {
                if (req.session && req.session.cookie
                    && (typeof (req.session.cookie.maxAge) === "number")) {
                    if ((req.session.cookie.originalMaxAge !== sessionOpts.cookie.maxAge) ||
                        ((sessionOpts.cookie.maxAge - req.session.cookie.maxAge) >= updPeriod)) {
                        if (typeof (req.session.rollingId) === "undefined")
                            req.session.rollingId = 0;
                        req.session.rollingId++; // We should change session data to renew cookie on the client side
                        req.session.cookie.maxAge = sessionOpts.cookie.maxAge;
                    }
                };
            }
            next();
        }
    };

    const trailingSlash = require('../middleware/trailing-slash');
    app.use("/", trailingSlash());

    app.use("/", sessionMiddleware.express);
    app.use("/", sessionMiddleware.passportInit);
    app.use("/", sessionMiddleware.passportSession);
    if (sessionMiddleware.rollSession)
        app.use("/", sessionMiddleware.rollSession);
    
    const campaignMiddle = require('../middleware/campaign');
    app.use("/", campaignMiddle());

    let publicEnabled = config.has("server.publicEnabled") && (config.server.publicEnabled === true) ? true : false;
    let adminEnabled = config.has("server.adminEnabled") && (config.server.adminEnabled === true) ? true : false;
    let pmEnabled = config.has("server.pmEnabled") && (config.server.pmEnabled === true) ? true : false;
    app.use("/api", (req, res, next) => {
        if (publicEnabled || adminEnabled || pmEnabled)
            next()
        else
            next(new HttpError(HttpCode.ERR_NIMPL, "Feature is disabled."));
    });
    app.use("/api/adm", (req, res, next) => {
        if (adminEnabled)
            next()
        else
            next(new HttpError(HttpCode.ERR_NIMPL, "Feature is disabled."));
    });
    app.use("/api/pm", (req, res, next) => {
        if (pmEnabled)
            next()
        else
            next(new HttpError(HttpCode.ERR_NIMPL, "Feature is disabled."));
    });

    app.use("/api", methodOverride()); // поддержка put и delete

    // Set "Cache-Control: must-revalidate" for all API calls
    const headersMiddle = require('../middleware/headers');
    app.use("/api", headersMiddle({
        headers: {
            "Cache-Control": "must-revalidate"
        }
    }));

    let useJWT = config.has('authentication.useJWT') ? config.authentication.useJWT : false;
    AuthLocalInit(app);
    AuthVKInit(app, sessionMiddleware);
    AuthFBInit(app, sessionMiddleware);
    AuthGoogleInit(app, sessionMiddleware);
    AuthAppleInit(app, sessionMiddleware);
    if (useJWT)
        AuthJWTInit(app);

    app.use("/data", AuthenticateLocal(app)); // Optional Local Authentication
    app.use("/api/adm", AuthenticateLocal(app, useJWT ? false : true, AccessFlags.ContentManager)); // Local Authentication
    app.use("/api/pm", AuthenticateLocal(app, useJWT ? false : true, AccessFlags.PmTaskExecutor)); // Local Authentication
    app.use("/api", AuthenticateLocal(app)); // Optional Local Authentication
    if (useJWT) {
        app.use("/data", AuthenticateJWT(app)); // Optional JWT Authentication
        app.use("/api/adm", AuthenticateJWT(app, true, AccessFlags.ContentManager)); // JWT Authentication
        app.use("/api/pm", AuthenticateJWT(app, true, AccessFlags.PmTaskExecutor)); // JWT Authentication
        app.use("/api", AuthenticateJWT(app)); // Optional JWT Authentication
    }

    if (useJWT)
        InitGetDisposableToken(app);
    
    SetupLogOut(app);
    SetupWhoAmI(app);
    app.post('/api/adm/upload', FileUpload.getFileUploadProc(config.get('uploadPath')));
    app.post('/api/adm/import', FileUpload.getFileUploadProc(config.get('uploadPath'), ImportEpisode(), ImportEpisodeParams()));
    app.post('/api/adm/import-test', FileUpload.getFileUploadProc(config.get('uploadPath'), ImportTest(), ImportTestParams()));

    setupPrerender(app);
    setupCache(app);
    setupBilling(app);
    setupMailSubscription(app);
    setupFeedback(app);
    setupProtectedStatic(app, errorHandler);
    setupLessonPositions(app);
    setupDebugRoutes(app);
    setupProducts(app);
    setupInvoices(app);
    setupBooks(app);
    setupPromoCodes(app);
    setupReviews(app);
    setupStatistics(app);
    setupEpisodes(app);
    setupUsers(app);
    setupAuthors(app);
    setupCategories(app);
    setupCourses(app);
    setupLanguages(app);
    setupLessons(app);
    setupParameters(app);
    setupSessions(app);
    setupTests(app);
    setupSearch(app);
    if (pmEnabled)
        setupProcesses(app);
    setupEvents(app);
    setupTimelines(app);
    
    //
    // Common API options
    //
    const { Product: { ProductReqParams } } = require('../const/product');
    let { ParametersService } = require('../database/db-parameter');

    /*
        lessonPositions: {
        debug: false,

    */
    app.get('/api/options', function (req, res, next) {
        let options;
        Promise.resolve()
            .then(() => {
                options = { appId: {}, siteKey: {}, scriptPath: {}, billing: { productReqParams: ProductReqParams }, debug: {}, stat: {} };
                if (config.has('snets.facebook.appId'))
                    options.appId.fb = config.snets.facebook.appId;
                if (config.has('snets.vk.appId'))
                    options.appId.vk = config.snets.vk.appId;
                if (config.has('snets.google.appId'))
                    options.appId.google = config.snets.google.appId;
                if (config.has('authentication.reCapture.siteKey'))
                    options.siteKey.reCapture = config.authentication.reCapture.siteKey;
                if (config.has('server.pushNotifications') &&
                    (config.server.pushNotifications === true) &&
                    config.has('mail.sendPulse.scriptPath'))
                    options.scriptPath.sendPulse = config.mail.sendPulse.scriptPath;
                if (config.has('billing.billing_test') && (config.billing.billing_test === true))
                    options.billing.billing_test = true;
                if (config.has('billing.mode'))
                    options.billing.mode = config.billing.mode;
                if (config.has('billing.productReqParams'))
                    options.billing.productReqParams = config.billing.productReqParams;
                if (config.has('billing.self_refund') && (config.billing.self_refund === true))
                    options.billing.self_refund = true;
                if (config.has('lessonPositions.debug'))
                    options.debug.lsnPositions = config.lessonPositions.debug;
                if (config.has('debug.clientTrace.gtm'))
                    options.debug.gtm = config.debug.clientTrace.gtm;
                options.stat.clientTimeout = DFLT_CLIENT_TIMEOUT;
                if (config.has('statistics.clientTimeout'))
                    options.stat.clientTimeout = config.statistics.clientTimeout;

                function compare_versions(a, b) {
                    let a_arr = a.split('.');
                    let b_arr = b.split('.');
                    let a_sum = 0;
                    let b_sum = 0;
                    let max_size = a_arr.length > b_arr.length ? a_arr.length : b_arr.length;
                    for (let i = 0; i < max_size; i++){
                        let a_num = i < a_arr.length ? +a_arr[i] : 0;
                        let b_num = i < b_arr.length ? +b_arr[i] : 0;
                        if (i > 0) {
                            let max_shift = 0;
                            if (i < a_arr.length) {
                                max_shift = a_arr[i].length;
                            }
                            if (i < b_arr.length) {
                                if (max_shift < b_arr[i].length)
                                    max_shift = b_arr[i].length;
                            }
                            if (max_shift) {
                                let mult = Math.pow(10, max_shift);
                                a_sum *= mult;
                                b_sum *= mult;
                            }
                        }
                        a_sum += a_num;
                        b_sum += b_num;
                    }
                    return a_sum - b_sum;
                }

                if (req && req.query && req.query.mobile_app) {
                    options.shouldShowPaidContent = { "ios": true, "android": true };
                    try {
                        if (req.query.app_version) {
                            switch (req.query.mobile_app) {
                                case "ios":
                                    if (config.has('mobileApp.ios.showPaidFor')) {
                                        options.shouldShowPaidContent.ios = compare_versions(req.query.app_version,
                                            config.get('mobileApp.ios.showPaidFor')) <= 0;
                                    }
                                    break;
                                case "android":
                                    if (config.has('mobileApp.android.showPaidFor')) {
                                        options.shouldShowPaidContent.android = compare_versions(req.query.app_version,
                                            config.get('mobileApp.android.showPaidFor')) <= 0;
                                    }
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(buildLogString(err.toString()));
                    }
                }
                return ParametersService().getAllParameters(true)
                    .then(params => { options.parameters = params })
            })
            .then(() => {
                res.send(options);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api', function (req, res) {
        res.send('API is running');
    });

    app.use("/api", errorHandler);
}

exports.setupAPI = setupAPI;

