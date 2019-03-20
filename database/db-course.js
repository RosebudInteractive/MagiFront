const config = require('config');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const { Intervals } = require('../const/common');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { PartnerLink } = require('../utils/partner-link');
const { Product } = require('../const/product');
const { ProductService } = require('./db-product');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const {
    ACCOUNT_ID,
    LANGUAGE_ID,
    AUTHORS_BY_ID_MSSQL_PUBLIC_REQ,
    AUTHORS_BY_ID_MYSQL_PUBLIC_REQ,
    CHECK_IF_CAN_DEL_LESSON_MSSQL,
    CHECK_IF_CAN_DEL_LESSON_MYSQL
} = require('../const/sql-req-common');
const { getTimeStr, buildLogString } = require('../utils');
const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;

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

const COURSE_MSSQL_ALL_REQ =
    "select c.[Id], c.[OneLesson], c.[Color], c.[Cover], c.[CoverMeta], c.[Mask], c.[State], c.[LanguageId],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[Language] as [LanguageName], c.[URL], cl.[Name], cl.[Description], cl.[ExtLinks] from [Course] c\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId] and c.[AccountId] = <%= accountId %>\n" +
    "  left join [Language] l on c.[LanguageId] = l.[Id]";

const COURSE_MYSQL_ALL_REQ =
    "select c.`Id`, c.`OneLesson`, c.`Color`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`State`, c.`LanguageId`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`Language` as `LanguageName`, c.`URL`, cl.`Name`, cl.`Description`, cl.`ExtLinks` from`Course` c\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId` and c.`AccountId` = <%= accountId %>\n" +
    "  left join `Language` l on c.`LanguageId` = l.`Id`";

const COURSE_MSSQL_ID_REQ = COURSE_MSSQL_ALL_REQ + "\nwhere c.[Id] = <%= id %>";
const COURSE_MYSQL_ID_REQ = COURSE_MYSQL_ALL_REQ + "\nwhere c.`Id` = <%= id %>";

const COURSE_MSSQL_AUTHOR_REQ =
    "select a.[Id], l.[FirstName], l.[LastName] from [AuthorToCourse] ac\n" +
    "  join [Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join [AuthorLng] l on a.[Id] = l.[AuthorId]\n" +
    "where ac.[CourseId] = <%= id %>";
const COURSE_MSSQL_CATEGORY_REQ =
    "select [CategoryId] as [Id] from [CourseCategory] where [CourseId] = <%= id %>";
const COURSE_MSSQL_LESSON_REQ =
    "select ls.[Id], ls.[IsAuthRequired], ls.[IsSubsRequired], ls.[FreeExpDate], lsl.[Name], lsl.[ShortDescription], lsl.[FullDescription], lc.[Number], lc.[ReadyDate], lc.[State], l.[Language] as [LanguageName] from [Lesson] ls\n" +
    "  join [LessonLng] lsl on ls.[Id] = lsl.[LessonId]\n" +
    "  join [Language] l on lsl.[LanguageId] = l.[Id]\n" +
    "  join [LessonCourse] lc on lc.[LessonId] = ls.[Id]\n" +
    "where (lc.[CourseId] = <%= id %>) and (lc.[ParentId] is NULL)\n"+
    "order by lc.[Number]";

const COURSE_MYSQL_AUTHOR_REQ =
    "select a.`Id`, l.`FirstName`, l.`LastName` from `AuthorToCourse` ac\n" +
    "  join `Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join `AuthorLng` l on a.`Id` = l.`AuthorId`\n" +
    "where ac.`CourseId` = <%= id %>";
const COURSE_MYSQL_CATEGORY_REQ =
    "select `CategoryId` as `Id` from `CourseCategory` where `CourseId` = <%= id %>";
const COURSE_MYSQL_LESSON_REQ =
    "select ls.`Id`, ls.`IsAuthRequired`, ls.`IsSubsRequired`, ls.`FreeExpDate`, lc.`CourseId`, lsl.`Name`, lsl.`ShortDescription`, lsl.`FullDescription`, lc.`Number`, lc.`ReadyDate`, lc.`State`, l.`Language` as `LanguageName` from `Lesson` ls\n" +
    "  join `LessonLng` lsl on ls.`Id` = lsl.`LessonId`\n" +
    "  join `Language` l on lsl.`LanguageId` = l.`Id`\n" +
    "  join `LessonCourse` lc on lc.`LessonId` = ls.`Id`\n" +
    "where (lc.`CourseId` = <%= id %>) and (lc.`ParentId` is NULL)\n" +
    "order by lc.`Number`";

const COURSE_MSSQL_DELETE_SCRIPT =
    [
        "delete el from [Course] c\n" +
        "  join[Lesson] l on c.[Id] = l.[CourseId]\n" +
        "  join[EpisodeLesson] el on l.[Id] = el.[LessonId]\n" +
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
        "  join`EpisodeLesson` el on l.`Id` = el.`LessonId`\n" +
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
    "select c.[Id], l.[Id] as[LessonId], c.[OneLesson], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color], cl.[Name], c.[URL], lc.[Number], lc.[ReadyDate],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[IsFreeInPaidCourse],\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL], ell.Audio, el.[Number] Eln,\n" +
    "  ll.[Name] as[LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId] from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id] and cl.[LanguageId] = <%= languageId %>\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  left join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  left join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "where c.[AccountId] = <%= accountId %> and c.[State] = 'P' and(l.[ParentId] is NULL)\n" +
    "order by lc.[State] desc, lc.[ReadyDate] desc, el.[Number]";
const AUTHOR_COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select ac.[CourseId], a.[Id], l.[FirstName], l.[LastName], a.[URL] from[AuthorToCourse] ac\n" +
    "  join[Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join[AuthorLng] l on l.[AuthorId] = a.[Id]\n" +
    "  join[Course] cs on cs.[Id] = ac.[CourseId] and cs.[LanguageId] = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by ac.[CourseId]";
const CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select cc.[CourseId], c.[Id], l.[Name], c.[URL] from[CourseCategory] cc\n" +
    "  join[Category] c on c.[Id] = cc.[CategoryId]\n" +
    "  join[CategoryLng] l on l.[CategoryId] = c.[Id]\n" +
    "  join[Course] cs on cs.[Id] = cc.[CourseId] and cs.[LanguageId] = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by cc.[CourseId]";

const COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select c.`Id`, l.`Id` as`LessonId`, c.`OneLesson`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`, cl.`Name`, c.`URL`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`IsFreeInPaidCourse`,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`, ell.Audio, el.`Number` Eln,\n" +
    "  ll.`Name` as`LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId` from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id` and cl.`LanguageId` = <%= languageId %>\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  left join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  left join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "where c.`AccountId` = <%= accountId %> and c.`State` = 'P' and(l.`ParentId` is NULL)\n" +
    "order by lc.`State` desc, lc.`ReadyDate` desc, el.`Number`";
const AUTHOR_COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select ac.`CourseId`, a.`Id`, l.`FirstName`, l.`LastName`, a.`URL` from`AuthorToCourse` ac\n" +
    "  join`Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join`AuthorLng` l on l.`AuthorId` = a.`Id`\n" +
    "  join`Course` cs on cs.`Id` = ac.`CourseId` and cs.`LanguageId` = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by ac.`CourseId`";
const CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select cc.`CourseId`, c.`Id`, l.`Name`, c.`URL` from`CourseCategory` cc\n" +
    "  join`Category` c on c.`Id` = cc.`CategoryId`\n" +
    "  join`CategoryLng` l on l.`CategoryId` = c.`Id`\n" +
    "  join`Course` cs on cs.`Id` = cc.`CourseId` and cs.`LanguageId` = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by cc.`CourseId`";

const COURSE_MSSQL_PUBLIC_REQ =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], l.[Id] as[LessonId], c.[LanguageId], c.[OneLesson], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color], cl.[Name],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[IsFreeInPaidCourse],\n" +
    "  cl.[Description], cl.[ExtLinks], c.[URL], lc.[Number], lc.[ReadyDate], ell.Audio, el.[Number] Eln,\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL],\n" +
    "  ll.[Name] as[LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId] from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  left join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  left join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "<%= where %>\n" +
    "order by lc.[ParentId], lc.[Number], el.[Number]";
const COURSE_MSSQL_PUBLIC_WHERE_URL =
    "where c.[URL] = '<%= courseUrl %>'";
const COURSE_MSSQL_PUBLIC_WHERE_ID =
    "where c.[Id] = <%= id %>";

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
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join [Reference] r on r.[LessonLngId] = ll.[Id] and r.[Recommended] = 0\n" +
    "where c.[Id] = <%= courseId %> and(l.[ParentId] is NULL)\n" +
    "group by l.[Id]";
const COURSE_REC_MSSQL_PUBLIC_REQ =
    "select l.[Id] as [LessonId], r.[Id], r.[Description] from[Course] c\n" +
    "  join [LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join [Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join [Reference] r on r.[LessonLngId] = ll.[Id] and r.[Recommended] = 1\n" +
    "where c.[Id] = <%= courseId %> and(l.[ParentId] is NULL)\n" +
    "order by l.[Id]";
const COURSE_SHARE_COUNTERS_MSSQL_REQ =
    "select sp.[Code], cs.[Counter] from [CrsShareCounter] cs\n" +
    "  join[SNetProvider] sp on sp.[Id] = cs.[SNetProviderId]\n" +
    "where[CourseId] = <%= courseId %>";
const COURSE_BOOKS_MSSQL_REQ =
    "select b.[Order], b.[Id], b.[Name], b.[Description], b.[CourseId], b.[OtherAuthors], b.[OtherCAuthors],\n" +
    "  b.[Cover], b.[CoverMeta], b.[ExtLinks], ba.[AuthorId], ba.[Tp], ba.[TpView],\n" +
    "  a.[URL], al.[FirstName], al.[LastName]\n" +
    "from[Book] b\n" +
    "  left join[BookAuthor] ba on ba.[BookId] = b.[Id]\n" +
    "  left join[Author] a on a.[Id] = ba.[AuthorId]\n" +
    "  left join[AuthorLng] al on al.[AuthorId] = ba.[AuthorId]\n" +
    "where b.[Id] in\n" +
    "(\n" +
    "  select b.[Id] from[Book] b\n" +
    "    left join[BookAuthor] ba on ba.[BookId] = b.[Id]\n" +
    "    left join[Author] a on a.[Id] = ba.[AuthorId]\n" +
    "    left join[AuthorLng] al on al.[AuthorId] = ba.[AuthorId]\n" +
    "  where b.[CourseId] = <%= courseId %>\n" +
    "  union\n" +
    "  select b.[Id] from[Book] b\n" +
    "    join[BookAuthor] ba on ba.[BookId] = b.[Id]\n" +
    "    join[Author] a on a.[Id] = ba.[AuthorId]\n" +
    "    join[AuthorLng] al on al.[AuthorId] = ba.[AuthorId]\n" +
    "    join[AuthorToCourse] ac on ac.[AuthorId] = ba.[AuthorId]\n" +
    "  where(ac.[CourseId]) = <%= courseId %> and(b.[CourseId] is NULL)\n" +
    ")\n" +
    "order by 1";
    
const COURSE_MYSQL_PUBLIC_REQ =
    "select lc.`Id` as`LcId`, lc.`ParentId`, c.`Id`, l.`Id` as`LessonId`, c.`LanguageId`, c.`OneLesson`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`, cl.`Name`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`IsFreeInPaidCourse`,\n" +
    "  cl.`Description`, cl.`ExtLinks`, c.`URL`, lc.`Number`, lc.`ReadyDate`, ell.Audio, el.`Number` Eln,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`,\n" +
    "  ll.`Name` as`LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId` from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  left join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  left join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "<%= where %>\n" +
    "order by lc.`ParentId`, lc.`Number`, el.`Number`";
const COURSE_MYSQL_PUBLIC_WHERE_URL =
    "where c.`URL` = '<%= courseUrl %>'";
const COURSE_MYSQL_PUBLIC_WHERE_ID =
    "where c.`Id` = <%= id %>";

const CATEGORY_COURSE_MYSQL_WHERE = "where cc.`CourseId` = <%= courseId %>\n";
const COURSE_REF_MYSQL_PUBLIC_REQ =
    "select l.`Id`, count(r.`Id`) as `NRef` from `Course` c\n" +
    "  join `LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join `Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join `Reference` r on r.`LessonLngId` = ll.`Id` and r.`Recommended` = 0\n" +
    "where c.`Id` = <%= courseId %> and(l.`ParentId` is NULL)\n" +
    "group by l.`Id`";
const COURSE_REC_MYSQL_PUBLIC_REQ =
    "select l.`Id` as `LessonId`, r.`Id`, r.`Description` from`Course` c\n" +
    "  join `LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join `Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join `Reference` r on r.`LessonLngId` = ll.`Id` and r.`Recommended` = 1\n" +
    "where c.`Id` = <%= courseId %> and(l.`ParentId` is NULL)\n" +
    "order by l.`Id`";
const COURSE_SHARE_COUNTERS_MYSQL_REQ =
    "select sp.`Code`, cs.`Counter` from `CrsShareCounter` cs\n" +
    "  join`SNetProvider` sp on sp.`Id` = cs.`SNetProviderId`\n" +
    "where`CourseId` = <%= courseId %>";
const COURSE_BOOKS_MYSQL_REQ =
    "select b.`Order`, b.`Id`, b.`Name`, b.`Description`, b.`CourseId`, b.`OtherAuthors`, b.`OtherCAuthors`,\n" +
    "  b.`Cover`, b.`CoverMeta`, b.`ExtLinks`, ba.`AuthorId`, ba.`Tp`, ba.`TpView`,\n" +
    "  a.`URL`, al.`FirstName`, al.`LastName`\n" +
    "from`Book` b\n" +
    "  left join`BookAuthor` ba on ba.`BookId` = b.`Id`\n" +
    "  left join`Author` a on a.`Id` = ba.`AuthorId`\n" +
    "  left join`AuthorLng` al on al.`AuthorId` = ba.`AuthorId`\n" +
    "where b.`Id` in\n" +
    "(\n" +
    "  select b.`Id` from`Book` b\n" +
    "    left join`BookAuthor` ba on ba.`BookId` = b.`Id`\n" +
    "    left join`Author` a on a.`Id` = ba.`AuthorId`\n" +
    "    left join`AuthorLng` al on al.`AuthorId` = ba.`AuthorId`\n" +
    "  where b.`CourseId` = <%= courseId %>\n" +
    "  union\n" +
    "  select b.`Id` from`Book` b\n" +
    "    join`BookAuthor` ba on ba.`BookId` = b.`Id`\n" +
    "    join`Author` a on a.`Id` = ba.`AuthorId`\n" +
    "    join`AuthorLng` al on al.`AuthorId` = ba.`AuthorId`\n" +
    "    join`AuthorToCourse` ac on ac.`AuthorId` = ba.`AuthorId`\n" +
    "  where(ac.`CourseId`) = <%= courseId %> and(b.`CourseId` is NULL)\n" +
    ")\n" +
    "order by 1";

const GET_COURSE_FOR_PRERENDER_MSSQL =
    "select c.[URL] from[Course] c\n" +
    "where c.[State] = 'P' and c.[Id] = <%= id %>";

const GET_COURSE_URL_MSSQL =
    "select c.[URL] from[Course] c\n" +
    "where c.[Id] = <%= id %>";

const GET_COURSE_FOR_PRERENDER_BY_URL_MSSQL =
    "select c.[URL] from[Course] c\n" +
    "where c.[State] = 'P' and c.[URL] = '<%= course_url %>'";

const GETCOURSE_LESSONS_URLS_MSSQL =
    "select c.[URL], l.[URL] as [LURL] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where c.[Id] = <%= id %>";

const GET_COURSE_FOR_PRERENDER_MYSQL =
    "select c.`URL` from`Course` c\n" +
    "where c.`State` = 'P' and c.`Id` = <%= id %>";

const GET_COURSE_URL_MYSQL =
    "select c.`URL` from`Course` c\n" +
    "where c.`Id` = <%= id %>";

const GET_COURSE_FOR_PRERENDER_BY_URL_MYSQL =
    "select c.`URL` from`Course` c\n" +
    "where c.`State` = 'P' and c.`URL` = '<%= course_url %>'";

const GETCOURSE_LESSONS_URLS_MYSQL =
    "select c.`URL`, l.`URL` as `LURL` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where c.`Id` = <%= id %>";

const CHECKIF_CAN_DEL_MSSQL =
    "select c.[Id] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join[EpisodeLng] eln on e.[Id] = eln.[EpisodeId]\n" +
    "where(c.[Id] = <%= id %>) and((lc.[State] = 'R') or(eln.[State] = 'R'))";

const CHECKIF_CAN_DEL_MYSQL =
    "select c.`Id` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join`EpisodeLng` eln on e.`Id` = eln.`EpisodeId`\n" +
    "where(c.`Id` = <%= id %>) and((lc.`State` = 'R') or(eln.`State` = 'R'))";

const { PrerenderCache } = require('../prerender/prerender-cache');
let { LessonsService } = require('./db-lesson');

const URL_PREFIX = "category";

const DbCourse = class DbCourse extends DbObject {

    constructor(options) {
        super(options);
        this._prerenderCache = PrerenderCache();
        this._partnerLink = new PartnerLink();
        this._productService = ProductService();
    }

    _isNumericString(str) {
        let result = false;
        if (typeof (str) === "string") {
            let res = str.match(/[0-9]*/);
            result = (res && (str.length > 0) && (res[0].length === str.length))
        }
        return result;
    }

    _getObjById(id, expression, options) {
        var exp = expression || COURSE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    _changeCourseUrl(id, old_course_url, new_course_url) {
        return new Promise((resolve, reject) => {
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GETCOURSE_LESSONS_URLS_MYSQL)({ id: id }),
                    mssql: _.template(GETCOURSE_LESSONS_URLS_MSSQL)({ id: id })
                }
            }, {}));
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length > 0))
                    return Utils.seqExec(result.detail, (elem) => {
                        let oldUrl = "/" + old_course_url + "/" + elem.LURL + "/";
                        let newUrl = "/" + new_course_url + "/" + elem.LURL + "/";
                        return this._prerenderCache.rename(oldUrl, newUrl);
                    });
            });        
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
                            mysql: _.template(GET_COURSE_URL_MYSQL)({ id: id }),
                            mssql: _.template(GET_COURSE_URL_MSSQL)({ id: id })
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
                        mysql: _.template(GET_COURSE_FOR_PRERENDER_MYSQL)({ id: id }),
                        mssql: _.template(GET_COURSE_FOR_PRERENDER_MSSQL)({ id: id })
                    };
                    if (typeof (id) === "string") {
                        let course_url;
                        let urls = id.split("/");
                        let cnt = 0;
                        urls.forEach((elem) => {
                            if (elem.length > 0) {
                                cnt++;
                                course_url = elem;
                            }
                        })
                        if (cnt !== 1)
                            throw new Error(`DbCourse::prerender: Invalid "id" parameter: "${id}"`);
                        dialect = {
                            mysql: _.template(GET_COURSE_FOR_PRERENDER_BY_URL_MYSQL)({ course_url: course_url }),
                            mssql: _.template(GET_COURSE_FOR_PRERENDER_BY_URL_MSSQL)({ course_url: course_url })
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

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID }),
                        mssql: _.template(COURSE_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID })
                    }
                }, {})
                    .then((result) => {
                        return result.detail;
                    })
            );
        })
    }

    getAllPublic(options) {
        let courses = [];
        let authors = [];
        let categories = [];
        let courses_list = {};
        let lessons_list = {};
        let authors_list = {};
        let categories_list = {};
        let opts = options || {};
        let languageId = (typeof (opts.lang_id) === "number") && (!isNaN(opts.lang_id)) ? opts.lang_id : LANGUAGE_ID;
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true));
        let baseUrl;
        let productList = {};

        return new Promise((resolve, reject) => {
            baseUrl = config.proxyServer.siteHost + "/";
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ALL_PUBLIC_REQ)({ accountId: ACCOUNT_ID, languageId: languageId }),
                        mssql: _.template(COURSE_MSSQL_ALL_PUBLIC_REQ)({ accountId: ACCOUNT_ID, languageId: languageId })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let crs_id = -1;
                            let curr_course;
                            let now = new Date();
                            let baseCourseUrl;
                            result.detail.forEach((elem) => {
                                if (elem.Id !== crs_id) {
                                    crs_id = elem.Id;
                                    baseCourseUrl = baseUrl + elem.URL + "/";
                                    curr_course = courses_list[elem.Id];
                                    if (!curr_course) {
                                        curr_course = {
                                            Id: elem.Id,
                                            Cover: isAbsPath ? (elem.Cover ? this._absDataUrl + elem.Cover : null) : elem.Cover,
                                            CoverMeta: isAbsPath ? this._convertMeta(elem.CoverMeta) : elem.CoverMeta,
                                            Mask: elem.Mask,
                                            Color: elem.Color,
                                            Name: elem.Name,
                                            URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                                            IsSubsRequired: false,
                                            OneLesson: elem.OneLesson ? true : false,
                                            IsPaid: elem.IsPaid ? true : false,
                                            IsSubsFree: elem.IsSubsFree ? true : false,
                                            ProductId: elem.ProductId,
                                            Price: 0,
                                            DPrice: 0,
                                            Authors: [],
                                            Categories: [],
                                            Lessons: []
                                        };
                                        if (curr_course.IsPaid && curr_course.ProductId) {
                                            productList[curr_course.ProductId] = curr_course;
                                        }
                                        else
                                            curr_course.ProductId = null;
                                        courses_list[elem.Id] = curr_course;
                                        courses.push(curr_course);
                                    }
                                };
                                let lesson = lessons_list[elem.LessonId];
                                if (!lesson) {
                                    lesson = {
                                        Id: elem.LessonId,
                                        Number: elem.Number,
                                        ReadyDate: elem.ReadyDate,
                                        State: elem.State,
                                        Cover: isAbsPath ? (elem.LCover ? this._absDataUrl + elem.LCover : null) : elem.LCover,
                                        CoverMeta: isAbsPath ? this._convertMeta(elem.LCoverMeta) : elem.LCoverMeta,
                                        URL: isAbsPath ? baseCourseUrl + elem.LURL : elem.LURL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        IsFreeInPaidCourse: elem.IsFreeInPaidCourse ? true : false,
                                        Name: elem.LName,
                                        ShortDescription: elem.ShortDescription,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        AuthorId: elem.AuthorId,
                                        Audios: []
                                    };
                                    curr_course.IsSubsRequired = curr_course.IsSubsRequired || lesson.IsSubsRequired;
                                    if (lesson.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                        lesson.FreeExpDate = elem.FreeExpDate;
                                    curr_course.Lessons.push(lesson);
                                    lessons_list[elem.LessonId] = lesson;
                                }
                                if (elem.Audio)
                                    lesson.Audios.push(isAbsPath ? this._absDataUrl + elem.Audio : elem.Audio);
                            })

                            if (Object.keys(productList).length > 0) {
                                let prods = await this._productService.get({ TypeCode: "COURSEONLINE", Detail: true });
                                for (let i = 0; i < prods.length; i++){
                                    let prod = prods[i];
                                    let course = productList[prod.Id];
                                    if (course)
                                        this._setPriceByProd(course, prod);
                                }
                            }

                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(AUTHOR_COURSE_MYSQL_ALL_PUBLIC_REQ)({ languageId: languageId, whereClause: "where cs.`State` = 'P'" }),
                                    mssql: _.template(AUTHOR_COURSE_MSSQL_ALL_PUBLIC_REQ)({ languageId: languageId, whereClause: "where cs.[State] = 'P'" })
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
                                        URL: isAbsPath ? this._absAuthorUrl + elem.URL : elem.URL
                                    };
                                    authors.push(author);
                                    authors_list[elem.Id] = author;
                                }
                            })
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ)({ languageId: languageId, whereClause: "where cs.`State` = 'P'" }),
                                    mssql: _.template(CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ)({ languageId: languageId, whereClause: "where cs.[State] = 'P'" })
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
                                        URL: isAbsPath ? this._absCategoryUrl + elem.URL : elem.URL,
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

    getPublic(url, options) {
        let course = null;
        let courseId = 0;
        let lsn_list = {};
        let lc_list = {};
        let languageId;
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true));
        let baseUrl;

        return new Promise((resolve, reject) => {
            baseUrl = this._baseUrl;
            let id = url;
            let isInt = (typeof (id) === "number");
            if (isInt && isNaN(id))
                throw new Error(`Invalid argument "url": ${url}.`);
            if (!isInt)
                if (typeof (id) === "string") {
                    let res = id.match(/[0-9]*/);
                    if (res && (id.length > 0) && (res[0].length === id.length)) {
                        id = parseInt(id);
                        isInt = true;
                    }
                }
                else
                    throw new Error(`Invalid argument "url": ${url}.`);

            let whereMSSQL = isInt ? _.template(COURSE_MSSQL_PUBLIC_WHERE_ID)({ id: id })
                : _.template(COURSE_MSSQL_PUBLIC_WHERE_URL)({ courseUrl: id })
            let whereMYSQL = isInt ? _.template(COURSE_MYSQL_PUBLIC_WHERE_ID)({ id: id })
                : _.template(COURSE_MYSQL_PUBLIC_WHERE_URL)({ courseUrl: id })
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_PUBLIC_REQ)({ where: whereMYSQL }),
                        mssql: _.template(COURSE_MSSQL_PUBLIC_REQ)({ where: whereMSSQL })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let isFirst = true;
                            let authors_list = {};
                            let now = new Date();
                            let courseUrl;
                            result.detail.forEach((elem) => {
                                if (isFirst) {
                                    isFirst = false;
                                    languageId = elem.LanguageId;
                                    courseId = elem.Id;
                                    courseUrl = baseUrl + elem.URL + "/";
                                    course = {
                                        Id: elem.Id,
                                        LanguageId: elem.LanguageId,
                                        Cover: isAbsPath ? (elem.Cover ? this._absDataUrl + elem.Cover : null) : elem.Cover,
                                        CoverMeta: isAbsPath ? this._convertMeta(elem.CoverMeta) : elem.CoverMeta,
                                        OneLesson: elem.OneLesson ? true : false,
                                        Mask: elem.Mask,
                                        Color: elem.Color,
                                        Name: elem.Name,
                                        Description: elem.Description,
                                        URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                                        IsSubsRequired: false,
                                        ExtLinks: elem.ExtLinks,
                                        IsPaid: elem.IsPaid ? true : false,
                                        IsSubsFree: elem.IsSubsFree ? true : false,
                                        ProductId: elem.ProductId,
                                        Price: 0,
                                        DPrice: 0,
                                        Authors: [],
                                        Categories: [],
                                        Lessons: [],
                                        Books: [],
                                        RefBooks: [],
                                        ShareCounters: {}
                                    };
                               };
                                let lsn = lsn_list[elem.LessonId];
                                if (!lsn) {
                                    lsn = {
                                        Id: elem.LessonId,
                                        Number: elem.Number,
                                        ReadyDate: elem.ReadyDate,
                                        State: elem.State,
                                        Cover: isAbsPath ? (elem.LCover ? this._absDataUrl + elem.LCover : null) : elem.LCover,
                                        CoverMeta: isAbsPath ? this._convertMeta(elem.LCoverMeta) : elem.LCoverMeta,
                                        URL: isAbsPath ? courseUrl + elem.LURL : elem.LURL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        IsFreeInPaidCourse: elem.IsFreeInPaidCourse ? true : false,
                                        Name: elem.LName,
                                        ShortDescription: elem.ShortDescription,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        AuthorId: elem.AuthorId,
                                        NSub: 0,
                                        NRefBooks: 0,
                                        NBooks: 0,
                                        Lessons: [],
                                        Audios: []
                                    };
                                    course.IsSubsRequired = course.IsSubsRequired || lsn.IsSubsRequired;
                                    if (lsn.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                        lsn.FreeExpDate = elem.FreeExpDate;
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
                                }
                                if (elem.Audio)
                                    lsn.Audios.push(isAbsPath ? this._absDataUrl + elem.Audio : elem.Audio);
                            })

                            await this.getCoursePrice(course);

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
                                            authors: authors
                                        }),
                                    mssql: _.template(AUTHORS_BY_ID_MSSQL_PUBLIC_REQ)(
                                        {
                                            authors: authors
                                        })
                                }
                            }, {});
                        }
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find course "${url}".`);                            
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let author = {
                                    Id: elem.Id,
                                    FirstName: elem.FirstName,
                                    LastName: elem.LastName,
                                    Portrait: isAbsPath ? (elem.Portrait ? this._absDataUrl + elem.Portrait : null) : elem.Portrait,
                                    PortraitMeta: isAbsPath ? this._convertMeta(elem.PortraitMeta) : elem.PortraitMeta,
                                    URL: isAbsPath ? this._absAuthorUrl + elem.URL : elem.URL
                                };
                                course.Authors.push(author);
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ)(
                                        {
                                            languageId: languageId,
                                            whereClause: _.template(CATEGORY_COURSE_MYSQL_WHERE)({ courseId: courseId })
                                        }),
                                    mssql: _.template(CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ)(
                                        {
                                            languageId: languageId,
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
                                    URL: isAbsPath ? this._absCategoryUrl + elem.URL : elem.URL
                                };
                                course.Categories.push(category);
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(COURSE_REF_MYSQL_PUBLIC_REQ)({ courseId: courseId }),
                                    mssql: _.template(COURSE_REF_MSSQL_PUBLIC_REQ)({ courseId: courseId })
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
                                    mysql: _.template(COURSE_REC_MYSQL_PUBLIC_REQ)({ courseId: courseId }),
                                    mssql: _.template(COURSE_REC_MSSQL_PUBLIC_REQ)({ courseId: courseId })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let lsn = lsn_list[elem.LessonId]
                                if (lsn)
                                    lsn.NBooks++;
                                course.RefBooks.push({
                                    Id: elem.Id,
                                    Description: elem.Description
                                });
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(COURSE_SHARE_COUNTERS_MYSQL_REQ)({ courseId: courseId }),
                                    mssql: _.template(COURSE_SHARE_COUNTERS_MSSQL_REQ)({ courseId: courseId })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                course.ShareCounters[elem.Code] = elem.Counter;
                            })
                        }
                        if (course)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(COURSE_BOOKS_MYSQL_REQ)({ courseId: courseId }),
                                    mssql: _.template(COURSE_BOOKS_MSSQL_REQ)({ courseId: courseId })
                                }
                            }, {});
                    })
                    .then(result => {
                        if (course && result && result.detail && (result.detail.length > 0)) {
                            let couseBooks = [];
                            let otherBooks = [];
                            let currId = -1;
                            let book;
                            result.detail.forEach(elem => {
                                if (currId !== elem.Id) {
                                    currId = elem.Id;
                                    book = {};
                                    if (elem.CourseId === courseId)
                                        couseBooks.push(book)
                                    else
                                        otherBooks.push(book);
                                    book.Id = elem.Id;
                                    book.Name = elem.Name;
                                    book.Description = elem.Description;
                                    book.CourseId = elem.CourseId;
                                    book.OtherAuthors = elem.OtherAuthors;
                                    book.OtherCAuthors = elem.OtherCAuthors;
                                    book.Cover = isAbsPath ? (elem.Cover ? this._absDataUrl + elem.Cover : null) : elem.Cover;
                                    book.CoverMeta = isAbsPath ? this._convertMeta(elem.CoverMeta) : elem.CoverMeta;
                                    book.ExtLinks = elem.ExtLinks;
                                    book.Authors = [];
                                }
                                if (typeof (elem.AuthorId) === "number")
                                    book.Authors.push({
                                        Id: elem.AuthorId,
                                        Tp: elem.Tp,
                                        TpView: elem.TpView,
                                        FirstName: elem.FirstName,
                                        LastName: elem.LastName,
                                        URL: isAbsPath ? this._absAuthorUrl + elem.URL : elem.URL
                                    });
                            })
                            Array.prototype.push.apply(course.Books, couseBooks);
                            Array.prototype.push.apply(course.Books, otherBooks);
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
                        mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ id: id }),
                        mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ id: id })
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

    _setPriceByProd(course, prod) {
        course.Price = prod.Price;
        course.DPrice = prod.DPrice;
        if (prod.Discount)
            course.Discount = prod.Discount;
    }

    async getCoursePrice(course, withCheckProd) {
        course.Price = 0;
        course.DPrice = 0;
        delete course.Discount;
        if (course.IsPaid && course.ProductId) {
            let prods = await this._productService.get({ Id: course.ProductId, Detail: true });
            if (prods.length === 1)
                this._setPriceByProd(course, prods[0])
            else
                if (withCheckProd)
                    throw new HttpError(HttpCode.ERR_NOT_FOUND,
                        `Can't find product "ProductId" = ${course.ProductId} of paid course "Id" = ${course.Id}.`);
        }
        else
            course.ProductId = null;
        let result = {
            courseId: course.Id,
            IsPaid: course.IsPaid,
            Price: course.Price,
            DPrice: course.DPrice,
            IsSubsFree: course.IsSubsFree
        };
        if (course.ProductId)
            result.ProductId = course.ProductId;
        if (course.Discount)
            result.Discount = course.Discount;
        return result;
    }

    get(id) {
        let course = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id }),
                        mssql: _.template(COURSE_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            course = result.detail[0];
                            course.OneLesson = course.OneLesson ? true : false;
                            course.IsPaid = course.IsPaid ? true : false;
                            course.IsSubsFree = course.IsSubsFree ? true : false;
                            await this.getCoursePrice(course, true);
                        }
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find course "Id" = ${id}.`);                            
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ id: id })
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
                        let now = new Date();
                        if (result && result.detail && (result.detail.length > 0))
                            result.detail.forEach((elem) => {
                                elem.IsAuthRequired = elem.IsAuthRequired ? true : false;
                                elem.IsSubsRequired = elem.IsSubsRequired ? true : false;
                            });
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
            let urls_to_clear = [];
            let course_url;
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
                        course_url = course_obj.uRL();
                        if (course_obj.state()==="P")
                            throw new HttpError(HttpCode.ERR_CONFLICT, `Can't delete published course (Id: "${id}").`);                            
                        return result.edit()
                    })
                    .then(() => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(CHECKIF_CAN_DEL_MYSQL)({ id: id }),
                                mssql: _.template(CHECKIF_CAN_DEL_MSSQL)({ id: id })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0))
                                    throw new HttpError(HttpCode.ERR_CONFLICT, `Can't delete course (Id: "${id}") which has "READY" lessons or episodes.`);                            
                            });
                    })
                    .then(() => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GETCOURSE_LESSONS_URLS_MYSQL)({ id: id }),
                                mssql: _.template(GETCOURSE_LESSONS_URLS_MSSQL)({ id: id })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0))
                                    result.detail.forEach((elem) => {
                                        urls_to_clear.push("/" + elem.URL + "/" + elem.LURL + "/");
                                    });
                            });
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
                        if (logModif)
                            console.log(buildLogString(`Course deleted: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
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
                        return this.clearCache(course_url)
                            .then(() => {
                                let rc = Promise.resolve(result);
                                if (urls_to_clear.length > 0) {
                                    rc = Utils.seqExec(urls_to_clear, (url) => {
                                        return LessonsService().clearCache(url);
                                    })
                                        .then(() => result);
                                }
                                return rc;
                            });
                    })
            );
        })
    }

    async _createOrUpdateProduct(crsObj, data, dbOptions) {
        let result = { id: crsObj.productId(), isModified: false };
        if (crsObj.isPaid()) {
            let crsLng = crsObj.getDataRoot("CourseLng").getCol("DataElements").get(0);
            if (!data.Price)
                throw new Error(`Invalid or missing course price: "${data.Price}".`);
            let prodData = {
                ProductTypeId: Product.ProductTypes.CourseOnLine,
                VATTypeId: Product.VATTypes.Vat20Id,
                Code: `CRS-${crsObj.id()}`,
                Name: `Курс: ${crsLng.name()}`,
                Picture: crsObj.cover(),
                PictureMeta: crsObj.coverMeta(),
                Description: crsLng.description(),
                Price: data.Price,
                ExtFields: {
                    courseId: crsObj.id()
                }
            };
            if (data.Discount) {
                prodData.Discount = data.Discount;
                prodData.Discount.DiscountTypeId = Product.DiscountTypes.CoursePercId;
                prodData.Discount.PriceListId = Product.DefaultPriceListId;
            }
            if (crsObj.productId()) {
                let res = await this._productService.update(crsObj.productId(), prodData, { dbOptions: dbOptions });
                result.isModified = res.isModified;
            }
            else {
                let res = await this._productService.insert(prodData, { dbOptions: dbOptions });
                result = { id: res.id, isModified: true };
            }
        }
        return result;
    }

    update(id, data, options) {
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
            let opts = options || {};
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

            let isModified = false;
            let urls_to_delete = [];
            let old_url;
            let new_url;
            let languageId;
            let req;
            let isOneLessonCourse;

            if (opts.byUrl && (typeof (opts.byUrl) === "string"))
                req = this._getObjects(COURSE_REQ_TREE, { field: "URL", op: "=", value: opts.byUrl })
            else
                if (typeof (id) === "number")
                    req = this._getObjById(id)
                else
                    throw new Error("DbCourse::update: Incorrect course \"id\" parameter: " + id);
            resolve(
                req
                    .then((result) => {
                        root_obj = result;

                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + id + ") doesn't exist.");
                        crs_obj = collection.get(0);
                        id = crs_obj.id();
                        new_url = old_url = crs_obj.uRL();
                        languageId = crs_obj.languageId();

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

                        let collection = crs_obj.getDataRoot("CourseLng").getCol("DataElements");
                        if (collection.count() !== 1)
                            throw new Error("Course (Id = " + id + ") has inconsistent \"LNG\" part.");
                        crs_lng_obj = collection.get(0);
                        if (crs_lng_obj.languageId() !== languageId)
                            throw new Error("Course (Id = " + id + ") has inconsistent \"LNG\" part.");

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

                        if (typeof (inpFields["Color"]) !== "undefined")
                            crs_obj.color(inpFields["Color"]);
                        if (typeof (inpFields["Mask"]) !== "undefined")
                            crs_obj.mask(inpFields["Mask"]);
                        if (typeof (inpFields["Cover"]) !== "undefined")
                            crs_obj.cover(inpFields["Cover"]);
                        if (typeof (inpFields["CoverMeta"]) !== "undefined")
                            crs_obj.coverMeta(inpFields["CoverMeta"]);
                        if (typeof (inpFields["State"]) !== "undefined")
                            crs_obj.state(inpFields["State"]);
                        // Changing "LanguageId" isn't allowed !
                        // if (typeof (inpFields["LanguageId"]) !== "undefined")
                        //     crs_obj.languageId(inpFields["LanguageId"]);
                        if (typeof (inpFields["URL"]) !== "undefined") {
                            new_url = crs_obj.uRL(inpFields["URL"]);
                            if (this._isNumericString(inpFields["URL"]))
                                throw new Error(`Course URL can't be numeric: ${inpFields["URL"]}`);
                        }

                        crs_obj.oneLesson(false);
                        if (typeof (inpFields["OneLesson"]) === "boolean")
                            crs_obj.oneLesson(inpFields["OneLesson"]);
                        isOneLessonCourse = crs_obj.oneLesson();

                        if (typeof (inpFields["IsPaid"]) === "boolean")
                            crs_obj.isPaid(inpFields["IsPaid"]);
                        if (typeof (inpFields["IsSubsFree"]) === "boolean")
                            crs_obj.isSubsFree(inpFields["IsSubsFree"]);

                        if (typeof (inpFields["State"]) !== "undefined")
                            crs_lng_obj.state(inpFields["State"] === "P" ? "R" : inpFields["State"]);
                        if (typeof (inpFields["Name"]) !== "undefined")
                            crs_lng_obj.name(inpFields["Name"]);
                        if (typeof (inpFields["Description"]) !== "undefined")
                            crs_lng_obj.description(inpFields["Description"]);
                        if (typeof (inpFields["ExtLinks"]) !== "undefined")
                            crs_lng_obj.extLinks(this._partnerLink.processLinks(inpFields["ExtLinks"]));

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
                        let courseLessonNum = ls_own_collection.length - Object.keys(lsn_deleted).length;
                        if (isOneLessonCourse && (crs_obj.state() === 'P') && (courseLessonNum !== 1))
                            throw new Error(`Single lesson course must have exactly one lesson.`);
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
                        isModified = needToDeleteOwn;
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts.transactionId = transactionId;
                                return this._createOrUpdateProduct(crs_obj, { Price: inpFields.Price, Discount: inpFields.Discount }, opts)
                                    .then(result => {
                                        isModified = isModified || result.isModified;
                                        if (result.isModified)
                                            crs_obj.productId(result.id);
                                        return crs_obj.save(opts)
                                    })
                                    .then((result) => {
                                        isModified = isModified || (result && result.detail && (result.detail.length > 0));
                                    });
                            });
                    })
                    .then(() => {
                        if (Object.keys(lc_deleted).length > 0)
                            return crs_obj.edit()
                                .then(() => {
                                    for (let key in lc_deleted) {
                                        ls_collection._del(lc_deleted[key]);
                                    }
                                    return crs_obj.save(opts)
                                        .then((result) => {
                                            isModified = isModified || (result && result.detail && (result.detail.length > 0));
                                        });
                                });
                    })
                    .then(() => {
                        if (needToDeleteOwn) {
                            let lesson_ids = [];
                            let lesson_del_func = (elem) => {
                                let id = elem.lessonId();
                                return $data.execSql({
                                    dialect: {
                                        mysql: _.template(CHECK_IF_CAN_DEL_LESSON_MYSQL)({ id: id }),
                                        mssql: _.template(CHECK_IF_CAN_DEL_LESSON_MSSQL)({ id: id })
                                    }
                                }, {})
                                    .then((result) => {
                                        if (result && result.detail && (result.detail.length > 0))
                                            throw new HttpError(HttpCode.ERR_CONFLICT, `Can't delete lesson (Id: "${id}") which is "READY" or has "READY" episodes.`);
                                    })
                                    .then(() => {
                                        lesson_ids.push(id);
                                        let mysql_script = [];
                                        LESSON_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                            mysql_script.push(_.template(elem)({ id: id }));
                                        });
                                        let mssql_script = [];
                                        LESSON_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                            mssql_script.push(_.template(elem)({ id: id }));
                                        });
                                        return DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                                    });
                            };
                            return Utils.seqExec(lsn_child_deleted, lesson_del_func)
                                .then(() => {
                                    return Utils.seqExec(lsn_deleted, lesson_del_func);
                                })
                                .then(() => {
                                    return Utils.seqExec(lesson_ids, (id) => {
                                        return LessonsService().clearCache(id, true, opts)
                                            .then((links) => {
                                                Array.prototype.push.apply(urls_to_delete, links);
                                            });
                                    });
                                });
                        }
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Course updated: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (crs_obj)
                            this._db._deleteRoot(crs_obj.getRoot());
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
                        let rc = result;
                        if (isModified)
                            rc = this.prerender(id, false, old_url)
                                .then(() => {
                                    if (urls_to_delete.length > 0)
                                        return Utils.seqExec(urls_to_delete, (url) => {
                                            return LessonsService().clearCache(url);
                                        });
                                })
                                .then(() => {
                                    if (new_url !== old_url) {
                                        return this._changeCourseUrl(id, old_url, new_url);
                                    }
                                })
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
            let new_obj = null;
            let inpFields = data || {};
            let languageId;
            let isOneLessonCourse;
            let isNotDraft = false;
            let transactionId = null;
            resolve(
                this._getObjById(-1)
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { AccountId: ACCOUNT_ID };
                        if (typeof (inpFields["Color"]) !== "undefined")
                            fields["Color"] = inpFields["Color"];
                        if (typeof (inpFields["Mask"]) !== "undefined")
                            fields["Mask"] = inpFields["Mask"];
                        if (typeof (inpFields["Cover"]) !== "undefined")
                            fields["Cover"] = inpFields["Cover"];
                        if (typeof (inpFields["CoverMeta"]) !== "undefined")
                            fields["CoverMeta"] = inpFields["CoverMeta"];
                        fields["State"] = "D";
                        if (typeof (inpFields["State"]) !== "undefined")
                            fields["State"] = inpFields["State"];
                        isNotDraft = fields["State"] !== "D";
                        if (typeof (inpFields["LanguageId"]) !== "undefined")
                            languageId = fields["LanguageId"] = inpFields["LanguageId"];
                        if (typeof (inpFields["URL"]) !== "undefined") {
                            fields["URL"] = inpFields["URL"];
                            if (this._isNumericString(inpFields["URL"]))
                                throw new Error(`Course URL can't be numeric: ${inpFields["URL"]}`);
                        }
                        fields["OneLesson"] = false;
                        if (typeof (inpFields["OneLesson"]) === "boolean")
                            fields["OneLesson"] = inpFields["OneLesson"];
                        isOneLessonCourse = fields["OneLesson"];

                        fields["IsPaid"] = false;
                        if (inpFields["IsPaid"])
                            fields["IsPaid"] = inpFields["IsPaid"];
                        fields["IsSubsFree"] = false;
                        if (typeof (inpFields["IsSubsFree"]) === "boolean")
                            fields["IsSubsFree"] = inpFields["IsSubsFree"];

                        if (!languageId)
                            throw new Erorr("Field \"LanguageId\" is required.");
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("CourseLng");

                        let fields = { LanguageId: languageId };
                        if (typeof (inpFields["State"]) !== "undefined")
                            fields["State"] = inpFields["State"] === "P" ? "R" : inpFields["State"];

                        if (typeof (inpFields["Name"]) !== "undefined")
                            fields["Name"] = inpFields["Name"];
                        if (typeof (inpFields["Description"]) !== "undefined")
                            fields["Description"] = inpFields["Description"];
                        if (typeof (inpFields["ExtLinks"]) !== "undefined")
                            fields["ExtLinks"] = this._partnerLink.processLinks(inpFields["ExtLinks"]);

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
                        let lsnNum = (inpFields.Lessons && (inpFields.Lessons.length > 0)) ? inpFields.Lessons.length : 0;
                        if (isNotDraft && isOneLessonCourse && (lsnNum !== 1))
                            throw new Error(`Single lesson course must have exactly one lesson.`);
                        if (lsnNum > 0) {
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
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts.transactionId = transactionId;
                                return this._createOrUpdateProduct(new_obj, { Price: inpFields.Price, Discount: inpFields.Discount }, opts)
                                    .then(result => {
                                        if (result.isModified)
                                            new_obj.productId(result.id);
                                        return root_obj.save(opts)
                                    })
                            });
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Course added: Id="${newId}".`));
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
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
                        return this.prerender(newId)
                            .then(() => result);
                    })
            );
        })
    }
};

let dbCourse = null;
exports.CoursesService = () => {
    return dbCourse ? dbCourse : dbCourse = new DbCourse();
}
