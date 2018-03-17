/**
 * Created by levan.kiknadze on 14/11/2017.
 */

const config = require('config');
const log = require('../logger/log')(module);
//const exprLogger = require("express-logger");
const bodyParser  = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

const { AuthJWTInit, AuthenticateJWT } = require('../security/jwt-auth');
const { AuthLocalInit, AuthenticateLocal } = require('../security/local-auth');
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

    //app.use(express.favicon()); // отдаем стандартную фавиконку, можем здесь же свою задать
    //app.use("/api", exprLogger('dev')); // выводим все запросы со статусами в консоль
    app.use("/api", cookieParser());
    app.use("/api", bodyParser.json()); // стандартный модуль, для парсинга JSON в запросах
    app.use("/api", bodyParser.urlencoded({ extended: true }));

    let sessionOpts = config.session;
    if (config.has('redisSession.enabled') && config.redisSession.enabled) {
        let RedisStore = RedisStoreSession(expressSession);
        sessionOpts.store = new RedisStore(config.redisSession);
    };
    app.use("/api", expressSession(config.session));

    app.use("/api", passport.initialize());
    app.use("/api", passport.session());   

    app.use("/api", methodOverride()); // поддержка put и delete

    let useJWT = config.has('authentication.useJWT') ? config.authentication.useJWT : false;
    AuthLocalInit(app);
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

