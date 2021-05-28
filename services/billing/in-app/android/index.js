'use strict';
const { URL, URLSearchParams } = require('url');
const _ = require('lodash');
const config = require('config');
const fs = require('fs');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis')
const { buildLogString } = require('../../../../utils');
const { HttpCode } = require('../../../../const/http-codes');
const { HttpError } = require('../../../../errors/http-error');
const { BaseInApp } = require('../base-in-app');
const { Accounting } = require('../../../../const/accounting');

const IN_APP_TBL_KEY_PREFIX = "_android_in_app_table";
const IN_APP_TBL_TTL_SEC = 1 * 60 * 60; // 1 hour
const ANDROID_PUBLISHER_URI = "https://www.googleapis.com/auth/androidpublisher";
const ANDROID_PUBLISHER_VERSION = "v3";
const PACKAGE_NAME = "ru.magisteria.magisteria_app";
const PLATFORM = "android";

const dbg_benchmark_test = false;

class AndroidInApp extends BaseInApp {

    get paymentType() {
        return Accounting.PaymentSystem.Android;
    }

    constructor(options) {
        let opts = options || {};
        opts.inAppTblKeyPrefix = IN_APP_TBL_KEY_PREFIX;
        opts.inAppTblTtlSec = IN_APP_TBL_TTL_SEC;
        opts.platform = PLATFORM;
        super(opts);

        this._credentials = config.has("mobileApp.android.credentialsPath") ?
            JSON.parse(fs.readFileSync(config.get("mobileApp.android.credentialsPath"))) : null;

        if (this._credentials)
            google.options({
                auth: new JWT(
                    this._credentials.client_email,
                    null,
                    this._credentials.private_key,
                    [ANDROID_PUBLISHER_URI],
                )
            });

        this._initInAppTable(dbg_benchmark_test);
    }

    async _checkConfirmed(product, product_confirmed) {
        let result = (product.productId === product_confirmed.productId) &&
            (product.orderId === product_confirmed.orderId) &&
            (product.purchaseDate === product_confirmed.purchaseDate);
        return result;
    }

    async _validatePurchase(data, cdata, options) {
        let product = null;
        try {
            if (data && data.transactionReceipt) {
                const androidpublisher = google.androidpublisher({ version: ANDROID_PUBLISHER_VERSION });

                const res = await androidpublisher.purchases.products.get({
                    // The package name of the application the inapp product was sold in (for example, 'com.some.thing').
                    packageName: PACKAGE_NAME,
                    // The inapp product SKU (for example, 'com.some.thing.inapp1').
                    productId: data.transactionReceipt.productId,
                    // The token provided to the user's device when the inapp product was purchased.
                    token: data.transactionReceipt.purchaseToken,
                });
                product = res.data;
                if (product.purchaseTimeMillis)
                    product.purchaseDate = +product.purchaseTimeMillis;
            }
            else
                throw new Error(`Missing field "transactionReceipt".`)
        }
        catch (error) {
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "invalidReceipt",
                message: error ? error.message : "Confirm: Invalid Receipt."
            });
        }
        if (product) {
            if (product.purchaseState !== 0)
                // https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products#ProductPurchase
                throw new HttpError(HttpCode.ERR_BAD_REQ, {
                    error: "invalidPurchaseState",
                    message: `"purchaseState" = ${product.purchaseState} (should be 0).`
                });
            product.productId = data.transactionReceipt.productId;
            if (cdata.inAppCode !== product.productId)
                throw new HttpError(HttpCode.ERR_BAD_REQ, {
                    error: "invalidProductId",
                    message: `Expected: "${cdata.inAppCode}" vs received: "${product.productId}".`
                });
        }
        else
            throw new HttpError(HttpCode.ERR_BAD_REQ, {
                error: "emptyReceipt",
                message: `Product is empty.`
            });
        return product;
    }

    async _getProviderInAppTable(options) {
        let opts = _.cloneDeep(options || {});
        let result = null;
        if (this._credentials) {
            try {
                const androidpublisher = google.androidpublisher({ version: ANDROID_PUBLISHER_VERSION });
                const res = await androidpublisher.inappproducts.list({
                    // How many results the list operation should return.
                    maxResults: '200',
                    // Package name of the app.
                    packageName: PACKAGE_NAME,
                    // The index of the first element to return.
                    startIndex: '0',
                    // Pagination token. If empty, list starts at the first product.
                    token: '',
                })
                if (res && res.data && Array.isArray(res.data.inappproduct)) {
                    result = [];
                    let prices = {};
                    for (let i = 0; i < res.data.inappproduct.length; i++) {
                        let elem = res.data.inappproduct[i];
                        if (elem.status === 'active') {
                            let price = (0 + elem.prices.RU.priceMicros) / 1e6;
                            if ((typeof (price) === "number") && (!isNaN(price))) {
                                if (!prices[price]) {
                                    result.push({
                                        Price: price,
                                        Code: elem.sku
                                    });
                                    prices[price] = true;
                                }
                            }
                        }
                    }
                    result.sort((a, b) => { return a.Price - b.Price; });
                }
            }
            catch (err) {
                console.error(buildLogString(err));
            }
        }
        return result;
    }
}

let androidInApp = null;
let getAndroidInApp = (options) => {
    if (!androidInApp)
        androidInApp = new AndroidInApp(options);
    return androidInApp;
};

exports.PaymentObject = getAndroidInApp;