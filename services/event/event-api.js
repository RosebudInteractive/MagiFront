'use strict';
const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../../database/db-object');
const { DbUtils } = require('../../database/db-utils');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { AccessFlags } = require('../../const/common');
const { EntityType, LANGUAGE_ID } = require('../../const/sql-req-common');
const { AccessRights } = require('../../security/access-rights');
const { getTimeStr, buildLogString } = require('../../utils');
const { EventState, EventStateStr } = require('./const');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const DataObject = require(UCCELLO_CONFIG.uccelloPath + 'dataman/data-object');

const logModif = config.has("debug.event.logModif") ? config.get("debug.event.logModif") : false;

const SQL_GET_EVENT_LIST_MSSQL =
    "select e.[SysParentId] as[Id], e.[Name], e.[ShortName], e.[Description], e.[Date], e.[Month], e.[Year],\n" +
    "  e.[State], e.[TlCreationId], tcr.[Name] as [TlCrName], e.[TlPublicId], tpb.[Name] as [TlPubName]\n" +
    "from [Entity] et\n" +
    "  join [Event] e on e.[SysParentId] = et.[Id]\n" +
    "  left join [TimelineEvent] te on te.[EventId] = e.[SysParentId]\n" +
    "  left join [Timeline] tcr on tcr.[Id] = e.[TlCreationId]\n" +
    "  left join [Timeline] tpb on tpb.[Id] = e.[TlPublicId]";

const SQL_GET_EVENT_LIST_MYSQL =
    "select e.`SysParentId` as`Id`, e.`Name`, e.`ShortName`, e.`Description`, e.`Date`, e.`Month`, e.`Year`,\n" +
    "  e.`State`, e.`TlCreationId`, tcr.`Name` as `TlCrName`, e.`TlPublicId`, tpb.`Name` as `TlPubName`\n" +
    "from `Entity` et\n" +
    "  join `Event` e on e.`SysParentId` = et.`Id`\n" +
    "  left join `TimelineEvent` te on te.`EventId` = e.`SysParentId`\n" +
    "  left join `Timeline` tcr on tcr.`Id` = e.`TlCreationId`\n" +
    "  left join `Timeline` tpb on tpb.`Id` = e.`TlPublicId`";

const EVENT_DELETE = {
    expr: {
        model: {
            name: "Event",
            childs: [
                {
                    dataObject: {
                        name: "TimelineEvent"
                    }
                }
            ]
        }
    }
};

const EVENT_CREATE = {
    expr: {
        model: {
            name: "Event",
            childs: [
                {
                    dataObject: {
                        name: "EntityLng"
                    }
                },
                {
                    dataObject: {
                        name: "TimelineEvent"
                    }
                }
            ]
        }
    }
};

const EVENT_MODIFY = {
    expr: {
        model: {
            name: "Event",
            childs: [
                {
                    dataObject: {
                        name: "EntityLng"
                    }
                }
            ]
        }
    }
};

const EventApi = class EventApi extends DbObject {

    constructor(options) {
        super(options);
        this._struct_cache = null;
    }

    async getEventList(options) {
        let result = [];
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});

        let sql_mysql = SQL_GET_EVENT_LIST_MYSQL;
        let sql_mssql = SQL_GET_EVENT_LIST_MSSQL;

        let mssql_conds = [];
        let mysql_conds = [];

        if (opts.State) {
            let states = Array.isArray(opts.State) ? opts.State : opts.State.split(',');
            mssql_conds.push(`(e.[State] in (${states.join(',')}))`);
            mysql_conds.push(`(e.${'`'}State${'`'} in (${states.join(',')}))`);
        }
        if (opts.Name) {
            mssql_conds.push(`(e.[Name] like N'%${opts.Name}%')`);
            mysql_conds.push(`(e.${'`'}Name${'`'} like '%${opts.Name}%')`);
        }
        if (opts.Date) {
            let date;
            switch (typeof (opts.Date)) {
                case "string":
                    date = new Date(opts.Date);
                    break;
                default:
                    if (opts.Date instanceof Date)
                        date = opts.Date;
            }
            if (typeof (date) !== "undefined") {
                let date_str = this._dateToString(date, false, false);
                mssql_conds.push(`(e.[Date] = convert(datetime, '${date_str}'))`);
                mysql_conds.push(`(e.${'`'}Date${'`'} = '${date_str}')`);
            }
        }
        if (opts.Year) {
            let year = +opts.Year;
            if ((typeof (year) === "number") && (!isNaN(year))) {
                mssql_conds.push(`(year(e.[EffDate]) = ${opts.Year})`);
                mysql_conds.push(`(year(e.${'`'}EffDate${'`'}) = ${opts.Year})`);
            }
        }
        if (opts.TimelineId) {
            let id = +opts.TimelineId;
            if ((typeof (id) === "number") && (!isNaN(id))) {
                mssql_conds.push(`(te.[TimelineId] = ${opts.TimelineId})`);
                mysql_conds.push(`(te.${'`'}TimelineId${'`'} = ${opts.TimelineId})`);
            }
        }
        if (opts.Id) {
            let id = +opts.Id;
            if ((typeof (id) === "number") && (!isNaN(id))) {
                mssql_conds.push(`(et.[Id] = ${opts.Id})`);
                mysql_conds.push(`(et.${'`'}Id${'`'} = ${opts.Id})`);
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
                    mssql_field = "et.[TimeCr]";
                    mysql_field = "et.`TimeCr`";
                    break;
                case "Name":
                    mssql_field = "e.[Name]";
                    mysql_field = "e.`Name`";
                    break;
                case "ShortName":
                    mssql_field = "e.[ShortName]";
                    mysql_field = "e.`ShortName`";
                    break;
                case "State":
                    mssql_field = "e.[State]";
                    mysql_field = "e.`State`";
                    break;
                case "Date":
                    mssql_field = "e.[EffDate]";
                    mysql_field = "e.`EffDate`";
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
                let timeline = {
                    Id: elem.Id,
                    Name: elem.Name,
                    ShortName: elem.ShortName,
                    Description: elem.Description,
                    State: elem.State,
                    Date: elem.Date,
                    Month: elem.Month,
                    Year: elem.Year,
                    TlCreation: elem.TlCreationId ? {
                        Id: elem.TlCreationId,
                        Name: elem.TlCrName
                    } : undefined,
                    TlPublic: elem.TlPublicId ? {
                        Id: elem.TlPublicId,
                        Name: elem.TlPubName
                    } : undefined
                };
                result.push(timeline);
            });
        }

        return result;
    }

    async getEvent(id, options) {
        let opts = _.cloneDeep(options || {});
        opts.Id = id;
        let result = await this.getEventList(opts);
        if (result && Array.isArray(result) && (result.length === 1))
            result = result[0]
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Событие (Id =${id}) не найдено.`);
        return result;
    }

    _prepareDateField(inp, out, dsc) {
        let _dsc = dsc ? dsc : {
            EffDate: "EffDate",
            Date: "Date",
            Month: "Month",
            Year: "Year"
        };
        let setOut = (field, val) => {
            if (out instanceof DataObject)
                out[this._genGetterName(field)](val)
            else
                out[field] = val;
        };
        let getOut = (field) => {
            let res;
            if (out instanceof DataObject)
                res = out[this._genGetterName(field)]()
            else
                res = out[field];
            return res;
        };
        setOut(_dsc.EffDate, null);
        setOut(_dsc.Date, null);
        setOut(_dsc.Month, null);
        setOut(_dsc.Year, null);
        if (inp[_dsc.Date]) {
            if (inp[_dsc.Date] instanceof Date)
                setOut(_dsc.EffDate, inp[_dsc.Date])
            else
                if (typeof (inp[_dsc.Date]) === "string")
                    setOut(_dsc.EffDate, new Date(inp[_dsc.Date]));
            setOut(_dsc.Date, getOut(_dsc.EffDate));
        }
        else
        {
            let month = inp[_dsc.Month];
            if ((month !== null) && (typeof (month) !== "undefined")) {
                if (typeof (month) === "number") {
                    if ((month >= 1) && (month < 12))
                        setOut(_dsc.Month, inp[_dsc.Month])
                    else
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid value of field "${_dsc.Month}": ${inp[_dsc.Month]}.`);
                    month--;
                }
                else
                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid type of field "${_dsc.Month}": ${typeof (month)}.`);
            }
            else
                month = 0;
            let year = inp[_dsc.Year];
            if ((year !== null) && (typeof (year) !== "undefined")) {
                if (typeof (year) === "number")
                    setOut(_dsc.Year, inp[_dsc.Year])
                else
                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid type of field "${_dsc.Year}": ${typeof (year)}.`);
                setOut(_dsc.EffDate, new Date(year, month));
            }
            else
                if (getOut(_dsc.Month) !== null)
                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing field "${_dsc.Year}".`);
        }
        return getOut(_dsc.EffDate);
    }

    async newEvent(data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let eventObj = null;
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, EVENT_CREATE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = { EntityTypeId: EntityType.Event, State: EventState.Draft }; // State = Draft

                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing field "Name"`);

                    if (typeof (inpFields.State) === "number") {
                        let valid_states = {};
                        for (let key in EventState)
                            valid_states[EventState[key]] = true;
                        if(valid_states[inpFields.State])
                            fields.State = inpFields.State
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid value of field "State": ${inpFields.State}.`);
                    }

                    let eff_date = this._prepareDateField(inpFields, fields)
                    if(!eff_date)
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing event date.`);

                    if (typeof (inpFields.ShortName) !== "undefined")
                        fields.ShortName = inpFields.ShortName

                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description

                    if (typeof (inpFields.TlCreationId) === "number")
                        fields.TlCreationId = inpFields.TlCreationId

                    if (typeof (inpFields.TlPublicId) === "number")
                        fields.TlPublicId = inpFields.TlPublicId

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    eventObj = this._db.getObj(newHandler.newObject);
                    newId = newHandler.keyValue;

                    let lng_root = eventObj.getDataRoot("EntityLng");
                    await lng_root.newObject({
                        fields: {
                            LanguageId: LANGUAGE_ID,
                            Name: eventObj.name()
                        }
                    }, dbOpts);

                    let tl_root = eventObj.getDataRoot("TimelineEvent");
                    if (eventObj.tlCreationId())
                        await tl_root.newObject({
                            fields: {
                                TimelineId: eventObj.tlCreationId()
                            }
                        }, dbOpts);

                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Event created: Id="${newId}".`));
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);

    }

    async updateEvent(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let eventObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, EVENT_MODIFY, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Событие (Id =${id}) не найдено.`);
                    eventObj = collection.get(0);

                    await eventObj.edit();

                    if (typeof (inpFields.State) === "number") {
                        let valid_states = {};
                        for (let key in EventState)
                            valid_states[EventState[key]] = true;
                        if (valid_states[inpFields.State])
                            eventObj.state(inpFields.State)
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid value of field "State": ${inpFields.State}.`);
                    }

                    let eff_date = this._prepareDateField(inpFields, eventObj)
                    if (!eff_date)
                        throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing event date.`);

                    if (typeof (inpFields.ShortName) !== "undefined")
                        eventObj.shortName(inpFields.ShortName)

                    if (typeof (inpFields.Description) !== "undefined")
                        eventObj.description(inpFields.Description)

                    if (typeof (inpFields.TlCreationId) === "number")
                        eventObj.tlCreationId(inpFields.TlCreationId)

                    if (typeof (inpFields.TlPublicId) === "number")
                        eventObj.tlPublicId(inpFields.TlPublicId)

                    let lng_root = eventObj.getDataRoot("EntityLng");
                    collection = lng_root.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new Error(`EventApi::updateEvent: Inconsistent "LNG" part of EVENT Id="${id}".`);
                    let eventLngObj = collection.get(0);
                    if (typeof (inpFields.Name) !== "undefined") {
                        eventObj.name(inpFields.Name)
                        eventLngObj.name(inpFields.Name)
                    }

                    await eventObj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Event updated: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);

    }

    async deleteEvent(id, data, options) {
        let opts = _.cloneDeep(options || {});
        opts.user = await this._checkPermissions(AccessFlags.PmAdmin, opts);

        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user.Id }, opts.dbOptions || {});
        let root_obj = null;
        let inpFields = data || {};
        let eventObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, EVENT_DELETE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Событие (Id =${id}) не найдено.`);
                    eventObj = collection.get(0);

                    await root_obj.edit();

                    let tl_root = eventObj.getDataRoot("TimelineEvent");
                    let col_tl = tl_root.getCol("DataElements");
                    let timelineId = inpFields.timelineId;
                    let deleted_from_timeline = false;
                    if (timelineId) {
                        for (let i = 0; i < col_tl.count(); i++) {
                            let obj = col_tl.get(i);
                            if (obj.timelineId() === timelineId) {
                                if ((eventObj.state() === EventState.Draft) && (col_tl.count() === 1))
                                    collection._del(eventObj)
                                else {
                                    col_tl._del(obj);
                                    deleted_from_timeline = true;
                                }
                                break;
                            }
                        }
                        if (!deleted_from_timeline)
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Событие ${id} не найдено в таймлайне ${timelineId}.`);
                    }
                    else
                        if (col_tl.count() === 0)
                            collection._del(eventObj)
                        else
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Событие используется в других таймлайнах.`);

                    await root_obj.save(dbOpts);

                    if (logModif)
                        console.log(buildLogString(`Event deleted ${deleted_from_timeline ? 'from timeline ' + timelineId : ''}: Id="${id}".`));
                    return { result: "OK", id: id };
                })
        }, memDbOptions);

    }
}

let eventApi = null;
exports.EventService = () => {
    return eventApi ? eventApi : eventApi = new EventApi();
}
