'use strict';
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
            feedback.processFeedback(req.body['sender'], req.body['message'], { user: req.user ? req.user : null })
                .then(result => {
                    res.status(HttpCode.OK).json(result);
                })
                .catch((err) => {
                    next(err);
                });
            
        });
    });
}