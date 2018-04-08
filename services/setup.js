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

const { AuthJWTInit, AuthenticateJWT } = require('../security/jwt-auth');
const { AuthLocalInit, AuthenticateLocal } = require('../security/local-auth');
const { AuthVKInit } = require('../security/vk-auth');
const { AuthFBInit } = require('../security/fb-auth');
const { AuthGoogleInit } = require('../security/google-auth');
const { setupEpisodes } = require('./episodes');
const { setupAuthors } = require('./authors');
const { setupCategories } = require('./categories');
const { setupCourses } = require('./courses');
const { setupLanguages } = require('./languages');
const { setupLessons } = require('./lessons');
const { setupProtectedStatic } = require('./protected-static');
const RedisStoreSession = require('../security/session-storage/redis-storage');

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
    app.use("/api", bodyParser.json()); // стандартный модуль, для парсинга JSON в запросах
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

    setupProtectedStatic(app);
    setupEpisodes(app);
    setupAuthors(app);
    setupCategories(app);
    setupCourses(app);
    setupLanguages(app);
    setupLessons(app);

    app.get('/api', function (req, res) {
        res.send('API is running');
    });
}

exports.setupAPI = setupAPI;

