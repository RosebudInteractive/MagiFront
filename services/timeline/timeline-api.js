'use strict';
const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../../database/db-object');
const { DbUtils } = require('../../database/db-utils');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { AccessFlags } = require('../../const/common');
const { EntityType } = require('../../const/sql-req-common');
const { AccessRights } = require('../../security/access-rights');
const { getTimeStr, buildLogString } = require('../../utils');
const { TimelineState, TimelineStateStr } = require('./const');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const logModif = config.has("debug.timeline.logModif") ? config.get("debug.timeline.logModif") : false;

const SQL_GET_TL_EXT_FLD_MSSQL = ", t.[Description], t.[Image], t.[ImageMeta], t.[Options], t.[ProcessId]";
const SQL_GET_TL_EXT_FLD_MYSQL = ", t.`Description`, t.`Image`, t.`ImageMeta`, t.`Options`, t.`ProcessId`";

const SQL_GET_TL_LIST_MSSQL =
    "select t.[Id], t.[TimeCr], t.[Name], t.[SpecifCode], t.[CourseId], cl.[Name] CourseName, t.[LessonId], ll.[Name] LsnName,\n" +
    "  t.[State], t.[Order], c.[TimelineId]<%= ext_fields %>\n" +
    "from [Timeline] t\n" +
    "  left join [CourseLng] cl on cl.[CourseId] = t.[CourseId]\n" +
    "  left join [LessonLng] ll on ll.[LessonId] = t.[LessonId]\n" +
    "  left join (select distinct [TimelineId] from [Command]) c on c.[TimelineId] = t.[Id]";

const SQL_GET_TL_LIST_MYSQL =
    "select t.`Id`, t.`TimeCr`, t.`Name`, t.`SpecifCode`, t.`CourseId`, cl.`Name` CourseName, t.`LessonId`, ll.`Name` LsnName,\n" +
    "  t.`State`, t.`Order`, c.`TimelineId`<%= ext_fields %>\n" +
    "from `Timeline` t\n" +
    "  left join `CourseLng` cl on cl.`CourseId` = t.`CourseId`\n" +
    "  left join `LessonLng` ll on ll.`LessonId` = t.`LessonId`\n" +
    "  left join (select distinct `TimelineId` from `Command`) c on c.`TimelineId` = t.`Id`";

const SQL_PUBLISH_TL_EVENT_MSSQL =
    "update [Event] set [State] = 2, [TlPublicId] = <%= id %> where ([State] = 1)\n" +
    "  and([SysParentId] in (select [EventId] from [TimelineEvent] where [TimelineId] = <%= id %>))";

const SQL_PUBLISH_TL_EVENT_MYSQL =
    "update `Event` set `State` = 2, `TlPublicId` = <%= id %> where (`State` = 1)\n" +
    "  and(`SysParentId` in (select `EventId` from `TimelineEvent` where `TimelineId` = <%= id %>))";

const SQL_PUBLISH_TL_PERIOD_MSSQL =
    "update [Period] set [State] = 2, [TlPublicId] = <%= id %> where ([State] = 1)\n" +
    "  and([Id] in (select [PeriodId] from [TimelinePeriod] where [TimelineId] = <%= id %>))";

const SQL_PUBLISH_TL_PERIOD_MYSQL =
    "update `Period` set `State` = 2, `TlPublicId` = <%= id %> where (`State` = 1)\n" +
    "  and(`Id` in (select `PeriodId` from `TimelinePeriod` where `TimelineId` = <%= id %>))";

const SQL_DELETE_TL_EVENT_MYSQL =
    "delete from `Entity` where (`Id` in (select `SysParentId` from `Event` where (`State` = 1) and (`SysParentId` in (<%= ids %>))))\n" +
    "  and (not `Id` in (select `EventId` from `TimelineEvent` where `EventId` in (<%= ids %>)\n" +
    "  union select `EventId` from `CommandEvent` where `EventId` in (<%= ids %>)))";

const SQL_DELETE_TL_EVENT_MSSQL =
    "delete from [Entity] where ([Id] in (select [SysParentId] from [Event] where ([State] = 1) and ([SysParentId] in (<%= ids %>))))\n" +
    "  and (not [Id] in (select [EventId] from [TimelineEvent] where [EventId] in (<%= ids %>)\n" +
    "  union select [EventId] from [CommandEvent] where [EventId] in (<%= ids %>)))";

const SQL_DELETE_TL_PERIOD_MYSQL =
    "delete from `Period` where (`State` = 1) and (`Id` in (<%= ids %>))\n" +
    "  and (not `Id` in (select `PeriodId` from `TimelinePeriod` where `PeriodId` in (<%= ids %>)\n" +
    "  union select `PeriodId` from `CommandEvent` where `PeriodId` in (<%= ids %>)))";

const SQL_DELETE_TL_PERIOD_MSSQL =
    "delete from [Period] where ([State] = 1) and ([Id] in (<%= ids %>))\n" +
    "  and (not [Id] in (select [PeriodId] from [TimelinePeriod] where [PeriodId] in (<%= ids %>)\n" +
    "  union select [PeriodId] from [CommandEvent] where [PeriodId] in (<%= ids %>)))";

const TL_MSSQL_DELETE_SCRIPT =
    [
        "update [Event] set [TlCreationId] = null where [TlCreationId] = <%= id %>",
        "update [Event] set [TlPublicId] = null where [TlPublicId] = <%= id %>",
        "update [Period] set [TlCreationId] = null where [TlCreationId] = <%= id %>",
        "update [Period] set [TlPublicId] = null where [TlPublicId] = <%= id %>",
        "delete ce from [Command] c left join [CommandEvent] ce on c.[Id] = ce.[CommandId] where c.[TimelineId] = <%= id %>",
        "delete c from [Command] c where c.[TimelineId] = <%= id %>"
    ];

const TL_MYSQL_DELETE_SCRIPT =
    [
        "update `Event` set `TlCreationId` = null where `TlCreationId` = <%= id %>",
        "update `Event` set `TlPublicId` = null where `TlPublicId` = <%= id %>",
        "update `Period` set `TlCreationId` = null where `TlCreationId` = <%= id %>",
        "update `Period` set `TlPublicId` = null where `TlPublicId` = <%= id %>",
        "delete ce from `Command` c left join `CommandEvent` ce on c.`Id` = ce.`CommandId` where c.`TimelineId` = <%= id %>",
        "delete c from `Command` c where c.`TimelineId` = <%= id %>"
    ];

const SQL_GET_TL_COMMAND_MSSQL =
    "select c.[Id], c.[Number], c.[TimeCode], c.[Code], c.[Args], ce.[Id] CeId, ce.[Number] ArgNumber, ce.[EventId], ce.[PeriodId]\n" +
    "from [Command] c\n" +
    "  left join [CommandEvent] ce on c.[Id] = ce.[CommandId]\n" +
    "where c.[TimelineId] = <%= id %>";

const SQL_GET_TL_COMMAND_MYSQL =
    "select c.`Id`, c.`Number`, c.`TimeCode`, c.`Code`, c.`Args`, ce.`Id` CeId, ce.`Number` ArgNumber, ce.`EventId`, ce.`PeriodId`\n" +
    "from `Command` c\n" +
    "  left join `CommandEvent` ce on c.`Id` = ce.`CommandId`\n" +
    "where c.`TimelineId` = <%= id %>";

const TL_CREATE = {
    expr: {
        model: {
            name: "Timeline"
        }
    }
};

const TL_DELETE = {
    expr: {
        model: {
            name: "Timeline",
            childs: [
                {
                    dataObject: {
                        name: "TimelineEvent"
                    }
                },
                {
                    dataObject: {
                        name: "TimelinePeriod"
                    }
                }
            ]
        }
    }
};

const TL_COPY = {
    expr: {
        model: {
            name: "Timeline",
            childs: [
                {
                    dataObject: {
                        name: "TimelineEvent"
                    }
                },
                {
                    dataObject: {
                        name: "TimelinePeriod"
                    }
                },
                {
                    dataObject: {
                        name: "Command",
                        childs: [
                            {
                                dataObject: {
                                    name: "CommandEvent"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
};

const TL_ADD_EVENT = {
    expr: {
        model: {
            name: "TimelineEvent"
        }
    }
};

const TL_ADD_PERIOD = {
    expr: {
        model: {
            name: "TimelinePeriod"
        }
    }
};

const TL_ADD_COMMAND = {
    expr: {
        model: {
            name: "Command",
            childs: [
                {
                    dataObject: {
                        name: "CommandEvent"
                    }
                }
            ]
        }
    }
};

const TimelineAPI = class TimelineAPI extends DbObject {

    constructor(options) {
        super(options);
    }

    async getTimelineList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        if (!opts.allow_unauth)
            opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_TL_LIST_MYSQL;
        let sql_mssql = SQL_GET_TL_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        let is_detailed = (opts.isDetailed === "true") || (opts.isDetailed === true);
        let mysql_ext_fields = is_detailed ? SQL_GET_TL_EXT_FLD_MYSQL : "";
        let mssql_ext_fields = is_detailed ? SQL_GET_TL_EXT_FLD_MSSQL : "";

        if (opts.Id) {
            let id = +opts.Id;
            if ((typeof (id) === "number") && (!isNaN(id))) {
                mssql_conds.push(`(t.[Id] = ${opts.Id})`);
                mysql_conds.push(`(t.${'`'}Id${'`'} = ${opts.Id})`);
            }
        }
        if (opts.State) {
            let states = Array.isArray(opts.State) ? opts.State : opts.State.split(',');
            mssql_conds.push(`(t.[State] in (${states.join(',')}))`);
            mysql_conds.push(`(t.${'`'}State${'`'} in (${states.join(',')}))`);
        }
        if (opts.Name) {
            mssql_conds.push(`(t.[Name] like N'%${opts.Name}%')`);
            mysql_conds.push(`(t.${'`'}Name${'`'} like '%${opts.Name}%')`);
        }
        if (opts.SpecifCode) {
            mssql_conds.push(`(t.[SpecifCode] like N'%${opts.SpecifCode}%')`);
            mysql_conds.push(`(t.${'`'}SpecifCode${'`'} like '%${opts.SpecifCode}%')`);
        }
        if (opts.Course) {
            mssql_conds.push(`(cl.[Name] like N'%${opts.Course}%')`);
            mysql_conds.push(`(cl.${'`'}Name${'`'} like '%${opts.Course}%')`);
        }
        if (opts.Lesson) {
            mssql_conds.push(`(ll.[Name] like N'%${opts.Lesson}%')`);
            mysql_conds.push(`(ll.${'`'}Name${'`'} like '%${opts.Lesson}%')`);
        }
        if (opts.LessonOrCourse) {
            mssql_conds.push(`((cl.[Name] like N'%${opts.LessonOrCourse}%') OR (ll.[Name] like N'%${opts.LessonOrCourse}%'))`);
            mysql_conds.push(`((cl.${'`'}Name${'`'} like '%${opts.LessonOrCourse}%') OR (ll.${'`'}Name${'`'} like '%${opts.LessonOrCourse}%'))`);
        }
        if (opts.Order) {
            let order = +opts.Order;
            if ((typeof (order) === "number") && (!isNaN(order))) {
                mssql_conds.push(`(t.[Order] = ${opts.Order})`);
                mysql_conds.push(`(t.${'`'}Order${'`'} = ${opts.Order})`);
            }
        }
        if (opts.CourseId) {
            let id = +opts.CourseId;
            if ((typeof (id) === "number") && (!isNaN(id))) {
                mssql_conds.push(`(t.[CourseId] = ${opts.CourseId})`);
                mysql_conds.push(`(t.${'`'}CourseId${'`'} = ${opts.CourseId})`);
            }
        }
        if (opts.LessonId) {
            let id = +opts.LessonId;
            if ((typeof (id) === "number") && (!isNaN(id))) {
                mssql_conds.push(`(t.[LessonId] = ${opts.LessonId})`);
                mysql_conds.push(`(t.${'`'}LessonId${'`'} = ${opts.LessonId})`);
            }
        }
        if (opts.TypeOfUse) {
            let tp = +opts.TypeOfUse;
            if ((typeof (tp) === "number") && (!isNaN(tp))) {
                let not;
                switch (tp) {
                    case 1:
                        not = "";
                        break;
                    case 2:
                        not = "NOT ";
                        break;
                }
                if (typeof (not) !== "undefined") {
                    mssql_conds.push(`(${not}t.[LessonId] IS NULL)`);
                    mysql_conds.push(`(${not}t.${'`'}LessonId${'`'} IS NULL)`);
                }
            }
        }
        if (opts.HasScript) {
            let has_script;
            switch (typeof (opts.HasScript)) {
                case "string":
                    has_script = opts.HasScript === "true" ? true : (opts.HasScript === "false" ? false : undefined);
                    break;
                case "boolean":
                    has_script = opts.HasScript;
                    break;
            }
            if (typeof (has_script) !== "undefined") {
                let not = has_script ? "NOT " : "";
                mssql_conds.push(`(${not}c.[TimelineId] IS NULL)`);
                mysql_conds.push(`(${not}c.${'`'}TimelineId${'`'} IS NULL)`);
            }
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
                case "TimeCr":
                    mssql_field = "t.[TimeCr]";
                    mysql_field = "t.`TimeCr`";
                    break;
                case "Name":
                    mssql_field = "t.[Name]";
                    mysql_field = "t.`Name`";
                    break;
                case "Course":
                    mssql_field = "cl.[Name]";
                    mysql_field = "cl.`Name`";
                    break;
                case "Lesson":
                    mssql_field = "ll.[Name]";
                    mysql_field = "ll.`Name`";
                    break;
                case "State":
                    mssql_field = "t.[State]";
                    mysql_field = "t.`State`";
                    break;
                case "Order":
                    mssql_field = "t.[Order]";
                    mysql_field = "t.`Order`";
                    break;
                case "HasScript":
                    mssql_field = "c.[TimelineId]";
                    mysql_field = "c.`TimelineId`";
                    break;
                case "TypeOfUse":
                    mssql_field = "t.[LessonId]";
                    mysql_field = "t.`LessonId`";
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
                    Name: elem.Name,
                    SpecifCode: elem.SpecifCode,
                    State: elem.State,
                    Order: elem.Order,
                    TimeCr: elem.TimeCr,
                    HasScript: elem.TimelineId ? true : false,
                    TypeOfUse: elem.CourseId ? 1 : 2,
                    CourseId: elem.CourseId,
                    LessonId: elem.LessonId,
                    Course: elem.CourseId ? {
                        Id: elem.CourseId,
                        Name: elem.CourseName
                    } : undefined,
                    Lesson: elem.LessonId ? {
                        Id: elem.LessonId,
                        Name: elem.LsnName
                    } : undefined,
                    Description: is_detailed ? elem.Description : undefined,
                    Image: is_detailed ? elem.Image : undefined,
                    ImageMeta: is_detailed ? (elem.ImageMeta ? JSON.parse(elem.ImageMeta) : null) : undefined,
                    Options: is_detailed ? (elem.Options ? JSON.parse(elem.Options) : null) : undefined,
                    ProcessId: is_detailed ? elem.ProcessId : undefined
                };
                if (is_detailed)
                    await this._getTimelineItems(timeline.Id, timeline, opts)
                result.push(timeline);
            }
        }
        return result;
    }

    async _getTimelineItems(id, out, options) {
        let opts = options || {};
        out.Events = [];
        out.Periods = [];
        out.Commands = [];

        let dbOpts = _.defaultsDeep(opts.dbOptions || {});
        let records = await $data.execSql({
            dialect: {
                mysql: _.template(SQL_GET_TL_COMMAND_MYSQL)({ id: id }),
                mssql: _.template(SQL_GET_TL_COMMAND_MSSQL)({ id: id })
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            let cmd_list = {};
            for (let i = 0; i < records.detail.length; i++){
                let elem = records.detail[i];
                let curr_cmd = cmd_list[elem.Id];
                if (!curr_cmd) {
                    cmd_list[elem.Id] = curr_cmd = {
                        Id: elem.Id,
                        Number: elem.Number,
                        TimeCode: elem.TimeCode,
                        Code: elem.Code,
                        Args: elem.Args,
                        Events: []
                    }
                    out.Commands.push(curr_cmd);
                }
                if (elem.CeId) {
                    curr_cmd.Events.push({
                        Number: elem.ArgNumber,
                        EventId: elem.EventId ? elem.EventId : undefined,
                        PeriodId: elem.PeriodId ? elem.PeriodId : undefined
                    })
                }
            }
        }

        let eventService = this.getService("events", true);
        if (eventService) {
            let eopts = {
                user: opts.user,
                allow_unauth: opts.allow_unauth,
                TimelineId: id,
                SortOrder: "Date",
                dbOptions: opts.dbOptions ? opts.dbOptions : undefined
            };
            out.Events = await eventService.getEventList(eopts);
            let popts = {
                user: opts.user,
                allow_unauth: opts.allow_unauth,
                TimelineId: id,
                SortOrder: "LbDate",
                dbOptions: opts.dbOptions ? opts.dbOptions : undefined
            };
            out.Periods = await eventService.getPeriodList(popts);
        }
    }

    async getTimeline(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.Id = id;
        opts.isDetailed = true;
        let result = await this.getTimelineList(opts);
        if (result && Array.isArray(result) && (result.length === 1))
            result = result[0]
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Таймлайн (Id =${id}) не найден.`);
        return result;
    }

    async newTimeline(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let src_tl = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, inpFields.CopyFrom ? TL_COPY : TL_CREATE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    if (inpFields.CopyFrom)
                        src_tl = await this.getTimeline(inpFields.CopyFrom, options);
                    
                    await root_obj.edit();

                    let fields = { State: TimelineState.Draft }; // State = Draft

                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        if (src_tl)
                            fields.Name = `${src_tl.Name} - Copy ${(new Date()).toISOString()}`
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing field "Name"`);

                    if (!src_tl && (typeof (inpFields.State) === "number")) {
                        let valid_states = {};
                        for (let key in TimelineState)
                            valid_states[TimelineState[key]] = true;
                        if (valid_states[inpFields.State])
                            fields.State = inpFields.State
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid value of field "State": ${inpFields.State}.`);
                    }

                    if (typeof (inpFields.SpecifCode) !== "undefined")
                        fields.SpecifCode = inpFields.SpecifCode
                    else
                        if(src_tl)
                            fields.SpecifCode = src_tl.SpecifCode

                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description
                    else
                        if (src_tl)
                            fields.Description = src_tl.Description

                    if (typeof (inpFields.Image) !== "undefined")
                        fields.Image = inpFields.Image
                    else
                        if (src_tl)
                            fields.Image = src_tl.Image

                    if (typeof (inpFields.ImageMeta) !== "undefined")
                        if (typeof (inpFields.ImageMeta) === "string")
                            fields.ImageMeta = inpFields.ImageMeta
                        else
                            fields.ImageMeta = JSON.stringify(inpFields.ImageMeta)
                    else
                        if (src_tl)
                            fields.ImageMeta = JSON.stringify(src_tl.ImageMeta)

                    if (typeof (inpFields.Options) !== "undefined")
                        if (typeof (inpFields.Options) === "string")
                            fields.Options = inpFields.Options
                        else
                            fields.Options = JSON.stringify(inpFields.Options)
                    else
                        if (src_tl)
                            fields.Options = JSON.stringify(src_tl.Options)

                    if (typeof (inpFields.ProcessId) === "number")
                        fields.ProcessId = inpFields.ProcessId
                    else
                        if (src_tl)
                            fields.ProcessId = src_tl.ProcessId

                    if (typeof (inpFields.Order) === "number")
                        fields.Order = inpFields.Order
                    else
                        if (src_tl)
                            fields.Order = src_tl.Order

                    if (typeof (inpFields.CourseId) === "number")
                        fields.CourseId = inpFields.CourseId
                    else
                        if (src_tl)
                            fields.CourseId = src_tl.CourseId

                    if (typeof (inpFields.LessonId) === "number")
                        fields.LessonId = inpFields.LessonId
                    else
                        if (src_tl)
                            fields.LessonId = src_tl.LessonId

                    if ((fields.CourseId && fields.LessonId) || ((!fields.CourseId) && (!fields.LessonId)))
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Inconsistent combination of "CourseId" and "LessonId" fields.`);

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    let timelineObj = this._db.getObj(newHandler.newObject);
                    let newId = newHandler.keyValue;

                    if (src_tl) {
                        let te_root = timelineObj.getDataRoot("TimelineEvent");
                        for (let i = 0; src_tl.Events && (i < src_tl.Events.length); i++)
                            await te_root.newObject({
                                fields: { EventId: src_tl.Events[i].Id }
                            }, dbOpts);
                        let tp_root = timelineObj.getDataRoot("TimelinePeriod");
                        for (let i = 0; src_tl.Periods && (i < src_tl.Periods.length); i++)
                            await tp_root.newObject({
                                fields: { PeriodId: src_tl.Periods[i].Id }
                            }, dbOpts);
                        let tc_root = timelineObj.getDataRoot("Command");
                        for (let i = 0; src_tl.Commands && (i < src_tl.Commands.length); i++) {
                            let cmd = src_tl.Commands[i];
                            let { newObject } = await tc_root.newObject({
                                fields: {
                                    Number: cmd.Number,
                                    TimeCode: cmd.TimeCode,
                                    Code: cmd.Code,
                                    Args: cmd.Args
                                }
                            }, dbOpts);
                            if (cmd.Events && (cmd.Events.length > 0)) {
                                let cmdObj = this._db.getObj(newObject);
                                let ce_root = cmdObj.getDataRoot("CommandEvent");
                                for (let j = 0; j < cmd.Events.length; j++) {
                                    let cmde = cmd.Events[j];
                                    await ce_root.newObject({
                                        fields: { Number: cmde.Number, EventId: cmde.EventId, PeriodId: cmde.PeriodId }
                                    }, dbOpts);
                                }
                            }
                        }
                    }

                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Timeline created: Id="${newId}".`));
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);

    }

    async updateTimeline(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, TL_CREATE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Таймлайн (Id =${id}) не найден.`);
                    let timelineObj = collection.get(0);

                    await timelineObj.edit();

                    let old_state = timelineObj.state();

                    let fields = { State: TimelineState.Draft }; // State = Draft

                    if (typeof (inpFields.Name) !== "undefined")
                        timelineObj.name(inpFields.Name)

                    if (typeof (inpFields.State) === "number") {
                        let valid_states = {};
                        for (let key in TimelineState)
                            valid_states[TimelineState[key]] = true;
                        if (valid_states[inpFields.State])
                            timelineObj.state(inpFields.State)
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid value of field "State": ${inpFields.State}.`);
                    }

                    if (typeof (inpFields.SpecifCode) !== "undefined")
                        timelineObj.specifCode(inpFields.SpecifCode)

                    if (typeof (inpFields.Description) !== "undefined")
                        timelineObj.description(inpFields.Description)

                    if (typeof (inpFields.Image) !== "undefined")
                        timelineObj.image(inpFields.Image)

                    if (typeof (inpFields.ImageMeta) !== "undefined")
                        if (typeof (inpFields.ImageMeta) === "string")
                            timelineObj.imageMeta(inpFields.ImageMeta)
                        else
                            timelineObj.imageMeta(JSON.stringify(inpFields.ImageMeta))

                    if (typeof (inpFields.Options) !== "undefined")
                        if (typeof (inpFields.Options) === "string")
                            timelineObj.options(inpFields.Options)
                        else
                            timelineObj.options(JSON.stringify(inpFields.Options))

                    if (typeof (inpFields.ProcessId) !== "undefined")
                        timelineObj.processId(inpFields.ProcessId)

                    if (typeof (inpFields.Order) !== "undefined")
                        timelineObj.order(inpFields.Order)

                    if (typeof (inpFields.CourseId) !== "undefined")
                        timelineObj.courseId(inpFields.CourseId)

                    if (typeof (inpFields.LessonId) !== "undefined")
                        timelineObj.lessonId(inpFields.LessonId)

                    if ((timelineObj.courseId() && timelineObj.lessonId()) || ((!timelineObj.courseId()) && (!timelineObj.lessonId())))
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Inconsistent combination of "CourseId" and "LessonId" fields.`);

                    if ((old_state === TimelineState.Draft) && (timelineObj.state() === TimelineState.Published)) {
                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            await timelineObj.save(dbOpts);
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_PUBLISH_TL_EVENT_MYSQL)({ id: timelineObj.id() }),
                                    mssql: _.template(SQL_PUBLISH_TL_EVENT_MSSQL)({ id: timelineObj.id() })
                                }
                            }, dbOpts);
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_PUBLISH_TL_PERIOD_MYSQL)({ id: timelineObj.id() }),
                                    mssql: _.template(SQL_PUBLISH_TL_PERIOD_MSSQL)({ id: timelineObj.id() })
                                }
                            }, dbOpts);
                            await $data.tranCommit(transactionId)
                        }
                        catch (err) {
                            await $data.tranRollback(transactionId);
                            throw err;
                        }
                    }
                    else
                        timelineObj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Timeline updated: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);

    }

    async deleteTimeline(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, TL_DELETE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Таймлайн (Id =${id}) не найден.`);
                    let timelineObj = collection.get(0);

                    await root_obj.edit();

                    if (timelineObj.state() !== TimelineState.Draft)
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Невозможно удалить таймлайн в состоянии "${TimelineStateStr[timelineObj.state()]}".`);

                    let te_root = timelineObj.getDataRoot("TimelineEvent");
                    let col_te = te_root.getCol("DataElements");
                    let events_to_delete = [];
                    while (col_te.count() > 0) {
                        let obj = col_te.get(0);
                        events_to_delete.push(obj.eventId());
                        col_te._del(obj);
                    }

                    let tp_root = timelineObj.getDataRoot("TimelinePeriod");
                    let col_tp = tp_root.getCol("DataElements");
                    let periods_to_delete = [];
                    while (col_tp.count() > 0) {
                        let obj = col_tp.get(0);
                        periods_to_delete.push(obj.periodId());
                        col_tp._del(obj);
                    }

                    collection._del(timelineObj);

                    let tran = await $data.tranStart(dbOpts);
                    let transactionId = tran.transactionId;
                    dbOpts.transactionId = tran.transactionId;
                    try {
                        let mysql_script = [];
                        TL_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                            mysql_script.push(_.template(elem)({ id: id }));
                        });
                        let mssql_script = [];
                        TL_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                            mssql_script.push(_.template(elem)({ id: id }));
                        });
                        await DbUtils.execSqlScript(mysql_script, mssql_script, dbOpts);
                        await root_obj.save(dbOpts);
                        if (events_to_delete.length > 0)
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_DELETE_TL_EVENT_MYSQL)({ ids: events_to_delete.join() }),
                                    mssql: _.template(SQL_DELETE_TL_EVENT_MSSQL)({ ids: events_to_delete.join() })
                                }
                            }, dbOpts);
                        if (periods_to_delete.length > 0)
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_DELETE_TL_PERIOD_MYSQL)({ ids: periods_to_delete.join() }),
                                    mssql: _.template(SQL_DELETE_TL_PERIOD_MSSQL)({ ids: periods_to_delete.join() })
                                }
                            }, dbOpts);
                        await $data.tranCommit(transactionId)
                    }
                    catch (err) {
                        await $data.tranRollback(transactionId);
                        throw err;
                    }

                    if (logModif)
                        console.log(buildLogString(`Timeline deleted: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);

    }

    async deleteItem(id, data, options) {
        let inpFields = data || {};
        let result;
        let eventService = this.getService("events", true);
        if (!eventService)
            throw new HttpError(HttpCode.ERR_BAD_REQ, `Service "events" is unavailable.`);
        if (typeof (inpFields.eventId) === "number") {
            let req = {
                timelineId: id
            };
            await eventService.deleteEvent(inpFields.eventId, req, options);
            result = { result: "OK", id: id, eventId: inpFields.eventId };
        }
        else
            if (typeof (inpFields.periodId) === "number") {
                let req = {
                    timelineId: id
                };
                await eventService.deletePeriod(inpFields.periodId, req, options);
                result = { result: "OK", id: id, periodId: inpFields.periodId };
            }
            else
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing or invalid field "eventId" or "periodId".`);
        return result;
    }

    async addItem(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let timelineObj = null;
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this.getTimeline(id, options));
            })
                .then(async (timeline) => {
                    let is_event, expr;
                    if (typeof (inpFields.eventId) === "number") {
                        is_event = true;
                        expr = TL_ADD_EVENT;
                    }
                    else
                        if (typeof (inpFields.periodId) === "number") {
                            is_event = false;
                            expr = TL_ADD_PERIOD;
                        }
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing or invalid field "eventId" or "periodId".`);

                    let result = await this._getObjById(-1, expr, dbOpts);
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = {
                        TimelineId: timeline.Id,
                        EventId: is_event ? inpFields.eventId : undefined,
                        PeriodId: is_event ? undefined : inpFields.periodId
                    };

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    timelineObj = this._db.getObj(newHandler.newObject);
                    newId = newHandler.keyValue;
                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`${is_event ? "Event" : "Period"} item created: Id="${newId}".`));
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);

    }

    async addOrUpdateCommand(id, is_new, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let cmdObj = null;
        let cmdId = inpFields.Id;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this.getTimeline(id, options));
            })
                .then(async (timeline) => {

                    let event_list = {};
                    let period_list = {};
                    for (let i = 0; timeline.Events && (i < timeline.Events.length); i++)
                        event_list[timeline.Events[i].Id] = true;
                    for (let i = 0; timeline.Periods && (i < timeline.Periods.length); i++)
                        period_list[timeline.Periods[i].Id] = true;

                    let result = await this._getObjById(is_new ? -1 : cmdId, TL_ADD_COMMAND, dbOpts);
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    if (is_new) {
                        let newHandler = await root_obj.newObject({
                            fields: { TimelineId: timeline.Id }
                        }, dbOpts);
                        cmdObj = this._db.getObj(newHandler.newObject);
                        cmdId = newHandler.keyValue;
                    }
                    else {
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() !== 1)
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Команда (Id =${id}) не найдена.`);
                        cmdObj = collection.get(0);
                    }

                    if (typeof (inpFields.Code) === "string")
                        cmdObj.code(inpFields.Code)
                    else
                        if (is_new)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid or missing field "Code" value: ${inpFields.Code}.`);

                    if (typeof (inpFields.TimeCode) === "number")
                        cmdObj.timeCode(inpFields.TimeCode)
                    else
                        if (is_new)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid or missing field "TimeCode" value: ${inpFields.TimeCode}.`);

                    if (typeof (inpFields.Number) === "number")
                        cmdObj.number(inpFields.Number)
                    else
                        if (is_new)
                            cmdObj.number(0);

                    if (typeof (inpFields.Args) !== "undefined")
                        cmdObj.args(JSON.stringify(inpFields.Args));

                    if (inpFields.Events && (Array.isArray(inpFields.Events))) {
                        let event_root = cmdObj.getDataRoot("CommandEvent");
                        let collection = event_root.getCol("DataElements");
                        let obj_list = {};
                        for (let i = 0; i < collection.count(); i++){
                            let obj = collection.get(i);
                            obj_list[obj.number()] = obj;
                        }
                        for (let i = 0; i < inpFields.Events.length; i++) {
                            let elem = inpFields.Events[i];
                            if ((!(elem.EventId || elem.PeriodId)) || (elem.EventId && elem.PeriodId))
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid combination of "EventId" and "PeriodId" in line ${i}.`);
                            if (elem.EventId && (!event_list[elem.EventId]))
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Событие (Id=${elem.EventId}) не принадлежит таймлайну (Id=${id}).`);
                            if (elem.PeriodId && (!period_list[elem.PeriodId]))
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Период (Id=${elem.PeriodId}) не принадлежит таймлайну (Id=${id}).`);
                            if (typeof (elem.Number) !== "number")
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid "Number" in line ${i}.`);
                            let curr_obj = obj_list[elem.Number];
                            if (!curr_obj) {
                                await event_root.newObject({
                                    fields: { Number: elem.Number, EventId: elem.EventId, PeriodId: elem.PeriodId }
                                }, dbOpts);
                            }
                            else {
                                curr_obj.eventId(elem.EventId ? elem.EventId : null);
                                curr_obj.periodId(elem.PeriodId ? elem.PeriodId : null);
                                delete obj_list[elem.Number];
                            }
                        }
                        for (let key in obj_list)
                            collection._del(obj_list[key]);
                    }

                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Command ${is_new ? 'created' : 'updated'}: Id="${cmdId}".`));
                    return { result: "OK", id: cmdId };
                })
        }, memDbOptions);

    }

    async deleteCommand(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let cmdObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, TL_ADD_COMMAND, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Команда (Id =${id}) не найдена.`);

                    await root_obj.edit();
                    cmdObj = collection.get(0);
                    collection._del(cmdObj)

                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Command deleted: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);

    }
}

let timelineAPI = null;
exports.TimelineService = () => {
    return timelineAPI ? timelineAPI : timelineAPI = new TimelineAPI();
}
