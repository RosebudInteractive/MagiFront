const querystring = require('querystring');
const _ = require('lodash');
const config = require('config');
const striptags = require('striptags');
const { SEO } = require('../const/common');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const { Intervals } = require('../const/common');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { PartnerLink } = require('../utils/partner-link');
const { getPromoDate, getPromoDiscount } = require('../utils/promo-codes');
const { Product } = require('../const/product');
const { ProductService } = require('./db-product');
const { AccessFlags } = require('../const/common');
const { AccessRights } = require('../security/access-rights');
const { SubscriptionService } = require('../services/mail-subscription');
const { TestService } = require('./db-test');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const {
    ACCOUNT_ID,
    LANGUAGE_ID,
    AUTHORS_BY_ID_MSSQL_PUBLIC_REQ,
    AUTHORS_BY_ID_MYSQL_PUBLIC_REQ,
    CHECK_IF_CAN_DEL_LESSON_MSSQL,
    CHECK_IF_CAN_DEL_LESSON_MYSQL,
    EpisodeContentType
} = require('../const/sql-req-common');
const { getTimeStr, buildLogString } = require('../utils');

const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;
const isBillingTest = config.has("billing.billing_test") ? config.billing.billing_test : false;

const COURSE_REQ_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "CourseLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "CourseMetaImage"
                                }
                            }
                        ]
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
    "select c.[Id], c.[OneLesson], c.[Color], c.[Cover], c.[CoverMeta], c.[Mask], c.[State], c.[LanguageId], c.[CourseType],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], cl.[SnPost], cl.[SnName], cl.[SnDescription],\n" +
    "  cl.[VideoIntwLink], cl.[VideoIntroLink], cl.[IntwD], cl.[IntwDFmt], cl.[IntroD], cl.[IntroDFmt],\n" +
    "  cl.[ShortDescription], cl.[TargetAudience], cl.[Aims], c.[LandCover], c.[LandCoverMeta], c.[IsLandingPage], cl.[EstDuration],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[Language] as [LanguageName], c.[URL], cl.[Name], cl.[Description], cl.[ExtLinks] from [Course] c\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId] and c.[AccountId] = <%= accountId %>\n" +
    "  left join [Language] l on c.[LanguageId] = l.[Id]";

const COURSE_MSSQL_IMG_REQ =
    "select i.[Id], i.[Type], i.[FileName], i.[MetaData] from [CourseMetaImage] i\n" +
    "  join [CourseLng] l on l.[Id] = i.[CourseLngId]\n" +
    "where l.[CourseId] = <%= id %>";

const COURSE_MYSQL_ALL_REQ =
    "select c.`Id`, c.`OneLesson`, c.`Color`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`State`, c.`LanguageId`, c.`CourseType`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, cl.`SnPost`, cl.`SnName`, cl.`SnDescription`,\n" +
    "  cl.`VideoIntwLink`, cl.`VideoIntroLink`, cl.`IntwD`, cl.`IntwDFmt`, cl.`IntroD`, cl.`IntroDFmt`,\n" +
    "  cl.`ShortDescription`, cl.`TargetAudience`, cl.`Aims`, c.`LandCover`, c.`LandCoverMeta`, c.`IsLandingPage`, cl.`EstDuration`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`Language` as `LanguageName`, c.`URL`, cl.`Name`, cl.`Description`, cl.`ExtLinks` from`Course` c\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId` and c.`AccountId` = <%= accountId %>\n" +
    "  left join `Language` l on c.`LanguageId` = l.`Id`";

const COURSE_MYSQL_IMG_REQ =
    "select i.`Id`, i.`Type`, i.`FileName`, i.`MetaData` from `CourseMetaImage` i\n" +
    "  join `CourseLng` l on l.`Id` = i.`CourseLngId`\n" +
    "where l.`CourseId` = <%= id %>";

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
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[IsFreeInPaidCourse], pc.[Counter], c.[CourseType],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId,\n" +
    "  case when c.[IsLandingPage] = 1 then cl.[ShortDescription] else cl.[Description] end CrsDescription,\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL], ell.[Audio], el.[Number] Eln,\n" +
    "  ell.[VideoLink], e.[ContentType],\n" +
    "  ll.[Name] as[LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId] from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id] and cl.[LanguageId] = <%= languageId %>\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
    "  left join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  left join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  left join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "where c.[AccountId] = <%= accountId %> and c.[State] = 'P' and(l.[ParentId] is NULL)\n" +
    "order by lc.[State] desc, lc.[ReadyDate] desc, lc.[Number] desc, el.[Number]";
const AUTHOR_COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select ac.[CourseId], a.[Id], l.[FirstName], l.[LastName], a.[URL] from[AuthorToCourse] ac\n" +
    "  join[Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join[AuthorLng] l on l.[AuthorId] = a.[Id]\n" +
    "  join[Course] cs on cs.[Id] = ac.[CourseId] and cs.[LanguageId] = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by ac.[CourseId]";
const CATEGORY_COURSE_MSSQL_ALL_PUBLIC_REQ =
    "select cc.[CourseId], c.[Id], l.[Name], c.[URL], cs.[CourseType] from[CourseCategory] cc\n" +
    "  join[Category] c on c.[Id] = cc.[CategoryId]\n" +
    "  join[CategoryLng] l on l.[CategoryId] = c.[Id]\n" +
    "  join[Course] cs on cs.[Id] = cc.[CourseId] and cs.[LanguageId] = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by cc.[CourseId]";

const COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select c.`Id`, l.`Id` as`LessonId`, c.`OneLesson`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`, cl.`Name`, c.`URL`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`IsFreeInPaidCourse`, pc.`Counter`, c.`CourseType`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId,\n" +
    "  case when c.`IsLandingPage` = 1 then cl.`ShortDescription` else cl.`Description` end CrsDescription,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`, ell.`Audio`, el.`Number` Eln,\n" +
    "  ell.`VideoLink`, e.`ContentType`,\n" +
    "  ll.`Name` as`LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId` from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id` and cl.`LanguageId` = <%= languageId %>\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
    "  left join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  left join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  left join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "where c.`AccountId` = <%= accountId %> and c.`State` = 'P' and(l.`ParentId` is NULL)\n" +
    "order by lc.`State` desc, lc.`ReadyDate` desc, lc.`Number` desc, el.`Number`";
const AUTHOR_COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select ac.`CourseId`, a.`Id`, l.`FirstName`, l.`LastName`, a.`URL` from`AuthorToCourse` ac\n" +
    "  join`Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join`AuthorLng` l on l.`AuthorId` = a.`Id`\n" +
    "  join`Course` cs on cs.`Id` = ac.`CourseId` and cs.`LanguageId` = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by ac.`CourseId`";
const CATEGORY_COURSE_MYSQL_ALL_PUBLIC_REQ =
    "select cc.`CourseId`, c.`Id`, l.`Name`, c.`URL`, cs.`CourseType` from`CourseCategory` cc\n" +
    "  join`Category` c on c.`Id` = cc.`CategoryId`\n" +
    "  join`CategoryLng` l on l.`CategoryId` = c.`Id`\n" +
    "  join`Course` cs on cs.`Id` = cc.`CourseId` and cs.`LanguageId` = <%= languageId %>\n" +
    "<%= whereClause %>" +
    "order by cc.`CourseId`";

const COURSE_MSSQL_PUBLIC_REQ =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], l.[Id] as[LessonId], c.[LanguageId], c.[OneLesson], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color], cl.[Name],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[IsFreeInPaidCourse], pc.[Counter], c.[CourseType],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId, cl.[SnPost], cl.[SnName], cl.[SnDescription],\n" +
    "  cl.[VideoIntwLink], cl.[VideoIntroLink], cl.[IntwD], cl.[IntwDFmt], cl.[IntroD], cl.[IntroDFmt],\n" +
    "  cl.[ShortDescription] [CShortDescription], cl.[TargetAudience], cl.[Aims], c.[LandCover], c.[LandCoverMeta], c.[IsLandingPage], cl.[EstDuration],\n" +
    "  cl.[Description], cl.[ExtLinks], c.[URL], lc.[Number], lc.[ReadyDate], ell.Audio, el.[Number] Eln,\n" +
    "  ell.[VideoLink], e.[ContentType], f.[Id] [IsFinished],\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL],\n" +
    "  ll.[Name] as[LName], ll.[ShortDescription], ll.[Duration], ll.[DurationFmt], l.[AuthorId] from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join[CompletedLesson] f on (f.[UserId] = <%= user_id %>) and (f.[LessonId] = l.[Id])\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
    "  left join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  left join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  left join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "<%= where %>\n" +
    "order by lc.[ParentId], lc.[Number], el.[Number]";
const COURSE_MSSQL_PRICE_REQ =
    "select c.[Id], c.[LanguageId], c.[OneLesson], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], pc.[Counter], gc.[Id] GiftId,\n" +
    "  c.[URL], cl.[Name],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], p.[Name] as [ProductName]\n" +
    "from [Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  left join [Product] p on p.[Id] = c.[ProductId]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
    "<%= where %>";
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
const COURSE_REVIEW_MSSQL_REQ =
    "select r.[Id], r.[ReviewDate], r.[UserId], r.[Status], r.[UserName], r.[ProfileUrl],\n" +
    "  r.[Title], r.[ReviewPub]\n" +
    "from [CourseReview] r\n" +
    "where r.[CourseId] = <%= courseId %> and r.[Status] = 1\n" +
    "order by r.[ReviewDate] desc";
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
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`IsFreeInPaidCourse`, pc.`Counter`, c.`CourseType`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId, cl.`SnPost`, cl.`SnName`, cl.`SnDescription`,\n" +
    "  cl.`VideoIntwLink`, cl.`VideoIntroLink`, cl.`IntwD`, cl.`IntwDFmt`, cl.`IntroD`, cl.`IntroDFmt`,\n" +
    "  cl.`ShortDescription` `CShortDescription`, cl.`TargetAudience`, cl.`Aims`, c.`LandCover`, c.`LandCoverMeta`, c.`IsLandingPage`, cl.`EstDuration`,\n" +
    "  cl.`Description`, cl.`ExtLinks`, c.`URL`, lc.`Number`, lc.`ReadyDate`, ell.Audio, el.`Number` Eln,\n" +
    "  ell.`VideoLink`, e.`ContentType`, f.`Id` `IsFinished`,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`,\n" +
    "  ll.`Name` as`LName`, ll.`ShortDescription`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId` from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join `CompletedLesson` f on (f.`UserId` = <%= user_id %>) and (f.`LessonId` = l.`Id`)\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
    "  left join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  left join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  left join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "<%= where %>\n" +
    "order by lc.`ParentId`, lc.`Number`, el.`Number`";
const COURSE_MYSQL_PRICE_REQ =
    "select c.`Id`, c.`LanguageId`, c.`OneLesson`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, pc.`Counter`, gc.`Id` GiftId,\n" +
    "  c.`URL`, cl.`Name`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, p.`Name` as `ProductName`\n" +
    "from `Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  left join `Product` p on p.`Id` = c.`ProductId`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
    "<%= where %>";
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
const COURSE_REVIEW_MYSQL_REQ =
    "select r.`Id`, r.`ReviewDate`, r.`UserId`, r.`Status`, r.`UserName`, r.`ProfileUrl`,\n" +
    "  r.`Title`, r.`ReviewPub`\n" +
    "from `CourseReview` r\n" +
    "where r.`CourseId` = <%= courseId %> and r.`Status` = 1\n" +
    "order by r.`ReviewDate` desc";
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

const COURSE_MSSQL_LSN_COVER_REQ =
    "select c.[Id], l.[Cover], c.[ProductId] from [LessonCourse] lc\n" +
    "  join [Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join [Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where (not c.[ProductId] is NULL) and (c.[State] = 'P') and (lc.[State] = 'R') and (lc.[ParentId] is NULL)\n" +
    "order by c.[Id], lc.[Number]";

const COURSE_MYSQL_LSN_COVER_REQ =
    "select c.`Id`, l.`Cover`, c.`ProductId` from `LessonCourse` lc\n" +
    "  join `Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join `Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where (not c.`ProductId` is NULL) and (c.`State` = 'P') and (lc.`State` = 'R') and (lc.`ParentId` is NULL)\n" +
    "order by c.`Id`, lc.`Number`";

const DFLT_ADDRESS_BOOK = "Магистерия";
const DFLT_SENDER_NAME = "Magisteria.ru";

const { ElasticConWrapper } = require('./providers/elastic/elastic-connections');
const { IdxLessonService } = require('./elastic/indices/idx-lesson');
const { IdxCourseService } = require('./elastic/indices/idx-course');

const { PrerenderCache } = require('../prerender/prerender-cache');
const { URL, URLSearchParams } = require('url');

const URL_PREFIX = "category";
const MAILING_PREFIX = "mailing/new-course";

const DbCourse = class DbCourse extends DbObject {

    constructor(options) {
        super(options);
        this._prerenderCache = PrerenderCache();
        this._partnerLink = new PartnerLink();
        this._productService = ProductService();
    }

    async _updateSearchIndex(id, affected_list) {
        let result = null;
        if (config.has('search.keep_up_to_date') && config.get('search.keep_up_to_date')) {
            let _affected = affected_list ? affected_list : [];
            result = ElasticConWrapper(async conn => {
                let { deleted } = await IdxCourseService().importData(conn, { id: id, deleteIfNotExists: true, refresh: "true" });
                for (let i = 0; i < _affected.length; i++) {
                    let service = _affected[i];
                    switch (service) {
                        case "lesson":
                            if (deleted > 0)
                                await IdxLessonService().delete(conn, { courseId: id, refresh: "true" })
                            else
                                await IdxLessonService().importData(conn, { courseId: id, page: 5, refresh: "true" });
                            break;
                        default:
                            throw new Error(`DbCourse::_updateSearchIndex: Unknown service name: "${service}".`);
                    }
                }
            }, true);
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

    async courseMailData(id, path, options) {
        let result = {};
        let opts = options || {};
        let dbOpts = opts.dbOpts ? opts.dbOpts : {};
        let course_info = await $data.execSql({
            cmd: `select l.Name, c.URL from Course c join CourseLng l on c.Id = l.CourseId where c.Id = ${id}`
        }, dbOpts);
        if (course_info && course_info.detail && (course_info.detail.length !== 1))
            throw new Error(`Course Id=${id} doesn't exist.`);
        if (opts.mailCfg && opts.mailCfg.subject)
            result.subject = _.template(opts.mailCfg.subject)({ course: course_info.detail[0].Name });
        let host = config.proxyServer.siteHost;
        let render_path = `/${path}/${id}`;
        if (opts.params) {
            let query = null;
            for (let param in opts.params) {
                let val = opts.params[param];
                if (val) {
                    if (!query)
                        query = {};
                    query[param] = val;
                }
            }
            if(query)
                render_path += `?${querystring.stringify(query)}`;
        }
        let { statusCode, body: html } = await this._prerenderCache.prerender(render_path, false,
            { "User-Agent": SEO.NULL_USER_AGENT }, { host: host, response: true });
        if (statusCode !== HttpCode.OK)
            throw new HttpError(statusCode, `HTTP error "${statusCode}" accessing "${host + render_path}".`);
        result.body = html;
        return result;
    }

    async courseMailing(id, options) {

        let opts = options || {};
        let dbOpts = opts.dbOpts ? opts.dbOpts : {};
        let book = opts.book ? opts.book :
            (config.has('mail.mailing.newCourse.addressBook') ? config.get('mail.mailing.newCourse.addressBook') : DFLT_ADDRESS_BOOK);
        let sender = opts.sender ? opts.sender :
            (config.has('mail.mailing.newCourse.sender') ? config.get('mail.mailing.newCourse.sender') : null);
        if (!sender)
            throw new Error(`Sender parameter is missing.`);
        let sender_name = opts.sender_name ? opts.sender_name :
            (config.has('mail.mailing.newCourse.senderName') ? config.get('mail.mailing.newCourse.senderName') : DFLT_SENDER_NAME);

        let course_info = await $data.execSql({
            cmd: `select l.Name, c.URL from Course c join CourseLng l on c.Id = l.CourseId where c.Id = ${id}`
        }, dbOpts);
        if (course_info && course_info.detail && (course_info.detail.length !== 1))
            throw new Error(`Course Id=${id} doesn't exist.`)
        let path = opts.url ? `/${URL_PREFIX}/${course_info.detail[0].URL}` : `/${MAILING_PREFIX}/${id}`;
        let letter_subj = `Новый курс: ${course_info.detail[0].Name}.`;

        let book_id;
        let books = await SubscriptionService().listAddressBooks();
        if (books && Array.isArray(books) && books.length) {
            books.forEach(elem => {
                if (elem.name === book)
                    book_id = elem.id;
            })
            if (!book_id)
                throw new Error(`Address book "${book}" is missing!`);
        }
        else
            throw new Error(`List of address books is empty!`);

        let host = opts.host ? opts.host : (config.has('mail.mailing.newCourse.host')
            && config.mail.mailing.newCourse.host ? config.mail.mailing.newCourse.host : config.proxyServer.siteHost);
        let { statusCode, body: html } = await this._prerenderCache.prerender(path, false,
            { "User-Agent": SEO.NULL_USER_AGENT }, { host: host, response: true });
        if (statusCode !== HttpCode.OK)
            throw new HttpError(statusCode, `HTTP error "${statusCode}" accessing "${host + path}".`);

        let fin_result = opts.preview ? html : null;
        if (!opts.preview) {
            let dbOptions = { dbRoots: [] };
            let root_obj;

            let new_obj;
            let root_course;

            fin_result = await Utils.editDataWrapper(() => {
                return new MemDbPromise(this._db, resolve => {
                    let res = this._getObjById(id, {
                        expr: {
                            model: {
                                name: "Mailing",
                                childs: [
                                    {
                                        dataObject: {
                                            name: "CourseMailing"
                                        }
                                    }
                                ]
                            }
                        }
                    }, dbOpts);
                    resolve(res);
                })
                    .then(async (result) => {
                        root_obj = result;
                        dbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                        await root_obj.edit();

                        let fields = {
                            Name: letter_subj,
                            SenderName: sender_name,
                            SenderEmail: sender,
                            Subject: letter_subj,
                            BookId: book_id,
                            Body: html,
                            IsSent: false
                        };

                        let res_new = await root_obj.newObject({
                            fields: fields
                        }, dbOpts);

                        new_obj = this._db.getObj(res_new.newObject);
                        root_course = new_obj.getDataRoot("CourseMailing");
                        await root_obj.save(dbOpts);
                        await new_obj.edit();
                        let data = await SubscriptionService().createCampaign(sender_name, sender,
                            letter_subj, html, book_id, letter_subj);

                        let rc = data;
                        if (data && (!data.is_error) && (!data.error_code)) {
                            new_obj.isSent(true);
                            new_obj.campaignId(data.id);
                            new_obj.status(data.status);
                        }
                        else {
                            rc = {
                                is_error: true,
                                message: `Send error: ${data.message ? data.message : "Unknown error."}` +
                                    (data.error_code ? ` (error_code: ${data.error_code})` : "")
                            };
                        }
                        new_obj.resBody(JSON.stringify(rc));

                        if (!rc.is_error)
                            await root_course.newObject({
                                fields: { CourseId: id }
                            }, dbOpts);

                        await new_obj.save(dbOpts);
                        return rc;
                    });
            }, dbOptions);

            if (fin_result.is_error)
                throw new Error(fin_result.message);
        }
        return fin_result;
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

    async createFbPriceList(options) {
        const CURRENCY_CODE = "RUB";
        const URL_PARAMS = "?utm_source=facebook&utm_medium=social&utm_campaign=catalog";
        const CATEGORY = "543542"; // Media > Books > E-books

        let opts = options || {};
        if (!((opts.path || config.has("pricelist.fb.path")) && (opts.file || config.has("pricelist.fb.file"))))
            throw new Error(`DbCourse::createFbPriceList: Undefined pricelist file path!`);
        let fileName = path.join(opts.path ? opts.path : config.get("pricelist.fb.path"),
            opts.file ? opts.file : config.get("pricelist.fb.file"));

        let baseUrl = opts.baseUrl ? opts.baseUrl :
            (config.has("pricelist.fb.baseUrl") ? config.get("pricelist.fb.baseUrl") : this._baseUrl);
        let absDataUrl = this._getAbsDataUrl(baseUrl);
        let absCourseUrl = this._getAbsCourseUrl(baseUrl);

        let result = await $data.execSql({
            dialect: {
                mysql: _.template(COURSE_MYSQL_LSN_COVER_REQ)({}),
                mssql: _.template(COURSE_MSSQL_LSN_COVER_REQ)({})
            }
        }, {});
        let ext_images = {};
        let currId = -1;
        let currImgs = { str: "" };
        for (let i = 0; result && result.detail && (i < result.detail.length); i++) {
            let elem = result.detail[i];
            if (elem.Cover) {
                if (currId !== elem.Id) {
                    currId = elem.Id;
                    ext_images[currId] = currImgs = { str: "" };
                }
                if (currImgs.str.length > 0)
                    currImgs.str += ",";
                currImgs.str += absDataUrl + elem.Cover;
            }
        }

        let data = await this.getAllPublic(null, { show_paid: true, price_list: true });
        let authors = {};
        for (let i = 0; i < data.Authors.length; i++) {
            let elem = data.Authors[i];
            authors[elem.Id] = elem;
        };
        let courses = [];
        for (let i = 0; i < data.Courses.length; i++){
            let elem = data.Courses[i];
            if (elem._rawProduct) {
                courses.push({
                    id: `${elem.Id}`,
                    title: elem._rawProduct.Name,
                    description: striptags(elem.CrsDescription).replace(/\r?\n|\r/g, " "),
                    availability: "in stock",
                    condition: "new",
                    price: `${elem.Price} ${CURRENCY_CODE}`,
                    link: absCourseUrl + elem.URL + URL_PARAMS,
                    image_link: absDataUrl + elem.Cover,
                    google_product_category: CATEGORY,
                    brand: `${authors[elem.Authors[0]].FirstName} ${authors[elem.Authors[0]].LastName}`,
                    sale_price: elem.Discount ? `${elem.DPrice} ${CURRENCY_CODE}` : null,
                    sale_price_effective_date: elem.Discount ?
                        `${elem.Discount.FirstDate.toISOString()}/${elem.Discount.LastDate.toISOString()}` : null,
                    additional_image_link: ext_images[elem.Id] ? ext_images[elem.Id].str : null
                });
            }
        }
        let columns = ["id", "title", "description", "availability", "condition", "price",
            "link", "image_link", "google_product_category", "brand", "sale_price", "sale_price_effective_date", "additional_image_link"];
        let content = columns.join("\t");
        for (let i = 0; i < courses.length; i++)
            for (let j = 0; j < columns.length; j++)
                content += `${j === 0 ? "\n" : "\t"}${courses[i][columns[j]] ? courses[i][columns[j]] : ""}`;
        await writeFileAsync(fileName, content);
        return { result: "OK", file: fileName };
    }

    getAllPublic(user, options) {
        let courses = [];
        let authors = [];
        let categories = [];
        let courses_list = {};
        let lessons_list = {};
        let authors_list = {};
        let categories_list = {};
        let opts = options || {};
        let languageId = (typeof (opts.lang_id) === "number") && (!isNaN(opts.lang_id)) ? opts.lang_id : LANGUAGE_ID;
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let isPriceList = opts.price_list && ((opts.price_list === "true") || (opts.price_list === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;
        let userId = user ? user.Id : 0;
        let baseUrl;
        let productList = {};
        let pendingCourses = {};
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest) || opts.show_paid;

        return new Promise((resolve, reject) => {
            baseUrl = config.proxyServer.siteHost + "/";
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ALL_PUBLIC_REQ)({ accountId: ACCOUNT_ID, languageId: languageId, user_id: userId }),
                        mssql: _.template(COURSE_MSSQL_ALL_PUBLIC_REQ)({ accountId: ACCOUNT_ID, languageId: languageId, user_id: userId })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            if (userId) {
                                let paymentService = this.getService("payments", true);
                                if (paymentService)
                                    pendingCourses = await paymentService.getPendingObjects(userId);
                            }
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
                                            Cover: this._convertDataUrl(elem.Cover, isAbsPath, dLink),
                                            CoverMeta: this._convertMeta(elem.CoverMeta, isAbsPath, dLink),
                                            Mask: elem.Mask,
                                            Color: elem.Color,
                                            Name: elem.Name,
                                            CourseType: elem.CourseType,
                                            URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                                            IsSubsRequired: false,
                                            OneLesson: elem.OneLesson ? true : false,
                                            IsPaid: show_paid && elem.IsPaid && ((elem.PaidTp === 2)
                                                || ((elem.PaidTp === 1) && ((!elem.PaidDate) || ((now - elem.PaidDate) > 0)))) ? true : false,
                                            PaidTp: elem.PaidTp,
                                            PaidDate: elem.PaidDate,
                                            IsGift: (elem.PaidTp === 2) && user && user.RegDate
                                                && elem.PaidRegDate && ((elem.PaidRegDate - user.RegDate) > 0) ? true : false,
                                            IsBought: (elem.Counter || elem.GiftId) ? true : false,
                                            IsPending: pendingCourses[elem.Id] ? true : false,
                                            IsSubsFree: elem.IsSubsFree ? true : false,
                                            ProductId: elem.ProductId,
                                            Price: 0,
                                            DPrice: 0,
                                            Authors: [],
                                            Categories: [],
                                            Lessons: []
                                        };
                                        if (isPriceList)
                                            curr_course.CrsDescription = elem.CrsDescription;
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
                                        ContentType: elem.ContentType,
                                        State: elem.State,
                                        Cover: this._convertDataUrl(elem.LCover, isAbsPath, dLink),
                                        CoverMeta: this._convertMeta(elem.LCoverMeta, isAbsPath, dLink),
                                        URL: isAbsPath ? baseCourseUrl + elem.LURL : elem.LURL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        IsFreeInPaidCourse: elem.IsFreeInPaidCourse ? true : false,
                                        Name: elem.LName,
                                        ShortDescription: elem.ShortDescription,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        AuthorId: elem.AuthorId,
                                        Audios: [],
                                        Videos: []
                                    };
                                    curr_course.IsSubsRequired = curr_course.IsSubsRequired || lesson.IsSubsRequired;
                                    if (lesson.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                        lesson.FreeExpDate = elem.FreeExpDate;
                                    curr_course.Lessons.push(lesson);
                                    lessons_list[elem.LessonId] = lesson;
                                }
                                if (elem.Audio && (elem.ContentType === EpisodeContentType.AUDIO))
                                    lesson.Audios.push(this._convertDataUrl(elem.Audio, isAbsPath, dLink));
                                if (elem.VideoLink && (elem.ContentType === EpisodeContentType.VIDEO))
                                    lesson.Videos.push(elem.VideoLink);
                            })

                            if (Object.keys(productList).length > 0) {
                                let prods = await this._productService.get({
                                    TypeCode: "COURSEONLINE",
                                    Detail: true,
                                    Truncate: true
                                });
                                for (let i = 0; i < prods.length; i++){
                                    let prod = prods[i];
                                    let course = productList[prod.Id];
                                    if (course)
                                        this._setPriceByProd(course, prod, isPriceList);
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
                                        Counter: 0,
                                        CntByType: {}
                                    };
                                    categories.push(category);
                                    categories_list[elem.Id] = category;
                                }
                                category.Counter++;
                                if (typeof (category.CntByType[elem.CourseType]) === "undefined")
                                    category.CntByType[elem.CourseType] = 0;
                                category.CntByType[elem.CourseType]++;
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

    async getPriceInfo(url, user, options) {
        let course = null;
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let userId = user ? user.Id : 0;
        let pendingCourses = {};
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest);

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
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(COURSE_MYSQL_PRICE_REQ)({ user_id: userId, where: whereMYSQL }),
                mssql: _.template(COURSE_MSSQL_PRICE_REQ)({ user_id: userId, where: whereMSSQL })
            }
        }, {});
        if (result && result.detail && (result.detail.length > 0)) {
            if (userId) {
                let paymentService = this.getService("payments", true);
                if (paymentService)
                    pendingCourses = await paymentService.getPendingObjects(userId);
            }
            let isFirst = true;
            let now = new Date();
            result.detail.forEach((elem) => {
                if (isFirst) {
                    isFirst = false;
                    course = {
                        Id: elem.Id,
                        Name: elem.Name,
                        URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                        OneLesson: elem.OneLesson ? true : false,
                        IsSubsRequired: false,
                        IsBought: (elem.Counter || elem.GiftId) ? true : false,
                        IsPaid: show_paid && elem.IsPaid && ((elem.PaidTp === 2)
                            || ((elem.PaidTp === 1) && ((!elem.PaidDate) || ((now - elem.PaidDate) > 0)))) ? true : false,
                        PaidTp: elem.PaidTp,
                        PaidDate: elem.PaidDate,
                        IsGift: (elem.PaidTp === 2) && user && user.RegDate
                            && elem.PaidRegDate && ((elem.PaidRegDate - user.RegDate) > 0) ? true : false,
                        IsPending: pendingCourses[elem.Id] ? true : false,
                        IsSubsFree: elem.IsSubsFree ? true : false,
                        ProductId: elem.ProductId,
                        ProductName: elem.ProductName,
                        Price: 0,
                        DPrice: 0,
                    };
                };
            })
            await this.getCoursePrice(course);
            if (opts.promo && course.ProductId) {
                let promo = null;
                let promoService = this.getService("promo", true);
                if (promoService) {
                    let promos = await promoService.get({ code: opts.promo, prodList: true });
                    if (promos.length === 1)
                        promo = promos[0];
                }
                if (!promo) {
                    // Check for hard coded promo
                    try {
                        let last_date = getPromoDate(opts.promo);
                        let discount = 0;
                        if (last_date)
                            discount = getPromoDiscount(opts.promo);
                        if (last_date && (discount > 0)) {
                            last_date.setDate(last_date.getDate() + 1);
                            promo = {
                                Id: null,
                                Code: opts.promo,
                                FirstDate: now,
                                LastDate: last_date,
                                Perc: discount
                            }
                        };
                    }
                    catch (e) { };
                }
                if (promo) {
                    let isValid = (!promo.Products) || promo.Products[course.ProductId] ? true : false;
                    if (promo.Counter)
                        isValid = isValid && (promo.Rest > 0);
                    if (promo.FirstDate || promo.LastDate)
                        isValid = isValid && ((now - (promo.FirstDate ? promo.FirstDate : 0)) >= 0) &&
                            ((!promo.LastDate) || ((now - promo.LastDate) < 0));
                    if (isValid) {
                        course.Promo = {
                            Id: promo.Id,
                            Description: promo.Description,
                            Perc: promo.Perc,
                            PromoCode: promo.Code ? promo.Code : null
                        };
                        let dprice = course.Price * (1 - promo.Perc / 100);
                        course.Promo.Sum = Math.trunc(dprice / 10) * 10;
                        course.Promo.PromoSum = course.Price - course.Promo.Sum;
                    }
                }
            }
            return course;
        }
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find course "${url}".`);                            
    }

    getPublic(url, user, options) {
        let course = null;
        let courseId = 0;
        let lsn_list = {};
        let lc_list = {};
        let languageId;
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;
        let userId = user ? user.Id : 0;
        let baseUrl;
        let pendingCourses = {};
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest);

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
                        mysql: _.template(COURSE_MYSQL_PUBLIC_REQ)({ user_id: userId, where: whereMYSQL }),
                        mssql: _.template(COURSE_MSSQL_PUBLIC_REQ)({ user_id: userId, where: whereMSSQL })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            if (userId) {
                                let paymentService = this.getService("payments", true);
                                if (paymentService)
                                    pendingCourses = await paymentService.getPendingObjects(userId);
                            }
                            let isFirst = true;
                            let authors_list = {};
                            let now = new Date();
                            let courseUrl;
                            let tests = await TestService().getTestsByCourse(result.detail[0].Id, userId, opts);

                            result.detail.forEach((elem) => {
                                if (isFirst) {
                                    isFirst = false;
                                    languageId = elem.LanguageId;
                                    courseId = elem.Id;
                                    courseUrl = baseUrl + elem.URL + "/";
                                    course = {
                                        Id: elem.Id,
                                        LanguageId: elem.LanguageId,
                                        Cover: this._convertDataUrl(elem.Cover, isAbsPath, dLink),
                                        CoverMeta: this._convertMeta(elem.CoverMeta, isAbsPath, dLink),
                                        LandCover: this._convertDataUrl(elem.LandCover, isAbsPath, dLink),
                                        LandCoverMeta: this._convertMeta(elem.LandCoverMeta, isAbsPath, dLink),
                                        IsLandingPage: elem.IsLandingPage ? true : false,
                                        OneLesson: elem.OneLesson ? true : false,
                                        Mask: elem.Mask,
                                        Color: elem.Color,
                                        Name: elem.Name,
                                        Description: elem.Description,
                                        CourseType: elem.CourseType,
                                        URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                                        VideoIntwLink: elem.VideoIntwLink,
                                        VideoIntroLink: elem.VideoIntroLink,
                                        ShortDescription: elem.CShortDescription,
                                        TargetAudience: elem.TargetAudience,
                                        Aims: elem.Aims,
                                        EstDuration: elem.EstDuration,
                                        IntwD: elem.IntwD,
                                        IntwDFmt: elem.IntwDFmt,
                                        IntroD: elem.IntroD,
                                        IntroDFmt: elem.IntroDFmt,
                                        IsSubsRequired: false,
                                        ExtLinks: elem.ExtLinks,
                                        IsBought: (elem.Counter || elem.GiftId) ? true : false,
                                        IsPaid: show_paid && elem.IsPaid && ((elem.PaidTp === 2)
                                            || ((elem.PaidTp === 1) && ((!elem.PaidDate) || ((now - elem.PaidDate) > 0)))) ? true : false,
                                        PaidTp: elem.PaidTp,
                                        PaidDate: elem.PaidDate,
                                        IsGift: (elem.PaidTp === 2) && user && user.RegDate
                                            && elem.PaidRegDate && ((elem.PaidRegDate - user.RegDate) > 0) ? true : false,
                                        IsPending: pendingCourses[elem.Id] ? true : false,
                                        IsSubsFree: elem.IsSubsFree ? true : false,
                                        ProductId: elem.ProductId,
                                        Price: 0,
                                        DPrice: 0,
                                        Authors: [],
                                        Categories: [],
                                        Lessons: [],
                                        Books: [],
                                        RefBooks: [],
                                        ShareCounters: {},
                                        PageMeta: {}
                                    };

                                    if (tests)
                                        course.Tests = tests.Course;
                                    if (elem.SnName)
                                        course.PageMeta.Name = elem.SnName;
                                    if (elem.SnDescription)
                                        course.PageMeta.Description = elem.SnDescription;
                                    if (elem.SnPost)
                                        course.PageMeta.Post = elem.SnPost;
                                };
                                let lsn = lsn_list[elem.LessonId];
                                if (!lsn) {
                                    lsn = {
                                        Id: elem.LessonId,
                                        Number: elem.Number,
                                        ReadyDate: elem.ReadyDate,
                                        State: elem.State,
                                        ContentType: elem.ContentType,
                                        Cover: this._convertDataUrl(elem.LCover, isAbsPath, dLink),
                                        CoverMeta: this._convertMeta(elem.LCoverMeta, isAbsPath, dLink),
                                        URL: isAbsPath ? courseUrl + elem.LURL : elem.LURL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        IsFreeInPaidCourse: elem.IsFreeInPaidCourse ? true : false,
                                        IsFinished: elem.IsFinished ? true : false,
                                        Name: elem.LName,
                                        ShortDescription: elem.ShortDescription,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        AuthorId: elem.AuthorId,
                                        NSub: 0,
                                        NRefBooks: 0,
                                        NBooks: 0,
                                        Lessons: [],
                                        Audios: [],
                                        Videos: []
                                    };
                                    if (tests && tests.Lessons[lsn.Id])
                                        lsn.Tests = tests.Lessons[lsn.Id];
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
                                            if (lsn.State === "R") { // Show ready childs only !!!
                                                parent.Lessons.push(lsn);
                                                parent.NSub++;
                                            }
                                        }
                                    }
                                    lsn_list[elem.LessonId] = lsn;
                                }
                                if (elem.Audio && (elem.ContentType === EpisodeContentType.AUDIO))
                                    lsn.Audios.push(this._convertDataUrl(elem.Audio, isAbsPath, dLink));
                                if (elem.VideoLink && (elem.ContentType === EpisodeContentType.VIDEO))
                                    lsn.Videos.push(elem.VideoLink);
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
                                    Description: elem.Description,
                                    ShortDescription: elem.ShortDescription,
                                    Occupation: elem.Occupation,
                                    Employment: elem.Employment,
                                    Portrait: this._convertDataUrl(elem.Portrait, isAbsPath, dLink),
                                    PortraitMeta: this._convertMeta(elem.PortraitMeta, isAbsPath, dLink),
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
                                    book.Cover = this._convertDataUrl(elem.Cover, isAbsPath, dLink);
                                    book.CoverMeta = this._convertMeta(elem.CoverMeta, isAbsPath, dLink);
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
                    })
                    .then(async () => {
                        if (course) {
                            course.PageMeta.Images = await this.getCourseImages(courseId, isAbsPath, dLink);
                            // let result = await $data.execSql({
                            //     dialect: {
                            //         mysql: _.template(COURSE_MYSQL_IMG_REQ)({ id: courseId }),
                            //         mssql: _.template(COURSE_MSSQL_IMG_REQ)({ id: courseId })
                            //     }
                            // }, {});
                            // if (result && result.detail && (result.detail.length > 0)) {
                            //     course.PageMeta.Images = {};
                            //     result.detail.forEach((elem) => {
                            //         course.PageMeta.Images[elem.Type] = {
                            //             FileName: this._convertDataUrl(elem.FileName, isAbsPath, dLink),
                            //             MetaData: this._convertMeta(elem.MetaData, isAbsPath, dLink)
                            //         };
                            //     })
                            // }
                            let result = await $data.execSql({
                                dialect: {
                                    mysql: _.template(COURSE_REVIEW_MYSQL_REQ)({ courseId: courseId }),
                                    mssql: _.template(COURSE_REVIEW_MSSQL_REQ)({ courseId: courseId })
                                }
                            }, {});
                            course.Reviews = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach(elem => {
                                    course.Reviews.push(elem);
                                });
                            }
                        }
                        return course;
                    })
            );
        })
    }

    async getCourseImages(courseId, isAbsPath, dLink) {
        let images = {};
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(COURSE_MYSQL_IMG_REQ)({ id: courseId }),
                mssql: _.template(COURSE_MSSQL_IMG_REQ)({ id: courseId })
            }
        }, {});
        if (result && result.detail && (result.detail.length > 0)) {
            result.detail.forEach((elem) => {
                images[elem.Type] = {
                    FileName: this._convertDataUrl(elem.FileName, isAbsPath, dLink),
                    MetaData: this._convertMeta(elem.MetaData, isAbsPath, dLink)
                };
            })
        }
        return images;
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

    _setPriceByProd(course, prod, hasRaw) {
        course.Price = prod.Price;
        course.DPrice = prod.DPrice;
        if (prod.Discount)
            course.Discount = prod.Discount;
        if (prod.DynDiscounts)
            course.DynDiscounts = prod.DynDiscounts;
        if (hasRaw)
            course._rawProduct = prod;
    }

    async getCoursePrice(course, withCheckProd, alwaysShowDiscount) {
        course.Price = 0;
        course.DPrice = 0;
        delete course.Discount;
        if (course.IsPaid && course.ProductId) {
            let prods = await this._productService.get({
                Id: course.ProductId,
                Detail: true,
                AlwaysShowDiscount: alwaysShowDiscount ? true : false,
                Truncate: true
            });
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

    get(id, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let course = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id }),
                        mssql: _.template(COURSE_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id })
                    }
                }, dbOpts)
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            course = result.detail[0];
                            course.OneLesson = course.OneLesson ? true : false;
                            course.IsPaid = course.IsPaid ? true : false;
                            course.IsSubsFree = course.IsSubsFree ? true : false;
                            course.IsLandingPage = course.IsLandingPage ? true : false;
                            await this.getCoursePrice(course, true, true);
                        }
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find course "Id" = ${id}.`);
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ id: id })
                            }
                        }, dbOpts);
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
                        }, dbOpts);
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
                        }, dbOpts);
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
                    })
                    .then(async () => {
                        let result = await $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_IMG_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_IMG_REQ)({ id: id })
                            }
                        }, dbOpts);
                        let images = [];
                        if (result && result.detail && (result.detail.length > 0)) {
                            images = result.detail;
                        }
                        course.Images = images;
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
                    .then(async (result) => {
                        await this._updateSearchIndex(id);
                        return result;
                    })
                    .then((result) => {
                        return this.clearCache(course_url)
                            .then(() => {
                                let rc = Promise.resolve(result);
                                if (urls_to_clear.length > 0) {
                                    rc = Utils.seqExec(urls_to_clear, (url) => {
                                        let lessonService = this.getService("lesson", true);
                                        if (lessonService)
                                            return lessonService.clearCache(url);
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
            if (data.DynDiscounts) {
                prodData.DynDiscounts = data.DynDiscounts;
                for (let key in prodData.DynDiscounts) {
                    prodData.DynDiscounts[key].DiscountTypeId = Product.DiscountTypes.DynCoursePercId;
                    prodData.DynDiscounts[key].PriceListId = Product.DefaultPriceListId;
                }
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
            let root_img;
            let img_collection;
            let img_list = {};
            let img_new = [];

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
            let affected = [];
            let old_name;
            let make_name = () => {
                return `${crs_lng_obj.name()}|${crs_obj.state()}|${crs_obj.uRL()}`
            };

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
                        root_img = crs_lng_obj.getDataRoot("CourseMetaImage");
                        img_collection = root_img.getCol("DataElements");

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

                        if (inpFields.Images && (typeof (inpFields.Images.length) === "number")) {
                            for (let i = 0; i < img_collection.count(); i++) {
                                let obj = img_collection.get(i);
                                img_list[obj.id()] = { deleted: true, obj: obj };
                            }

                            inpFields.Images.forEach((elem) => {
                                let data = {
                                    Type: elem.Type,
                                    FileName: elem.FileName,
                                    MetaData: typeof (elem.MetaData) === "string" ? elem.MetaData : JSON.stringify(elem.MetaData)
                                };
                                if (typeof (elem.Id) === "number") {
                                    if (img_list[elem.Id]) {
                                        img_list[elem.Id].deleted = false;
                                        img_list[elem.Id].data = data;
                                    }
                                    else {
                                        //throw new Error("Unknown reference item (Id = " + elem.Id + ").");
                                        delete elem.Id;
                                        img_new.push(data);
                                    }
                                }
                                else
                                    img_new.push(data);
                            })
                        }

                        return crs_obj.edit()
                    })
                    .then(async () => {

                        old_name = make_name();
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
                        if (typeof (inpFields["PaidTp"]) !== "undefined")
                            crs_obj.paidTp(inpFields["PaidTp"]);
                        if (typeof (inpFields["PaidDate"]) !== "undefined")
                            crs_obj.paidDate(inpFields["PaidDate"]);
                        if (typeof (inpFields["PaidRegDate"]) !== "undefined")
                            crs_obj.paidRegDate(inpFields["PaidRegDate"]);
                        if (crs_obj.isPaid()) {
                            switch (crs_obj.paidTp()) {
                                case 1:
                                    break;
                                case 2:
                                    if (!crs_obj.paidRegDate())
                                        throw new Error(`"PaidRegDate" can't be empty.`);
                                    break;
                                default:
                                    throw new Error(`Invalid "PaidTp" = ${crs_obj.paidTp()}, only (1, 2) are allowed.`);
                            }
                        }
                        else
                            crs_obj.paidTp(null);
                        if (typeof (inpFields["IsSubsFree"]) === "boolean")
                            crs_obj.isSubsFree(inpFields["IsSubsFree"]);

                        if (typeof (inpFields["LandCover"]) !== "undefined")
                            crs_obj.landCover(inpFields["LandCover"]);
                        if (typeof (inpFields["LandCoverMeta"]) !== "undefined")
                            crs_obj.landCoverMeta(inpFields["LandCoverMeta"]);
                        if (typeof (inpFields["IsLandingPage"]) === "boolean")
                            crs_obj.isLandingPage(inpFields["IsLandingPage"]);
                        if (typeof (inpFields["CourseType"]) !== "undefined")
                            crs_obj.courseType(inpFields["CourseType"]);
                        
                        if (typeof (inpFields["State"]) !== "undefined")
                            crs_lng_obj.state(inpFields["State"] === "P" ? "R" : inpFields["State"]);
                        if (typeof (inpFields["Name"]) !== "undefined")
                            crs_lng_obj.name(inpFields["Name"]);
                        if (old_name !== make_name())
                            affected.push("lesson");
                        if (typeof (inpFields["Description"]) !== "undefined")
                            crs_lng_obj.description(inpFields["Description"]);
                        if (typeof (inpFields["ExtLinks"]) !== "undefined")
                            crs_lng_obj.extLinks(this._partnerLink.processLinks(inpFields["ExtLinks"]));
                        if (typeof (inpFields["SnPost"]) !== "undefined")
                            crs_lng_obj.snPost(inpFields["SnPost"]);
                        if (typeof (inpFields["SnName"]) !== "undefined")
                            crs_lng_obj.snName(inpFields["SnName"]);
                        if (typeof (inpFields["SnDescription"]) !== "undefined")
                            crs_lng_obj.snDescription(inpFields["SnDescription"]);
                        if (typeof (inpFields["VideoIntwLink"]) !== "undefined") {
                            crs_lng_obj.videoIntwLink(inpFields["VideoIntwLink"]);
                            let { fmt, sec } = await this._getVideoInfo(crs_lng_obj.videoIntwLink());
                            crs_lng_obj.intwD(sec);
                            crs_lng_obj.intwDFmt(fmt);
                        }
                        if (typeof (inpFields["VideoIntroLink"]) !== "undefined") {
                            crs_lng_obj.videoIntroLink(inpFields["VideoIntroLink"]);
                            let { fmt, sec } = await this._getVideoInfo(crs_lng_obj.videoIntroLink());
                            crs_lng_obj.introD(sec);
                            crs_lng_obj.introDFmt(fmt);
                        }

                        if (typeof (inpFields["ShortDescription"]) !== "undefined")
                            crs_lng_obj.shortDescription(inpFields["ShortDescription"]);
                        if (typeof (inpFields["TargetAudience"]) !== "undefined")
                            crs_lng_obj.targetAudience(inpFields["TargetAudience"]);
                        if (typeof (inpFields["Aims"]) !== "undefined")
                            crs_lng_obj.aims(inpFields["Aims"]);
                        if (typeof (inpFields["EstDuration"]) !== "undefined")
                            crs_lng_obj.estDuration(inpFields["EstDuration"]);

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
                    .then(async () => {
                        for (let key in img_list)
                            if (img_list[key].deleted)
                                img_collection._del(img_list[key].obj)
                            else {
                                for (let field in img_list[key].data)
                                    img_list[key].obj[self._genGetterName(field)](img_list[key].data[field]);
                            }
                        if (img_new && (img_new.length > 0)) {
                            for (let i = 0; i < img_new.length; i++)
                                await root_img.newObject({
                                    fields: img_new[i]
                                }, opts);
                        }
                    })
                    .then(async () => {
                        if (Object.keys(lc_deleted).length > 0) {
                            let lessonService = this.getService("lesson", true);
                            if (lessonService) {
                                for (let key in lc_deleted) {
                                    let links = await lessonService.clearCache(+key, true, opts);
                                    Array.prototype.push.apply(urls_to_delete, links);
                                }
                            }
                        }
                    })
                    .then(() => {
                        isModified = needToDeleteOwn;
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts.transactionId = transactionId;
                                return this._createOrUpdateProduct(crs_obj,
                                    { Price: inpFields.Price, Discount: inpFields.Discount, DynDiscounts: inpFields.DynDiscounts }, opts)
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
                        if (needToDeleteOwn) {
                            let lesson_ids = [];
                            let lesson_del_func = (elem) => {
                                let id = elem.lessonId();
                                return $data.execSql({
                                    dialect: {
                                        mysql: _.template(CHECK_IF_CAN_DEL_LESSON_MYSQL)({ id: id }),
                                        mssql: _.template(CHECK_IF_CAN_DEL_LESSON_MSSQL)({ id: id })
                                    }
                                }, opts)
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
                    .then(async (result) => {
                        await this._updateSearchIndex(id, affected);
                        return result;
                    })
                    .then((result) => {
                        let rc = result;
                        if (isModified)
                            rc = this.prerender(id, false, old_url)
                                .then(() => {
                                    if (urls_to_delete.length > 0)
                                        return Utils.seqExec(urls_to_delete, (url) => {
                                            let lessonService = this.getService("lesson", true);
                                            if (lessonService)
                                                return lessonService.clearCache(url);
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
            let new_lng_obj;
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
                        if (typeof (inpFields["PaidTp"]) !== "undefined")
                            fields["PaidTp"] = inpFields["PaidTp"];
                        if (typeof (inpFields["PaidDate"]) !== "undefined")
                            fields["PaidDate"] = inpFields["PaidDate"];
                        if (typeof (inpFields["PaidRegDate"]) !== "undefined")
                            fields["PaidRegDate"] = inpFields["PaidRegDate"];
                        if (fields["IsPaid"]) {
                            switch (fields["PaidTp"]) {
                                case 1:
                                    break;
                                case 2:
                                    if (!fields["PaidRegDate"])
                                        throw new Error(`"PaidRegDate" can't be empty.`);
                                    break;
                                default:
                                    throw new Error(`Invalid "PaidTp" = ${fields["PaidTp"]}, only (1, 2) are allowed.`);
                            }
                        }
                        else
                            delete fields["PaidTp"];

                        fields["IsSubsFree"] = false;
                        if (typeof (inpFields["IsSubsFree"]) === "boolean")
                            fields["IsSubsFree"] = inpFields["IsSubsFree"];

                        if (typeof (inpFields["LandCover"]) !== "undefined")
                            fields["LandCover"] = inpFields["LandCover"];
                        if (typeof (inpFields["LandCoverMeta"]) !== "undefined")
                            fields["LandCoverMeta"] = inpFields["LandCoverMeta"];
                        fields["IsLandingPage"] = false;
                        if (typeof (inpFields["IsLandingPage"]) === "boolean")
                            fields["IsLandingPage"] = inpFields["IsLandingPage"];
                        fields["CourseType"] = 1; // Theoretical course
                        if (typeof (inpFields["CourseType"]) !== "undefined")
                            fields["CourseType"] = inpFields["CourseType"];

                        if (!languageId)
                            throw new Erorr("Field \"LanguageId\" is required.");
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(async (result) => {
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
                        if (typeof (inpFields["SnPost"]) !== "undefined")
                            fields["SnPost"] = inpFields["SnPost"];
                        if (typeof (inpFields["SnName"]) !== "undefined")
                            fields["SnName"] = inpFields["SnName"];
                        if (typeof (inpFields["SnDescription"]) !== "undefined")
                            fields["SnDescription"] = inpFields["SnDescription"];
                        if (typeof (inpFields["VideoIntwLink"]) !== "undefined") {
                            fields["VideoIntwLink"] = inpFields["VideoIntwLink"];
                            let { fmt, sec } = await this._getVideoInfo(fields["VideoIntwLink"]);
                            fields["IntwD"] = sec;
                            fields["IntwDFmt"] = fmt;
                        }
                        if (typeof (inpFields["VideoIntroLink"]) !== "undefined") {
                            fields["VideoIntroLink"] = inpFields["VideoIntroLink"];
                            let { fmt, sec } = await this._getVideoInfo(fields["VideoIntroLink"]);
                            fields["IntroD"] = sec;
                            fields["IntroDFmt"] = fmt;
                        }

                        if (typeof (inpFields["ShortDescription"]) !== "undefined")
                            fields["ShortDescription"] = inpFields["ShortDescription"];
                        if (typeof (inpFields["TargetAudience"]) !== "undefined")
                            fields["TargetAudience"] = inpFields["TargetAudience"];
                        if (typeof (inpFields["Aims"]) !== "undefined")
                            fields["Aims"] = inpFields["Aims"];
                        if (typeof (inpFields["EstDuration"]) !== "undefined")
                            fields["EstDuration"] = inpFields["EstDuration"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(result => {
                        new_lng_obj = this._db.getObj(result.newObject);
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
                        let root_img = new_lng_obj.getDataRoot("CourseMetaImage");
                        if (inpFields.Images && (inpFields.Images.length > 0)) {
                            return Utils.seqExec(inpFields.Images, (elem) => {
                                let fields = {};
                                if (typeof (elem["Type"]) !== "undefined")
                                    fields["Type"] = elem["Type"];
                                if (typeof (elem["FileName"]) !== "undefined")
                                    fields["FileName"] = elem["FileName"];
                                if (typeof (elem["MetaData"]) !== "undefined")
                                    fields["MetaData"] = typeof (elem["MetaData"]) === "string" ?
                                        elem["MetaData"] : JSON.stringify(elem["MetaData"]);
                                return root_img.newObject({
                                    fields: fields
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
                                return this._createOrUpdateProduct(new_obj,
                                    { Price: inpFields.Price, Discount: inpFields.Discount, DynDiscounts: inpFields.DynDiscounts }, opts)
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
                    .then(async (result) => {
                        await this._updateSearchIndex(newId);
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
