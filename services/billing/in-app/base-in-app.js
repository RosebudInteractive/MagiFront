'use strict';
const _ = require('lodash');
const config = require('config');
const { Payment } = require('../payment');
const { buildLogString } = require('../../../utils');
const { HttpCode } = require('../../../const/http-codes');
const { HttpError } = require('../../../errors/http-error');
const { Accounting } = require('../../../const/accounting');
const { UsersCache } = require('../../../security/users-cache');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const IN_APP_TBL_TTL_SEC = 1 * 60 * 60; // 1 hour

exports.BaseInApp = class BaseInApp extends Payment {

    constructor(options) {
        let opts = options || {};
        super(opts);
        this._table_cache = null;
        this._inAppTblKeyPrefix = opts.inAppTblKeyPrefix;
        this._platform = opts.platform;
        if (!this._inAppTblKeyPrefix)
            throw new Error(`BaseInApp::constructor: Missing "inAppTblKeyPrefix" parameter!`);
        if (!this._platform)
            throw new Error(`BaseInApp::constructor: Missing "platform" parameter!`);
        this._inAppTblTtlSec = opts.inAppTblTtlSec ? opts.inAppTblTtlSec : IN_APP_TBL_TTL_SEC;
        if (opts.app)
            this._initRoutes(options.app);

    }

    async getInAppPricer() {
        await this._getInAppTable();
        return this._findNearestInApp.bind(this);
    }

    async _onCreatePayment(payment) {
        let cheque = { chequeState: Accounting.ChequeState.Pending, id: `${this._platform}_in_app_${payment.id}`, chequeDate: new Date() };
        let rc = { isError: false, operation: null, result: payment, cheque: cheque };
        return rc;
    }

    async _onPreparePaymentFields(id, chequeTypeId, payment, invoice, userId, options) {
        let result = {}
        let paymentObject = result.paymentObject = _.cloneDeep(payment);
        paymentObject.id = id;
        let fields = result.fields = {};

        let user = await UsersCache().getUserInfoById(invoice ? invoice.UserId : userId);

        let curr = invoice ? invoice.CurrencyCode : Accounting.DfltCurrencyCode;
        let sumStr = invoice ? invoice.Sum.toFixed(Accounting.SumPrecision) : (payment.amount ? payment.amount.value : null);
        let sum = parseFloat(sumStr);
        if (isNaN(sum) || (sum < Accounting.ComparePrecision))
            throw new Error(`Invalid cheque sum: "${sum} ${curr}".`);
        paymentObject.amount = {
            value: sumStr,
            currency: curr
        }

        paymentObject.description = chequeTypeId === Accounting.ChequeType.Payment ? "Оплата" : "Возврат";

        if (invoice) {
            paymentObject.invoiceId = invoice.Id;
            if (invoice.Name)
                paymentObject.description = invoice.Name;
            if (invoice.Items && (invoice.Items === 1) && (invoice.Items[0].Qty === 1))
                paymentObject.description = invoice.Items[0].Name;
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
    }

    async insert(data, options) {
        let courseService = this.getService("courses");
        let course = await courseService.getPriceInfo(data.courseId, options.user, { mobile_app: this._platform });
        if (!course.ProductId)
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "missingProductId",
                message: "Курс не может быть продан."
            });
        if (!(course.InAppPrices && course.InAppPrices[this._platform] && course.InAppPrices[this._platform].Price))
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "missingPlatformPrice",
                message: `Курс не продается на платформе "${this._platform}".`
            });
        let { Price, Code } = course.InAppPrices[this._platform].DPrice ?
            course.InAppPrices[this._platform].DPrice : course.InAppPrices[this._platform].Price;
        let pay_data = {
            courseId: data.courseId,
            buyAsGift: false,
            Payment: {
                inAppCode: Code,
                email: options.user.Email
            },
            Invoice: {
                UserId: options.user.Id,
                InvoiceTypeId: Accounting.InvoiceType.Purchase,
                Items: [
                    {
                        ProductId: course.ProductId,
                        Price: Price
                    }
                ]
            }
        }
        return super.insert(pay_data, options);
    }

    async confirm(id, data, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let memDbOptions = { dbRoots: [] };
        let chequeObj;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getCheque(id, dbOpts));
            })
                .then(async (result) => {
                    let root_obj = result;
                    let is_already_confirmed = false;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);
                    chequeObj = collection.get(0);

                    if (chequeObj.paymentType() !== this.paymentType)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);

                    if (chequeObj.stateId() !== Accounting.ChequeState.Pending)
                        if (chequeObj.stateId() === Accounting.ChequeState.Succeeded)
                            is_already_confirmed = true
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);

                    let cdata = chequeObj.chequeData() ? JSON.parse(chequeObj.chequeData()) : {};
                    if (!cdata.inAppCode)
                        throw new HttpError(HttpCode.ERR_BAD_REQ, {
                            error: "missingInAppCode",
                            message: `Payment ID="${id}" isn't "${this._platform}" in-app purchase.`
                        });

                    let product = await this._validatePurchase(data, cdata, options);
                    if (is_already_confirmed) {
                        let product_confirmed = chequeObj.receiptData() ? JSON.parse(chequeObj.receiptData()) : null;
                        if(!product_confirmed)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);
                        let res = await this._checkConfirmed(product, product_confirmed);
                        if(!res)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);
                        throw new HttpError(HttpCode.ERR_BAD_REQ, {
                            error: "alreadyConfirmed",
                            message: `Payment ID="${id}" is already confirmed.`
                        });
                    }
                    return this._updateChequeState({
                        isError: false,
                        result: JSON.parse(chequeObj.chequeData()),
                        cheque: {
                            chequeState: Accounting.ChequeState.Succeeded,
                            ReceiptDate: typeof (product.purchaseDate) === "number" ? new Date(product.purchaseDate) : undefined,
                            ReceiptData: product
                        }
                    }, root_obj, { chequeObj: chequeObj }, dbOpts, memDbOptions, undefined, { purchaseEmailNotification: false });
                })
        }, memDbOptions)
            .then(() => { return { id: id } });
    }

    async _initInAppTable(dbg_benchmark_test) {
        this._getInAppTable()
            .then(data => {
                if (dbg_benchmark_test) {
                    const NOP = 10000;
                    const start = process.hrtime.bigint();
                    for (let i = 0; i < NOP; i++) {
                        let val = Math.round(Math.random() * 5000 + 500);
                        let res = this._findNearestInApp(val);
                        if (!res)
                            console.error(`Value ${val} is not found!`);
                    }
                    const end = process.hrtime.bigint();
                    console.error(buildLogString(`### Search in-app price performance: ${((1e9 * NOP) / Number(end - start)).toFixed(2)} op/sec`));
                }
            });
    }

    _findNearestInApp(price) {
        let _find = (data, min, max, price) => {
            let middle = Math.round((max - min) / 2) + min;
            let celem = data[middle];
            let cprice = celem.Price;
            let is_finished = false;
            let is_ok = false;
            let new_min = min;
            let new_max = max;
            if (cprice < price) {
                new_min = ++middle;
            }
            else
                if (cprice > price) {
                    new_max = --middle;
                    is_ok = true;
                }
                else
                    is_finished = true;
            let result;
            if (is_finished)
                result = celem
            else
                if (new_min > new_max) {
                    result = is_ok ? celem : (new_min < data.length ? data[new_min] : null);
                }
                else
                    result = _find(data, new_min, new_max, price);
            return result;
        }
        return this._table_cache && (this._table_cache.data.length > 0) ?
            _find(this._table_cache.data, 0, this._table_cache.data.length - 1, price) : null;
    }

    async _getInAppTable(options) {
        let key = `${this._inAppTblKeyPrefix}`;

        let result = null;
        let redis_ts = await this.cacheHget(key, "ts", { json: true });
        if (redis_ts) {
            if ((!this._table_cache) || (this._table_cache.ts !== redis_ts)) {
                let val = await this.cacheHgetAll(key, { json: true });
                if (val && val.ts && val.data) {
                    this._table_cache = val;
                    result = val.data;
                }
            }
            else
                result = this._table_cache.data ? this._table_cache.data : null;
        }
        if (!result) {
            this._table_cache = null;
            try {
                result = await this._getProviderInAppTable(options);
            }
            catch (err) {
                console.error(buildLogString(err));
            };
            if (result) {
                await this.cacheHset(key, "data", result, { json: true });
                let ts = 't' + ((new Date()) - 0);
                await this.cacheHset(key, "ts", ts, { json: true });
                await this.cacheExpire(key, IN_APP_TBL_TTL_SEC);
                this._table_cache = { ts: ts, data: result };
            }
        }
        return result;
    }

    async _checkConfirmed(product, product_confirmed) {
        throw new Error(`BaseInApp::_checkConfirmed: Must be implemented in descendant!`);
    }

    async _getProviderInAppTable(options) {
        throw new Error(`BaseInApp::_getProviderInAppTable: Must be implemented in descendant!`);
    }

    async _validatePurchase(data, cdata, options) {
        throw new Error(`BaseInApp::_validatePurchase: Must be implemented in descendant!`);
    }

    _initRoutes(app) {
        app.post(`/api/payments/${this._platform}`, async (req, res, next) => {
            try {
                if (req.user) {
                    if (req.body && req.campaignId)
                        req.body.campaignId = req.campaignId;
                    let result = await this.insert(req.body, {
                        user: req.user,
                        debug: config.billing.debug ? true : false,
                        dbOptions: { userId: req.user.Id }
                    })
                    res.send({ result: "OK", paymentData: result });
                }
                else
                    res.status(HttpCode.ERR_UNAUTH).json({ result: "ERROR", message: "Authorization required." });
            }
            catch (err) {
                next(err);
            }
        });

        app.put(`/api/payments/${this._platform}/:id/confirm`, async (req, res, next) => {
            try {
                if (req.user) {
                    let result = await this.confirm(parseInt(req.params.id), req.body, {
                        user: req.user,
                        debug: config.billing.debug ? true : false,
                        dbOptions: { userId: req.user.Id }
                    })
                    res.send({ result: "OK", paymentData: result });
                }
                else
                    res.status(HttpCode.ERR_UNAUTH).json({ result: "ERROR", message: "Authorization required." });
            }
            catch (err) {
                next(err);
            }
        });
    }
}