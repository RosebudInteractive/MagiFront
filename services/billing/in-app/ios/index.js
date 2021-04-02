'use strict';
const { URL, URLSearchParams } = require('url');
const _ = require('lodash');
const config = require('config');
const got = require('got');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { buildLogString } = require('../../../../utils');
const { HttpCode } = require("../../../../const/http-codes");
const { Payment } = require('../../payment');
const { Accounting } = require('../../../../const/accounting');
const { UsersCache } = require("../../../../security/users-cache");

const IN_APP_TBL_KEY_PREFIX = "_ios_in_app_table";
const IN_APP_TBL_TTL_SEC = 1 * 60 * 60; // 1 hour
const TOKEN_EXP_SEC = 60 * 20; // 20 min
const APP_STORE_PRICE_POINTS_URI = "https://api.appstoreconnect.apple.com/v1/appPricePoints";
const MIN_ID = 1;
const MAX_ID = 87;
const IN_APP_TEMPLATE = "price_<%= id %>_consumable";

const dbg_benchmark_test = false;

class IosInApp extends Payment {

    constructor(options) {
        super(options);
        this._table_cache = null;

        this._private_key = config.has("mobileApp.ios.pkPath") ? fs.readFileSync(config.get("mobileApp.ios.pkPath")) : null;
        this._app_key_id = config.has("mobileApp.ios.apiKeyId") ? config.get("mobileApp.ios.apiKeyId") : null;
        this._issuer_id = config.has("mobileApp.ios.issuerId") ? config.get("mobileApp.ios.issuerId") : null;
        this._min_id = config.has("mobileApp.ios.inApps.minId") ? config.get("mobileApp.ios.inApps.minId") : MIN_ID;
        this._max_id = config.has("mobileApp.ios.inApps.maxId") ? config.get("mobileApp.ios.inApps.maxId") : MAX_ID;
        this._template = config.has("mobileApp.ios.template") ? config.get("mobileApp.ios.template") : IN_APP_TEMPLATE;

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
    
    _findNearestInApp(price) {
        let _find = (data, min, max, price) => {
            let middle = Math.round((max - min) / 2) + min;
            let celem = data[middle];
            let cprice = celem.price;
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
                                    price: price,
                                    code: _.template(this._template)({ id: id })
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
exports.PaymentObject = (app) => {
    if (!iosInApp)
        iosInApp = new IosInApp(app);
    return iosInApp;
}