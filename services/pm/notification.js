'use strict';
const { URL, URLSearchParams } = require('url');
const _ = require('lodash');
const config = require('config');
const randomstring = require('randomstring');
const { DbObject } = require('../../database/db-object');
const { DbUtils } = require('../../database/db-utils');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { AccessFlags } = require('../../const/common');
const { AccessRights } = require('../../security/access-rights');
const { getTimeStr, buildLogString } = require('../../utils');
const { NotificationType, NotificationParams } = require('./const');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const SQL_GET_UNREAD_MSSQL =
    "select [Id] from [Notification]\n" +
    "where ([IsRead] = 0)";

const SQL_GET_UNREAD_MYSQL =
    "select `Id` from `Notification`\n" +
    "where (`IsRead` = 0)";

const SQL_SET_READ_MSSQL = "update [Notification] set [IsRead] = 1 where [Id] = <%= id %>";
const SQL_SET_READ_MYSQL = "update `Notification` set `IsRead` = 1 where `Id` = <%= id %>";

const SQL_GET_COUNTER_MSSQL =
    "select count(*) Cnt\n" +
    "from [Notification] n\n" +
    "  join [User] u on n.UserId = u.[SysParentId]";

const SQL_GET_LIST_MSSQL =
    "select n.[Id], n.[NotifType], n.[Subject], n.[URL], n.[IsRead], n.[IsUrgent], n.[TimeCr],\n" +
    "  n.[UserId], n.[Data], u.[DisplayName]\n" +
    "from [Notification] n\n" +
    "  join [User] u on n.UserId = u.[SysParentId]";

const SQL_GET_COUNTER_MYSQL =
    "select count(*) Cnt\n" +
    "from `Notification` n\n" +
    "  join `User` u on n.UserId = u.`SysParentId`";

const SQL_GET_LIST_MYSQL =
    "select n.`Id`, n.`NotifType`, n.`Subject`, n.`URL`, n.`IsRead`, n.`IsUrgent`, n.`TimeCr`,\n" +
    "  n.`UserId`, n.`Data`, u.`DisplayName`\n" +
    "from `Notification` n\n" +
    "  join `User` u on n.UserId = u.`SysParentId`";

const DFLT_SORT_ORDER = "TimeCr,desc";
const logModif = false;
const NOTIF_KEY_LENGTH = 50;

const Notification = class Notification extends DbObject {

    constructor(options) {
        super(options);
        this._allowedTypes = {};
        for (let tp in NotificationType)
            this._allowedTypes[NotificationType[tp]] = true;
    }

    async getList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);
        let access_rights = AccessRights.checkPermissions(opts.user,
            AccessFlags.Administrator | AccessFlags.PmAdmin | AccessFlags.PmSupervisor | AccessFlags.PmElemManager);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let sql_mysql = opts.is_counter ? SQL_GET_COUNTER_MYSQL : SQL_GET_LIST_MYSQL;
        let sql_mssql = opts.is_counter ? SQL_GET_COUNTER_MSSQL : SQL_GET_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        if (!(access_rights & (AccessFlags.Administrator | AccessFlags.PmAdmin))) {
            // For current user only
            mssql_conds.push(`(n.[UserId] = ${opts.user.Id})`);
            mysql_conds.push(`(n.${'`'}UserId${'`'} = ${opts.user.Id})`);
        }

        if ((opts.notRead === "true") || (opts.notRead === true)) {
            mssql_conds.push(`(n.[IsRead] = 0)`);
            mysql_conds.push(`(n.${'`'}IsRead${'`'} = 0)`);
        }
        if ((opts.urgent === "true") || (opts.urgent === true) || (opts.urgent === "false") || (opts.urgent === false)) {
            let val = (opts.urgent === "true") || (opts.urgent === true) ? 1 : 0;
            mssql_conds.push(`(n.[IsUrgent] = ${val})`);
            mysql_conds.push(`(n.${'`'}IsUrgent${'`'} = ${val})`);
        }
        if (opts.type) {
            let types = Array.isArray(opts.type) ? opts.type : opts.type.split(',');
            mssql_conds.push(`(n.[NotifType] in (${types.join(',')}))`);
            mysql_conds.push(`(n.${'`'}NotifType${'`'} in (${types.join(',')}))`);
        }
        if (opts.userName) {
            mssql_conds.push(`(u.[DisplayName] like N'%${opts.userName.replace(/'/g, "''")}%')`);
            mysql_conds.push(`(u.${'`'}DisplayName${'`'} like '%${opts.userName.replace(/'/g, "''")}%')`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND")}`;
        }

        opts.order = opts.is_counter ? null : (opts.order ? opts.order : DFLT_SORT_ORDER);
        if (opts.order) {
            let ord_arr = opts.order.split(',');
            let dir = ord_arr.length > 1 && (ord_arr[1].toUpperCase() === "DESC") ? "DESC" : "ASC";
            let mysql_field;
            let mssql_field;
            switch (ord_arr[0]) {
                case "NotifType":
                    mssql_field = "n.[NotifType]";
                    mysql_field = "n.`NotifType`";
                    break;
                case "TimeCr":
                    mssql_field = "n.[TimeCr]";
                    mysql_field = "n.`TimeCr`";
                    break;
                case "Subject":
                    mssql_field = "n.[Subject]";
                    mysql_field = "n.`Subject`";
                    break;
                case "IsRead":
                    mssql_field = "n.[IsRead]";
                    mysql_field = "n.`IsRead`";
                    break;
                case "IsUrgent":
                    mssql_field = "n.[IsUrgent]";
                    mysql_field = "n.`IsUrgent`";
                    break;
                case "UserName":
                    mssql_field = "u.[DisplayName]";
                    mysql_field = "u.`DisplayName`";
                    break;
            }
            if (mysql_field) {
                sql_mysql += `\nORDER BY ${mysql_field} ${dir}`;
                sql_mssql += `\nORDER BY ${mssql_field} ${dir}`;
            }
        }
        let records = await $data.execSql({
            dialect: {
                mysql: _.template(sql_mysql)(),
                mssql: _.template(sql_mssql)()
            }
        }, dbOpts)
        if (opts.is_counter)
            result = { count: 0 };
        if (records && records.detail && (records.detail.length > 0)) {
            if (opts.is_counter) {
                result.count = records.detail[0].Cnt;
            }
            else
                records.detail.forEach(elem => {
                    let notif = {
                        Id: elem.Id,
                        NotifType: elem.NotifType,
                        Subject: elem.Subject,
                        URL: this._siteHost + elem.URL,
                        TimeCr: elem.TimeCr,
                        IsRead: elem.IsRead ? true : false,
                        IsUrgent: elem.IsUrgent ? true : false,
                        Data: elem.Data ? JSON.parse(elem.Data) : undefined,
                        User: {
                            Id: elem.UserId,
                            DisplayName: elem.DisplayName
                        }
                    };
                    result.push(notif);
                });
        }

        return result;
    }

    async newNotification(data, options) {
        let opts = _.cloneDeep(options || {});

        if (opts.is_from_request === true) {
            delete opts.is_from_request;
            opts.user = await this._checkPermissions(AccessFlags.Administrator, opts);
        }
        let user_id = opts.user ? opts.user.Id : null;

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: user_id ? user_id : undefined }, opts.dbOptions || {});
        let root_obj = null;
        let inpData = data ? (Array.isArray(data) ? data : [data]) : [];
        let notifObj = null;
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, { expr: { model: { name: "Notification" } } }, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();
                    let newObjs = [];
                    for (let i = 0; i < inpData.length; i++) {
                        let inpFields = inpData[i];
                        let fields = {};

                        if (this._allowedTypes[inpFields.NotifType])
                            fields.NotifType = +inpFields.NotifType
                        else
                            throw new Error(`Missing or invalid field "NotifType"`);

                        if (typeof (inpFields.UserId) === "number")
                            fields.UserId = inpFields.UserId
                        else
                            throw new Error(`Missing or invalid field "UserId"`);

                        if (typeof (inpFields.Subject) === "string")
                            fields.Subject = inpFields.Subject
                        else
                            throw new Error(`Missing or invalid field "Subject"`);

                        fields.NotifKey = inpFields.NotifKey;
                        let is_auto_key = false;
                        if (typeof (inpFields.NotifKey) !== "string") {
                            fields.NotifKey = randomstring.generate(NOTIF_KEY_LENGTH);
                            is_auto_key = true;
                        }

                        if (typeof (inpFields.URL) === "string") {
                            let url = new URL(inpFields.URL);
                            fields.URL = inpFields.URL;
                            if (is_auto_key) {
                                if (url.searchParams.has(NotificationParams.ParamName))
                                    url.searchParams.set(NotificationParams.ParamName, fields.NotifKey)
                                else
                                    url.searchParams.append(NotificationParams.ParamName, fields.NotifKey);
                            }
                            let str_search_params = url.searchParams.toString();
                            fields.URL = url.pathname + (str_search_params.length > 0 ? `?${str_search_params}` : '');
                        }

                        fields.IsRead = false;
                        if (typeof (inpFields.IsRead) === "boolean")
                            fields.IsRead = inpFields.IsRead;

                        fields.IsUrgent = false;
                        if (typeof (inpFields.IsUrgent) === "boolean")
                            fields.IsUrgent = inpFields.IsUrgent;

                        fields.IsSent = false;
                        if (typeof (inpFields.IsSent) === "boolean")
                            fields.IsSent = inpFields.IsSent;

                        if (typeof (inpFields.Data) !== "undefined") {
                            if (fields.NotifKey && (!inpFields.Data.notifKey))
                                inpFields.Data.notifKey = fields.NotifKey;
                            fields.Data = JSON.stringify(inpFields.Data);
                        };

                        let newHandler = await root_obj.newObject({
                            fields: fields
                        }, dbOpts);

                        newId = newHandler.keyValue;
                        notifObj = this._db.getObj(newHandler.newObject);

                        newObjs.push({ Id: newId, key: notifObj.notifKey() });
                    }
                    await root_obj.save(dbOpts);
                    if (logModif)
                        console.log(buildLogString(`${newObjs.length} notification(s) created.`));
                    return { result: "OK", newObjs: newObjs };
                })
        }, memDbOptions);
    }

    async markAsRead(data, options) {
        let result= 0;
        let opts = _.cloneDeep(options || {});
        let is_admin = false;
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);
        if (opts.is_from_request === true) {
            delete opts.is_from_request;
            is_admin = AccessRights.checkPermissions(opts.user, AccessFlags.Administrator | AccessFlags.PmAdmin) !== 0 ? true : false;
        }
        if (!opts.user)
            throw new HttpError(HttpCode.ERR_UNAUTH, `Notification::markAsRead: Authorization required.`);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let keys = data ? (Array.isArray(data) ? data : [data]) : [];
        for (let i = 0; i < keys.length; i++){
            let mysql = _.template(SQL_GET_UNREAD_MYSQL)();
            let mssql = _.template(SQL_GET_UNREAD_MSSQL)();
            let key = keys[i];
            if (typeof (key) === "number") {
                mysql += ` AND (${'`'}Id${'`'} = ${key})`;
                mssql += ` AND ([Id] = ${key})`;
            }
            else {
                mysql += ` AND (${'`'}NotifKey${'`'} = '${key}')`;
                mssql += ` AND ([NotifKey] = '${key}')`;
            }
            if (!is_admin) {
                mysql += ` AND (${'`'}UserId${'`'} = ${opts.user.Id})`;
                mssql += ` AND ([UserId] = ${opts.user.Id})`;
            }
            let records = await $data.execSql({
                dialect: {
                    mysql: mysql,
                    mssql: mssql
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length === 1)) {
                await $data.execSql({
                    dialect: {
                        mysql: _.template(SQL_SET_READ_MYSQL)({ id: records.detail[0].Id }),
                        mssql: _.template(SQL_SET_READ_MSSQL)({ id: records.detail[0].Id })
                    }
                }, dbOpts);
                result++;
            }
        }
        return { result: "OK", count: result };
    }

}

let notification = null;
exports.NotificationService = () => {
    return notification ? notification : notification = new Notification();
}
