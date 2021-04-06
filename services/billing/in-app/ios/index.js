'use strict';
const { URL, URLSearchParams } = require('url');
const _ = require('lodash');
const config = require('config');
const got = require('got');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const appleReceiptVerify = require('node-apple-receipt-verify');
const { buildLogString } = require('../../../../utils');
const { HttpCode } = require('../../../../const/http-codes');
const { HttpError } = require('../../../../errors/http-error');
const { Payment } = require('../../payment');
const { Accounting } = require('../../../../const/accounting');
const { UsersCache } = require('../../../../security/users-cache');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const IN_APP_TBL_KEY_PREFIX = "_ios_in_app_table";
const IN_APP_TBL_TTL_SEC = 1 * 60 * 60; // 1 hour
const TOKEN_EXP_SEC = 60 * 20; // 20 min
const APP_STORE_PRICE_POINTS_URI = "https://api.appstoreconnect.apple.com/v1/appPricePoints";
const MIN_ID = 1;
const MAX_ID = 87;
const IN_APP_TEMPLATE = "price_<%= id %>_consumable";
const DFLT_ENVIRONMENT = "production";

const dbg_benchmark_test = false;

class IosInApp extends Payment {

    get paymentType() {
        return Accounting.PaymentSystem.Ios;
    }

    constructor(options) {
        super(options);
        this._table_cache = null;

        this._private_key = config.has("mobileApp.ios.pkPath") ? fs.readFileSync(config.get("mobileApp.ios.pkPath")) : null;
        this._app_key_id = config.has("mobileApp.ios.apiKeyId") ? config.get("mobileApp.ios.apiKeyId") : null;
        this._issuer_id = config.has("mobileApp.ios.issuerId") ? config.get("mobileApp.ios.issuerId") : null;
        this._min_id = config.has("mobileApp.ios.inApps.minId") ? config.get("mobileApp.ios.inApps.minId") : MIN_ID;
        this._max_id = config.has("mobileApp.ios.inApps.maxId") ? config.get("mobileApp.ios.inApps.maxId") : MAX_ID;
        this._template = config.has("mobileApp.ios.template") ? config.get("mobileApp.ios.template") : IN_APP_TEMPLATE;
        this._shared_secret = config.has("mobileApp.ios.sharedSecret") ? config.get("mobileApp.ios.sharedSecret") : null;
        this._environment = config.has("mobileApp.ios.environment") ? config.get("mobileApp.ios.environment") : DFLT_ENVIRONMENT;

        if (this._shared_secret)
            appleReceiptVerify.config({
                secret: this._shared_secret,
                environment: [this._environment]
            });

        if (options && options.app)
            this._initRoutes(options.app);
        
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

    async getInAppPricer() {
        await this._getInAppTable();
        return this._findNearestInApp.bind(this);
    }

    async insert(data, options) {
        let courseService = this.getService("courses");
        let course = await courseService.getPriceInfo(data.courseId, options.user, { mobile_app: "ios" });
        if(!course.ProductId)
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "missingProductId",
                message: "Курс не может быть продан."
            });
        if (!(course.InAppPrices && course.InAppPrices.ios && course.InAppPrices.ios.Price))
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "missingIosPrice",
                message: 'Курс не продается на платформе "iOS".'
            });
        let { Price, Code } = course.InAppPrices.ios.DPrice ? course.InAppPrices.ios.DPrice : course.InAppPrices.ios.Price;
        let pay_data = {
            courseId: data.courseId,
            buyAsGift: false,
            Payment: {
                InAppCode: Code,
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
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);
                    chequeObj = collection.get(0);
                    if (chequeObj.stateId() !== Accounting.ChequeState.Pending)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);
                    if (chequeObj.paymentType() !== this.paymentType)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Payment ID="${id}" doesn't exist.`);

                    let cdata = chequeObj.chequeData() ? JSON.parse(chequeObj.chequeData()) : {};
                    if (!cdata.InAppCode)
                        throw new HttpError(HttpCode.ERR_BAD_REQ, {
                            error: "missingInAppCode",
                            message: `Payment ID="${id}" isn't IOS in-app purchase.`
                        });

                    let products;
                    try {
                        products = await appleReceiptVerify.validate({
                            excludeOldTransactions: true,
                            receipt: data.receipt
                        });
                        if (Array.isArray(products) && (products.length > 0)) {
                            if (cdata.InAppCode !== products[0].productId)
                                throw new HttpError(HttpCode.ERR_BAD_REQ, {
                                    error: "invalidProductId",
                                    message: `Expected: "${cdata.InAppCode}" vs received: "${products[0].productId}".`
                                });
                        }
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                                error: "emptyReceipt",
                                message: `Product list is empty.`
                            });
                    }
                    catch (error) {
                        throw error;
                    }
                    
                    return this._updateChequeState({
                        isError: false,
                        result: JSON.parse(chequeObj.chequeData()),
                        cheque: {
                            chequeState: Accounting.ChequeState.Succeeded,
                            ReceiptDate: typeof (products[0].purchaseDate) === "number" ? new Date(products[0].purchaseDate) : undefined,
                            ReceiptData: products[0]
                        }
                    }, root_obj, { chequeObj: chequeObj }, dbOpts, memDbOptions, undefined, { purchaseEmailNotification: false });
                })
        }, memDbOptions)
            .then(() => { return { id: id } });
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

    async _onCreatePayment(payment) {
        let cheque = { chequeState: Accounting.ChequeState.Pending, id: `ios_in_app_${payment.id}`, chequeDate: new Date() };
        let rc = { isError: false, operation: null, result: payment, cheque: cheque };
        return rc;
    }

    _initRoutes(app) {
        app.post('/api/payments/ios', async (req, res, next) => {
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
        
        app.put('/api/payments/ios/:id/confirm', async (req, res, next) => {
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
        return this._table_cache ? _find(this._table_cache.data, 0, this._table_cache.data.length - 1, price) : null;
    }

    async _getInAppTable(options) {
        let opts = _.cloneDeep(options || {});
        let key = `${IN_APP_TBL_KEY_PREFIX}`;

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
            if (this._private_key && this._app_key_id && this._issuer_id) {

                let now = Math.round((new Date()).getTime() / 1000); // Notice the /1000 
                let nowPlusExp = now + TOKEN_EXP_SEC;

                let payload = {
                    "iss": this._issuer_id,
                    "exp": nowPlusExp,
                    "aud": "appstoreconnect-v1"
                }

                let signOptions = {
                    "algorithm": "ES256", // you must use this algorythm, not jsonwebtoken's default
                    header: {
                        "alg": "ES256",
                        "kid": this._app_key_id,
                        "typ": "JWT"
                    }
                };

                let token = jwt.sign(payload, this._private_key, signOptions);
                
                try {
                    let res = await got(APP_STORE_PRICE_POINTS_URI,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            searchParams: {
                                limit: 200,
                                "filter[territory]": "RUS",
                                include: "priceTier"
                            },
                            throwHttpErrors: false
                        }).json();

                    if (res && Array.isArray(res.data)) {
                        result = [];
                        for (let i = 0; i < res.data.length; i++){
                            let elem = res.data[i];
                            let price = +elem.attributes.customerPrice;
                            let id = +elem.relationships.priceTier.data.id;
                            if (id > this._max_id)
                                break;
                            if (id >= this._min_id) {
                                result.push({
                                    Price: price,
                                    Code: _.template(this._template)({ id: id })
                                })
                            }
                        }

                        await this.cacheHset(key, "data", result, { json: true });
                        let ts = 't' + ((new Date()) - 0);
                        await this.cacheHset(key, "ts", ts, { json: true });
                        await this.cacheExpire(key, IN_APP_TBL_TTL_SEC);
                        this._table_cache = { ts: ts, data: result };
                    }
                }
                catch (err) {
                    console.error(buildLogString(err));
                }
            }
        }
        return result;
    }
}

let iosInApp = null;
let getIosInApp = (options) => {
    if (!iosInApp)
        iosInApp = new IosInApp(options);
    return iosInApp;
};

exports.PaymentObject = getIosInApp;