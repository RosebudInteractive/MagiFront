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
const { AuthJWTInit, AuthenticateJWT } = require('../security/jwt-auth');
const { AuthLocalInit, AuthenticateLocal, SetupWhoAmI } = require('../security/local-auth');
const { AuthVKInit } = require('../security/vk-auth');
const { AuthFBInit } = require('../security/fb-auth');
const { AuthGoogleInit } = require('../security/google-auth');
const { setupEpisodes } = require('./episodes');
const { setupAuthors } = require('./authors');
const { setupUsers } = require('./users');
const { setupCategories } = require('./categories');
const { setupCourses } = require('./courses');
const { setupLanguages } = require('./languages');
const { setupLessons } = require('./lessons');
const { setupProducts } = require('./products');
const { setupInvoices } = require('./invoices');
const { setupProtectedStatic } = require('./protected-static');
const RedisStoreSession = require('../security/session-storage/redis-storage');
const { SetupRoute: setupLessonPositions } = require('./lesson-positions');
const { SetupRoute: setupDebugRoutes } = require('./debug');
const { setupPrerender } = require('../prerender');
const { SetupRoute: setupMailSubscription } = require('./mail-subscription');
const { SetupRoute: setupFeedback } = require('./feedback');
const { SetupRoute: setupBilling } = require('./billing');

const { FileUpload } = require("../database/file-upload");
const { ImportEpisode, ImportEpisodeParams } = require('../database/import');

function errorHandler(err, req, res, next) {
    let now = new Date();
    let tZ_str = (now.getTimezoneOffset() < 0 ? "-" : "+") + Math.abs(now.getTimezoneOffset() / 60).toFixed(2) + "h";
    let errStr = err.message ? err.message : err.toString();
    let error = null;
    let statusCode = HttpCode.ERR_INTERNAL;
    if (err.statusCode && err.error) {
        statusCode = err.statusCode;
        error = err.error;
        errStr = JSON.stringify(err.error);
    }
    console.error(`[${now.toLocaleString()} ${tZ_str}] setup::errorHandler [${statusCode}] ==> ${errStr}${error ? "\nErrorObject: " + JSON.stringify(error, null, 2) : ""}`);
    res.status(statusCode).json({ statusCode: statusCode, message: errStr, error: error });
}

function setupAPI(express, app) {
    var path = require('path');

    let sessionOpts = _.cloneDeep(config.session)
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

    app.use("/api", sessionMiddleware.express);
    app.use("/api", sessionMiddleware.passportInit);
    app.use("/api", sessionMiddleware.passportSession);   

    app.use("/api", methodOverride()); // поддержка put и delete

    app.use("/data", sessionMiddleware.express);
    app.use("/data", sessionMiddleware.passportInit);
    app.use("/data", sessionMiddleware.passportSession);

    let useJWT = config.has('authentication.useJWT') ? config.authentication.useJWT : false;
    AuthLocalInit(app);
    AuthVKInit(app, sessionMiddleware);
    AuthFBInit(app, sessionMiddleware);
    AuthGoogleInit(app, sessionMiddleware);
    if (useJWT)
        AuthJWTInit(app);

    app.use("/data", AuthenticateLocal(app)); // Optional Local Authentication
    app.use("/api/adm", AuthenticateLocal(app, useJWT ? false : true)); // Local Authentication
    app.use("/api", AuthenticateLocal(app)); // Optional Local Authentication
    if (useJWT) {
        app.use("/data", AuthenticateJWT(app)); // Optional JWT Authentication
        app.use("/api/adm", AuthenticateJWT(app, true)); // JWT Authentication
        app.use("/api", AuthenticateJWT(app)); // Optional JWT Authentication
    }

    SetupWhoAmI(app);
    app.post('/api/adm/upload', FileUpload.getFileUploadProc(config.get('uploadPath')));
    app.post('/api/adm/import', FileUpload.getFileUploadProc(config.get('uploadPath'), ImportEpisode(), ImportEpisodeParams()));

    setupPrerender(app);
    setupBilling(app);
    setupMailSubscription(app);
    setupFeedback(app);
    setupProtectedStatic(app);
    setupLessonPositions(app);
    setupDebugRoutes(app);
    setupProducts(app);
    setupInvoices(app);
    setupEpisodes(app);
    setupUsers(app);
    setupAuthors(app);
    setupCategories(app);
    setupCourses(app);
    setupLanguages(app);
    setupLessons(app);

    //
    // Common API options
    //
    app.get('/api/options', function (req, res, next) {
        Promise.resolve()
            .then(() => {
                let options = { appId: {} };
                if (config.has('snets.facebook.appId'))
                    options.appId.fb = config.snets.facebook.appId;
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

