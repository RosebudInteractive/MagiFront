const _ = require('lodash');
const config = require('config');
const request = require('request');
const uuidv4 = require('uuid/v4');
const { getTimeStr } = require('../../utils');
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
                    if (req.body && req.body.object && req.body.object.metadata && req.body.object.metadata.ChequeId)
                        this.checkAndChangeState(parseInt(req.body.object.metadata.ChequeId),
                            { CheckueStateId: Accounting.ChequeState.Pending })
                            .then(data => {
                                console.log(`### YandexKassa Callback: method result: ${JSON.stringify(data, null, 2)}`);
                                res.send(data);
                            })
                            .catch(err => {
                                console.error(`[${getTimeStr()}] ### YandexKassa Callback ERROR: ${err && err.message ? err.message : JSON.stringify(err, null, 2)}`);
                                res.send({});
                            })
                    else
                        res.send({});
                });
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId/capture", (req, res, next) => {
                this.checkAndChangeState(req.params.paymentId,
                    { debug: config.billing.debug ? true : false }, { dbOptions: { userId: req.user.Id } })
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId/cancel", (req, res, next) => {
                this.cancel(req.params.paymentId,
                    { debug: config.billing.debug ? true : false }, { dbOptions: { userId: req.user.Id } })
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/payments/:paymentId", (req, res, next) => {//
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
                let data = {
                    Refund: {
                        payment_id: req.params.paymentId
                    }
                };
                this.insert(data, { debug: config.billing.debug ? true : false, dbOptions: { userId: req.user.Id } })
                    .then(result => {
                        res.send({ result: "OK", paymentData: result });
                    })
                    .catch(err => {
                        next(err);
                    });
            });
            opts.app.get("/api/adm/yandex-kassa/refunds/:refundId", (req, res, next) => {
                this.checkAndChangeState(req.params.refundId,
                    { debug: config.billing.debug ? true : false }, { dbOptions: { userId: req.user.Id } })
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

    _createRefund(payload, op, idempotenceKey) {
        let obj = _.cloneDeep(payload);
        let method = 'POST';
        let func = 'refunds';
        if (op)
            op.operation = method + " " + func;
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

    _convertReceiptStatusToState(status) {
        let rc = null;
        switch (status) {
            case "pending":
                rc = Accounting.ReceiptState.Pending;
                break;
            case "succeeded":
                rc = Accounting.ReceiptState.Succeeded;
                break;
            case "canceled":
                rc = Accounting.ReceiptState.Canceled;
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
                    if (result.receipt_registration)
                        cheque.ReceiptStateId = this._convertReceiptStatusToState(result.receipt_registration);
                    let rc = { isError: false, operation: op, req: {}, result: result, cheque: cheque };
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        cheque.chequeDate = new Date(ms);
                    }
                    if (result.payment_method && result.payment_method.saved)
                        cheque.isSaved = result.id === result.payment_method.id;
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
                    if (result.receipt_registration)
                        cheque.ReceiptStateId = this._convertReceiptStatusToState(result.receipt_registration);
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        cheque.chequeDate = new Date(ms);
                    }
                    if (result.payment_method && result.payment_method.saved)
                        cheque.isSaved = result.id === result.payment_method.id;
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: payment, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onCancelPayment(paymentId) {
        let op = {};
        return new Promise(resolve => {
            let chequeState = Accounting.ChequeState.Error;
            let rc = this._cancelPayment(paymentId, op)
                .then(result => {
                    chequeState = this._convertStatusToState(result.status);
                    let cheque = { chequeState: chequeState, id: result.id };
                    let rc = { isError: false, operation: op, req: {}, result: result, cheque: cheque };
                    if (result.receipt_registration)
                        cheque.ReceiptStateId = this._convertReceiptStatusToState(result.receipt_registration);
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        cheque.chequeDate = new Date(ms);
                    }
                    if (result.payment_method && result.payment_method.saved)
                        cheque.isSaved = result.id === result.payment_method.id;
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: payment, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onGetRefund(refundId) {
        let op = {};
        return new Promise(resolve => {
            let chequeState = Accounting.ChequeState.Error;
            let rc = this._getRefundInfo(refundId, op)
                .then(result => {
                    chequeState = this._convertStatusToState(result.status);
                    let cheque = { chequeState: chequeState, id: result.id };
                    let rc = { isError: false, operation: op, req: {}, result: result, cheque: cheque };
                    if (result.receipt_registration)
                        cheque.ReceiptStateId = this._convertReceiptStatusToState(result.receipt_registration);
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        cheque.chequeDate = new Date(ms);
                    }
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
                    if (result.receipt_registration)
                        cheque.ReceiptStateId = this._convertReceiptStatusToState(result.receipt_registration);
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        cheque.chequeDate = new Date(ms);
                    }
                    if (result.confirmation && result.confirmation.confirmation_url)
                        rc.confirmationUrl = result.confirmation.confirmation_url;
                    if (result.payment_method && result.payment_method.saved)
                        cheque.isSaved = result.id === result.payment_method.id;
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: payment, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onCreateRefund(refund) {
        let op = {};
        return new Promise(resolve => {
            let chequeState = Accounting.ChequeState.Error;
            let rc = this._createRefund(refund, op)
                .then(result => {
                    chequeState = this._convertStatusToState(result.status);
                    let cheque = { chequeState: chequeState, id: result.id };
                    let rc = { isError: false, operation: op, req: refund, result: result, cheque: cheque };
                    if (result.receipt_registration)
                        cheque.ReceiptStateId = this._convertReceiptStatusToState(result.receipt_registration);
                    if (result.created_at) {
                        let ms = Date.parse(result.created_at);
                        cheque.chequeDate = new Date(ms);
                    }
                    return rc;
                }, err => {
                    return { isError: true, operation: op, req: refund, result: err, cheque: { chequeState: chequeState } };
                });
            resolve(rc);
        });
    }

    _onPreparePaymentFields(id, chequeTypeId, payment, invoice, userId, options) {
        let result = {}
        let paymentObject = result.paymentObject = _.cloneDeep(payment);
        let fields = result.fields = {};
        let user;
        return new Promise(resolve => {
            let id = invoice ? invoice.UserId : userId;
            resolve(UsersCache().getUserInfoById(id));
        })
            .then(result => {
                user = result;
                let rc;
                if (paymentObject.cheque_id) {
                    rc = this.get(paymentObject.cheque_id, options)
                        .then(cheque => {
                            if (cheque && cheque.data && (cheque.data.length === 1)) {
                                if (!cheque.data[0].IsSaved)
                                    throw new Error(`Cheque "cheque_id": "${paymentObject.cheque_id}" isn't saved.`);
                                paymentObject.payment_method_id = cheque.data[0].ChequeNum;
                                delete paymentObject.cheque_id;
                            }
                            else
                                throw new Error(`Cheque "cheque_id": "${paymentObject.cheque_id}" doesn't exist.`);
                        });
                }
                return rc;
            })
            .then(() => {
                let curr = invoice ? invoice.CurrencyCode : Accounting.DfltCurrencyCode;
                let sumStr = invoice ? invoice.Sum.toFixed(Accounting.SumPrecision) : (payment.amount ? payment.amount.value : null);
                let sum = parseFloat(sumStr);
                if (isNaN(sum) || (sum < Accounting.ComparePrecision))
                    throw new Error(`Invalid cheque sum: "${sum} ${curr}".`);
                paymentObject.amount = {
                    value: sumStr,
                    currency: curr
                }
                if (chequeTypeId === Accounting.ChequeType.Payment) {
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

                    paymentObject.metadata = {
                        ChequeId: id
                    };
                    if (invoice)
                        paymentObject.metadata.InvoiceId = invoice.Id;
                }

                paymentObject.description = chequeTypeId === Accounting.ChequeType.Payment ? "Оплата" : "Возврат";

                if (invoice) {
                    if (invoice.Name)
                        paymentObject.description = invoice.Name;
                    if (invoice.Items && (invoice.Items === 1) && (invoice.Items[0].Qty === 1))
                        paymentObject.description = invoice.Items[0].Name;
                    if (invoice.Items && (invoice.Items.length > 0)) {
                        let items = [];
                        paymentObject.receipt = { items: items };
                        if (paymentObject.phone) {
                            paymentObject.receipt.phone = paymentObject.phone;
                            fields.ReceiptPhone = paymentObject.phone;
                            delete paymentObject.phone;
                        }
                        else
                        {
                            paymentObject.receipt.email = paymentObject.email ? paymentObject.email : user.Email;
                            fields.ReceiptEmail = paymentObject.receipt.email;
                        };
                        delete paymentObject.email;
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

                fields.UserId = user.Id;
                fields.ChequeTypeId = chequeTypeId;
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

    isChequePaid(chequeData) {
        return chequeData && (chequeData.paid === true) && (chequeData.status === "succeeded") ? true : false;
    }

    getMeta(chequeData) {
        let res = chequeData && chequeData.metadata ? chequeData.metadata : null;
        if (res) {
            res.ChequeId = parseInt(res.ChequeId);
            res.InvoiceId = parseInt(res.InvoiceId);
            if (isNaN(res.ChequeId))
                delete res.ChequeId;
            if (isNaN(res.InvoiceId))
                delete res.InvoiceId;
        }
        return res;
    }
}

let yandexKassa = null;
exports.PaymentObject = (app) => {
    if (!yandexKassa)
        yandexKassa = new YandexKassa(app);
    return yandexKassa;
}