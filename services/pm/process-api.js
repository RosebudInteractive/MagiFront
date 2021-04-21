'use strict';
const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../../database/db-object');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { AccessFlags } = require('../../const/common');
const { AccessRights } = require('../../security/access-rights');
const { getTimeStr, buildLogString } = require('../../utils');
const { ProcessState, TaskState, ElemState, TaskStateStr, ProcessStateStr } = require('./const');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const logModif = config.has("pm.logModif") ? config.get("pm.logModif") : false;

const PROCESS_STRUCT_EXPRESSION = {
    expr: {
        model: {
            name: "PmProcessStruct",
            childs: [
                {
                    dataObject: {
                        name: "PmElement"
                    }
                }
            ]
        }
    }
};

const DFLT_PROCESS_TYPE = "PmLsnProcess";
const PROCESS_WITH_ELEMS_EXPRESSION = {
    expr: {
        model: {
            name: "PmProcess",
            childs: [
                {
                    dataObject: {
                        name: "PmElemProcess"
                    }
                }
            ]
        }
    }
};

const PROCESS_ONLY_EXPRESSION = {
    expr: {
        model: {
            name: "PmProcess"
        }
    }
};

const TASK_WITH_PARENTS_EXPRESSION = {
    expr: {
        model: {
            name: "PmTask",
            childs: [
                {
                    dataObject: {
                        name: "PmDepTask",
                        parentField: "TaskId"
                    }
                }
            ]
        }
    }
};

const TASK_WITH_LOGS_EXPRESSION = {
    expr: {
        model: {
            name: "PmTask",
            childs: [
                {
                    dataObject: {
                        name: "PmTaskLog",
                    }
                }
            ]
        }
    }
};

const TASK_ONLY_EXPRESSION = {
    expr: {
        model: {
            name: "PmTask"
        }
    }
};

const TASKLOG_EXPRESSION = {
    expr: {
        model: {
            name: "PmTaskLog"
        }
    }
};

const PROC_ELEM_EXPRESSION = {
    expr: {
        model: {
            name: "PmElemProcess"
        }
    }
};

const SQL_PROCESS_ELEMS_MSSQL =
    "select [Id], [State], [ElemId], [TaskId], [SupervisorId] from [PmElemProcess] where [ProcessId] = <%= id %> order by [Index]";

const SQL_PROCESS_ELEMS_MYSQL =
    "select `Id`, `State`, `ElemId`, `TaskId`, `SupervisorId` from `PmElemProcess` where `ProcessId` = <%= id %> order by `Index`";

const SQL_PROCESS_PUB_ELEMS_MSSQL =
    "select ep.[Id], e.[Name], ep.[State], ep.[ElemId], ep.[TaskId], ep.[SupervisorId], u.[DisplayName]\n" +
    "from [PmElemProcess] ep\n" +
    "  left join [PmElement] e on e.[Id] = ep.[ElemId]\n" +
    "  left join [User] u on u.[SysParentId] = ep.[SupervisorId]\n" +
    "where ep.[ProcessId] = <%= id %>\n" +
    "order by ep.[Index]";

const SQL_PROCESS_PUB_ELEMS_MYSQL =
    "select ep.`Id`, e.`Name`, ep.`State`, ep.`ElemId`, ep.`TaskId`, ep.`SupervisorId`, u.`DisplayName`\n" +
    "from `PmElemProcess` ep\n" +
    "  left join `PmElement` e on e.`Id` = ep.`ElemId`\n" +
    "  left join `User` u on u.`SysParentId` = ep.`SupervisorId`\n" +
    "where ep.`ProcessId` = <%= id %>\n" +
    "order by ep.`Index`";

const SQL_PROCESS_TASKS_MSSQL =
    "select [Id], [Name], [State], [DueDate], [ExecutorId], [Description], [AlertId], [ElementId],\n" +
    "  [IsElemReady], [WriteFieldSet]\n" +
    "from [PmTask]\n" +
    "where [ProcessId] = <%= id %>";

const SQL_PROCESS_TASKS_MYSQL =
    "select `Id`, `Name`, `State`, `DueDate`, `ExecutorId`, `Description`, `AlertId`, `ElementId`,\n" +
    "  `IsElemReady`, `WriteFieldSet`\n" +
    "from `PmTask`\n" +
    "where `ProcessId` = <%= id %>";

const SQL_PROCESS_TASKS_PUB_MSSQL =
    "select t.[Id], t.[Name], t.[State], t.[DueDate], t.[ExecutorId], t.[Description], t.[AlertId], t.[ElementId], \n" +
    "  t.[IsElemReady], t.[WriteFieldSet], u.[DisplayName]\n" +
    "from[PmTask] t\n" +
    "  left join [User] u on u.[SysParentId] = t.[ExecutorId]\n" +
    "where[ProcessId] = <%= id %>";

const SQL_PROCESS_TASKS_PUB_MYSQL =
    "select t.`Id`, t.`Name`, t.`State`, t.`DueDate`, t.`ExecutorId`, t.`Description`, t.`AlertId`, t.`ElementId`, \n" +
    "  t.`IsElemReady`, t.`WriteFieldSet`, u.`DisplayName`\n" +
    "from`PmTask` t\n" +
    "  left join `User` u on u.`SysParentId` = t.`ExecutorId`\n" +
    "where`ProcessId` = <%= id %>";

const SQL_PROCESS_DEPS_MSSQL =
    "select d.[Id], d.[DepTaskId], d.[TaskId] from[PmDepTask] d\n" +
    "  join [PmTask] t on d.[TaskId] = t.[Id]\n" +
    "where t.[ProcessId] = <%= id %>";

const SQL_PROCESS_DEPS_MYSQL =
    "select d.`Id`, d.`DepTaskId`, d.`TaskId` from`PmDepTask` d\n" +
    "  join `PmTask` t on d.`TaskId` = t.`Id`\n" +
    "where t.`ProcessId` = <%= id %>";

const SQL_TASK_DEL_TASKDEP_MSSQL = "delete from [PmDepTask] where [TaskId]=<%= id %> or [DepTaskId]=<%= id %>";
const SQL_TASK_DEL_TASKLOG_MSSQL = "delete from [PmTaskLog] where [TaskId]=<%= id %>";
const SQL_TASK_DEL_TASKDEP_MYSQL = "delete from `PmDepTask` where `TaskId`=<%= id %> or `DepTaskId`=<%= id %>";
const SQL_TASK_DEL_TASKLOG_MYSQL = "delete from `PmTaskLog` where `TaskId`=<%= id %>";

const SQL_PROCESS_BY_TASK_MSSQL = "select [ProcessId] from [PmTask] where [Id]=<%= id %>";
const SQL_PROCESS_BY_TASK_MYSQL = "select `ProcessId` from `PmTask` where `Id`=<%= id %>";

const SQL_PROCESS_BY_LOG_MSSQL = "select t.[ProcessId] from [PmTaskLog] l join [PmTask] t on l.[TaskId]=t.[Id] where l.[Id]=<%= id %>";
const SQL_PROCESS_BY_LOG_MYSQL = "select t.`ProcessId` from `PmTaskLog` l join `PmTask` t on l.`TaskId`=t.`Id` where l.`Id`=<%= id %>";

const SQL_PROCESS_BY_ELEM_MSSQL = "select [ProcessId] from [PmElemProcess] where [Id]=<%= id %>";
const SQL_PROCESS_BY_ELEM_MYSQL = "select `ProcessId` from `PmElemProcess` where `Id`=<%= id %>";

const SQL_ELEMPROC_DEL_MSSQL = "update [PmTask] set [ElementId] = NULL where [ElementId]=<%= id %>";
const SQL_ELEMPROC_DEL_MYSQL = "update `PmTask` set `ElementId` = NULL where `ElementId`=<%= id %>";

const SQL_GET_PROC_LIST_MSSQL =
    "select p.[Id], p.[Name], p.[TimeCr], p.[State], p.[SupervisorId], u.[DisplayName],\n" +
    "  l.[CourseId], cl.[Name] as [CourseName], p.[LessonId], ll.[Name] as [LsnName], p.[DueDate]\n" +
    "from [PmProcess] p\n" +
    "  join [Lesson] l on l.[Id] = p.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join [CourseLng] cl on l.[CourseId] = cl.[CourseId]\n" +
    "  join [User] u on u.[SysParentId] = p.[SupervisorId]";

const SQL_GET_PROC_LIST_MYSQL =
    "select p.`Id`, p.`Name`, p.`TimeCr`, p.`State`, p.`SupervisorId`, u.`DisplayName`,\n" +
    "  l.`CourseId`, cl.`Name` as `CourseName`, p.`LessonId`, ll.`Name` as `LsnName`, p.`DueDate`\n" +
    "from `PmProcess` p\n" +
    "  join `Lesson` l on l.`Id` = p.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join `CourseLng` cl on l.`CourseId` = cl.`CourseId`\n" +
    "  join `User` u on u.`SysParentId` = p.`SupervisorId`";

const SQL_GET_TASK_LIST_MSSQL =
    "select t.[Id], t.[Name], t.[DueDate], t.[TimeCr], t.[State], p.[Id] as [ProcessId], p.[Name] as [ProcessName],\n" +
    "  e.[Id] as [ElementId], el.[Name] as [ElName], t.[ExecutorId], u.[DisplayName]\n" +
    " from [PmTask] t\n" +
    "  join [PmProcess] p on p.[Id] = t.[ProcessId]\n" +
    "  join [User] pu on pu.[SysParentId] = p.[SupervisorId]\n" +
    "  join [Lesson] l on l.[Id] = p.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join [CourseLng] cl on l.[CourseId] = cl.[CourseId]\n" +
    "  left join [User] u on u.[SysParentId] = t.[ExecutorId]\n" +
    "  left join [PmElemProcess] e on e.[Id] = t.[ElementId]\n" +
    "  left join [PmElement] el on el.[Id] = e.[ElemId]\n" +
    "  left join [User] eu on eu.[SysParentId] = e.[SupervisorId]";

const SQL_GET_TASK_LIST_MYSQL =
    "select t.`Id`, t.`Name`, t.`DueDate`, t.`TimeCr`, t.`State`, p.`Id` as `ProcessId`, p.`Name` as `ProcessName`,\n" +
    "  e.`Id` as `ElementId`, el.`Name` as `ElName`, t.`ExecutorId`, u.`DisplayName`\n" +
    " from `PmTask` t\n" +
    "  join `PmProcess` p on p.`Id` = t.`ProcessId`\n" +
    "  join `User` pu on pu.`SysParentId` = p.`SupervisorId`\n" +
    "  join `Lesson` l on l.`Id` = p.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join `CourseLng` cl on l.`CourseId` = cl.`CourseId`\n" +
    "  left join `User` u on u.`SysParentId` = t.`ExecutorId`\n" +
    "  left join `PmElemProcess` e on e.`Id` = t.`ElementId`\n" +
    "  left join `PmElement` el on el.`Id` = e.`ElemId`\n" +
    "  left join `User` eu on eu.`SysParentId` = e.`SupervisorId`";

const SQL_GET_TASK_MSSQL =
    "select t.[Id], t.[Name], t.[ProcessId], t.[TimeCr], t.[DueDate], t.[ExecutorId], u.[DisplayName] as [UserName], p.[Name] as [ProcessName],\n" +
    "  t.[Description], t.[AlertId], t.[IsElemReady], t.[WriteFieldSet], t.[ElementId], t.[State], ep.[State] as [EState],\n" +
    "  ep.[SupervisorId], eu.[DisplayName] as [EUserName], e.[Name] as [EName], e.[WriteFields], e.[ViewFields], ps.[ProcessFields]\n" +
    "from [PmTask] t\n" +
    "  join [PmProcess] p on t.[ProcessId] = p.[Id]\n" +
    "  join [PmProcessStruct] ps on ps.[Id] = p.[StructId]\n" +
    "  left join [PmElemProcess] ep on t.[ElementId] = ep.[Id]\n" +
    "  left join [PmElement] e on e.[Id] = ep.[ElemId]\n" +
    "  left join [User] u on u.[SysParentId] = t.[ExecutorId]\n" +
    "  left join [User] eu on eu.[SysParentId] = ep.[SupervisorId]\n" +
    "where t.[Id] = <%= id %>";

const SQL_GET_TASK_MYSQL =
    "select t.`Id`, t.`Name`, t.`ProcessId`, t.`TimeCr`, t.`DueDate`, t.`ExecutorId`, u.`DisplayName` as `UserName`, p.`Name` as `ProcessName`,\n" +
    "  t.`Description`, t.`AlertId`, t.`IsElemReady`, t.`WriteFieldSet`, t.`ElementId`, t.`State`, ep.`State` as `EState`,\n" +
    "  ep.`SupervisorId`, eu.`DisplayName` as `EUserName`, e.`Name` as `EName`, e.`WriteFields`, e.`ViewFields`, ps.`ProcessFields`\n" +
    "from `PmTask` t\n" +
    "  join `PmProcess` p on t.`ProcessId` = p.`Id`\n" +
    "  join `PmProcessStruct` ps on ps.`Id` = p.`StructId`\n" +
    "  left join `PmElemProcess` ep on t.`ElementId` = ep.`Id`\n" +
    "  left join `PmElement` e on e.`Id` = ep.`ElemId`\n" +
    "  left join `User` u on u.`SysParentId` = t.`ExecutorId`\n" +
    "  left join `User` eu on eu.`SysParentId` = ep.`SupervisorId`\n" +
    "where t.`Id` = <%= id %>";

const SQL_GET_TASK_LOG_MSSQL =
    "select l.[Id], l.[TimeCr], l.[Text], l.[UserId], u.[DisplayName]\n" +
    "from [PmTask] t\n" +
    "  join [PmTaskLog] l on l.[TaskId] = t.[Id]\n" +
    "  join [User] u on u.[SysParentId] = l.[UserId]\n" +
    "where t.[Id] = <%= id %>\n" +
    "order by l.[TimeCr]";

const SQL_GET_TASK_LOG_MYSQL =
    "select l.`Id`, l.`TimeCr`, l.`Text`, l.`UserId`, u.`DisplayName`\n" +
    "from `PmTask` t\n" +
    "  join `PmTaskLog` l on l.`TaskId` = t.`Id`\n" +
    "  join `User` u on u.`SysParentId` = l.`UserId`\n" +
    "where t.`Id` = <%= id %>\n" +
    "order by l.`TimeCr`";

const SQL_GET_PELEM_MSSQL =
    "select ep.[Id] as [ElementId], ep.[ProcessId], ep.[State] as [EState], ep.[SupervisorId],\n" +
    "  eu.[DisplayName] as [EUserName], e.[Name] as [EName], e.[WriteFields], e.[ViewFields], ps.[ProcessFields]\n" +
    "from [PmElemProcess] ep\n" +
    "  join [PmElement] e on e.[Id] = ep.[ElemId]\n" +
    "  join [PmProcess] p on p.[Id] = ep.[ProcessId]\n" +
    "  join [PmProcessStruct] ps on ps.[Id] = p.[StructId]\n" +
    "  left join [User] eu on eu.[SysParentId] = ep.[SupervisorId]\n" +
    "where ep.[Id] = <%= id %>";
    
const SQL_GET_PELEM_MYSQL =
    "select ep.`Id` as `ElementId`, ep.`ProcessId`, ep.`State` as `EState`, ep.`SupervisorId`,\n" +
    "  eu.`DisplayName` as `EUserName`, e.`Name` as `EName`, e.`WriteFields`, e.`ViewFields`, ps.`ProcessFields`\n" +
    "from `PmElemProcess` ep\n" +
    "  join `PmElement` e on e.`Id` = ep.`ElemId`\n" +
    "  join `PmProcess` p on p.`Id` = ep.`ProcessId`\n" +
    "  join `PmProcessStruct` ps on ps.`Id` = p.`StructId`\n" +
    "  left join `User` eu on eu.`SysParentId` = ep.`SupervisorId`\n" +
    "where ep.`Id` = <%= id %>";

const SQL_GET_ALL_PELEMS_MSSQL =
    "select ep.[Id], ep.[ProcessId], ep.[ElemId], ep.[State], ep.[SupervisorId],\n" +
    "  eu.[DisplayName] as [EUserName], e.[Name]\n" +
    "from [PmElemProcess] ep\n" +
    "  join [PmElement] e on e.[Id] = ep.[ElemId]\n" +
    "  join [PmProcess] p on p.[Id] = ep.[ProcessId]\n" +
    "  left join [User] eu on eu.[SysParentId] = ep.[SupervisorId]\n" +
    "where p.[Id] = <%= id %>\n" +
    "order by ep.[Index]";

const SQL_GET_ALL_PELEMS_MYSQL =
    "select ep.`Id`, ep.`ProcessId`, ep.`ElemId`, ep.`State`, ep.`SupervisorId`,\n" +
    "  eu.`DisplayName` as `EUserName`, e.`Name`\n" +
    "from `PmElemProcess` ep\n" +
    "  join `PmElement` e on e.`Id` = ep.`ElemId`\n" +
    "  join `PmProcess` p on p.`Id` = ep.`ProcessId`\n" +
    "  left join `User` eu on eu.`SysParentId` = ep.`SupervisorId`\n" +
    "where p.`Id` = <%= id %>\n" +
    "order by ep.`Index`";

const SQL_GET_ALL_PSELEMS_MSSQL =
    "select e.[Id], e.[Name], e.[WriteFields], e.[ViewFields], e.[SupervisorId], u.[DisplayName], s.[Name] SName, e.[StructId]\n" +
    "from [PmProcessStruct] s\n" +
    "  join [PmElement] e on e.[StructId] = s.[Id]\n" +
    "  left join [User] u on u.[SysParentId] = e.[SupervisorId]\n" +
    "where s.[Id] = <%= id %>\n" +
    "order by e.[Index]";

const SQL_GET_ALL_PSELEMS_MYSQL =
    "select e.`Id`, e.`Name`, e.`WriteFields`, e.`ViewFields`, e.`SupervisorId`, u.`DisplayName`, s.`Name` SName, e.`StructId`\n" +
    "from `PmProcessStruct` s\n" +
    "  join `PmElement` e on e.`StructId` = s.`Id`\n" +
    "  left join `User` u on u.`SysParentId` = e.`SupervisorId`\n" +
    "where s.`Id` = <%= id %>\n" +
    "order by e.`Index`";

const SQL_GET_PFIELDS_MSSQL =
    "select s.[ProcessFields], p.[SupervisorId], u.[DisplayName], ll.[Name]\n" +
    "from [PmProcessStruct] s\n" +
    "  join [PmProcess] p on p.[StructId] = s.[Id]\n" +
    "  left join [User] u on u.[SysParentId] = p.[SupervisorId]\n" +
    "  left join [LessonLng] ll on ll.[LessonId] = p.[LessonId]\n" +
    "where p.[Id] = <%= id %>";

const SQL_GET_PFIELDS_MYSQL =
    "select s.`ProcessFields`, p.`SupervisorId`, u.`DisplayName`, ll.`Name`\n" +
    "from `PmProcessStruct` s\n" +
    "  join `PmProcess` p on p.`StructId` = s.`Id`\n" +
    "  left join `User` u on u.`SysParentId` = p.`SupervisorId`\n" +
    "  left join `LessonLng` ll on ll.`LessonId` = p.`LessonId`\n" +
    "where p.`Id` = <%= id %>";

const SQL_GET_PS_ID_BY_NAME_MSSQL = "select [Id] from [PmProcessStruct] where [Name] = '<%= name %>'";
const SQL_GET_PS_ID_BY_NAME_MYSQL = "select `Id` from `PmProcessStruct` where `Name` = '<%= name %>'";

const DFLT_LOCK_TIMEOUT_SEC = 180;
const DFLT_WAIT_LOCK_TIMEOUT_SEC = 60;

const LOCK_KEY_PREFIX = "_process_edt:";
const STRUCT_KEY_PREFIX = "_pstruct:";
const STRUCT_TTL_SEC = 1 * 60 * 60; // 1 hour

const PROCESS_PROTO_TABLE = {
    "Lesson Process Proto": require('./process-types/lesson')
};

const ProcessAPI = class ProcessAPI extends DbObject {

    constructor(options) {
        super(options);
        this._struct_cache = null;
    }

    async _getUser(options) {
        let opts = options || {};
        let user = opts.user;
        let userService = this.getService("users", true);
        if (!user)
            throw new HttpError(HttpCode.ERR_BAD_REQ, `ProcessAPI::_getUser: Missing user argument.`);
        if (typeof (user) === "number")
            user = await userService.getUserInfo({ id: user });
        return user;
    }

    async _checkPermissions(permissions, options) {
        let opts = options || {};
        let user = await this._getUser(opts);
        if (AccessRights.checkPermissions(user, permissions) === 0)
            throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет прав доступа для совершения операции.`);
        return user;
    }

    async _lockProcess(id, func, timeout) {
        const CHECK_TIMEOUT = 500;
        let is_key_set = false;
        let key;
        try {
            if (typeof (func) === "function") {
                await new Promise((resolve, reject) => {
                    key = `${LOCK_KEY_PREFIX}${id}`;
                    let is_rejected = false;
                    let thandler = setTimeout(() => {
                        if (!is_key_set) {
                            is_rejected = true;
                            reject(new HttpError(HttpCode.ERR_TOO_MANY_REQ, `Процесс модифицируется другим пользователем.`));
                        }
                    }, timeout ? timeout : DFLT_WAIT_LOCK_TIMEOUT_SEC);
                    let lock = async () => {
                        let lockRes = await this.cacheSet(key, "1", {
                            ttlInSec: DFLT_LOCK_TIMEOUT_SEC,
                            nx: true
                        });
                        if (lockRes === "OK") {
                            if (is_rejected)
                                await this.cacheDel(key)
                            else {
                                is_key_set = true;
                                clearTimeout(thandler);
                                resolve();
                            }
                        }
                        else
                            if (!is_rejected)
                                setTimeout(lock, CHECK_TIMEOUT);
                    }
                    lock();
                });
                let result = await func();
                await this.cacheDel(key);
                return result;
            }
        }
        catch (err) {
            if (is_key_set && key)
                await this.cacheDel(key);
            throw err;
        }
    }

    async getProcessList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);
        let isAdmin = AccessRights.checkPermissions(opts.user, AccessFlags.PmAdmin) !== 0;

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_PROC_LIST_MYSQL;
        let sql_mssql = SQL_GET_PROC_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        if (!isAdmin) {
            mssql_conds.push(`(u.[SysParentId] = ${opts.user.Id})`);
            mysql_conds.push(`(u.${'`'}SysParentId${'`'} = ${opts.user.Id})`);
            opts.supervisor = null;
        }
        if (opts.supervisor) {
            mssql_conds.push(`(u.[DisplayName] like N'%${opts.supervisor}%')`);
            mysql_conds.push(`(u.${'`'}DisplayName${'`'} like '%${opts.supervisor}%')`);
        }
        if (opts.state) {
            let states = Array.isArray(opts.state) ? opts.state : opts.state.split(',');
            mssql_conds.push(`(p.[State] in (${states.join(',')}))`);
            mysql_conds.push(`(p.${'`'}State${'`'} in (${states.join(',')}))`);
        }
        if (opts.course) {
            mssql_conds.push(`(cl.[Name] like N'%${opts.course}%')`);
            mysql_conds.push(`(cl.${'`'}Name${'`'} like '%${opts.course}%')`);
        }
        if (opts.lesson) {
            mssql_conds.push(`(ll.[Name] like N'%${opts.lesson}%')`);
            mysql_conds.push(`(ll.${'`'}Name${'`'} like '%${opts.lesson}%')`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND")}`;
        }

        if (opts.order) {
            let ord_arr = opts.order.split(',');
            let dir = ord_arr.length > 1 && (ord_arr[1].toUpperCase() === "DESC") ? "DESC" : "ASC";
            let mysql_field;
            let mssql_field;
            switch (ord_arr[0]) {
                case "Id":
                    mssql_field = "p.[Id]";
                    mysql_field = "p.`Id`";
                    break;
                case "TimeCr":
                    mssql_field = "p.[TimeCr]";
                    mysql_field = "p.`TimeCr`";
                    break;
                case "Name":
                    mssql_field = "p.[Name]";
                    mysql_field = "p.`Name`";
                    break;
                case "CourseName":
                    mssql_field = "cl.[Name]";
                    mysql_field = "cl.`Name`";
                    break;
                case "LessonName":
                    mssql_field = "ll.[Name]";
                    mysql_field = "ll.`Name`";
                    break;
                case "State":
                    mssql_field = "p.[State]";
                    mysql_field = "p.`State`";
                    break;
                case "DueDate":
                    mssql_field = "p.[DueDate]";
                    mysql_field = "p.`DueDate`";
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
        if (records && records.detail && (records.detail.length > 0)) {
            records.detail.forEach(elem => {
                let process = {
                    Id: elem.Id,
                    Name: elem.Name,
                    DueDate: elem.DueDate,
                    State: elem.State,
                    TimeCr: elem.TimeCr,
                    Supervisor: {
                        Id: elem.SupervisorId,
                        DisplayName: elem.DisplayName
                    },
                    Course: {
                        Id: elem.CourseId,
                        Name: elem.CourseName
                    },
                    Lesson: {
                        Id: elem.LessonId,
                        Name: elem.LsnName
                    }
                };
                result.push(process);
            });
        }

        return result;
    }

    async _getTaskElement(elem, result, elem_section, db_opts) {
        let dbOpts = db_opts || {};
        let elem_obj = elem_section ? result[elem_section] = {} : result;
        elem_obj.Id = elem.ElementId
        elem_obj.Name = elem.EName
        elem_obj.State = elem.EState
        if (elem.SupervisorId)
            elem_obj.Supervisor = { Id: elem.SupervisorId, DisplayName: elem.EUserName };
        if (elem.ViewFields) {
            let viewFields = JSON.parse(elem.ViewFields);
            let writeFields = {};
            result.WriteSets = {};
            if (elem.WriteFields) {
                result.WriteSets = JSON.parse(elem.WriteFields);
                if (result.WriteFieldSet) {
                    let wf_arr = result.WriteSets[result.WriteFieldSet];
                    if (Array.isArray(wf_arr)) {
                        for (let i = 0; Array.isArray(wf_arr) && (i < wf_arr.length); i++)
                            writeFields[wf_arr[i]] = true;
                    }
                    else
                        result.WriteFieldSet = null;
                }
            }

            let procFields = {};
            let root_obj = await this._getObjById(elem.ProcessId, { expr: { model: { name: "PmProcess" } } }, dbOpts);
            try {
                let collection = root_obj.getCol("DataElements");
                if (collection.count() != 1)
                    throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${id}) не найден.`);

                let process_obj = collection.get(0);
                await this._getFieldValues(process_obj, procFields);
                let procFieldDefs = JSON.parse(elem.ProcessFields);
                result.Fields = [];
                for (let i = 0; i < viewFields.length; i++) {
                    let fn = viewFields[i];
                    if (procFieldDefs[fn])
                        result.Fields.push(_.defaultsDeep({ name: fn, readOnly: writeFields[fn] ? false : true }, procFieldDefs[fn]));
                }
                for (let idx in result.Fields) {
                    let val = procFields[result.Fields[idx].name];
                    if (typeof (val) !== "undefined")
                        result.Fields[idx].value = val;
                }
            }
            finally {
                if (root_obj)
                    this._db._deleteRoot(root_obj.getRoot());
            }
        }
    }

    async getProcessElem(id, options) {
        let result = {};
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_PELEM_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_PELEM_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length === 1))
            await this._getTaskElement(records.detail[0], result, null, dbOpts)
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Элемент процесса (Id =${id}) не найден.`);
        return result;
    }

    async getTask(id, options) {
        let result;
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_TASK_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_TASK_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length === 1)) {
            let elem = records.detail[0];
            result = {
                Id: elem.Id,
                Name: elem.Name,
                TimeCr: elem.TimeCr,
                State: elem.State,
                DueDate: elem.DueDate,
                Description: elem.Description,
                AlertId: elem.AlertId,
                IsElemReady: elem.IsElemReady ? true : false,
                WriteFieldSet: elem.WriteFieldSet,
                Process: {
                    Id: elem.ProcessId,
                    Name: elem.ProcessName
                },
                Log: []
            };
            if (elem.ExecutorId)
                result.Executor = { Id: elem.ExecutorId, DisplayName: elem.UserName };

            if (elem.ElementId)
                await this._getTaskElement(elem, result, "Element", dbOpts);
        }
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${id}) не найдена.`);

        records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_TASK_LOG_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_TASK_LOG_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            records.detail.forEach(elem => {
                result.Log.push({
                    Id: elem.Id,
                    TimeCr: elem.TimeCr,
                    Text: elem.Text,
                    User: {
                        Id: elem.UserId,
                        DisplayName: elem.DisplayName
                    }
                });
            })
        }

        return result;
    }

    async getTaskList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);
        let access_rights = AccessRights.checkPermissions(opts.user,
            AccessFlags.PmAdmin | AccessFlags.PmSupervisor | AccessFlags.PmElemManager);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_TASK_LIST_MYSQL;
        let sql_mssql = SQL_GET_TASK_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        // Show only EXECUTING processes
        mssql_conds.push(`(p.[State] = ${ProcessState.Executing})`);
        mysql_conds.push(`(p.${'`'}State${'`'} = ${ProcessState.Executing})`);

        let has_executor = opts.hasExecutor ? (typeof (opts.hasExecutor) === "boolean" ?
            opts.hasExecutor : (opts.hasExecutor === "false" ? false : true)) : true;
        if (!(access_rights & AccessFlags.PmAdmin)) {
            if (access_rights & AccessFlags.PmSupervisor) {
                mssql_conds.push(`(pu.[SysParentId] = ${opts.user.Id})`);
                mysql_conds.push(`(pu.${'`'}SysParentId${'`'} = ${opts.user.Id})`);
            }
            else
                if (access_rights & AccessFlags.PmElemManager) {
                    mssql_conds.push(`((eu.[SysParentId] = ${opts.user.Id}) OR (u.[SysParentId] = ${opts.user.Id}))`);
                    mysql_conds.push(`((eu.${'`'}SysParentId${'`'} = ${opts.user.Id}) OR (u.${'`'}SysParentId${'`'} = ${opts.user.Id}))`);
                }
                else {
                    mssql_conds.push(`(u.[SysParentId] = ${opts.user.Id})`);
                    mysql_conds.push(`(u.${'`'}SysParentId${'`'} = ${opts.user.Id})`);
                    has_executor = true;
                    opts.executor = null;
                }
        }
        if (opts.process) {
            mssql_conds.push(`(p.[Name] like N'%${opts.process}%')`);
            mysql_conds.push(`(p.${'`'}Name${'`'} like '%${opts.process}%')`);
        }
        if (!has_executor) {
            mssql_conds.push(`(u.[SysParentId] is NULL)`);
            mysql_conds.push(`(u.${'`'}SysParentId${'`'} is NULL)`);
        }
        else
            if (opts.executor) {
                mssql_conds.push(`(u.[DisplayName] like N'%${opts.executor}%')`);
                mysql_conds.push(`(u.${'`'}DisplayName${'`'} like '%${opts.executor}%')`);
            }
        if (opts.state) {
            let states = Array.isArray(opts.state) ? opts.state : opts.state.split(',');
            mssql_conds.push(`(t.[State] in (${states.join(',')}))`);
            mysql_conds.push(`(t.${'`'}State${'`'} in (${states.join(',')}))`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND")}`;
        }

        if (opts.order) {
            let ord_arr = opts.order.split(',');
            let dir = ord_arr.length > 1 && (ord_arr[1].toUpperCase() === "DESC") ? "DESC" : "ASC";
            let mysql_field;
            let mssql_field;
            switch (ord_arr[0]) {
                case "Id":
                    mssql_field = "t.[Id]";
                    mysql_field = "t.`Id`";
                    break;
                case "TimeCr":
                    mssql_field = "t.[TimeCr]";
                    mysql_field = "t.`TimeCr`";
                    break;
                case "Name":
                    mssql_field = "t.[Name]";
                    mysql_field = "t.`Name`";
                    break;
                case "ProcessName":
                    mssql_field = "p.[ProcessName]";
                    mysql_field = "p.`ProcessName`";
                    break;
                case "State":
                    mssql_field = "t.[State]";
                    mysql_field = "t.`State`";
                    break;
                case "DueDate":
                    mssql_field = "t.[DueDate]";
                    mysql_field = "t.`DueDate`";
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
        if (records && records.detail && (records.detail.length > 0)) {
            records.detail.forEach(elem => {
                let task = {
                    Id: elem.Id,
                    Name: elem.Name,
                    DueDate: elem.DueDate,
                    State: elem.State,
                    TimeCr: elem.TimeCr,
                    Process: {
                        Id: elem.ProcessId,
                        Name: elem.ProcessName
                    }
                };
                if (elem.ElementId)
                    task["Element"] = { Id: elem.ElementId, Name: elem.ElName };
                if (elem.ExecutorId)
                    task["Executor"] = { Id: elem.ExecutorId, DisplayName: elem.DisplayName };
                result.push(task);
            });
        }

        return result;
    }

    async getProcessStructElems(id, options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_ALL_PSELEMS_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_ALL_PSELEMS_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            records.detail.forEach(elem => {
                result.push({
                    Id: elem.Id,
                    Name: elem.Name,
                    StructName: elem.SName,
                    StructId: elem.StructId,
                    SupervisorId: elem.SupervisorId,
                    Supervisor: elem.SupervisorId ? {
                        Id: elem.SupervisorId,
                        DisplayName: elem.DisplayName
                    } : undefined,
                    WriteFields: elem.WriteFields ? JSON.parse(elem.WriteFields) : null,
                    ViewFields: elem.ViewFields ? JSON.parse(elem.ViewFields) : null
                });
            });
        }

        return result;
    }

    async getProcessElems(id, options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_ALL_PELEMS_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_ALL_PELEMS_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            records.detail.forEach(elem => {
                result.push({
                    Id: elem.Id,
                    Name: elem.Name,
                    ElemId: elem.ElemId,
                    State: elem.State,
                    Supervisor: elem.SupervisorId ? {
                        Id: elem.SupervisorId,
                        DisplayName: elem.EUserName
                    } : undefined
                });
            });
        }

        return result;
    }

    async getProcess(id, options) {
        let result = { Elements: [], Tasks: [], Deps: [] };
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = await this._getObjById(id, { expr: { model: { name: "PmProcess" } } }, dbOpts);
        try {
            let collection = root_obj.getCol("DataElements");
            if (collection.count() != 1)
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${id}) не найден.`);

            let process_obj = collection.get(0);
            await this._getFieldValues(process_obj, result, ["GuidVer", "SysTypeId", "SupervisorId"]);

            let records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_PROCESS_PUB_ELEMS_MYSQL)({ id: id }),
                    mssql: _.template(SQL_PROCESS_PUB_ELEMS_MSSQL)({ id: id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                records.detail.forEach(elem => {
                    result.Elements.push({
                        Id: elem.Id,
                        Name: elem.Name,
                        State: elem.State,
                        ElemId: elem.ElemId,
                        TaskId: elem.TaskId,
                        Supervisor: elem.SupervisorId ? {
                            Id: elem.SupervisorId,
                            DisplayName: elem.DisplayName
                        } : undefined
                    });
                });
            }

            records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_GET_PFIELDS_MYSQL)({ id: id }),
                    mssql: _.template(SQL_GET_PFIELDS_MSSQL)({ id: id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length === 1)) {
                let rec = records.detail[0];
                result.ProcessFields = rec.ProcessFields ? JSON.parse(rec.ProcessFields) : undefined;
                result.Supervisor = rec.SupervisorId ? {
                    Id: rec.SupervisorId,
                    DisplayName: rec.DisplayName
                } : undefined;
                if (typeof (result.LessonId) !== "undefined") {
                    result.Lesson = {
                        Id: result.LessonId,
                        Name: rec.Name
                    };
                    delete result.LessonId;
                }
            }

            records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_PROCESS_TASKS_PUB_MYSQL)({ id: id }),
                    mssql: _.template(SQL_PROCESS_TASKS_PUB_MSSQL)({ id: id })
                }
            }, dbOpts);
            if (records && records.detail && (records.detail.length > 0)) {
                records.detail.forEach(elem => {
                    let val = _.clone(elem);
                    val.IsElemReady = val.IsElemReady ? true : false;
                    if (typeof (val.ExecutorId) !== "undefined") {
                        if (val.ExecutorId) {
                            val.Executor = {
                                Id: val.ExecutorId,
                                DisplayName: val.DisplayName
                            };
                        }
                        delete val.ExecutorId;
                        delete val.DisplayName;
                    }
                    result.Tasks.push(val);
                });
            }

            records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_PROCESS_DEPS_MYSQL)({ id: id }),
                    mssql: _.template(SQL_PROCESS_DEPS_MSSQL)({ id: id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                records.detail.forEach(elem => {
                    result.Deps.push(_.clone(elem));
                });
            }
        }
        finally {
            if (root_obj)
                this._db._deleteRoot(root_obj.getRoot());
        }
        return result;
    }

    async _get_process(id, options) {
        let result = { Elements: [], Tasks: [], Deps: [] };
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = await this._getObjById(id, { expr: { model: { name: "PmProcess" } } }, dbOpts);
        try {
            let collection = root_obj.getCol("DataElements");
            if (collection.count() != 1)
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${id}) не найден.`);

            let process_obj = collection.get(0);
            await this._getFieldValues(process_obj, result, { "GuidVer": true });

            let records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_PROCESS_ELEMS_MYSQL)({ id: id }),
                    mssql: _.template(SQL_PROCESS_ELEMS_MSSQL)({ id: id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                records.detail.forEach(elem => {
                    result.Elements.push(_.clone(elem));
                });
            }

            records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_PROCESS_TASKS_MYSQL)({ id: id }),
                    mssql: _.template(SQL_PROCESS_TASKS_MSSQL)({ id: id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                records.detail.forEach(elem => {
                    let val = _.clone(elem);
                    val.IsElemReady = val.IsElemReady ? true : false;
                    result.Tasks.push(val);
                });
            }

            records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_PROCESS_DEPS_MYSQL)({ id: id }),
                    mssql: _.template(SQL_PROCESS_DEPS_MSSQL)({ id: id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                records.detail.forEach(elem => {
                    result.Deps.push(_.clone(elem));
                });
            }
        }
        finally {
            if (root_obj)
                this._db._deleteRoot(root_obj.getRoot());
        }
        return result;
    }

    _get_proc_elems(process, rebuild) {
        if ((!process._elements) || rebuild) {
            process._elements = {};
            for (let i = 0; process.Elements && (i < process.Elements.length); i++) {
                process._elements[process.Elements[i].Id] = process.Elements[i];
            }
        }
        return process._elements;
    }

    _get_proc_tasks(process, rebuild) {
        if ((!process._tasks) || rebuild) {
            process._tasks = {};
            for (let i = 0; process.Tasks && (i < process.Tasks.length); i++) {
                process._tasks[process.Tasks[i].Id] = process.Tasks[i];
            }
        }
        return process._tasks;
    }

    _get_proc_deps(process, rebuild) {
        if ((!process._childs) || (!process._parents) || rebuild) {
            process._childs = {};
            process._parents = {};
            for (let i = 0; process.Deps && (i < process.Deps.length); i++) {
                let parent = process.Deps[i].DepTaskId;
                let child = process.Deps[i].TaskId;
                let parents = process._parents[child];
                let childs = process._childs[parent];
                if (!parents)
                    parents = process._parents[child] = {};
                if (!childs)
                    childs = process._childs[parent] = {};
                parents[parent] = 1;
                childs[child]=1;
            }
        }
    }

    _checkForCyclicDeps(process, rebuild) {
        this._get_proc_deps(process, rebuild);
        let trace = {};
        let parents = {};
        function check(parent) {
            if (process._childs[parent]) {
                if (!parents[parent]) {
                    parents[parent] = 1;
                    let childs = process._childs[parent];
                    for (let child in childs) {
                        if (trace[child])
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `В зависимостях задач есть циклы.`);
                        trace[child] = 1;
                        check(child);
                        delete trace[child];
                    }
                }
            }
        }
        for (let task in process._childs) {
            trace[task] = 1;
            check(task);
            delete trace[task];
        }
    }

    _getProcessTask(process, task_id, rebuild) {
        return this._get_proc_tasks(process, rebuild)[task_id];
    }

    _getProcessElement(process, elem_id, rebuild) {
        return this._get_proc_elems(process, rebuild)[elem_id];
    }

    async _getProcByObjId(id, obj_name, dbOpts) {
        let request;
        let err_msg;
        switch (obj_name) {
            case "task":
                request = {
                    dialect: {
                        mysql: _.template(SQL_PROCESS_BY_TASK_MYSQL)({ id: id }),
                        mssql: _.template(SQL_PROCESS_BY_TASK_MSSQL)({ id: id })
                    }
                };
                err_msg = `Задача (Id =${id}) не найдена.`;
                break;
            case "log":
                request = {
                    dialect: {
                        mysql: _.template(SQL_PROCESS_BY_LOG_MYSQL)({ id: id }),
                        mssql: _.template(SQL_PROCESS_BY_LOG_MSSQL)({ id: id })
                    }
                };
                err_msg = `Запись лога (Id =${id}) не найдена.`;
                break;
            case "elem":
                request = {
                    dialect: {
                        mysql: _.template(SQL_PROCESS_BY_ELEM_MYSQL)({ id: id }),
                        mssql: _.template(SQL_PROCESS_BY_ELEM_MSSQL)({ id: id })
                    }
                };
                err_msg = `Элемент процесса (Id =${id}) не найден.`;
                break;
            default:
                throw new Error(`Unknown object type: "${obj_name}"`);
        };
        let records = await $data.execSql(request, dbOpts);
        if (records && records.detail && (records.detail.length === 1)) {
            return records.detail[0].ProcessId;
        }        
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, err_msg);
    }

    async _checkIfPmTaskExecutor(userId) {
        try {
            await this._checkPermissions(AccessFlags.PmTaskExecutor, { user: userId });
        }
        catch (err) {
            if (err instanceof HttpError)
                switch (err.statusCode) {
                    case HttpCode.ERR_FORBIDDEN:
                        throw new HttpError(HttpCode.ERR_FORBIDDEN,
                            `Пользователь (Id=${userId}) не имеет права быть исполнителем задачи.`);
                    case HttpCode.ERR_NOT_FOUND:
                        throw new HttpError(HttpCode.ERR_NOT_FOUND,
                            `Исполнитель задачи (Id=${userId}) не найден.`);
                    default:
                        throw err;
                }
            else
                throw err;
        }
    }

    async _checkIfPmElemManager(userId) {
        try {
            await this._checkPermissions(AccessFlags.PmElemManager, { user: userId });
        }
        catch (err) {
            if (err instanceof HttpError)
                switch (err.statusCode) {
                    case HttpCode.ERR_FORBIDDEN:
                        throw new HttpError(HttpCode.ERR_FORBIDDEN,
                            `Пользователь (Id=${userId}) не имеет права быть ответственным за компонент.`);
                    case HttpCode.ERR_NOT_FOUND:
                        throw new HttpError(HttpCode.ERR_NOT_FOUND,
                            `Ответственный за компонент (Id=${userId}) не найден.`);
                    default:
                        throw err;
                }
            else
                throw err;
        }
    }

    async _checkIfPmSupervisor(userId) {
        try {
            await this._checkPermissions(AccessFlags.PmSupervisor, { user: userId });
        }
        catch (err) {
            if (err instanceof HttpError)
                if (err instanceof HttpError)
                    switch (err.statusCode) {
                        case HttpCode.ERR_FORBIDDEN:
                            throw new HttpError(HttpCode.ERR_FORBIDDEN,
                                `Пользователь (Id=${userId}) не имеет права быть супервизором процесса.`);
                        case HttpCode.ERR_NOT_FOUND:
                            throw new HttpError(HttpCode.ERR_NOT_FOUND,
                                `Супервизор процесса (Id=${userId}) не найден.`);
                        default:
                            throw err;
                    }
                else
                    throw err;
        }
    }

    async setElemProc(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};

        let process_id = await this._getProcByObjId(id, "elem", dbOpts);
        return this._lockProcess(process_id, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, PROC_ELEM_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Элемент процесса (Id =${process_id}) не найден.`);
                        let procElemObj = collection.get(0);

                        let process = await this._get_process(procElemObj.processId(), opts);
                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно изменить элемент в завершившемся процессе.`);

                        await procElemObj.edit();
                        if (typeof (inpFields.SupervisorId) === "number") {
                            procElemObj.supervisorId(inpFields.SupervisorId);
                            if (inpFields.SupervisorId !== opts.user.Id)
                                await this._checkIfPmElemManager(inpFields.SupervisorId);
                        }

                        if (typeof (inpFields.State) !== "undefined")
                            if ((typeof (inpFields.State) === "number") && (inpFields.State > 0)
                                && (inpFields.State <= Object.keys(ElemState).length)) {
                                procElemObj.state(inpFields.State);
                            }
                            else
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Недопустимое значение или тип поля "State": ${inpFields.State} тип: "${typeof(inpFields.State)}".`);

                        await procElemObj.save();
                        if (logModif)
                            console.log(buildLogString(`Process element updated: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    async delElemProc(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;

        let process_id = await this._getProcByObjId(id, "elem", dbOpts);
        return this._lockProcess(process_id, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(process_id, PROCESS_WITH_ELEMS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${process_id}) не найден.`);
                        let procObj = collection.get(0);
                        if (procObj.state() === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить элемент в завершившемся процессе.`);

                        await procObj.edit();

                        let root_elems = procObj.getDataRoot("PmElemProcess");
                        collection = root_elems.getCol("DataElements");
                        let elem_to_del = null;
                        for (let i = 0; i < collection.count(); i++) {
                            let obj = collection.get(i);
                            if (obj.id() === id) {
                                elem_to_del = obj;
                            }
                            if (elem_to_del)
                                obj.index(obj.index() - 1);
                        }
                        if (!elem_to_del)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Элемент (Id = ${id}) не найден.`);

                        collection._del(elem_to_del);

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_ELEMPROC_DEL_MYSQL)({ id: id }),
                                    mssql: _.template(SQL_ELEMPROC_DEL_MSSQL)({ id: id })
                                }
                            }, dbOpts);
                            await procObj.save(dbOpts);
                            await $data.tranCommit(transactionId)
                        }
                        catch (err) {
                            await $data.tranRollback(transactionId);
                            throw err;
                        }

                        if (logModif)
                            console.log(buildLogString(`Process element deleted: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    async addElemProc(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let newId;

        if (typeof (inpFields.ProcessId) !== "number")
            throw new Error(`Invalid or missing field "ProcessId"`);

        let process_id = inpFields.ProcessId;
        return this._lockProcess(process_id, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(process_id, PROCESS_WITH_ELEMS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${process_id}) не найден.`);
                        let procObj = collection.get(0);
                        if (procObj.state() === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно добавить элемент в завершившийся процесс.`);

                        let pstruct = await this.getProcessStruct(procObj.structId(), opts);
                        let elem = this._getProcessElement(pstruct, inpFields.ElementId);
                        if (!elem)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Элемент (ElementId = ${inpFields.ElementId}) не найден.`);

                        let root_elems = procObj.getDataRoot("PmElemProcess");
                        collection = root_elems.getCol("DataElements");
                        for (let i = 0; i < collection.count(); i++){
                            let obj = collection.get(i);
                            if (obj.elemId() === elem.Id)
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Элемент (ElementId = ${inpFields.ElementId}) уже существует.`);
                        }

                        let fields = { Index: collection.count() + 1, ElemId: inpFields.ElementId, State: ElemState.NotReady };
                        if (typeof (inpFields.SupervisorId) === "number") {
                            fields.SupervisorId = inpFields.SupervisorId;
                            if (inpFields.SupervisorId !== opts.user.Id)
                                await this._checkIfPmElemManager(inpFields.SupervisorId);
                        }

                        await procObj.edit();

                        let newHandler = await root_elems.newObject({
                            fields: fields
                        }, dbOpts);

                        newId = newHandler.keyValue;
                        await procObj.save(dbOpts);
                        if (logModif)
                            console.log(buildLogString(`Process element created: Id="${newId}".`));
                        return { result: "OK", id: newId };
                    })
            }, memDbOptions);
        });
    }

    async delTasklog(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let processId = await this._getProcByObjId(id, "log", dbOpts);

        return this._lockProcess(processId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, TASKLOG_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        let root_obj = result;

                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Запись лога (Id =${id}) не найдена.`);
                        let logObj = collection.get(0);

                        if (logObj.userId() !== opts.user.Id)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить чужую запись.`);

                        let troot_obj = await this._getObjById(logObj.taskId(), TASK_ONLY_EXPRESSION, dbOpts);
                        memDbOptions.dbRoots.push(troot_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let tcollection = troot_obj.getCol("DataElements");
                        if (tcollection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${taskObj.processId()}) не найдена.`);
                        let taskObj = tcollection.get(0);

                        if (taskObj.state() === TaskState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить запись лога в завершившейся задаче.`);

                        let proot_obj = await this._getObjById(taskObj.processId(), PROCESS_ONLY_EXPRESSION, dbOpts);
                        memDbOptions.dbRoots.push(proot_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let pcollection = proot_obj.getCol("DataElements");
                        if (pcollection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${taskObj.processId()}) не найден.`);
                        let processObj = pcollection.get(0);

                        if (processObj.state() === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить запись лога в завершившемся процессе.`);

                        await root_obj.edit();
                        collection._del(logObj);
                        await root_obj.save(dbOpts);

                        if (logModif)
                            console.log(buildLogString(`Task log deleted: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    async updateTasklog(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let inpFields = data || {};

        let processId = await this._getProcByObjId(id, "log", dbOpts);

        return this._lockProcess(processId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, TASKLOG_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        let root_obj = result;

                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Запись лога (Id =${id}) не найдена.`);
                        let logObj = collection.get(0);

                        if (logObj.userId() !== opts.user.Id)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно отредактировать чужую запись.`);

                        let troot_obj = await this._getObjById(logObj.taskId(), TASK_ONLY_EXPRESSION, dbOpts);
                        memDbOptions.dbRoots.push(troot_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let tcollection = troot_obj.getCol("DataElements");
                        if (tcollection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${taskObj.processId()}) не найдена.`);
                        let taskObj = tcollection.get(0);

                        if (taskObj.state() === TaskState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно изменить запись лога в завершившейся задаче.`);

                        let proot_obj = await this._getObjById(taskObj.processId(), PROCESS_ONLY_EXPRESSION, dbOpts);
                        memDbOptions.dbRoots.push(proot_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let pcollection = proot_obj.getCol("DataElements");
                        if (pcollection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${taskObj.processId()}) не найден.`);
                        let processObj = pcollection.get(0);

                        if (processObj.state() === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно изменить запись лога в завершившемся процессе.`);

                        await logObj.edit();
                        this._setFieldValues(logObj, inpFields, null, ["Text"]);
                        await logObj.save(dbOpts);

                        if (logModif)
                            console.log(buildLogString(`Task log modified: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    async delTaskDep(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let inpFields = data || {};

        if (typeof (inpFields.DepTaskId) !== "number")
            throw new Error(`Invalid or missing "DepTaskId": ${inpFields.DepTaskId} type: "${typeof (inpFields.DepTaskId)}".`);

        if (typeof (inpFields.TaskId) !== "number")
            throw new Error(`Invalid or missing "TaskId": ${inpFields.TaskId} type: "${typeof (inpFields.TaskId)}".`);

        let id = inpFields.TaskId;
        let parent_id = inpFields.DepTaskId;

        let processId = await this._getProcByObjId(id, "task", dbOpts);

        return this._lockProcess(processId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, TASK_WITH_PARENTS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        let root_obj = result;

                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${id}) не найдена.`);
                        let taskObj = collection.get(0);

                        if ((taskObj.state() !== TaskState.Draft) && (taskObj.state() !== TaskState.ReadyToStart))
                            throw new HttpError(HttpCode.ERR_BAD_REQ,
                                `Невозможно добавить зависимость для задачи в состоянии "${TaskStateStr[taskObj.state()]}".`);

                        let process = await this._get_process(taskObj.processId(), opts);
                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно добавить зависимость в завершившийся процесс".`);

                        let parent_task = this._getProcessTask(process, parent_id);
                        if (!parent_task)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Родительская задача "${parent_id}" не существует.`);

                        await taskObj.edit();

                        let root_dep = taskObj.getDataRoot("PmDepTask");
                        collection = root_dep.getCol("DataElements");
                        let dep_to_del = null;
                        for (let i = 0; i < collection.count(); i++) {
                            let dep = collection.get(i);
                            if (dep.depTaskId() === parent_id) {
                                dep_to_del = dep;
                                break;
                            }
                        }

                        if (!dep_to_del)
                            throw new HttpError(HttpCode.ERR_BAD_REQ,
                                `Задача "${id}" не зависит от задачи "${parent_id}".`);

                        let dep_id = dep_to_del.id();
                        collection._del(dep_to_del);
                        if ((taskObj.state() === TaskState.Draft) && (process.State !== ProcessState.Draft)) {
                            let is_ready = true;
                            for (let i = 0; i < collection.count(); i++) {
                                let dep = collection.get(i);
                                let ptask = this._getProcessTask(process, dep.depTaskId());
                                if (ptask && (ptask.State !== TaskState.Finished)) {
                                    is_ready = false;
                                    break;
                                }
                            }
                            if (is_ready)
                                taskObj.state(TaskState.ReadyToStart);
                        }
                        await taskObj.save(dbOpts);

                        if (logModif)
                            console.log(buildLogString(`Dependency deleted: Id="${dep_id}".`));
                        return { result: "OK", id: dep_id };
                    })
            }, memDbOptions);
        });
    }

    async newTaskDep(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let inpFields = data || {};

        if (typeof (inpFields.DepTaskId) !== "number")
            throw new Error(`Invalid or missing "DepTaskId": ${inpFields.DepTaskId} type: "${typeof (inpFields.DepTaskId)}".`);

        if (typeof (inpFields.TaskId) !== "number")
            throw new Error(`Invalid or missing "TaskId": ${inpFields.TaskId} type: "${typeof (inpFields.TaskId)}".`);

        let id = inpFields.TaskId;
        let parent_id = inpFields.DepTaskId;

        let processId = await this._getProcByObjId(id, "task", dbOpts);

        return this._lockProcess(processId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, TASK_WITH_PARENTS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        let root_obj = result;

                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${id}) не найдена.`);
                        let taskObj = collection.get(0);

                        if ((taskObj.state() !== TaskState.Draft) && (taskObj.state() !== TaskState.ReadyToStart))
                            throw new HttpError(HttpCode.ERR_BAD_REQ,
                                `Невозможно добавить зависимость для задачи в состоянии "${TaskStateStr[taskObj.state()]}".`);

                        let process = await this._get_process(taskObj.processId(), opts);
                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно добавить зависимость в завершившийся процесс".`);

                        let parent_task = this._getProcessTask(process, parent_id);
                        if(!parent_task)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Родительская задача "${parent_id}" не существует.`);

                        let root_dep = taskObj.getDataRoot("PmDepTask");
                        collection = root_dep.getCol("DataElements");
                        for (let i = 0; i < collection.count(); i++){
                            let dep = collection.get(i);
                            if (dep.depTaskId() === parent_id)
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Зависимость задачи "${id}" от "${parent_id}" уже существует.`);
                        }

                        process.Deps.push({ TaskId: id, DepTaskId: parent_id });
                        this._checkForCyclicDeps(process, true);

                        await taskObj.edit();

                        let newHandler = await root_dep.newObject({
                            fields: { DepTaskId: parent_id }
                        }, dbOpts);

                        if ((taskObj.state() === TaskState.ReadyToStart) && (parent_task.State!==TaskState.Finished)) {
                            taskObj.state(TaskState.Draft);
                        }
                        await taskObj.save(dbOpts);

                        if (logModif)
                            console.log(buildLogString(`Dependency created: Id="${newHandler.keyValue}".`));
                        return { result: "OK", id: newHandler.keyValue };
                    })
            }, memDbOptions);
        });
    }

    async delTask(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let processId = await this._getProcByObjId(id, "task", dbOpts);

        return this._lockProcess(processId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, TASK_ONLY_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        let root_obj = result;

                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${id}) не найдена.`);
                        let taskObj = collection.get(0);

                        if ((taskObj.state() !== TaskState.Draft) && (taskObj.state() !== TaskState.ReadyToStart))
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить задачу в состоянии "${TaskStateStr[taskObj.state()]}".`);

                        let proot_obj = await this._getObjById(taskObj.processId(), PROCESS_ONLY_EXPRESSION, dbOpts);
                        memDbOptions.dbRoots.push(proot_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let pcollection = proot_obj.getCol("DataElements");
                        if (pcollection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${taskObj.processId()}) не найден.`);
                        let processObj = pcollection.get(0);

                        if (processObj.state() === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить задачу из завершившегося процесса.`);

                        await root_obj.edit();
                        collection._del(taskObj);

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_TASK_DEL_TASKDEP_MYSQL)({ id: id }),
                                    mssql: _.template(SQL_TASK_DEL_TASKDEP_MSSQL)({ id: id })
                                }
                            }, dbOpts);
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_TASK_DEL_TASKLOG_MYSQL)({ id: id }),
                                    mssql: _.template(SQL_TASK_DEL_TASKLOG_MSSQL)({ id: id })
                                }
                            }, dbOpts);
                            await root_obj.save(dbOpts);
                            await $data.tranCommit(transactionId)
                        }
                        catch (err) {
                            await $data.tranRollback(transactionId);
                            throw err;
                        }
                        if (logModif)
                            console.log(buildLogString(`Task deleted: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    _getListToGoBack(process, id) {
        let result = [];
        this._get_proc_deps(process);
        let childs = process._childs[id];
        if (childs) {
            for (let child in childs) {
                let task = this._getProcessTask(process, child);
                if (task && (task.State === TaskState.ReadyToStart))
                    result.push(task.Id);
            }
        }
        return result;
    }

    _getListToGoForward(process, id) {
        let result = [];
        this._get_proc_deps(process);
        let root = this._getProcessTask(process, id);
        root.State = TaskState.Finished;
        let childs = process._childs[id];
        if (childs) {
            for (let child in childs) {
                let task = this._getProcessTask(process, child);
                if (task && (task.State === TaskState.Draft)) {
                    let parents = process._parents[task.Id];
                    let is_ok = true;
                    if (parents) {
                        for (let parent in parents) {
                            let tp = this._getProcessTask(process, parent);
                            if (tp && (tp.State !== TaskState.Finished)) {
                                is_ok = false;
                                break;
                            }
                        }
                    }
                    if (is_ok)
                        result.push(task.Id);
                }
            }
        }
        return result;
    }

    _getFieldSetByElemId(pstruct, process, elem_id, set_name) {
        let result = null;
        let elem_proc = this._getProcessElement(process, elem_id);
        if (elem_proc) {
            let elem = this._getProcessElement(pstruct, elem_proc.ElemId);
            if (elem && elem.WriteFields)
                result = elem.WriteFields[set_name];
        }
        return result;
    }

    async updateTask(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);
        let isSupervisor = AccessRights.checkPermissions(opts.user, AccessFlags.PmSupervisor) !== 0;

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let inpFields = data || {};
        let processId = await this._getProcByObjId(id, "task", dbOpts);

        return this._lockProcess(processId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, TASK_WITH_LOGS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        let root_obj = result;

                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${id}) не найдена.`);
                        let taskObj = collection.get(0);

                        if (!(isSupervisor || (taskObj.executorId() === opts.user.Id)))
                            throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет прав доступа для совершения операции.`);

                        if ((!isSupervisor) && ((taskObj.state() === TaskState.Draft) || (taskObj.state() === TaskState.Finished)))
                            throw new HttpError(HttpCode.ERR_FORBIDDEN,
                                `Пользователь не может менять задачу в состоянии "${TaskStateStr[taskObj.state()]}".`);

                        await taskObj.edit();

                        root_obj = await this._getObjById(taskObj.processId(), PROCESS_ONLY_EXPRESSION, dbOpts);
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${taskObj.processId()}) не найден.`);
                        let processObj = collection.get(0);

                        if (processObj.state() === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно изменить задачу в завершившемся процессе.`);

                        let process = await this._get_process(taskObj.processId(), opts);
                        let pstruct = await this.getProcessStruct(process.StructId, opts);

                        if (((typeof (inpFields.ElementId) === "number") || (inpFields.ElementId === null)) &&
                            (taskObj.elementId() !== inpFields.ElementId)) {
                            if (!isSupervisor)
                                throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет права изменять элемент задачи.`);
                            if (inpFields.ElementId) {
                                let elem = this._getProcessElement(process, inpFields.ElementId);
                                if (!elem)
                                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Элемент (ElementId = ${inpFields.ElementId}) не найден.`);
                            }
                            taskObj.elementId(inpFields.ElementId);
                        }

                        if ((typeof (inpFields.IsElemReady) === "boolean") && (taskObj.isElemReady() !== inpFields.ElementId)) {
                            if (!isSupervisor)
                                throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет права изменять зависимость элемента задачи.`);
                            taskObj.isElemReady(inpFields.IsElemReady);
                        }

                        let elemObj = null;
                        if (taskObj.elementId()) {
                            root_obj = await this._getObjById(taskObj.elementId(), PROC_ELEM_EXPRESSION, dbOpts);
                            memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                            collection = root_obj.getCol("DataElements");
                            if (collection.count() != 1)
                                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Элемент (Id =${taskObj.elementId()}) не найден.`);
                            elemObj = collection.get(0);
                        }

                        if (typeof (inpFields.ExecutorId) !== "undefined") {
                            let old_executor = taskObj.executorId();
                            let new_executor = (typeof (inpFields.ExecutorId) === "number") && (inpFields.ExecutorId > 0) ? inpFields.ExecutorId : null;
                            if (old_executor !== new_executor) {
                                if (!isSupervisor)
                                    throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет права изменять исполнителя задачи.`);
                                taskObj.executorId(new_executor);
                                if (new_executor)
                                    await this._checkIfPmTaskExecutor(new_executor);
                            }
                        }

                        if (isSupervisor)
                            this._setFieldValues(taskObj, inpFields, null, ["Name", "Description", "DueDate"]);

                        let child_tasks = [];
                        if (typeof (inpFields.State) !== "undefined")
                            if ((typeof (inpFields.State) === "number") && (inpFields.State > 0)
                                && (inpFields.State <= Object.keys(TaskState).length)) {
                                if (taskObj.state() !== inpFields.State) {
                                    if (inpFields.State === TaskState.Draft)
                                        throw new HttpError(HttpCode.ERR_BAD_REQ,
                                            `Невозможно принудительно перевести задачу в состояние "${TaskStateStr[inpFields.State]}".`);

                                    if (processObj.state() === ProcessState.Draft)
                                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно изменить состояние задачи в процессе "Черновик".`);

                                    let task_ids = [];
                                    let task_state;
                                    if (taskObj.state() === TaskState.Finished) {
                                        task_state = TaskState.Draft;
                                        task_ids = this._getListToGoBack(process, id);
                                    }
                                    else
                                        if (inpFields.State === TaskState.Finished) {
                                            task_state = TaskState.ReadyToStart;
                                            task_ids = this._getListToGoForward(process, id);
                                        }
                                    if (task_ids.length > 0) {
                                        for (let i = 0; i < task_ids.length; i++) {
                                            root_obj = await this._getObjById(task_ids[i], TASK_ONLY_EXPRESSION, dbOpts);
                                            memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                            collection = root_obj.getCol("DataElements");
                                            if (collection.count() != 1)
                                                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Дочерняя задача (Id =${task_ids[i]}) не найдена.`);
                                            let ctask = collection.get(0);
                                            await ctask.edit();
                                            ctask.state(task_state);
                                            child_tasks.push(ctask);
                                        }
                                    }
                                    taskObj.state(inpFields.State);
                                }
                            }
                            else
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Недопустимое значение или тип поля "State": ${inpFields.State} тип: "${typeof (inpFields.State)}".`);

                        if (typeof (inpFields.Comment) === "string") {
                            let root_log = taskObj.getDataRoot("PmTaskLog");
                            let newHandler = await root_log.newObject({
                                fields: { Text: inpFields.Comment, UserId: opts.user.Id }
                            }, dbOpts);
                            if (taskObj.state() === TaskState.Alert)
                                taskObj.alertId(newHandler.keyValue);
                        }

                        if ((typeof (inpFields.WriteFieldSet) !== "undefined") && (taskObj.writeFieldSet() !== inpFields.WriteFieldSet)) {
                            if (!isSupervisor)
                                throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет права изменять набор редактируемых полей.`);
                            taskObj.writeFieldSet(inpFields.WriteFieldSet);
                        }

                        await processObj.edit();

                        let allowed_fields = [];
                        if (taskObj.elementId() && taskObj.writeFieldSet()) {
                            let wr_set = this._getFieldSetByElemId(pstruct, process, taskObj.elementId(), taskObj.writeFieldSet());
                            if (!wr_set)
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Набор полей редактирования "${taskObj.writeFieldSet()}" не существует.`);
                            wr_set.forEach(elem => {
                                allowed_fields.push(elem);
                            });
                        }

                        if (typeof (inpFields.Fields) !== "undefined") {
                            this._setFieldValues(processObj, inpFields.Fields,
                                ["Id", "Name", "State", "StructId", "SupervisorId", "LessonId", "DueDate"], allowed_fields);
                        }

                        if (elemObj)
                            await elemObj.edit();
                        if (taskObj.isElemReady() && (taskObj.state() === TaskState.Finished) && elemObj) {
                            elemObj.state(ElemState.Ready);
                        }

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            for (let i = 0; i < child_tasks.length; i++)
                                await child_tasks[i].save(dbOpts);
                            await taskObj.save(dbOpts);
                            await processObj.save(dbOpts);
                            if (elemObj)
                                await elemObj.save(dbOpts);
                            await $data.tranCommit(transactionId)
                        }
                        catch (err) {
                            await $data.tranRollback(transactionId);
                            throw err;
                        }
                        if (logModif)
                            console.log(buildLogString(`Task updated: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    async newTask(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let taskObj = null;
        let newId;

        if (typeof (inpFields.ProcessId) !== "number")
            throw new Error(`Invalid or missing field "ProcessId"`);

        return this._lockProcess(inpFields.ProcessId, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(-1, TASK_WITH_PARENTS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                        await root_obj.edit();

                        let process = await this._get_process(inpFields.ProcessId, opts);
                        let pstruct = await this.getProcessStruct(process.StructId, opts);

                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно создать задачу в завершившемся процессе.`);

                        let task_state = TaskState.Draft; // State = "В ожидании"
                        if (process.State === ProcessState.Executing) {
                            if (inpFields.Dependencies && (inpFields.Dependencies.length > 0)) {
                                let finished_cnt = 0;
                                for (let i = 0; i < inpFields.Dependencies.length; i++) {
                                    let elem = inpFields.Dependencies[i];
                                    let task = this._getProcessTask(process, elem);
                                    if (!task)
                                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Родительская задача Id = ${elem} не существует.`);
                                    if (task.State !== TaskState.Finished)
                                        break;
                                    finished_cnt++;
                                }
                                if (finished_cnt === inpFields.Dependencies.length)
                                    task_state = TaskState.ReadyToStart;
                            }
                            else
                                task_state = TaskState.ReadyToStart;
                        }
                            
                        let fields = { ProcessId: inpFields.ProcessId, IsElemReady: true, State: task_state, AlertId: null };

                        if (typeof (inpFields.Name) !== "undefined")
                            fields.Name = inpFields.Name
                        else
                            throw new Error(`Missing field "Name"`);

                        if (typeof (inpFields.ExecutorId) === "number") {
                            fields.ExecutorId = inpFields.ExecutorId;
                            if (inpFields.ExecutorId !== opts.user.Id)
                                await this._checkIfPmTaskExecutor(inpFields.ExecutorId);
                        }

                        let need_elem_rollback = false;

                        if (typeof (inpFields.ElementId) === "number") {
                            let elem = this._getProcessElement(process, inpFields.ElementId);
                            if(!elem)
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Элемент (ElementId = ${inpFields.ElementId}) не найден.`);
                            fields.ElementId = inpFields.ElementId;
                            if (typeof (inpFields.IsElemReady) === "boolean") {
                                fields.IsElemReady = inpFields.IsElemReady;
                                if (inpFields.IsElemReady && (elem.State === ElemState.Ready))
                                    need_elem_rollback = true;
                            }
                        }

                        let newHandler = await root_obj.newObject({
                            fields: fields
                        }, dbOpts);

                        newId = newHandler.keyValue;
                        taskObj = this._db.getObj(newHandler.newObject);
                        fields.Id = newId;
                        this._setFieldValues(taskObj, inpFields, fields);

                        if (taskObj.elementId() && taskObj.writeFieldSet()) {
                            let wr_set = this._getFieldSetByElemId(pstruct, process, taskObj.elementId(), taskObj.writeFieldSet());
                            if (!wr_set)
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Набор полей редактирования "${taskObj.writeFieldSet()}" не существует.`);
                        }

                        let elemObj = null;
                        if (taskObj.elementId() && need_elem_rollback) {
                            let el_root_obj = await this._getObjById(taskObj.elementId(), PROC_ELEM_EXPRESSION, dbOpts);
                            memDbOptions.dbRoots.push(el_root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                            let collection = el_root_obj.getCol("DataElements");
                            if (collection.count() != 1)
                                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Элемент (Id =${taskObj.elementId()}) не найден.`);
                            elemObj = collection.get(0);
                            await elemObj.edit();
                            elemObj.state(ElemState.Partly);
                        }

                        if (inpFields.Dependencies && (inpFields.Dependencies.length > 0)) {
                            let root_elems = taskObj.getDataRoot("PmDepTask");
                            for (let i = 0; i < inpFields.Dependencies.length; i++) {
                                let elem = inpFields.Dependencies[i];
                                await root_elems.newObject({
                                    fields: { DepTaskId: elem }
                                }, dbOpts);
                            }
                        }

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            await root_obj.save(dbOpts);
                            if (elemObj)
                                await elemObj.save(dbOpts);
                            await $data.tranCommit(transactionId)
                        }
                        catch (err) {
                            await $data.tranRollback(transactionId);
                            throw err;
                        }

                        if (logModif)
                            console.log(buildLogString(`Task created: Id="${newId}".`));
                        return { result: "OK", id: newId };
                    })
            }, memDbOptions);
        });
    }

    _canGoToDraft(process) {
        let result = [];
        for (let i = 0; i < process.Tasks.length; i++) {
            if ((process.Tasks[i].State !== TaskState.Draft) && (process.Tasks[i].State !== TaskState.ReadyToStart))
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Не все задачи процесса в состоянии "В ожидании" или "Можно приступать".`);
            if (process.Tasks[i].State === TaskState.ReadyToStart)
                result.push(process.Tasks[i].Id);
        }
        return result;
    }

    _canGoToFinished(process) {
        for (let i = 0; i < process.Elements.length; i++){
            if (process.Elements[i].State !== ElemState.Ready)
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Не все элементы процесса находятся в состоянии готовности.`);
        }
        for (let i = 0; i < process.Tasks.length; i++) {
            if (process.Tasks[i].State !== TaskState.Finished)
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Не все задачи процесса завершены.`);
        }
    }

    _makeTasksReady(process) {
        let result = [];
        this._get_proc_deps(process);
        for (let i = 0; i < process.Tasks.length; i++) {
            let task = process.Tasks[i];
            if (task.State === TaskState.Draft) {
                let needs_to_change = true;
                let parents = process._parents[task.Id];
                if (parents) {
                    for (let p in parents) {
                        let pt = this._getProcessTask(process, p);
                        if (pt.State !== TaskState.Finished) {
                            needs_to_change = false;
                            break;
                        }
                    }
                }
                if (needs_to_change)
                    result.push(task.Id);
            }
        }
        return result;
    }

    async updateProcess(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};

        return this._lockProcess(id, async () => {
            return Utils.editDataWrapper(() => {

                return new MemDbPromise(this._db, resolve => {
                    resolve(this._getObjById(id, PROCESS_WITH_ELEMS_EXPRESSION, dbOpts));
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${id}) не найден.`);
                        let procObj = collection.get(0);

                        let process = await this._get_process(id, opts);

                        await procObj.edit();

                        let ready_tasks = [];
                        if (typeof (inpFields.State) !== "undefined")
                            if ((typeof (inpFields.State) === "number") && (inpFields.State > 0)
                                && (inpFields.State <= Object.keys(ProcessState).length)) {
                                if (procObj.state() !== inpFields.State) {
                                    let is_allowed = false;
                                    let algo = 0;
                                    switch (procObj.state()) {
                                        case ProcessState.Draft:
                                            algo = 3;
                                            is_allowed = inpFields.State === ProcessState.Executing;
                                            break;
                                        case ProcessState.Executing:
                                            switch (inpFields.State) {
                                                case ProcessState.Finished:
                                                    algo = 1;
                                                    is_allowed = true;
                                                    break;
                                                case ProcessState.Draft:
                                                    algo = 2;
                                                    is_allowed = true;
                                                    break;
                                            }
                                            break;
                                        case ProcessState.Finished:
                                            switch (inpFields.State) {
                                                case ProcessState.Executing:
                                                    is_allowed = true;
                                                    break;
                                                case ProcessState.Draft:
                                                    algo = 2;
                                                    is_allowed = true;
                                                    break;
                                            }
                                            break;
                                    }
                                    if (is_allowed) {
                                        let task_ids = [];
                                        let task_state;
                                        switch (algo) {
                                            case 1:
                                                this._canGoToFinished(process);
                                                break;
                                            case 2:
                                                task_ids = this._canGoToDraft(process);
                                                task_state = TaskState.Draft;
                                                break;
                                            case 3:
                                                task_ids = this._makeTasksReady(process);
                                                task_state = TaskState.ReadyToStart;
                                                break;
                                        }
                                        if (task_ids.length > 0) {
                                            for (let i = 0; i < task_ids.length; i++) {
                                                let t_root_obj = await this._getObjById(task_ids[i], TASK_ONLY_EXPRESSION, dbOpts);
                                                memDbOptions.dbRoots.push(t_root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                                let collection = t_root_obj.getCol("DataElements");
                                                if (collection.count() != 1)
                                                    throw new HttpError(HttpCode.ERR_NOT_FOUND, `Задача (Id =${task_ids[i]}) не найдена.`);
                                                let ctask = collection.get(0);
                                                await ctask.edit();
                                                ctask.state(task_state);
                                                ready_tasks.push(ctask);
                                            }
                                        }
                                        procObj.state(inpFields.State);
                                    }
                                    else
                                        throw new HttpError(HttpCode.ERR_BAD_REQ,
                                            `Недопустимый переход из состояния "${ProcessStateStr[procObj.state()]}" в ` +
                                            `"${ProcessStateStr[inpFields.State]}".`);
                                }
                            }
                            else
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Недопустимое значение или тип поля "State": ${inpFields.State} тип: "${typeof (inpFields.State)}".`);

                        if (typeof (inpFields.SupervisorId) === "number") {
                            procObj.supervisorId(inpFields.SupervisorId);
                            if (inpFields.SupervisorId !== opts.user.Id)
                                await this._checkIfPmSupervisor(inpFields.SupervisorId);
                        }

                        this._setFieldValues(procObj, inpFields, ["Id", "State", "SupervisorId", "StructId", "LessonId"]);

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            for (let i = 0; i < ready_tasks.length; i++)
                                await ready_tasks[i].save(dbOpts);
                            await procObj.save(dbOpts);
                            await $data.tranCommit(transactionId)
                        }
                        catch (err) {
                            await $data.tranRollback(transactionId);
                            throw err;
                        }

                        if (logModif)
                            console.log(buildLogString(`Process updated: Id="${id}".`));
                        return { result: "OK", id: id };
                    })
            }, memDbOptions);
        });
    }

    async _newProcessStructByName(name, options) {
        let elem = PROCESS_PROTO_TABLE[name];
        if (!elem)
            throw new Error(`Unknown process struct name: "${name}"`);
        return this.newProcessStruct(elem.structure, options);
    }

    async newProcess(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let processObj = null;
        let pstruct = null;
        let newId;

        return Utils.editDataWrapper(() => {
            let exp = _.cloneDeep(PROCESS_WITH_ELEMS_EXPRESSION);
            exp.expr.model.name = typeof (inpFields.ProcessType) !== "string" ? DFLT_PROCESS_TYPE : inpFields.ProcessType;

            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, exp, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = { State: 1, SupervisorId: opts.user.Id }; // State = Draft

                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        throw new Error(`Missing field "Name"`);

                    if (typeof (inpFields.StructId) === "number") {
                        fields.StructId = inpFields.StructId
                        pstruct = await this.getProcessStruct(inpFields.StructId, opts);
                    }
                    else
                        if (inpFields.Params && inpFields.Params.StructName) {
                            opts.silent = true;
                            opts.byName = true;
                            pstruct = await this.getProcessStruct(inpFields.Params.StructName, opts);
                            if (!pstruct) {
                                try {
                                    await this._newProcessStructByName(inpFields.Params.StructName, opts);
                                }
                                catch (err) {
                                    console.error(buildLogString(`ProcessAPI::_newProcessStructByName: ${err.message}`));
                                }
                                delete opts.silent;
                                pstruct = await this.getProcessStruct(inpFields.Params.StructName, opts);
                            }
                            fields.StructId = pstruct.Id;
                        }
                        else
                            throw new Error(`Missing field "StructId"`);

                    if ((typeof (inpFields.SupervisorId) === "number") && (inpFields.SupervisorId !== opts.user.Id)) {
                        fields.SupervisorId = inpFields.SupervisorId;
                        await this._checkIfPmSupervisor(inpFields.SupervisorId);
                    }

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    newId = newHandler.keyValue;
                    processObj = this._db.getObj(newHandler.newObject);
                    fields.Id = newId;
                    this._setFieldValues(processObj, inpFields, fields);

                    let elements = {};
                    if (pstruct && pstruct.Elements && (pstruct.Elements.length > 0)) {
                        let root_elems = processObj.getDataRoot("PmElemProcess");
                        for (let i = 0; i < pstruct.Elements.length; i++) {
                            let elem = pstruct.Elements[i];
                            let efields = {
                                State: ElemState.NotReady,
                                ProcessId: newId,
                                Index: i + 1,
                                ElemId: elem.Id,
                                SupervisorId: elem.SupervisorId
                            };
                            let { keyValue: elemId } = await root_elems.newObject({
                                fields: efields
                            }, dbOpts);
                            elements[elem.Name] = {
                                Id: elemId,
                                SupervisorId: efields.SupervisorId
                            }
                        }
                    }

                    await root_obj.save(dbOpts);
                    let warning;
                    if (inpFields.Params && inpFields.Params.StructName) {
                        let elem = PROCESS_PROTO_TABLE[inpFields.Params.StructName];
                        if (elem && elem.script)
                            try {
                                await elem.script(this, newId, fields.SupervisorId, elements, inpFields.Params, options);
                            }
                            catch (err) {
                                warning = `При формировании задач процесса произошла ошибка: ${err.message}`;
                                console.error(buildLogString(`ProcessAPI::newProcess: WARNING: ${warning}`));
                            }
                     }

                    if (logModif)
                        console.log(buildLogString(`Process created: Id="${newId}".`));
                    return { result: warning ? "WARNING" : "OK", id: newId, warning: warning };
                })
        }, memDbOptions);
    }

    async getProcessStruct(id_struct, options) {
        let opts = _.cloneDeep(options || {});
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let id = id_struct;
        try {
            if ((opts.byName === "true") || (opts.byName === true)) {
                let records = await $data.execSql({
                    dialect: {
                        mysql: _.template(SQL_GET_PS_ID_BY_NAME_MYSQL)({ name: id.replace(/'/g, "''") }),
                        mssql: _.template(SQL_GET_PS_ID_BY_NAME_MSSQL)({ name: id.replace(/'/g, "''") })
                    }
                }, dbOpts)
                if (records && records.detail && (records.detail.length === 1))
                    id = records.detail[0].Id
                else
                    throw new HttpError(HttpCode.ERR_NOT_FOUND, `Описание структуры процесса (Name ="${id}") не найдено.`);
            }
            opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);
            let key = `${STRUCT_KEY_PREFIX}${id}`;

            let result = null;
            let redis_ts = await this.cacheHget(key, "ts", { json: true });
            if (redis_ts) {
                if ((!this._struct_cache) || (this._struct_cache.ts !== redis_ts)) {
                    let val = await this.cacheHgetAll(key, { json: true });
                    if (val && val.ts && val.data) {
                        this._struct_cache = val;
                        result = val.data;
                    }
                }
                else
                    result = this._struct_cache.data ? this._struct_cache.data : null;
            }
            if (!result) {
                this._struct_cache = null;
                let root_obj = await this._getObjById(id, PROCESS_STRUCT_EXPRESSION, dbOpts);
                try {
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Описание структуры процесса (Id =${id}) не найдено.`);

                    let pstruct_obj = collection.get(0);
                    result = {
                        Id: pstruct_obj.id(),
                        Name: pstruct_obj.name(),
                        Script: pstruct_obj.script() ? pstruct_obj.script() : null,
                        ProcessFields: pstruct_obj.processFields() ? JSON.parse(pstruct_obj.processFields()) : null,
                        Elements: []
                    }

                    let root_elems = pstruct_obj.getDataRoot("PmElement");
                    let col_elems = root_elems.getCol("DataElements");
                    for (let i = 0; i < col_elems.count(); i++) {
                        let elem = col_elems.get(i);
                        result.Elements.push({
                            Id: elem.id(),
                            Name: elem.name(),
                            SupervisorId: elem.supervisorId(),
                            Index: elem.index(),
                            WriteFields: elem.writeFields() ? JSON.parse(elem.writeFields()) : null,
                            ViewFields: elem.viewFields() ? JSON.parse(elem.viewFields()) : null
                        });
                    }
                    result.Elements.sort((a, b) => a.Index - b.Index);
                    result.Elements.forEach(elem => delete elem.Index);

                    await this.cacheHset(key, "data", result, { json: true });
                    let ts = 't' + ((new Date()) - 0);
                    await this.cacheHset(key, "ts", ts, { json: true });
                    await this.cacheExpire(key, STRUCT_TTL_SEC);
                    this._struct_cache = { ts: ts, data: result };
                }
                finally {
                    if (root_obj)
                        this._db._deleteRoot(root_obj.getRoot());
                }
            }
            return result;
        }
        catch (err) {
            if ((opts.silent === true) && (err instanceof HttpError)
                && (err.statusCode === HttpCode.ERR_NOT_FOUND)) {
                return null;
            }
            else
                throw err;
        }
    }

    async newProcessStruct(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let pstructObj = null;
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, PROCESS_STRUCT_EXPRESSION, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = {};

                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        throw new Error(`Missing field "Name"`);

                    if (typeof (inpFields.ProcessFields) !== "undefined") {
                        fields.ProcessFields = JSON.stringify(inpFields.ProcessFields);
                    }
                    else
                        throw new Error(`Missing field "ProcessFields"`);

                    if (typeof (inpFields.Script) !== "undefined")
                        fields.Script = inpFields.Script;

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    newId = newHandler.keyValue;
                    pstructObj = this._db.getObj(newHandler.newObject);

                    if ((typeof (inpFields.Elements) !== "undefined") && Array.isArray(inpFields.Elements)) {
                        let root_elems = pstructObj.getDataRoot("PmElement");
                        for (let i = 0; i < inpFields.Elements.length; i++){
                            let elem = inpFields.Elements[i];
                            let efields = { Index: i + 1 };
                            if (typeof (elem.Name) !== "undefined")
                                efields.Name = elem.Name
                            else
                                throw new Error(`Missing field "Name" in element #${i} description.`);
                            if (typeof (elem.ViewFields) !== "undefined") {
                                efields.ViewFields = JSON.stringify(elem.ViewFields);
                            }
                            else
                                throw new Error(`Missing field "ViewFields" in element #${i} description.`);
                            if (typeof (elem.WriteFields) !== "undefined") {
                                efields.WriteFields = JSON.stringify(elem.WriteFields);
                            }
                            if (typeof (elem.SupervisorId) !== "undefined")
                                efields.SupervisorId = elem.SupervisorId

                            await root_elems.newObject({
                                fields: efields
                            }, dbOpts);
                        }
                    }

                    await root_obj.save(dbOpts);
                    if (logModif)
                        console.log(buildLogString(`Process struct created: Id="${newId}".`));
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);
    }

    async delProcessStruct(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        return new Promise(resolve => {
            let root_obj;
            let pstruct_obj = null;
            let collection = null;
            let transactionId = null;
    
            let promise = this._getObjById(id, PROCESS_STRUCT_EXPRESSION, dbOpts)
                .then(async (result) => {
                    root_obj = result;
                    collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Описание структуры процесса (Id =${id}) не найдено.`);
                    pstruct_obj = collection.get(0);
                    await root_obj.edit();

                    let tran = await $data.tranStart(dbOpts);
                    transactionId = tran.transactionId;
                    dbOpts.transactionId = tran.transactionId;

                    let root_elems = pstruct_obj.getDataRoot("PmElement");
                    let col_elems = root_elems.getCol("DataElements");
                    while (col_elems.count() > 0)
                        col_elems._del(col_elems.get(0));
                    await root_obj.save(dbOpts);

                    await root_obj.edit();
                    collection._del(pstruct_obj);
                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Process struct deleted: Id="${id}".`));
                    return { result: "OK", id: id };
                })
                .finally((isErr, res) => {
                    let result = transactionId ?
                        (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                    if (root_obj)
                        this._db._deleteRoot(root_obj.getRoot());
                    if (isErr) {
                        result = result.then(() => {
                            throw res;
                        });
                    }
                    else
                        result = result.then(() => { return res; })
                    return result;
                });
            resolve(promise);
        })
    }

}

let processAPI = null;
exports.ProcessService = () => {
    return processAPI ? processAPI : processAPI = new ProcessAPI();
}
