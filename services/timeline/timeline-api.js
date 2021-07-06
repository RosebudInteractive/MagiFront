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

const SQL_PUBLISH_TL_MSSQL =
    "update [Event] set [State] = 2, [TlPublicId] = <%= id %> where ([State] = 1)\n" +
    "  and([SysParentId] in (select [EventId] from [TimelineEvent] where [TimelineId] = <%= id %>))";

const SQL_PUBLISH_TL_MYSQL =
    "update `Event` set `State` = 2, `TlPublicId` = <%= id %> where (`State` = 1)\n" +
    "  and(`SysParentId` in (select `EventId` from `TimelineEvent` where `TimelineId` = <%= id %>))";

const TL_CREATE = {
    expr: {
        model: {
            name: "Timeline"
        }
    }
};

const TimelineAPI = class TimelineAPI extends DbObject {

    constructor(options) {
        super(options);
        this._struct_cache = null;
    }

    async getTimelineList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_TL_LIST_MYSQL;
        let sql_mssql = SQL_GET_TL_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        let is_detailed = (opts.isDetailed === "true") || (opts.isDetailed === true);
        let mysql_ext_fields = opts.isDetailed ? SQL_GET_TL_EXT_FLD_MYSQL : "";
        let mssql_ext_fields = opts.isDetailed ? SQL_GET_TL_EXT_FLD_MSSQL : "";

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
        if (opts.Order) {
            let order = +opts.Order;
            if ((typeof (order) === "number") && (!isNaN(order))) {
                mssql_conds.push(`(t.[Order] = ${opts.Order})`);
                mysql_conds.push(`(t.${'`'}Order${'`'} = ${opts.Order})`);
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
            records.detail.forEach(elem => {
                let timeline = {
                    Id: elem.Id,
                    Name: elem.Name,
                    SpecifCode: elem.SpecifCode,
                    State: elem.State,
                    Order: elem.Order,
                    TimeCr: elem.TimeCr,
                    HasScript: elem.TimelineId ? true : false,
                    TypeOfUse: elem.CourseId ? 1 : 2,
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
                result.push(timeline);
            });
        }
        return result;
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

        result.Events = [];
        result.Periods = [];

        let eventService = this.getService("events", true);
        if (eventService) {
            let eopts = {
                user: opts.user,
                TimelineId: result.Id,
                SortOrder: "Date",
                dbOptions: opts.dbOptions ? opts.dbOptions : undefined
            };
            result.Events = await eventService.getEventList(eopts);
        }
        return result;
    }

    async newTimeline(data, options) {
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
                resolve(this._getObjById(-1, TL_CREATE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = { State: TimelineState.Draft }; // State = Draft

                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        throw new Error(`Missing field "Name"`);

                    if (typeof (inpFields.State) === "number") {
                        let valid_states = {};
                        for (let key in TimelineState)
                            valid_states[TimelineState[key]] = true;
                        if(valid_states[inpFields.State])
                            fields.State = inpFields.State
                        else
                            throw new Error(`Invalid value of field "State": ${inpFields.State}.`);
                    }

                    if (typeof (inpFields.SpecifCode) !== "undefined")
                        fields.SpecifCode = inpFields.SpecifCode

                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description

                    if (typeof (inpFields.Image) !== "undefined")
                        fields.Image = inpFields.Image

                    if (typeof (inpFields.ImageMeta) !== "undefined")
                        if (typeof (inpFields.ImageMeta) === "string")
                            fields.ImageMeta = inpFields.ImageMeta
                        else
                            fields.ImageMeta = JSON.stringify(inpFields.ImageMeta)

                    if (typeof (inpFields.Options) !== "undefined")
                        if (typeof (inpFields.Options) === "string")
                            fields.Options = inpFields.Options
                        else
                            fields.Options = JSON.stringify(inpFields.Options)

                    if (typeof (inpFields.ProcessId) === "number")
                        fields.ProcessId = inpFields.ProcessId

                    if (typeof (inpFields.Order) === "number")
                        fields.Order = inpFields.Order

                    if (typeof (inpFields.CourseId) === "number")
                        fields.CourseId = inpFields.CourseId

                    if (typeof (inpFields.LessonId) === "number")
                        fields.LessonId = inpFields.LessonId

                    if ((fields.CourseId && fields.LessonId) || ((!fields.CourseId) && (!fields.LessonId)))
                        throw new Error(`Inconsistent combination of "CourseId" and "LessonId" fields.`);

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    timelineObj = this._db.getObj(newHandler.newObject);
                    newId = newHandler.keyValue;
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
                            throw new Error(`Invalid value of field "State": ${inpFields.State}.`);
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
                        throw new Error(`Inconsistent combination of "CourseId" and "LessonId" fields.`);

                    if ((old_state === TimelineState.Draft) && (timelineObj.state() === TimelineState.Published)) {
                        let tran = await $data.tranStart(dbOpts);
                        let transactionId = tran.transactionId;
                        dbOpts.transactionId = tran.transactionId;
                        try {
                            await timelineObj.save(dbOpts);
                            await $data.execSql({
                                dialect: {
                                    mysql: _.template(SQL_PUBLISH_TL_MYSQL)({ id: timelineObj.id() }),
                                    mssql: _.template(SQL_PUBLISH_TL_MSSQL)({ id: timelineObj.id() })
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
}

let timelineAPI = null;
exports.TimelineService = () => {
    return timelineAPI ? timelineAPI : timelineAPI = new TimelineAPI();
}
