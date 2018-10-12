const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { ACCOUNT_ID } = require('../const/sql-req-common');
const _ = require('lodash');
let { LessonsService } = require('./db-lesson');

const LESSON_REQ_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "EpisodeLesson"
                    }
                }
            ]
        }
    }
};

const ALL_LESSONS_REQ_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "LessonLng"
                    }
                }
            ]
        }
    }
};

const EPISODE_REQ_TREE = {
    expr: {
        model: {
            name: "Episode",
            childs: [
                {
                    dataObject: {
                        name: "EpisodeLng",
                    }
                }
            ]
        }
    }
};

const EPISODE_TOC_TREE = {
    expr: {
        model: {
            name: "EpisodeToc",
            childs: [
                {
                    dataObject: {
                        name: "EpisodeTocLng",
                    }
                }
            ]
        }
    }
};

const EPISODE_CONTENT_TREE = {
    expr: {
        model: {
            name: "EpisodeContent"
        }
    }
};

const EPISODE_INS_TREE = {
    expr: {
        model: {
            name: "Episode",
            childs: [
                {
                    dataObject: {
                        name: "EpisodeLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "EpisodeContent",
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "EpisodeToc",
                        childs: [
                            {
                                dataObject: {
                                    name: "EpisodeTocLng",
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
};

const EPISODE_MSSQL_ID_REQ =
    "select e.[Id], el.[Name], els.[Number], el.[Audio], el.[AudioMeta], el.[State], e.[EpisodeType], els.[Supp], el.[Transcript], el.[Structure] from [Episode] e\n" +
    "  join [EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
    "  join [EpisodeLesson] els on e.[Id] = els.[EpisodeId]\n" +
    "where e.[Id] = <%= id %> and els.[LessonId] = <%= lessonId %>";
const EPISODE_MSSQL_TOC_REQ =
    "select t.[Id], t.[Number], l.[Topic], l.[StartTime] from [EpisodeToc] t\n" +
    "  join[EpisodeTocLng] l on l.[EpisodeTocId] = t.[Id]\n" +
    "  join[Episode] e on e.[Id] = t.[EpisodeId]\n" +
    "where e.[Id] = <%= id %>\n" +
    "order by t.[Number]";
const EPISODE_MSSQL_CONT_REQ =
    "select t.[Id], t.[ResourceId], r.[ResType], r.[FileName],\n" +
    "  t.[CompType], t.[StartTime], t.[Duration], t.[Content] from [EpisodeContent] t\n" +
    "  join[EpisodeLng] l on l.[Id] = t.[EpisodeLngId]\n" +
    "  join[Episode] e on e.[Id] = l.[EpisodeId]\n" +
    "  join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "  join[ResourceLng] rl on rl.[ResourceId] = r.[Id]\n" +
    "where e.[Id] = <%= id %>\n" +
    "order by t.[StartTime]";

const EPISODE_MYSQL_ID_REQ =
    "select e.`Id`, el.`Name`, els.`Number`, el.`Audio`, el.`AudioMeta`, el.`State`, e.`EpisodeType`, els.`Supp`, el.`Transcript`, el.`Structure` from `Episode` e\n" +
    "  join `EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
    "  join `EpisodeLesson` els on e.`Id` = els.`EpisodeId`\n" +
    "where e.`Id` = <%= id %> and els.`LessonId` = <%= lessonId %>";
const EPISODE_MYSQL_TOC_REQ =
    "select t.`Id`, t.`Number`, l.`Topic`, l.`StartTime` from `EpisodeToc` t\n" +
    "  join`EpisodeTocLng` l on l.`EpisodeTocId` = t.`Id`\n" +
    "  join`Episode` e on e.`Id` = t.`EpisodeId`\n" +
    "where e.`Id` = <%= id %>\n" +
    "order by t.`Number`";
const EPISODE_MYSQL_CONT_REQ =
    "select t.`Id`, t.`ResourceId`, r.`ResType`, r.`FileName`,\n" +
    "  t.`CompType`, t.`StartTime`, t.`Duration`, t.`Content` from `EpisodeContent` t\n" +
    "  join`EpisodeLng` l on l.`Id` = t.`EpisodeLngId`\n" +
    "  join`Episode` e on e.`Id` = l.`EpisodeId`\n" +
    "  join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "  join`ResourceLng` rl on rl.`ResourceId` = r.`Id`\n" +
    "where e.`Id` = <%= id %>\n" +
    "order by t.`StartTime`";

const EPISODE_MSSQL_DELETE_SCRIPT =
    [
        "delete ec from [Episode] e\n" +
        "  join [EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
        "  join [EpisodeContent] ec on el.[Id] = ec.[EpisodeLngId]\n" +
        "where e.[Id] = <%= id %>",
    ];

const EPISODE_MYSQL_DELETE_SCRIPT =
    [
        "delete ec from `Episode` e\n" +
        "  join `EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
        "  join `EpisodeContent` ec on el.`Id` = ec.`EpisodeLngId`\n" +
        "where e.`Id` = <%= id %>",
    ];

const EPISODE_MSSQL_LESSONS =
    "select distinct [LessonId] from [EpisodeLesson]\n" +
    "where[EpisodeId] = <%= id %>";

const EPISODE_MYSQL_LESSONS =
    "select distinct `LessonId` from `EpisodeLesson`\n" +
    "where`EpisodeId` = <%= id %>";

const GET_LESSON_LANG_MSSQL =
    "select l.[LanguageId] from [Lesson] c\n" +
    "  join [LessonLng] l on l.[LessonId] = c.[Id]\n" +
    "where c.[Id] = <%= lessonId %>";

const GET_LESSON_LANG_MYSQL =
    "select l.`LanguageId` from `Lesson` c\n" +
    "  join `LessonLng` l on l.`LessonId` = c.`Id`\n" +
    "where c.`Id` = <%= lessonId %>";

const DbEpisode = class DbEpisode extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || EPISODE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    get(id, lesson_id) {
        let episode = {};
        let isNotFound = true;
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(EPISODE_MYSQL_ID_REQ)({ id: id, lessonId: lesson_id }),
                        mssql: _.template(EPISODE_MSSQL_ID_REQ)({ id: id, lessonId: lesson_id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            episode = result.detail[0];
                            if (typeof (episode.Supp) === "number")
                                episode.Supp = episode.Supp === 0 ? false : true;
                            isNotFound = false;
                            if (!isNotFound)
                                return $data.execSql({
                                    dialect: {
                                        mysql: _.template(EPISODE_MYSQL_TOC_REQ)({ id: id }),
                                        mssql: _.template(EPISODE_MSSQL_TOC_REQ)({ id: id })
                                    }
                                }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let toc = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                toc = result.detail;
                            }
                            episode.Toc = toc;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(EPISODE_MYSQL_CONT_REQ)({ id: id }),
                                    mssql: _.template(EPISODE_MSSQL_CONT_REQ)({ id: id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let content = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                content = result.detail;
                            }
                            episode.Content = content;
                        }
                        return episode;
                    })
           );
        })
    }

    _updateLessonDuration(episode_id, duration_delta, options) {
        return new Promise((resolve) => {
            let res;
            let root_obj;
            let collection;
            if (duration_delta !== 0) { //EPISODE_MSSQL_LESSONS
                res = $data.execSql(
                    {
                        dialect: {
                            mysql: _.template(EPISODE_MYSQL_LESSONS)({ id: episode_id }),
                            mssql: _.template(EPISODE_MSSQL_LESSONS)({ id: episode_id })
                        }
                    }, options)
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let ids = [];
                            result.detail.forEach((elem) => ids.push(elem.LessonId));
                            return this._getObjects(ALL_LESSONS_REQ_TREE, { field: "Id", op: "in", value: ids }, options);
                        }
                    })
                    .then((result) => {
                        if (result) {
                            root_obj = result;
                            collection = root_obj.getCol("DataElements");
                            return root_obj.edit();
                        }
                    })
                    .then(() => {
                        if (collection) {
                            for (let i = 0; i < collection.count(); i++) {
                                let lng_col = collection.get(i).getDataRoot("LessonLng").getCol("DataElements");
                                if (lng_col.count() != 1)
                                    throw new Error("Lesson (Id = " + lesson_col.get(0).id() + ") has inconsistent \"LNG\" part.");
                                let lesson_lng_obj = lng_col.get(0);
                                let duration = lesson_lng_obj.duration() + duration_delta;
                                lesson_lng_obj.duration(duration);
                                lesson_lng_obj.durationFmt(DbUtils.fmtDuration(duration));
                            }
                            return root_obj.save(options);
                        }
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr) {
                            throw res;
                        }
                        return res;
                    });
            }
            resolve(res);
        });
    }

    del(id, lesson_id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let newId = null;
            let collection = null;
            let lesson_obj = null;
            let ep_lesson_collection = null;
            let ep_lesson_obj = null;
            let episode_number;
            let isSupp;

            let hasDeleted = false;
            let transactionId = null;
            let duration = 0;

            resolve(
                this._getObjById(lesson_id, LESSON_REQ_TREE)
                    .then((result) => {
                        ep_lesson_collection = result.getCol("DataElements");
                        if (ep_lesson_collection.count() != 1)
                            throw new Error("Lesson (Id = " + lesson_id + ") doesn't exist.");
                        lesson_obj = ep_lesson_collection.get(0);
                        ep_lesson_collection = lesson_obj.getDataRoot("EpisodeLesson").getCol("DataElements");
                        for (let i = 0; i < ep_lesson_collection.count(); i++) {
                            if (ep_lesson_collection.get(i).episodeId() === id) {
                                ep_lesson_obj = ep_lesson_collection.get(i);
                                episode_number = ep_lesson_obj.number();
                                isSupp = ep_lesson_obj.supp();
                                break;
                            }
                        }
                        if (!ep_lesson_obj)
                            throw new Error("Episode (Id = " + id + ") doesn't belong to lesson (Id = " + lesson_id + ").");

                        return lesson_obj.edit()
                            .then(() => {
                                return this._getObjById(id, {
                                    expr: {
                                        model: {
                                            name: "Episode",
                                            childs: [
                                                {
                                                    dataObject: {
                                                        name: "EpisodeLng",
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                });
                            })
                    })
                    .then((result) => {
                        root_obj = result;
                        collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Episode (Id = " + id + ") doesn't exist.");

                        let lng_collection = collection.get(0).getDataRoot("EpisodeLng").getCol("DataElements");
                        if (lng_collection.count() != 1)
                            throw new Error("Episode (Id = " + id + ") has inconsistent \"LNG\" part.");
                        
                        duration = lng_collection.get(0).duration();
                        duration = typeof (duration) === "number" ? duration : 0;

                        return result.edit()
                    })
                    .then(() => {
                        let episode_obj = collection.get(0);
                        if (episode_obj.lessonId() === lesson_id) {
                            // We need to remove whole episode here    
                            collection._del(episode_obj);
                            hasDeleted = true;
                        }

                        // Removing episode reference from lesson
                        ep_lesson_collection._del(ep_lesson_obj);
                        for (let i = 0; i < ep_lesson_collection.count(); i++) {
                            let ep = ep_lesson_collection.get(i);
                            if ((ep.supp() === isSupp) && (ep.number() > episode_number))
                                ep.number(ep.number() - 1);
                        }

                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                                return this._updateLessonDuration(id, 0 - duration, opts)
                                    .then(() => {
                                        return lesson_obj.save(opts);
                                    });
                            })
                            .then(() => {
                                if (hasDeleted) {
                                    let mysql_script = [];
                                    EPISODE_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                        mysql_script.push(_.template(elem)({ id: id }));
                                    });
                                    let mssql_script = [];
                                    EPISODE_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                        mssql_script.push(_.template(elem)({ id: id }));
                                    });
                                    return DbUtils.execSqlScript(mysql_script, mssql_script, opts)
                                        .then(() => {
                                            return root_obj.save(opts);
                                        });
                                }
                            });
                   })
                    .then(() => {
                        console.log("Episode deleted: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (lesson_obj)
                            this._db._deleteRoot(lesson_obj.getRoot());
                        if (isErr) {
                            result = result.then(() => {
                                throw res;
                            });
                        }
                        else
                            result = result.then(() => { return res; })
                        return result;
                    })
                    .then((result) => {
                        return LessonsService().prerender(lesson_id)
                            .then(() => result);
                    })
            );
        })
    }

    update(id, lesson_id, data, options) {
        return new Promise((resolve, reject) => {
            let epi_obj;
            let epi_lng_obj;
            let opts = options || {};

            let root_toc = null;
            let toc_collection;
            let toc_list = {};
            let toc_new = [];

            let root_content = null;
            let content_collection;
            let content_list = {};
            let content_new = [];

            let inpFields = data || {};
            
            let transactionId = null;
            let durationDelta = 0;
            let languageId;

            let isModified = false;

            resolve(
                this._getObjById(id)
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Episode (Id = " + id + ") doesn't exist.");
                        epi_obj = collection.get(0);

                        collection = epi_obj.getDataRoot("EpisodeLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Episode (Id = " + id + ") has inconsistent \"LNG\" part.");
                        epi_lng_obj = collection.get(0);
                        languageId = epi_lng_obj.languageId();

                        return epi_obj.edit()
                    })
                    .then(() => {
                        if (inpFields.Toc && (typeof (inpFields.Toc.length) === "number")) {
                            let episode_id = epi_obj.id();
                            return this._getObjects(EPISODE_TOC_TREE, { field: "EpisodeId", op: "=", value: episode_id })
                                .then((result) => {
                                    root_toc = result;
                                    toc_collection = root_toc.getCol("DataElements");
                                    for (let i = 0; i < toc_collection.count(); i++) {
                                        let obj = toc_collection.get(i);
                                        let collection = obj.getDataRoot("EpisodeTocLng").getCol("DataElements");
                                        if (collection.count() != 1)
                                            throw new Error("Toc element (Id = " + obj.id() + ") has inconsistent \"LNG\" part.");
                                        let lng_obj = collection.get(0);
                                        toc_list[obj.id()] = { deleted: true, obj: obj, lngObj: lng_obj };
                                    }

                                    let Number = 1;
                                    inpFields.Toc.forEach((elem) => {
                                        let data = {
                                            toc: {
                                                EpisodeId: episode_id,
                                                Number: Number++
                                            },
                                            lng: {
                                                LanguageId: languageId
                                            }
                                        };
                                        if (typeof (elem.Topic) !== "undefined")
                                            data.lng.Topic = elem.Topic;
                                        if (typeof (elem.StartTime) !== "undefined")
                                            data.lng.StartTime = elem.StartTime;
                                        if (typeof (elem.Id) === "number") {
                                            if (toc_list[elem.Id]) {
                                                toc_list[elem.Id].deleted = false;
                                                toc_list[elem.Id].data = data;
                                            }
                                            else {
                                                delete elem.Id;
                                                toc_new.push(data);
                                            }
                                        }
                                        else
                                            toc_new.push(data);
                                    });
                                    return root_toc.edit();
                                });
                        }
                    })
                    .then(() => {
                        if (inpFields.Content && (typeof (inpFields.Content.length) === "number")) {
                            let episode_lng_id = epi_lng_obj.id();
                            return this._getObjects(EPISODE_CONTENT_TREE, { field: "EpisodeLngId", op: "=", value: episode_lng_id })
                                .then((result) => {
                                    root_content = result;
                                    content_collection = root_content.getCol("DataElements");
                                    for (let i = 0; i < content_collection.count(); i++) {
                                        let obj = content_collection.get(i);
                                        content_list[obj.id()] = { deleted: true, obj: obj };
                                    }

                                    inpFields.Content.forEach((elem) => {
                                        let data = {
                                            EpisodeLngId: episode_lng_id,
                                            ResourceId: elem.ResourceId,
                                            CompType: elem.CompType,
                                            StartTime: elem.StartTime,
                                            Duration: elem.Duration
                                        };
                                        if (typeof (elem.Content) !== "undefined")
                                            data.Content = elem.Content;
                                        if (typeof (elem.Id) === "number") {
                                            if (content_list[elem.Id]) {
                                                content_list[elem.Id].deleted = false;
                                                content_list[elem.Id].data = data;
                                            }
                                            else {
                                                delete elem.Id;
                                                content_new.push(data);
                                            }
                                        }
                                        else
                                            content_new.push(data);
                                    });
                                    return root_content.edit();
                                });
                        }
                    })
                    .then(() => {
                        if (typeof (inpFields["EpisodeType"]) !== "undefined")
                            epi_obj.episodeType(inpFields["EpisodeType"]);

                        if (typeof (inpFields["State"]) !== "undefined")
                            epi_lng_obj.state(inpFields["State"]);
                        if (typeof (inpFields["Name"]) !== "undefined")
                            epi_lng_obj.name(inpFields["Name"]);
                        if (typeof (inpFields["Transcript"]) !== "undefined")
                            epi_lng_obj.transcript(inpFields["Transcript"]);
                        if (typeof (inpFields["Audio"]) !== "undefined")
                            epi_lng_obj.audio(inpFields["Audio"]);

                        if (typeof (inpFields["AudioMeta"]) !== "undefined") {
                            let oldDuration = typeof (epi_lng_obj.duration()) === "number" ? epi_lng_obj.duration() : 0;
                            let newDuration = 0;
                            epi_lng_obj.audioMeta(inpFields["AudioMeta"]);
                            try {
                                let meta = JSON.parse(inpFields["AudioMeta"]);
                                if (typeof (meta.length) === "number")
                                    newDuration = meta.length;
                            } catch (err) { };
                            durationDelta = newDuration - oldDuration;
                            epi_lng_obj.duration(newDuration);
                        }

                        if (typeof (inpFields["Structure"]) !== "undefined")
                            epi_lng_obj.structure(inpFields["Structure"]);

                        for (let key in toc_list)
                            if (toc_list[key].deleted)
                                toc_collection._del(toc_list[key].obj)
                            else {
                                for (let field in toc_list[key].data.toc)
                                    toc_list[key].obj[this._genGetterName(field)](toc_list[key].data.toc[field]);
                                for (let field in toc_list[key].data.lng)
                                    toc_list[key].lngObj[this._genGetterName(field)](toc_list[key].data.lng[field]);
                            }

                        for (let key in content_list)
                            if (content_list[key].deleted)
                                content_collection._del(content_list[key].obj)
                            else {
                                for (let field in content_list[key].data)
                                    content_list[key].obj[this._genGetterName(field)](content_list[key].data[field]);
                            }
                    })
                    .then(() => {
                        if (toc_new && (toc_new.length > 0)) {
                            return Utils.seqExec(toc_new, (elem) => {
                                return root_toc.newObject({
                                    fields: elem.toc
                                }, opts)
                                    .then((result) => {
                                        let new_toc_obj = this._db.getObj(result.newObject);
                                        let root_toc_lng = new_toc_obj.getDataRoot("EpisodeTocLng");
                                        return root_toc_lng.newObject({
                                            fields: elem.lng
                                        }, opts);
                                    });
                            });
                        }
                    })
                    .then(() => {
                        if (content_new && (content_new.length > 0)) {
                            return Utils.seqExec(content_new, (elem) => {
                                return root_content.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts.transactionId = transactionId;
                                return epi_obj.save(opts)
                                    .then((result) => {
                                        isModified = isModified || (result && result.detail && (result.detail.length > 0));
                                        if (durationDelta !== 0) {
                                            isModified = true;
                                            return this._updateLessonDuration(id, durationDelta, opts);
                                        }
                                    })    
                                    .then(() => {
                                        if (root_toc)
                                            return root_toc.save(opts)
                                                .then((result) => {
                                                    isModified = isModified || (result && result.detail && (result.detail.length > 0));
                                                });
                                    })
                                    .then(() => {
                                        if (root_content)
                                            return root_content.save(opts)
                                                .then((result) => {
                                                    isModified = isModified || (result && result.detail && (result.detail.length > 0));
                                                });
                                    });
                            });
                    })
                    .then(() => {
                        console.log("Episode updated: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (epi_obj)
                            this._db._deleteRoot(epi_obj.getRoot());
                        if (isErr) {
                            result = result.then(() => {
                                throw res;
                            });
                        }
                        else
                            result = result.then(() => { return res;})    
                        return result;
                    })
                    .then((result) => {
                        let rc = result;
                        if (isModified)
                            rc = LessonsService().prerender(lesson_id)
                                .then(() => result);
                        return rc;
                    })
            );
        })
    }

    insert(data, lesson_id, options) {
        return new Promise((resolve, reject) => {

            let root_obj;
            let lesson_obj;
            let opts = options || {};
            let newId = null;
            let new_obj = null;
            let new_lng_obj = null;
            let inpFields = data || {};
            let transactionId = null;
            let duration = 0;
            let languageId;

            resolve(
                this._getObjById(lesson_id, LESSON_REQ_TREE)
                    .then((result) => {
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + lesson_id + ") doesn't exist.");
                        lesson_obj = collection.get(0);

                        return lesson_obj.edit();
                    })
                    .then(() => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_LESSON_LANG_MYSQL)({ lessonId: lesson_id }),
                                mssql: _.template(GET_LESSON_LANG_MSSQL)({ lessonId: lesson_id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            languageId = result.detail[0].LanguageId;
                            return this._getObjById(-1, EPISODE_INS_TREE);
                        }
                        else
                            throw new Error("Lesson (Id = " + lesson_id + ") has inconsistent \"LNG\" part.");
                    })
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { LessonId: lesson_id };
                        if (typeof (inpFields["EpisodeType"]) !== "undefined")
                            fields["EpisodeType"] = inpFields["EpisodeType"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("EpisodeLng");

                        let fields = { LanguageId: languageId };
                        if (typeof (inpFields["Supp"]) === "undefined")
                            inpFields["Supp"] = false;    
                        if (typeof (inpFields["State"]) !== "undefined")
                            fields["State"] = inpFields["State"];
                        if (typeof (inpFields["Name"]) !== "undefined")
                            fields["Name"] = inpFields["Name"];
                        if (typeof (inpFields["Transcript"]) !== "undefined")
                            fields["Transcript"] = inpFields["Transcript"];
                        if (typeof (inpFields["Audio"]) !== "undefined")
                            fields["Audio"] = inpFields["Audio"];
                        if (typeof (inpFields["AudioMeta"]) !== "undefined") {
                            fields["AudioMeta"] = inpFields["AudioMeta"];
                            try {
                                let meta = JSON.parse(inpFields["AudioMeta"]);
                                if (typeof (meta.length) === "number")
                                    duration = meta.length;
                            } catch (err) { };
                        }
                        fields.Duration = duration;
                        if (typeof (inpFields["Structure"]) !== "undefined")
                            fields["Structure"] = inpFields["Structure"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        new_lng_obj = this._db.getObj(result.newObject);
                        let root_content = new_lng_obj.getDataRoot("EpisodeContent");
                        if (inpFields.Content && (inpFields.Content.length > 0)) {
                            return Utils.seqExec(inpFields.Content, (elem) => {
                                let fields = {};
                                if (typeof (elem["ResourceId"]) !== "undefined")
                                    fields["ResourceId"] = elem["ResourceId"];
                                if (typeof (elem["CompType"]) !== "undefined")
                                    fields["CompType"] = elem["CompType"];
                                if (typeof (elem["StartTime"]) !== "undefined")
                                    fields["StartTime"] = elem["StartTime"];
                                if (typeof (elem["Duration"]) !== "undefined")
                                    fields["Duration"] = elem["Duration"];
                                if (typeof (elem["Content"]) !== "undefined")
                                    fields["Content"] = elem["Content"];
                                return root_content.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_toc = new_obj.getDataRoot("EpisodeToc");
                        if (inpFields.Toc && (inpFields.Toc.length > 0)) {
                            let number = 1;
                            return Utils.seqExec(inpFields.Toc, (elem) => {
                                let fields = { Number: number++ };
                                return root_toc.newObject({
                                    fields: fields
                                }, opts)
                                    .then((result) => {
                                        let new_toc_obj = this._db.getObj(result.newObject);
                                        let root_lng = new_lng_obj.getDataRoot("EpisodeTocLng");
                                        let fields_lng = { LanguageId: languageId };
                                        if (typeof (elem["Topic"]) !== "undefined")
                                            fields_lng["Topic"] = elem["Topic"];
                                        if (typeof (elem["StartTime"]) !== "undefined")
                                            fields_lng["StartTime"] = elem["StartTime"];
                                        return root_lng.newObject({
                                            fields: fields_lng
                                        }, opts);
                                    });
                            });
                        }
                    })
                    .then(() => {
                        let root_lsn = lesson_obj.getDataRoot("EpisodeLesson");
                        let collection = root_lsn.getCol("DataElements");
                        let Number = 1;
                        for (let i = 0; i < collection.count(); i++)
                            if (collection.get(i).supp() === inpFields.Supp)
                                Number++;    
                        return root_lsn.newObject({
                            fields: { EpisodeId: newId, Supp: inpFields.Supp, Number: Number }
                        }, opts);
                    })
                    .then(() => {
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts.transactionId = transactionId;
                                return root_obj.save(opts);
                            })
                            .then(() => {
                                return lesson_obj.save(opts);
                            })
                            .then(() => {
                                if (duration !== 0)
                                    return this._updateLessonDuration(newId, duration, opts);
                            });    
                    })
                    .then(() => {
                        console.log("Episode added: Id=" + newId + ".");
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (lesson_obj)
                            this._db._deleteRoot(lesson_obj.getRoot());
                        if (isErr) {
                            result = result.then(() => {
                                throw res;
                            });
                        }
                        else
                            result = result.then(() => { return res; })
                        return result;
                    })
                    .then((result) => {
                        return LessonsService().prerender(lesson_id)
                            .then(() => result);
                    })
            );
        })
    }
};

let dbEpisode = null;
exports.EpisodesService = () => {
    return dbEpisode ? dbEpisode : dbEpisode = new DbEpisode();
}
