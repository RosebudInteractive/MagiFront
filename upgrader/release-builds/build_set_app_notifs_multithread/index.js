'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 44]
//
const _ = require('lodash');
const { buildLogString } = require('../../../utils');
const AllowedNotifDelivery = {
    bookmark: {
        app: 1
    },
    new: {
        app: 2
    }
};

const BATCH_SIZE = 100;
const THREAD_NUMBER = 4;
const MAX_USERS = 0;

const GET_USERS_MSSQL =
    "select distinct u.[SysParentId] from [User] u left join [UserNotification] n on n.[UserId] = u.[SysParentId] where n.[Id] is NULL";

const GET_USERS_MYSQL =
    "select distinct u.`SysParentId` from `User` u left join `UserNotification` n on n.`UserId` = u.`SysParentId` where n.`Id` is NULL";

exports.upgradeDb = async (schema) => {
    let acc_model = schema.getModel("Account");
    acc_model.customProps({ caption: "Учетные записи организаций", comment:"Build 44, just fill notification defaults." });
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    let trace_flag = opts.engine.getQuery()._trace.sqlCommands;
    opts.engine.getQuery()._trace.sqlCommands = false;

    console.log(buildLogString(`### Upgrade script started.`));
    let recs = await $data.execSql({
        dialect: {
            mysql: _.template(GET_USERS_MYSQL)({}),
            mssql: _.template(GET_USERS_MSSQL)({})
        }
    }, {});
    let ids = [];
    if (recs && recs.detail && (recs.detail.length > 0)) {
        recs.detail.forEach(elem => {
            ids.push(elem.SysParentId);
        })
    }

    let workThread = async (id, ids, first, last) => {
        let result = { threadId: id, isError: false, range: { first: first, last: last }, totNum: 0, totTime: 0 };
        let start_date = Date.now();
        let curr_num = 0;
        try {
            if ((first < 0) || (first >= ids.length))
                throw new Error(`Invalid "first" parameter: ${first}.`);
            if ((last < first) || (last >= ids.length))
                throw new Error(`Invalid "last" parameter: ${last}.`);
            let tot_num = last - first + 1;
            for (let curr_op = first; curr_op <= last;) {
                await opts.simpleEditWrapper({ expr: { model: { name: "UserNotification" } } }, { field: "Id", op: "=", value: -1 },
                    async (root_obj) => {
                        for (let i = 0; (i < BATCH_SIZE) && (curr_op <= last); i++, curr_op++, curr_num++) {
                            let user_id = ids[curr_op];
                            await root_obj.newObject({ fields: { UserId: user_id, ItemId: AllowedNotifDelivery.bookmark.app } }, {});
                            await root_obj.newObject({ fields: { UserId: user_id, ItemId: AllowedNotifDelivery.new.app } }, {});
                        }
                    }, {});
                console.log(buildLogString(`Thread ${id}: ${((curr_num / tot_num) * 100).toFixed(2)}% processed (${curr_num} of ${tot_num}).`));
            }
            let tot_time = (Date.now() - start_date) / 1000;
            result.totTime = tot_time;
            result.totNum = curr_num;
            console.log(buildLogString(`Finished ${id} in ${tot_time.toFixed(2)} sec, processed ${curr_num} of ${tot_num}.`));
        }
        catch (err) {
            result.isError = true;
            result.errMessage = err && err.message ? err.message : `Serialized error: ${JSON.stringify(err)}`;
            result.totTime = (Date.now() - start_date) / 1000;
            result.totNum = curr_num;
        }
        return result;
    }

    let tot_num = MAX_USERS > 0 ? MAX_USERS : ids.length;
    let promises = [];
    for (let rest = tot_num, curr_idx = 0, rest_treads = THREAD_NUMBER; rest_treads > 0; rest_treads--) {
        let delta = Math.round(rest / rest_treads);
        if (delta > 0)
            promises.push(workThread(`#${THREAD_NUMBER - rest_treads + 1}`, ids, curr_idx, curr_idx + delta - 1));
        curr_idx += delta;
        rest -= delta;
    }
    console.log(buildLogString(`### Upgrade script: ${ids.length} users in ${promises.length} thread(s) need to be processed.`));

    let start_date = Date.now();
    let result = await Promise.all(promises);
    let tot_time = (Date.now() - start_date) / 1000;

    let is_error = false;
    let err_msg = 'Error(s):';
    let tot_ops = 0;
    for (let i = 0; i < result.length; i++){
        let elem = result[i];
        tot_ops += elem.totNum;
        if (elem.isError) {
            is_error = true;
            err_msg += `\nThread ${elem.threadId}: ${elem.errMessage}`;
        }
    }
    if (is_error) {
        console.error(buildLogString(`### ERROR: ${err_msg}`));
        throw new Error(err_msg);
    }
    console.log(buildLogString(`### Upgrade script finished in ${tot_time.toFixed(2)} sec, threads: ${result.length}, ` +
        `${(tot_ops / tot_time).toFixed(3)} op/sec, total: ${tot_ops} of ${tot_num}.`));
    opts.engine.getQuery()._trace.sqlCommands = trace_flag;
};
