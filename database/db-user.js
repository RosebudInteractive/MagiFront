const _ = require('lodash');
const config = require('config');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { DbObject } = require('./db-object');
const { UsersCache } = require('../security/users-cache');
const { PositionsService } = require('../services/lesson-positions');
const { Intervals } = require('../const/common');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");

const GET_HISTORY_MSSQL =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], l.[Id] as[LessonId], c.[LanguageId], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color], cl.[Name],\n" +
    "  c.[URL], lc.[Number], lc.[ReadyDate], ell.Audio, el.[Number] Eln,\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL],\n" +
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
    "select lc.`Id` as`LcId`, lc.`ParentId`, c.`Id`, l.`Id` as`LessonId`, c.`LanguageId`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`, cl.`Name`,\n" +
    "  c.`URL`, lc.`Number`, lc.`ReadyDate`, ell.Audio, el.`Number` Eln,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`,\n" +
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

const GET_COURSE_ID_MSSQL =
    "select [Id] from [Course] where [URL] = '<%= courseUrl %>'";

const GET_LESSON_COURSE_ID_MSSQL =
    "select lc.[Id] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where c.[URL] = '<%= courseUrl %>' and l.[URL] = '<%= lessonUrl %>'";

const DEL_COURSE_BKM_MSSQL =
    "delete b from [Bookmark] b\n" +
    "  join[Course] c on c.[Id] = b.[CourseId]\n" +
    "where b.[UserId] = <%= userId %> and c.[URL] = '<%= courseUrl %>'";

const DEL_LESSON_BKM_MSSQL =
    "delete b from[Bookmark] b\n" +
    "  join[LessonCourse] lc on lc.[Id] = b.[LessonCourseId]\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where b.[UserId] = <%= userId %> and c.[URL] = '<%= courseUrl %>' and l.[URL] = '<%= lessonUrl %>'";

const GET_SHORT_BKM_MSSQL =
    "select c.[URL] from [Bookmark] b\n" +
    "  join[Course] c on c.[Id] = b.[CourseId]\n" +
    "where b.[UserId] = <%= userId %>\n" +
    "union\n" +
    "select c.[URL] + '/' + l.[URL] from[Bookmark] b\n" +
    "  join[LessonCourse] lc on lc.[Id] = b.[LessonCourseId]\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where b.[UserId] = <%= userId %>";

const GET_LESSON_IDS_BKM_MSSQL =
    "select l.[Id] from[Bookmark] b\n" +
    "  join[LessonCourse] lc on lc.[Id] = b.[LessonCourseId]\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where b.[UserId] = <%= userId %>\n" +
    "order by b.[Id] desc";

const GET_COURSE_IDS_BKM_MSSQL =
    "select c.[Id] from [Bookmark] b\n" +
    "  join[Course] c on c.[Id] = b.[CourseId]\n" +
    "where b.[UserId] = <%= userId %>\n" +
    "order by b.[Id] desc";

const GET_COURSES_BY_IDS_MSSQL =
    "select c.[Id], c.[Cover], c.[CoverMeta], c.[Mask], c.[URL], cl.[Name] from [Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "where c.[Id] in (<%= courseIds %>)";

const GET_AUTHORS_BY_COURSE_IDS_MSSQL =
    "select a.[Id], ac.[CourseId], a.[Portrait], a.[PortraitMeta], a.[URL],\n" +
    "  al.[FirstName], al.[LastName] from [Author] a\n" +
    "  join[AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "  join[AuthorToCourse] ac on ac.[AuthorId] = a.[Id]\n" +
    "where ac.[CourseId] in (<%= courseIds %>)";

const GET_CATEGORIES_BY_COURSE_IDS_MSSQL =
    "select c.[Id], cc.[CourseId], c.[URL], cl.[Name] from [Category] c\n" +
    "  join[CategoryLng] cl on cl.[CategoryId] = c.[Id]\n" +
    "  join[CourseCategory] cc on cc.[CategoryId] = c.[Id]\n" +
    "where cc.[CourseId] in (<%= courseIds %>)";

const GET_COURSE_ID_MYSQL =
    "select `Id` from `Course` where `URL` = '<%= courseUrl %>'";

const GET_LESSON_COURSE_ID_MYSQL =
    "select lc.`Id` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where c.`URL` = '<%= courseUrl %>' and l.`URL` = '<%= lessonUrl %>'";

const DEL_COURSE_BKM_MYSQL =
    "delete b from `Bookmark` b\n" +
    "  join`Course` c on c.`Id` = b.`CourseId`\n" +
    "where b.`UserId` = <%= userId %> and c.`URL` = '<%= courseUrl %>'";

const DEL_LESSON_BKM_MYSQL =
    "delete b from`Bookmark` b\n" +
    "  join`LessonCourse` lc on lc.`Id` = b.`LessonCourseId`\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where b.`UserId` = <%= userId %> and c.`URL` = '<%= courseUrl %>' and l.`URL` = '<%= lessonUrl %>'";

const GET_SHORT_BKM_MYSQL =
    "select c.`URL` from `Bookmark` b\n" +
    "  join`Course` c on c.`Id` = b.`CourseId`\n" +
    "where b.`UserId` = <%= userId %>\n" +
    "union\n" +
    "select CONCAT(c.`URL`, '/', l.`URL`) from`Bookmark` b\n" +
    "  join`LessonCourse` lc on lc.`Id` = b.`LessonCourseId`\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where b.`UserId` = <%= userId %>";

const GET_LESSON_IDS_BKM_MYSQL =
    "select l.`Id` from`Bookmark` b\n" +
    "  join`LessonCourse` lc on lc.`Id` = b.`LessonCourseId`\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where b.`UserId` = <%= userId %>\n" +
    "order by b.`Id` desc";

const GET_COURSE_IDS_BKM_MYSQL =
    "select c.`Id` from `Bookmark` b\n" +
    "  join`Course` c on c.`Id` = b.`CourseId`\n" +
    "where b.`UserId` = <%= userId %>\n" +
    "order by b.`Id` desc";

const GET_COURSES_BY_IDS_MYSQL =
    "select c.`Id`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`URL`, cl.`Name` from `Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "where c.`Id` in (<%= courseIds %>)";

const GET_AUTHORS_BY_COURSE_IDS_MYSQL =
    "select a.`Id`, ac.`CourseId`, a.`Portrait`, a.`PortraitMeta`, a.`URL`,\n" +
    "  al.`FirstName`, al.`LastName` from `Author` a\n" +
    "  join`AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "  join`AuthorToCourse` ac on ac.`AuthorId` = a.`Id`\n" +
    "where ac.`CourseId` in (<%= courseIds %>)";

const GET_CATEGORIES_BY_COURSE_IDS_MYSQL =
    "select c.`Id`, cc.`CourseId`, c.`URL`, cl.`Name` from `Category` c\n" +
    "  join`CategoryLng` cl on cl.`CategoryId` = c.`Id`\n" +
    "  join`CourseCategory` cc on cc.`CategoryId` = c.`Id`\n" +
    "where cc.`CourseId` in (<%= courseIds %>)";

const GET_SUBS_INFO_MSSQL =
    "select u.[SysParentId] as [Id], u.[SubsAutoPayId], u.[SubsExpDate], u.[SubsAutoPay], c.[ChequeData], a.[Error] from [User] u\n" +
    "  left join[Cheque] c on c.[Id] = u.[SubsAutoPayId]\n" +
    "  left join[AutoSubscription] a on a.[UserId] = u.[SysParentId] and a.[SubsExpDate] = u.[SubsExpDate]\n" +
    "where u.[SysParentId] = <%= id %>";

const GET_SUBS_INFO_MYSQL =
    "select u.`SysParentId` as `Id`, u.`SubsAutoPayId`, u.`SubsExpDate`, u.`SubsAutoPay`, c.`ChequeData`, a.`Error` from `User` u\n" +
    "  left join`Cheque` c on c.`Id` = u.`SubsAutoPayId`\n" +
    "  left join`AutoSubscription` a on a.`UserId` = u.`SysParentId` and a.`SubsExpDate` = u.`SubsExpDate`\n" +
    "where u.`SysParentId` = <%= id %>";

const MAX_LESSONS_REQ_NUM = 15;
const MAX_COURSES_REQ_NUM = 1;

const DbUser = class DbUser extends DbObject {

    constructor(options) {
        super(options);
        this._usersCache = UsersCache();
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

    getSubsInfo(userId) {
        return new Promise(resolve => {
            let rc = $data.execSql({
                dialect: {
                    mysql: _.template(GET_SUBS_INFO_MYSQL)({ id: userId }),
                    mssql: _.template(GET_SUBS_INFO_MSSQL)({ id: userId })
                }
            }, {});
            resolve(rc);
        })
            .then(result => {
                if (result && result.detail && (result.detail.length === 1)) {
                    let row = result.detail[0];
                    let res = {
                        Id: row.Id,
                        SubsAutoPay: row.SubsAutoPay ? true : false,
                        SubsExpDate: row.SubsExpDate,
                        SubsExpDate: row.SubsExpDate,
                        Payment: null,
                        Error: null
                    };
                    if (row.ChequeData) {
                        let payment = JSON.parse(row.ChequeData);
                        if (payment.payment_method)
                            res.Payment = payment.payment_method;
                    }
                    if (row.Error) {
                        let err = row.Error;
                        try {
                            err = JSON.parse(err);
                        }
                        catch (e) { }
                        res.Error = err;
                    }
                    return res;
                }
                else
                    throw new HttpError(HttpCode.ERR_NOT_FOUND, "Can't find user '" + userId + "'.");
               
            })
    }

    getHistory(id, lessonFilter) {
        let positions = {};
        let lessonIds = [];
        let history = { Lessons: [], Courses: {}, Authors: {} };

        return new Promise((resolve, reject) => {
            resolve(PositionsService().getAllLessonPositions(id));
        })
            .then((result) => {
                positions = result;
                let ids = [];
                if (typeof (lessonFilter) === "function")
                    ids = lessonFilter()
                else {
                    if (result)
                        for (let i in result)
                            ids.push(parseInt(i));
                }
                return ids;
            })
            .then((result) => {
                lessonIds = result;
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
                                    let now = new Date();
                                    result.detail.forEach((elem) => {
                                        course = history.Courses[elem.Id];
                                        if (!course) {
                                            course = {
                                                Id: elem.Id,
                                                LanguageId: elem.LanguageId,
                                                Cover: elem.Cover,
                                                CoverMeta: elem.CoverMeta,
                                                Mask: elem.Mask,
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
                                                isSubLesson: false,
                                                ReadyDate: elem.ReadyDate,
                                                State: elem.State,
                                                Cover: elem.LCover,
                                                CoverMeta: elem.LCoverMeta,
                                                URL: elem.LURL,
                                                IsAuthRequired: elem.IsAuthRequired ? true : false,
                                                IsSubsRequired: elem.IsSubsRequired ? true : false,
                                                Name: elem.LName,
                                                Duration: elem.Duration,
                                                DurationFmt: elem.DurationFmt,
                                                AuthorId: elem.AuthorId,
                                                Audios: []
                                            };
                                            if (lsn.IsSubsRequired && elem.FreeExpDate && ((now - elem.FreeExpDate) > Intervals.MIN_FREE_LESSON))
                                                lsn.FreeExpDate = elem.FreeExpDate;
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
                                                    lsn.isSubLesson = true;
                                                }
                                            }
                                            lsn_list[elem.LessonId] = lsn;
                                            if (lessons[elem.LessonId]) {
                                                let pos = positions[elem.LessonId];
                                                if (pos) {
                                                    lsn.Pos = pos.pos;
                                                    lsn.LastVisit = new Date(pos.ts);
                                                    lsn.isFinished = pos.isFinished ? true : false;
                                                }
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

    update(id, data, options) {
        return new Promise((resolve, reject) => {
            resolve(this._usersCache.editUser(id, data, options));
        })
    }

    getExtBookmarks(userId) {
        let courseIds = [];
        let courseList = {};
        let bookmarks = { Authors: {}, Categories: {}, LessonCourses: {}, Courses: [], Lessons: [] };
        let opts = {};
        let arrayOfIds = [];
        let lessonBoookmarkOrder = {};
        let courseBoookmarkOrder = {};
        
        function getLessonIdsByBookmarks() {
            return new Promise((resolve, reject) => {
                resolve($data.execSql({
                    dialect: {
                        mysql: _.template(GET_LESSON_IDS_BKM_MYSQL)({ userId: userId }),
                        mssql: _.template(GET_LESSON_IDS_BKM_MSSQL)({ userId: userId })
                    }
                }, {}));
            })
                .then((result) => {
                    let res = [];
                    if (result && result.detail && (result.detail.length > 0)) {
                        let i = 0;
                        result.detail.forEach((elem) => {
                            res.push(elem.Id);
                            lessonBoookmarkOrder[elem.Id] = ++i;
                        })
                    }
                    return res;
                });
        };

        function prepareArrayOfIds() {
            let restIds = courseIds.length;
            let currPos = 0;
            let arrayOfIds = [];
            while (restIds > 0) {
                let len = restIds > MAX_COURSES_REQ_NUM ? MAX_COURSES_REQ_NUM : restIds;
                arrayOfIds.push(courseIds.slice(currPos, currPos + len));
                restIds -= len;
                currPos += len;
            }
            return arrayOfIds;
        }

        return new Promise((resolve, reject) => {
            resolve(this.getHistory(userId, getLessonIdsByBookmarks))
        })
            .then((result) => {
                bookmarks.Authors = result.Authors;
                bookmarks.LessonCourses = result.Courses;
                bookmarks.Lessons = result.Lessons;
                bookmarks.Lessons.forEach((elem) => {
                    elem.Order = lessonBoookmarkOrder[elem.Id];
                })
                return $data.execSql({
                    dialect: {
                        mysql: _.template(GET_COURSE_IDS_BKM_MYSQL)({ userId: userId }),
                        mssql: _.template(GET_COURSE_IDS_BKM_MSSQL)({ userId: userId })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let i = 0;
                            result.detail.forEach((elem) => {
                                courseIds.push(elem.Id);
                                courseBoookmarkOrder[elem.Id] = ++i;
                            })
                        }
                    });
            })
            .then(() => {
                if (courseIds.length > 0) {
                    arrayOfIds = prepareArrayOfIds();
                    return Utils.seqExec(arrayOfIds, (elem) => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_COURSES_BY_IDS_MYSQL)({ courseIds: elem.join() }),
                                mssql: _.template(GET_COURSES_BY_IDS_MSSQL)({ courseIds: elem.join() })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0)) {
                                    result.detail.forEach((elem) => {
                                        let course = {
                                            Id: elem.Id,
                                            Name: elem.Name,
                                            URL: elem.URL,
                                            Cover: elem.Cover,
                                            CoverMeta: elem.CoverMeta,
                                            Mask: elem.Mask,
                                            Order: courseBoookmarkOrder[elem.Id],
                                            Authors: [],
                                            Categories: []
                                        };
                                        bookmarks.Courses.push(course);
                                        courseList[elem.Id] = course;
                                    })
                                }
                            })
                    });
                }
            })
            .then(() => {
                if (courseIds.length > 0) {
                    return Utils.seqExec(arrayOfIds, (elem) => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_AUTHORS_BY_COURSE_IDS_MYSQL)({ courseIds: elem.join() }),
                                mssql: _.template(GET_AUTHORS_BY_COURSE_IDS_MSSQL)({ courseIds: elem.join() })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0)) {
                                    result.detail.forEach((elem) => {
                                        let author = bookmarks.Authors[elem.Id];
                                        if (!author) {
                                            author = {
                                                Id: elem.Id,
                                                URL: elem.URL,
                                                FirstName: elem.FirstName,
                                                LastName: elem.LastName,
                                                Portrait: elem.Portrait,
                                                PortraitMeta: elem.PortraitMeta
                                            };
                                            bookmarks.Authors[elem.Id] = author;
                                        }
                                        let course = courseList[elem.CourseId];
                                        if (course)
                                            course.Authors.push(author.Id);
                                    })
                                }
                            })
                    });
                }
            })
            .then(() => {
                if (courseIds.length > 0) {
                    return Utils.seqExec(arrayOfIds, (elem) => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_CATEGORIES_BY_COURSE_IDS_MYSQL)({ courseIds: elem.join() }),
                                mssql: _.template(GET_CATEGORIES_BY_COURSE_IDS_MSSQL)({ courseIds: elem.join() })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0)) {
                                    result.detail.forEach((elem) => {
                                        let category = bookmarks.Categories[elem.Id];
                                        if (!category) {
                                            category = {
                                                Id: elem.Id,
                                                URL: elem.URL,
                                                Name: elem.Name
                                            };
                                            bookmarks.Categories[elem.Id] = category;
                                        }
                                        let course = courseList[elem.CourseId];
                                        if (course)
                                            course.Categories.push(category.Id);
                                    })
                                }
                            })
                    });
                }
            })
            .then(() => {
                return bookmarks;
            });
    }
    
    getShortBookmarks(userId) {
        let opts = {};
        return new Promise((resolve, reject) => {
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_SHORT_BKM_MYSQL)({ userId: userId }),
                    mssql: _.template(GET_SHORT_BKM_MSSQL)({ userId: userId })
                }
            }, {}));
        })
            .then((result) => {
                let res = [];
                if (result && result.detail && (result.detail.length >0)) {
                    result.detail.forEach((elem) => {
                        res.push(elem.URL);
                    })
                }
                return res;
            });
    }
    
    insBookmark(userId, courseUrl, lessonUrl) {
        let isLessonBookmark = lessonUrl ? true : false;
        let opts = {};
        return new Promise((resolve, reject) => {
            let req = {};
            if (isLessonBookmark)
                req.dialect = {
                    mysql: _.template(GET_LESSON_COURSE_ID_MYSQL)({ courseUrl: courseUrl, lessonUrl: lessonUrl }),
                    mssql: _.template(GET_LESSON_COURSE_ID_MSSQL)({ courseUrl: courseUrl, lessonUrl: lessonUrl })
                }
            else
                req.dialect = {
                    mysql: _.template(GET_COURSE_ID_MYSQL)({ courseUrl: courseUrl }),
                    mssql: _.template(GET_COURSE_ID_MSSQL)({ courseUrl: courseUrl })
                };
            resolve($data.execSql(req, {}));
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length === 1))
                    return (result.detail[0].Id);
                else {
                    let msg = `Can't find course "/${courseUrl}".`;
                    if (isLessonBookmark)
                        msg = `Can't find lesson "/${courseUrl}/${lessonUrl}".`;
                    throw new Error(msg);
                }
            })
            .then((id) => {
                let root_obj;
                return this._getObjById(-1, { expr: { model: { name: "Bookmark" } } })
                    .then((result) => {
                        root_obj = result;
                        return root_obj.edit();
                    })
                    .then(() => {
                        let fields = { UserId: userId };
                        if (isLessonBookmark)
                            fields.LessonCourseId = id
                        else
                            fields.CourseId = id;
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            if (res instanceof Error)
                                throw res
                            else
                                if (res.message) {
                                    let message = res.message;
                                    let parsed = res.message.match(/.*?duplicate.*?u_Idx_Bookmark_UserId_.*/ig);
                                    if (parsed) {
                                        message = `Duplicate course "/${courseUrl}" bookmark has been ignored.`;
                                        if (isLessonBookmark)
                                            message = `Duplicate lesson "/${courseUrl}/${lessonUrl}" bookmark has been ignored.`;
                                        res = { result: "WARN", message: message };
                                    }
                                    else
                                        throw new Error(message);
                                }
                                else
                                    throw res;
                        return res;
                    })
            })
    }

    delBookmark(userId, courseUrl, lessonUrl) {
        let isLessonBookmark = lessonUrl ? true : false;
        let opts = {};
        return new Promise((resolve, reject) => {
            let req = {};
            if (isLessonBookmark)
                req.dialect = {
                    mysql: _.template(DEL_LESSON_BKM_MYSQL)({ userId: userId, courseUrl: courseUrl, lessonUrl: lessonUrl }),
                    mssql: _.template(DEL_LESSON_BKM_MSSQL)({ userId: userId, courseUrl: courseUrl, lessonUrl: lessonUrl })
                }
            else
                req.dialect = {
                    mysql: _.template(DEL_COURSE_BKM_MYSQL)({ userId: userId, courseUrl: courseUrl }),
                    mssql: _.template(DEL_COURSE_BKM_MSSQL)({ userId: userId, courseUrl: courseUrl })
                };
            resolve($data.execSql(req, {}));
        })
            .then((result) => {
                return { result: "OK" };
            })
    }
};

let dbUser = null;
exports.UsersService = () => {
    return dbUser ? dbUser : dbUser = new DbUser();
}
