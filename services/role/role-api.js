'use strict';
const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../../database/db-object');
const { DbUtils } = require('../../database/db-utils');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { AccessFlags } = require('../../const/common');
const { AccessRights } = require('../../security/access-rights');
const { getTimeStr, buildLogString } = require('../../utils');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const logModif = config.has("debug.role.logModif") ? config.get("debug.role.logModif") : false;

const SQL_GET_ROLE_EXT_FLD_MSSQL = ", [Permissions]";
const SQL_GET_ROLE_EXT_FLD_MYSQL = ", `Permissions`";

const SQL_GET_SCHEME_MSSQL = "select [PermissionScheme] from [Account] where [Domain] = 'pmt'";
const SQL_GET_SCHEME_MYSQL = "select `PermissionScheme` from `Account` where `Domain` = 'pmt'";

const SQL_GET_ROLE_LIST_MSSQL =
    "select [Id], [Code], [Name], [ShortCode], [Description], [IsBuiltIn]<%= ext_fields %>\n" +
    "from [Role]";

const SQL_GET_ROLE_LIST_MYSQL =
    "select `Id`, `Code`, `Name`, `ShortCode`, `Description`, `IsBuiltIn`<%= ext_fields %>\n" +
    "from `Role`";

const ROLE_EDIT = {
    expr: {
        model: {
            name: "Role"
        }
    }
};

const RoleAPI = class RoleAPI extends DbObject {

    constructor(options) {
        super(options);
    }

    async getPermissionScheme(options) {
        let opts = _.cloneDeep(options || {});
        let dbOpts = _.cloneDeep(opts.dbOptions || {});
        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_SCHEME_MYSQL)(),
                mssql: _.template(SQL_GET_SCHEME_MSSQL)()
            }
        }, dbOpts);
        if (records && records.detail && (records.detail.length === 1)) {
            return records.detail[0].PermissionScheme ? JSON.parse(records.detail[0].PermissionScheme) : {};
        }
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Описание структуры прав доступа не найдено.`);
    }

    async getRoleList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.Administrator, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_ROLE_LIST_MYSQL;
        let sql_mssql = SQL_GET_ROLE_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        let is_detailed = (opts.isDetailed === "true") || (opts.isDetailed === true);
        let mysql_ext_fields = is_detailed ? SQL_GET_ROLE_EXT_FLD_MYSQL : "";
        let mssql_ext_fields = is_detailed ? SQL_GET_ROLE_EXT_FLD_MSSQL : "";

        if (opts.Id) {
            let id = +opts.Id;
            if ((typeof (id) === "number") && (!isNaN(id))) {
                mssql_conds.push(`([Id] = ${opts.Id})`);
                mysql_conds.push(`(${'`'}Id${'`'} = ${opts.Id})`);
            }
        }
        if (opts.Name) {
            mssql_conds.push(`([Name] like N'%${opts.Name}%')`);
            mysql_conds.push(`(${'`'}Name${'`'} like '%${opts.Name}%')`);
        }
        if (opts.Code) {
            mssql_conds.push(`([Code] like N'%${opts.Code}%')`);
            mysql_conds.push(`(${'`'}Code${'`'} like '%${opts.Code}%')`);
        }
        if (opts.ShortCode) {
            mssql_conds.push(`([ShortCode] like N'%${opts.ShortCode}%')`);
            mysql_conds.push(`(${'`'}ShortCode${'`'} like '%${opts.ShortCode}%')`);
        }
        if (opts.IsBuiltIn) {
            mssql_conds.push(`([IsBuiltIn] = ${(opts.IsBuiltIn === "true") || (opts.IsBuiltIn === true) ? 1 : 0})`);
            mysql_conds.push(`(${'`'}IsBuiltIn${'`'} = ${(opts.IsBuiltIn === "true") || (opts.IsBuiltIn === true) ? 1 : 0})`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND ")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND ")}`;
        }

        if (opts.SortOrder) {
            let ord_arr = opts.SortOrder.split(',');
            let dir = ord_arr.length > 1 && (ord_arr[1].toUpperCase() === "DESC") ? "DESC" : "ASC";
            let mysql_field;
            let mssql_field;
            switch (ord_arr[0]) {
                case "Id":
                    mssql_field = "[Id]";
                    mysql_field = "`Id`";
                    break;
                case "Name":
                    mssql_field = "[Name]";
                    mysql_field = "`Name`";
                    break;
                case "Code":
                    mssql_field = "[Code]";
                    mysql_field = "`Code`";
                    break;
                case "ShortCode":
                    mssql_field = "[ShortCode]";
                    mysql_field = "`ShortCode`";
                    break;
                case "IsBuiltIn":
                    mssql_field = "[IsBuiltIn]";
                    mysql_field = "`IsBuiltIn`";
                    break;
            }
            if (mysql_field) {
                sql_mysql += `\nORDER BY ${mysql_field} ${dir}`;
                sql_mssql += `\nORDER BY ${mssql_field} ${dir}`;
            }
        }

        let records = await $data.execSql({
            dialect: {
                mysql: _.template(sql_mysql)({ ext_fields: mysql_ext_fields }),
                mssql: _.template(sql_mssql)({ ext_fields: mssql_ext_fields })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            for (let i = 0; i < records.detail.length; i++){
                let elem = records.detail[i];
                let timeline = {
                    Id: elem.Id,
                    Code: elem.Code,
                    Name: elem.Name,
                    ShortCode: elem.ShortCode,
                    Description: elem.Description,
                    IsBuiltIn: elem.IsBuiltIn ? true : false,
                    Permissions: is_detailed ? (elem.Permissions ? JSON.parse(elem.Permissions) : {}) : undefined
                };
                result.push(timeline);
            }
        }
        return result;
    }

    async getRole(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.Id = id;
        opts.isDetailed = true;
        let result = await this.getRoleList(opts);
        if (result && Array.isArray(result) && (result.length === 1))
            result = result[0]
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Роль (Id =${id}) не найдена.`);
        return result;
    }

    async newRole(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.Administrator, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, ROLE_EDIT, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = { IsBuiltIn: false };

                    if (typeof (inpFields.Code) !== "undefined")
                        fields.Code = inpFields.Code
                    else
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing field "Code"`);

                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing field "Name"`);

                    if (typeof (inpFields.ShortCode) !== "undefined")
                        fields.ShortCode = inpFields.ShortCode
                    else
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing field "ShortCode"`);

                    if (typeof (inpFields.IsBuiltIn) === "boolean")
                        fields.IsBuiltIn = inpFields.IsBuiltIn;

                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description;

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    let roleObj = this._db.getObj(newHandler.newObject);
                    let newId = newHandler.keyValue;

                    if (typeof (inpFields.Permissions) !== "undefined") {
                        try {
                            await AccessRights.verifyRolePermissions(inpFields.Permissions);
                        }
                        catch (err) {
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `${err && err.message ? err.message : err}`);
                        }
                        roleObj.permissions(inpFields.Permissions);
                    }

                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Role created: Id="${newId}".`));
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);

    }

    async updateRole(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.Administrator, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, ROLE_EDIT, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Роль (Id =${id}) не найдена.`);
                    let roleObj = collection.get(0);

                    await roleObj.edit();

                    if (typeof (inpFields.Code) !== "undefined")
                        roleObj.code(inpFields.Code);

                    if (typeof (inpFields.Name) !== "undefined")
                        roleObj.name(inpFields.Name);

                    if (typeof (inpFields.IsBuiltIn) === "boolean")
                        roleObj.isBuiltIn(inpFields.IsBuiltIn);

                    if (typeof (inpFields.Permissions) !== "undefined") {
                        try {
                            await AccessRights.verifyRolePermissions(inpFields.Permissions);
                        }
                        catch (err) {
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `${err && err.message ? err.message : err}`);
                        }
                        roleObj.permissions(inpFields.Permissions);
                    }

                    let res = await roleObj.save(dbOpts);
                    if (res && res.detail && (res.detail.length > 0))
                        await AccessRights.deleteRoleFromCache(roleObj.shortCode());

                    if (logModif)
                        console.log(buildLogString(`Role modified: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);
    }

    async deleteRole(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.Administrator, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, ROLE_EDIT, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Роль (Id =${id}) не найдена.`);

                    let roleObj = collection.get(0);
                    await root_obj.edit();
                    collection._del(roleObj);

                    await root_obj.save(dbOpts);
                    await AccessRights.deleteRoleFromCache(roleObj.shortCode());

                    if (logModif)
                        console.log(buildLogString(`Role deleted: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);

    }
}

let roleAPI = null;
exports.RoleService = () => {
    return roleAPI ? roleAPI : roleAPI = new RoleAPI();
}
