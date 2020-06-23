/**
 * Created by levan.kiknadze on 05/11/2017.
 */

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const NODE_ENV = process.env.NODE_ENV || 'production';

// init DB if needed
let { DatabaseBuilder } = require("./database/builder");
let { magisteryConfig } = require("./etc/config")
let bld = new DatabaseBuilder(magisteryConfig)

let log = require('./logger/log')(module);
const { DbEngineInit } = require("./database/dbengine-init");
let dbInit = new DbEngineInit(magisteryConfig);
const config = require('config');
const { PrerenderInit } = require('./prerender');
const { getTimeStr, buildLogString } = require('./utils');

const PRODUCT_CODE = "ProtoOne";
const VERSION_CODE = "1.0.0.1";
const BUILD_NUM = 33;

//bld.initDatabase()
Promise.resolve()
    .then(() => {

        dbInit.resMan.getVersionInfo()
            .then(verInfo => {
                if ((verInfo.product.Code !== PRODUCT_CODE) || (verInfo.version.Code !== VERSION_CODE)
                    || (verInfo.build.BuildNum !== BUILD_NUM)) {
                    console.error(buildLogString(`### Current DB version: "${verInfo.product.Code}" v.${verInfo.version.Code} build ${verInfo.build.BuildNum}.`));
                    console.error(buildLogString(`### Required DB version: "${PRODUCT_CODE}" v.${VERSION_CODE} build ${BUILD_NUM}.`));
                    console.error(buildLogString(`### ERROR: Current DB version doesn't correspond required one.`));
                    process.exit(2);
                }
                else
                    console.log(buildLogString(`Current DB version: "${verInfo.product.Code}" v.${verInfo.version.Code} build ${verInfo.build.BuildNum}.`));
            });
        
        // log.info("Init Db succeded!")

        // Prepare http server
        let express = require('express');

        let app = new express();
        app.set('case sensitive routing', true);

        let port = magisteryConfig.http.port;
        let address = magisteryConfig.http.address;

        if (NODE_ENV === 'development') {
            app.use(require('morgan')('dev')); // log HTTP requests
            if (config.has("client.devHotReload") && (config.client.devHotReload === true)) {
                let webpack = require('webpack')
                let webpackDevMiddleware = require('webpack-dev-middleware');
                let webpackHotMiddleware = require('webpack-hot-middleware');
                let webpackConfig = require('./webpack.config');

                let compiler = webpack(webpackConfig);
                try {
                    app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }));
                    app.use(webpackHotMiddleware(compiler));
                }
                catch (e) {
                    console.log(e)
                }
            }
        }
// headers['Access-Control-Allow-Origin'] = '*'
// headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, PATCH, DELETE, OPTIONS'
// headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
//         headers['Access-Control-Max-Age'] = '1728000'

        if (config.has("server.corsEnabled") && (config.server.corsEnabled === true)) {
            const allowCrossDomain = function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE, OPTIONS");
                res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, Token");
                res.header("Access-Control-Max-Age", "1728000");
                // res.header("Access-Control-Allow-Headers", "X-Requested-With");
                next();
            };
            app.use(allowCrossDomain);
        }

        //////////////////////////////////////////
        // player begin
        //////////////////////////////////////////
        let fs = require('fs');

        if ((NODE_ENV !== 'development') || (config.has("client.devHotReload") && (config.client.devHotReload === false))) {
            app.use('/static', express.static(path.join(__dirname, 'static')));
        }

        app.use("/doc", express.static(__dirname + '/static-files/doc'));

        app.use("/images", express.static(__dirname + '/images'));
        app.use("/fonts", express.static(__dirname + '/fonts'));
        app.use("/fonts", express.static(path.join(__dirname, 'assets', 'fonts')));
        app.use("/css", express.static(__dirname + '/css'));
        app.use("/css", express.static(path.join(__dirname, 'assets', 'css')));
        app.use("/images", express.static(path.join(__dirname, 'assets', 'images')));
        app.use("/scripts", express.static(__dirname + '/scripts'));

        let player_dbg = config.has("debug.routes.player") && (config.debug.routes.player === true);
        if (player_dbg) {
            app.get('/genData2', function (req, res) {
                var obj;
                fs.readFile(__dirname + "/new_data/data2.json", 'utf8', function (err, data) {
                    if (err) throw err;
                    obj = JSON.parse(data);
                    res.json(obj);
                });
            });
            app.get('/genData', function (req, res) {
                var obj;
                fs.readFile(__dirname + "/new_data/data.json", 'utf8', function (err, data) {
                    if (err) throw err;
                    obj = JSON.parse(data);
                    res.json(obj);
                });
            });
        }

        app.get('/player-app', function (req, res) {
            res.render('player-app.html', {});
        });

        // обработчик файлов html будет шаблонизатор ejs
        app.engine('html', require('ejs').renderFile);

        if (player_dbg) {
            app.get('/work-shop', function (req, res) {
                res.render('index.html', {});
            });
            app.get('/audio', function (req, res) {
                res.render('audio.html', {});
            });
            app.get('/player', function (req, res) {
                res.render('player.html', {});
            });
            app.get('/player-app-test', function (req, res) {
                res.render('player-app-test.html', {});
            });
            app.get('/player2', function (req, res) {
                res.render('player2.html', {});
            });
        }
        //////////////////////////////////////////
        // player end
        //////////////////////////////////////////


        app.use('/assets', express.static('assets'));

        let { setupAPI } = require("./services/setup");
        setupAPI(express, app);

        if (config.has("debug.routes.testupload") && (config.debug.routes.testupload === true))
            app.get("/testupload", function (req, res) {
                res.sendFile(__dirname + '/debug/FileUploadTest.html');
            });

        if (config.has("debug.routes.testimport") && (config.debug.routes.testimport === true))
            app.get("/testimport", function (req, res) {
                res.sendFile(__dirname + '/debug/EpisodeImportTest.html');
            });

        if (config.has("debug.routes.logintest") && (config.debug.routes.logintest === true))
            app.get("/logintest", function (req, res) {
                res.sendFile(__dirname + '/debug/LoginTestPage.html');
            });

        if (config.has("debug.routes.feedbacktest") && (config.debug.routes.feedbacktest === true))
            app.get("/feedbacktest", function (req, res) {
                res.sendFile(__dirname + '/debug/FeedbackTestPage.html');
            });

        if (config.has("debug.routes.paymenttest") && (config.debug.routes.paymenttest === true))
            app.get("/paymenttest", function (req, res) {
                res.sendFile(__dirname + '/debug/PaymentTestPage.html');
            });

        if (config.has("debug.routes.regtest") && (config.debug.routes.regtest === true))
            app.get("/regtest", function (req, res) {
                res.sendFile(__dirname + '/debug/RegTestPage.html');
            });

        if (config.has("debug.routes.pushtest") && (config.debug.routes.pushtest === true))
            app.get("/pushtest", function (req, res) {
                res.sendFile(__dirname + '/debug/PushTestPage.html');
            });

        if (config.has("debug.routes.testrecovery") && (config.debug.routes.testrecovery === true))
            app.get("/testrecovery/:activationKey", function (req, res) {
                let template = fs.readFileSync(__dirname + '/debug/templates/PwdRecoverTest.tmpl', 'utf8');
                let body = _.template(template)(
                    {
                        activationKey: req.params.activationKey
                    });
                res.send(body);
            });

        if (config.has("server.adminEnabled") && (config.server.adminEnabled === true))
            app.get("/adm/*", function (req, res) {
                res.sendFile(__dirname + '/adm-index.html');
            });

        PrerenderInit(app);

        // if (config.has("server.adminEnabled") && (config.server.adminEnabled === true))
        app.get("/mailing/*", function (req, res) {
            res.sendFile(path.join(__dirname, 'mailing', 'index.html'));
        });

        let logPrerenderRequest = config.has("server.prerender.logRequest") ? config.get("server.prerender.logRequest") : false;
        if (config.has("server.publicEnabled") && (config.server.publicEnabled === true))
            app.get("/*", function (req, res) {
                let is_prerender = req.headers["x-prerender"] === "1" ? true : false;
                if (is_prerender && logPrerenderRequest)
                    console.log(buildLogString(`### Prerender request: ${req.url}.`));
                res.render(__dirname + '/index.html', {
                    id: req.user ? req.user.Id : "null",
                    email: req.user ? `"${req.user.Email}"` : "null",
                    name: req.user ? `"${req.user.DisplayName}"` : "null",
                    carrotquest_hash: req.user ? `"${req.user.CqHash}"` : "null",
                    is_prerender: is_prerender ? "true" : "false"
                });
            });

        app.listen(port, address, function (error) {
            if (error) {
                console.error(error)
            } else {
                console.info("[%s] ==> Listening on port %s. Open up %s://%s:%s/ in your browser.",
                    getTimeStr(), port, config.server.protocol, address === '0.0.0.0' ? 'localhost' : address, port);
            }
        });
    }, (err) => {
        console.error("Server exited with error", err);
        process.exit(1);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });


