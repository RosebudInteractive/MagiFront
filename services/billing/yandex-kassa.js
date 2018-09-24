const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const { Payment } = require('./payment');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

class YandexKassa extends Payment {
    constructor(app) {
        super();
        if (app && config.has("billing.yandexKassa.callBack")) {
            app.use(config.billing.yandexKassa.callBack, (req, res, next) => {
                console.log(`### YandexKassa Callback: method: "${req.method}", data: ${JSON.stringify(req.body, null, 2)}`);
                res.send({ result: "OK" });
            })
        }
        this._yandexCheckout = require('yandex-checkout')({
            shopId: config.billing.yandexKassa.shopId,
            secretKey: config.billing.yandexKassa.secretKey
        });
    }

    createPayment(payment) {
        return new Promise(resolve => {
            let idempotenceKey = Utils.guid();
            let rc = this._yandexCheckout.createPayment({
                amount: {
                    value: payment.value,
                    currency: payment.currency ? payment.currency : 'RUB'
                },
                payment_method_data: {
                    type: payment.type
                },
                confirmation: {
                    type: "redirect",
                    return_url: config.server.siteHost + config.billing.yandexKassa.returnUrl
                }
            }, idempotenceKey)
                .then(function (result) {
                    console.log({ payment: result });
                    return result;
                })
                .catch(function (err) {
                    console.error(err);
                    throw err;
                });
            resolve(rc);
        });
    }
}

let yandexKassa = null;
exports.PaymentObject = (app) => {
    if (!yandexKassa)
        yandexKassa = new YandexKassa(app);
    return yandexKassa;
}