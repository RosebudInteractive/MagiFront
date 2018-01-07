const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const _ = require('lodash');

const ACCOUNT_ID = 1;
const LANGUAGE_ID = 1;

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

const EPISODE_MSSQL_ID_REQ =
    "select e.[Id], el.[Name], els.[Number], el.[Audio], el.[State], e.[EpisodeType], els.[Supp], el.[Transcript], el.[Structure] from [Episode] e\n" +
    "  join [EpisodeLng] el on e.[Id] = el.[EpisodeId] and el.[LanguageId] = <%= languageId %>\n" +
    "  join [EpisodeLesson] els on e.[Id] = els.[EpisodeId]\n" +
    "where e.[Id] = <%= id %> and els.[LessonId] = <%= lessonId %>";
const EPISODE_MSSQL_TOC_REQ =
    "select t.[Id], t.[Number], l.[Topic], l.[StartTime] from [EpisodeToc] t\n" +
    "  join[EpisodeTocLng] l on l.[EpisodeTocId] = t.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "  join[Episode] e on e.[Id] = t.[EpisodeId]\n" +
    "where e.[Id] = <%= id %>\n" +
    "order by t.[Number]";
const EPISODE_MSSQL_CONT_REQ =
    "select r.[Id], r.[ResType], r.[FileName],\n" +
    "  t.[CompType], t.[StartTime], t.[Duration], t.[Content] from [EpisodeContent] t\n" +
    "  join[EpisodeLng] l on l.[Id] = t.[EpisodeLngId] and l.[LanguageId] = <%= languageId %>\n" +
    "  join[Episode] e on e.[Id] = l.[EpisodeId]\n" +
    "  join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "  join[ResourceLng] rl on rl.[ResourceId] = r.[Id] and rl.[LanguageId] = <%= languageId %>\n" +
    "where e.[Id] = <%= id %>\n" +
    "order by t.[StartTime]";

const EPISODE_MYSQL_ID_REQ =
    "select e.`Id`, el.`Name`, els.`Number`, el.`Audio`, el.`State`, e.`EpisodeType`, els.`Supp`, el.`Transcript`, el.`Structure` from `Episode` e\n" +
    "  join `EpisodeLng` el on e.`Id` = el.`EpisodeId` and el.`LanguageId` = <%= languageId %>\n" +
    "  join `EpisodeLesson` els on e.`Id` = els.`EpisodeId`\n" +
    "where e.`Id` = <%= id %> and els.`LessonId` = <%= lessonId %>";
const EPISODE_MYSQL_TOC_REQ =
    "select t.`Id`, t.`Number`, l.`Topic`, l.`StartTime` from `EpisodeToc` t\n" +
    "  join`EpisodeTocLng` l on l.`EpisodeTocId` = t.`Id` and l.`LanguageId` = <%= languageId %>\n" +
    "  join`Episode` e on e.`Id` = t.`EpisodeId`\n" +
    "where e.`Id` = <%= id %>\n" +
    "order by t.`Number`";
const EPISODE_MYSQL_CONT_REQ =
    "select r.`Id`, r.`ResType`, r.`FileName`,\n" +
    "  t.`CompType`, t.`StartTime`, t.`Duration`, t.`Content` from `EpisodeContent` t\n" +
    "  join`EpisodeLng` l on l.`Id` = t.`EpisodeLngId` and l.`LanguageId` = <%= languageId %>\n" +
    "  join`Episode` e on e.`Id` = l.`EpisodeId`\n" +
    "  join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "  join`ResourceLng` rl on rl.`ResourceId` = r.`Id` and rl.`LanguageId` = <%= languageId %>\n" +
    "where e.`Id` = <%= id %>\n" +
    "order by t.`StartTime`";

const DbEpisode = class DbEpisode extends DbObject {

    constructor(options) {
        super(options);
    }

    _genGetterName(fname) {
        var res = fname;
        if (fname.length > 0) {
            res = fname[0].toLowerCase() + fname.substring(1);
        };
        return res;
    }
    _getObjById(id, expression) {
        var exp = expression || EPISODE_REQ_TREE;
        return super._getObjById(id, exp);
    }

    get(id, lesson_id) {
        let episode = {};
        let isNotFound = true;
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(EPISODE_MYSQL_ID_REQ)({ languageId: LANGUAGE_ID, id: id, lessonId: lesson_id }),
                        mssql: _.template(EPISODE_MSSQL_ID_REQ)({ languageId: LANGUAGE_ID, id: id, lessonId: lesson_id })
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
                                        mysql: _.template(EPISODE_MYSQL_TOC_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                        mssql: _.template(EPISODE_MSSQL_TOC_REQ)({ languageId: LANGUAGE_ID, id: id })
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
                                    mysql: _.template(EPISODE_MYSQL_CONT_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                    mssql: _.template(EPISODE_MSSQL_CONT_REQ)({ languageId: LANGUAGE_ID, id: id })
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

            let transactionId = null;

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
                                            name: "Episode"
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
                        return result.edit()
                    })
                    .then(() => {
                        let episode_obj = collection.get(0);
                        if (episode_obj.lessonId() === lesson_id)
                            // We need to remove whole episode here    
                            collection._del(episode_obj)

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
                                return lesson_obj.save(opts);
                            })
                            .then(() => {
                                return root_obj.save(opts);
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
                                if (res instanceof Error)
                                    throw res
                                else
                                    throw new Error("Error: " + JSON.stringify(res));
                            });
                        }
                        else
                            result = result.then(() => { return res; })
                        return result;
                    })
            );
        })
    }

    update(id, lesson_id, data) {
        let self = this;
        return new Promise((resolve, reject) => {
            let epi_obj;
            let epi_lng_obj;
            let opts = {};
            let inpFields = data || {};
            
            let transactionId = null;

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

                        return epi_obj.edit()
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
                        if (typeof (inpFields["Structure"]) !== "undefined")
                            epi_lng_obj.structure(inpFields["Structure"]);

                    })
                    .then(() => {
                        return epi_obj.save(opts);
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
                                if (res instanceof Error)
                                    throw res
                                else
                                    throw new Error("Error: " + JSON.stringify(res));
                            });
                        }
                        else
                            result = result.then(() => { return res;})    
                        return result;
                    })
            );
        })
    }

    insert(data, lesson_id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let lesson_obj;
            let opts = {};
            let newId = null;
            let new_obj = null;
            let new_lng_obj = null;
            let inpFields = data || {};
            let transactionId = null;
            resolve(
                this._getObjById(lesson_id, LESSON_REQ_TREE)
                    .then((result) => {
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + lesson_id + ") doesn't exist.");
                        lesson_obj = collection.get(0);

                        return lesson_obj.edit()
                            .then(() => {
                                return this._getObjById(-1);
                            })
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

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (typeof (inpFields["State"]) !== "undefined")
                            fields["State"] = inpFields["State"];
                        if (typeof (inpFields["Name"]) !== "undefined")
                            fields["Name"] = inpFields["Name"];
                        if (typeof (inpFields["Transcript"]) !== "undefined")
                            fields["Transcript"] = inpFields["Transcript"];
                        if (typeof (inpFields["Audio"]) !== "undefined")
                            fields["Audio"] = inpFields["Audio"];
                        if (typeof (inpFields["Structure"]) !== "undefined")
                            fields["Structure"] = inpFields["Structure"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
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
                                opts = { transactionId: transactionId };
                                return root_obj.save(opts);
                            })
                            .then(() => {
                                return lesson_obj.save(opts);
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
                                if (res instanceof Error)
                                    throw res
                                else
                                    throw new Error("Error: " + JSON.stringify(res));
                            });
                        }
                        else
                            result = result.then(() => { return res; })
                        return result;
                    })
            );
        })
    }
};

let dbEpisode = null;
exports.EpisodesService = () => {
    return dbEpisode ? dbEpisode : dbEpisode = new DbEpisode();
}
