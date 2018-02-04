/**
 * Created by levan.kiknadze on 05/11/2017.
 */

//var webpack = require('webpack');
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config');

// init DB if needed
var { DatabaseBuilder } = require("./database/builder");
var { magisteryConfig } = require("./etc/config")
var bld = new DatabaseBuilder(magisteryConfig)

var log = require('./logger/log')(module);
const { DbEngineInit } = require("./database/dbengine-init");
new DbEngineInit(magisteryConfig);
const { FileUpload } = require("./database/file-upload");

//bld.initDatabase()
Promise.resolve()
    .then(() => {
        // log.info("Init Db succeded!")

        // Prepare http server
        var express = require('express');
        var app = new express();
        var port = magisteryConfig.http.port;

        var compiler = webpack(config);
        try {
            app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
            app.use(webpackHotMiddleware(compiler));
        }
        catch (e) {
            console.log(e)
        }

        //////////////////////////////////////////
        // player begin
        //////////////////////////////////////////
        var fs = require('fs');

        app.use("/images", express.static(__dirname + '/images'));
        app.use("/fonts", express.static(__dirname + '/fonts'));
        app.use("/css", express.static(__dirname + '/css'));
        app.use("/scripts", express.static(__dirname + '/scripts'));
        //app.use('/data', express.static(__dirname + '/data'));

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
        app.use('/data', express.static('../uploads'));

        var { setupAPI } = require("./services/setup");
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


