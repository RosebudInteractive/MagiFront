/**
 * Created by levan.kiknadze on 05/11/2017.
 */

//var webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

let webpack = require('webpack')
let webpackDevMiddleware = require('webpack-dev-middleware');
let webpackHotMiddleware = require('webpack-hot-middleware');
let webpackConfig = require('./webpack.config');

const NODE_ENV = process.env.NODE_ENV || 'prod';

// init DB if needed
let { DatabaseBuilder } = require("./database/builder");
let { magisteryConfig } = require("./etc/config")
let bld = new DatabaseBuilder(magisteryConfig)

let log = require('./logger/log')(module);
const { DbEngineInit } = require("./database/dbengine-init");
new DbEngineInit(magisteryConfig);
const { FileUpload } = require("./database/file-upload");
const config = require('config');

//bld.initDatabase()
Promise.resolve()
    .then(() => {
        // log.info("Init Db succeded!")

        // Prepare http server
        let express = require('express');

        let app = new express();
        if (NODE_ENV === 'production')
            app.set("trust proxy", 1); // trust first proxy (we are behind NGINX)

        let port = magisteryConfig.http.port;
        let address = magisteryConfig.http.address;

        if (NODE_ENV === 'development') {
            let compiler = webpack(webpackConfig);
            try {
                app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath}));
                app.use(webpackHotMiddleware(compiler));
            }
            catch (e) {
                console.log(e)
            }
        }

        //////////////////////////////////////////
        // player begin
        //////////////////////////////////////////
        let fs = require('fs');

        if (NODE_ENV !== 'development') {
            app.use('/static', express.static(path.join(__dirname, 'static')));
        }

        app.use("/images", express.static(__dirname + '/images'));
        app.use("/fonts", express.static(__dirname + '/fonts'));
        app.use("/css", express.static(__dirname + '/css'));
        app.use("/css", express.static(path.join(__dirname, 'assets', 'css')));
        app.use("/images", express.static(path.join(__dirname, 'assets', 'images')));
        app.use("/scripts", express.static(__dirname + '/scripts'));

        app.get('/genData', function (req, res) {
            var obj;
            fs.readFile(__dirname + "/new_data/data.json", 'utf8', function (err, data) {
                if (err) throw err;
                obj = JSON.parse(data);
                res.json(obj);
            });
        });

        // обработчик файлов html будет шаблонизатор ejs
        app.engine('html', require('ejs').renderFile);

        app.get('/audio', function (req, res) {
            res.render('audio.html', {});
        });
        app.get('/player', function (req, res) {
            res.render('player.html', {});
        });

        app.get('/player2', function (req, res) {
            res.render('player2.html', {});
        });
        //////////////////////////////////////////
        // player end
        //////////////////////////////////////////


        app.use('/assets', express.static('assets'));

        let { setupAPI } = require("./services/setup");
        setupAPI(express, app);

        app.get("/testupload", function (req, res) {
            res.sendFile(__dirname + '/FileUploadTest.html');
        });

        app.get("/logintest", function (req, res) {
            res.sendFile(__dirname + '/LoginTestPage.html');
        });

        app.get("/regtest", function (req, res) {
            res.sendFile(__dirname + '/RegTestPage.html');
        });

        app.get("/testrecovery/:activationKey", function (req, res) {
            let template = fs.readFileSync(__dirname + '/templates/PwdRecoverTest.tmpl', 'utf8');
            let body = _.template(template)(
                {
                    activationKey: req.params.activationKey
                });
            res.send(body);
        });

        app.get("/adm/*", function (req, res) {
            res.sendFile(__dirname + '/adm-index.html');
        });

        app.get("/*", function (req, res) {
            res.sendFile(__dirname + '/index.html');
        });

        app.get('/ErrorExample', function (req, res, next) {
            next(new Error('Random error!'));
        });

        // app.get("/", function (req, res) {
        //     res.sendFile(__dirname + '/adm-index.html');
        // });

        app.post('/upload', FileUpload.getFileUploadProc(config.get('uploadPath')));

        app.listen(port, address, function (error) {
            if (error) {
                console.error(error)
            } else {
                console.info("==> 🌎  Listening on port %s. Open up %s://%s:%s/ in your browser.",
                    port, config.server.protocol, address === '0.0.0.0' ? 'localhost' : address, port);
            }
        });
    }, (err) => {
        console.error("Server exited with error", err);
        process.exit(1);
    })
    .catch((e) => {
        console.log(e)
    });


