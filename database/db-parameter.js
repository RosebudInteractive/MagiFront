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

const PARAMETER_REQ_TREE = {
    expr: {
        model: {
            name: "Parameters",
        }
    }
};

const PARAMETERS_ALL_MSSQL_REQ =
    "select [Id], [ParentId], [ParentInt], [Key], [Tp], [StrVal], [IntVal], [FloatVal], [DateVal] from [Parameters]";

const PARAMETERS_ALL_MYSQL_REQ =
    "select `Id`, `ParentId`, `ParentInt`, `Key`, `Tp`, `StrVal`, `IntVal`, `FloatVal`, `DateVal` from `Parameters`";

const PARAMETER_CACHE_PREFIX = "param:";
const CACHE_ALL_ID = "all";
const CACHE_ALL_PUB_ID = "all_pub";
const CACHE_ALL_TTL_IN_SEC = 60 * 60; //1 hour

const DbParameter = class DbParameter extends DbObject {

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = PARAMETER_CACHE_PREFIX;
        super(opts);
    }

    _getObjById(id, expression, options) {
        var exp = expression || PARAMETER_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    _getValueField(elem) {
        let rc = null;
        switch (elem.Tp) {
            case 0:
            case 4:
                rc = "StrVal";
                break;
            case 1:
                rc = "IntVal";
                break;
            case 2:
                rc = "FloatVal";
                break;
            case 3:
                rc = "DateVal";
                break;
            default:
                throw new Error(`DbParameter::_getValueField: Unknown parameter "${elem.Key}" type: ${elem.Tp}.`);
        };
        return rc;
    }

    getAllParameters(isPublic) {
        let parameters = isPublic ? {} : [];
        let cacheId = isPublic ? CACHE_ALL_PUB_ID : CACHE_ALL_ID;
        return this.cacheGet(cacheId)
            .then(val => {
                if (val)
                    return JSON.parse(val)
                else
                    return new Promise(resolve => {
                        resolve(
                            $data.execSql({
                                dialect: {
                                    mysql: _.template(PARAMETERS_ALL_MYSQL_REQ)(),
                                    mssql: _.template(PARAMETERS_ALL_MSSQL_REQ)()
                                }
                            }, {})
                        )
                    })
                        .then((result) => {
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach(elem => {
                                    if (isPublic) {
                                        parameters[elem.Key] = elem[this._getValueField(elem)];
                                    }
                                    else {
                                        let param = { Id: elem.Id, Key: elem.Key, Tp: elem.Tp };
                                        param.Value = elem[this._getValueField(elem)];
                                        parameters.push(param);
                                    }
                                })
                            }
                            return this.cacheSet(cacheId, JSON.stringify(parameters), { ttlInSec: CACHE_ALL_TTL_IN_SEC });
                        })
                        .then(() => { return parameters})
            });
    }

    update(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let paramCollection = null;
        let paramList = {};
        let paramData = data || [];

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjects(PARAMETER_REQ_TREE, null, dbOpts));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    paramCollection = root_obj.getCol("DataElements");
                    for (let i = 0; i < paramCollection.count(); i++) {
                        let param = paramCollection.get(i);
                        paramList[param.id()] = param;
                    }
                    return root_obj.edit();
                })
                .then(() => {

                    let newParams = [];
                    paramData.forEach(elem => {
                        let param = paramList[elem.Id];
                        if (param) {
                            if (param.key() !== elem.Key)
                                throw new Error(`Can't change parameter key from "${param.key()}" to "${elem.Key}" (Id=${elem.Id}).`);
                            if (param.tp() !== elem.Tp)
                                throw new Error(`Can't change parameter type from "${param.tp()}" to "${elem.Tp}" (Id=${elem.Id}).`);
                            param[this._genGetterName(this._getValueField(elem))](elem.Value);
                        }
                        else
                            newParams.push(elem);
                    })

                    if (newParams.length > 0)
                        return Utils.seqExec(newParams, (elem) => {
                            let fields = { ParentInt: 0, Key: elem.Key, Tp: elem.Tp };
                            fields[this._getValueField(elem)] = elem.Value;
                            return root_obj.newObject({
                                fields: fields
                            }, dbOpts);
                        });
                })
                .then(() => {
                    return root_obj.save(dbOpts);
                })
                .then((result) => {
                    if (result && result.detail && (result.detail.length > 0)) {
                        return this.cacheDel(CACHE_ALL_PUB_ID)
                            .then(() => { return this.cacheDel(CACHE_ALL_ID) });
                    }
                })
                .then(() => { return { result: "OK" } })
        }, memDbOptions);
    }
};

let dbParameter = null;
exports.ParametersService = () => {
    return dbParameter ? dbParameter : dbParameter = new DbParameter();
}
