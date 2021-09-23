const mime = require('mime');
const _ = require('lodash');
const config = require('config');
const { DbUtils } = require('../database/db-utils');
const { DbObject } = require('../database/db-object');
const { ACCOUNT_ID } = require('../const/sql-req-common');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { AccessFlags } = require('../const/common');
const { buildLogString } = require('../utils');
const { over } = require('lodash');

const LESSON_FILE_MSSQL_REQ =
    "select l.[Id], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate],\n" +
    "  c.[IsPaid], c.[IsSubsFree], l.[IsFreeInPaidCourse], pc.[CourseId],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId\n" +
    "from [EpisodeLng] el\n" +
    "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join [Lesson] l on l.[Id] = e.[LessonId]\n" +
    "  join [Course] c on c.[Id] = l.[CourseId]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= userId %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= userId %>) and (gc.[CourseId] = c.[Id])\n" +
    "where el.[Audio] = '<%= file %>'";
    
const LESSON_FILE_MYSQL_REQ =
    "select l.`Id`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, l.`IsFreeInPaidCourse`, pc.`CourseId`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId\n" +
    "from `EpisodeLng` el\n" +
    "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join `Lesson` l on l.`Id` = e.`LessonId`\n" +
    "  join `Course` c on c.`Id` = l.`CourseId`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= userId %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= userId %>) and (gc.`CourseId` = c.`Id`)\n" +
    "where el.`Audio` = '<%= file %>'";

const GET_PERMISSION_SCHEME_MSSQL = "select [PermissionScheme] from [Account] where [Domain] = '<%= id %>'";
const GET_PERMISSION_SCHEME_MYSQL = "select `PermissionScheme` from `Account` where `Domain` = '<%= id %>'";

const GET_ROLE_MSSQL = "select [ShortCode], [IsBuiltIn], [Permissions] from [Role] where [ShortCode] = '<%= id %>'";
const GET_ROLE_MYSQL = "select `ShortCode`, `IsBuiltIn`, `Permissions` from `Role` where `ShortCode` = '<%= id %>'";

const ACCOUNT_DOMAIN = "pmt";
const SCHEME_KEY_PREFIX = "_pscheme:";
const SCHEME_TTL_SEC = 24 * 60 * 60; // 24 hours

const ROLE_KEY_PREFIX = "_role:";

const isBillingTest = config.has("billing.billing_test") ? config.billing.billing_test : false;

class AccessRights extends DbObject {

    static _instance = null;

    static getInstance(options) {
        if (!this._instance)
            this._instance = new AccessRights(options);
        return this._instance;
    }

    static _canAccessAudio(user, file) {
        return new Promise(resolve => {
            let canAccess = $data.execSql({
                dialect: {
                    mysql: _.template(LESSON_FILE_MYSQL_REQ)({ file: file, userId: user ? user.Id : 0 }),
                    mssql: _.template(LESSON_FILE_MSSQL_REQ)({ file: file, userId: user ? user.Id : 0 })
                }
            }, {})
                .then((result) => {
                    let res = false;
                    if (result && result.detail && (result.detail.length === 1)) {
                        let now = new Date();
                        let rec = result.detail[0];
                        let IsPaid = rec.IsPaid && (!isBillingTest);
                        if (IsPaid) {
                            switch (rec.PaidTp) {
                                case 1:
                                    if (rec.PaidDate && ((rec.PaidDate - now) > 0))
                                        IsPaid = false;
                                    break;
                                case 2:
                                    if (user && user.RegDate && rec.PaidRegDate
                                        && ((rec.PaidRegDate - user.RegDate) > 0))
                                        IsPaid = false;
                                    break;
                                default:
                                    IsPaid = false;
                            }
                        }
                        let needAuth = rec.IsAuthRequired || rec.IsSubsRequired || (IsPaid && (!rec.IsFreeInPaidCourse));
                        if (needAuth) {
                            if (user) {
                                if (rec.IsSubsRequired || IsPaid) {
                                    res = IsPaid && (rec.IsFreeInPaidCourse || rec.CourseId || rec.GiftId);
                                    if (!res) {
                                        if (rec.IsSubsRequired || (IsPaid && rec.IsSubsFree)) {
                                            res = rec.FreeExpDate && (now <= rec.FreeExpDate);
                                            res = res || (user.SubsExpDateExt && (now <= rec.SubsExpDateExt));
                                        }
                                    }
                                }
                                else
                                    res = true;
                            }
                        }
                        else
                            res = true;
                    }
                    return res ? true : false;
                });
            resolve(canAccess);
        });
    }

    static canAccessFile(user, file) {
        return new Promise((resolve) => {
            let requiredRights = AccessFlags.Administrator + AccessFlags.ContentManager;
            let result = this.checkPermissions(user, requiredRights) !== 0 ? true : false;
            if (!result) {
                result = true;
                let mimeType = mime.getType(file);
                let typeArr = mimeType ? mimeType.split("/") : null;
                if (typeArr && (typeArr.length > 0)) {
                    let fn = file.substring(0, 1) === "/" ? file.substring(1) : file;
                    switch (typeArr[0]) {
                        case "audio":
                            result = this._canAccessAudio(user, fn);
                            break;
                    }
                }
            }
            resolve(result);
        });
    }

    static checkPermissions(user, accessRights) {
        let result = 0;
        if (user && user.PData) {
            if (user.PData.isAdmin)
                result = accessRights
            else {
                if (user.PData.roles.e)
                    result |= accessRights & (AccessFlags.ContentManager | AccessFlags.Subscriber)
                else
                    if (user.PData.roles.s)
                        result |= accessRights & AccessFlags.Subscriber;
                if (user.PData.roles.pma)
                    result |= accessRights & (AccessFlags.PmAdmin | AccessFlags.PmSupervisor | AccessFlags.PmElemManager | AccessFlags.PmTaskExecutor)
                else
                    if (user.PData.roles.pms)
                        result |= accessRights & (AccessFlags.PmSupervisor | AccessFlags.PmElemManager | AccessFlags.PmTaskExecutor)
                    else
                        if (user.PData.roles.pme)
                            result |= accessRights & (AccessFlags.PmElemManager | AccessFlags.PmTaskExecutor)
                        else
                            if (user.PData.roles.pmu)
                                result |= accessRights & AccessFlags.PmTaskExecutor;
            }
            if (accessRights & AccessFlags.Pending) {
                result &= (~AccessFlags.Pending);
                if (user.PData.roles.p)
                    result |= AccessFlags.Pending
            }
            
        }
        return result;
    }

    static async getPermissionScheme() {
        return this.getInstance().getPermissionScheme();
    }

    static async buildPermissions(user_permissions, user_roles, roles_hash, permissions) {
        return this.getInstance().buildPermissions(user_permissions, user_roles, roles_hash, permissions);
    }

    static async getPermissions(user, permissions_list) {
        return this.getInstance().getPermissions(user, permissions_list);
    }

    static async verifyRolePermissions(permissions) {
        return this.getInstance().verifyRolePermissions(permissions);
    }

    static async deleteRoleFromCache(id) {
        return this.getInstance().deleteRoleFromCache(id);
    }

    //
    // Internal class
    //
    constructor(options) {
        super(options);
        this._scheme_cache = this.createDataCache(SCHEME_KEY_PREFIX, this._loadPermissionScheme.bind(this), undefined, { md5_hash: true });
        this._role_cache = this.createDataCache(ROLE_KEY_PREFIX, this._loadRole.bind(this), undefined, { md5_hash: true });
    }

    async _loadRole(id, options) {
        let opts = _.cloneDeep(options || {});
        let dbOpts = opts.dbOptions || {};
        let rc = null;
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_ROLE_MYSQL)({ id: id }),
                mssql: _.template(GET_ROLE_MSSQL)({ id: id })
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length === 1)) {
            let role = result.detail[0];
            rc = {
                Id: role.ShortCode,
                IsBuiltIn: role.IsBuiltIn ? true : false,
                Permissions: role.Permissions ? JSON.parse(role.Permissions) : {}
            }
        }
        return rc;
    }

    async _loadPermissionScheme(id, options) {
        let opts = _.cloneDeep(options || {});
        let dbOpts = opts.dbOptions || {};
        let rc = null;
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_PERMISSION_SCHEME_MYSQL)({ id: id }),
                mssql: _.template(GET_PERMISSION_SCHEME_MSSQL)({ id: id })
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length === 1) && result.detail[0].PermissionScheme) {
            rc = { description: JSON.parse(result.detail[0].PermissionScheme), list: {} };
            let make_list = (list, root, path) => {
                for (let key in root) {
                    let elem = root[key];
                    switch (elem.type) {
                        case "group":
                            if (elem.items)
                                make_list(list, elem.items, `${path}${key}.`);
                            elem._type = 1;
                            list[`${path}${key}`] = elem;
                            break;
                        case "item":
                            elem._type = 2;
                            elem._dataType = 0;
                            switch (elem.dataType) {
                                case "enum":
                                    elem._dataType = 1;
                                    break;
                            }
                            elem._mergeType = 0;
                            switch (elem.mergeType) {
                                case "max":
                                    elem._mergeType = 1;
                                    break;
                            }
                            list[`${path}${key}`] = elem;
                            break;
                    }
                }
            }
            make_list(rc.list, rc.description, '');
        }
        return rc;
    }

    async deleteRoleFromCache(id) {
        return this._role_cache.deleteCacheItem(id);
    }

    async verifyRolePermissions(permissions) {
        let { scheme } = await this.getPermissionScheme();
        let verifyRole = (root, path) => {
            for (let key in root) {
                let curr_path = `${path ? path : ""}${key}`;
                let val = root[key];
                let scheme_elem = scheme.list[curr_path];
                if (scheme_elem) {
                    switch (scheme_elem._type) {
                        case 1: // group
                            verifyRole(val, `${curr_path}.`);
                            break;
                        case 2: // item
                            switch (scheme_elem._dataType) {
                                case 1: // enum
                                    let cval = +val;
                                    if (!((typeof (cval) === "number") && (!Number.isNaN(cval))))
                                        throw new Error(`Недопустимое значение "${curr_path}": ${val}.`);
                                    let is_ok = false;
                                    for (let enum_val in scheme_elem.values) {
                                        if (cval === (+enum_val)) {
                                            is_ok = true;
                                            break;
                                        }
                                    }
                                    if(!is_ok)
                                        throw new Error(`Недопустимое значение "${curr_path}": ${val}.`);
                                    break;
                                default:
                                    throw new Error(`Тип права "${curr_path}" = "${scheme_elem.dataType}" не поддерживается.`);
                            }
                            break;
                    }
                }
                else
                    throw new Error(`Право "${curr_path}" не существует.`);
            }
        }
        verifyRole(permissions);
    }

    async getPermissionScheme(options) {
        let { data, ts } = await this._scheme_cache.getCacheItem(ACCOUNT_DOMAIN, options);
        return { scheme: data, hash: ts };
    }

    async getPermissions(user, permissions_list) {
        let result = {};
        if (user && user.PData && user.PData.permissions) {
            let user_permissions = user.PData.permissions;
            let { scheme } = await this.getPermissionScheme();
            let p_list = Array.isArray(permissions_list) ? permissions_list : [permissions_list];

            let getPermissionValue = (full_path) => {
                let result = undefined;
                let arr_path = full_path.split('.');
                let dst_prop = user_permissions;
                for (let i = 0; i < (arr_path.length - 1); i++) {
                    dst_prop = dst_prop[arr_path[i]];
                    if (dst_prop === undefined)
                        break;
                }
                if (dst_prop)
                    result = dst_prop[arr_path[arr_path.length - 1]];
                return result;
            }

            for (let i = 0; i < p_list.length; i++){
                let permission = p_list[i];
                let scheme_elem = scheme.list[permission];
                if (scheme_elem && (scheme_elem._type === 2)) {
                    let val = getPermissionValue(permission);
                    if ((val === undefined) && (scheme_elem.default !== undefined))
                        val = scheme_elem.default;
                    result[permission] = val;
                }
            }
        }
        return result;
    }

    async buildPermissions(user_permissions, user_roles, roles_hash, permissions) {
        let result = {
            permissions: permissions || {}, hash: roles_hash || {}
        };
        try {
            let new_hash = {};
            let { scheme, hash } = await this.getPermissionScheme();
            new_hash.__scheme = hash;
            let should_rebuild = result.hash.__scheme !== hash;
            let new_roles = {};
            for (let role in user_roles) {
                let curr_hash = result.hash[role];
                let role_item = await this._role_cache.getCacheItem(role);
                if (role_item) {
                    if (!role_item.data.IsBuiltIn) {
                        should_rebuild = should_rebuild || (role_item.ts !== curr_hash);
                        new_hash[role] = role_item.ts;
                        new_roles[role] = role_item.data.Permissions;
                    }
                }
                else {
                    if (curr_hash) {
                        should_rebuild = true;
                    }
                }
            }
            if (should_rebuild) {
                let mergePermission = (scheme_elem, dst, full_path, value, override) => {
                    let arr_path = full_path.split('.');
                    let dst_prop = dst;
                    for (let i = 0; i < (arr_path.length - 1); i++){
                        let key = arr_path[i];
                        if (dst_prop[key] === undefined)
                            dst_prop[key] = {};
                        dst_prop = dst_prop[key];
                    }
                    let prop_key = arr_path[arr_path.length - 1];
                    let curr_val;
                    let val;
                    switch (scheme_elem._dataType) {
                        case 1: // enum
                            curr_val = dst_prop[prop_key];
                            val = +value;
                            if (!override)
                                switch (scheme_elem._mergeType) {
                                    case 1: // max
                                        if ((curr_val === undefined) || (val > curr_val))
                                            dst_prop[prop_key] = val;
                                        break;
                                }
                            else
                                dst_prop[prop_key] = val;
                            break;
                    }
                }
                let mergeRole = (dst, root, override, path) => {
                    for (let key in root) {
                        let curr_path = `${path ? path : ""}${key}`;
                        let scheme_elem = scheme.list[curr_path];
                        if (scheme_elem)
                            switch (scheme_elem._type) {
                                case 1: // group
                                    mergeRole(dst, root[key], override, `${curr_path}.`);
                                    break;
                                case 2: // item
                                    mergePermission(scheme_elem, dst, curr_path, root[key], override);
                                    break;
                            }
                    }
                }
                result.permissions = {};
                for (let role in new_roles) {
                    mergeRole(result.permissions, new_roles[role], false);
                }
                if (user_permissions)
                    mergeRole(result.permissions, user_permissions, true);
                result.hash = new_hash;
            }
        }
        catch (err) {
            console.error(buildLogString(`AccessRights::buildPermissions: ${err.toString()}`));
        }
        return result;
    }
    
    checkPermissions(user, accessRights) {
        return AccessRights.checkPermissions(user, accessRights);
    }

};

AccessRights.getInstance();

if (!global.$Services)
    global.$Services = {};
global.$Services.permissions = AccessRights.getInstance;

exports.AccessRights = AccessRights;