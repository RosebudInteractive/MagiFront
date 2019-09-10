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

const GET_COMPLETED_MSSQL =
    "select <%= limit %>h.[UserId], h.[LessonId], sum(h.[LsnTime])[LsnTime], max(ll.[Duration])[Duration]\n" +
    "from[LsnHistory] h\n" +
    "  join[User] u on u.[SysParentId] = h.[UserId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = h.[LessonId]\n" +
    "  left join[CompletedLesson] c on(c.[LessonId] = h.[LessonId]) and(c.[UserId] = h.[UserId])\n" +
    "where c.[Id] is NULL\n" +
    "group by h.[UserId], h.[LessonId]\n" +
    "having sum(h.[LsnTime]) >= (<%= completion_coeff %> * max(ll.[Duration]))";

const GET_COMPLETED_MYSQL =
    "select h.`UserId`, h.`LessonId`, sum(h.`LsnTime`)`LsnTime`, max(ll.`Duration`)`Duration`\n" +
    "from`LsnHistory` h\n" +
    "  join`User` u on u.`SysParentId` = h.`UserId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = h.`LessonId`\n" +
    "  left join`CompletedLesson` c on(c.`LessonId` = h.`LessonId`) and(c.`UserId` = h.`UserId`)\n" +
    "where c.`Id` is NULL\n" +
    "group by h.`UserId`, h.`LessonId`\n" +
    "having sum(h.`LsnTime`) >= (<%= completion_coeff %> * max(ll.`Duration`))<%= limit %>";

const PARAMETER_REQ_TREE = {
    expr: {
        model: {
            name: "LsnHistory",
        }
    }
};

const MAX_INSERT_NUM = 10;
const DFLT_COMPLETION_COEFF = 0.95;

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

    getStat(options) {
        return new Promise(resolve => {
            let opts = options || {};
            let firstDate;
            let lastDate;
            let rc = { filename: "stat_all.csv", content: `"Колонка 1","Колонка 2","Колонка 3"\n` };
            resolve(rc);
        })
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

/*
                completion_coeff: {
                    maxInsertNum: 2,
                    limit: 10000,
                    coeff: 0.01,
                },
*/
    async setLessonCompleted(options) {

        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let maxInsertNum = opts.maxInsertNum ? opts.maxInsertNum : MAX_INSERT_NUM;
        let completion_coeff = opts.coeff ? opts.coeff : DFLT_COMPLETION_COEFF;
        let limit = opts.limit ? opts.limit : null;
        let limit_mysql = limit ? `\nlimit ${limit}` : ``;
        let limit_mssql = limit ? `top ${limit} ` : ``;

        let numRows = 0;
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_COMPLETED_MYSQL)({ completion_coeff: completion_coeff, limit: limit_mysql }),
                mssql: _.template(GET_COMPLETED_MSSQL)({ completion_coeff: completion_coeff, limit: limit_mssql })
            }
        }, dbOpts);

        if (result && result.detail && (result.detail.length > 0)) {
            numRows = result.detail.length;
            let packet = [];
            for (let i = 0; true; i++) {
                if (i < result.detail.length)
                    packet.push(result.detail[i]);
                if (packet.length && ((packet.length >= maxInsertNum) || (i >= result.detail.length))) {
                    await Utils.editDataWrapper(() => {
                        return new MemDbPromise(this._db, resolve => {
                            resolve(this._getObjects({
                                expr: {
                                    model: {
                                        name: "CompletedLesson",
                                    }
                                }
                            }, { field: "Id", op: "=", value: -1 }, dbOpts));
                        })
                            .then(async (result) => {
                                root_obj = result;
                                memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                await root_obj.edit();
                                for (let j = 0; j < packet.length; j++)
                                    await root_obj.newObject({
                                        fields: { UserId: packet[j].UserId, LessonId: packet[j].LessonId }
                                    }, dbOpts);
                                await root_obj.save(dbOpts);
                            })
                    }, memDbOptions);
                    packet = [];
                }

                if (i >= result.detail.length)
                    break;
            }
        }
        return numRows;
    }
};

let lsnHistory = null;
exports.LsnHistoryService = (options) => {
    return lsnHistory ? lsnHistory : lsnHistory = new LsnHistory(options);
}
