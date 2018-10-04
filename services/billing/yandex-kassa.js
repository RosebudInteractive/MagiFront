const _ = require('lodash');
const config = require('config');
const request = require('request');
const uuidv4 = require('uuid/v4');
const { HttpCode } = require("../../const/http-codes");
const { Payment } = require('./payment');
const { Accounting } = require('../../const/accounting');
const { UsersCache } = require("../../security/users-cache");

const BASE_HOST = "https://payment.yandex.net";
const API_VERSION = "/api/v3/";
const DEFAULT_TIMEOUT = require('http').createServer().timeout; // node's default timeout

class YandexKassa extends Payment {
    constructor(options) {
        super(options);

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
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId", (req, res, next) => {//
                // this._getPayment(req.params.paymentId)
                this.checkAndChangeState(req.params.paymentId,
                    { debug: config.billing.debug ? true : false }, { dbOptions: { userId: req.user.Id } })
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

    _getPayment(paymentId, op, idempotenceKey) {
        let method = 'GET';
        let func = 'payments/' + paymentId;
        if (op)
            op.operation = method + " " + func;
        return this._req(method, func, {}, idempotenceKey);
    }

    _createPayment(payload, op, idempotenceKey) {
        let method = 'POST';
        let func = 'payments';
        if (op)
            op.operation = method + " " + func;
        return this._req(method, func, payload, idempotenceKey);
    }

    _capturePayment(paymentId, payload, op, idempotenceKey) {
        let method = 'POST';
        let func = 'payments/' + paymentId + '/capture';
        if (op)
            op.operation = method + " " + func;
        return this._req(method, func, payload, idempotenceKey);
    }

    _cancelPayment(paymentId, op, idempotenceKey) {
        let method = 'POST';
        let func = 'payments/' + paymentId + '/cancel';
        if (op)
            op.operation = method + " " + func;
        return this._req('POST', func, {}, idempotenceKey);
    }

    _createRefund(paymentId, payload, op, idempotenceKey) {
        let obj = _.cloneDeep(payload);
        obj.payment_id = paymentId;
        let method = 'POST';
        let func = 'refunds';
        if (op) {
            op.operation = method + " " + func;
            op.request = obj;
        }
        return this._req(method, func, obj, idempotenceKey);
    }

    _getRefundInfo(refundId, op, idempotenceKey) {
        let method = 'GET';
        let func = 'refunds/' + refundId;
        if (op)
            op.operation = method + " " + func;
        return this._req(method, func, {}, idempotenceKey);
    }

    _convertStatusToState(status) {
        let rc = Accounting.ChequeState.Error;
        switch (status) {
            case "pending":
                rc = Accounting.ChequeState.Pending;
                break;
            case "waiting_for_capture":
                rc = Accounting.ChequeState.WaitForCapture;
                break;
            case "succeeded":
                rc = Accounting.ChequeState.Succeeded;
                break;
            case "canceled":
                rc = Accounting.ChequeState.Canceled;
                break;
        }
        return rc;
    }

    _onCapturePayment(paymentId) {
        let op = {};
        return new Promise(resolve => {
            let chequeState = Accounting.ChequeState.Error;
            let rc = this._capturePayment(paymentId, {}, op)
                .then(result => {
                    chequeState = this._convertStatusToState(result.status);
                    let cheque = { chequeState: chequeState, id: result.id };
                    let rc = { isError: false, operation: op, req: {}, result: result, cheque: cheque };
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        rc.cheque.chequeDate = new Date(ms);
                    }
                    if (result.payment_method && result.payment_method.saved)
                        rc.cheque.isSaved = true;
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: payment, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onGetPayment(paymentId) {
        let op = {};
        return new Promise(resolve => {
            let chequeState = Accounting.ChequeState.Error;
            let rc = this._getPayment(paymentId, op)
                .then(result => {
                    chequeState = this._convertStatusToState(result.status);
                    let cheque = { chequeState: chequeState, id: result.id };
                    let rc = { isError: false, operation: op, req: {}, result: result, cheque: cheque };
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        rc.cheque.chequeDate = new Date(ms);
                    }
                    if (result.payment_method && result.payment_method.saved)
                        rc.cheque.isSaved = true;
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: payment, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onCreatePayment(payment) {
        let op = {};
        return new Promise(resolve => {
            let chequeState = Accounting.ChequeState.Error;
            let rc = this._createPayment(payment, op)
                .then(result => {
                    chequeState = this._convertStatusToState(result.status);
                    let cheque = { chequeState: chequeState, id: result.id };
                    let rc = { isError: false, operation: op, req: payment, result: result, cheque: cheque };
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        rc.cheque.chequeDate = new Date(ms);
                    }
                    if (result.confirmation && result.confirmation.confirmation_url)
                        rc.confirmationUrl = result.confirmation.confirmation_url;
                    if (result.payment_method && result.payment_method.saved)
                        rc.cheque.isSaved = true;
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: payment, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onPreparePaymentFields(id, payment, invoice, userId) {
        let result = {}
        let paymentObject = result.paymentObject = _.cloneDeep(payment);
        let fields = result.fields = {};
        return new Promise(resolve => {
            let id = invoice ? invoice.UserId : userId;
            resolve(UsersCache().getUserInfoById(id));
        })
            .then(user => {
                let curr = invoice ? invoice.CurrencyCode : Accounting.DfltCurrencyCode;
                let sumStr = invoice ? invoice.Sum.toFixed(Accounting.SumPrecision) : (payment.amount ? payment.amount.value : null);
                let sum = parseFloat(sumStr);
                if (isNaN(sum) || (sum < Accounting.ComparePrecision))
                    throw new Error(`Invalid cheque sum: "${sum} ${curr}".`);
                paymentObject.amount = {
                    value: sumStr,
                    currency: curr
                }
                paymentObject.capture = false;
                if (!paymentObject.payment_method_id) {
                    if (!paymentObject.confirmation) {
                        paymentObject.confirmation = {
                            type: "redirect",
                            return_url: config.proxyServer.siteHost +
                                (paymentObject.returnUrl ? paymentObject.returnUrl : config.billing.yandexKassa.returnUrl)
                        };
                        delete paymentObject.returnUrl;
                    }
                }
                else
                    delete paymentObject.confirmation;

                paymentObject.description = "Оплата";

                if (invoice) {
                    if (invoice.Name)
                        paymentObject.description = invoice.Name;
                    if (invoice.Items && (invoice.Items === 1) && (invoice.Items[0].Qty === 1))
                        paymentObject.description = invoice.Items[0].Name;
                    if (invoice.Items && (invoice.Items.length > 0)) {
                        let items = [];
                        paymentObject.receipt = {
                            items: items,
                            email: user.Email
                        }
                        invoice.Items.forEach(elem => {
                            let item = {};
                            if (elem.ExtFields && elem.ExtFields.vat && elem.ExtFields.vat.yandexKassaCode)
                                item.vat_code = elem.ExtFields.vat.yandexKassaCode
                            else
                                throw new Error(`Missing field "vat_code" for "${elem.Name}"`);
                            item.description = elem.Name;
                            item.quantity = elem.Qty;
                            item.amount = { value: elem.Price, currency: curr };
                            items.push(item);
                        });
                    }
                }
                paymentObject.metadata = {
                    ChequeId: id
                };
                if (invoice)
                    paymentObject.metadata.InvoiceId = invoice.Id;
                fields.UserId = user.Id;
                fields.ChequeTypeId = Accounting.ChequeType.Payment;
                fields.CurrencyId = invoice ? invoice.CurrencyId : Accounting.DfltCurrencyId;
                fields.InvoiceId = invoice ? invoice.Id : null;
                fields.Name = paymentObject.description;
                fields.Sum = sum;
                fields.ChequeDate = new Date();
                fields.ChequeData = JSON.stringify(paymentObject);

                return result;
            });
    }

    _createPaymentTest(payment) {
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
                    save_payment_method: true,
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