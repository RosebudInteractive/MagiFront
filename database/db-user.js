const _ = require('lodash');
const config = require('config');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { DbObject } = require('./db-object');
const { UsersMemCache } = require("../security/users-mem-cache");
const { UsersRedisCache } = require("../security/users-redis-cache");
const { PositionsService } = require('../services/lesson-positions');

const GET_HISTORY_MSSQL =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], l.[Id] as[LessonId], c.[LanguageId], c.[Cover], c.[CoverMeta], c.[Color], cl.[Name],\n" +
    "  c.[URL], lc.[Number], lc.[ReadyDate], ell.Audio, el.[Number] Eln,\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[URL] as[LURL],\n" +
    "  ll.[Name] as[LName], ll.[Duration], ll.[DurationFmt], l.[AuthorId], al.[FirstName], al.[LastName], a.[URL] AURL\n" +
    "from[Lesson] l\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join[LessonCourse] lc on lc.[LessonId] = l.[Id]\n" +
    "  join[Course] c on lc.[CourseId] = c.[Id]\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "  join[Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join[AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "where l.[Id] in\n" +
    "  (\n" +
    "    select distinct lc.[LessonId] from LessonCourse lc\n" +
    "    where lc.[LessonId] in (<%= lessonIds %>)\n" +
    "    union\n" +
    "    select distinct llc.[LessonId] from LessonCourse lc\n" +
    "      join LessonCourse llc on llc.[Id] = lc.[ParentId]\n" +
    "    where lc.[LessonId] in (<%= lessonIds %>)\n" +
    "  )\n" +
    "order by c.[Id], lc.[ParentId], lc.[Number], el.[Number]";

const GET_HISTORY_MYSQL =
    "select lc.`Id` as`LcId`, lc.`ParentId`, c.`Id`, l.`Id` as`LessonId`, c.`LanguageId`, c.`Cover`, c.`CoverMeta`, c.`Color`, cl.`Name`,\n" +
    "  c.`URL`, lc.`Number`, lc.`ReadyDate`, ell.Audio, el.`Number` Eln,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`URL` as`LURL`,\n" +
    "  ll.`Name` as`LName`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId`, al.`FirstName`, al.`LastName`, a.`URL` AURL\n" +
    "from`Lesson` l\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join`LessonCourse` lc on lc.`LessonId` = l.`Id`\n" +
    "  join`Course` c on lc.`CourseId` = c.`Id`\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "  join`Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join`AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "where l.`Id` in\n" +
    "  (\n" +
    "    select distinct lc.`LessonId` from LessonCourse lc\n" +
    "    where lc.`LessonId` in (<%= lessonIds %>)\n" +
    "    union\n" +
    "    select distinct llc.`LessonId` from LessonCourse lc\n" +
    "      join LessonCourse llc on llc.`Id` = lc.`ParentId`\n" +
    "    where lc.`LessonId` in (<%= lessonIds %>)\n" +
    "  )\n" +
    "order by c.`Id`, lc.`ParentId`, lc.`Number`, el.`Number`";

const MAX_LESSONS_REQ_NUM = 15;

const DbUser = class DbUser extends DbObject {

    constructor(options) {
        super(options);
        this._usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode
    }

    _getObjById(id, expression, options) {
        var exp = expression || USER_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    getPublic(user) {
        return new Promise((resolve, reject) => {
            resolve({ DisplayName: user.DisplayName, Email: user.Email });
        });
    }

    getHistory(id) {
        let positions = {};
        let lessonIds = [];
        let history = { Lessons: [], Courses: {}, Authors: {} };
        let authors_list = {};
        let courses_list = {};

        return new Promise((resolve, reject) => {
            resolve(PositionsService().getAllLessonPositions(id));
        })
            .then((result) => {
                positions = result;
                if (result)
                    for (let i in result)
                        lessonIds.push(parseInt(i));
                if (lessonIds.length > 0) {
                    let restIds = lessonIds.length;
                    let currPos = 0;
                    let arrayOfIds = [];
                    while (restIds > 0) {
                        let len = restIds > MAX_LESSONS_REQ_NUM ? MAX_LESSONS_REQ_NUM : restIds;
                        arrayOfIds.push(lessonIds.slice(currPos, currPos + len));
                        restIds -= len;
                        currPos += len;
                    }
                    return Utils.seqExec(arrayOfIds, (elem) => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_HISTORY_MYSQL)({ lessonIds: elem.join() }),
                                mssql: _.template(GET_HISTORY_MSSQL)({ lessonIds: elem.join() })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0)) {
                                    let lessons = {};
                                    for (let i = 0; i < elem.length; i++)
                                        lessons[elem[i]] = true;
                                    let lc_list = {};
                                    let lsn_list = {};
                                    let course = null;
                                    result.detail.forEach((elem) => {
                                        course = history.Courses[elem.Id];
                                        if (!course) {
                                            course = {
                                                Id: elem.Id,
                                                LanguageId: elem.LanguageId,
                                                Cover: elem.Cover,
                                                CoverMeta: elem.CoverMeta,
                                                Color: elem.Color,
                                                Name: elem.Name,
                                                URL: elem.URL,
                                            };
                                            history.Courses[elem.Id] = course;
                                        };
                                        let lsn = lsn_list[elem.LessonId];
                                        if (!lsn) {
                                            lsn = {
                                                Id: elem.LessonId,
                                                CourseId: elem.Id,
                                                Number: elem.Number + "",
                                                ReadyDate: elem.ReadyDate,
                                                State: elem.State,
                                                Cover: elem.LCover,
                                                CoverMeta: elem.LCoverMeta,
                                                URL: elem.LURL,
                                                IsAuthRequired: elem.IsAuthRequired ? true : false,
                                                Name: elem.LName,
                                                Duration: elem.Duration,
                                                DurationFmt: elem.DurationFmt,
                                                AuthorId: elem.AuthorId,
                                                Audios: []
                                            };
                                            let author = history.Authors[elem.AuthorId];
                                            if (!author) {
                                                author = {
                                                    Id: elem.AuthorId,
                                                    FirstName: elem.FirstName,
                                                    LastName: elem.LastName,
                                                    URL: elem.AURL
                                                };
                                                history.Authors[elem.AuthorId] = author;
                                            }
                                            if (!elem.ParentId) {
                                                lc_list[elem.LcId] = lsn;
                                            }
                                            else {
                                                let parent = lc_list[elem.ParentId];
                                                if (parent) {
                                                    lsn.Number = parent.Number + "." + lsn.Number;
                                                }
                                            }
                                            lsn_list[elem.LessonId] = lsn;
                                            if (lessons[elem.LessonId]) {
                                                lsn.Pos = positions[elem.LessonId].pos;
                                                lsn.LastVisit = new Date(positions[elem.LessonId].ts);
                                                lsn.isFinished = positions[elem.LessonId].isFinished ? true : false;
                                                history.Lessons.push(lsn);
                                            }
                                        }
                                        lsn.Audios.push(elem.Audio);
                                    })
                                }
                            })
                    });
                }
            })
            .then(() => {
                return history;
            });
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            resolve(this._usersCache.editUser(id, data));
        })
    }
};

let dbUser = null;
exports.UsersService = () => {
    return dbUser ? dbUser : dbUser = new DbUser();
}
