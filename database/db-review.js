'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { Product } = require('../const/product');
const { roundNumber } = require('../utils');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const REVIEW_REQ_TREE = {
    expr: {
        model: {
            name: "CourseReview"
        }
    }
};

const GET_REVIEW_MSSQL =
    "select r.[Id], r.[ReviewDate], r.[UserId], r.[CourseId], r.[Status], r.[UserName], r.[ProfileUrl],\n" +
    "  r.[Title], r.[Review], r.[ReviewPub]\n" +
    "from [CourseReview] r<%= where %>\n" +
    "order by r.[ReviewDate] desc";

const GET_REVIEW_MYSQL =
    "select r.`Id`, r.`ReviewDate`, r.`UserId`, r.`CourseId`, r.`Status`, r.`UserName`, r.`ProfileUrl`,\n" +
    "  r.`Title`, r.`Review`, r.`ReviewPub`\n" +
    "from `CourseReview` r<%= where %>\n" +
    "order by r.`ReviewDate` desc";

const WHERE_REVIEW_MSSQL = "\nwhere (r.[<%= field %>] =  <%= value %>)";
const WHERE_REVIEW_MYSQL = "\nwhere (r.`<%= field %>` =  <%= value %>)";
const COND_REVIEW_MSSQL = " and (r.[<%= field %>] =  <%= value %>)";
const COND_REVIEW_MYSQL = " and (r.`<%= field %>` =  <%= value %>)";

const DbReview = class DbReview extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || REVIEW_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    async get(options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let review = [];

        let where_mssql = "";
        let where_mysql = "";
        let is_first_cond = true;
        if (opts.id) {
            where_mysql += _.template(is_first_cond ? WHERE_REVIEW_MYSQL : COND_REVIEW_MYSQL)({ field: "Id", value: opts.id });
            where_mssql += _.template(is_first_cond ? WHERE_REVIEW_MSSQL : COND_REVIEW_MSSQL)({ field: "Id", value: opts.id });
            is_first_cond = false;
        }
        if (opts.status) {
            where_mysql += _.template(is_first_cond ? WHERE_REVIEW_MYSQL : COND_REVIEW_MYSQL)({ field: "Status", value: opts.status });
            where_mssql += _.template(is_first_cond ? WHERE_REVIEW_MSSQL : COND_REVIEW_MSSQL)({ field: "Status", value: opts.status });
            is_first_cond = false;
        }
        if (opts.course_id) {
            where_mysql += _.template(is_first_cond ? WHERE_REVIEW_MYSQL : COND_REVIEW_MYSQL)({ field: "CourseId", value: opts.course_id });
            where_mssql += _.template(is_first_cond ? WHERE_REVIEW_MSSQL : COND_REVIEW_MSSQL)({ field: "CourseId", value: opts.course_id });
            is_first_cond = false;
        }
        if (opts.user_id) {
            where_mysql += _.template(is_first_cond ? WHERE_REVIEW_MYSQL : COND_REVIEW_MYSQL)({ field: "UserId", value: opts.user_id });
            where_mssql += _.template(is_first_cond ? WHERE_REVIEW_MSSQL : COND_REVIEW_MSSQL)({ field: "UserId", value: opts.user_id });
            is_first_cond = false;
        }
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_REVIEW_MYSQL)({ where: where_mysql }),
                mssql: _.template(GET_REVIEW_MSSQL)({ where: where_mssql })
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length > 0)) {
            review = result.detail;
        };
        return review;
    }

    async update(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = _.cloneDeep(data || {});
        let reviewObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find review (Id = ${id}).`);

                    reviewObj = col.get(0);
                    await root_obj.edit();

                    this._setFieldValues(reviewObj, inpFields);
                    await root_obj.save(dbOpts);
                })
        }, memDbOptions)
            .then(async () => {
                let result = await this.get({ id: id });
                if (result && (result.length === 1))
                    return result[0]
                else
                    throw new Error(`Review Id = ${newId} doesn't exist.`);
            });
    }

    async insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = _.cloneDeep(data || {});
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    if (opts.statusOverride)
                        inpFields.Status = opts.statusOverride;
                    if (typeof (inpFields.ReviewPub) === "undefined")
                        inpFields.ReviewPub = inpFields.Review;
                    if (typeof (inpFields.ReviewDate) === "undefined")
                        inpFields.ReviewDate = new Date();
                    if ((typeof (inpFields.UserName) === "undefined") && (opts.user))
                        inpFields.UserName = opts.user.DisplayName;
                    
                    let newHandler = await root_obj.newObject({ fields: inpFields }, dbOpts);

                    newId = newHandler.keyValue;
                    await root_obj.save(dbOpts);
                })
        }, memDbOptions)
            .then(async () => {
                let result = await this.get({ id: newId });
                if (result && (result.length === 1))
                    return result[0]
                else
                    throw new Error(`Review Id = ${newId} doesn't exist.`);
            });
    }

    async del(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let reviewObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find review (Id = ${id}).`);

                    reviewObj = col.get(0);
                    await root_obj.edit();
                    col._del(reviewObj);

                    await root_obj.save(dbOpts);
                    return ({ result: "OK" });
                })
        }, memDbOptions);
    }
}

let dbReview = null;
exports.ReviewService = () => {
    return dbReview ? dbReview : dbReview = new DbReview();
}
