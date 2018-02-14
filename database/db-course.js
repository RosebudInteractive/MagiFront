const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { AUTHORS_BY_ID_MSSQL_PUBLIC_REQ, AUTHORS_BY_ID_MYSQL_PUBLIC_REQ } = require('../const/sql-req-common');
const _ = require('lodash');

const COURSE_REQ_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "CourseLng"
                    }
                },
                {
                    dataObject: {
                        name: "CourseCategory"
                    }
                },
                {
                    dataObject: {
                        name: "LessonCourse"
                    }
                },
                {
                    dataObject: {
                        name: "AuthorToCourse"
                    }
                }
            ]
        }
    }
};

const COURSE_UPD_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "CourseLng"
                    }
                },
                {
                    dataObject: {
                        name: "CourseCategory"
                    }
                },
                {
                    dataObject: {
                        name: "LessonCourse"
                    }
                },
                {
                    dataObject: {
                        name: "AuthorToCourse"
                    }
                }
            ]
        }
    }
};

const ACCOUNT_ID = 1;
const LANGUAGE_ID = 1;

const COURSE_MSSQL_ALL_REQ =
    "select c.[Id], c.[Color], c.[Cover], c.[CoverMeta], c.[State], c.[LanguageId], l.[Language] as [LanguageName], c.[URL], cl.[Name], cl.[Description] from [Course] c\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId] and c.[AccountId] = <%= accountId %> and cl.[LanguageId] = <%= languageId %>\n" +
    "  left join [Language] l on c.[LanguageId] = l.[Id]";

const COURSE_MYSQL_ALL_REQ =
    "select c.`Id`, c.`Color`, c.`Cover`, c.`CoverMeta`, c.`State`, c.`LanguageId`, l.`Language` as `LanguageName`, c.`URL`, cl.`Name`, cl.`Description` from `Course` c\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId` and c.`AccountId` = <%= accountId %> and cl.`LanguageId` = <%= languageId %>\n" +
    "  left join `Language` l on c.`LanguageId` = l.`Id`";

const COURSE_MSSQL_ID_REQ = COURSE_MSSQL_ALL_REQ + "\nwhere c.[Id] = <%= id %>";
const COURSE_MYSQL_ID_REQ = COURSE_MYSQL_ALL_REQ + "\nwhere c.`Id` = <%= id %>";

const COURSE_MSSQL_AUTHOR_REQ =
    "select a.[Id], l.[FirstName], l.[LastName] from [AuthorToCourse] ac\n" +
    "  join [Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join [AuthorLng] l on a.[Id] = l.[AuthorId] and l.[LanguageId] = <%= languageId %>\n" +
    "where ac.[CourseId] = <%= id %>";
const COURSE_MSSQL_CATEGORY_REQ =
    "select [CategoryId] as [Id] from [CourseCategory] where [CourseId] = <%= id %>";
const COURSE_MSSQL_LESSON_REQ =
    "select ls.[Id], lsl.[Name], lsl.[ShortDescription], lsl.[FullDescription], lc.[Number], lc.[ReadyDate], lc.[State], l.[Language] as [LanguageName] from [Lesson] ls\n" +
    "  join [LessonLng] lsl on ls.[Id] = lsl.[LessonId]\n" +
    "  join [Language] l on lsl.[LanguageId] = l.[Id]\n" +
    "  join [LessonCourse] lc on lc.[LessonId] = ls.[Id]\n" +
    "where (lc.[CourseId] = <%= id %>) and (lc.[ParentId] is NULL)\n"+
    "order by lc.[Number]";

const COURSE_MYSQL_AUTHOR_REQ =
    "select a.`Id`, l.`FirstName`, l.`LastName` from `AuthorToCourse` ac\n" +
    "  join `Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join `AuthorLng` l on a.`Id` = l.`AuthorId` and l.`LanguageId` = <%= languageId %>\n" +
    "where ac.`CourseId` = <%= id %>";
const COURSE_MYSQL_CATEGORY_REQ =
    "select `CategoryId` as `Id` from `CourseCategory` where `CourseId` = <%= id %>";
const COURSE_MYSQL_LESSON_REQ =
    "select ls.`Id`, lc.`CourseId`, lsl.`Name`, lsl.`ShortDescription`, lsl.`FullDescription`, lc.`Number`, lc.`ReadyDate`, lc.`State`, l.`Language` as `LanguageName` from `Lesson` ls\n" +
    "  join `LessonLng` lsl on ls.`Id` = lsl.`LessonId`\n" +
    "  join `Language` l on lsl.`LanguageId` = l.`Id`\n" +
    "  join `LessonCourse` lc on lc.`LessonId` = ls.`Id`\n" +
    "where (lc.`CourseId` = <%= id %>) and (lc.`ParentId` is NULL)\n" +
    "order by lc.`Number`";

const COURSE_MSSQL_DELETE_SCRIPT =
    [
        "delete el from [Course] c\n" +
        "  join[Lesson] l on c.[Id] = l.[CourseId]\n" +
        "  join[EpisodeLesson] el on l.[Id] = el.[EpisodeId]\n" +
        "where c.[Id] = <%= id %>",
        "delete l from [LessonCourse] l\n" +
        "where l.[CourseId] = <%= id %> and (not l.[ParentId] is NULL)",
        "delete l from [LessonCourse] l\n" +
        "where l.[CourseId] = <%= id %>",
        "delete ec from [Course] c\n" +
        "  join[Lesson] l on c.[Id] = l.[CourseId]\n" +
        "  join[Episode] e on l.[Id] = e.[LessonId]\n" +
        "  join[EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
        "  join[EpisodeContent] ec on el.[Id] = ec.[EpisodeLngId]\n" +
        "where c.[Id] = <%= id %>",
        "delete l from [Course] c\n" +
        "  join [Lesson] l on c.[Id] = l.[CourseId]\n" +
        "where c.[Id] = <%= id %> and (not l.[ParentId] is NULL)",
        "delete l from [Course] c\n" +
        "  join [Lesson] l on c.[Id] = l.[CourseId]\n" +
        "where c.[Id] = <%= id %>"
    ];

const COURSE_MYSQL_DELETE_SCRIPT =
    [
        "delete el from `Course` c\n" +
        "  join`Lesson` l on c.`Id` = l.`CourseId`\n" +
        "  join`EpisodeLesson` el on l.`Id` = el.`EpisodeId`\n" +
        "where c.`Id` = <%= id %>",
        "delete l from `LessonCourse` l\n" +
        "where l.`CourseId` = <%= id %> and (not l.`ParentId` is NULL)",
        "delete l from `LessonCourse` l\n" +
        "where l.`CourseId` = <%= id %>",
        "delete ec from `Course` c\n" +
        "  join`Lesson` l on c.`Id` = l.`CourseId`\n" +
        "  join`Episode` e on l.`Id` = e.`LessonId`\n" +
        "  join`EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
        "  join`EpisodeContent` ec on el.`Id` = ec.`EpisodeLngId`\n" +
        "where c.`Id` = <%= id %>",
        "delete l from `Course` c\n" +
        "  join `Lesson` l on c.`Id` = l.`CourseId`\n" +
        "where c.`Id` = <%= id %> and (not l.`ParentId` is NULL)",
        "delete l from `Course` c\n" +
        "  join `Lesson` l on c.`Id` = l.`CourseId`\n" +
        "where c.`Id` = <%= id %>"
    ];

const LESSON_MSSQL_DELETE_SCRIPT =
    [
        "delete el from [Lesson] l\n" +
        "  join [EpisodeLesson] el on l.[Id] = el.[LessonId]\n" +
        "where l.[Id] = <%= id %>",
        "delete ec from [Lesson] l\n" +
        "  join[Episode] e on l.[Id] = e.[LessonId]\n" +
        "  join[EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
        "  join[EpisodeContent] ec on el.[Id] = ec.[EpisodeLngId]\n" +
        "where l.[Id] = <%= id %>",
        "delete from[Lesson] where [Id] = <%= id %>"
    ];

const LESSON_MYSQL_DELETE_SCRIPT =
    [
        "delete el from `Lesson` l\n" +
        "  join `EpisodeLesson` el on l.`Id` = el.`LessonId`\n" +
        "where l.`Id` = <%= id %>",
        "delete ec from `Lesson` l\n" +
        "  join`Episode` e on l.`Id` = e.`LessonId`\n" +
        "  join`EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
        "  join`EpisodeContent` ec on el.`Id` = ec.`EpisodeLngId`\n" +
        "where l.`Id` = <%= id %>",
        "delete from`Lesson` where `Id` = <%= id %>"
    ];

const COURSE_LESSONS_MSSQL =
    "select [Id], [ParentId] from [Lesson] where [CourseId] = <%= id %>";

const COURSE_LESSONS_MYSQL =
    "select `Id`, `ParentId` from `Lesson` where `CourseId` = <%= id %>";

const COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select c.[Id], l.[Id] as [LessonId], c.[Cover], c.[CoverMeta], c.[Color], cl.[Name], c.[URL], lc.[Number], lc.[ReadyDate],\n" +
    "lc.[State], l.[Cover] as [LCover], l.[CoverMeta] as [LCoverMeta], l.[URL] as [LURL],\n" +
    "ll.[Name] as [LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId] from [Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id] and cl.[LanguageId] = <%= languageId %>\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id] and ll.[LanguageId] = <%= languageId %>\n" +
    "where c.[AccountId] = <%= accountId %> and c.[State] = 'P' and (l.[ParentId] is NULL)\n" +
    "order by lc.[State] desc, lc.[ReadyDate] desc";
const AUTHOR_COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select ac.[CourseId], a.[Id], l.[FirstName], l.[LastName], a.[URL] from [AuthorToCourse] ac\n" +
    "  join[Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join[AuthorLng] l on l.[AuthorId] = a.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by ac.[CourseId]";
const CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select cc.[CourseId], c.[Id], l.[Name], c.[URL] from [CourseCategory] cc\n" +
    "  join[Category] c on c.[Id] = cc.[CategoryId]\n" +
    "  join[CategoryLng] l on l.[CategoryId] = c.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by cc.[CourseId]";

const COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select c.`Id`, l.`Id` as `LessonId`, c.`Cover`, c.`CoverMeta`, c.`Color`, cl.`Name`, c.`URL`, lc.`Number`, lc.`ReadyDate`,\n" +
    "lc.`State`, l.`Cover` as `LCover`, l.`CoverMeta` as `LCoverMeta`, l.`URL` as `LURL`,\n" +
    "ll.`Name` as `LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId` from `Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id` and cl.`LanguageId` = <%= languageId %>\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id` and ll.`LanguageId` = <%= languageId %>\n" +
    "where c.`AccountId` = <%= accountId %> and c.`State` = 'P' and (l.`ParentId` is NULL)\n" +
    "order by lc.`State` desc, lc.`ReadyDate` desc";
const AUTHOR_COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select ac.`CourseId`, a.`Id`, l.`FirstName`, l.`LastName`, a.`URL` from `AuthorToCourse` ac\n" +
    "  join`Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join`AuthorLng` l on l.`AuthorId` = a.`Id` and l.`LanguageId` = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by ac.`CourseId`";
const CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select cc.`CourseId`, c.`Id`, l.`Name`, c.`URL` from `CourseCategory` cc\n" +
    "  join`Category` c on c.`Id` = cc.`CategoryId`\n" +
    "  join`CategoryLng` l on l.`CategoryId` = c.`Id` and l.`LanguageId` = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by cc.`CourseId`";

const COURSE_MSSQL_PUBLIC_REQ =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], l.[Id] as[LessonId], c.[Cover], c.[CoverMeta], c.[Color], cl.[Name],\n" +
    "  cl.[Description], c.[URL], lc.[Number], lc.[ReadyDate],\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[URL] as[LURL],\n" +
    "  ll.[Name] as[LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId] from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id] and cl.[LanguageId] = <%= languageId %>\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id] and ll.[LanguageId] = <%= languageId %>\n" +
    "where c.[URL] = '<%= courseUrl %>'\n" +
    "order by lc.[ParentId], lc.[Number]";
const AUTHOR_COURSE_MSSQL_PUBLIC_REQ =
    "select ac.[CourseId], a.[Id], l.[FirstName], l.[LastName], a.[Portrait], a.[PortraitMeta], a.[URL] from [AuthorToCourse] ac\n" +
    "  join[Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join[AuthorLng] l on l.[AuthorId] = a.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "where ac.[CourseId] = <%= courseId %>\n" +
    "order by ac.[CourseId]";
const CATEGORY_COURSE_MSSQL_WHERE = "where cc.[CourseId] = <%= courseId %>\n";
const COURSE_REF_MSSQL_PUBLIC_REQ =
    "select l.[Id], count(r.[Id]) as [NRef] from [Course] c\n" +
    "  join [LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join [Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id] and ll.[LanguageId] = <%= languageId %>\n" +
    "  join [Reference] r on r.[LessonLngId] = ll.[Id] and r.[Recommended] = 0\n" +
    "where c.[Id] = <%= courseId %> and(l.[ParentId] is NULL)\n" +
    "group by l.[Id]";
const COURSE_REC_MSSQL_PUBLIC_REQ =
    "select l.[Id] as [LessonId], r.[Id], r.[Description] from[Course] c\n" +
    "  join [LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join [Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id] and ll.[LanguageId] = <%= languageId %>\n" +
    "  join [Reference] r on r.[LessonLngId] = ll.[Id] and r.[Recommended] = 1\n" +
    "where c.[Id] = <%= courseId %> and(l.[ParentId] is NULL)\n" +
    "order by l.[Id]";
    
const COURSE_MYSQL_PUBLIC_REQ =
    "select lc.`Id` as`LcId`, lc.`ParentId`, c.`Id`, l.`Id` as`LessonId`, c.`Cover`, c.`CoverMeta`, c.`Color`, cl.`Name`,\n" +
    "  cl.`Description`, c.`URL`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`URL` as`LURL`,\n" +
    "  ll.`Name` as`LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId` from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id` and cl.`LanguageId` = <%= languageId %>\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id` and ll.`LanguageId` = <%= languageId %>\n" +
    "where c.`URL` = '<%= courseUrl %>'\n" +
    "order by lc.`ParentId`, lc.`Number`";
const CATEGORY_COURSE_MYSQL_WHERE = "where cc.`CourseId` = <%= courseId %>\n";
const COURSE_REF_MYSQL_PUBLIC_REQ =
    "select l.`Id`, count(r.`Id`) as `NRef` from `Course` c\n" +
    "  join `LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join `Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id` and ll.`LanguageId` = <%= languageId %>\n" +
    "  join `Reference` r on r.`LessonLngId` = ll.`Id` and r.`Recommended` = 0\n" +
    "where c.`Id` = <%= courseId %> and(l.`ParentId` is NULL)\n" +
    "group by l.`Id`";
const COURSE_REC_MYSQL_PUBLIC_REQ =
    "select l.`Id` as `LessonId`, r.`Id`, r.`Description` from`Course` c\n" +
    "  join `LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join `Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id` and ll.`LanguageId` = <%= languageId %>\n" +
    "  join `Reference` r on r.`LessonLngId` = ll.`Id` and r.`Recommended` = 1\n" +
    "where c.`Id` = <%= courseId %> and(l.`ParentId` is NULL)\n" +
    "order by l.`Id`";

const DbCourse = class DbCourse extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || COURSE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID }),
                        mssql: _.template(COURSE_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID })
                    }
                }, {})
                    .then((result) => {
                        return result.detail;
                    })
            );
        })
    }

    getAllPublic() {
        let courses = [];
        let authors = [];
        let categories = [];
        let courses_list = {};
        let authors_list = {};
        let categories_list = {};

        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ALL_PUBLIC_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID }),
                        mssql: _.template(COURSE_MSSQL_ALL_PUBLIC_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let crs_id = -1;
                            let curr_course;
                            result.detail.forEach((elem) => {
                                if (elem.Id !== crs_id) {
                                    crs_id = elem.Id;
                                    curr_course = courses_list[elem.Id];
                                    if (!curr_course) {
                                        curr_course = {
                                            Id: elem.Id,
                                            Cover: elem.Cover,
                                            CoverMeta: elem.CoverMeta,
                                            Color: elem.Color,
                                            Name: elem.Name,
                                            URL: elem.URL,
                                            Authors: [],
                                            Categories: [],
                                            Lessons: []
                                        };
                                        courses_list[elem.Id] = curr_course;
                                        courses.push(curr_course);
                                    }
                                };
                                curr_course.Lessons.push({
                                    Id: elem.LessonId,
                                    Number: elem.Number,
                                    ReadyDate: elem.ReadyDate,
                                    State: elem.State,
                                    Cover: elem.LCover,
                                    CoverMeta: elem.LCoverMeta,
                                    URL: elem.LURL,
                                    Name: elem.LName,
                                    ShortDescription: elem.ShortDescription,
                                    Duration: elem.Duration,
                                    DurationFmt: elem.DurationFmt,
                                    AuthorId: elem.AuthorId
                                });
                            })
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(AUTHOR_COURSE_MYSQL_ALL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, whereClause: "" }),
                                    mssql: _.template(AUTHOR_COURSE_MSSQL_ALL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, whereClause: "" })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let crs_id = -1;
                            let curr_course;
                            result.detail.forEach((elem) => {
                                if (elem.CourseId !== crs_id) {
                                    crs_id = elem.CourseId;
                                    curr_course = courses_list[crs_id];
                                };
                                if (curr_course)
                                    curr_course.Authors.push(elem.Id);
                                if (!authors_list[elem.Id]) {
                                    let author = {
                                        Id: elem.Id,
                                        FirstName: elem.FirstName,
                                        LastName: elem.LastName,
                                        URL: elem.URL
                                    };
                                    authors.push(author);
                                    authors_list[elem.Id] = author;
                                }
                            })
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, whereClause: "" }),
                                    mssql: _.template(CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, whereClause: "" })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let crs_id = -1;
                            let curr_course;
                            result.detail.forEach((elem) => {
                                if (elem.CourseId !== crs_id) {
                                    crs_id = elem.CourseId;
                                    curr_course = courses_list[crs_id];
                                };
                                if (curr_course)
                                    curr_course.Categories.push(elem.Id);
                                let category = categories_list[elem.Id];
                                if (!category) {
                                    category = {
                                        Id: elem.Id,
                                        Name: elem.Name,
                                        URL: elem.URL,
                                        Counter: 0
                                    };
                                    categories.push(category);
                                    categories_list[elem.Id] = category;
                                }
                                category.Counter++;
                            })
                        }
                        return {
                            Authors: authors,
                            Categories: categories,
                            Courses: courses
                        };
                    })
            );
        })
    }

    getPublic(url) {
        let course = null;
        let courseId = 0;
        let lsn_list = {};
        let lc_list = {};
        
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, courseUrl: url }),
                        mssql: _.template(COURSE_MSSQL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, courseUrl: url })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let isFirst = true;
                            let authors_list = {};
                            result.detail.forEach((elem) => {
                                if (isFirst) {
                                    isFirst = false;
                                    courseId = elem.Id;
                                    course = {
                                        Id: elem.Id,
                                        Cover: elem.Cover,
                                        CoverMeta: elem.CoverMeta,
                                        Color: elem.Color,
                                        Name: elem.Name,
                                        Description: elem.Description,
                                        URL: elem.URL,
                                        Authors: [],
                                        Categories: [],
                                        Lessons: [],
                                        Books: []
                                    };
                                };
                                let lsn = {
                                    Id: elem.LessonId,
                                    Number: elem.Number,
                                    ReadyDate: elem.ReadyDate,
                                    State: elem.State,
                                    Cover: elem.LCover,
                                    CoverMeta: elem.LCoverMeta,
                                    URL: elem.LURL,
                                    Name: elem.LName,
                                    ShortDescription: elem.ShortDescription,
                                    Duration: elem.Duration,
                                    DurationFmt: elem.DurationFmt,
                                    AuthorId: elem.AuthorId,
                                    NSub: 0,
                                    NRefBooks: 0,
                                    NBooks: 0,
                                    Lessons: []
                                };
                                authors_list[elem.AuthorId] = true;
                                if (!elem.ParentId) {
                                    course.Lessons.push(lsn);                                   
                                    lc_list[elem.LcId] = lsn;
                                }
                                else {
                                    let parent = lc_list[elem.ParentId];
                                    if (parent) {
                                        parent.Lessons.push(lsn);
                                        parent.NSub++;
                                    }
                                }
                                lsn_list[elem.LessonId] = lsn;
                            })
                            let authors = "";
                            isFirst = true;
                            for (let author in authors_list) {
                                if (!isFirst)
                                    authors += ",";
                                authors += author;
                                isFirst = false;
                            }
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(AUTHORS_BY_ID_MYSQL_PUBLIC_REQ)(
                                        {
                                            languageId: LANGUAGE_ID,
                                            authors: authors
                                        }),
                                    mssql: _.template(AUTHORS_BY_ID_MSSQL_PUBLIC_REQ)(
                                        {
                                            languageId: LANGUAGE_ID,
                                            authors: authors
                                        })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let author = {
                                    Id: elem.Id,
                                    FirstName: elem.FirstName,
                                    LastName: elem.LastName,
                                    Portrait: elem.Portrait,
                                    PortraitMeta: elem.PortraitMeta,
                                    URL: elem.URL
                                };
                                course.Authors.push(author);
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ)(
                                        {
                                            languageId: LANGUAGE_ID,
                                            whereClause: _.template(CATEGORY_COURSE_MYSQL_WHERE)({ courseId: courseId })
                                        }),
                                    mssql: _.template(CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ)(
                                        {
                                            languageId: LANGUAGE_ID,
                                            whereClause: _.template(CATEGORY_COURSE_MSSQL_WHERE)({ courseId: courseId })
                                        })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let category = {
                                    Id: elem.Id,
                                    Name: elem.Name,
                                    URL: elem.URL
                                };
                                course.Categories.push(category);
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(COURSE_REF_MYSQL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, courseId: courseId }),
                                    mssql: _.template(COURSE_REF_MSSQL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, courseId: courseId })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let lsn = lsn_list[elem.Id]
                                if (lsn)
                                    lsn.NRefBooks = elem.NRef;
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(COURSE_REC_MYSQL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, courseId: courseId }),
                                    mssql: _.template(COURSE_REC_MSSQL_PUBLIC_REQ)({ languageId: LANGUAGE_ID, courseId: courseId })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let lsn = lsn_list[elem.LessonId]
                                if (lsn)
                                    lsn.NBooks++;
                                course.Books.push({
                                    Id: elem.Id,
                                    Description: elem.Description
                                });
                            })
                        }
                        return course;
                    })
            );
        })
    }

    getAuthors(id) {
        let course = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        let authors = [];
                        if (result && result.detail && (result.detail.length > 0))
                            authors = result.detail;
                        return authors;
                    })
            );
        })
    }

    get(id) {
        let course = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(COURSE_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1))
                            course = result.detail[0];
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let authors = [];
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach(function (element) {
                                authors.push(element.Id);
                            });
                        }
                        course.Authors = authors;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_CATEGORY_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_CATEGORY_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let categories = [];
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach(function (element) {
                                categories.push(element.Id);
                            });
                        }
                        course.Categories = categories;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_LESSON_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_LESSON_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        course.Lessons = [];
                        if (result && result.detail && (result.detail.length > 0))
                            course.Lessons = result.detail;
                        return course;
                    })
            );
        })
    }

    del(id) {
        let self = this;
        return new Promise((resolve, reject) => {
            let root_obj;
            let course_obj = null;
            let opts = {};
            let collection = null;
            let transactionId = null;
            resolve(
                this._getObjById(id, {
                    expr: {
                        model: {
                            name: "Course"
                        }
                    }
                })
                    .then((result) => {
                        root_obj = result;
                        collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + id + ") doesn't exist.");
                        course_obj = collection.get(0);
                        return result.edit()
                    })
                    .then(() => {
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                            });
                    })
                    .then(() => {
                        let mysql_script = [];
                        COURSE_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                            mysql_script.push(_.template(elem)({ id: id }));
                        });
                        let mssql_script = [];
                        COURSE_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                            mssql_script.push(_.template(elem)({ id: id }));
                        });
                        return DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                    })
                    .then(() => {
                        collection._del(course_obj);
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Course deleted: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
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

    update(id, data) {
        let self = this;
        return new Promise((resolve, reject) => {
            let root_obj;
            let crs_obj;
            let crs_lng_obj;
            let root_auth;
            let root_ctg;
            let root_ls;
            let auth_collection;
            let ls_collection;
            let ls_own_collection;
            let ctg_collection;
            let auth_list = {};
            let ctg_list = {};
            let ls_list = {};
            let opts = {};
            let inpFields = data || {};
            
            let auth_new = [];
            let ctg_new = [];
            let ls_new = [];

            let needToDeleteOwn = false;
            let transactionId = null;

            let lsn_deleted = {};
            let lsn_child_deleted = [];
            let lc_deleted = {};
            let lc_child_deleted = [];

            resolve(
                this._getObjById(id)
                    .then((result) => {
                        root_obj = result;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_LESSONS_MYSQL)({ id: id }),
                                mssql: _.template(COURSE_LESSONS_MSSQL)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        ls_own_collection = [];
                        if (result && result.detail && (result.detail.length > 0))
                            ls_own_collection = result.detail;

                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + id + ") doesn't exist.");
                        crs_obj = collection.get(0);
                        collection = crs_obj.getDataRoot("CourseLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + id + ") has inconsistent \"LNG\" part.");
                        crs_lng_obj = collection.get(0);

                        root_auth = crs_obj.getDataRoot("AuthorToCourse");
                        auth_collection = root_auth.getCol("DataElements");
                        root_ctg = crs_obj.getDataRoot("CourseCategory");
                        ctg_collection = root_ctg.getCol("DataElements");
                        root_ls = crs_obj.getDataRoot("LessonCourse");
                        ls_collection = root_ls.getCol("DataElements");

                        if (inpFields.Authors && (typeof (inpFields.Authors.length) === "number")) {
                            for (let i = 0; i < auth_collection.count(); i++) {
                                let obj = auth_collection.get(i);
                                auth_list[obj.authorId()] = { deleted: true, obj: obj };
                            }

                            inpFields.Authors.forEach((elem) => {
                                if (auth_list[elem])
                                    delete auth_list[elem]
                                else
                                    auth_new.push(elem);
                            })
                        }

                        if (inpFields.Categories && (typeof (inpFields.Categories.length) === "number")) {
                            for (let i = 0; i < ctg_collection.count(); i++) {
                                let obj = ctg_collection.get(i);
                                ctg_list[obj.categoryId()] = { deleted: true, obj: obj };
                            }

                            inpFields.Categories.forEach((elem) => {
                                if (ctg_list[elem])
                                    delete ctg_list[elem]
                                else
                                    ctg_new.push(elem);
                            })
                        }

                        if (inpFields.Lessons && (typeof (inpFields.Lessons.length) === "number")) {
                            for (let i = 0; i < ls_collection.count(); i++) {
                                let obj = ls_collection.get(i);
                                let deleted = typeof (obj.parentId()) !== "number";
                                ls_list[obj.lessonId()] = { deleted: deleted, isOwner: false, obj: obj };
                            }

                            for (let i = 0; i < ls_own_collection.length; i++) {
                                let obj = ls_own_collection[i];
                                if (!ls_list[obj.Id])
                                    throw new Error("Unknown own lesson (Id = " + obj.Id + ").");
                                ls_list[obj.Id].isOwner = true;
                                ls_list[obj.Id].ownObj = obj;
                            }

                            let Number = 1;
                            inpFields.Lessons.forEach((elem) => {
                                let data = {
                                    LessonId: elem.LessonId,
                                    Number: Number++,
                                    ReadyDate: elem.ReadyDate ? elem.ReadyDate : null,
                                    State: elem.State
                                };
                                if (ls_list[elem.LessonId]) {
                                    ls_list[elem.LessonId].deleted = false;
                                    ls_list[elem.LessonId].data = data;
                                }
                                else
                                    ls_new.push(data);
                            })
                        }

                        return crs_obj.edit()
                    })
                    .then(() => {

                        if (inpFields["Color"])
                            crs_obj.color(inpFields["Color"]);
                        if (inpFields["Cover"])
                            crs_obj.cover(inpFields["Cover"]);
                        if (inpFields["CoverMeta"])
                            crs_obj.coverMeta(inpFields["CoverMeta"]);
                        if (inpFields["State"])
                            crs_obj.state(inpFields["State"]);
                        if (inpFields["LanguageId"])
                            crs_obj.languageId(inpFields["LanguageId"]);
                        if (inpFields["URL"])
                            crs_obj.uRL(inpFields["URL"]);

                        crs_obj.oneLesson(false);
                        if (typeof (inpFields["OneLesson"]) === "boolean")
                            crs_obj.oneLesson(inpFields["OneLesson"]);
                        
                        if (inpFields["State"])
                            crs_lng_obj.state(inpFields["State"] === "P" ? "R" : inpFields["State"]);
                        if (inpFields["Name"])
                            crs_lng_obj.name(inpFields["Name"]);
                        if (inpFields["Description"])
                            crs_lng_obj.description(inpFields["Description"]);

                        for (let key in auth_list)
                            auth_collection._del(auth_list[key].obj);
                        
                        for (let key in ctg_list)
                            ctg_collection._del(ctg_list[key].obj);

                        for (let key in ls_list)
                            if (ls_list[key].deleted) {
                                if (ls_list[key].isOwner) {
                                    needToDeleteOwn = true;
                                    lsn_deleted[ls_list[key].obj.id()] = ls_list[key].obj;
                                }
                                lc_deleted[ls_list[key].obj.id()] = ls_list[key].obj;
                                //ls_collection._del(ls_list[key].obj);
                            }
                            else {
                                if (typeof (ls_list[key].obj.parentId()) !== "number") {
                                    ls_list[key].obj.number(ls_list[key].data.Number);
                                    ls_list[key].obj.readyDate(ls_list[key].data.ReadyDate);
                                    ls_list[key].obj.state(ls_list[key].data.State);
                                }
                            }
                        for (let key in ls_list) {
                            let parent_id = ls_list[key].obj.parentId();
                            if (typeof (parent_id) === "number") {
                                if (lc_deleted[parent_id]) {
                                    lc_child_deleted.push(ls_list[key].obj);
                                    if (lsn_deleted[parent_id])
                                        lsn_child_deleted.push(ls_list[key].obj);
                                }
                            }
                        }
                        if (lc_child_deleted.length > 0) {
                            for (let i = 0; i < lc_child_deleted.length; i++)
                                ls_collection._del(lc_child_deleted[i]);
                        }
                        else {
                            for (let key in lc_deleted) {
                                ls_collection._del(lc_deleted[key]);
                            }
                        }
                    })
                    .then(() => {
                        if (auth_new && (auth_new.length > 0)) {
                            return Utils.seqExec(auth_new, (elem) => {
                                return root_auth.newObject({
                                    fields: { AuthorId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (ctg_new && (ctg_new.length > 0)) {
                            return Utils.seqExec(ctg_new, (elem) => {
                                return root_ctg.newObject({
                                    fields: { CategoryId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (ls_new && (ls_new.length > 0)) {
                            return Utils.seqExec(ls_new, (elem) => {
                                let fields = { LessonId: elem.LessonId, State: elem.State, Number: elem.Number };
                                if (elem["ReadyDate"])
                                    fields["ReadyDate"] = elem["ReadyDate"];
                                return root_ls.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                                return crs_obj.save(opts);
                            });
                    })
                    .then(() => {
                        if (Object.keys(lc_deleted).length > 0)
                            return crs_obj.edit()
                                .then(() => {
                                    for (let key in lc_deleted) {
                                        ls_collection._del(lc_deleted[key]);
                                    }
                                    return crs_obj.save(opts);
                                });
                    })
                    .then(() => {
                        if (needToDeleteOwn) {
                            let lesson_del_func = (elem) => {
                                let id = elem.lessonId();
                                let mysql_script = [];
                                LESSON_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                    mysql_script.push(_.template(elem)({ id: id }));
                                });
                                let mssql_script = [];
                                LESSON_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                    mssql_script.push(_.template(elem)({ id: id }));
                                });
                                return DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                            };
                            return Utils.seqExec(lsn_child_deleted, lesson_del_func)
                                .then(() => {
                                    return Utils.seqExec(lsn_deleted, lesson_del_func);
                                });
                        }
                    })
                    .then(() => {
                        console.log("Course updated: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (crs_obj)
                            this._db._deleteRoot(crs_obj.getRoot());
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

    insert(data) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let newId = null;
            let new_obj = null;
            let inpFields = data || {};
            resolve(
                this._getObjById(-1)
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { AccountId: ACCOUNT_ID };
                        if (inpFields["Color"])
                            fields["Color"] = inpFields["Color"];
                        if (inpFields["Cover"])
                            fields["Cover"] = inpFields["Cover"];
                        if (inpFields["CoverMeta"])
                            fields["CoverMeta"] = inpFields["CoverMeta"];
                        if (inpFields["State"])
                            fields["State"] = inpFields["State"];
                        if (inpFields["LanguageId"])
                            fields["LanguageId"] = inpFields["LanguageId"];
                        if (inpFields["URL"])
                            fields["URL"] = inpFields["URL"];
                        fields["OneLesson"] = false;
                        if (typeof (inpFields["OneLesson"]) === "boolean")
                            fields["OneLesson"] = inpFields["OneLesson"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("CourseLng");

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (inpFields["State"])
                            fields["State"] = inpFields["State"] === "P" ? "R" : inpFields["State"];

                        if (inpFields["Name"])
                            fields["Name"] = inpFields["Name"];
                        if (inpFields["Description"])
                            fields["Description"] = inpFields["Description"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        let root_auth = new_obj.getDataRoot("AuthorToCourse");
                        if (inpFields.Authors && (inpFields.Authors.length > 0)) {
                            return Utils.seqExec(inpFields.Authors, (elem) => {
                                return root_auth.newObject({
                                    fields: { AuthorId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_ctg = new_obj.getDataRoot("CourseCategory");
                        if (inpFields.Categories && (inpFields.Categories.length > 0)) {
                            return Utils.seqExec(inpFields.Categories, (elem) => {
                                return root_ctg.newObject({
                                    fields: { CategoryId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_lsn = new_obj.getDataRoot("LessonCourse");
                        if (inpFields.Lessons && (inpFields.Lessons.length > 0)) {
                            let Number = 1;
                            return Utils.seqExec(inpFields.Lessons, (elem) => {
                                let fields = { LessonId: elem.LessonId, State: elem.State, Number: Number++ };
                                if (elem["ReadyDate"])
                                    fields["ReadyDate"] = elem["ReadyDate"];
                                return root_lsn.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Course added: Id=" + newId + ".");
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            if (res instanceof Error)
                                throw res
                            else
                                throw new Error("Error: " + JSON.stringify(res));
                        return res;
                    })
            );
        })
    }
};

let dbCourse = null;
exports.CoursesService = () => {
    return dbCourse ? dbCourse : dbCourse = new DbCourse();
}
