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
const { BaseInApp } = require('../base-in-app');
const { Accounting } = require('../../../../const/accounting');

const IN_APP_TBL_KEY_PREFIX = "_ios_in_app_table";
const IN_APP_TBL_TTL_SEC = 1 * 60 * 60; // 1 hour
const TOKEN_EXP_SEC = 60 * 20; // 20 min
const APP_STORE_PRICE_POINTS_URI = "https://api.appstoreconnect.apple.com/v1/appPricePoints";
const MIN_ID = 1;
const MAX_ID = 87;
const IN_APP_TEMPLATE = "price_<%= id %>_consumable";
const DFLT_ENVIRONMENT = "production";
const PLATFORM = "ios";

const dbg_benchmark_test = false;

class IosInApp extends BaseInApp {

    get paymentType() {
        return Accounting.PaymentSystem.Ios;
    }

    constructor(options) {
        let opts = options || {};
        opts.inAppTblKeyPrefix = IN_APP_TBL_KEY_PREFIX;
        opts.inAppTblTtlSec = IN_APP_TBL_TTL_SEC;
        opts.platform = PLATFORM;
        super(opts);

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
                environment: [this._environment],
                // excludeOldTransactions: true
            });

        this._initInAppTable(dbg_benchmark_test);
    }

    async _checkConfirmed(product, product_confirmed) {
        let result = (product.productId === product_confirmed.productId) &&
            (product.originalTransactionId === product_confirmed.originalTransactionId) &&
            (product.purchaseDate === product_confirmed.purchaseDate);
        return result;
    }

    async _validatePurchase(data, cdata, options) {
        let product = null;
        let products;
        try {
            products = await appleReceiptVerify.validate({
                // excludeOldTransactions: true,
                receipt: data.transactionReceipt
            });
        }
        catch (error) {
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "invalidReceipt",
                message: error ? error.message : "Confirm: Invalid Receipt."
            });
        }
        if (Array.isArray(products) && (products.length > 0)) {
            for (let i = 0; i < products.length; i++) {
                if (products[i].transactionId === data.transactionOrderId) {
                    product = products[i];
                    break;
                }
            }
            if (!product)
                throw new HttpError(HttpCode.ERR_BAD_REQ, {
                    error: "invalidtransactionId",
                    message: `Transaction "${data.transactionOrderId}" doesn't exist.`
                });

            if (cdata.inAppCode !== product.productId)
                throw new HttpError(HttpCode.ERR_BAD_REQ, {
                    error: "invalidProductId",
                    message: `Expected: "${cdata.inAppCode}" vs received: "${product.productId}".`
                });
        }
        else
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "emptyReceipt",
                message: `Product list is empty.`
            });
        return product;
    }

    async _getProviderInAppTable(options) {
        let opts = _.cloneDeep(options || {});
        let result = null;
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
                    for (let i = 0; i < res.data.length; i++) {
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
                }
            }
            catch (err) {
                console.error(buildLogString(err));
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