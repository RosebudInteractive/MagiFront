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
const { ProcessState, TaskState, ElemState, TaskStateStr, ProcessStateStr, NotificationType } = require('./const');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const DataObject = require(UCCELLO_CONFIG.uccelloPath + 'dataman/data-object');

const logModif = config.has("debug.pm.logModif") ? config.get("debug.pm.logModif") : false;

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

const DEPS_ONLY_EXPRESSION = {
    expr: {
        model: {
            name: "PmDepTask"
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

const PROC_ELEM_STRUCT_EXPRESSION = {
    expr: {
        model: {
            name: "PmElement"
        }
    }
};

const SQL_PROCESS_LESSON_MSSQL = "select [Name] from [LessonLng] where [LessonId] = <%= id %>";
const SQL_PROCESS_LESSON_MYSQL = "select `Name` from `LessonLng` where `LessonId` = <%= id %>";

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
    "  [IsElemReady], [WriteFieldSet], [IsFinal], [IsAutomatic], [IsActive]\n" +
    "from [PmTask]\n" +
    "where [ProcessId] = <%= id %>";

const SQL_PROCESS_TASKS_MYSQL =
    "select `Id`, `Name`, `State`, `DueDate`, `ExecutorId`, `Description`, `AlertId`, `ElementId`,\n" +
    "  `IsElemReady`, `WriteFieldSet`, `IsFinal`, `IsAutomatic`, `IsActive`\n" +
    "from `PmTask`\n" +
    "where `ProcessId` = <%= id %>";

const SQL_PROCESS_TASKS_PUB_MSSQL =
    "select t.[Id], t.[Name], t.[State], t.[DueDate], t.[ExecutorId], t.[Description], t.[AlertId], t.[ElementId], \n" +
    "  t.[IsElemReady], t.[WriteFieldSet], u.[DisplayName], t.[IsFinal], t.[IsAutomatic], t.[IsActive]\n" +
    "from [PmTask] t\n" +
    "  left join [User] u on u.[SysParentId] = t.[ExecutorId]\n" +
    "where[ProcessId] = <%= id %>";

const SQL_PROCESS_TASKS_PUB_MYSQL =
    "select t.`Id`, t.`Name`, t.`State`, t.`DueDate`, t.`ExecutorId`, t.`Description`, t.`AlertId`, t.`ElementId`, \n" +
    "  t.`IsElemReady`, t.`WriteFieldSet`, u.`DisplayName`, t.`IsFinal`, t.`IsAutomatic`, t.`IsActive`\n" +
    "from `PmTask` t\n" +
    "  left join `User` u on u.`SysParentId` = t.`ExecutorId`\n" +
    "where`ProcessId` = <%= id %>";

const SQL_PROCESS_DEPS_MSSQL =
    "select d.[Id], d.[DepTaskId], d.[TaskId], d.[IsConditional], d.[IsDefault], d.[IsActive], d.[Result], d.[Expression] from [PmDepTask] d\n" +
    "  join [PmTask] t on d.[TaskId] = t.[Id]\n" +
    "where t.[ProcessId] = <%= id %>";

const SQL_PROCESS_DEPS_MYSQL =
    "select d.`Id`, d.`DepTaskId`, d.`TaskId`, d.`IsConditional`, d.`IsDefault`, d.`IsActive`, d.`Result`, d.`Expression` from `PmDepTask` d\n" +
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

const SQL_PSTRUCT_BY_ELEM_MSSQL = "select [StructId] from [PmElement] where [Id]=<%= id %>";
const SQL_PSTRUCT_BY_ELEM_MYSQL = "select `StructId` from `PmElement` where `Id`=<%= id %>";

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
    "  p.[SupervisorId] as [ProcessSupervisorId], t.[GuidVer], t.[IsFinal], t.[IsAutomatic], t.[IsActive],\n" +
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
    "  p.`SupervisorId` as `ProcessSupervisorId`, t.`GuidVer`, t.`IsFinal`, t.`IsAutomatic`, t.`IsActive`,\n" +
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
    "select l.[Id], l.[TimeMdf] as [TimeCr], l.[Text], l.[UserId], u.[DisplayName]\n" +
    "from [PmTask] t\n" +
    "  join [PmTaskLog] l on l.[TaskId] = t.[Id]\n" +
    "  join [User] u on u.[SysParentId] = l.[UserId]\n" +
    "where t.[Id] = <%= id %>\n" +
    "order by l.[TimeCr]";

const SQL_GET_TASK_LOG_MYSQL =
    "select l.`Id`, l.`TimeMdf` as `TimeCr`, l.`Text`, l.`UserId`, u.`DisplayName`\n" +
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
    "  left join [User] u on u.[SysParentId] = e.[SupervisorId]";

const SQL_GET_ALL_PSELEMS_MYSQL =
    "select e.`Id`, e.`Name`, e.`WriteFields`, e.`ViewFields`, e.`SupervisorId`, u.`DisplayName`, s.`Name` SName, e.`StructId`\n" +
    "from `PmProcessStruct` s\n" +
    "  join `PmElement` e on e.`StructId` = s.`Id`\n" +
    "  left join `User` u on u.`SysParentId` = e.`SupervisorId`";

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

const SQL_DEL_PROCESS_MSSQL_SCRIPT = [
    "delete [PmTaskLog] where [TaskId] in (select Id from [PmTask] where [ProcessId] = <%= id %>)",
    "delete [PmDepTask] where [TaskId] in (select Id from [PmTask] where [ProcessId] = <%= id %>)",
    "delete [PmTask] where [ProcessId] = <%= id %>",
    "delete [PmElemProcess] where [ProcessId] = <%= id %>",
    "delete [PmProcess] where [Id] = <%= id %>"
];

const SQL_DEL_PROCESS_MYSQL_SCRIPT = [
    "delete from `PmTaskLog` where `TaskId` in (select Id from `PmTask` where `ProcessId` = <%= id %>) and (`Id`> 0)",
    "delete from `PmDepTask` where `TaskId` in (select Id from `PmTask` where `ProcessId` = <%= id %>) and (`Id`> 0)",
    "delete from `PmTask` where `ProcessId` = <%= id %> and (`Id`> 0)",
    "delete from `PmElemProcess` where `ProcessId` = <%= id %> and (`Id`> 0)",
    "delete from `PmProcess` where `Id` = <%= id %>"
];

const DFLT_TASK_SORT_ORDER = "TimeCr,desc";
const DFLT_PROCESS_SORT_ORDER = "TimeCr,desc";

const DFLT_LOCK_TIMEOUT_SEC = 180;
const DFLT_WAIT_LOCK_TIMEOUT_SEC = 60;

const LOCK_KEY_PREFIX = "_process_edt:";
const STRUCT_KEY_PREFIX = "_pstruct:";
const STRUCT_TTL_SEC = 1 * 60 * 60; // 1 hour

const PROCESS_PROTO_TABLE = {
    "Lesson Process Proto": require('./process-types/lesson')
};

const TASK_START_NOTIF = "Приступить к #<%= id %>:\"<%= lesson %>\":\"<%= name %>\".";
const TASK_ALERT_NOTIF = "Вопрос по #<%= id %>:\"<%= lesson %>\":\"<%= name %>\".";
const TASK_CONTINUE_NOTIF = "Продолжить #<%= id %>:\"<%= lesson %>\":\"<%= name %>\".";
const URGENT_INTERVAL_MS = 1000 * 3600 * 48; // 48 hours

const ProcessAPI = class ProcessAPI extends DbObject {

    constructor(options) {
        super(options);
        this._struct_cache = {};
        this._var_def_cache = {};
        this._stdFunctions = {
            isEmpty: this._isEmpty.bind(this),
            isNotEmpty: this._isNotEmpty.bind(this)
        }
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
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND ")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND ")}`;
        }

        opts.order = opts.order ? opts.order : DFLT_PROCESS_SORT_ORDER;
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
        let isAdmin = opts.user.PData.isAdmin || (AccessRights.checkPermissions(opts.user, AccessFlags.PmAdmin) !== 0);
        let isSupervisor = AccessRights.checkPermissions(opts.user, AccessFlags.PmSupervisor) !== 0;
        let isElemElemManager = AccessRights.checkPermissions(opts.user, AccessFlags.PmElemManager) !== 0;

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_TASK_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_TASK_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length === 1)) {
            let user_id = opts.user.Id;
            let elem = records.detail[0];
            result = {
                Id: elem.Id,
                GuidVer: elem.GuidVer,
                Name: elem.Name,
                TimeCr: elem.TimeCr,
                State: elem.State,
                DueDate: elem.DueDate,
                Description: elem.Description,
                IsFinal: elem.IsFinal ? true : false,
                IsAutomatic: elem.IsAutomatic ? true : false,
                IsActive: elem.IsActive ? true : false,
                AlertId: elem.AlertId,
                IsElemReady: elem.IsElemReady ? true : false,
                WriteFieldSet: elem.WriteFieldSet,
                Process: {
                    Id: elem.ProcessId,
                    Name: elem.ProcessName
                },
                Log: []
            };

            if (!isAdmin)
                if (!(isSupervisor && (user_id === elem.ProcessSupervisorId)))
                    if (!((isSupervisor || isElemElemManager) && (user_id === elem.SupervisorId)))
                        if (!(user_id === elem.ExecutorId))
                            throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет прав доступа для получения данных.`);

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
                    mssql_conds.push(`(t.[IsActive] = 1)`);
                    mysql_conds.push(`(t.${'`'}IsActive${'`'} = 1)`);
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
        if (opts.element) {
            mssql_conds.push(`(t.[ElementId] = ${opts.element})`);
            mysql_conds.push(`(t.${'`'}ElementId${'`'} = ${opts.element})`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND ")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND ")}`;
        }

        opts.order = opts.order ? opts.order : DFLT_TASK_SORT_ORDER;
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
                    mssql_field = "p.[Name]";
                    mysql_field = "p.`Name`";
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
                case "ElementName":
                    mssql_field = "el.[Name]";
                    mysql_field = "el.`Name`";
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

    async getProcessStructElems(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let sql_mysql = SQL_GET_ALL_PSELEMS_MYSQL;
        let sql_mssql = SQL_GET_ALL_PSELEMS_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        if ((typeof (opts.id) === "number") && (!isNaN(opts.id))) {
            mssql_conds.push(`(s.[Id] = ${opts.id})`);
            mysql_conds.push(`(s.${'`'}Id${'`'} = ${opts.id})`);
        }

        if (opts.name) {
            mssql_conds.push(`(e.[Name] like N'%${opts.name}%')`);
            mysql_conds.push(`(e.${'`'}Name${'`'} like '%${opts.name}%')`);
        }

        if (opts.struct) {
            mssql_conds.push(`(s.[Name] like N'%${opts.struct}%')`);
            mysql_conds.push(`(s.${'`'}Name${'`'} like '%${opts.struct}%')`);
        }

        if (opts.supervisor) {
            mssql_conds.push(`(u.[DisplayName] like N'%${opts.supervisor}%')`);
            mysql_conds.push(`(u.${'`'}DisplayName${'`'} like '%${opts.supervisor}%')`);
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
                    mssql_field = "e.[Id]";
                    mysql_field = "e.`Id`";
                    break;
                case "Name":
                    mssql_field = "e.[Name]";
                    mysql_field = "e.`Name`";
                    break;
                case "StructName":
                    mssql_field = "s.[Name]";
                    mysql_field = "s.`Name`";
                    break;
                case "SupervisorName":
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
        }, dbOpts);
        if (records && records.detail && (records.detail.length > 0)) {
            records.detail.forEach(elem => {
                result.push({
                    Id: elem.Id,
                    Name: elem.Name,
                    Struct: {
                        Id: elem.StructId,
                        Name: elem.SName
                    },
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
        let isAdmin = opts.user.PData.isAdmin || (AccessRights.checkPermissions(opts.user, AccessFlags.PmAdmin) !== 0);
        let isSupervisor = AccessRights.checkPermissions(opts.user, AccessFlags.PmSupervisor) !== 0;
        let user_id = opts.user.Id;

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = await this._getObjById(id, { expr: { model: { name: "PmProcess" } } }, dbOpts);
        try {
            let collection = root_obj.getCol("DataElements");
            if (collection.count() != 1)
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${id}) не найден.`);

            let process_obj = collection.get(0);
            await this._getFieldValues(process_obj, result, ["GuidVer", "SysTypeId", "SupervisorId"]);

            if (!isAdmin)
                if (!(isSupervisor && (user_id === process_obj.supervisorId())))
                    throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет прав доступа для получения данных.`);

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
                    val.IsFinal = val.IsFinal ? true : false;
                    val.IsAutomatic = val.IsAutomatic ? true : false;
                    val.IsActive = val.IsActive ? true : false;
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
                    let val = _.clone(elem);
                    val.IsConditional = val.IsConditional ? true : false;
                    val.IsDefault = val.IsDefault ? true : false;
                    val.IsActive = val.IsActive ? true : false;
                    val.Result = val.Result === null ? null : (val.Result ? true : false);
                    result.Deps.push(val);
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

            if (result.LessonId) {
                let records = await $data.execSql({
                    dialect: {
                        mysql: _.template(SQL_PROCESS_LESSON_MYSQL)({ id: result.LessonId }),
                        mssql: _.template(SQL_PROCESS_LESSON_MSSQL)({ id: result.LessonId })
                    }
                }, dbOpts)
                if (records && records.detail && (records.detail.length === 1)) {
                    result.Lesson = { Id: result.LessonId, Name: records.detail[0].Name };
                }
            }

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
                    val.IsFinal = val.IsFinal ? true : false;
                    val.IsAutomatic = val.IsAutomatic ? true : false;
                    val.IsActive = val.IsActive ? true : false;
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
                    let val = _.clone(elem);
                    val.IsConditional = val.IsConditional ? true : false;
                    val.IsDefault = val.IsDefault ? true : false;
                    val.Result = val.Result === null ? null : (val.Result ? true : false);
                    val.IsActive = val.IsActive ? true : false;
                    result.Deps.push(val);
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
                process.Elements[i]._idx = i;
                process._elements[process.Elements[i].Id] = process.Elements[i];
            }
        }
        return process._elements;
    }

    _get_proc_tasks(process, rebuild) {
        if ((!process._tasks) || rebuild) {
            process._tasks = {};
            for (let i = 0; process.Tasks && (i < process.Tasks.length); i++) {
                process.Tasks[i]._idx = i;
                process._tasks[process.Tasks[i].Id] = process.Tasks[i];
            }
        }
        return process._tasks;
    }

    _get_proc_deps(process, rebuild) {
        if ((!process._childs) || (!process._parents) || rebuild) {
            process._childs = {};
            process._parents = {};
            process._deps = {};
            for (let i = 0; process.Deps && (i < process.Deps.length); i++) {
                let link = process.Deps[i];
                link._idx = i;
                process._deps[link.Id] = link;
                let parent = link.DepTaskId;
                let child = link.TaskId;
                let parents = process._parents[child];
                let childs = process._childs[parent];
                if (!parents)
                    parents = process._parents[child] = {};
                if (!childs)
                    childs = process._childs[parent] = {};
                parents[parent] = link;
                childs[child] = link;
            }
        }
    }

    _getIncomingDeps(process, task_id, rebuild) {
        this._get_proc_deps(process, rebuild);
        return process._parents[task_id];
    }

    _getOutgoingDeps(process, task_id, rebuild) {
        this._get_proc_deps(process, rebuild);
        return process._childs[task_id];
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

    async _getProcStructByObjId(id, obj_name, dbOpts) {
        let request;
        let err_msg;
        switch (obj_name) {
            case "elem":
                request = {
                    dialect: {
                        mysql: _.template(SQL_PSTRUCT_BY_ELEM_MYSQL)({ id: id }),
                        mssql: _.template(SQL_PSTRUCT_BY_ELEM_MSSQL)({ id: id })
                    }
                };
                err_msg = `Элемент (Id =${id}) не найден.`;
                break;
            default:
                throw new Error(`Unknown object type: "${obj_name}"`);
        };
        let records = await $data.execSql(request, dbOpts);
        if (records && records.detail && (records.detail.length === 1)) {
            return records.detail[0].StructId;
        }
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, err_msg);
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

    async setElemStruct(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        
        let pstruct_id = await this._getProcStructByObjId(id, "elem", dbOpts);
        return Utils.editDataWrapper(() => {

            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, PROC_ELEM_STRUCT_EXPRESSION, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Элемент (Id =${id}) не найден.`);
                    let procElemObj = collection.get(0);

                    await procElemObj.edit();
                    if (typeof (inpFields.SupervisorId) === "number") {
                        procElemObj.supervisorId(inpFields.SupervisorId);
                        if (inpFields.SupervisorId !== opts.user.Id)
                            await this._checkIfPmElemManager(inpFields.SupervisorId);
                    }

                    let res = await procElemObj.save();
                    if (res && res.detail && (res.detail.length > 0))
                        await this.cacheDel(`${STRUCT_KEY_PREFIX}${pstruct_id}`);

                    if (logModif)
                        console.log(buildLogString(`Element updated: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);
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

    _deleteTask(process, id) {
        let task = this._getProcessTask(process, id);
        if (task) {
            this._get_proc_deps(process);
            let childs = process._childs[id];
            for (let child in childs)
                this._deleteDep(process, childs[child].Id);
            let parents = process._parents[id];
            for (let parent in parents)
                this._deleteDep(process, parents[parent].Id);
            let idx = task._idx;
            process.Tasks.splice(idx, 1);
            for (let i = idx; i < process.Tasks.length; i++)
                process.Tasks[i]._idx--;
        }
    }

    _deleteDep(process, id) {
        this._get_proc_deps(process);
        let dep = process._deps[id];
        if (dep) {
            let idx = dep._idx;
            process.Deps.splice(idx, 1);
            for (let i = idx; i < process.Deps.length; i++)
                process.Deps[i]._idx--;
            let parent = process._parents[dep.TaskId];
            if (parent)
                delete parent[dep.DepTaskId];
            let child = process._childs[dep.DepTaskId];
            if (child)
                delete child[dep.TaskId];
        }
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
                                `Невозможно удалить зависимость для задачи в состоянии "${TaskStateStr[taskObj.state()]}".`);

                        let process = await this._get_process(taskObj.processId(), opts);
                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить зависимость из завершившегося процесса".`);

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
                            }
                        }

                        if (!dep_to_del)
                            throw new HttpError(HttpCode.ERR_BAD_REQ,
                                `Задача "${id}" не зависит от задачи "${parent_id}".`);

                        let dep_id = dep_to_del.id();
                        collection._del(dep_to_del);
                        this._deleteDep(process, dep_id);

                        let notifications = [];
                        let mdf_objs = [];
                        let obj_ids =this._calcTaskState(process, this._getProcessTask(process, taskObj.id()));

                        if (obj_ids.length > 0) {
                            for (let i = 0; i < obj_ids.length; i++) {
                                let expr;
                                let err_msg;
                                let is_task = false;

                                switch (obj_ids[i].type) {
                                    case "link":
                                        expr = DEPS_ONLY_EXPRESSION;
                                        err_msg = `Переход (Id =${obj_ids[i].id}) не найден.`;
                                        break;

                                    case "task":
                                        is_task = true;
                                        expr = TASK_ONLY_EXPRESSION;
                                        err_msg = `Дочерняя задача (Id =${obj_ids[i].id}) не найдена.`;
                                        break;

                                    default:
                                        throw new Error(`ProcessAPI::updateTask: Unknown modified object type: "${obj_ids[i].type}".`);
                                }

                                let obj = taskObj;
                                let keep_in_mdf = false;
                                if (!(is_task && (taskObj.id() === obj_ids[i].id))) {
                                    root_obj = await this._getObjById(obj_ids[i].id, expr, dbOpts);
                                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                    collection = root_obj.getCol("DataElements");
                                    if (collection.count() != 1)
                                        throw new HttpError(HttpCode.ERR_NOT_FOUND, err_msg);
                                    obj = collection.get(0);
                                    await obj.edit();
                                    keep_in_mdf = true;
                                }

                                if (obj_ids[i].fields) {
                                    for (let fld in obj_ids[i].fields) {
                                        obj[fld](obj_ids[i].fields[fld]);
                                    }
                                    if (keep_in_mdf)
                                        mdf_objs.push(obj);
                                }

                                if (is_task && (obj_ids[i].fields.state === TaskState.ReadyToStart)) {
                                    let elem_supervisor_id = this._getElemSupervisorByTaskId(obj.id(), process);
                                    let user_id = obj.executorId() ? obj.executorId() :
                                        (elem_supervisor_id ? elem_supervisor_id : process.SupervisorId);
                                    notifications.push({
                                        UserId: user_id,
                                        NotifType: NotificationType.TaskCanStart,
                                        Data: { taskId: obj.id() },
                                        IsUrgent: obj.dueDate() && ((obj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                        URL: `${this._absPmTaskUrl}${obj.id()}`,
                                        Subject: _.template(TASK_START_NOTIF)({
                                            id: obj.id(),
                                            lesson: process.Lesson.Name,
                                            name: obj.name()
                                        })
                                    })
                                }
                            }
                        }

                        if ((notifications.length > 0) || (mdf_objs.length > 0)) {
                            let tran = await $data.tranStart(dbOpts);
                            let transactionId = tran.transactionId;
                            dbOpts.transactionId = tran.transactionId;
                            try {
                                for (let i = 0; i < mdf_objs.length; i++)
                                    await mdf_objs[i].save(dbOpts);
                                if (notifications.length > 0)
                                    await this.sendNotifications(notifications, { user: opts.user, dbOptions: dbOpts });
                                await taskObj.save(dbOpts);
                                await $data.tranCommit(transactionId)
                            }
                            catch (err) {
                                await $data.tranRollback(transactionId);
                                throw err;
                            }
                        }
                        else
                            await taskObj.save(dbOpts);

                        if (logModif)
                            console.log(buildLogString(`Dependency deleted: Id="${dep_id}".`));
                        return { result: "OK", id: dep_id };
                    })
            }, memDbOptions);
        });
    }

    _isEmpty(arg) {
        let result = arg ? false : true;
        switch (typeof (arg)) {
            case "number":
                result = isNaN(arg) ? true : false;
                break;
        }
        return result;
    }

    _isNotEmpty(arg) {
        return !this._isEmpty(arg);
    }

    _getVarDefinition(pstruct) {
        let result = pstruct && this._var_def_cache[pstruct.Id] ? this._var_def_cache[pstruct.Id] : "";
        if (!result) {
            let is_first = true;
            for (let key in this._stdFunctions) {
                result += `${is_first ? '' : '\n'}var ${key} = this.${key};`;
                is_first = false;
            }
            if (pstruct.ProcessFields)
                for (let key in pstruct.ProcessFields) {
                    result += `${is_first ? '' : '\n'}var ${key} = this.${key};`;
                    is_first = false;
                }
            if (result)
                this._var_def_cache[pstruct.Id] = result;
        }
        return result;
    }

    _crateCondContext(process, pstruct) {
        let context = _.clone(this._stdFunctions);
        if (process && pstruct.ProcessFields) {
            let is_db_object = process instanceof DataObject;
            for (let key in pstruct.ProcessFields) {
                let val = is_db_object ? process[this._genGetterName(key)]() : process[key];
                context[key] = val;
            }
        }
        return context;
    }

    _checkConditions(process, pstruct, conds, set_result, process_obj) {
        let context;
        let vars;
        let calc_exp = (exp) => {
            context = context ? context : this._crateCondContext(process_obj ? process_obj : process, pstruct);
            vars = vars ? vars : this._getVarDefinition(pstruct);
            let fun;
            try {
                fun = new Function(`${vars}\nvar __res = ${exp};\nreturn __res ? true : false;`);
            }
            catch (err) {
                throw new HttpError(HttpCode.ERR_BAD_REQ,
                    `Ошибка в выражении: "${err.message}".`);
            }
            try {
                return fun.apply(context);
            }
            catch (err) {
                throw new HttpError(HttpCode.ERR_BAD_REQ,
                    `Ошибка вычисления выражения: "${err.message}".`);
            }
        }
        let calc_link = (link) => {
            let res = { default_link: null, result: null };
            let is_cond = link instanceof DataObject ? link.isConditional() : link.IsConditional;
            if (is_cond) {
                let is_default = link instanceof DataObject ? link.isDefault() : link.IsDefault;
                if (!is_default) {
                    let exp = link instanceof DataObject ? link.expression() : link.Expression;
                    if (!exp)
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Выражение не задано.`);
                    res.result = calc_exp(exp);
                    if (set_result) {
                        this._get_proc_deps(process);
                        let link_id;
                        if (link instanceof DataObject) {
                            link.result(res.result);
                            link_id = link.id();
                        }
                        else {
                            link.Result = res.result;
                            link_id = link.Id;
                        }
                        let proc_link = process._deps[link_id];
                        if (proc_link)
                            proc_link.Result = res.result;
                    }
                }
                else
                    res.default_link = link;
            }
            return res;
        }
        if (process && pstruct) {
            let default_links = [];
            let all_res = false;
            let process_link = (link) => {
                let { default_link, result } = calc_link(link);
                if (default_link)
                    default_links.push(default_link);
                all_res = result || all_res;
            }
            if (Array.isArray(conds)) {
                for (let i = 0; i < conds.length; i++)
                    process_link(conds[i]);
            }
            else {
                for (let i = 0; i < conds.count(); i++)
                    process_link(conds.get(i));
            }
            if (set_result) {
                this._get_proc_deps(process);
                for (let i = 0; i < default_links.length; i++){
                    let link = default_links[i];
                    let link_id;
                    if (link instanceof DataObject) {
                        link.result(all_res)
                        link_id = link.id();
                   }
                    else {
                        link.Result = all_res;
                        link_id = link.Id;
                    }
                    let proc_link = process._deps[link_id];
                    if (proc_link)
                        proc_link.Result = res.result;
                }
            }
        }
    }

    async addOrUpdateTaskDep(is_new, data, options) {
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
                                `Невозможно добавить/изменить зависимость для задачи в состоянии "${TaskStateStr[taskObj.state()]}".`);

                        let process = await this._get_process(taskObj.processId(), opts);
                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно добавить/изменить зависимость в завершившемся процессе".`);

                        let parent_task = this._getProcessTask(process, parent_id);
                        if(!parent_task)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Родительская задача "${parent_id}" не существует.`);

                        if (parent_task.IsFinal)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно добавить зависимость к конечной задаче.`);

                        if (parent_task.State === TaskState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно добавить/изменить переход из завершенной задачи.`);

                        if (!(parent_task.IsActive && taskObj.isActive()))
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Одна из задач неактивна.`);

                        let pstruct = await this.getProcessStruct(process.StructId, opts);
                        this._checkConditions(process, pstruct, [inpFields], false);

                        let root_dep = taskObj.getDataRoot("PmDepTask");
                        collection = root_dep.getCol("DataElements");
                        let curr_dep = null;
                        for (let i = 0; i < collection.count(); i++){
                            let dep = collection.get(i);
                            if (dep.depTaskId() === parent_id)
                                curr_dep = dep;
                        }

                        let newHandler;
                        await taskObj.edit();

                        let is_conditional = typeof (inpFields.IsConditional) === "boolean" ? inpFields.IsConditional : false;
                        let is_default = typeof (inpFields.IsDefault) === "boolean" ? inpFields.IsDefault : false;

                        if (is_new) {
                            if (curr_dep)
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Зависимость задачи "${id}" от "${parent_id}" уже существует.`);
                            process.Deps.push({ TaskId: id, DepTaskId: parent_id });
                            this._checkForCyclicDeps(process, true);
                            newHandler = await root_dep.newObject({
                                fields: {
                                    DepTaskId: parent_id,
                                    IsConditional: is_conditional,
                                    IsDefault: is_default,
                                    Expression: inpFields.Expression,
                                    IsActive: true
                                }
                            }, dbOpts);
                        }
                        else {
                            if (!curr_dep)
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Зависимость задачи "${id}" от "${parent_id}" не найдена.`);
                            curr_dep.isConditional(is_conditional);
                            curr_dep.isDefault(is_default);
                            curr_dep.expression(inpFields.Expression ? inpFields.Expression : null);
                        }

                        if ((taskObj.state() === TaskState.ReadyToStart) && (parent_task.State !== TaskState.Finished)) {
                            taskObj.state(TaskState.Draft);
                        }
                        await taskObj.save(dbOpts);

                        if (logModif)
                            console.log(buildLogString(
                                `Dependency ${is_new ? 'created' : 'updated'}: Id="${is_new ? newHandler.keyValue : curr_dep.id()}".`));
                        return { result: "OK", id: is_new ? newHandler.keyValue : curr_dep.id() };
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

                        let process = await this._get_process(taskObj.processId(), opts);
                        if (!process)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Процесс (Id =${taskObj.processId()}) не найден.`);
                        if (process.State === ProcessState.Finished)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить задачу из завершившегося процесса.`);

                        let notifications = [];
                        let mdf_objs = [];
                        if (process.State === ProcessState.Executing) {
                            let obj_ids = this._getTaskListToStartAfterDel(process, id);
                            if (obj_ids.length > 0) {
                                for (let i = 0; i < obj_ids.length; i++) {
                                    let expr;
                                    let err_msg;
                                    let is_task = false;

                                    switch (obj_ids[i].type) {
                                        case "link":
                                            expr = DEPS_ONLY_EXPRESSION;
                                            err_msg = `Переход (Id =${obj_ids[i].id}) не найден.`;
                                            break;

                                        case "task":
                                            is_task = true;
                                            expr = TASK_ONLY_EXPRESSION;
                                            err_msg = `Дочерняя задача (Id =${obj_ids[i].id}) не найдена.`;
                                            break;

                                        default:
                                            throw new Error(`ProcessAPI::updateTask: Unknown modified object type: "${obj_ids[i].type}".`);
                                    }

                                    let root = await this._getObjById(obj_ids[i].id, expr, dbOpts);
                                    memDbOptions.dbRoots.push(root); // Remember DbRoot to delete it finally in editDataWrapper
                                    let col = root.getCol("DataElements");
                                    if (col.count() != 1)
                                        throw new HttpError(HttpCode.ERR_NOT_FOUND, err_msg);
                                    let obj = col.get(0);
                                    await obj.edit();

                                    if (obj_ids[i].fields) {
                                        for (let fld in obj_ids[i].fields) {
                                            obj[fld](obj_ids[i].fields[fld]);
                                        }
                                        mdf_objs.push(obj);
                                    }

                                    if (is_task && (obj_ids[i].fields.state === TaskState.ReadyToStart)) {
                                        let elem_supervisor_id = this._getElemSupervisorByTaskId(obj.id(), process);
                                        let user_id = obj.executorId() ? obj.executorId() :
                                            (elem_supervisor_id ? elem_supervisor_id : process.SupervisorId);
                                        notifications.push({
                                            UserId: user_id,
                                            NotifType: NotificationType.TaskCanStart,
                                            Data: { taskId: obj.id() },
                                            IsUrgent: obj.dueDate() && ((obj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                            URL: `${this._absPmTaskUrl}${obj.id()}`,
                                            Subject: _.template(TASK_START_NOTIF)({
                                                id: obj.id(),
                                                lesson: process.Lesson.Name,
                                                name: obj.name()
                                            })
                                        })
                                    }
                                }
                            }
                        }

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
                            for (let i = 0; i < mdf_objs.length; i++)
                                await mdf_objs[i].save(dbOpts);
                            if (notifications.length > 0)
                                await this.sendNotifications(notifications, { user: opts.user, dbOptions: dbOpts });
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

    _getTaskListToStartAfterDel(process, id) {
        let result = [];
        this._get_proc_deps(process);
        let childs = process._childs[id];
        if (childs) {
            for (let child in childs) {
                let link = childs[child];
                this._deleteDep(process, link.Id);
                let task = this._getProcessTask(process, child);
                this._calcTaskState(process, task, result);
            }
        }
        return result;
    }

    _calcTaskState(process, task, ext_res) {
        let result = ext_res || [];
        this._get_proc_deps(process);
        let dict = {};
        let calcState = (task) => {
            let parents = process._parents[task.Id];
            let has_no_parents = (!parents) || (parents && (Object.keys(parents).length === 0));
            let is_active = true;
            let is_all_inactive = !has_no_parents;
            let is_ready = has_no_parents ? true : null;
            if (!has_no_parents) {
                for (let parent in parents) {
                    let plink = parents[parent];
                    if (plink.IsActive) {
                        is_all_inactive = false;
                        let is_fired = false;
                        if (plink.IsConditional) {
                            is_fired = plink.Result === true;
                            if (plink.Result === false)
                                is_active = false;
                        }
                        else {
                            let ptask = this._getProcessTask(process, parent);
                            is_fired = ptask.State === TaskState.Finished;
                        }
                        if (is_ready === null)
                            is_ready = true;
                        is_ready = is_ready && is_fired;
                    }
                }
            }
            is_active = is_active && (!is_all_inactive);
            let need_calc_childs = false;
            let old_is_active = task.IsActive;
            if (task.IsActive !== is_active) {
                task.IsActive = true;
                need_calc_childs = true;
                this._setObjFieldValueInQueue(result, dict, "task", task.Id, "isActive", is_active);
            }
            if (is_active && is_ready && (task.State === TaskState.Draft)) {
                this._setObjFieldValueInQueue(result, dict, "task", task.Id, "state", task.IsAutomatic ? TaskState.Finished : TaskState.ReadyToStart);
                task.State = TaskState.ReadyToStart;
            }
            if (old_is_active && (!is_ready) && (task.State === TaskState.ReadyToStart)) {
                this._setObjFieldValueInQueue(result, dict, "task", task.Id, "state", TaskState.Draft);
                task.State = TaskState.Draft;
            }
            if (need_calc_childs) {
                let childs = process._childs[task.Id];
                if (childs)
                    for (let child in childs) {
                        let link_out = childs[child];
                        if (link_out.IsActive !== is_active) {
                            link_out.IsActive = is_active;
                            this._setObjFieldValueInQueue(result, dict, "link", link_out.Id, "isActive", is_active);
                            let ctask = this._getProcessTask(process, child);
                            calcState(ctask);
                        }
                    }
            }
        }
        calcState(task);
        return result;
    }

    _getListToGoBack(process, id, state, isSupervisor) {
        let result = [];
        this._get_proc_deps(process);
        let root = this._getProcessTask(process, id);
        root.State = state;
        let childs = process._childs[id];
        if (childs) {
            for (let child in childs) {
                if (childs[child].IsConditional)
                    childs[child].Result = null;
                let task = this._getProcessTask(process, child);
                if (task) {
                    if ((!isSupervisor) && (!((task.State === TaskState.Draft) || (task.State === TaskState.ReadyToStart))))
                        throw new HttpError(HttpCode.ERR_BAD_REQ,
                            `Не все зависимые задачи находятся в состоянии "В ожидании" или "Можно приступать".`);
                    this._calcTaskState(process, task, result);
                }
            }
        }
        return result;
    }

    _setObjFieldValueInQueue(queue, dict, type, id, field, val) {
        let key = `${type}:${id}`;
        let obj = dict[key];
        if (!obj) {
            dict[key] = obj = { type: type, id: id, fields: {} };
            queue.push(obj);
        }
        obj.fields[field] = val;
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
                if (task)
                    this._calcTaskState(process, task, result);
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

    _getElemSupervisorByTaskId(task_id, process, rebuild) {
        let result = null;
        let task = this._getProcessTask(process, task_id, rebuild);
        if (task && task.ElementId) {
            let elem = this._getProcessElement(process, task.ElementId, rebuild);
            result = elem && elem.SupervisorId ? elem.SupervisorId : null;
        }
        return result;
    }

    async updateTask(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmTaskExecutor, opts);

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

                        if (inpFields.GuidVer && (inpFields.GuidVer !== taskObj.guidVer()))
                            throw new HttpError(HttpCode.ERR_CONFLICT, `Задача (Id =${id}) была изменена другим пользователем.`);

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

                        let curr_user_id = opts.user.Id;
                        let isAdmin = opts.user.PData.isAdmin || (AccessRights.checkPermissions(opts.user, AccessFlags.PmAdmin) !== 0);
                        let isSupervisor = isAdmin;
                        if (!isSupervisor)
                            isSupervisor = (AccessRights.checkPermissions(opts.user, AccessFlags.PmSupervisor) !== 0) &&
                                (curr_user_id === processObj.supervisorId());
                        let isElemElemManager = AccessRights.checkPermissions(opts.user, AccessFlags.PmElemManager) !== 0;
                        if (isElemElemManager && taskObj.elementId()) {
                            let elem = this._getProcessElement(process, taskObj.elementId());
                            if (elem)
                                isElemElemManager = elem.SupervisorId === curr_user_id;
                        }
                        let isExecutor = taskObj.executorId() === curr_user_id;
                        
                        if (!(isSupervisor || isElemElemManager || isExecutor))
                            throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет прав доступа для совершения операции.`);

                        if ((!isSupervisor) && (taskObj.state() === TaskState.Draft))
                            throw new HttpError(HttpCode.ERR_FORBIDDEN,
                                `Пользователь не может менять задачу в состоянии "${TaskStateStr[taskObj.state()]}".`);

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

                        if ((typeof (inpFields.IsElemReady) === "boolean") && (taskObj.isElemReady() !== inpFields.IsElemReady)) {
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

                        let is_executor_changed = false;
                        if (typeof (inpFields.ExecutorId) !== "undefined") {
                            let old_executor = taskObj.executorId();
                            let new_executor = (typeof (inpFields.ExecutorId) === "number") && (inpFields.ExecutorId > 0) ? inpFields.ExecutorId : null;
                            if (old_executor !== new_executor) {
                                if(taskObj.isAutomatic())
                                    throw new HttpError(HttpCode.ERR_FORBIDDEN, `Нельзя назначить исполнителя автоматической задаче.`);
                                if (!(isSupervisor || isElemElemManager))
                                    throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет права изменять исполнителя задачи.`);
                                is_executor_changed = true;
                                taskObj.executorId(new_executor);
                                if (new_executor)
                                    await this._checkIfPmTaskExecutor(new_executor);
                            }
                        }

                        if (isSupervisor)
                            this._setFieldValues(taskObj, inpFields, null, ["Name", "Description", "DueDate", "IsFinal", "IsAutomatic"]);

                        if (taskObj.isAutomatic() && (!taskObj.isFinal()))
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Автоматическая задача должна быть конечной.`);

                        if ((typeof (inpFields.WriteFieldSet) !== "undefined") && (taskObj.writeFieldSet() !== inpFields.WriteFieldSet)) {
                            if (!isSupervisor)
                                throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет права изменять набор редактируемых полей.`);
                            taskObj.writeFieldSet(inpFields.WriteFieldSet);
                        }

                        await processObj.edit();

                        let allowed_fields = isSupervisor ? undefined : [];
                        if ((!isSupervisor) && taskObj.elementId() && taskObj.writeFieldSet()) {
                            let wr_set = this._getFieldSetByElemId(pstruct, process, taskObj.elementId(), taskObj.writeFieldSet());
                            if (!wr_set)
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Набор полей редактирования "${taskObj.writeFieldSet()}" не существует.`);
                            wr_set.forEach(elem => {
                                allowed_fields.push(elem);
                            })
                        }

                        if (typeof (inpFields.Fields) !== "undefined") {
                            this._setFieldValues(processObj, inpFields.Fields,
                                ["Id", "Name", "State", "StructId", "SupervisorId", "LessonId", "DueDate"], allowed_fields);
                        }

                        let mdf_objs = [];
                        let notifications = [];
                        let old_state = taskObj.state();
                        if (typeof (inpFields.State) !== "undefined")
                            if ((typeof (inpFields.State) === "number") && (inpFields.State > 0)
                                && (inpFields.State <= Object.keys(TaskState).length)) {
                                if (taskObj.state() !== inpFields.State) {
                                    if (inpFields.State === TaskState.Draft)
                                        throw new HttpError(HttpCode.ERR_BAD_REQ,
                                            `Невозможно принудительно перевести задачу в состояние "${TaskStateStr[inpFields.State]}".`);

                                    if (processObj.state() === ProcessState.Draft)
                                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно изменить состояние задачи в процессе "Черновик".`);

                                    let obj_ids = [];
                                    if (taskObj.state() === TaskState.Finished) {
                                        if ((!isSupervisor) && (inpFields.State !== TaskState.InProgess))
                                            throw new HttpError(HttpCode.ERR_BAD_REQ,
                                                `Задачу можно перевести только в состояние "${TaskStateStr[TaskState.InProgess]}".`);
                                        obj_ids = this._getListToGoBack(process, id, inpFields.State, isSupervisor);
                                        let tmp_root =
                                            await this._getObjects(DEPS_ONLY_EXPRESSION, { field: "DepTaskId", op: "=", value: id });
                                        memDbOptions.dbRoots.push(tmp_root); // Remember DbRoot to delete it finally in editDataWrapper
                                        let links_col = tmp_root.getCol("DataElements");
                                        if (links_col.count() > 0) {
                                            mdf_objs.push(tmp_root);
                                            await tmp_root.edit();
                                            for (let i = 0; i < links_col.count(); i++){
                                                let link = links_col.get(0);
                                                link.result(null);
                                                link.isActive(true);
                                            }
                                        }
                                    }
                                    else
                                        if (inpFields.State === TaskState.Finished) {
                                            let tmp_root =
                                                await this._getObjects(DEPS_ONLY_EXPRESSION, { field: "DepTaskId", op: "=", value: id });
                                            memDbOptions.dbRoots.push(tmp_root); // Remember DbRoot to delete it finally in editDataWrapper
                                            let links_col = tmp_root.getCol("DataElements");
                                            if (links_col.count() > 0) {
                                                mdf_objs.push(tmp_root);
                                                await tmp_root.edit();
                                                this._checkConditions(process, pstruct, links_col, true, processObj);
                                            }
                                            obj_ids = this._getListToGoForward(process, id);
                                        }

                                    if (obj_ids.length > 0) {
                                        for (let i = 0; i < obj_ids.length; i++) {
                                            let expr;
                                            let err_msg;
                                            let is_task = false;

                                            switch (obj_ids[i].type) {
                                                case "link":
                                                    expr = DEPS_ONLY_EXPRESSION;
                                                    err_msg = `Переход (Id =${obj_ids[i].id}) не найден.`;
                                                    break;

                                                case "task":
                                                    is_task = true;
                                                    expr = TASK_ONLY_EXPRESSION;
                                                    err_msg = `Дочерняя задача (Id =${obj_ids[i].id}) не найдена.`;
                                                    break;

                                                default:
                                                    throw new Error(`ProcessAPI::updateTask: Unknown modified object type: "${obj_ids[i].type}".`);
                                            }

                                            root_obj = await this._getObjById(obj_ids[i].id, expr, dbOpts);
                                            memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                            collection = root_obj.getCol("DataElements");
                                            if (collection.count() != 1)
                                                throw new HttpError(HttpCode.ERR_NOT_FOUND, err_msg);
                                            let obj = collection.get(0);
                                            await obj.edit();

                                            if (obj_ids[i].fields) {
                                                for (let fld in obj_ids[i].fields) {
                                                    obj[fld](obj_ids[i].fields[fld]);
                                                }
                                                mdf_objs.push(obj);
                                            }

                                            if (is_task && (obj_ids[i].fields.state === TaskState.ReadyToStart)) {
                                                let elem_supervisor_id = this._getElemSupervisorByTaskId(obj.id(), process);
                                                let user_id = obj.executorId() ? obj.executorId() :
                                                    (elem_supervisor_id ? elem_supervisor_id : processObj.supervisorId());
                                                notifications.push({
                                                    UserId: user_id,
                                                    NotifType: NotificationType.TaskCanStart,
                                                    Data: { taskId: obj.id() },
                                                    IsUrgent: obj.dueDate() && ((obj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                                    URL: `${this._absPmTaskUrl}${obj.id()}`,
                                                    Subject: _.template(TASK_START_NOTIF)({
                                                        id: obj.id(),
                                                        lesson: process.Lesson.Name,
                                                        name: obj.name()
                                                    })
                                                })
                                            }
                                        }
                                    }
                                    taskObj.state(inpFields.State);
                                }
                            }
                            else
                                throw new HttpError(HttpCode.ERR_BAD_REQ,
                                    `Недопустимое значение или тип поля "State": ${inpFields.State} тип: "${typeof (inpFields.State)}".`);

                        let elem_supervisor_id = this._getElemSupervisorByTaskId(taskObj.id(), process);
                        if (is_executor_changed &&
                            ((taskObj.state() === TaskState.InProgess) || (taskObj.state() === TaskState.ReadyToStart))) {
                            let user_id = taskObj.executorId() ? taskObj.executorId() :
                                (elem_supervisor_id ? elem_supervisor_id : processObj.supervisorId());
                            notifications.push({
                                UserId: user_id,
                                NotifType: NotificationType.TaskAssigned,
                                Data: { taskId: taskObj.id() },
                                IsUrgent: taskObj.dueDate() && ((taskObj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                URL: `${this._absPmTaskUrl}${taskObj.id()}`,
                                Subject: _.template(TASK_START_NOTIF)({
                                    id: taskObj.id(),
                                    lesson: process.Lesson.Name,
                                    name: taskObj.name()
                                })
                            })
                        }

                        if ((old_state !== taskObj.state()) && taskObj.isAutomatic())
                            throw new HttpError(HttpCode.ERR_BAD_REQ,`Невозможно изменить состояние у автоматической задачи.`);

                        if ((old_state !== taskObj.state()) && (taskObj.state() === TaskState.Alert)) {
                            let user_id = elem_supervisor_id ? elem_supervisor_id : processObj.supervisorId();
                            notifications.push({
                                UserId: user_id,
                                NotifType: NotificationType.TaskQuestionRaised,
                                Data: { taskId: taskObj.id() },
                                IsUrgent: taskObj.dueDate() && ((taskObj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                URL: `${this._absPmTaskUrl}${taskObj.id()}`,
                                Subject: _.template(TASK_ALERT_NOTIF)({
                                    id: taskObj.id(),
                                    lesson: process.Lesson.Name,
                                    name: taskObj.name()
                                })
                            })
                        }

                        if ((old_state === TaskState.Alert) && (taskObj.state() === TaskState.InProgess)) {
                            let user_id = taskObj.executorId() ? taskObj.executorId() : processObj.supervisorId();
                            notifications.push({
                                UserId: user_id,
                                NotifType: NotificationType.TaskQuestionResolved,
                                Data: { taskId: taskObj.id() },
                                IsUrgent: taskObj.dueDate() && ((taskObj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                URL: `${this._absPmTaskUrl}${taskObj.id()}`,
                                Subject: _.template(TASK_CONTINUE_NOTIF)({
                                    id: taskObj.id(),
                                    lesson: process.Lesson.Name,
                                    name: taskObj.name()
                                })
                            })
                        }

                        let newAlertId = taskObj.alertId() && (taskObj.state() === TaskState.Alert) ? taskObj.alertId() : null;
                        if (typeof (inpFields.Comment) === "string") {
                            let root_log = taskObj.getDataRoot("PmTaskLog");
                            let newHandler = await root_log.newObject({
                                fields: { Text: inpFields.Comment, UserId: curr_user_id }
                            }, dbOpts);
                            if ((old_state !== taskObj.state()) && (taskObj.state() === TaskState.Alert))
                                newAlertId = newHandler.keyValue;
                        }

                        if (elemObj)
                            await elemObj.edit();
                        if (taskObj.isElemReady() && elemObj) {
                            if (taskObj.state() === TaskState.Finished)
                                elemObj.state(ElemState.Ready)
                            else
                                if ((old_state === TaskState.Finished) && (elemObj.state() === ElemState.Ready))
                                    elemObj.state(ElemState.NotReady);
                        }

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            for (let i = 0; i < mdf_objs.length; i++)
                                await mdf_objs[i].save(dbOpts);
                            if (notifications.length > 0)
                                await this.sendNotifications(notifications, { user: opts.user, dbOptions: dbOpts });
                            if (!newAlertId)
                                taskObj.alertId(null);
                            await taskObj.save(dbOpts);
                            if (newAlertId) {
                                await taskObj.edit();
                                taskObj.alertId(newAlertId);
                                await taskObj.save(dbOpts);
                            }
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
                                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Родительская задача #${elem} не существует.`);
                                    if (task.IsFinal)
                                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Невозможно добавить задачу, зависящую от задачи #${elem}.`);
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
                            
                        let fields = {
                            ProcessId: inpFields.ProcessId,
                            IsElemReady: true,
                            State: task_state,
                            AlertId: null,
                            IsFinal: false,
                            IsAutomatic: false,
                            IsActive: true
                        };

                        if (typeof (inpFields.Name) !== "undefined")
                            fields.Name = inpFields.Name
                        else
                            throw new Error(`Missing field "Name"`);

                        if (typeof (inpFields.IsFinal) === "boolean")
                            fields.IsFinal = inpFields.IsFinal;

                        if (typeof (inpFields.IsAutomatic) === "boolean")
                            fields.IsAutomatic = inpFields.IsAutomatic;

                        if (typeof (inpFields.ExecutorId) === "number") {
                            if (fields.IsAutomatic)
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Нельзя назначить исполнителя автоматической задаче.`);
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

                        if (fields.IsAutomatic && (fields.State === TaskState.ReadyToStart))
                            fields.State = TaskState.Finished;
                        
                        if (fields.IsAutomatic && (!fields.IsFinal))
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Автоматическая задача должна быть конечной.`);

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

                        let notifications = [];
                        if (taskObj.state() === TaskState.ReadyToStart) {
                            let elem_supervisor_id = this._getElemSupervisorByTaskId(taskObj.id(), process);
                            let user_id = taskObj.executorId() ? taskObj.executorId() :
                                (elem_supervisor_id ? elem_supervisor_id : process.SupervisorId);
                            notifications.push({
                                UserId: user_id,
                                NotifType: NotificationType.TaskCanStart,
                                Data: { taskId: taskObj.id() },
                                IsUrgent: taskObj.dueDate() && ((taskObj.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                URL: `${this._absPmTaskUrl}${taskObj.id()}`,
                                Subject: _.template(TASK_START_NOTIF)({
                                    id: taskObj.id(),
                                    lesson: process.Lesson.Name,
                                    name: taskObj.name()
                                })
                            })
                        }

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            await root_obj.save(dbOpts);
                            if (elemObj)
                                await elemObj.save(dbOpts);
                            if (notifications.length > 0)
                                await this.sendNotifications(notifications, { user: opts.user, dbOptions: dbOpts });
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
        let active_elems = {};
        for (let i = 0; i < process.Tasks.length; i++)
            if (process.Tasks[i].ElementId)
                active_elems[process.Tasks[i].ElementId] = true;
        for (let i = 0; i < process.Elements.length; i++){
            if ((process.Elements[i].State !== ElemState.Ready) && active_elems[process.Elements[i].Id])
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Не все элементы процесса находятся в состоянии готовности.`);
        }
        let cnt_finished = 0;
        let is_finished = false;
        for (let i = 0; i < process.Tasks.length; i++) {
            if (process.Tasks[i].State === TaskState.Finished) {
                cnt_finished++;
                if (process.Tasks[i].IsFinal) {
                    is_finished = true;
                    break;
                }
            }
        }
        if ((!is_finished) || (cnt_finished < process.Tasks.length.length))
            throw new HttpError(HttpCode.ERR_BAD_REQ, `Не все задачи процесса завершены или не выполнена завершающая задача.`);
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

    async deleteProcess(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmSupervisor, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        return this._lockProcess(id, async () => {
            let proc = await this.getProcess(id, options);
            if (proc.State !== ProcessState.Draft)
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить процесс, который не находится в состоянии "Черновик".`);
 
            for (let i = 0; i < proc.Elements.length; i++){
                if (proc.Elements[i].State !== ElemState.NotReady)
                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить процесс, в котором есть элементы не в исходном состоянии.`);
            }

            for (let i = 0; i < proc.Tasks.length; i++) {
                if ((proc.Tasks[i].State !== TaskState.Draft) && (proc.Tasks[i].State !== TaskState.ReadyToStart))
                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить процесс, в котором есть задачи не в исходном состоянии.`);
            }


            let tran = await $data.tranStart(dbOpts);
            let transactionId = tran.transactionId;
            dbOpts.transactionId = tran.transactionId;
            try {
                let mysql_script = [];
                SQL_DEL_PROCESS_MYSQL_SCRIPT.forEach((elem) => {
                    mysql_script.push(_.template(elem)({ id: id }));
                });
                let mssql_script = [];
                SQL_DEL_PROCESS_MSSQL_SCRIPT.forEach((elem) => {
                    mssql_script.push(_.template(elem)({ id: id }));
                });
                await DbUtils.execSqlScript(mysql_script, mssql_script, dbOpts);
                await $data.tranCommit(transactionId)
            }
            catch (err) {
                await $data.tranRollback(transactionId);
                throw err;
            }

            if (logModif)
                console.log(buildLogString(`Process deleted: Id="${id}".`));
            return { result: "OK", id: id };
        });
    }

    async sendNotifications(data, options) {
        let notificationService = this.getService("notifications", true);
        if (notificationService)
            await notificationService.newNotification(data, options);
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

                        if (typeof (inpFields.SupervisorId) === "number") {
                            procObj.supervisorId(inpFields.SupervisorId);
                            if (inpFields.SupervisorId !== opts.user.Id)
                                await this._checkIfPmSupervisor(inpFields.SupervisorId);
                        }

                        let ready_tasks = [];
                        let notifications = [];
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
                                                if (task_state === TaskState.ReadyToStart) {
                                                    let elem_supervisor_id = this._getElemSupervisorByTaskId(ctask.id(), process);
                                                    let user_id = ctask.executorId() ? ctask.executorId() :
                                                        (elem_supervisor_id ? elem_supervisor_id : procObj.supervisorId());
                                                    notifications.push({
                                                        UserId: user_id,
                                                        NotifType: NotificationType.TaskCanStart,
                                                        Data: { taskId: ctask.id() },
                                                        IsUrgent: ctask.dueDate() && ((ctask.dueDate() - (new Date()) < URGENT_INTERVAL_MS)),
                                                        URL: `${this._absPmTaskUrl}${ctask.id()}`,
                                                        Subject: _.template(TASK_START_NOTIF)({
                                                            id: ctask.id(),
                                                            lesson: process.Lesson.Name,
                                                            name: ctask.name()
                                                        })
                                                    })
                                                }
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

                        this._setFieldValues(procObj, inpFields, ["Id", "State", "SupervisorId", "StructId", "LessonId"]);

                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            for (let i = 0; i < ready_tasks.length; i++)
                                await ready_tasks[i].save(dbOpts);
                            if (notifications.length > 0)
                                await this.sendNotifications(notifications, { user: opts.user, dbOptions: dbOpts });
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

                    let fields = { State: ProcessState.Draft, SupervisorId: opts.user.Id }; // State = Draft

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
                            let struct_name = PROCESS_PROTO_TABLE[inpFields.Params.StructName] &&
                                PROCESS_PROTO_TABLE[inpFields.Params.StructName].structure ?
                                PROCESS_PROTO_TABLE[inpFields.Params.StructName].structure.Name : null;
                            if(!struct_name)
                                throw new Error(`Unknown process struct name: "${inpFields.Params.StructName}"`);
                            pstruct = await this.getProcessStruct(struct_name, opts);
                            if (!pstruct) {
                                let creation_err = null;
                                try {
                                    await this._newProcessStructByName(inpFields.Params.StructName, opts);
                                }
                                catch (err) {
                                    creation_err = err;
                                    console.error(buildLogString(`ProcessAPI::_newProcessStructByName: ${err.message}`));
                                }
                                pstruct = await this.getProcessStruct(struct_name, opts);
                                if (!pstruct)
                                    throw creation_err;
                                delete opts.silent;
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
                if ((!this._struct_cache[id]) || (this._struct_cache[id].ts !== redis_ts)) {
                    let val = await this.cacheHgetAll(key, { json: true });
                    if (val && val.ts && val.data) {
                        this._struct_cache[id] = val;
                        result = val.data;
                    }
                }
                else
                    result = this._struct_cache[id].data ? this._struct_cache[id].data : null;
            }
            if (!result) {
                this._struct_cache = {};
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
                    this._struct_cache[id] = { ts: ts, data: result };
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
                                if (!Array.isArray(elem.ViewFields))
                                    throw new Error(`Invalid field "ViewFields" of element "${elem.Name}"`);
                                for (let j = 0; j < elem.ViewFields.length; j++){
                                    if (!inpFields.ProcessFields[elem.ViewFields[j]])
                                        throw new Error(`Unknown field "${elem.ViewFields[j]}" in "ViewFields" of element "${elem.Name}"`);
                                }
                                efields.ViewFields = JSON.stringify(elem.ViewFields);
                            }
                            else
                                throw new Error(`Missing field "ViewFields" in element #${i} description.`);
                            if (typeof (elem.WriteFields) !== "undefined") {
                                for (let key in elem.WriteFields) {
                                    let write_set = elem.WriteFields[key];
                                    if (!(write_set && Array.isArray(write_set)))
                                        throw new Error(`Invalid write set "${key}" of element "${elem.Name}"`);
                                    for (let j = 0; j < write_set.length; j++) {
                                        if (!inpFields.ProcessFields[write_set[j]])
                                            throw new Error(`Unknown field "${write_set[j]}" in write set "${key}" of element "${elem.Name}"`);
                                    }
                                }
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
