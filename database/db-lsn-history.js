const _ = require('lodash');
const config = require('config');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { getTimeStr, buildLogString } = require('../utils');
const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;
const { LessonPos } = require('../const/lesson-pos');

const PARAMETER_REQ_TREE = {
    expr: {
        model: {
            name: "LsnHistory",
        }
    }
};

const LsnHistory = class LsnHistory extends DbObject {

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = LessonPos.KEY_HIST_PREFIX;
        super(opts);
    }

    _getObjById(id, expression, options) {
        var exp = expression || PARAMETER_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpData = data ? (Array.isArray(data) ? data : [data]) : [];

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjects(PARAMETER_REQ_TREE, { field: "Id", op: "=", value: -1 }, dbOpts));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    if (inpData.length > 0)
                        return Utils.seqExec(inpData, (elem) => {
                            return root_obj.newObject({
                                fields: elem
                            }, dbOpts);
                        });
                })
                .then(() => {
                    return root_obj.save(dbOpts);
                })
                .then(() => { return { result: "OK" } })
        }, memDbOptions);
    }
};

let lsnHistory = null;
exports.LsnHistoryService = (options) => {
    return lsnHistory ? lsnHistory : lsnHistory = new LsnHistory(options);
}
