const config = require('config');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

exports.DbObject = class DbObject {

    constructor(options) {
        this._db = $memDataBase;
        this._dataPrefix = config.proxyServer.siteHost + config.dataUrl + "/";
    }

    _convertMeta(metaStr) {
        let rc = null;
        try {
            rc = JSON.parse(metaStr);
        }
        catch (err) {
        }
        if (rc) {
            let path = this._dataPrefix + rc.path;
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
                predicate
                    .addCondition(simple_condition);
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

    _dateToString(dt) {
        return "" + dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
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
