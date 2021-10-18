'use strict';
const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../../database/db-object');
const { DbUtils } = require('../../database/db-utils');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { AccessFlags } = require('../../const/common');
const { ApplicationType, NotificationType,
    NotifDeliveryType, NotificationTopicType, AllowedNotifDelivery,
    NotificationMsgType, NotifRecipientType, NotifRecipientStatus, NotifCallStatus } = require('./const');
const { AccessRights } = require('../../security/access-rights');
const { getTimeStr, buildLogString } = require('../../utils');

const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const logModif = config.has("debug.notification.logModif") ? config.get("debug.notification.logModif") : false;

const GET_USER_DEVICES_MSSQL =
    "select [AppTypeId], [DevId], [Token] from [UserDevice] where [UserId] = <%= id %>";

const GET_USER_DEVICES_MYSQL =
    "select `AppTypeId`, `DevId`, `Token` from `UserDevice` where `UserId` = <%= id %>";

const GET_USER_ENDPOINTS_MSSQL =
    "select e.[Id], e.[AppTypeId], e.[DevId], e.[Token], e.[ActiveUserId], e.[Status], e.[ExtData]\n" +
    "from [NotifEndPoint] e\n" +
    "  join [EndPointUser] u on u.[EndPointId] = e.[Id]\n" +
    "where (u.[UserId] = <%= id %>)";

const GET_USER_ENDPOINTS_MYSQL =
    "select e.`Id`, e.`AppTypeId`, e.`DevId`, e.`Token`, e.`ActiveUserId`, e.`Status`, e.`ExtData`\n" +
    "from `NotifEndPoint` e\n" +
    "  join `EndPointUser` u on u.`EndPointId` = e.`Id`\n" +
    "where (u.`UserId` = <%= id %>)";

const GET_BOOKMARK_TOPICS_MSSQL =
    "select t.[Id], <%= tp %> TypeId, t.[Name], b.[CourseId] ObjId, t.[Status], t.[ExtData], cl.[Name] Description\n" +
    "from [Bookmark] b\n" +
    "  join [CourseLng] cl on  b.[CourseId] = cl.[CourseId]\n" +
    "  left join [NotificationTopic] t on b.[CourseId] = t.[ObjId] and t.[TypeId] = <%= tp %>\n" +
    "where (b.[UserId] = <%= id %>) and (not b.[CourseId] is null)";

const GET_BOOKMARK_TOPICS_MYSQL =
    "select t.`Id`, <%= tp %> TypeId, t.`Name`, b.`CourseId` ObjId, t.`Status`, t.`ExtData`, cl.`Name` Description\n" +
    "from `Bookmark` b\n" +
    "  join `CourseLng` cl on  b.`CourseId` = cl.`CourseId`\n" +
    "  left join `NotificationTopic` t on b.`CourseId` = t.`ObjId` and t.`TypeId` = <%= tp %>\n" +
    "where (b.`UserId` = <%= id %>) and (not b.`CourseId` is null)";

const GET_NEWCOURSE_TOPICS_MSSQL =
    "select t.[Id], t.[TypeId], t.[Name], t.[ObjId], t.[Status], t.[ExtData]\n" +
    "from [NotificationTopic] t\n" +
    "where t.[TypeId] = <%= tp %>";

const GET_NEWCOURSE_TOPICS_MYSQL =
    "select t.`Id`, t.`TypeId`, t.`Name`, t.`ObjId`, t.`Status`, t.`ExtData`\n" +
    "from `NotificationTopic` t\n" +
    "where t.`TypeId` = <%= tp %>";

const GET_TOPIC_BY_NAME_MSSQL =
    "select t.[Id], t.[TypeId], t.[Name], t.[ObjId], t.[Status], t.[ExtData]\n" +
    "from [NotificationTopic] t\n" +
    "where t.[Name] = '<%= name %>'";

const GET_TOPIC_BY_NAME_MYSQL =
    "select t.`Id`, t.`TypeId`, t.`Name`, t.`ObjId`, t.`Status`, t.`ExtData`\n" +
    "from `NotificationTopic` t\n" +
    "where t.`Name` = '<%= name %>'";

const GET_TOPIC_BY_COURSE_MSSQL =
    "select t.[Id] from [NotificationTopic] t where (t.[ObjId] = <%= id %>) and (t.[TypeId] = <%= tp %>)";

const GET_TOPIC_BY_COURSE_MYSQL =
    "select t.`Id` from `NotificationTopic` t where (t.`ObjId` = <%= id %>) and (t.`TypeId` = <%= tp %>)";

const GET_ALL_TOPICS_MSSQL =
    "select [Id], [TypeId], [Name], [ObjId], [Status], [ExtData] from [NotificationTopic]";

const GET_ALL_TOPICS_MYSQL =
    "select `Id`, `TypeId`, `Name`, `ObjId`, `Status`, `ExtData` from `NotificationTopic`";

const EP_CREATE = {
    expr: {
        model: {
            name: "NotifEndPoint",
            childs: [
                {
                    dataObject: {
                        name: "EndPointUser"
                    }
                }
            ]
        }
    }
};

const TOPIC_CREATE = {
    expr: {
        model: {
            name: "NotificationTopic"
        }
    }
};

const SUBS_CREATE = {
    expr: {
        model: {
            name: "NotifTopicSubscriber"
        }
    }
};

const MESSAGE_CREATE = {
    expr: {
        model: {
            name: "NotificationMessage",
            childs: [
                {
                    dataObject: {
                        name: "NotifMsgRecipient"
                    }
                }
            ]
        }
    }
};

const LOCK_KEY_PREFIX = "_lock:notif:uid:";
const LOCK_ENDPOINT_PREFIX = "_lock:endpoint:";
const UPDATE_NOTIF_TIMEOUT = 3 * 60 * 1000; // 3 min

const GET_DEVICE_MASK = 1;
const GET_END_POINT_MASK = 2;
const GET_ALL_MASK = GET_DEVICE_MASK + GET_END_POINT_MASK;

const NotificationAPI = class NotificationAPI extends DbObject {

    static #instance = null;
    static getInstance() {
        return NotificationAPI.#instance ? NotificationAPI.#instance : NotificationAPI.#instance = new NotificationAPI();
    }

    constructor(options) {
        super(options);
    }

    async _getUserDevices(user_id, options) {
        let opts = _.cloneDeep(options || {});
        let dbOpts = opts.dbOptions || {};
        let data_mask = opts.data_mask ? opts.data_mask : GET_ALL_MASK;
        let current_only = opts.current_only === true ? true : false;
        let array_out = opts.array_out === true ? true : false;
        let result = { devices: array_out ? [] : {}, endPoins: array_out ? [] : {} };
        let records;
        if (data_mask & GET_DEVICE_MASK) {
            records = await $data.execSql({
                dialect: {
                    mysql: _.template(GET_USER_DEVICES_MYSQL)({ id: user_id }),
                    mssql: _.template(GET_USER_DEVICES_MSSQL)({ id: user_id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                for (let i = 0; i < records.detail.length; i++) {
                    let elem = records.detail[i];
                    let out = {
                        AppTypeId: elem.AppTypeId,
                        DevId: elem.DevId,
                        Token: elem.Token
                    }
                    if (array_out)
                        result.devices.push(out)
                    else
                        result.devices[`${elem.AppTypeId}:${elem.DevId}`] = out;
                }
            }
        }
        if (data_mask & GET_END_POINT_MASK) {
            let mssql = GET_USER_ENDPOINTS_MSSQL + (current_only ? " and (e.[ActiveUserId] = <%= id %>)" : "");
            let mysql = GET_USER_ENDPOINTS_MYSQL + (current_only ? " and (e.`ActiveUserId` = <%= id %>)" : "");
            records = await $data.execSql({
                dialect: {
                    mysql: _.template(mysql)({ id: user_id }),
                    mssql: _.template(mssql)({ id: user_id })
                }
            }, dbOpts)
            if (records && records.detail && (records.detail.length > 0)) {
                for (let i = 0; i < records.detail.length; i++) {
                    let elem = records.detail[i];
                    let out = {
                        Id: elem.Id,
                        AppTypeId: elem.AppTypeId,
                        DevId: elem.DevId,
                        Token: elem.Token,
                        ActiveUserId: elem.ActiveUserId,
                        Status: elem.Status
                    }
                    if (elem.ExtData)
                        try { out.ExtData = JSON.parse(elem.ExtData) } catch (err) { out.ExtData == null }
                    if (array_out)
                        result.endPoins.push(out)
                    else
                        result.endPoins[`${elem.AppTypeId}:${elem.DevId}`] = out;
                }
            }
        }
        return result;
    }

    async _deleteDevice(user_id, dev_id, options) {
        let opts = _.cloneDeep(options || {});
        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});
    }

    async _onCreateEndpoint(epObj) { }

    async _createOrUpdateDevice(user_id, new_dev, old_dev, options) {
        let opts = _.cloneDeep(options || {});
        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});
        let root_obj = null;
        let epObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                let rc;
                if (old_dev)
                    rc = this._getObjById(old_dev.Id, EP_CREATE, dbOpts)
                else {
                    let conds = [
                        { field: "AppTypeId", op: "=", value: new_dev.AppTypeId },
                        { field: "DevId", op: "=", value: new_dev.DevId }
                    ]
                    rc = this._getObjects(EP_CREATE, conds);
                }
                resolve(rc);
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let is_new = false;
                    await root_obj.edit();

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() === 1)
                        epObj = collection.get(0)
                    else
                        if (collection.count() === 0) {
                            is_new = true;
                            let fields = { AppTypeId: new_dev.AppTypeId, DevId: new_dev.DevId, Status: NotifCallStatus.pending };
                            let { newObject } = await root_obj.newObject({ fields: fields }, dbOpts);
                            epObj = this._db.getObj(newObject);
                        }
                        else
                            throw new Error(`NotificationAPI::_createOrUpdateDevice:: Duplicate end point: (${new_dev.AppTypeId}:${new_dev.DevId})`);
                    
                    if (epObj.activeUserId() !== user_id) {
                        is_new = true;
                        epObj.activeUserId(user_id);
                        let root_usr = epObj.getDataRoot("EndPointUser");
                        let col_usr = root_usr.getCol("DataElements");
                        let is_found = false;
                        for (let i = 0; i < col_usr.count(); i++){
                            if (col_usr.get(i).userId() === user_id) {
                                is_found = true;
                                break;
                            }
                        }
                        if (!is_found)
                            await root_usr.newObject({ fields: { UserId: user_id } }, dbOpts);
                    }
                    if (epObj.token() !== new_dev.Token) {
                        epObj.token(new_dev.Token);
                    }

                    await this._onCreateEndpoint(epObj);

                    let res = {
                        isNew: is_new,
                        Id: epObj.id(),
                        AppTypeId: epObj.appTypeId(),
                        ActiveUserId: epObj.activeUserId(),
                        DevId: epObj.devId(),
                        Token: epObj.token(),
                        Status: epObj.status(),
                        ExtData: epObj.extData()
                    };
                    await root_obj.save(dbOpts);
                    return res;
                })
        }, memDbOptions);
    }

    async _onCreateTopic(topicObj) { }

    async _createTopic(topic, options) {
        let opts = _.cloneDeep(options || {});
        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});
        let root_obj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                let rc = this._getObjById(-1, TOPIC_CREATE, dbOpts)
                resolve(rc);
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let res = {};
                    await root_obj.edit();

                    let fields = { TypeId: topic.TypeId, Status: NotifCallStatus.pending };
                    switch (topic.TypeId) {
                        case NotificationTopicType.course:
                            fields.Name = `COURSE-${topic.ObjId}`;
                            fields.ObjId = topic.ObjId;
                            fields.ExtData = JSON.stringify({ description: topic.Description });
                            break;
                        case NotificationTopicType.newCourse:
                            fields.Name = `NEW-COURSE`;
                            break;
                        default:
                            throw new Error(`NotificationAPI::_createTopic:: Unknown topic type: ${topic.TypeId}.`);
                    }
                    let { newObject } = await root_obj.newObject({ fields: fields }, dbOpts);
                    let topicObj = this._db.getObj(newObject);
                    await this._onCreateTopic(topicObj)
                    res = {
                        Id: topicObj.id(),
                        TypeId: topicObj.typeId(),
                        Name: topicObj.name(),
                        ObjId: topicObj.objId(),
                        Status: topicObj.status(),
                        ExtData: topicObj.extData()
                    }
                    try {
                        await root_obj.save(dbOpts);
                    }
                    catch (err) {
                        let is_processed = false;
                        if (err.message) {
                            let parsed = res.message.match(/.*?duplicate.*?u_Idx_NotificationTopic_Name.*/ig);
                            if (parsed) {
                                let records = await $data.execSql({
                                    dialect: {
                                        mysql: _.template(GET_TOPIC_BY_NAME_MYSQL)({ name: fields.Name }),
                                        mssql: _.template(GET_TOPIC_BY_NAME_MSSQL)({ name: fields.Name })
                                    }
                                }, dbOpts)
                                if (records && records.detail && (records.detail.length === 1)) {
                                    is_processed = true;
                                    res = _.clone(records.detail[0]);
                                    if (res.ExtData)
                                        try { res.ExtData = JSON.parse(res.ExtData) } catch (err) { res.ExtData = null }
                                }
                            }
                        }
                        if (!is_processed)
                            throw err;
                    }
                    return res;
                })
        }, memDbOptions);
    }

    async _onDeleteSubscription(subsObj) { }

    async _onAddSubscription(topic, subsObj) { }
    
    async _updateSubscription(user_id, end_points, options) {
        let opts = _.cloneDeep(options || {});
        let course_id = typeof (opts.bookmark) === "number" ? opts.bookmark : null;
        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});
        let root_obj = null;

        let usersService = this.getService('users', true);
        if (usersService && (end_points.length > 0)) {
            let notif_info = await usersService.getNotifInfo(user_id);
            let topics = {};
            let new_topics = [];
            if (notif_info.bookmark && notif_info.bookmark.app) {
                let mssql = GET_BOOKMARK_TOPICS_MSSQL + (course_id ? ` and (b.[CourseId] = ${course_id})` : "");
                let mysql = GET_BOOKMARK_TOPICS_MYSQL + (course_id ? ` and (b.${'`'}CourseId${'`'} = ${course_id})` : "");
                let records = await $data.execSql({
                    dialect: {
                        mysql: _.template(mysql)({ id: user_id, tp: NotificationTopicType.course }),
                        mssql: _.template(mssql)({ id: user_id, tp: NotificationTopicType.course })
                    }
                }, dbOpts)
                if (records && records.detail && (records.detail.length > 0)) {
                    for (let i = 0; i < records.detail.length; i++) {
                        let topic = _.clone(records.detail[i]);
                        if (topic.ExtData)
                            try { topic.ExtData = JSON.parse(topic.ExtData) } catch (err) { topic.ExtData = null }
                        if (topic.Id)
                            topics[topic.Id] = topic
                        else
                            new_topics.push(topic);
                    }
                }
            }
            if ((!course_id) && notif_info.new && notif_info.new.app) {
                let records = await $data.execSql({
                    dialect: {
                        mysql: _.template(GET_NEWCOURSE_TOPICS_MYSQL)({ tp: NotificationTopicType.newCourse }),
                        mssql: _.template(GET_NEWCOURSE_TOPICS_MSSQL)({ tp: NotificationTopicType.newCourse })
                    }
                }, dbOpts)
                if (records && records.detail) {
                    let len = records.detail.length;
                    switch (len) {
                        case 0:
                            new_topics.push({ TypeId: NotificationTopicType.newCourse })
                            break;
                        case 1:
                            let topic = _.clone(records.detail[0]);
                            if (topic.ExtData)
                                try { topic.ExtData = JSON.parse(topic.ExtData) } catch (err) { topic.ExtData = null }
                            topics[topic.Id] = topic;
                            break;
                        default:
                            throw new Error(`NotificationAPI::_updateSubscription:: Duplicate topic of type: ${NotificationTopicType.newCourse}`);
                    }
                }
            }
            for (let i = 0; i < new_topics.length; i++) {
                let topic = await this._createTopic(new_topics[i], options);
                topics[topic.Id] = topic;
            }

            let course_topic_id = null;
            if (course_id) {
                for (let key in topics) {
                    let elem = topics[key];
                    if (elem.ObjId === course_id) {
                        course_topic_id = elem.Id;
                        break;
                    }
                }
                if (!course_topic_id) {
                    let records = await $data.execSql({
                        dialect: {
                            mysql: _.template(GET_TOPIC_BY_COURSE_MYSQL)({ id: course_id, tp: NotificationTopicType.course }),
                            mssql: _.template(GET_TOPIC_BY_COURSE_MSSQL)({ id: course_id, tp: NotificationTopicType.course })
                        }
                    }, dbOpts)
                    if (records && records.detail && (records.detail.length === 1))
                        course_topic_id = records.detail[0].Id;
                }
            }
            return Utils.editDataWrapper(() => {
                return new MemDbPromise(this._db, resolve => {
                    let ids = [];
                    for (let i = 0; i < end_points.length; i++)
                        ids.push(end_points[i].Id);
                    let conds = [
                        { field: "ObjId", op: "in", value: ids },
                        { field: "TypeId", op: "=", value: NotifDeliveryType.app }
                    ]
                    if (course_id)
                        conds.push({ field: "TopicId", op: "=", value: course_topic_id ? course_topic_id : -1 });
                    let rc = this._getObjects(SUBS_CREATE, conds);
                    resolve(rc);
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                        let subs_list = {};
                        await root_obj.edit();
                        let collection = root_obj.getCol("DataElements");
                        for (let i = 0; i < collection.count(); i++){
                            let subs = collection.get(i);
                            subs_list[`${subs.topicId()}:${subs.objId()}`] = subs;
                        }

                        for (let topic_key in topics) {
                            for (let i = 0; i < end_points.length; i++){
                                let topic = topics[topic_key];
                                let end_point = end_points[i];
                                let key = `${topic.Id}:${end_point.Id}`;
                                if (!subs_list[key]) {
                                    let fields = { TypeId: NotifDeliveryType.app, TopicId: topic.Id, ObjId: end_point.Id, Status: NotifCallStatus.pending };
                                    let { newObject } = await root_obj.newObject({ fields: fields }, dbOpts);
                                    await this._onAddSubscription(topic, end_point, this._db.getObj(newObject));
                                }
                                else
                                    delete subs_list[key];
                            }
                        }
                        for (let key in subs_list) {
                            let subsObj = subs_list[key];
                            await this._onDeleteSubscription(subsObj);
                            if (subsObj.status() === NotifCallStatus.ok)
                                collection._del(subsObj);
                        }

                        await root_obj.save(dbOpts);
                    })
            }, memDbOptions);
        }
    }

    async _lockKeys(keys, func) {
        let curr_idx = 0;
        let sorted_keys = keys.slice();
        sorted_keys.sort();
        let lockAllEndPoints = async () => {
            let result;
            if (curr_idx >= sorted_keys.length)
                result = await func()
            else
                result = await this._lock(sorted_keys[curr_idx++], lockAllEndPoints, UPDATE_NOTIF_TIMEOUT);
            return result;
        }
        return await lockAllEndPoints();
    }

    async _lockEndPoints(end_points, func) {
        let keys = [];
        for (let idx in end_points) {
            let elem = end_points[idx];
            let id = typeof (elem) === "number" ? elem : elem.Id;
            keys.push(`${LOCK_ENDPOINT_PREFIX}${id}`)
        }
        return await this._lockKeys(keys, func);
    }

    async updateNotifications(user_id, options) {
        let opts = _.cloneDeep(options || {});
        let is_new_only = opts.new_only === "true" || opts.new_only === true;
        return await this._lock(`${LOCK_KEY_PREFIX}${user_id}`, async () => {
            let { devices, endPoins } = await this._getUserDevices(user_id, options);
            let all_end_points = [];
            let new_end_points = [];
            for (let key in devices) {
                let dev = devices[key];
                let ep = endPoins[key];
                if ((!ep) || (ep.ActiveUserId !== user_id) || (ep.Token !== dev.Token))
                    ep = await this._createOrUpdateDevice(user_id, dev, ep, options);
                all_end_points.push(ep);
                if (ep.isNew)
                    new_end_points.push(ep);
                delete endPoins[key];
            }
            for (let key in endPoins)
                await this._deleteDevice(user_id, endPoins[key].DevId, options);

            let end_points = is_new_only ? new_end_points : all_end_points;
            let worker = async () => {
                await this._updateSubscription(user_id, end_points, options);
                return { result: "OK" };
            }
            return await this._lockEndPoints(end_points, worker);
        }, UPDATE_NOTIF_TIMEOUT);
    }

    async toggleBookmark(user_id, course_id, options) {
        return await this._lock(`${LOCK_KEY_PREFIX}${user_id}`, async () => {
            let opts = _.cloneDeep(options || {});
            opts.data_mask = GET_END_POINT_MASK;
            opts.current_only = true;
            opts.array_out = true;
            let { endPoins } = await this._getUserDevices(user_id, opts);
            let worker = async () => {
                let opts = _.cloneDeep(options || {});
                opts.bookmark = course_id;
                await this._updateSubscription(user_id, endPoins, opts);
                return { result: "OK" };
            }
            return await this._lockEndPoints(endPoins, worker);
        }, UPDATE_NOTIF_TIMEOUT);
    }

    async _getTopics(options) {
        let opts = _.cloneDeep(options || {});
        let dbOpts = opts.dbOptions || {};
        let result = {};
        let mssql = GET_ALL_TOPICS_MSSQL;
        let mysql = GET_ALL_TOPICS_MYSQL;
        if (Array.isArray(opts.ids)) {
            mssql += `\nwhere [Id] in (${opts.ids.join()})`;
            mysql += `\nwhere ${'`'}Id${'`'} in (${opts.ids.join()})`;
        }
        let records = await $data.execSql({
            dialect: {
                mysql: _.template(mysql)(),
                mssql: _.template(mssql)()
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            for (let i = 0; i < records.detail.length; i++) {
                let elem = _.clone(records.detail[i]);
                if (elem.ExtData)
                    try { elem.ExtData = JSON.parse(elem.ExtData) } catch (err) { elem.ExtData = null }
                result[elem.Id] = elem;
            }
        }
        return result;
    }

    async _onPublishMessage(message, recObj, recData) { }
    
    async sendNotification(data, options) {
        let inpData = _.cloneDeep(data || {});
        let opts = _.cloneDeep(options || {});
        let memDbOptions = { dbRoots: [] };
        let dbOpts = _.defaultsDeep({ userId: opts.user ? opts.user.Id : undefined }, opts.dbOptions || {});
        let root_obj = null;

        if (!inpData.recepients)
            throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing "recepients" field.`);

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                let rc = this._getObjById(-1, MESSAGE_CREATE, dbOpts)
                resolve(rc);
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = { Tag: inpData.Tag };
                    let msg_body;
                    switch (inpData.type) {
                        case "custom":
                            fields.Type = NotificationMsgType.custom;
                            if (!inpData.message)
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing "message" field.`);
                            msg_body = inpData.message;
                            break;
                        case "course":
                        case "lesson":
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Unsupported "type": "${inpData.type}".`);
                            break;
                        default:
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing or invalid "type" field: "${inpData.type}".`);
                    }

                    let { newObject } = await root_obj.newObject({ fields: fields }, dbOpts);
                    let msgObj = this._db.getObj(newObject);
                    
                    msgObj.body(typeof (msg_body) === "string" ? { default: msg_body } : msg_body);
                    await root_obj.save(dbOpts)

                    let sendToTopics = async (topic_list) => {
                        let reqOpts = _.cloneDeep(options || {});
                        if (Array.isArray(topic_list))
                            reqOpts.ids = topic_list
                        else
                            if (typeof (topic_list) === "number")
                                reqOpts.ids = [topic_list]
                            else
                                if (topic_list !== "all")
                                    throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid "recepients.topic" field: ${inpData.recepients.topic}.`);
                        let topics = await this._getTopics(reqOpts);
                        for (let key in topics) {
                            let topic = topics[key];
                            let root_rec = msgObj.getDataRoot("NotifMsgRecipient");
                            await root_rec.edit();
                            let curr_date = new Date();
                            let fields = {
                                Type: NotifRecipientType.topic,
                                Status: NotifRecipientStatus.ok,
                                ObjId: topic.Id,
                                StartedAt: curr_date,
                                FinishedAt: curr_date,
                                TrialNum: 1,
                                TriedAt: curr_date
                            }
                            let { newObject } = await root_rec.newObject({ fields: fields }, dbOpts);
                            let recObj = this._db.getObj(newObject);
                            await this._onPublishMessage(msgObj.body(), recObj, topic);
                            await root_rec.save(dbOpts)
                        }
                    }

                    for (let key in inpData.recepients) {
                        switch (key) {
                            case "topic":
                                await sendToTopics(inpData.recepients.topic);
                                break;
                            default:
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `Missing or invalid "type" field: ${inpData.type}.`);
                        }
                    }

                    return { result: "OK" };
                })
        }, memDbOptions);
    }

    async sendAutoNotifications(data, options) {
        let opts = _.cloneDeep(options || {});
        let inpData = _.cloneDeep(data || {});
        let start_date = new Date();
        if (inpData.startDate instanceof Date)
            start_date = inpData.startDate
        else
            if (typeof (inpData.startDate) === "string") {
                let ts = Date.parse(inpData.startDate);
                if (!Number.isNaN(ts))
                    start_date = new Date(ts);
            }
            else
                if (typeof (inpData.startDate) === "number")
                    start_date = new Date(inpData.startDate);
        start_date = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate());
    }
}

exports.NotificationService = NotificationAPI.getInstance;
exports.NotificationBase = NotificationAPI;
