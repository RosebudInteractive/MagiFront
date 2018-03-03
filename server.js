/**
 * Created by levan.kiknadze on 05/11/2017.
 */

//var webpack = require('webpack');
let webpack = require('webpack')
let webpackDevMiddleware = require('webpack-dev-middleware');
let webpackHotMiddleware = require('webpack-hot-middleware');
let config = require('./webpack.config');

const NODE_ENV = process.env.NODE_ENV || 'prod';

// init DB if needed
let { DatabaseBuilder } = require("./database/builder");
let { magisteryConfig } = require("./etc/config")
let bld = new DatabaseBuilder(magisteryConfig)

let log = require('./logger/log')(module);
const { DbEngineInit } = require("./database/dbengine-init");
new DbEngineInit(magisteryConfig);
const { FileUpload } = require("./database/file-upload");

//bld.initDatabase()
Promise.resolve()
    .then(() => {
        // log.info("Init Db succeded!")
        let path = require('path');

        // Prepare http server
        let express = require('express');
        let app = new express();
        let port = magisteryConfig.http.port;

        if (NODE_ENV === 'development') {
            let compiler = webpack(config);
            try {
                app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}));
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
        //app.use('/data', express.static(__dirname + '/data'));

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

        // обработчик файлов html будет шаблонизатор ejs
        app.engine('html', require('ejs').renderFile);

        app.get('/work-shop', function (req, res) {
            res.render('index.html', {});
        });
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
        app.use('/data', express.static('../uploads'));

        let { setupAPI } = require("./services/setup");
        setupAPI(express, app);

        app.get("/testupload", function (req, res) {
            res.sendFile(__dirname + '/FileUploadTest.html');
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

        app.post('/upload', FileUpload.getFileUploadProc());

        app.listen(port, function (error) {
            if (error) {
                console.error(error)
            } else {
                console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
            }
        });
    }, (err) => {
        console.error("Server exited with error", err);
        process.exit(1);
    })
    .catch((e) => {
        console.log(e)
    });


