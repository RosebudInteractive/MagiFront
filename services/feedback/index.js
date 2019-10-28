'use strict';
const { URL, URLSearchParams } = require('url');
const config = require('config');
const { HttpCode } = require('../../const/http-codes');
const { Feedback } = require('./feedback');
const { ChechRecapture: chechRecapture } = require('../../security/local-auth');

let feedback = null;
exports.SetupRoute = (app) => {
    if (!feedback)
        feedback = new Feedback();
    app.post('/api/feedback', (req, res, next) => {
        chechRecapture(false/*config.authentication.useCapture*/, req, res, () => {
            let options = { user: req.user ? req.user : null, path: null };
            if (req.headers["referer"]) {
                let url = new URL(req.headers["referer"]);
                options.path = url.pathname;
            }
            feedback.processFeedback(req.body['sender'], req.body['message'], options)
                .then(result => {
                    res.status(HttpCode.OK).json(result);
                })
                .catch((err) => {
                    next(err);
                });
            
        });
    });
}