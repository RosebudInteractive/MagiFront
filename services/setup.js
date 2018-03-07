/**
 * Created by levan.kiknadze on 14/11/2017.
 */

var log = require('../logger/log')(module);
//var exprLogger = require("express-logger");
var bodyParser  = require('body-parser');
var methodOverride = require('method-override');
const { AuthenticateJWT } = require('../security/jwt-auth');
var { setupEpisodes } = require("./episodes");
let { setupAuthors } = require('./authors');
let { setupCategories } = require('./categories');
let { setupCourses } = require('./courses');
let { setupLanguages } = require('./languages');
let { setupLessons } = require('./lessons');
let { setupProtectedStatic } = require('./protected-static');

function setupAPI(express, app) {
    var path = require('path');

    //app.use(express.favicon()); // отдаем стандартную фавиконку, можем здесь же свою задать
    //app.use("/api", exprLogger('dev')); // выводим все запросы со статусами в консоль
    app.use("/api", bodyParser.json()); // стандартный модуль, для парсинга JSON в запросах
    app.use("/api", bodyParser.urlencoded({extended: true}));
    app.use("/api", methodOverride()); // поддержка put и delete
    app.use("/api/adm", AuthenticateJWT(app, true)); // JWT Authentication
    app.use("/api", AuthenticateJWT(app)); // Optional JWT Authentication

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

