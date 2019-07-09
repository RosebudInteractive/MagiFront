const config = require('config');
const _ = require('lodash');
const { CacheableObject } = require('../utils/cache-base');
const { DbUtils: { intFmtWithLeadingZeros } } = require('./db-utils');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

exports.DbObject = class DbObject extends CacheableObject {

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
    }

    _convertMeta(metaStr) {
        let rc = null;
        if (metaStr) {
            try {
                rc = JSON.parse(metaStr);
            }
            catch (err) {
            }
            if (rc) {
                let path = this._absDataUrl + rc.path;
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
        let timeMsFlag = typeof (withTimeMs) === "boolean" ? withTimeMs : true;
        let result = "" + dt.getFullYear() + "-" +
            intFmtWithLeadingZeros((dt.getMonth() + 1), 2) + "-" + intFmtWithLeadingZeros(dt.getDate(), 2);
        if (withTime)
            result = result + " " + intFmtWithLeadingZeros(dt.getHours(), 2) + ":" + intFmtWithLeadingZeros(dt.getMinutes(), 2) +
                ":" + intFmtWithLeadingZeros(dt.getSeconds(), 2) +
                (timeMsFlag ? ("." + intFmtWithLeadingZeros(dt.getMilliseconds(), 3)) : '');
        return result;
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
