const _ = require('lodash');
const config = require('config');
const request = require('request');
const uuidv4 = require('uuid/v4');
const { HttpCode } = require("../../const/http-codes");
const { Payment } = require('./payment');

const BASE_HOST = "https://payment.yandex.net";
const API_VERSION = "/api/v3/";
const DEFAULT_TIMEOUT = require('http').createServer().timeout; // node's default timeout

class YandexKassa extends Payment {
    constructor(options) {
        super();

        let opts = options || {};
        this._shopId = opts.shopId ? opts.shopId : config.billing.yandexKassa.shopId;
        this._secretKey = opts.secretKey ? opts.secretKey : config.billing.yandexKassa.secretKey;
        this._root = (opts.baseHost ? opts.baseHost : (config.billing.yandexKassa.baseHost ? config.billing.yandexKassa.baseHost : BASE_HOST)) +
            (opts.apiVer ? opts.apiVer : (config.billing.yandexKassa.apiVer ? config.billing.yandexKassa.apiVer : API_VERSION));
        this._timeout = opts.timeout ? opts.timeout : DEFAULT_TIMEOUT;

        if (opts.app) {
            if (config.has("billing.yandexKassa.callBack"))
                opts.app.post(config.billing.yandexKassa.callBack, (req, res, next) => {
                    console.log(`### YandexKassa Callback: method: "${req.method}", data: ${JSON.stringify(req.body, null, 2)}`);
                    res.send({ result: "OK" });
                });
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId/capture", (req, res, next) => {
                this._capturePayment(req.params.paymentId, {})
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId/cancel", (req, res, next) => {
                this._cancelPayment(req.params.paymentId)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId", (req, res, next) => {
                this._getPayment(req.params.paymentId)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/refunds/:paymentId/create", (req, res, next) => {
                this._getPayment(req.params.paymentId)
                    .then(data => {
                        let payload = { amount: data.amount };
                        if (data.receipt)
                            payload.receipt = data.receipt;
                        return this._createRefund(req.params.paymentId, payload)
                    })
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/refunds/:refundId", (req, res, next) => {
                this._getRefundInfo(req.params.refundId)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
        }
    }

    _req(method, func, payload, idempotenceKey) {
        return new Promise((resolve, reject) => {
            let idmpKey = idempotenceKey ? idempotenceKey : uuidv4();
            let options = {
                method: method,
                json: true,
                uri: this._root + func,
                body: payload,
                timeout: this._timeout,
                auth: {
                    user: this._shopId,
                    pass: this._secretKey
                },
                headers: {
                    'Idempotence-Key': idmpKey
                }
            };
            request(options, (error, response, body) => {
                if (error)
                    reject(error)
                else {
                    switch (response.statusCode) {

                        case HttpCode.OK:
                            resolve(body);
                            break;

                        case HttpCode.ERR_TOO_MANY_REQ:
                            let rc = new Promise(resolve => {
                                setTimeout(() => { resolve() }, body.retry_after);
                            })
                                .then(() => {
                                    return this._req(method, func, payload, idmpKey)
                                });
                            resolve(rc);
                            break;

                        default:
                            reject({ statusCode: response.statusCode, error: body });
                    }
                }
            });
        });
    }

    _getPayment(paymentId, idempotenceKey) {
        return this._req('GET', 'payments/' + paymentId, {}, idempotenceKey);
    }

    _createPayment(payload, idempotenceKey) {
        return this._req('POST', 'payments', payload, idempotenceKey);
    }

    _capturePayment(paymentId, payload, idempotenceKey) {
        return this._req('POST', 'payments/' + paymentId + '/capture', payload, idempotenceKey);
    }

    _cancelPayment(paymentId, idempotenceKey) {
        return this._req('POST', 'payments/' + paymentId + '/cancel', {}, idempotenceKey);
    }

    _createRefund(paymentId, payload, idempotenceKey) {
        let obj = _.cloneDeep(payload);
        obj.payment_id = paymentId;
        return this._req('POST', 'refunds', obj, idempotenceKey);
    }

    _getRefundInfo(refundId, idempotenceKey) {
        return this._req('GET', 'refunds/' + refundId, {}, idempotenceKey);
    }

    createPayment(payment) {
        return new Promise(resolve => {
            let paymentObj = payment.payment ?
                {
                    amount: {
                        value: payment.value,
                        currency: payment.currency ? payment.currency : 'RUB'
                    },
                    payment_method_id: payment.payment
                } :
                {
                    // save_payment_method: true,
                    amount: {
                        value: payment.value,
                        currency: payment.currency ? payment.currency : 'RUB'
                    },
                    payment_method_data: {
                        type: payment.type
                    },
                    confirmation: {
                        type: "redirect",
                        return_url: config.proxyServer.siteHost + (payment.returnUrl ? payment.returnUrl : config.billing.yandexKassa.returnUrl)
                    }
                };
            let rc = this._createPayment(paymentObj)
                .then(function (result) {
                    return result && result.confirmation ? {
                        confirmationUrl: result.confirmation.confirmation_url
                    } : {};
                })
                .catch(function (err) {
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