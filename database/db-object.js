const { URL, URLSearchParams } = require('url');
const config = require('config');
const _ = require('lodash');
const request = require('request');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { CacheableObject } = require('../utils/cache-base');
const { DbUtils: { intFmtWithLeadingZeros, fmtDuration } } = require('./db-utils');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

exports.DbObject = class DbObject extends CacheableObject {

    static dateToString(dt, withTime, withTimeMs) {
        let timeMsFlag = typeof (withTimeMs) === "boolean" ? withTimeMs : true;
        let result = "" + dt.getFullYear() + "-" +
            intFmtWithLeadingZeros((dt.getMonth() + 1), 2) + "-" + intFmtWithLeadingZeros(dt.getDate(), 2);
        if (withTime)
            result = result + " " + intFmtWithLeadingZeros(dt.getHours(), 2) + ":" + intFmtWithLeadingZeros(dt.getMinutes(), 2) +
                ":" + intFmtWithLeadingZeros(dt.getSeconds(), 2) +
                (timeMsFlag ? ("." + intFmtWithLeadingZeros(dt.getMilliseconds(), 3)) : '');
        return result;
    }

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        let optsCache = opts.cache ? opts.cache : {};
        if (!optsCache.redis) {
            if (config.has("connections.redis"))
                optsCache.redis = _.cloneDeep(config.connections.redis);
        }
        super(optsCache);
        this._db = $memDataBase;
        this._baseUrl = config.proxyServer.siteHost + "/";
        this._absDataUrl = config.proxyServer.siteHost + config.dataUrl + "/";
        this._absDownLoadUrl = config.proxyServer.siteHost + config.downLoadUrl + "/";
        this._absCourseUrl = config.proxyServer.siteHost + config.courseUrl + "/";
        this._absAuthorUrl = config.proxyServer.siteHost + config.authorUrl + "/";
        this._absCategoryUrl = config.proxyServer.siteHost + config.categoryUrl + "/";
        this._absTestUrl = config.proxyServer.siteHost + config.testUrl + "/";
        this._absTestAppUrl = config.proxyServer.siteHost + config.testAppUrl + "/";
        this._absTestInstUrl = config.proxyServer.siteHost + config.testInstUrl + "/";
        this._absTestInstAppUrl = config.proxyServer.siteHost + config.testAppUrl + config.testInstUrl + "/";

    }

    _removeTrailingSlash(path) {
        return typeof (path) === "string" ?
            ((path.length > 0) && (path[path.length - 1] === "/") ? path.substr(0, path.length - 1) : path) : `${path}`;
    }

    _getAbsUrl(url, baseUrl) {
        let base = this._removeTrailingSlash(baseUrl ? baseUrl : this._baseUrl);
        return base + url + "/";
    }

    _getAbsTestInstUrl(baseUrl) {
        return this._getAbsUrl(config.testInstUrl, baseUrl);
    }

    _getAbsTestUrl(baseUrl) {
        return this._getAbsUrl(config.testUrl, baseUrl);
    }

    _getAbsTestAppUrl(baseUrl) {
        return this._getAbsUrl(config.testAppUrl, baseUrl);
    }

    _getAbsDataUrl(baseUrl) {
        return this._getAbsUrl(config.dataUrl, baseUrl);
    }

    _getAbsDownLoadUrl(baseUrl) {
        return this._getAbsUrl(config.downLoadUrl, baseUrl);
    }

    _getAbsCourseUrl(baseUrl) {
        return this._getAbsUrl(config.courseUrl, baseUrl);
    }

    _getAbsAuthorUrl(baseUrl) {
        return this._getAbsUrl(config.authorUrl, baseUrl);
    }

    _getAbsCategoryUrl(baseUrl) {
        return this._getAbsUrl(config.categoryUrl, baseUrl);
    }

    _isNumericString(str) {
        let result = false;
        if (typeof (str) === "string") {
            let res = str.match(/[0-9]*/);
            result = (res && (str.length > 0) && (res[0].length === str.length))
        }
        return result;
    }

    _convertDataUrl(url, isAbsPath, dLink, baseUrl) {
        let absDataUrl = baseUrl ? this._getAbsDataUrl(baseUrl) : this._absDataUrl;
        let absDownLoadUrl = baseUrl ? this._getAbsDownLoadUrl(baseUrl) : this._absDownLoadUrl;
        let rc = (isAbsPath || dLink) ? (url ? ((dLink ? absDownLoadUrl : absDataUrl) + url) : null) : url;
        return rc;
    }

    _convertMeta(metaStr, isAbsPath, dLink, baseUrl) {
        let rc = metaStr;
        if (metaStr && (isAbsPath || dLink)) {
            let absDataUrl = baseUrl ? this._getAbsDataUrl(baseUrl) : this._absDataUrl;
            let absDownLoadUrl = baseUrl ? this._getAbsDownLoadUrl(baseUrl) : this._absDownLoadUrl;
            try {
                rc = JSON.parse(metaStr);
            }
            catch (err) {
                rc = null;
            }
            if (rc) {
                let path = (dLink ? absDownLoadUrl : absDataUrl) + rc.path;
                if (rc.content) {
                    if (rc.content.l)
                        rc.content.l = path + rc.content.l;
                    if (rc.content.m)
                        rc.content.m = path + rc.content.m;
                    if (rc.content.s)
                        rc.content.s = path + rc.content.s;
                }
                if (rc.icon)
                    rc.icon = path + rc.icon;
            }
        }
        return rc;
    }

    _genGetterName(fname) {
        var res = fname;
        if (fname.length > 0) {
            res = fname[0].toLowerCase() + fname.substring(1);
        };
        return res;
    }

    _buildLists(ignore, allow) {
        let ignore_list;
        let allow_list = null;
        if (Array.isArray(allow) && (allow.length > 0)) {
            allow_list = {};
            allow.forEach(elem => { allow_list[elem] = 1 })
        }
        if (Array.isArray(ignore) && (ignore.length > 0)) {
            ignore_list = {};
            ignore.forEach(elem => { ignore_list[elem] = 1 })
        }
        else
            ignore_list = ignore || { Id: 1 };
        return { ignore_list: ignore_list, allow_list: allow_list };
    }

    async _getFieldValues(obj, fields, ignore, allow) {
        let { fields: field_defs } = await $data.getFieldDefs({ name: obj.modelName });
        let { ignore_list, allow_list } = this._buildLists(ignore, allow);
        for (let i = 0; i < field_defs.length; i++) {
            let { name: fld } = field_defs[i];
            if ((ignore_list[fld] === undefined) && ((!allow_list) || allow_list[fld])) {
                let method = this._genGetterName(fld);
                if (typeof (obj[method]) === "function")
                    fields[fld] = obj[method]();
            }
        }
    }

    _setFieldValues(obj, fields, ignore, allow) {
        let { ignore_list, allow_list } = this._buildLists(ignore, allow);
        for (let fld in fields) {
            if ((ignore_list[fld] === undefined) && ((!allow_list) || allow_list[fld])) {
                let method = this._genGetterName(fld);
                if (typeof (obj[method]) === "function")
                    obj[method](fields[fld]);
            }
        }
    }

    _getObjById(id, expression, options) {
        return new MemDbPromise(this._db, (resolve) => {
            if (!expression)
                throw new Error("DbObject::_getObjById: Invalid parameter \"expression\": " + JSON.stringify(expression));
            let exp_filtered = Object.assign({}, expression);

            var predicate = new Predicate(this._db, {});
            predicate
                .addCondition({ field: "Id", op: "=", value: id });
            exp_filtered.expr.predicate = predicate.serialize(true);
            this._db._deleteRoot(predicate.getRoot());

            resolve(
                this._db.getData(Utils.guid(), null, null, exp_filtered, options)
                    .then((result) => {
                        if (result && result.guids && (result.guids.length === 1)) {
                            let obj = this._db.getObj(result.guids[0]);
                            if (!obj)
                                throw new Error("DbObject::_getObjById: Object doesn't exist: " + result.guids[0]);
                            return obj;
                        }
                        else
                            throw new Error("DbObject::_getObjById: Invalid result of \"getData\": " + JSON.stringify(result));
                    })
            );
        });
    }

    _getObjects(expression, simple_condition, options) {
        return new MemDbPromise(this._db, (resolve) => {
            if (!expression)
                throw new Error("DbObject::_getObjects: Invalid parameter \"expression\": " + JSON.stringify(expression));
            let exp_filtered = Object.assign({}, expression);

            if (simple_condition) {
                let predicate = new Predicate(this._db, {});
                let conds = [];
                if (Array.isArray(simple_condition))
                    conds = simple_condition
                else
                    conds.push(simple_condition);
                conds.forEach(elem=>{
                    predicate.addCondition(elem);
                })
                exp_filtered.expr.predicate = predicate.serialize(true);
                this._db._deleteRoot(predicate.getRoot());
            }
            resolve(
                this._db.getData(Utils.guid(), null, null, exp_filtered, options)
                    .then((result) => {
                        if (result && result.guids && (result.guids.length === 1)) {
                            let obj = this._db.getObj(result.guids[0]);
                            if (!obj)
                                throw new Error("DbObject::_getObjects: Object doesn't exist: " + result.guids[0]);
                            return obj;
                        }
                        else
                            throw new Error("DbObject::_getObjects: Invalid result of \"getData\": " + JSON.stringify(result));
                    })
            );
        });
    }

    _dateToString(dt, withTime, withTimeMs) {
        return DbObject.dateToString(dt, withTime, withTimeMs);
    }

    async _getVideoInfo(url) {
        const TIME_REGEXP = /PT(([0-9]+)H)*(([0-9]+)M)*(([0-9]+)S)*/i;
        const ID_REGEXP = /https:\/\/www.youtube.com\/embed\/(.+)/i;
        const YOUTUBE_API_VIDEO_BASE_URL = "https://www.googleapis.com/youtube/v3/videos";

        let res = { fmt: "", sec: 0 };
        if (url) {
            let match = url.toString().match(ID_REGEXP);
            if (match && Array.isArray(match) && (match.length === 2)) {
                let id = match[1];
                return new Promise((resolve, reject) => {
                    let reqUrl = new URL(YOUTUBE_API_VIDEO_BASE_URL);
                    reqUrl.searchParams.append('id', id);
                    reqUrl.searchParams.append('part', 'contentDetails');
                    reqUrl.searchParams.append('fields', 'items(contentDetails(duration))');
                    reqUrl.searchParams.append('key', config.authentication.googleAppId);
                    request(reqUrl.href, (error, response, body) => {
                        if (error) {
                            console.error(buildLogString(`YouTube request error: "${error.message}"` +
                                ` API: "${reqUrl.href}"`));
                            reject(error);
                        }
                        else {
                            if (response.statusCode === HttpCode.OK) {
                                try {
                                    let result = JSON.parse(body);
                                    if (result && result.items && (result.items.length > 0)
                                        && result.items[0].contentDetails && result.items[0].contentDetails.duration) {
                                        let timeString = "" + result.items[0].contentDetails.duration;
                                        match = timeString.match(TIME_REGEXP);
                                        if (match && Array.isArray(match) && (match.length === 7)) {
                                            if (match[2])
                                                res.sec += (+match[2]) * 3600;
                                            if (match[4])
                                                res.sec += (+match[4]) * 60;
                                            if (match[6])
                                                res.sec += (+match[6]);
                                            if (res.sec > 1)
                                                res.sec--;
                                            res.fmt = fmtDuration(res.sec);
                                            resolve(res);
                                        }
                                        throw new Error(`Incorrect duration format: "${timeString}"`);
                                    }
                                    else
                                        throw new Error(`Incorrect result of YouTube request: "${body}"`);
                                }
                                catch (err) {
                                    reject(err);
                                };
                            }
                            else
                                reject(new Error(`YouTube request error: HttpCode: ${response.statusCode}, Body: ${body}`));
                        }
                    });

                });
            }
            else
                throw new Error(`Invalid video URL: "${url}"`);
        }
        return res;
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    get(id) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    del(id) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    insert(data) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }
}
