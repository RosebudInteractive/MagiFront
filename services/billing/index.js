'use strict';
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");

exports.SetupRoute = (app) => {
    if (config.billing.enabled && config.has("billing.module")) {
        const { PaymentObject } = require(config.billing.module);
        let paymentObject = PaymentObject({ app: app });

        app.post('/api/payments/test', (req, res, next) => {
            if (req.user) {
                paymentObject._createPaymentTest({
                    returnUrl: req.body.returnUrl,
                    value: req.body.value,
                    currency: "RUB",
                    type: "bank_card",
                    payment: req.body.payment
                }, { dbOptions: { userId: req.user.Id } })
                    .then(result => {
                        if (result && result.confirmationUrl)
                            res.redirect(result.confirmationUrl)
                        else
                            res.send({ result: "OK", paymentData: result });
                    })
                    .catch(err => {
                        next(err);
                    });
            }
            else
                res.status(HttpCode.ERR_UNAUTH).json({ result: "ERROR", message: "Authorization required." });
        });

        app.post('/api/payments', (req, res, next) => {
            if (req.user) {
                paymentObject.insert(req.body, { dbOptions: { userId: req.user.Id } })
                    .then(result => {
                        if (result && result.confirmationUrl)
                            res.redirect(result.confirmationUrl)
                        else
                            res.send({ result: "OK", paymentData: result });
                    })
                    .catch(err => {
                        next(err);
                    });
            }
            else
                res.status(HttpCode.ERR_UNAUTH).json({ result: "ERROR", message: "Authorization required." });;
        });
    }
};
