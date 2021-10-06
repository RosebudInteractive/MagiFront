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
const { TaskState, ElemState } = require('./const');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const SQL_GET_LIST_MSSQL =
    "select lc.[ReadyDate], lc.[CourseId], lc.[LessonId], cl.[Name] CourseName, ll.[Name] LessonName,\n" +
    "  case when lcp.[Id] is NULL then lc.[Number] else lcp.[Number] end Num_parent,\n" +
    "  case when lcp.[Id] is NULL then 0 else lc.[Number] end Num, lc.[ParentId], lc.[ReadyDate],\n" +
    "  lc.[State] LessonState, c.[State] CourseState, p.[Id] Pid, p.[State] PState,\n" +
    "  t.[State] TaskState, ep.[State] ElState, e.[Name] ElName, ep.[Id] ElemId, u.[SysParentId] UserId, u.[DisplayName],\n" +
    "  ue.[SysParentId] EUserId, ue.[DisplayName] EDisplayName\n" +
    "from [LessonLng] ll\n" +
    "  join [LessonCourse] lc on ll.[LessonId] = lc.[LessonId]\n" +
    "  join [Course] c on lc.[CourseId] = c.[Id]\n" +
    "  join [CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  left join [LessonCourse] lcp on lcp.[Id] = lc.[ParentId]\n" +
    "  left join [PmProcess] p on p.[LessonId] = lc.[LessonId]\n" +
    "  left join [PmTask] t on t.[ProcessId] = p.[Id]\n" +
    "  left join [PmElemProcess] ep on ep.[Id] = t.[ElementId]\n" +
    "  left join [PmElement] e on e.[Id] = ep.[ElemId]\n" +
    "  left join [User] u on u.[SysParentId] = p.[SupervisorId]\n" +
    "  left join [User] ue on ue.[SysParentId] = ep.[SupervisorId]\n" +
    "where (not lc.[ReadyDate] is NULL) and (not((lc.[State] = 'R') and (c.[State] = 'P') and (p.[Id] is NULL)))<%= filter %>\n" +
    "order by lc.[ReadyDate], 7, 6, lc.[LessonId]";

const SQL_GET_LIST_MYSQL =
    "select lc.`ReadyDate`, lc.`CourseId`, lc.`LessonId`, cl.`Name` CourseName, ll.`Name` LessonName,\n" +
    "  case when lcp.`Id` is NULL then lc.`Number` else lcp.`Number` end Num_parent,\n" +
    "  case when lcp.`Id` is NULL then 0 else lc.`Number` end Num, lc.`ParentId`, lc.`ReadyDate`,\n" +
    "  lc.`State` LessonState, c.`State` CourseState, p.`Id` Pid, p.`State` PState,\n" +
    "  t.`State` TaskState, ep.`State` ElState, e.`Name` ElName, ep.`Id` ElemId, u.`SysParentId` UserId, u.`DisplayName`,\n" +
    "  ue.`SysParentId` EUserId, ue.`DisplayName` EDisplayName\n" +
    "from `LessonLng` ll\n" +
    "  join `LessonCourse` lc on ll.`LessonId` = lc.`LessonId`\n" +
    "  join `Course` c on lc.`CourseId` = c.`Id`\n" +
    "  join `CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  left join `LessonCourse` lcp on lcp.`Id` = lc.`ParentId`\n" +
    "  left join `PmProcess` p on p.`LessonId` = lc.`LessonId`\n" +
    "  left join `PmTask` t on t.`ProcessId` = p.`Id`\n" +
    "  left join `PmElemProcess` ep on ep.`Id` = t.`ElementId`\n" +
    "  left join `PmElement` e on e.`Id` = ep.`ElemId`\n" +
    "  left join `User` u on u.`SysParentId` = p.`SupervisorId`\n" +
    "  left join `User` ue on ue.`SysParentId` = ep.`SupervisorId`\n" +
    "where (not lc.`ReadyDate` is NULL) and (not((lc.`State` = 'R') and (c.`State` = 'P') and (p.`Id` is NULL)))<%= filter %>\n" +
    "order by lc.`ReadyDate`, 7, 6, lc.`LessonId`";

const SQL_GET_LSN_LIST_MSSQL =
    "select lc.[CourseId], lc.[LessonId], cl.[Name] CourseName, ll.[Name] LessonName,\n" +
    "  case when lcp.[Id] is NULL then lc.[Number] else lcp.[Number] end Num_parent,\n" +
    "  case when lcp.[Id] is NULL then 0 else lc.[Number] end Num, lc.[State] LessonState, c.[State] CourseState\n" +
    "from [LessonLng] ll\n" +
    "  join [LessonCourse] lc on ll.[LessonId] = lc.[LessonId]\n" +
    "  join [Course] c on lc.[CourseId] = c.[Id]\n" +
    "  join [CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  left join [LessonCourse] lcp on lcp.[Id] = lc.[ParentId]\n" +
    "  left join [PmProcess] p on p.[LessonId] = lc.[LessonId]\n" +
    "where (lc.[ReadyDate] is NULL) and (not((lc.[State] = 'R') and (c.[State] = 'P') and (p.[Id] is NULL)))";

const SQL_GET_LSN_LIST_MYSQL =
    "select lc.`CourseId`, lc.`LessonId`, cl.`Name` CourseName, ll.`Name` LessonName,\n" +
    "  case when lcp.`Id` is NULL then lc.`Number` else lcp.`Number` end Num_parent,\n" +
    "  case when lcp.`Id` is NULL then 0 else lc.`Number` end Num, lc.`State` LessonState, c.`State` CourseState\n" +
    "from `LessonLng` ll\n" +
    "  join `LessonCourse` lc on ll.`LessonId` = lc.`LessonId`\n" +
    "  join `Course` c on lc.`CourseId` = c.`Id`\n" +
    "  join `CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  left join `LessonCourse` lcp on lcp.`Id` = lc.`ParentId`\n" +
    "  left join `PmProcess` p on p.`LessonId` = lc.`LessonId`\n" +
    "where (lc.`ReadyDate` is NULL) and (not((lc.`State` = 'R') and (c.`State` = 'P') and (p.`Id` is NULL)))";

const SQL_GET_LESSON_MSSQL = "select [Id], [CourseId], [ParentId] from [Lesson] where [Id] = <%= id %>";
const SQL_GET_LESSON_MYSQL = "select `Id`, `CourseId`, `ParentId` from `Lesson` where `Id` = <%= id %>";

const DFLT_LSN_SORT_ORDER = "LessonName,ASC";

const VIEW_ONLY = 1;
const VIEW_AND_EDIT = 2;
const FULL_ACCESS = 3;

const PmDashboard = class PmDashboard extends DbObject {

    constructor(options) {
        super(options);
    }

    async _checkDashboardPermissions(access_level, options) {
        let { user, userPermissions, isAdmin } = await this._getPermissions("dsb.al", options);
        if (!(isAdmin || (userPermissions["dsb.al"] && (userPermissions["dsb.al"] >= access_level))))
            throw new HttpError(HttpCode.ERR_FORBIDDEN, `Пользователь не имеет прав доступа для совершения операции.`);
        return user;
    }

    async getLessonList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkDashboardPermissions(VIEW_ONLY, options);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_LSN_LIST_MYSQL;
        let sql_mssql = SQL_GET_LSN_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        if (opts.course_name) {
            mssql_conds.push(`(cl.[Name] like N'%${opts.course_name}%')`);
            mysql_conds.push(`(cl.${'`'}Name${'`'} like '%${opts.course_name}%')`);
        }
        if (opts.lesson_name) {
            mssql_conds.push(`(ll.[Name] like N'%${opts.lesson_name}%')`);
            mysql_conds.push(`(ll.${'`'}Name${'`'} like '%${opts.lesson_name}%')`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\n  AND ${mysql_conds.join("\n  AND ")}`;
            sql_mssql += `\n  AND ${mssql_conds.join("\n  AND ")}`;
        }

        opts.order = opts.order ? opts.order : DFLT_LSN_SORT_ORDER;
        if (opts.order) {
            let ord_arr = opts.order.split(',');
            let dir = ord_arr.length > 1 && (ord_arr[1].toUpperCase() === "DESC") ? "DESC" : "ASC";
            let mysql_field;
            let mssql_field;
            switch (ord_arr[0]) {
                case "CourseName":
                    mssql_field = `cl.[Name] ${dir}`;
                    mysql_field = `cl.${'`'}Name${'`'} ${dir}`;
                    break;
                case "LessonName":
                    mssql_field = `ll.[Name] ${dir}`;
                    mysql_field = `ll.${'`'}Name${'`'} ${dir}`;
                    break;
                case "Number":
                    mysql_field = mssql_field = `5 ${dir}, 6 ASC`;
                    break;
            }
            if (mysql_field) {
                sql_mysql += `\nORDER BY ${mysql_field}`;
                sql_mssql += `\nORDER BY ${mssql_field}`;
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
                let rec = {
                    CourseId: elem.CourseId,
                    LessonId: elem.LessonId,
                    CourseName: elem.CourseName,
                    LessonName: elem.LessonName,
                    LessonNum: `${elem.Num_parent}${(elem.Num > 0 ? ('.' + elem.Num) : '')}`,
                    LessonState: elem.LessonState,
                    CourseState: elem.CourseState
                };
                result.push(rec);
            });
        }

        return result;
    }

    async getList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkDashboardPermissions(VIEW_ONLY, options);
        
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let filter_mysql = "";
        let filter_mssql = "";

        let mssql_conds = [];
        let mysql_conds = [];

        let st_date = opts.st_date ? (opts.st_date instanceof Date ? opts.st_date : new Date(opts.st_date)) : new Date();
        st_date = new Date(st_date.getFullYear(), st_date.getMonth(), st_date.getDate(st_date));
        mssql_conds.push(`(lc.[ReadyDate] >= convert(datetime,'${this._dateToString(st_date)}'))`);
        mysql_conds.push(`(lc.${'`'}ReadyDate${'`'} >= '${this._dateToString(st_date)}')`);

        let fin_date = opts.fin_date ? (opts.fin_date instanceof Date ? opts.fin_date : new Date(opts.fin_date)) :
            new Date(st_date.getFullYear(), st_date.getMonth(), st_date.getDate(st_date) + 6);
        fin_date = new Date(fin_date.getFullYear(), fin_date.getMonth(), fin_date.getDate(fin_date) + 1);
        mssql_conds.push(`(lc.[ReadyDate] < convert(datetime,'${this._dateToString(fin_date)}'))`);
        mysql_conds.push(`(lc.${'`'}ReadyDate${'`'} < '${this._dateToString(fin_date)}')`);

        if (opts.course) {
            mssql_conds.push(`(lc.[CourseId] = ${opts.course})`);
            mysql_conds.push(`(lc.${'`'}CourseId${'`'} = ${opts.course})`);
        }

        if (opts.course_name) {
            mssql_conds.push(`(cl.[Name] like N'%${opts.course_name}%')`);
            mysql_conds.push(`(cl.${'`'}Name${'`'} like '%${opts.course_name}%')`);
        }

        if ((opts.woProc === true) || (opts.woProc === "true")) {
            mssql_conds.push(`(p.[Id] is NULL)`);
            mysql_conds.push("(p.`Id` is NULL)");
        }

        if (opts.procState) {
            let states = Array.isArray(opts.procState) ? opts.procState : opts.procState.split(',');
            mssql_conds.push(`(p.[State] in (${states.join(',')}))`);
            mysql_conds.push(`(p.${'`'}State${'`'} in (${states.join(',')}))`);
        }

        if (mysql_conds.length > 0) {
            filter_mysql += `\nAND ${mysql_conds.join("\n  AND ")}`;
            filter_mssql += `\nAND ${mssql_conds.join("\n  AND ")}`;
        }

        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_LIST_MYSQL)({ filter: filter_mysql }),
                mssql: _.template(SQL_GET_LIST_MSSQL)({ filter: filter_mssql })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            let curr_id = -1;
            let curr_lesson = null;
            let elems = {};

            let task_in_progress = {};
            task_in_progress[TaskState.InProgess] = true;
            task_in_progress[TaskState.Alert] = true;
            task_in_progress[TaskState.Finished] = true;

            records.detail.forEach(elem => {
                if (curr_id !== elem.LessonId) {
                    if (curr_lesson)
                        result.push(curr_lesson);
                    curr_id = elem.LessonId;
                    elems = {};
                    curr_lesson = {
                        PubDate: elem.ReadyDate,
                        CourseId: elem.CourseId,
                        CourseName: elem.CourseName,
                        LessonId: curr_id,
                        LessonNum: `${elem.Num_parent}${(elem.Num > 0 ? ('.' + elem.Num) : '')}`,
                        LessonName: elem.LessonName,
                        Elements: [],
                        IsPublished: elem.LessonState === 'R',
                        ProcessId: elem.Pid,
                        ProcessState: elem.PState,
                        Supervisor: elem.UserId ? {
                            Id: elem.UserId,
                            DisplayName: elem.DisplayName
                        } : undefined
                    };
                }
                if (elem.ElemId) {
                    let pelem = elems[elem.ElemId];
                    if (!pelem) {
                        elems[elem.ElemId] = pelem = {
                            Id: elem.ElemId,
                            Name: elem.ElName,
                            State: elem.ElState,
                            HasAlert: false,
                            Supervisor: elem.EUserId ? {
                                Id: elem.EUserId,
                                DisplayName: elem.EDisplayName
                            } : undefined
                        };
                        curr_lesson.Elements.push(pelem);
                    }
                    if ((pelem.State === ElemState.NotReady) && task_in_progress[elem.TaskState])
                        pelem.State = ElemState.InProgess;
                    if (elem.TaskState === TaskState.Alert)
                        pelem.HasAlert = true;
                }
            });
            if (curr_lesson)
                result.push(curr_lesson);
        }

        return result;
    }

    async setLessonReadyDate(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkDashboardPermissions(VIEW_AND_EDIT, options);
        let lessonService = this.getService("lesson", true);
        if (lessonService) {
            let inpFields = data || {};
            let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

            if (!inpFields.ReadyDate)
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Дата публикации не задана.`);
            
            try {
                new Date(inpFields.ReadyDate);
            }
            catch (err) {
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Недопустимая дата публикации: "${inpFields.ReadyDate}".`);
            }

            let records = await $data.execSql({
                dialect: {
                    mysql: _.template(SQL_GET_LESSON_MYSQL)({ id: id }),
                    mssql: _.template(SQL_GET_LESSON_MSSQL)({ id: id })
                }
            }, dbOpts)

            if (records && records.detail && (records.detail.length === 1)) {
                let result = await lessonService.update(records.detail[0].Id,
                    records.detail[0].CourseId, { ReadyDate: inpFields.ReadyDate }, records.detail[0].ParentId, dbOpts);
                return result;
            }
            else
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Лекция (Id=${id}) не найдена.`);
        }
        else
            throw new Error(`Lesson service is unavailable!`);
    }
}

let pmDashboard = null;
exports.PmDashboardService = () => {
    return pmDashboard ? pmDashboard : pmDashboard = new PmDashboard();
}
