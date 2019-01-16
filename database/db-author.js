const _ = require('lodash');
const config = require('config');
const { DbObject } = require('./db-object');
const { LANGUAGE_ID, ACCOUNT_ID } = require('../const/sql-req-common');
const { Intervals } = require('../const/common');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { getTimeStr, buildLogString } = require('../utils');
const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;

const AUTHOR_REQ_TREE = {
    expr: {
        model: {
            name: "Author",
            childs: [
                {
                    dataObject: {
                        name: "AuthorLng"
                    }
                }
            ]
        }
    }
};

const AUTHOR_MSSQL_ALL_REQ =
    "select a.[Id], l.[FirstName], l.[LastName], a.[URL], a.[Portrait], a.[PortraitMeta], l.[Description] from [Author] a\n" +
    "  join [AuthorLng] l on a.[Id] = l.[AuthorId] and a.[AccountId] = <%= accountId %>";

const AUTHOR_MYSQL_ALL_REQ =
    "select a.`Id`, l.`FirstName`, l.`LastName`, a.`URL`, a.`Portrait`, a.`PortraitMeta`, l.`Description` from `Author` a\n" +
    "  join `AuthorLng` l on a.`Id` = l.`AuthorId` and a.`AccountId` = <%= accountId %>";

const AUTHOR_MSSQL_ID_REQ = AUTHOR_MSSQL_ALL_REQ + "\nwhere a.[Id] = <%= id %>";
const AUTHOR_MYSQL_ID_REQ = AUTHOR_MYSQL_ALL_REQ + "\nwhere a.`Id` = <%= id %>";

const AUTHOR_MSSQL_PUB_REQ =
    "select a.[Id], a.[Portrait], a.[PortraitMeta], a.[URL], g.[FirstName], g.[LastName], g.[Description]\n" +
    "from[Author] a\n" +
    "  join[AuthorLng] g on g.[AuthorId] = a.[Id]\n" +
    "where a.[URL] = '<%= authorUrl %>'";

const AUTHOR_MSSQL_CL_PUB_REQ =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], l.[Id] as[LessonId], c.[LanguageId], c.[OneLesson], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color], cl.[Name],\n" +
    "  cl.[Description], c.[URL], lc.[Number], lc.[ReadyDate], ell.Audio, el.[Number] Eln,\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL],\n" +
    "  ll.[Name] as[LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId]\n" +
    "from[Lesson] l\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join[LessonCourse] lc on lc.[LessonId] = l.[Id]\n" +
    "  join[Course] c on lc.[CourseId] = c.[Id]\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "where(l.[AuthorId] = <%= authorId %>) and(lc.[State] = 'R')\n" +
    "order by c.[Id], lc.[ParentId], lc.[Number], el.[Number]";

const AUTHOR_MSSQL_CNT_PUB_REQ =
    "select c.[Id], count(*) Total, sum(case when lc.[State] = 'R' then 1 else 0 end) Ready\n" +
    "from[Lesson] l\n" +
    "  join[LessonCourse] lc on lc.[LessonId] = l.[Id]\n" +
    "  join[Course] c on lc.[CourseId] = c.[Id]\n" +
    "  join[AuthorToCourse] ac on ac.[CourseId] = c.[Id]\n" +
    "where(ac.[AuthorId] = <%= authorId %>) and(lc.[ParentId] is NULL)\n" +
    "group by c.[Id]";

const AUTHOR_MSSQL_REF_PUB_REQ =
    "select l.[Id], sum(case when r.[Recommended] = 0 then 1 else 0 end) as[NRef],\n" +
    "  sum(convert(int, r.[Recommended])) as [NRec]\n" +
    "from[Lesson] l\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join[LessonCourse] lc on lc.[LessonId] = l.[Id]\n" +
    "  join[Reference] r on r.[LessonLngId] = ll.[Id]\n" +
    "where(l.[AuthorId] = <%= authorId %>) and(lc.[State] = 'R')\n" +
    "group by l.[Id]";

const AUTHOR_MYSQL_PUB_REQ =
    "select a.`Id`, a.`Portrait`, a.`PortraitMeta`, a.`URL`, g.`FirstName`, g.`LastName`, g.`Description`\n" +
    "from`Author` a\n" +
    "  join`AuthorLng` g on g.`AuthorId` = a.`Id`\n" +
    "where a.`URL` = '<%= authorUrl %>'";

const AUTHOR_MYSQL_CL_PUB_REQ =
    "select lc.`Id` as`LcId`, lc.`ParentId`, c.`Id`, l.`Id` as`LessonId`, c.`LanguageId`, c.`OneLesson`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`, cl.`Name`,\n" +
    "  cl.`Description`, c.`URL`, lc.`Number`, lc.`ReadyDate`, ell.Audio, el.`Number` Eln,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`,\n" +
    "  ll.`Name` as`LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId`\n" +
    "from`Lesson` l\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join`LessonCourse` lc on lc.`LessonId` = l.`Id`\n" +
    "  join`Course` c on lc.`CourseId` = c.`Id`\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "where(l.`AuthorId` = <%= authorId %>) and(lc.`State` = 'R')\n" +
    "order by c.`Id`, lc.`ParentId`, lc.`Number`, el.`Number`";

const AUTHOR_MYSQL_CNT_PUB_REQ =
    "select c.`Id`, count(*) Total, sum(case when lc.`State` = 'R' then 1 else 0 end) Ready\n" +
    "from`Lesson` l\n" +
    "  join`LessonCourse` lc on lc.`LessonId` = l.`Id`\n" +
    "  join`Course` c on lc.`CourseId` = c.`Id`\n" +
    "  join`AuthorToCourse` ac on ac.`CourseId` = c.`Id`\n" +
    "where(ac.`AuthorId` = <%= authorId %>) and(lc.`ParentId` is NULL)\n" +
    "group by c.`Id`";

const AUTHOR_MYSQL_REF_PUB_REQ =
    "select l.`Id`, sum(IF(r.`Recommended` = 0, 1, 0)) as `NRef`,\n" +
    "  sum(r.`Recommended`) as `NRec`\n" +
    "from`Lesson` l\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join`LessonCourse` lc on lc.`LessonId` = l.`Id`\n" +
    "  join`Reference` r on r.`LessonLngId` = ll.`Id`\n" +
    "where(l.`AuthorId` = <%= authorId %>) and(lc.`State` = 'R')\n" +
    "group by l.`Id`";

const GET_AUTHOR_FOR_PRERENDER_MSSQL =
    "select [URL] from [Author]\n" +
    "where [Id] = <%= id %>";

const GET_AUTHOR_FOR_PRERENDER_BY_URL_MSSQL =
    "select [URL] from [Author]\n" +
    "where [URL] = '<%= url %>'";

const GET_AUTHOR_FOR_PRERENDER_MYSQL =
    "select `URL` from `Author`\n" +
    "where `Id` = <%= id %>";

const GET_AUTHOR_FOR_PRERENDER_BY_URL_MYSQL =
    "select `URL` from `Author`\n" +
    "where `URL` = '<%= url %>'";

const { PrerenderCache } = require('../prerender/prerender-cache');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const URL_PREFIX = "autor";

const DbAuthor = class DbAuthor extends DbObject {

    constructor(options) {
        super(options);
        this._prerenderCache = PrerenderCache();
    }

    _getObjById(id, expression, options) {
        var exp = expression || AUTHOR_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    clearCache(id, isListOnly) {
        let key = id;
        return new Promise((resolve) => {
            let rc = [];
            if (typeof (key) === "string") {
                if ((key.length > 0) && (key[0] !== "/"))
                    key = "/" + key;
                rc.push("/" + URL_PREFIX + key);
            }
            else
                if (typeof (key) === "number") {
                    rc = $data.execSql({
                        dialect: {
                            mysql: _.template(GET_AUTHOR_FOR_PRERENDER_MYSQL)({ id: id }),
                            mssql: _.template(GET_AUTHOR_FOR_PRERENDER_MSSQL)({ id: id })
                        }
                    }, {})
                        .then((result) => {
                            if (result && result.detail && (result.detail.length > 0)) {
                                let res = [];
                                result.detail.forEach((elem) => {
                                    res.push("/" + URL_PREFIX + "/" + elem.URL + "/");
                                })
                                return res;
                            }
                        });
                }
            resolve(rc);
        })
            .then((result) => {
                let rc = result;
                if ((!isListOnly) && result && (result.length > 0))
                    rc = Utils.seqExec(result, (elem) => {
                        return this._prerenderCache.del(elem);
                    })
                        .then(() => result);
                return rc;
            });
    }

    prerender(id, isListOnly, oldUrl) {
        return this.clearCache(oldUrl ? oldUrl : id, isListOnly)
            .then(() => {
                return new Promise((resolve, reject) => {
                    let dialect = {
                        mysql: _.template(GET_AUTHOR_FOR_PRERENDER_MYSQL)({ id: id }),
                        mssql: _.template(GET_AUTHOR_FOR_PRERENDER_MSSQL)({ id: id })
                    };
                    if (typeof (id) === "string") {
                        let url;
                        let urls = id.split("/");
                        let cnt = 0;
                        urls.forEach((elem) => {
                            if (elem.length > 0) {
                                cnt++;
                                url = elem;
                            }
                        })
                        if (cnt !== 1)
                            throw new Error(`DbAuthor::prerender: Invalid "id" parameter: "${id}"`);
                        dialect = {
                            mysql: _.template(GET_AUTHOR_FOR_PRERENDER_BY_URL_MYSQL)({ url: url }),
                            mssql: _.template(GET_AUTHOR_FOR_PRERENDER_BY_URL_MSSQL)({ url: url })
                        };
                    }
                    resolve($data.execSql({ dialect: dialect }, {}));
                })
            })
            .then((result) => {
                let res = [];
                let rc = Promise.resolve(res);
                if (result && result.detail && (result.detail.length > 0)) {
                    rc = Utils.seqExec(result.detail, (elem) => {
                        return new Promise((resolve, reject) => {
                            let path = "/" + URL_PREFIX + "/" + elem.URL + "/";
                            res.push(path);
                            if (isListOnly)
                                resolve()
                            else
                                resolve(this._prerenderCache.prerender(path));
                        });
                    })
                        .then(() => {
                            return res;
                        });
                }
                return rc;
            });
    }

    getPublic(url) {
        let author = {};
        let lsn_list = {};
        let lc_list = {};
        let couse_list = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(AUTHOR_MYSQL_PUB_REQ)({ authorUrl: url }),
                        mssql: _.template(AUTHOR_MSSQL_PUB_REQ)({ authorUrl: url })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            author = result.detail[0];
                            author.Courses = [];
                            author.Lessons = [];

                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(AUTHOR_MYSQL_CL_PUB_REQ)({ authorId: author.Id }),
                                    mssql: _.template(AUTHOR_MSSQL_CL_PUB_REQ)({ authorId: author.Id })
                                }
                            }, {})
                        }
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find author "${url}".`);
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let authors_list = {};
                            let courseId = -1;
                            let course = null;
                            let now = new Date();
                            result.detail.forEach((elem) => {
                                if (courseId !== elem.Id) {
                                    courseId = elem.Id;
                                    course = {
                                        Id: elem.Id,
                                        LanguageId: elem.LanguageId,
                                        OneLesson: elem.OneLesson ? true : false,
                                        Cover: elem.Cover,
                                        CoverMeta: elem.CoverMeta,
                                        Mask: elem.Mask,
                                        Color: elem.Color,
                                        Name: elem.Name,
                                        Description: elem.Description,
                                        URL: elem.URL,
                                        Total: 0,
                                        Ready: 0
                                    };
                                    author.Courses.push(course);
                                    couse_list[elem.Id] = course;
                                };
                                let lsn = lsn_list[elem.LessonId];
                                if (!lsn) {
                                    lsn = {
                                        Id: elem.LessonId,
                                        CourseId: courseId,
                                        Number: elem.Number,
                                        ReadyDate: elem.ReadyDate,
                                        State: elem.State,
                                        Cover: elem.LCover,
                                        CoverMeta: elem.LCoverMeta,
                                        URL: elem.LURL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        Name: elem.LName,
                                        ShortDescription: elem.ShortDescription,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        AuthorId: elem.AuthorId,
                                        NSub: 0,
                                        NRefBooks: 0,
                                        NBooks: 0,
                                        Audios: []
                                    };
                                    if (lsn.IsSubsRequired && elem.FreeExpDate && ((now - elem.FreeExpDate) > Intervals.MIN_FREE_LESSON))
                                        lsn.FreeExpDate = elem.FreeExpDate;
                                    authors_list[elem.AuthorId] = true;
                                    if (!elem.ParentId) {
                                        author.Lessons.push(lsn);
                                        lc_list[elem.LcId] = lsn;
                                    }
                                    else {
                                        let parent = lc_list[elem.ParentId];
                                        if (parent) {
                                            parent.NSub++;
                                        }
                                    }
                                    lsn_list[elem.LessonId] = lsn;
                                }
                                lsn.Audios.push(elem.Audio);
                            })
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(AUTHOR_MYSQL_CNT_PUB_REQ)({ authorId: author.Id }),
                                    mssql: _.template(AUTHOR_MSSQL_CNT_PUB_REQ)({ authorId: author.Id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let course = couse_list[elem.Id]
                                if (course) {
                                    course.Total = elem.Total;
                                    course.Ready = elem.Ready;
                                }
                            })
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(AUTHOR_MYSQL_REF_PUB_REQ)({ authorId: author.Id }),
                                    mssql: _.template(AUTHOR_MSSQL_REF_PUB_REQ)({ authorId: author.Id })
                                }
                            }, {});
                        }
                        return author;
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let lsn = lsn_list[elem.Id]
                                if (lsn) {
                                    lsn.NRefBooks = elem.NRef;
                                    lsn.NBooks = elem.NRec;
                                }
                            })
                        }
                        return author;
                    })
            );
        })
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(AUTHOR_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID }),
                        mssql: _.template(AUTHOR_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID })
                    }
                }, {})
                    .then((result) => {
                        return result.detail;
                    })
            );
        })
    }

    get(id) {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(AUTHOR_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id }),
                        mssql: _.template(AUTHOR_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        let author = {};
                        if (result && result.detail && (result.detail.length === 1))
                            author = result.detail[0];
                        return author;
                    })
            );
        })
    }

    del(id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let newId = null;
            let collection = null;
            let url;
            resolve(
                this._getObjById(id)
                    .then((result) => {
                        root_obj = result;
                        collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Author (Id = " + id + ") doesn't exist.");
                        return result.edit()
                    })
                    .then(() => {
                        let author = collection.get(0);
                        url = author.uRL();
                        collection._del(author);
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Author deleted: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            throw res;
                        return res;
                    })
                    .then((result) => {
                        return this.clearCache(url)
                            .then(() => result);
                    })
            );
        })
    }

    update(id, data, options) {
        return new Promise((resolve, reject) => {
            let auth_obj;
            let auth_lng_obj;
            let opts = options || {};
            let newId = null;
            let inpFields = data || {};
            let isModified = false;
            let old_url;
            resolve(
                this._getObjById(id)
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Author (Id = " + id + ") doesn't exist.");
                        auth_obj = collection.get(0);
                        old_url = auth_obj.uRL();
                        collection = auth_obj.getDataRoot("AuthorLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Author (Id = " + id + ") has inconsistent \"LNG\" part.");
                        auth_lng_obj = collection.get(0);
                        return auth_obj.edit()
                    })
                    .then(() => {
                        if (typeof (inpFields["URL"]) !== "undefined")
                            auth_obj.uRL(inpFields["URL"]);
                        if (typeof (inpFields["Portrait"]) !== "undefined")
                            auth_obj.portrait(inpFields["Portrait"]);
                        if (typeof (inpFields["PortraitMeta"]) !== "undefined")
                            auth_obj.portraitMeta(inpFields["PortraitMeta"]);
                        if (typeof (inpFields["FirstName"]) !== "undefined")
                            auth_lng_obj.firstName(inpFields["FirstName"]);
                        if (typeof (inpFields["LastName"]) !== "undefined")
                            auth_lng_obj.lastName(inpFields["LastName"]);
                        if (typeof (inpFields["Description"]) !== "undefined")
                            auth_lng_obj.description(inpFields["Description"]);
                        return auth_obj.save(opts)
                            .then((result) => {
                                isModified = isModified || (result && result.detail && (result.detail.length > 0));
                            });
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Author updated: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (auth_obj)
                            this._db._deleteRoot(auth_obj.getRoot());
                        if (isErr)
                            throw res;
                        return res;
                    })
                    .then((result) => {
                        let rc = result;
                        if (isModified)
                            rc = this.prerender(id, false, old_url)
                                .then(() => result);
                        return rc;
                    })
            );
        })
    }

    insert(data, options) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = options || {};
            let newId = null;
            let inpFields = data || {};
            resolve(
                this._getObjById(-1)
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { AccountId: ACCOUNT_ID };
                        if (typeof (inpFields["URL"]) !== "undefined")
                            fields["URL"] = inpFields["URL"];
                        if (typeof (inpFields["Portrait"]) !== "undefined")
                            fields["Portrait"] = inpFields["Portrait"];
                        if (typeof (inpFields["PortraitMeta"]) !== "undefined")
                            fields["PortraitMeta"] = inpFields["PortraitMeta"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        let new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("AuthorLng");

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (typeof (inpFields["FirstName"]) !== "undefined")
                            fields["FirstName"] = inpFields["FirstName"];
                        if (typeof (inpFields["LanguageId"]) !== "undefined")
                            fields["LanguageId"] = inpFields["LanguageId"];
                        if (typeof (inpFields["LastName"]) !== "undefined")
                            fields["LastName"] = inpFields["LastName"];
                        if (typeof (inpFields["Description"]) !== "undefined")
                            fields["Description"] = inpFields["Description"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Author added: Id="${newId}".`));
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            throw res;
                        return res;
                    })
                    .then((result) => {
                        return this.prerender(newId)
                            .then(() => result);
                    })
            );
        })
    }
};

let dbAuthor = null;
exports.AuthorsService = () => {
    return dbAuthor ? dbAuthor : dbAuthor = new DbAuthor();
}
