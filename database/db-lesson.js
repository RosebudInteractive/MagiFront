const _ = require('lodash');
const config = require('config');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const { Intervals } = require('../const/common');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { PartnerLink } = require('../utils/partner-link');
const { CoursesService } = require('./db-course');
const { TestService } = require('./db-test');
const { getTimeStr, buildLogString } = require('../utils');
const { AccessFlags } = require('../const/common');
const { AccessRights } = require('../security/access-rights');
const { truncateHtml } = require('../utils');

const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;
const isBillingTest = config.has("billing.billing_test") ? config.billing.billing_test : false;

const {
    ACCOUNT_ID,
    AUTHORS_BY_ID_MSSQL_PUBLIC_REQ,
    AUTHORS_BY_ID_MYSQL_PUBLIC_REQ,
    CHECK_IF_CAN_DEL_LESSON_MSSQL,
    CHECK_IF_CAN_DEL_LESSON_MYSQL,
    EpisodeContentType
} = require('../const/sql-req-common');

const COURSE_REQ_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "LessonCourse"
                    }
                }
            ]
        }
    }
};

const LESSON_REQ_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "Resource",
                        childs: [
                            {
                                dataObject: {
                                    name: "ResourceLng"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "LessonLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "Reference"
                                }
                            },
                            {
                                dataObject: {
                                    name: "LessonMetaImage"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "Lesson"
                    }
                },
                {
                    dataObject: {
                        name: "EpisodeLesson"
                    }
                }
            ]
        }
    }
};

const LESSON_UPD_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "Resource",
                        childs: [
                            {
                                dataObject: {
                                    name: "ResourceLng"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "LessonLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "Reference"
                                }
                            },
                            {
                                dataObject: {
                                    name: "LessonMetaImage"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "Episode"
                    }
                },
                {
                    dataObject: {
                        name: "Lesson"
                    }
                },
                {
                    dataObject: {
                        name: "EpisodeLesson"
                    }
                }
            ]
        }
    }
};

const LESSON_MSSQL_ID_REQ =
    "select l.[Id], l.[IsFreeInPaidCourse], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL], ll.[Name], ll.[LanguageId], ll.[ShortDescription], ll.[FullDescription], cl.[Name] as [CourseName], c.[Id] as [CourseId],\n" +
    "  ll.[SnPost], ll.[SnName], ll.[SnDescription], ll.[ExtLinks],\n" +
    "  clo.[Name] as [CourseNameOrig], co.[Id] as [CourseIdOrig], a.[Id] as [AuthorId], l.[Cover], l.[CoverMeta], lc.[Number], lc.[ReadyDate],\n"+
    "  lc.[State], l.[LessonType], l.[ParentId], lcp.[LessonId] as [CurrParentId], lpl.[Name] as [CurrParentName] from [Lesson] l\n" +
    "  join [LessonLng] ll on l.[Id] = ll.[LessonId]\n" +
    "  join [LessonCourse] lc on l.[Id] = lc.[LessonId]\n" +
    "  join [Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join [AuthorLng] al on a.[Id] = al.[AuthorId]\n" +
    "  join [Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId]\n" +
    "  join [Course] co on co.[Id] = l.[CourseId]\n" +
    "  join [CourseLng] clo on co.[Id] = clo.[CourseId]\n" +
    "  left join [LessonCourse] lcp on lc.[ParentId] = lcp.[Id]\n" +
    "  left join [LessonLng] lpl on lcp.[LessonId] = lpl.[LessonId]\n" +
    "where l.[Id] = <%= id %> and lc.[CourseId] = <%= courseId %>";

const LESSON_MSSQL_CHLD_REQ =
    "select l.[Id], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL], ll.[Name], ll.[ShortDescription], ll.[FullDescription], cl.[Name] as [CourseName], c.[Id] as [CourseId],\n" +
    "  clo.[Name] as [CourseNameOrig], co.[Id] as [CourseIdOrig], a.[Id] as [AuthorId], l.[Cover], l.[CoverMeta], lc.[Number], lc.[ReadyDate],\n" +
    "  lc.[State], l.[LessonType], l.[ParentId], lcp.[LessonId] as [CurrParentId] from [Lesson] l\n" +
    "  join [LessonLng] ll on l.[Id] = ll.[LessonId]\n" +
    "  join [LessonCourse] lc on l.[Id] = lc.[LessonId]\n" +
    "  join [Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join [AuthorLng] al on a.[Id] = al.[AuthorId]\n" +
    "  join [Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId]\n" +
    "  join [Course] co on co.[Id] = l.[CourseId]\n" +
    "  join [CourseLng] clo on co.[Id] = clo.[CourseId]\n" +
    "  join [LessonCourse] lcp on lc.[ParentId] = lcp.[Id]\n" +
    "where lcp.[LessonId] = <%= id %> and lcp.[CourseId] = <%= courseId %>\n" +
    "order by lc.[Number]";

const LESSON_MYSQL_ID_REQ =
    "select l.`Id`, l.`IsFreeInPaidCourse`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL`, ll.`Name`, ll.`LanguageId`, ll.`ShortDescription`, ll.`FullDescription`, cl.`Name` as `CourseName`, c.`Id` as `CourseId`,\n" +
    "  ll.`SnPost`, ll.`SnName`, ll.`SnDescription`, ll.`ExtLinks`,\n" +
    "  clo.`Name` as `CourseNameOrig`, co.`Id` as `CourseIdOrig`, a.`Id` as `AuthorId`, l.`Cover`, l.`CoverMeta`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  lc.`State`, l.`LessonType`, l.`ParentId`, lcp.`LessonId` as `CurrParentId`, lpl.`Name` as `CurrParentName` from `Lesson` l\n" +
    "  join `LessonLng` ll on l.`Id` = ll.`LessonId`\n" +
    "  join `LessonCourse` lc on l.`Id` = lc.`LessonId`\n" +
    "  join `Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join `AuthorLng` al on a.`Id` = al.`AuthorId`\n" +
    "  join `Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId`\n" +
    "  join `Course` co on co.`Id` = l.`CourseId`\n" +
    "  join `CourseLng` clo on co.`Id` = clo.`CourseId`\n" +
    "  left join `LessonCourse` lcp on lc.`ParentId` = lcp.`Id`\n" +
    "  left join `LessonLng` lpl on lcp.`LessonId` = lpl.`LessonId`\n" +
    "where l.`Id` = <%= id %> and lc.`CourseId` = <%= courseId %>";

const LESSON_MYSQL_CHLD_REQ =
    "select l.`Id`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL`, ll.`Name`, ll.`ShortDescription`, ll.`FullDescription`, cl.`Name` as `CourseName`, c.`Id` as `CourseId`,\n" +
    "  clo.`Name` as `CourseNameOrig`, co.`Id` as `CourseIdOrig`, a.`Id` as `AuthorId`, l.`Cover`, l.`CoverMeta`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  lc.`State`, l.`LessonType`, l.`ParentId`, lcp.`LessonId` as `CurrParentId` from `Lesson` l\n" +
    "  join `LessonLng` ll on l.`Id` = ll.`LessonId`\n" +
    "  join `LessonCourse` lc on l.`Id` = lc.`LessonId`\n" +
    "  join `Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join `AuthorLng` al on a.`Id` = al.`AuthorId`\n" +
    "  join `Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId`\n" +
    "  join `Course` co on co.`Id` = l.`CourseId`\n" +
    "  join `CourseLng` clo on co.`Id` = clo.`CourseId`\n" +
    "  join `LessonCourse` lcp on lc.`ParentId` = lcp.`Id`\n" +
    "where lcp.`LessonId` = <%= id %> and lcp.`CourseId` = <%= courseId %>\n" +
    "order by lc.`Number`";

const LESSON_MSSQL_EPISODE_REQ =
    "select e.[Id], epl.[Name], el.[Number], epl.[State], el.[Supp] from [EpisodeLesson] el\n" +
    "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join [EpisodeLng] epl on e.[Id] = epl.[EpisodeId]\n" +
    "where el.[LessonId] = <%= id %>";

const LESSON_MSSQL_REFERENCE_REQ =
    "select r.[Id], r.[Description], r.[Number], r.[URL], r.[Recommended] from [Reference] r\n" +
    "  join [LessonLng] l on l.[Id] = r.[LessonLngId]\n" +
    "where l.[LessonId] = <%= id %>";

const LESSON_MSSQL_BOOK_REQ =
    "select b.[Order], b.[Id], b.[Name], b.[Description], b.[CourseId], b.[OtherAuthors], b.[OtherCAuthors],\n" +
    "  b.[Cover], b.[CoverMeta], b.[ExtLinks], ba.[AuthorId], ba.[Tp], ba.[TpView],\n" +
    "  a.[URL], al.[FirstName], al.[LastName]\n" +
    "from[Book] b\n" +
    "  left join[BookAuthor] ba on ba.[BookId] = b.[Id]\n" +
    "  left join[Author] a on a.[Id] = ba.[AuthorId]\n" +
    "  left join[AuthorLng] al on al.[AuthorId] = ba.[AuthorId]\n" +
    "where b.[Id] in\n" +
    "(\n" +
    "  select distinct b.[Id] from[Book] b\n" +
    "    join[BookAuthor] ba on ba.[BookId] = b.[Id]\n" +
    "    join[Author] a on a.[Id] = ba.[AuthorId]\n" +
    "    join[AuthorLng] al on al.[AuthorId] = ba.[AuthorId]\n" +
    "  where(ba.[AuthorId] = <%= authorId %>) and(ba.[TpView] = 2) and((b.[CourseId] is NULL) or(b.[CourseId] = <%= courseId %>))\n" +
    ")\n" +
    "order by 1";

const LESSON_MSSQL_RESOURCE_REQ =
    "select r.[Id], r.[ResType], r.[FileName], r.[ResLanguageId], r.[ShowInGalery], ll.[Language], l.[Name], l.[Description], l.[AltAttribute], r.[MetaData] from [Resource] r\n" +
    "  join [ResourceLng] l on l.[ResourceId] = r.[Id]\n" +
    "  left join [Language] ll on ll.[Id] = r.[ResLanguageId]\n" +
    "where r.[LessonId] = <%= id %>";

const LESSON_MSSQL_IMG_REQ =
    "select i.[Id], i.[Type], i.[ResourceId] from [LessonMetaImage] i\n" +
    "  join [LessonLng] l on l.[Id] = i.[LessonLngId]\n" +
    "where l.[LessonId] = <%= id %>";

const LESSON_MSSQL_TOC_REQ =
    "select lls.[Name], e.[Id] Episode, t.[Id], t.[Number], l.[Topic], l.[StartTime] from[EpisodeToc] t\n" +
    "  join[EpisodeTocLng] l on l.[EpisodeTocId] = t.[Id]\n" +
    "  join[Episode] e on e.[Id] = t.[EpisodeId]\n" +
    "  join[EpisodeLesson] pl on pl.[EpisodeId] = e.[Id]\n" +
    "  join[Lesson] ls on ls.[Id] = pl.[LessonId]\n" +
    "  join[LessonLng] lls on lls.[LessonId] = ls.[Id]\n" +
    "where pl.[LessonId] = <%= id %>\n" +
    "order by e.[Id], t.[Number]";

const LESSON_EPI_MSSQL_TOC_REQ =
    "select lls.[Name], e.[Id] Episode, t.[Id], t.[Number], l.[Topic], l.[StartTime] from[EpisodeToc] t\n" +
    "  join[EpisodeTocLng] l on l.[EpisodeTocId] = t.[Id]\n" +
    "  join[Episode] e on e.[Id] = t.[EpisodeId]\n" +
    "  join[EpisodeLesson] pl on pl.[EpisodeId] = e.[Id]\n" +
    "  join[Lesson] ls on ls.[Id] = pl.[LessonId]\n" +
    "  join[LessonLng] lls on lls.[LessonId] = ls.[Id]\n" +
    "where pl.[LessonId] = <%= id %> and e.[Id] = <%= episodeId %>\n" +
    "order by e.[Id], t.[Number]";

const LESSON_MSSQL_CONTENT_REQ =
    "select e.[Id] Episode, t.[Id], l.[Name], l.[Audio], l.[AudioMeta], r.[Id] as[AssetId],\n" +
    "  l.[VideoLink], l.[Duration], e.[ContentType],\n" +
    "  t.[StartTime], t.[Content] from[EpisodeLesson] pl\n" +
    "  join[Episode] e on pl.[EpisodeId] = e.[Id]\n" +
    "  join[EpisodeLng] l on l.[EpisodeId] = e.[Id]\n" +
    "  left join[EpisodeContent] t on t.[EpisodeLngId] = l.[Id]\n" +
    "  left join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "where pl.[LessonId] = <%= id %>\n" +
    "order by pl.[Number], e.[Id], t.[StartTime]";

const LESSON_EPI_MSSQL_CONTENT_REQ =
    "select e.[Id] Episode, t.[Id], l.[Name], l.[Audio], l.[AudioMeta], r.[Id] as[AssetId],\n" +
    "  l.[VideoLink], l.[Duration], e.[ContentType],\n" +
    "  t.[StartTime], t.[Content] from[EpisodeLesson] pl\n" +
    "  join[Episode] e on pl.[EpisodeId] = e.[Id]\n" +
    "  join[EpisodeLng] l on l.[EpisodeId] = e.[Id]\n" +
    "  left join[EpisodeContent] t on t.[EpisodeLngId] = l.[Id]\n" +
    "  left join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "where pl.[LessonId] = <%= id %> and e.[Id] = <%= episodeId %>\n" +
    "order by pl.[Number], e.[Id], t.[StartTime]";

const LESSON_MSSQL_ASSETS_REQ =
    "select r.[Id], r.[ResType], r.[FileName], r.[ResLanguageId], r.[ShowInGalery], rl.[Name], rl.[Description], r.[MetaData] from [EpisodeContent] t\n" +
    "  join[EpisodeLng] l on l.[Id] = t.[EpisodeLngId]\n" +
    "  join[Episode] e on e.[Id] = l.[EpisodeId]\n" +
    "  join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "  join[ResourceLng] rl on rl.[ResourceId] = r.[Id]\n" +
    "  join [EpisodeLesson] pl on pl.[EpisodeId] = e.[Id]" +
    "where pl.[LessonId] = <%= id %>";

const LESSON_MSSQL_ASSETS_ALL_REQ =
    "select r.[Id], r.[ResType], r.[FileName], r.[ResLanguageId], r.[ShowInGalery], rl.[Name], rl.[Description], r.[MetaData] from [Resource] r\n" +
    "  join[ResourceLng] rl on rl.[ResourceId] = r.[Id]\n" +
    "  join[Episode] e on e.[LessonId] = r.[LessonId]\n" +
    "where e.[Id] = <%= episodeId %>";

const LESSON_MSSQL_REQ =
    "select lc.[CourseId], c.[URL] as[CURL], cl.[LanguageId], cl.[Name] as[CName], l.[Id], ll.[Name], ll.[ShortDescription], lc.[State], lc.[ReadyDate],\n" +
    "  l.[Cover], l.[CoverMeta], ll.[Duration], ll.[DurationFmt], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL], l.[AuthorId], lc.[Number],\n" +
    "  lch.[Id] as[IdCh], llch.[Name] as[NameCh], llch.[ShortDescription] as[ShortDescriptionCh],\n" +
    "  lcch.[State] as[StateCh], lcch.[ReadyDate] as[ReadyDateCh], lch.[Cover] as[CoverCh], lch.[CoverMeta] as[CoverMetaCh],\n" +
    "  llch.[Duration] as[DurationCh], lcch.[Number] as[NumberCh],\n" +
    "  llch.[DurationFmt] as[DurationFmtCh], lch.[IsAuthRequired] as[IsAuthRequiredCh], lch.[IsSubsRequired] as[IsSubsRequiredCh],\n" +
    "  lch.[FreeExpDate] as[FreeExpDateCh], lch.[URL] as[URLCh], lch.[AuthorId] as[AuthorIdCh]\n" +
    "from[LessonCourse] lc\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[CourseLng] cl on c.[Id] = cl.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join[LessonCourse] lcch on lcch.[ParentId] = lc.[Id]\n" +
    "  left join[Lesson] lch on lch.[Id] = lcch.[LessonId]\n" +
    "  left join[LessonLng] llch on llch.[LessonId] = lch.[Id]\n" +
    "where c.[URL] = '<%= course_url %>' and l.[URL] = '<%= lesson_url %>'\n" +
    "order by lcch.[Number]";

const LESSON_MSSQL_REQ_V2 =
    "select lc.[Id] as [ParentId], lc.[CourseId], c.[URL] as [CURL], cl.[LanguageId], cl.[Name] as [CName], l.[Id], ll.[Name], ll.[ShortDescription], lc.[State], lc.[ReadyDate],\n" +
    "  l.[Cover], l.[CoverMeta], ll.[Duration], ll.[DurationFmt], l.[IsFreeInPaidCourse], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL], l.[AuthorId], lc.[Number],\n" +
    "  ll.[SnPost], ll.[SnName], ll.[SnDescription], ll.[ExtLinks],\n" +
    "  al.[FirstName], al.[LastName], a.[Portrait], a.[PortraitMeta], a.[URL] as [AURL]\n" +
    "from[LessonCourse] lc\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[CourseLng] cl on c.[Id] = cl.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join[Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join[AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "<%= cond %>";

const LESSON_MSSQL_CHILDS_REQ =
    "select l.[Id], ll.[Name], ll.[ShortDescription], lc.[State], lc.[ReadyDate],\n" +
    "  l.[Cover], l.[CoverMeta], ll.[Duration], ll.[DurationFmt], l.[IsAuthRequired], l.[IsSubsRequired],\n" +
    "  l.[FreeExpDate], l.[URL], l.[AuthorId], lc.[Number],\n" +
    "  ell.[VideoLink], e.[ContentType],\n" +
    "  ell.[Audio], l.[IsFreeInPaidCourse]\n" +
    "from[LessonCourse] lc\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  left join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  left join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "where (lc.[ParentId] = <%= id %>) and (lc.[State] = 'R')\n" +
    "order by lc.[Number], l.[Id], el.[Number]";

const LESSON_SHARE_COUNTERS_MSSQL_REQ =
    "select sp.[Code], cs.[Counter] from [LsnShareCounter] cs\n" +
    "  join[SNetProvider] sp on sp.[Id] = cs.[SNetProviderId]\n" +
    "where[LessonId] = <%= id %>";

const LESSON_IMG_META_MSSQL_REQ =
    "select i.[Type], r.[FileName], r.[MetaData] from [LessonMetaImage] i\n" +
    "  join[Resource] r on r.[Id] = i.[ResourceId]\n" +
    "where r.[LessonId] = <%= id %>";

const PARENT_MSSQL_REQ =
    "select lp.[URL], lcp.[Number], l.[Id], lp.[Id] as[ParentId],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], pc.[Counter], l.[IsFreeInPaidCourse],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId,\n" +
    "  c.[Id] as[CId], c.[URL] as[CURL], cl.[LanguageId], cl.[Name] as[CName], llp.[Name]\n" +
    "from[LessonCourse] lc\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  left join[LessonCourse] lcp on lcp.[Id] = lc.[ParentId]\n" +
    "  left join[Lesson] lp on lp.[Id] = lcp.[LessonId]\n" +
    "  left join[LessonLng] llp on lp.[Id] = llp.[LessonId]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
    "where c.[URL] = '<%= course_url %>' and l.[URL] = '<%= lesson_url %>'";

const PARENT_MSSQL_REQ_COND =
    "select lp.[URL], lcp.[Number], l.[Id], lp.[Id] as[ParentId],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], pc.[Counter],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId,\n" +
    "  c.[Id] as[CId], c.[URL] as[CURL], c.[OneLesson], cl.[LanguageId], cl.[Name] as[CName], llp.[Name]\n" +
    "from[LessonCourse] lc\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  left join[LessonCourse] lcp on lcp.[Id] = lc.[ParentId]\n" +
    "  left join[Lesson] lp on lp.[Id] = lcp.[LessonId]\n" +
    "  left join[LessonLng] llp on lp.[Id] = llp.[LessonId]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
    "<%= cond %>";
const PARENT_MSSQL_COND_ID =
    "where l.[Id] = <%= id %>";
const PARENT_MSSQL_COND_URL =
    "where c.[URL] = '<%= course_url %>' and l.[URL] = '<%= lesson_url %>'";

const LESSON_MSSQL_TRANSCRIPT_REQ =
    "select pl.[Number], e.[Id], l.[Name], l.[Transcript], l.[Audio],\n" +
    "  l.[VideoLink], e.[ContentType]\n" +
    "from[EpisodeLesson] pl\n" +
    "  join[Episode] e on e.[Id] = pl.[EpisodeId]\n" +
    "  join[EpisodeLng] l on l.[EpisodeId] = e.[Id]\n" +
    "where pl.[LessonId] = <%= id %>\n" +
    "order by pl.[Number], e.[Id]";

const LESSON_MYSQL_EPISODE_REQ =
    "select e.`Id`, epl.`Name`, el.`Number`, epl.`State`, el.`Supp` from `EpisodeLesson` el\n" +
    "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join `EpisodeLng` epl on e.`Id` = epl.`EpisodeId`\n" +
    "where el.`LessonId` = <%= id %>";

const LESSON_MYSQL_REFERENCE_REQ =
    "select r.`Id`, r.`Description`, r.`Number`, r.`URL`, r.`Recommended` from `Reference` r\n" +
    "  join `LessonLng` l on l.`Id` = r.`LessonLngId`\n" +
    "where l.`LessonId` = <%= id %>";

const LESSON_MYSQL_BOOK_REQ =
    "select b.`Order`, b.`Id`, b.`Name`, b.`Description`, b.`CourseId`, b.`OtherAuthors`, b.`OtherCAuthors`,\n" +
    "  b.`Cover`, b.`CoverMeta`, b.`ExtLinks`, ba.`AuthorId`, ba.`Tp`, ba.`TpView`,\n" +
    "  a.`URL`, al.`FirstName`, al.`LastName`\n" +
    "from`Book` b\n" +
    "  left join`BookAuthor` ba on ba.`BookId` = b.`Id`\n" +
    "  left join`Author` a on a.`Id` = ba.`AuthorId`\n" +
    "  left join`AuthorLng` al on al.`AuthorId` = ba.`AuthorId`\n" +
    "where b.`Id` in\n" +
    "(\n" +
    "  select distinct b.`Id` from`Book` b\n" +
    "    join`BookAuthor` ba on ba.`BookId` = b.`Id`\n" +
    "    join`Author` a on a.`Id` = ba.`AuthorId`\n" +
    "    join`AuthorLng` al on al.`AuthorId` = ba.`AuthorId`\n" +
    "  where(ba.`AuthorId` = <%= authorId %>) and(ba.`TpView` = 2) and((b.`CourseId` is NULL) or(b.`CourseId` = <%= courseId %>))\n" +
    ")\n" +
    "order by 1";

const LESSON_MYSQL_RESOURCE_REQ =
    "select r.`Id`, r.`ResType`, r.`FileName`, r.`ResLanguageId`, r.`ShowInGalery`, ll.`Language`, l.`Name`, l.`Description`, l.`AltAttribute`, r.`MetaData` from `Resource` r\n" +
    "  join`ResourceLng` l on l.`ResourceId` = r.`Id`\n" +
    "  left join `Language` ll on ll.`Id` = r.`ResLanguageId`\n" +
    "where r.`LessonId` = <%= id %>";

const LESSON_MYSQL_IMG_REQ =
    "select i.`Id`, i.`Type`, i.`ResourceId` from `LessonMetaImage` i\n" +
    "  join `LessonLng` l on l.`Id` = i.`LessonLngId`\n" +
    "where l.`LessonId` = <%= id %>";

const LESSON_MYSQL_TOC_REQ =
    "select lls.`Name`, e.`Id` Episode, t.`Id`, t.`Number`, l.`Topic`, l.`StartTime` from`EpisodeToc` t\n" +
    "  join`EpisodeTocLng` l on l.`EpisodeTocId` = t.`Id`\n" +
    "  join`Episode` e on e.`Id` = t.`EpisodeId`\n" +
    "  join`EpisodeLesson` pl on pl.`EpisodeId` = e.`Id`\n" +
    "  join`Lesson` ls on ls.`Id` = pl.`LessonId`\n" +
    "  join`LessonLng` lls on lls.`LessonId` = ls.`Id`\n" +
    "where pl.`LessonId` = <%= id %>\n" +
    "order by e.`Id`, t.`Number`";

const LESSON_EPI_MYSQL_TOC_REQ =
    "select lls.`Name`, e.`Id` Episode, t.`Id`, t.`Number`, l.`Topic`, l.`StartTime` from`EpisodeToc` t\n" +
    "  join`EpisodeTocLng` l on l.`EpisodeTocId` = t.`Id`\n" +
    "  join`Episode` e on e.`Id` = t.`EpisodeId`\n" +
    "  join`EpisodeLesson` pl on pl.`EpisodeId` = e.`Id`\n" +
    "  join`Lesson` ls on ls.`Id` = pl.`LessonId`\n" +
    "  join`LessonLng` lls on lls.`LessonId` = ls.`Id`\n" +
    "where pl.`LessonId` = <%= id %> and e.`Id` = <%= episodeId %>\n" +
    "order by e.`Id`, t.`Number`";

const LESSON_MYSQL_CONTENT_REQ =
    "select e.`Id` Episode, t.`Id`, l.`Name`, l.`Audio`, l.`AudioMeta`, r.`Id` as`AssetId`,\n" +
    "  l.`VideoLink`, l.`Duration`, e.`ContentType`,\n" +
    "  t.`StartTime`, t.`Content` from`EpisodeLesson` pl\n" +
    "  join`Episode` e on pl.`EpisodeId` = e.`Id`\n" +
    "  join`EpisodeLng` l on l.`EpisodeId` = e.`Id`\n" +
    "  left join`EpisodeContent` t on t.`EpisodeLngId` = l.`Id`\n" +
    "  left join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "where pl.`LessonId` = <%= id %>\n" +
    "order by pl.`Number`, e.`Id`, t.`StartTime`";

const LESSON_EPI_MYSQL_CONTENT_REQ =
    "select e.`Id` Episode, t.`Id`, l.`Name`, l.`Audio`, l.`AudioMeta`, r.`Id` as`AssetId`,\n" +
    "  l.`VideoLink`, l.`Duration`, e.`ContentType`,\n" +
    "  t.`StartTime`, t.`Content` from`EpisodeLesson` pl\n" +
    "  join`Episode` e on pl.`EpisodeId` = e.`Id`\n" +
    "  join`EpisodeLng` l on l.`EpisodeId` = e.`Id`\n" +
    "  left join`EpisodeContent` t on t.`EpisodeLngId` = l.`Id`\n" +
    "  left join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "where pl.`LessonId` = <%= id %> and e.`Id` = <%= episodeId %>\n" +
    "order by pl.`Number`, e.`Id`, t.`StartTime`";

const LESSON_MYSQL_ASSETS_REQ =
    "select r.`Id`, r.`ResType`, r.`FileName`, r.`ResLanguageId`, r.`ShowInGalery`, rl.`Name`, rl.`Description`, r.`MetaData` from `EpisodeContent` t\n" +
    "  join`EpisodeLng` l on l.`Id` = t.`EpisodeLngId`\n" +
    "  join`Episode` e on e.`Id` = l.`EpisodeId`\n" +
    "  join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "  join`ResourceLng` rl on rl.`ResourceId` = r.`Id`\n" +
    "  join `EpisodeLesson` pl on pl.`EpisodeId` = e.`Id`" +
    "where pl.`LessonId` = <%= id %>";

const LESSON_MYSQL_ASSETS_ALL_REQ =
    "select r.`Id`, r.`ResType`, r.`FileName`, r.`ResLanguageId`, r.`ShowInGalery`, rl.`Name`, rl.`Description`, r.`MetaData` from `Resource` r\n" +
    "  join`ResourceLng` rl on rl.`ResourceId` = r.`Id`\n" +
    "  join`Episode` e on e.`LessonId` = r.`LessonId`\n" +
    "where e.`Id` = <%= episodeId %>";

const LESSON_MYSQL_REQ =
    "select lc.`CourseId`, c.`URL` as`CURL`, cl.`LanguageId`, cl.`Name` as`CName`, l.`Id`, ll.`Name`, ll.`ShortDescription`, lc.`State`, lc.`ReadyDate`,\n" +
    "  l.`Cover`, l.`CoverMeta`, ll.`Duration`, ll.`DurationFmt`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL`, l.`AuthorId`, lc.`Number`,\n" +
    "  lch.`Id` as`IdCh`, llch.`Name` as`NameCh`, llch.`ShortDescription` as`ShortDescriptionCh`,\n" +
    "  lcch.`State` as`StateCh`, lcch.`ReadyDate` as`ReadyDateCh`, lch.`Cover` as`CoverCh`, lch.`CoverMeta` as`CoverMetaCh`,\n" +
    "  llch.`Duration` as`DurationCh`, lcch.`Number` as`NumberCh`,\n" +
    "  llch.`DurationFmt` as`DurationFmtCh`, lch.`IsAuthRequired` as`IsAuthRequiredCh`, lch.`IsSubsRequired` as`IsSubsRequiredCh`,\n" +
    "  lch.`FreeExpDate` as`FreeExpDateCh`, lch.`URL` as`URLCh`, lch.`AuthorId` as`AuthorIdCh`\n" +
    "from`LessonCourse` lc\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`CourseLng` cl on c.`Id` = cl.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join`LessonCourse` lcch on lcch.`ParentId` = lc.`Id`\n" +
    "  left join`Lesson` lch on lch.`Id` = lcch.`LessonId`\n" +
    "  left join`LessonLng` llch on llch.`LessonId` = lch.`Id`\n" +
    "where c.`URL` = '<%= course_url %>' and l.`URL` = '<%= lesson_url %>'\n" +
    "order by lcch.`Number`";

const LESSON_MYSQL_REQ_V2 =
    "select lc.`Id` as `ParentId`, lc.`CourseId`, c.`URL` as `CURL`, cl.`LanguageId`, cl.`Name` as `CName`, l.`Id`, ll.`Name`, ll.`ShortDescription`, lc.`State`, lc.`ReadyDate`,\n" +
    "  l.`Cover`, l.`CoverMeta`, ll.`Duration`, ll.`DurationFmt`, l.`IsFreeInPaidCourse`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL`, l.`AuthorId`, lc.`Number`,\n" +
    "  ll.`SnPost`, ll.`SnName`, ll.`SnDescription`, ll.`ExtLinks`,\n" +
    "  al.`FirstName`, al.`LastName`, a.`Portrait`, a.`PortraitMeta`, a.`URL` as `AURL`\n" +
    "from`LessonCourse` lc\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`CourseLng` cl on c.`Id` = cl.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join`Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join`AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "<%= cond %> ";

const LESSON_MYSQL_CHILDS_REQ =
    "select l.`Id`, ll.`Name`, ll.`ShortDescription`, lc.`State`, lc.`ReadyDate`,\n" +
    "  l.`Cover`, l.`CoverMeta`, ll.`Duration`, ll.`DurationFmt`, l.`IsAuthRequired`, l.`IsSubsRequired`,\n" +
    "  l.`FreeExpDate`, l.`URL`, l.`AuthorId`, lc.`Number`,\n" +
    "  ell.`VideoLink`, e.`ContentType`,\n" +
    "  ell.`Audio`, l.`IsFreeInPaidCourse`\n" +
    "from`LessonCourse` lc\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  left join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  left join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "where (lc.`ParentId` = <%= id %>) and (lc.`State` = 'R')\n" +
    "order by lc.`Number`, l.`Id`, el.`Number`";

const LESSON_SHARE_COUNTERS_MYSQL_REQ =
    "select sp.`Code`, cs.`Counter` from `LsnShareCounter` cs\n" +
    "  join`SNetProvider` sp on sp.`Id` = cs.`SNetProviderId`\n" +
    "where`LessonId` = <%= id %>";

const LESSON_IMG_META_MYSQL_REQ =
    "select i.`Type`, r.`FileName`, r.`MetaData` from `LessonMetaImage` i\n" +
    "  join`Resource` r on r.`Id` = i.`ResourceId`\n" +
    "where r.`LessonId` = <%= id %>";

const PARENT_MYSQL_REQ =
    "select lp.`URL`, lcp.`Number`, l.`Id`, lp.`Id` as`ParentId`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, pc.`Counter`, l.`IsFreeInPaidCourse`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId,\n" +
    "  c.`Id` as`CId`, c.`URL` as`CURL`, cl.`LanguageId`, cl.`Name` as`CName`, llp.`Name`\n" +
    "from`LessonCourse` lc\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  left join`LessonCourse` lcp on lcp.`Id` = lc.`ParentId`\n" +
    "  left join`Lesson` lp on lp.`Id` = lcp.`LessonId`\n" +
    "  left join`LessonLng` llp on lp.`Id` = llp.`LessonId`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
    "where c.`URL` = '<%= course_url %>' and l.`URL` = '<%= lesson_url %>'";

const PARENT_MYSQL_REQ_COND =
    "select lp.`URL`, lcp.`Number`, l.`Id`, lp.`Id` as`ParentId`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, pc.`Counter`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId,\n" +
    "  c.`Id` as`CId`, c.`URL` as`CURL`, c.`OneLesson`, cl.`LanguageId`, cl.`Name` as`CName`, llp.`Name`\n" +
    "from`LessonCourse` lc\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  left join`LessonCourse` lcp on lcp.`Id` = lc.`ParentId`\n" +
    "  left join`Lesson` lp on lp.`Id` = lcp.`LessonId`\n" +
    "  left join`LessonLng` llp on lp.`Id` = llp.`LessonId`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
    "<%= cond %>";
const PARENT_MYSQL_COND_ID =
    "where l.`Id` = <%= id %>";
const PARENT_MYSQL_COND_URL =
    "where c.`URL` = '<%= course_url %>' and l.`URL` = '<%= lesson_url %>'";

const LESSON_MYSQL_TRANSCRIPT_REQ =
    "select pl.`Number`, e.`Id`, l.`Name`, l.`Transcript`, l.`Audio`,\n" +
    "  l.`VideoLink`, e.`ContentType`\n" +
    "from`EpisodeLesson` pl\n" +
    "  join`Episode` e on e.`Id` = pl.`EpisodeId`\n" +
    "  join`EpisodeLng` l on l.`EpisodeId` = e.`Id`\n" +
    "where pl.`LessonId` = <%= id %>\n" +
    "order by pl.`Number`, e.`Id`";

const EPISODE_MSSQL_DELETE_SCRIPT =
    [
        "delete ec from [Episode] e\n" +
        "  join [EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
        "  join [EpisodeContent] ec on el.[Id] = ec.[EpisodeLngId]\n" +
        "where e.[Id] = <%= id %>",
        "delete from [Episode] where [Id] = <%= id %>"
    ];

const EPISODE_MYSQL_DELETE_SCRIPT =
    [
        "delete ec from `Episode` e\n" +
        "  join `EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
        "  join `EpisodeContent` ec on el.`Id` = ec.`EpisodeLngId`\n" +
        "where e.`Id` = <%= id %>",
        "delete from `Episode` where `Id` = <%= id %>"
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

const GET_LESSON_DURATION_MSSQL =
    "select coalesce(sum(coalesce(l.[Duration], 0)), 0) as dt from [EpisodeLesson] el\n" +
    "  join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join[EpisodeLng] l on l.[EpisodeId] = e.[Id]\n" +
    "where el.[LessonId] = <%= id %>";

const GET_LESSON_DURATION_MYSQL =
    "select coalesce(sum(coalesce(l.`Duration`, 0)), 0) as dt from `EpisodeLesson` el\n" +
    "  join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join`EpisodeLng` l on l.`EpisodeId` = e.`Id`\n" +
    "where el.`LessonId` = <%= id %>";

const LESSONS_ALL_MSSQL_REQ =
    "select lc.[Id] as[LcId], lc.[ParentId], l.[Id] as[LessonId],\n" +
    "  lc.[Number], lc.[ReadyDate], l.[IsFreeInPaidCourse],\n" +
    "  lc.[State], l.[Cover] as[LCover], l.[CoverMeta] as[LCoverMeta], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate], l.[URL] as[LURL],\n" +
    "  ell.[VideoLink], e.[ContentType],\n" +
    "  ll.[Name] as[LName], ll.[Duration], ll.[DurationFmt], l.[AuthorId], ell.Audio, el.[Number] Eln from [Course] c\n" +
    "  join [CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join [LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join [Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id] and ll.[LanguageId] = cl.[LanguageId]\n" +
    "  left join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  left join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  left join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "where c.[URL] = '<%= courseUrl %>'\n" +
    "order by lc.[ParentId], lc.[Number], el.[Number]";

const LESSONS_ALL_MYSQL_REQ =
    "select lc.`Id` as`LcId`, lc.`ParentId`, l.`Id` as`LessonId`,\n" +
    "  lc.`Number`, lc.`ReadyDate`, l.`IsFreeInPaidCourse`,\n" +
    "  lc.`State`, l.`Cover` as`LCover`, l.`CoverMeta` as`LCoverMeta`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`, l.`URL` as`LURL`,\n" +
    "  ell.`VideoLink`, e.`ContentType`,\n" +
    "  ll.`Name` as`LName`, ll.`Duration`, ll.`DurationFmt`, l.`AuthorId`, ell.Audio, el.`Number` Eln from `Course` c\n" +
    "  join `CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join `LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join `Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id` and ll.`LanguageId` = cl.`LanguageId`\n" +
    "  left join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  left join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  left join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "where c.`URL` = '<%= courseUrl %>'\n" +
    "order by lc.`ParentId`, lc.`Number`, el.`Number`";

const GET_COURSE_LANG_MSSQL =
    "select l.[LanguageId] from [Course] c\n" +
    "  join [CourseLng] l on l.[CourseId] = c.[Id]\n" +
    "where c.[Id] = <%= courseId %>";

const GET_COURSE_LANG_MYSQL =
    "select l.`LanguageId` from `Course` c\n" +
    "  join `CourseLng` l on l.`CourseId` = c.`Id`\n" +
    "where c.`Id` = <%= courseId %>";

const GET_LESSON_FOR_PRERENDER_MSSQL =
    "select c.[URL], l.[URL] as [LURL] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P' and l.[Id] = <%= id %>";

const GET_LESSON_FOR_PRERENDER_MYSQL =
    "select c.`URL`, l.`URL` as `LURL` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P' and l.`Id` = <%= id %>";

const GET_LESSON_URL_MSSQL =
    "select c.[URL], l.[URL] as [LURL] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where l.id = <%= id %>";

const GET_LESSON_URL_MYSQL =
    "select c.`URL`, l.`URL` as `LURL` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where l.id = <%= id %>";

const GET_LESSON_FOR_PRERENDER_BY_URL_MSSQL =
    "select c.[URL], l.[URL] as [LURL] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P' and l.[URL] = '<%= lesson_url %>' and c.[URL] = '<%= course_url %>'";

const GET_LESSON_FOR_PRERENDER_BY_URL_MYSQL =
    "select c.`URL`, l.`URL` as `LURL` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P' and l.`URL` = '<%= lesson_url %>' and c.`URL` = '<%= course_url %>'";

const CHECK_IF_CAN_DEL_EPI_MSSQL =
    "select e.[Id] from [Episode] e\n" +
    "  join[EpisodeLng] eln on e.[Id] = eln.[EpisodeId]\n" +
    "where (e.[Id] = <%= id %>) and (eln.[State] = 'R')";

const CHECK_IF_CAN_DEL_EPI_MYSQL =
    "select e.`Id` from `Episode` e\n" +
    "  join`EpisodeLng` eln on e.`Id` = eln.`EpisodeId`\n" +
    "where (e.`Id` = <%= id %>) and (eln.`State` = 'R')";

const { PrerenderCache } = require('../prerender/prerender-cache');

const DbLesson = class DbLesson extends DbObject {

    constructor(options) {
        super(options);
        this._prerenderCache = PrerenderCache();
        this._partnerLink = new PartnerLink();
    }

    _getObjById(id, expression, options) {
        var exp = expression || LESSON_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    clearCache(id, isListOnly, options) {
        let key = id;
        let opts = options || {};
        return new Promise((resolve) => {
            let rc = [key];
            if (typeof (key) === "number") {
                rc = $data.execSql({
                    dialect: {
                        mysql: _.template(GET_LESSON_URL_MYSQL)({ id: id }),
                        mssql: _.template(GET_LESSON_URL_MSSQL)({ id: id })
                    }
                }, opts)
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let res = [];
                            result.detail.forEach((elem) => {
                                res.push("/" + elem.URL + "/" + elem.LURL + "/");
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
                        mysql: _.template(GET_LESSON_FOR_PRERENDER_MYSQL)({ id: id }),
                        mssql: _.template(GET_LESSON_FOR_PRERENDER_MSSQL)({ id: id })
                    };
                    if (typeof (id) === "string") {
                        let lesson_url;
                        let course_url;
                        let urls = id.split("/");
                        let cnt = 0;
                        urls.forEach((elem) => {
                            if (elem.length > 0) {
                                cnt++;
                                if (course_url)
                                    lesson_url = elem
                                else
                                    course_url = elem;
                            }
                        })
                        if (cnt !== 2)
                            throw new Error(`DbLesson::prerender: Invalid "id" parameter: "${id}"`);
                        dialect = {
                            mysql: _.template(GET_LESSON_FOR_PRERENDER_BY_URL_MYSQL)({ lesson_url: lesson_url, course_url: course_url }),
                            mssql: _.template(GET_LESSON_FOR_PRERENDER_BY_URL_MSSQL)({ lesson_url: lesson_url, course_url: course_url })
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
                            let path = "/" + elem.URL + "/" + elem.LURL + "/";
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

    get(id, course_id) {
        let lesson = {};
        let isNotFound = true;
        let now = new Date();
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(LESSON_MYSQL_ID_REQ)({ id: id, courseId: course_id }),
                        mssql: _.template(LESSON_MSSQL_ID_REQ)({ id: id, courseId: course_id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            lesson = result.detail[0];
                            lesson.IsFreeInPaidCourse = lesson.IsFreeInPaidCourse ? true : false;
                            lesson.IsAuthRequired = lesson.IsAuthRequired ? true : false;
                            lesson.IsSubsRequired = lesson.IsSubsRequired ? true : false;
                            isNotFound = false;
                        }
                        if (!isNotFound)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_EPISODE_REQ)({ id: id }),
                                    mssql: _.template(LESSON_MSSQL_EPISODE_REQ)({ id: id })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let episodes = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach((elem) => {
                                    if (typeof (elem.Supp) === "number")
                                        elem.Supp = elem.Supp === 0 ? false : true;    
                                    episodes.push(elem);
                                })
                            }
                            lesson.Episodes = episodes;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_REFERENCE_REQ)({ id: id }),
                                    mssql: _.template(LESSON_MSSQL_REFERENCE_REQ)({ id: id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let references = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach((elem) => {
                                    if (typeof (elem.Recommended) === "number")
                                        elem.Recommended = elem.Recommended === 0 ? false : true;
                                    references.push(elem);
                                })
                            }
                            lesson.References = references;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_CHLD_REQ)({ id: id, courseId: course_id }),
                                    mssql: _.template(LESSON_MSSQL_CHLD_REQ)({ id: id, courseId: course_id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let childs = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach((elem) => {
                                    elem.IsAuthRequired = elem.IsAuthRequired ? true : false;
                                    elem.IsSubsRequired = elem.IsSubsRequired ? true : false;
                                });
                                childs = result.detail;
                            }
                            lesson.Childs = childs;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_RESOURCE_REQ)({ id: id }),
                                    mssql: _.template(LESSON_MSSQL_RESOURCE_REQ)({ id: id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let resources = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                resources = result.detail;
                                resources.forEach((elem) => {
                                    elem.ShowInGalery = elem.ShowInGalery ? true : false;
                                });
                            }
                            lesson.Resources = resources;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_IMG_REQ)({ id: id }),
                                    mssql: _.template(LESSON_MSSQL_IMG_REQ)({ id: id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let images = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                images = result.detail;
                            }
                            lesson.Images = images;
                        }
                        return lesson;
                    })
            );
        })
    }

    getResources(id) {
        let resources = [];
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(LESSON_MYSQL_RESOURCE_REQ)({ id: id }),
                        mssql: _.template(LESSON_MSSQL_RESOURCE_REQ)({ id: id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            resources = result.detail;
                            resources.forEach((elem) => {
                                elem.ShowInGalery = elem.ShowInGalery ? true : false;
                            });
                        }
                        return resources;
                    })
            );
        })
    }

    getLessonsAll(course_url, lesson_url, user) {
        let lc_list = {};
        let lessons = [];
        let currLesson = [];
        let course = {};
        let user_id = user ? user.Id : null;

        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(LESSONS_ALL_MYSQL_REQ)({ courseUrl: course_url }),
                        mssql: _.template(LESSONS_ALL_MSSQL_REQ)({ courseUrl: course_url })
                    }
                }, {})
                    .then(async (result) => {
                        course = await CoursesService().getPriceInfo(course_url, user);
                        let tests = await TestService().getTestsByCourse(course.Id, user_id);
                        course.Tests = tests.Course;
                        if (result && result.detail && (result.detail.length > 0)) {
                            let isFirst = true;
                            let authors_list = {};
                            let lesson_list = {};
                            let now = new Date();
                            result.detail.forEach((elem) => {
                                let lsn = lesson_list[elem.LessonId];
                                if (!lsn) {
                                    lesson_list[elem.LessonId] = lsn = {
                                        Id: elem.LessonId,
                                        LanguageId: elem.LanguageId,
                                        Number: elem.Number,
                                        ReadyDate: elem.ReadyDate,
                                        State: elem.State,
                                        ContentType: elem.ContentType,
                                        Cover: elem.LCover,
                                        CoverMeta: elem.LCoverMeta,
                                        URL: elem.LURL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        IsFreeInPaidCourse: elem.IsFreeInPaidCourse ? true : false,
                                        Name: elem.LName,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        AuthorId: elem.AuthorId,
                                        Lessons: [],
                                        Audios: [],
                                        Videos: [],
                                        Tests: []
                                    };
                                    if (lsn.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                        lsn.FreeExpDate = elem.FreeExpDate;
                                    authors_list[elem.AuthorId] = true;
                                    let isCurrent = lesson_url === elem.LURL;
                                    if (!elem.ParentId) {
                                        lc_list[elem.LcId] = { lesson: lsn, idx: lessons.length };
                                        if (isCurrent)
                                            currLesson = [lessons.length];
                                        lessons.push(lsn);
                                    }
                                    else {
                                        let parent = lc_list[elem.ParentId];
                                        if (parent) {
                                            if (isCurrent)
                                                currLesson = [parent.idx, parent.lesson.Lessons.length];
                                            if (lsn.State === "R") // Show ready childs only !!!
                                                parent.lesson.Lessons.push(lsn);
                                        }
                                    }
                                    if (tests.Lessons[lsn.Id])
                                        lsn.Tests = tests.Lessons[lsn.Id];
                                };
                                if (elem.Audio && (elem.ContentType === EpisodeContentType.AUDIO))
                                    lsn.Audios.push(elem.Audio);
                                if (elem.VideoLink && (elem.ContentType === EpisodeContentType.VIDEO))
                                    lsn.Videos.push(elem.VideoLink);
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
                                            authors: authors
                                        }),
                                    mssql: _.template(AUTHORS_BY_ID_MSSQL_PUBLIC_REQ)(
                                        {
                                            authors: authors
                                        })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        let authors = [];
                        if ((lessons.length > 0) && result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let author = {
                                    Id: elem.Id,
                                    FirstName: elem.FirstName,
                                    LastName: elem.LastName,
                                    Portrait: elem.Portrait,
                                    PortraitMeta: elem.PortraitMeta,
                                    URL: elem.URL
                                };
                                authors.push(author);
                            })
                        }
                        return { CurrLesson: currLesson, Course: course, Authors: authors, Lessons: lessons };
                    })
            );
        })
    }

    getLesson(course_url, lesson_url, user) {
        let data = { Authors: [] };
        let lesson = null;
        let course = null;
        let curLesson = null;
        let parentUrl = lesson_url;
        let now = new Date();
        let userId = user ? user.Id : 0;

        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(PARENT_MYSQL_REQ)({ course_url: course_url, lesson_url: lesson_url, user_id: userId }),
                        mssql: _.template(PARENT_MSSQL_REQ)({ course_url: course_url, lesson_url: lesson_url, user_id: userId })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length == 1))
                            if (result.detail[0].URL)
                                parentUrl = result.detail[0].URL;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_REQ)({ course_url: course_url, lesson_url: parentUrl }),
                                mssql: _.template(LESSON_MSSQL_REQ)({ course_url: course_url, lesson_url: parentUrl })
                            }
                        }, {})
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let authors_list = {};
                            let isFirst = true;
                            result.detail.forEach((elem) => {
                                if (isFirst) {
                                    course = {
                                        Id: elem.CourseId,
                                        LanguageId: elem.LanguageId,
                                        Name: elem.CName,
                                        URL: elem.CURL
                                    };
                                    lesson = {
                                        Id: elem.Id,
                                        Name: elem.Name,
                                        Cover: elem.Cover,
                                        CoverMeta: elem.CoverMeta,
                                        State: elem.State,
                                        ReadyDate: elem.ReadyDate,
                                        Duration: elem.Duration,
                                        DurationFmt: elem.DurationFmt,
                                        URL: elem.URL,
                                        IsAuthRequired: elem.IsAuthRequired ? true : false,
                                        IsSubsRequired: elem.IsSubsRequired ? true : false,
                                        AuthorId: elem.AuthorId,
                                        Number: elem.Number,
                                        ShortDescription: elem.ShortDescription,
                                        Lessons: []
                                    };
                                    if (lesson.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                        lesson.FreeExpDate = elem.FreeExpDate;
                                    isFirst = false;
                                    authors_list[elem.AuthorId] = true;
                                }
                                if (elem.IdCh) {
                                    if (elem.URLCh === lesson_url)
                                        curLesson = lesson.Lessons.length;
                                    let lsn;
                                    lesson.Lessons.push(lsn = {
                                        Id: elem.IdCh,
                                        Name: elem.NameCh,
                                        Cover: elem.CoverCh,
                                        CoverMeta: elem.CoverMetaCh,
                                        State: elem.StateCh,
                                        ReadyDate: elem.ReadyDateCh,
                                        Duration: elem.DurationCh,
                                        DurationFmt: elem.DurationFmtCh,
                                        URL: elem.URLCh,
                                        IsAuthRequired: elem.IsAuthRequiredCh ? true : false,
                                        IsSubsRequired: elem.IsSubsRequiredCh ? true : false,
                                        AuthorId: elem.AuthorIdCh,
                                        Number: elem.NumberCh,
                                        ShortDescription: elem.ShortDescriptionCh
                                    });
                                    if (lsn.IsSubsRequired && elem.FreeExpDateCh && ((elem.FreeExpDateCh - now) > Intervals.MIN_FREE_LESSON))
                                        lsn.FreeExpDate = elem.FreeExpDateCh;
                                    authors_list[elem.AuthorIdCh] = true;
                                }
                            });
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
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let author = {
                                    Id: elem.Id,
                                    FirstName: elem.FirstName,
                                    LastName: elem.LastName,
                                    Portrait: elem.Portrait,
                                    PortraitMeta: elem.PortraitMeta,
                                    URL: elem.URL
                                };
                                data.Authors.push(author);
                            })
                        }
                        data.Course = course;
                        data.Lesson = lesson;
                        if (typeof (curLesson) === "number")
                            data.SubLessonIdx = curLesson;
                        return data;
                    })
            );
        })
    }

    getLessonText(course_url, lesson_url, user) {
        let data = { Galery: [], Episodes: [], Refs: [], Books: [], Audios: [], Videos: [] };
        let epi_list = {};
        let assets_list = {};
        let parentUrl = lesson_url;
        let userId = user ? user.Id : 0;
        let id;
        let showTranscript = AccessRights.checkPermissions(user,
            AccessFlags.Administrator + AccessFlags.ContentManager) !== 0 ? true : false;
        let IsFreeInPaidCourse;
        let pendingCourses = {};
        let now = new Date();
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest);

        return new Promise((resolve, reject) => {
            resolve(

                $data.execSql({
                    dialect: {
                        mysql: _.template(PARENT_MYSQL_REQ)({ course_url: course_url, lesson_url: lesson_url, user_id: userId }),
                        mssql: _.template(PARENT_MSSQL_REQ)({ course_url: course_url, lesson_url: lesson_url, user_id: userId })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length == 1)) {
                            if (userId) {
                                let paymentService = this.getService("payments", true);
                                if (paymentService)
                                    pendingCourses = await paymentService.getPendingObjects(userId);
                            }
                            let elem = result.detail[0];
                            if (elem.URL)
                                parentUrl = elem.URL;
                            id = elem.Id;
                            IsFreeInPaidCourse = elem.IsFreeInPaidCourse;
                            data.Course = {
                                Id: elem.CId,
                                LanguageId: elem.LanguageId,
                                Name: elem.CName,
                                IsPaid: show_paid && elem.IsPaid && ((elem.PaidTp === 2)
                                    || ((elem.PaidTp === 1) && ((!elem.PaidDate) || ((now - elem.PaidDate) > 0)))) ? true : false,
                                PaidTp: elem.PaidTp,
                                PaidDate: elem.PaidDate,
                                IsGift: (elem.PaidTp === 2) && user && user.RegDate
                                    && elem.PaidRegDate && ((elem.PaidRegDate - user.RegDate) > 0) ? true : false,
                                IsSubsFree: elem.IsSubsFree ? true : false,
                                ProductId: elem.ProductId,
                                IsBought: (elem.Counter || elem.GiftId) ? true : false,
                                IsPending: pendingCourses[elem.CId] ? true : false,
                                URL: elem.CURL
                            };
                            await CoursesService().getCoursePrice(data.Course);
                            showTranscript = showTranscript || (!data.Course.IsPaid)
                                || (data.Course.IsPaid && (data.Course.IsBought || data.Course.IsGift));
                        }
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, "Can't find lesson '" + course_url + "':'" + lesson_url + "'.");

                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_ASSETS_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_ASSETS_REQ)({ id: id })
                            }
                        }, {})
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (!assets_list[elem.Id]) {
                                    let asset = {
                                        Id: elem.Id,
                                        FileName: elem.FileName,
                                        MetaData: elem.MetaData
                                    };
                                    if (elem.Name)
                                        asset.Name = elem.Name;
                                    if (elem.Description)
                                        asset.Description = elem.Description;
                                    assets_list[elem.Id] = asset;
                                    if (elem.ShowInGalery)
                                        data.Galery.push(asset);
                                }
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_TRANSCRIPT_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_TRANSCRIPT_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let isFirst = true;
                            result.detail.forEach((elem) => {
                                let curr_episode = {
                                    Id: elem.Id,
                                    ContentType: elem.ContentType,
                                    Number: elem.Number,
                                    Name: elem.Name,
                                    Transcript: elem.Transcript,
                                    Toc: []
                                };
                                data.Episodes.push(curr_episode);
                                if (elem.Audio && (elem.ContentType === EpisodeContentType.AUDIO))
                                    data.Audios.push(elem.Audio);
                                if (elem.VideoLink && (elem.ContentType === EpisodeContentType.VIDEO))
                                    data.Videos.push(elem.VideoLink);
                                if (isFirst)
                                    data.ContentType = elem.ContentType;
                                epi_list[elem.Id] = curr_episode;
                                if (!(showTranscript || IsFreeInPaidCourse)) {
                                    if (isFirst)
                                        curr_episode.Transcript = truncateHtml(curr_episode.Transcript)
                                    else
                                        curr_episode.Transcript = "";
                                    isFirst = false;
                                }
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_TOC_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_TOC_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let curr_id = -1;
                        let curr_episode = null;;
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (curr_id !== elem.Episode) {
                                    curr_episode = epi_list[elem.Episode];
                                    if (!curr_episode)
                                        throw new Error("Unknown episode (Id=" + elem.Episode + ") in lesson (Id=" + id + ").");
                                }
                                curr_episode.Toc.push({
                                    Id: elem.Id,
                                    Topic: elem.Topic,
                                    StartTime: elem.StartTime
                                });
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_REFERENCE_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_REFERENCE_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let item = { Number: elem.Number, Description: elem.Description, URL: elem.URL };
                                if (elem.Recommended)
                                    data.Books.push(item)
                                else
                                    data.Refs.push(item);
                            });
                        }
                        return data;
                    })
            );
        })
    }

    getLessonV2(course_url, lesson_url, user, options) {
        let data = { Galery: [], Episodes: [], Refs: [], RefBooks: [], Books: [], Audios: [], Videos: [], Childs: [], ShareCounters: {}, PageMeta: {} };
        let epi_list = {};
        let assets_list = {};
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;
        let hostUrl;
        let courseUrl;
        let condMSSQL;
        let condMYSQL;
        let isInt = false;
        let courseId;
        let authorId;
        let userId = user ? user.Id : 0;
        let showTranscript = AccessRights.checkPermissions(user,
            AccessFlags.Administrator + AccessFlags.ContentManager) !== 0 ? true : false;
        let pendingCourses = {};
        let now = new Date();
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest);

        return new Promise((resolve, reject) => {
            hostUrl = config.proxyServer.siteHost + "/";
            let id = course_url;
            if (lesson_url === null) {
                isInt = (typeof (id) === "number");
                if (isInt && isNaN(id))
                    throw new Error(`Invalid argument "course_url": ${url}.`);
                if (!isInt)
                    if (typeof (id) === "string") {
                        let res = id.match(/[0-9]*/);
                        if (res && (id.length > 0) && (res[0].length === id.length)) {
                            id = parseInt(id);
                            isInt = true;
                        }
                    }
                    else
                        throw new Error(`Invalid argument "course_url": ${url}.`);
            }

            condMSSQL = isInt ? _.template(PARENT_MSSQL_COND_ID)({ id: id })
                : _.template(PARENT_MSSQL_COND_URL)({ course_url: course_url, lesson_url: lesson_url })
            condMYSQL = isInt ? _.template(PARENT_MYSQL_COND_ID)({ id: id })
                : _.template(PARENT_MYSQL_COND_URL)({ course_url: course_url, lesson_url: lesson_url })
            
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(PARENT_MYSQL_REQ_COND)({ cond: condMYSQL, user_id: userId }),
                        mssql: _.template(PARENT_MSSQL_REQ_COND)({ cond: condMSSQL, user_id: userId })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length == 1)) {
                            if (userId) {
                                let paymentService = this.getService("payments", true);
                                if (paymentService)
                                    pendingCourses = await paymentService.getPendingObjects(userId);
                            }
                            let elem = result.detail[0];
                            courseUrl = hostUrl + elem.CURL + "/";
                            if (elem.URL) {
                                data.Parent = {
                                    Id: elem.ParentId,
                                    URL: isAbsPath ? courseUrl + elem.URL : elem.URL,
                                    Name: elem.Name,
                                    Number: elem.Number
                                }
                            }
                            id = elem.Id;
                            data.Course = {
                                Id: elem.CId,
                                LanguageId: elem.LanguageId,
                                Name: elem.CName,
                                URL: isAbsPath ? this._absCourseUrl + elem.CURL : elem.CURL,
                                IsPaid: show_paid && elem.IsPaid && ((elem.PaidTp === 2)
                                    || ((elem.PaidTp === 1) && ((!elem.PaidDate) || ((now - elem.PaidDate) > 0)))) ? true : false,
                                PaidTp: elem.PaidTp,
                                PaidDate: elem.PaidDate,
                                IsGift: (elem.PaidTp === 2) && user && user.RegDate
                                    && elem.PaidRegDate && ((elem.PaidRegDate - user.RegDate) > 0) ? true : false,
                                IsSubsFree: elem.IsSubsFree ? true : false,
                                ProductId: elem.ProductId,
                                IsBought: (elem.Counter || elem.GiftId) ? true : false,
                                IsPending: pendingCourses[elem.CId] ? true : false,
                                OneLesson: elem.OneLesson ? true : false,
                                Categories: []
                            };
                            await CoursesService().getCoursePrice(data.Course);
                            showTranscript = showTranscript || (!data.Course.IsPaid)
                                || (data.Course.IsPaid && (data.Course.IsBought || data.Course.IsGift));
                        }
                        else
                            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find lesson "${course_url}"${isInt ? "" : " : \"" + lesson_url + "\""}.`);

                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_REQ_V2)({ cond: condMYSQL }),
                                mssql: _.template(LESSON_MSSQL_REQ_V2)({ cond: condMSSQL })
                            }
                        }, {})
                    })
                    .then((result) => {
                        let parentId;
                        if (result && result.detail && (result.detail.length > 0)) {
                            let elem = result.detail[0];
                            parentId = elem.ParentId;
                            data.Id= elem.Id;
                            data.Name = elem.Name;
                            data.Cover = this._convertDataUrl(elem.Cover, isAbsPath, dLink);
                            data.CoverMeta = this._convertMeta(elem.CoverMeta, isAbsPath, dLink);
                            data.State = elem.State;
                            data.ReadyDate = elem.ReadyDate;
                            data.Duration = elem.Duration;
                            data.DurationFmt = elem.DurationFmt;
                            data.URL = isAbsPath ? courseUrl + elem.URL : elem.URL;
                            data.IsFreeInPaidCourse = elem.IsFreeInPaidCourse ? true : false;
                            data.IsAuthRequired = elem.IsAuthRequired ? true : false;
                            data.IsSubsRequired = elem.IsSubsRequired ? true : false;
                            if (elem.SnName)
                                data.PageMeta.Name = elem.SnName;
                            if (elem.SnDescription)
                                data.PageMeta.Description = elem.SnDescription;
                            if (elem.SnPost)
                                data.PageMeta.Post = elem.SnPost;
                            data.Author = {
                                Id: elem.AuthorId,
                                FirstName: elem.FirstName,
                                LastName: elem.LastName,
                                Portrait: this._convertDataUrl(elem.Portrait, isAbsPath, dLink),
                                PortraitMeta: this._convertMeta(elem.PortraitMeta, isAbsPath, dLink),
                                URL: isAbsPath ? this._absAuthorUrl + elem.AURL : elem.AURL,
                            };
                            data.Number = elem.Number;
                            data.ShortDescription = elem.ShortDescription;
                            data.ExtLinks = elem.ExtLinks;
                            if (data.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                data.FreeExpDate = elem.FreeExpDate;
                        }
                        if (!data.Parent)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_CHILDS_REQ)({ id: parentId }),
                                    mssql: _.template(LESSON_MSSQL_CHILDS_REQ)({ id: parentId })
                                }
                            }, {});
                    })
                    .then((result)=>{
                        if (result && result.detail && (result.detail.length > 0)) {
                            let childs = {};
                            result.detail.forEach((elem) => {
                                let child = childs[elem.Id];
                                if (!child) {
                                    child = childs[elem.Id] = {};
                                    child.Id = elem.Id;
                                    child.Name = elem.Name;
                                    child.Cover = this._convertDataUrl(elem.Cover, isAbsPath, dLink);
                                    child.CoverMeta = this._convertMeta(elem.CoverMeta, isAbsPath, dLink);
                                    child.State = elem.State;
                                    child.ContentType = elem.ContentType;
                                    child.ReadyDate = elem.ReadyDate;
                                    child.Duration = elem.Duration;
                                    child.DurationFmt = elem.DurationFmt;
                                    child.URL = isAbsPath ? courseUrl + elem.URL : elem.URL;
                                    child.IsAuthRequired = elem.IsAuthRequired ? true : false;
                                    child.IsSubsRequired = elem.IsSubsRequired ? true : false;
                                    child.IsFreeInPaidCourse = elem.IsFreeInPaidCourse ? true : false;
                                    child.Number = elem.Number;
                                    child.ShortDescription = elem.ShortDescription;
                                    if (child.IsSubsRequired && elem.FreeExpDate && ((elem.FreeExpDate - now) > Intervals.MIN_FREE_LESSON))
                                        child.FreeExpDate = elem.FreeExpDate;
                                    child.Audios = [];
                                    child.Videos = [];
                                    data.Childs.push(child);
                                }
                                if (elem.Audio && (elem.ContentType === EpisodeContentType.AUDIO))
                                    child.Audios.push(this._convertDataUrl(elem.Audio, isAbsPath, dLink));
                                if (elem.VideoLink && (elem.ContentType === EpisodeContentType.VIDEO))
                                    child.Videos.push(elem.VideoLink);
                            })
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_SHARE_COUNTERS_MYSQL_REQ)({ id: id }),
                                mssql: _.template(LESSON_SHARE_COUNTERS_MSSQL_REQ)({ id: id })
                            }
                        }, {})
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                data.ShareCounters[elem.Code] = elem.Counter;
                            })
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_IMG_META_MYSQL_REQ)({ id: id }),
                                mssql: _.template(LESSON_IMG_META_MSSQL_REQ)({ id: id })
                            }
                        }, {})
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            data.PageMeta.Images = {};
                            result.detail.forEach((elem) => {
                                data.PageMeta.Images[elem.Type] = {
                                    FileName: this._convertDataUrl(elem.FileName, isAbsPath, dLink),
                                    MetaData: this._convertMeta(elem.MetaData, isAbsPath, dLink)
                                };
                            })
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_ASSETS_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_ASSETS_REQ)({ id: id })
                            }
                        }, {})
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (!assets_list[elem.Id]) {
                                    let asset = {
                                        Id: elem.Id,
                                        FileName: this._convertDataUrl(elem.FileName, isAbsPath, dLink),
                                        MetaData: this._convertMeta(elem.MetaData, isAbsPath, dLink)
                                    };
                                    if (elem.Name)
                                        asset.Name = elem.Name;
                                    if (elem.Description)
                                        asset.Description = elem.Description;
                                    assets_list[elem.Id] = asset;
                                    if (elem.ShowInGalery)
                                        data.Galery.push(asset);
                                }
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_TRANSCRIPT_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_TRANSCRIPT_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let isFirst = true;
                            result.detail.forEach((elem) => {
                                let curr_episode = {
                                    Id: elem.Id,
                                    ContentType: elem.ContentType,
                                    Number: elem.Number,
                                    Name: elem.Name,
                                    Transcript: elem.Transcript,
                                    Toc: []
                                };
                                if (!(showTranscript || data.IsFreeInPaidCourse)) {
                                    if (isFirst)
                                        curr_episode.Transcript = truncateHtml(curr_episode.Transcript)
                                    else
                                        curr_episode.Transcript = "";
                                }
                                if (isFirst)
                                    data.ContentType = elem.ContentType;
                                data.Episodes.push(curr_episode);
                                if (elem.ContentType === EpisodeContentType.AUDIO)
                                    data.Audios.push(this._convertDataUrl(elem.Audio, isAbsPath, dLink));
                                if (elem.ContentType === EpisodeContentType.VIDEO)
                                    data.Videos.push(elem.VideoLink);
                                epi_list[elem.Id] = curr_episode;
                                isFirst = false;
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_TOC_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_TOC_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let curr_id = -1;
                        let curr_episode = null;;
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (curr_id !== elem.Episode) {
                                    curr_episode = epi_list[elem.Episode];
                                    if (!curr_episode)
                                        throw new Error("Unknown episode (Id=" + elem.Episode + ") in lesson (Id=" + id + ").");
                                }
                                curr_episode.Toc.push({
                                    Id: elem.Id,
                                    Topic: elem.Topic,
                                    StartTime: elem.StartTime
                                });
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_REFERENCE_REQ)({ id: id }),
                                mssql: _.template(LESSON_MSSQL_REFERENCE_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                let item = { Number: elem.Number, Description: elem.Description, URL: elem.URL };
                                if (elem.Recommended)
                                    data.RefBooks.push(item)
                                else
                                    data.Refs.push(item);
                            });
                        }
                        courseId = data.Course.Id;
                        authorId = data.Author.Id;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_BOOK_REQ)({ courseId: courseId, authorId: authorId }),
                                mssql: _.template(LESSON_MSSQL_BOOK_REQ)({ courseId: courseId, authorId: authorId })
                            }
                        }, {});
                    })
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
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
                            Array.prototype.push.apply(data.Books, couseBooks);
                            Array.prototype.push.apply(data.Books, otherBooks);
                        }
                        if (data.Course) {
                            let ctgService = this.getService("categories", true);
                            if (ctgService) {
                                let cats = await ctgService.getCourseCategories([data.Course.Id], isAbsPath);
                                for (let cat in cats.Categories)
                                    data.Course.Categories.push(cats.Categories[cat]);
                            }
                        }
                        return data;
                    })
            );
        })
    }

    getPlayerData(id, episodeId, options) {
        let data = { id: id, assets: [], episodes: [] };
        let epi_list = {};
        let assets_list = {};
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;

        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: episodeId ? _.template(LESSON_MYSQL_ASSETS_ALL_REQ)({ episodeId: episodeId }) :
                            _.template(LESSON_MYSQL_ASSETS_REQ)({ id: id }),
                        mssql: episodeId ? _.template(LESSON_MSSQL_ASSETS_ALL_REQ)({ episodeId: episodeId }) :
                            _.template(LESSON_MSSQL_ASSETS_REQ)({ id: id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (!assets_list[elem.Id]) {
                                    let asset = {
                                        id: elem.Id,
                                        file: this._convertDataUrl(elem.FileName, isAbsPath, dLink),
                                        info: (isAbsPath || dLink) ? this._convertMeta(elem.MetaData, isAbsPath, dLink) : JSON.parse(elem.MetaData)
                                    };
                                    if (elem.Name)
                                        asset.title = elem.Name;
                                    if (elem.Description)
                                        asset.title2 = elem.Description;
                                    assets_list[elem.Id] = asset;
                                    data.assets.push(asset);
                                }
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: episodeId ? _.template(LESSON_EPI_MYSQL_CONTENT_REQ)({ id: id, episodeId: episodeId }) :
                                    _.template(LESSON_MYSQL_CONTENT_REQ)({ id: id }),
                                mssql: episodeId ? _.template(LESSON_EPI_MSSQL_CONTENT_REQ)({ id: id, episodeId: episodeId }) :
                                    _.template(LESSON_MSSQL_CONTENT_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let curr_id = -1;
                            let curr_episode = null;
                            
                            result.detail.forEach((elem) => {
                                let assetId = elem.AssetId;
                                if (curr_id !== elem.Episode) {
                                    curr_episode = {
                                        id: elem.Episode,
                                        contentType: elem.ContentType,
                                        title: elem.Name,
                                        elements: [],
                                        audio: elem.Audio ? {
                                            file: this._convertDataUrl(elem.Audio, isAbsPath, dLink),
                                            info: JSON.parse(elem.AudioMeta)
                                        } : null,
                                        video: elem.VideoLink ? { videoLink: elem.VideoLink, duration: elem.Duration } : null,
                                        contents: []
                                    };
                                    data.episodes.push(curr_episode);
                                    epi_list[elem.Episode] = curr_episode;
                                    curr_id = elem.Episode;
                                }
                                if (elem.Id) {
                                    let curr_elem = {
                                        id: elem.Id,
                                        assetId: assetId,
                                        start: elem.StartTime / 1000.,
                                        content: JSON.parse(elem.Content),
                                    };
                                    curr_episode.elements.push(curr_elem);
                                    if (!assets_list[assetId])
                                        throw new Error("Unknown asset (Id=" + assetId + ") in episode (Id=" + elem.Episode + ").");
                                }
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: episodeId ? _.template(LESSON_EPI_MYSQL_TOC_REQ)({ id: id, episodeId: episodeId }) :
                                    _.template(LESSON_MYSQL_TOC_REQ)({ id: id }),
                                mssql: episodeId ? _.template(LESSON_EPI_MSSQL_TOC_REQ)({ id: id, episodeId: episodeId }) :
                                    _.template(LESSON_MSSQL_TOC_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let curr_id = -1;
                        let curr_episode = null;;
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                data.title = elem.Name;
                                if (curr_id !== elem.Episode)
                                    curr_episode = epi_list[elem.Episode];
                                if (curr_episode)
                                    curr_episode.contents.push({
                                        id: elem.Id,
                                        title: elem.Topic,
                                        begin: elem.StartTime / 1000.
                                    });
                            });
                        }
                        return data;
                    })
            );
        })
    }

    _updateLessonDuration(lesson_id, options) {
        return new Promise((resolve) => {
            let res;
            let root_obj;
            let lesson_lng_obj
            let duration = 0;
            res = this._getObjById(lesson_id,
                {
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
                }, options)
                .then((result) => {
                    root_obj = result;
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new Error("Lesson (Id = " + lesson_id + ") doesn't exist.");
                    collection = collection.get(0).getDataRoot("LessonLng").getCol("DataElements");
                    if (collection.count() != 1)
                        throw new Error("Lesson (Id = " + lesson_id + ") has inconsistent \"LNG\" part.");
                    lesson_lng_obj = collection.get(0);
                    return root_obj.edit();
                })
                .then(() => {
                    return $data.execSql({
                        dialect: {
                            mysql: _.template(GET_LESSON_DURATION_MYSQL)({ id: lesson_id }),
                            mssql: _.template(GET_LESSON_DURATION_MSSQL)({ id: lesson_id })
                        }
                    }, options);
                })
                .then((result) => {
                    if (result && result.detail && (result.detail.length === 1)) {
                        if (typeof (result.detail[0].dt) === "number")
                            duration = result.detail[0].dt;
                    }
                    lesson_lng_obj.duration(duration);
                    lesson_lng_obj.durationFmt(DbUtils.fmtDuration(duration));
                    return root_obj.save(options);
                })
                .finally((isErr, res) => {
                    if (root_obj)
                        this._db._deleteRoot(root_obj.getRoot());
                    if (isErr) {
                        throw res;
                    }
                    return res;
                });
            resolve(res);
        });
    }

    del(id, course_id, parent_id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let lesson_obj = null;
            let course_obj = null;
            let ls_course_collection = null;
            let ls_course_obj = null;
            let lesson_number;

            let transactionId = null;
            let hasParent = (typeof (parent_id) === "number") && (!isNaN(parent_id));
            let curr_parent_id;
            let lc_parent_id;
            let course_url;
            let lesson_url;
            let urls_to_clear = [];

            let lsn_to_delete = [];
            resolve(
                this._getObjById(course_id, COURSE_REQ_TREE)
                    .then((result) => {
                        ls_course_collection = result.getCol("DataElements");
                        if (ls_course_collection.count() != 1)
                            throw new Error("Course (Id = " + course_id + ") doesn't exist.");
                        course_obj = ls_course_collection.get(0);
                        course_url = course_obj.uRL();
                        ls_course_collection = course_obj.getDataRoot("LessonCourse").getCol("DataElements");
                        for (let i = 0; i < ls_course_collection.count(); i++) {
                            if (ls_course_collection.get(i).lessonId() === id) {
                                ls_course_obj = ls_course_collection.get(i);
                                lesson_number = ls_course_obj.number();
                                break;
                            }
                        }
                        if (!ls_course_obj)
                            throw new Error("Lesson (Id = " + id + ") doesn't belong to course (Id = " + course_id + ").");

                        lc_parent_id = ls_course_obj.parentId();
                        if (hasParent) {
                            for (let i = 0; i < ls_course_collection.count(); i++) {
                                if (ls_course_collection.get(i).id() === lc_parent_id)
                                    curr_parent_id = ls_course_collection.get(i).lessonId();
                            }
                            if (curr_parent_id !== parent_id)
                                throw new Error("Lesson (Id = " + id + ") doesn't belong to parent (Id = " + parent_id +
                                    ") in course (Id = " + course_id + ") context.");
                        }

                        return course_obj.edit()
                            .then(() => {
                                return this._getObjById(id, {
                                    expr: {
                                        model: {
                                            name: "Lesson",
                                            childs: [
                                                {
                                                    dataObject: {
                                                        name: "Lesson"
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
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + id + ") doesn't exist.");

                        let lesson_obj = collection.get(0);
                        lesson_url = lesson_obj.uRL();
                        urls_to_clear.push("/" + course_url + "/" + lesson_obj.uRL() + "/");
                        if (lesson_obj.courseId() === course_id) {
                            // We need to remove whole lesson here    
                            lsn_to_delete.push(lesson_obj.id());
                            let ch_collection = lesson_obj.getDataRoot("Lesson").getCol("DataElements");
                            for (let i = 0; i < ch_collection.count(); i++) {
                                let ch_lsn = ch_collection.get(i);
                                lsn_to_delete.unshift(ch_lsn.id());
                                urls_to_clear.push("/" + course_url + "/" + ch_lsn.uRL() + "/");
                            }
                        }

                        // Removing lesson reference from course
                        let ch_to_del = [];
                        for (let i = 0; i < ls_course_collection.count(); i++) {
                            let lsn = ls_course_collection.get(i);
                            if (ls_course_obj.id() === lsn.parentId())
                                ch_to_del.push(lsn);
                        }
                        ch_to_del.forEach((elem) => {
                            ls_course_collection._del(elem);
                        });
                        ls_course_collection._del(ls_course_obj);
                        for (let i = 0; i < ls_course_collection.count(); i++) {
                            let lsn = ls_course_collection.get(i);
                            if ((hasParent && (lsn.parentId() === lc_parent_id)) || ((!hasParent) && (!lsn.parentId())))
                                if (lsn.number() > lesson_number)
                                    lsn.number(lsn.number() - 1);
                        }

                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                                return course_obj.save(opts);
                            })
                            .then(() => {
                                if (lsn_to_delete.length > 0)
                                    return Utils.seqExec(lsn_to_delete, (id) => {
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
                                    });
                            });
                   })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Lesson deleted: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (course_obj)
                            this._db._deleteRoot(course_obj.getRoot());
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
                        let rc = Promise.resolve(result);
                        if (urls_to_clear.length > 0) {
                            rc = Utils.seqExec(urls_to_clear, (url) => {
                                return this.clearCache(url);
                            })
                                .then(() => result);
                        }
                        return rc;
                    })
            );
        })
    }

    update(id, course_id, data, parent_id, options) {
        let self = this;
        return new Promise((resolve, reject) => {
            let course_obj;
            let lsn_obj;
            let lsn_lng_obj;
            let root_ch;
            let root_res;
            let root_ref;
            let root_img;
            let root_epi;
            let ch_collection;
            let ch_own_collection;
            let res_collection;
            let ref_collection;
            let img_collection;
            let epi_collection;
            let epi_own_collection;
            let languageId;
            let ch_list = {};
            let res_list = {};
            let ref_list = {};
            let img_list = {};
            let epi_list = {};
            let opts = options || {};
            let inpFields = data || {};
            
            let ch_new = [];
            let res_new = [];
            let newResIds = {};
            let ref_new = [];
            let img_new = [];
            let epi_new = [];

            let needToDeleteOwn = false;
            let needToDeleteOwnCh = false;
            let transactionId = null;

            let ls_course_obj = null;
            let hasParent = (typeof (parent_id) === "number") && (!isNaN(parent_id));
            let isDurationChanged = false;

            let isModified = false;
            let course_url;
            let old_url;
            let urls_to_delete = [];
            
            resolve(
                this._getObjById(course_id, COURSE_REQ_TREE)
                    .then((result) => {
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + course_id + ") doesn't exist.");
                        course_obj = collection.get(0);
                        course_url = course_obj.uRL();

                        return course_obj.edit()
                            .then(() => {
                                return this._getObjById(id, LESSON_UPD_TREE);
                            })
                    })
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + id + ") doesn't exist.");
                        lsn_obj = collection.get(0);
                        old_url = lsn_obj.uRL();

                        root_ch = course_obj.getDataRoot("LessonCourse");
                        ch_collection = root_ch.getCol("DataElements");
                        for (let i = 0; i < ch_collection.count(); i++) {
                            if (ch_collection.get(i).lessonId() === id) {
                                ls_course_obj = ch_collection.get(i);
                                break;
                            }
                        }
                        if (!ls_course_obj)
                            throw new Error("Lesson (Id = " + id + ") doesn't belong to course (Id = " + course_id + ").");

                        collection = lsn_obj.getDataRoot("LessonLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + id + ") has inconsistent \"LNG\" part.");
                        lsn_lng_obj = collection.get(0);
                        languageId = lsn_lng_obj.languageId();

                        ch_own_collection = lsn_obj.getDataRoot("Lesson").getCol("DataElements");
                        root_res = lsn_obj.getDataRoot("Resource");
                        res_collection = root_res.getCol("DataElements");
                        root_ref = lsn_lng_obj.getDataRoot("Reference");
                        ref_collection = root_ref.getCol("DataElements");
                        root_img = lsn_lng_obj.getDataRoot("LessonMetaImage");
                        img_collection = root_img.getCol("DataElements");
                        root_epi = lsn_obj.getDataRoot("EpisodeLesson");
                        epi_collection = root_epi.getCol("DataElements");
                        epi_own_collection = lsn_obj.getDataRoot("Episode").getCol("DataElements");

                        if ((!hasParent) && inpFields.Childs && (typeof (inpFields.Childs.length) === "number")) {
                            let lc_parent_id = ls_course_obj.id();
                            for (let i = 0; i < ch_collection.count(); i++) {
                                let obj = ch_collection.get(i);
                                if (obj.parentId() === lc_parent_id)
                                    ch_list[obj.lessonId()] = { deleted: true, isOwner: false, obj: obj };
                            }

                            for (let i = 0; i < ch_own_collection.count(); i++) {
                                let obj = ch_own_collection.get(i);
                                if (!ch_list[obj.id()])
                                    throw new Error("Unknown own child lesson (Id = " + obj.id() + ").");
                                ch_list[obj.id()].isOwner = true;
                                ch_list[obj.id()].ownObj = obj;
                            }

                            let Number = 1;
                            inpFields.Childs.forEach((elem) => {
                                let data = {
                                    ParentId: lc_parent_id,
                                    LessonId: elem.Id,
                                    Number: Number++,
                                    State: elem.State
                                };
                                if (typeof (elem.ReadyDate) !== "undefined")
                                    data.ReadyDate = elem.ReadyDate;
                                if (ch_list[elem.Id]) {
                                    ch_list[elem.Id].deleted = false;
                                    ch_list[elem.Id].data = data;
                                }
                                else
                                    ch_new.push(data);
                            })
                        }

                        if (inpFields.Resources && (typeof (inpFields.Resources.length) === "number")) {
                            for (let i = 0; i < res_collection.count(); i++) {
                                let obj = res_collection.get(i);
                                let collection = obj.getDataRoot("ResourceLng").getCol("DataElements");
                                if (collection.count() != 1)
                                    throw new Error("Resource (Id = " + obj.id() + ") has inconsistent \"LNG\" part.");
                                let lng_obj = collection.get(0);
                                res_list[obj.id()] = { deleted: true, obj: obj, lngObj: lng_obj };
                            }

                            inpFields.Resources.forEach((elem) => {
                                let data = {
                                    res: {
                                        ResType: elem.ResType ? elem.ResType : "P",
                                        FileName: elem.FileName
                                    },
                                    lng: {
                                        Name: elem.Name ? elem.Name : "",
                                        LanguageId: languageId
                                    }
                                };
                                if (typeof (elem.ResLanguageId) !== "undefined")
                                    data.res.ResLanguageId = elem.ResLanguageId;
                                if (typeof (elem.ShowInGalery) !== "undefined")
                                    data.res.ShowInGalery = elem.ShowInGalery;
                                if (typeof (elem.Description) !== "undefined")
                                    data.lng.Description = elem.Description;
                                if (typeof (elem.AltAttribute) !== "undefined")
                                    data.lng.AltAttribute = elem.AltAttribute;
                                if (typeof (elem.MetaData) !== "undefined")
                                    data.res.MetaData = elem.MetaData;
                                if (typeof (elem.Id) === "number") {
                                    if (res_list[elem.Id]) {
                                        res_list[elem.Id].deleted = false;
                                        res_list[elem.Id].data = data;
                                    }
                                    else {
                                        data.Id = elem.Id;
                                        delete elem.Id;
                                        res_new.push(data);
                                    }
                                }
                                else {
                                    data.Id = 0;
                                    res_new.push(data);
                                }
                            })
                        }

                        if (inpFields.References && (typeof (inpFields.References.length) === "number")) {
                            for (let i = 0; i < ref_collection.count(); i++) {
                                let obj = ref_collection.get(i);
                                ref_list[obj.id()] = { deleted: true, obj: obj };
                            }

                            let Number = 1;
                            let NumberRec = 1;
                            inpFields.References.forEach((elem) => {
                                let data = {
                                    Number: elem.Recommended ? NumberRec++ : Number++,
                                    Description: elem.Description,
                                    Recommended: elem.Recommended
                                };
                                if (typeof (elem.URL) !== "undefined")
                                    data.URL = elem.URL;
                                if (typeof (elem.AuthorComment) !== "undefined")
                                    data.AuthorComment = elem.AuthorComment;
                                if (typeof (elem.Id) === "number") {
                                    if (ref_list[elem.Id]) {
                                        ref_list[elem.Id].deleted = false;
                                        ref_list[elem.Id].data = data;
                                    }
                                    else {
                                        //throw new Error("Unknown reference item (Id = " + elem.Id + ").");
                                        delete elem.Id;
                                        ref_new.push(data);
                                    }
                                }
                                else
                                    ref_new.push(data);
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
                                    ResourceId: elem.ResourceId
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

                        if (inpFields.Episodes && (typeof (inpFields.Episodes.length) === "number")) {
                            for (let i = 0; i < epi_collection.count(); i++) {
                                let obj = epi_collection.get(i);
                                epi_list[obj.episodeId()] = { deleted: true, isOwner: false, obj: obj };
                            }

                            for (let i = 0; i < epi_own_collection.count(); i++) {
                                let obj = epi_own_collection.get(i);
                                if (!epi_list[obj.id()])
                                    throw new Error("Unknown own episode (Id = " + obj.id() + ").");
                                epi_list[obj.id()].isOwner = true;
                                epi_list[obj.id()].ownObj = obj;
                            }

                            let Number = 1;
                            let NumberSupp = 1;
                            inpFields.Episodes.forEach((elem) => {
                                let data = {
                                    EpisodeId: elem.Id,
                                    Number: elem.Supp ? NumberSupp++ : Number++,
                                    Supp: elem.Supp
                                };
                                if (epi_list[elem.Id]) {
                                    epi_list[elem.Id].deleted = false;
                                    epi_list[elem.Id].data = data;
                                }
                                else
                                    epi_new.push(data);
                            })
                        }

                        return lsn_obj.edit()
                    })
                    .then(() => {

                        if (typeof (inpFields["AuthorId"]) !== "undefined")
                            lsn_obj.authorId(inpFields["AuthorId"]);
                        if (typeof (inpFields["LessonType"]) !== "undefined")
                            lsn_obj.lessonType(inpFields["LessonType"]);
                        if (typeof (inpFields["Cover"]) !== "undefined")
                            lsn_obj.cover(inpFields["Cover"]);
                        if (typeof (inpFields["CoverMeta"]) !== "undefined")
                            lsn_obj.coverMeta(inpFields["CoverMeta"]);
                        if (typeof (inpFields["URL"]) !== "undefined")
                            lsn_obj.uRL(inpFields["URL"]);
                        if (typeof (inpFields["IsFreeInPaidCourse"]) !== "undefined")
                            lsn_obj.isFreeInPaidCourse(inpFields["IsFreeInPaidCourse"] ? true : false);
                        if (typeof (inpFields["IsAuthRequired"]) !== "undefined")
                            lsn_obj.isAuthRequired(inpFields["IsAuthRequired"] ? true : false);
                        if (typeof (inpFields["IsSubsRequired"]) !== "undefined")
                            lsn_obj.isSubsRequired(inpFields["IsSubsRequired"] ? true : false);
                        if (typeof (inpFields["FreeExpDate"]) !== "undefined")
                            lsn_obj.freeExpDate(inpFields["FreeExpDate"]);
                        if (lsn_obj.isSubsRequired())
                            lsn_obj.isAuthRequired(true);
                        if (typeof (inpFields["Name"]) !== "undefined")
                            lsn_lng_obj.name(inpFields["Name"]);
                        if (typeof (inpFields["ShortDescription"]) !== "undefined")
                            lsn_lng_obj.shortDescription(inpFields["ShortDescription"]);
                        if (typeof (inpFields["FullDescription"]) !== "undefined")
                            lsn_lng_obj.fullDescription(inpFields["FullDescription"]);
                        if (typeof (inpFields["SnPost"]) !== "undefined")
                            lsn_lng_obj.snPost(inpFields["SnPost"]);
                        if (typeof (inpFields["SnName"]) !== "undefined")
                            lsn_lng_obj.snName(inpFields["SnName"]);
                        if (typeof (inpFields["SnDescription"]) !== "undefined")
                            lsn_lng_obj.snDescription(inpFields["SnDescription"]);
                        if (typeof (inpFields["ExtLinks"]) !== "undefined")
                            lsn_lng_obj.extLinks(this._partnerLink.processLinks(inpFields["ExtLinks"]));

                        let prevState = ls_course_obj.state();
                        let currDate = new Date();
                        currDate = (new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate())) - 0;

                        if (typeof (inpFields["State"]) !== "undefined") {
                            lsn_lng_obj.state(inpFields["State"]);
                            ls_course_obj.state(inpFields["State"]);
                        }
                        let currState = ls_course_obj.state();
                        if (typeof (inpFields["ReadyDate"]) !== "undefined") {
                            let oldReadyDate = ls_course_obj.readyDate() - 0;
                            let newReadyDate = ls_course_obj.readyDate(inpFields["ReadyDate"]) - 0;
                            if (currState === "R") {
                                if (currState !== prevState) {
                                    if (newReadyDate !== currDate)
                                        throw new Error(`Publish date should be equal to CURRENT date for "READY" lesson.`);
                                }
                                else
                                    if (oldReadyDate !== newReadyDate)
                                        throw new Error(`Can't change "READY" lesson publish date.`);
                            }
                        }
                        
                        for (let key in ch_list)
                            if (ch_list[key].deleted) {
                                if (ch_list[key].isOwner)
                                    needToDeleteOwnCh = true;
                                ch_collection._del(ch_list[key].obj);
                            }
                            else {
                                for (let field in ch_list[key].data)
                                    ch_list[key].obj[self._genGetterName(field)](ch_list[key].data[field]);
                            }

                        for (let key in res_list)
                            if (!res_list[key].deleted) {
                                for (let field in res_list[key].data.res)
                                    res_list[key].obj[self._genGetterName(field)](res_list[key].data.res[field]);
                                for (let field in res_list[key].data.lng)
                                    res_list[key].lngObj[self._genGetterName(field)](res_list[key].data.lng[field]);
                            }

                        for (let key in ref_list)
                            if (ref_list[key].deleted)
                                ref_collection._del(ref_list[key].obj)
                            else {
                                for (let field in ref_list[key].data)
                                    ref_list[key].obj[self._genGetterName(field)](ref_list[key].data[field]);    
                            }
                        
                        for (let key in epi_list)
                            if (epi_list[key].deleted) {
                                if (epi_list[key].isOwner)
                                    needToDeleteOwn = true;
                                epi_collection._del(epi_list[key].obj);
                                isDurationChanged = true;
                            }
                            else {
                                for (let field in epi_list[key].data)
                                    epi_list[key].obj[self._genGetterName(field)](epi_list[key].data[field]);    
                            }
                    })
                    .then(() => {
                        if (ch_new && (ch_new.length > 0)) {
                            return Utils.seqExec(ch_new, (elem) => {
                                return root_ch.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (res_new && (res_new.length > 0)) {
                            return Utils.seqExec(res_new, (elem) => {
                                let newId = elem.Id;
                                return root_res.newObject({
                                    fields: elem.res
                                }, opts)
                                    .then((result) => {
                                        let new_res_obj = this._db.getObj(result.newObject);
                                        if (newId < 0)
                                            newResIds[newId] = new_res_obj.id();
                                        let root_res_lng = new_res_obj.getDataRoot("ResourceLng");
                                        return root_res_lng.newObject({
                                            fields: elem.lng
                                        }, opts);
                                    });
                            });
                        }
                    })
                    .then(() => {
                        if (ref_new && (ref_new.length > 0)) {
                            return Utils.seqExec(ref_new, (elem) => {
                                return root_ref.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        for (let key in img_list)
                            if (img_list[key].deleted)
                                img_collection._del(img_list[key].obj)
                            else {
                                let resId = img_list[key].data["ResourceId"];
                                if ((typeof (resId) === "number") && (resId < 0)) {
                                    let newResId = newResIds[resId];
                                    if (!newResId)
                                        throw new Error(`Images: Invalid "ResourceId": "${resId}", "Type": "${img_list[key].data["Type"]}"`);
                                    img_list[key].data["ResourceId"] = newResId;
                                }
                                for (let field in img_list[key].data)
                                    img_list[key].obj[self._genGetterName(field)](img_list[key].data[field]);
                            }

                        if (img_new && (img_new.length > 0)) {
                            return Utils.seqExec(img_new, (elem) => {
                                let resId = elem["ResourceId"];
                                if ((typeof (resId) === "number") && (resId < 0)) {
                                    let newResId = newResIds[resId];
                                    if (!newResId)
                                        throw new Error(`Images: Invalid "ResourceId": "${resId}", "Type": "${elem["Type"]}"`);
                                    elem["ResourceId"] = newResId;
                                }
                                return root_img.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (epi_new && (epi_new.length > 0)) {
                            isDurationChanged = true;
                            return Utils.seqExec(epi_new, (elem) => {
                                return root_epi.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        isModified = needToDeleteOwnCh || needToDeleteOwn || isDurationChanged;
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts.transactionId = transactionId;
                                return lsn_obj.save(opts)
                                    .then((result) => {
                                        if (result && result.detail && (result.detail.length > 0))
                                            isModified = true;
                                        return lsn_obj.edit()
                                            .then(() => {
                                                // Delete Resources after LessonMetaImages !!!
                                                for (let key in res_list)
                                                    if (res_list[key].deleted)
                                                        res_collection._del(res_list[key].obj);
                                                return lsn_obj.save(opts);
                                            });
                                    })
                                    .then((result) => {
                                        if (result && result.detail && (result.detail.length > 0))
                                            isModified = true;
                                        return course_obj.save(opts);
                                    })
                                    .then((result) => {
                                        if (result && result.detail && (result.detail.length > 0))
                                            isModified = true;
                                    });
                            });
                    })
                    .then(() => {
                        if (needToDeleteOwnCh)
                            return Utils.seqExec(ch_list, (elem) => {
                                let rc = Promise.resolve();
                                if (elem.deleted && elem.isOwner) {
                                    let id = elem.ownObj.id();
                                    rc= $data.execSql({
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
                                            urls_to_delete.push("/" + course_url + "/" + elem.ownObj.uRL() + "/");
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
                                }
                                return rc;
                            });
                    })
                    .then(() => {
                        if (needToDeleteOwn)
                            return Utils.seqExec(epi_list, (elem) => {
                                let rc = Promise.resolve();
                                if (elem.deleted && elem.isOwner) {
                                    let id = elem.ownObj.id();
                                    rc = $data.execSql({
                                        dialect: {
                                            mysql: _.template(CHECK_IF_CAN_DEL_EPI_MYSQL)({ id: id }),
                                            mssql: _.template(CHECK_IF_CAN_DEL_EPI_MSSQL)({ id: id })
                                        }
                                    }, opts)
                                        .then((result) => {
                                            if (result && result.detail && (result.detail.length > 0))
                                                throw new HttpError(HttpCode.ERR_CONFLICT, `Can't delete episode (Id: "${id}") which is "READY".`);
                                        })
                                        .then(() => {
                                            let mysql_script = [];
                                            EPISODE_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                                mysql_script.push(_.template(elem)({ id: id }));
                                            });
                                            let mssql_script = [];
                                            EPISODE_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                                mssql_script.push(_.template(elem)({ id: id }));
                                            });
                                            return DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                                        });
                                }
                                return rc;
                            });
                    })
                    .then(() => {
                        if (isDurationChanged)
                            return this._updateLessonDuration(id, opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Lesson updated: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (lsn_obj)
                            this._db._deleteRoot(lsn_obj.getRoot());
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
                            rc = this.prerender(id, false, "/" + course_url + "/" + old_url + "/")
                                .then(() => {
                                    if (urls_to_delete.length > 0)
                                        return Utils.seqExec(urls_to_delete, (url) => {
                                            return this.clearCache(url);
                                        });
                                })
                                .then(() => result);
                        return rc;
                    })
            );
        })
    }

    insert(data, course_id, parent_id, options) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let course_obj;
            let opts = options || {};
            let newId = null;
            let new_obj = null;
            let new_lng_obj = null;
            let inpFields = data || {};
            let transactionId = null;
            let hasParent = (typeof (parent_id) === "number") && (!isNaN(parent_id));
            let languageId;
            let newResIds = {};

            resolve(
                this._getObjById(course_id, COURSE_REQ_TREE)
                    .then((result) => {
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + course_id + ") doesn't exist.");
                        course_obj = collection.get(0);

                        let root_lsn = course_obj.getDataRoot("LessonCourse");
                        collection = root_lsn.getCol("DataElements");

                        if (course_obj.oneLesson() && (!hasParent) && (collection.count() > 0))
                            throw new Error(`Single lesson course must have exactly one lesson.`);
                        
                        return course_obj.edit();
                    })
                    .then(() => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_COURSE_LANG_MYSQL)({ courseId: course_id }),
                                mssql: _.template(GET_COURSE_LANG_MSSQL)({ courseId: course_id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            languageId = result.detail[0].LanguageId;
                            return this._getObjById(-1);
                        }
                        else
                            throw new Error("Course (Id = " + course_id + ") has inconsistent \"LNG\" part.");
                    })
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { CourseId: course_id };
                        if (hasParent)
                            fields["ParentId"] = parent_id;
                        if (typeof (inpFields["AuthorId"]) !== "undefined")
                            fields["AuthorId"] = inpFields["AuthorId"];
                        if (typeof (inpFields["LessonType"]) !== "undefined")
                            fields["LessonType"] = inpFields["LessonType"];
                        if (typeof (inpFields["Cover"]) !== "undefined")
                            fields["Cover"] = inpFields["Cover"];
                        if (typeof (inpFields["CoverMeta"]) !== "undefined")
                            fields["CoverMeta"] = inpFields["CoverMeta"];
                        if (typeof (inpFields["URL"]) !== "undefined")
                            fields["URL"] = inpFields["URL"];
                        fields["IsFreeInPaidCourse"] = false;
                        if (typeof (inpFields["IsFreeInPaidCourse"]) !== "undefined")
                            fields["IsFreeInPaidCourse"] = inpFields["IsFreeInPaidCourse"] ? true : false;
                        fields["IsAuthRequired"] = false;
                        if (typeof (inpFields["IsAuthRequired"]) !== "undefined")
                            fields["IsAuthRequired"] = inpFields["IsAuthRequired"] ? true : false;
                        fields["IsSubsRequired"] = false;
                        if (typeof (inpFields["IsSubsRequired"]) !== "undefined")
                            fields["IsSubsRequired"] = inpFields["IsSubsRequired"] ? true : false;
                        if (typeof (inpFields["FreeExpDate"]) !== "undefined")
                            fields["FreeExpDate"] = inpFields["FreeExpDate"];
                        if (fields["IsSubsRequired"])
                            fields["IsAuthRequired"] = true;    
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("LessonLng");

                        let fields = { LanguageId: languageId, Duration: 0, DurationFmt: "00:00" };
                        if (typeof (inpFields["State"]) !== "undefined")
                            fields["State"] = inpFields["State"];
                        if (typeof (inpFields["Name"]) !== "undefined")
                            fields["Name"] = inpFields["Name"];
                        if (typeof (inpFields["ShortDescription"]) !== "undefined")
                            fields["ShortDescription"] = inpFields["ShortDescription"];
                        if (typeof (inpFields["FullDescription"]) !== "undefined")
                            fields["FullDescription"] = inpFields["FullDescription"];
                        if (typeof (inpFields["SnPost"]) !== "undefined")
                            fields["SnPost"] = inpFields["SnPost"];
                        if (typeof (inpFields["SnName"]) !== "undefined")
                            fields["SnName"] = inpFields["SnName"];
                        if (typeof (inpFields["SnDescription"]) !== "undefined")
                            fields["SnDescription"] = inpFields["SnDescription"];
                        if (typeof (inpFields["ExtLinks"]) !== "undefined")
                            fields["ExtLinks"] = this._partnerLink.processLinks(inpFields["ExtLinks"]);

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        new_lng_obj = this._db.getObj(result.newObject);
                        let root_epl = new_obj.getDataRoot("EpisodeLesson");
                        if (inpFields.Episodes && (inpFields.Episodes.length > 0)) {
                            let Number = 1;
                            let NumberSupp = 1;
                            return Utils.seqExec(inpFields.Episodes, (elem) => {
                                let fields = {};
                                if (typeof (elem["Id"]) !== "undefined")
                                    fields["EpisodeId"] = elem["Id"];
                                if (typeof (elem["Supp"]) !== "undefined") {
                                    fields["Supp"] = elem["Supp"];
                                    if (!fields.Supp)
                                        fields.Number = Number++
                                    else
                                        fields.Number = NumberSupp++;
                                }
                                return root_epl.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_ref = new_lng_obj.getDataRoot("Reference");
                        if (inpFields.References && (inpFields.References.length > 0)) {
                            let Number = 1;
                            let NumberRec = 1;
                            return Utils.seqExec(inpFields.References, (elem) => {
                                let fields = {};
                                if (typeof (elem["Description"]) !== "undefined")
                                    fields["Description"] = elem["Description"];
                                if (typeof (elem["URL"]) !== "undefined")
                                    fields["URL"] = elem["URL"];
                                if (typeof (elem["Recommended"]) !== "undefined") {
                                    fields["Recommended"] = elem["Recommended"];
                                    if (!fields.Recommended)
                                        fields.Number = Number++
                                    else
                                        fields.Number = NumberRec++;
                                }
                                if (typeof (elem["AuthorComment"]) !== "undefined")
                                    fields["AuthorComment"] = elem["AuthorComment"];
                                return root_ref.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_res = new_obj.getDataRoot("Resource");
                        let newId = 0;
                        let cnt = 0;
                        if (inpFields.Resources && (inpFields.Resources.length > 0)) {
                            return Utils.seqExec(inpFields.Resources, (elem) => {
                                let fields = { ResType: "P" };
                                newId = 0;
                                if ((typeof (elem["Id"]) === "number") && (elem["Id"] < 0))
                                    newId = elem["Id"];
                                if (typeof (elem["ResType"]) !== "undefined")
                                    fields["ResType"] = elem["ResType"];
                                if (typeof (elem["FileName"]) !== "undefined")
                                    fields["FileName"] = elem["FileName"];
                                if (typeof (elem["ResLanguageId"]) !== "undefined")
                                    fields["ResLanguageId"] = elem["ResLanguageId"];
                                if (typeof (elem["ShowInGalery"]) !== "undefined")
                                    fields["ShowInGalery"] = elem["ShowInGalery"];
                                if (typeof (elem["MetaData"]) !== "undefined")
                                    fields["MetaData"] = elem["MetaData"];
                                return root_res.newObject({
                                    fields: fields
                                }, opts)
                                    .then((result) => {
                                        let new_res_obj = this._db.getObj(result.newObject);
                                        if (newId < 0)
                                            newResIds[newId] = new_res_obj.id();
                                        let root_res_lng = new_res_obj.getDataRoot("ResourceLng");
                                        let fields = { Name: "", LanguageId: languageId, Duration: 0, DurationFmt: "00:00" };
                                        if (typeof (elem["Name"]) !== "undefined")
                                            fields["Name"] = elem["Name"] ? elem["Name"] : "";
                                        if (typeof (elem["Description"]) !== "undefined")
                                            fields["Description"] = elem["Description"];
                                        if (typeof (elem["AltAttribute"]) !== "undefined")
                                            fields["AltAttribute"] = elem["AltAttribute"];
                                        return root_res_lng.newObject({
                                            fields: fields
                                        }, opts);
                                    });
                            });
                        }
                    })
                    .then(() => {
                        let root_img = new_lng_obj.getDataRoot("LessonMetaImage");
                        if (inpFields.Images && (inpFields.Images.length > 0)) {
                            return Utils.seqExec(inpFields.Images, (elem) => {
                                let fields = {};
                                if (typeof (elem["Type"]) !== "undefined")
                                    fields["Type"] = elem["Type"];
                                if (typeof (elem["ResourceId"]) === "number") {
                                    fields["ResourceId"] = elem["ResourceId"];
                                    if (elem["ResourceId"] < 0) {
                                        let newId = newResIds[elem["ResourceId"]];
                                        if (!newId)
                                            throw new Error(`Images: Invalid "ResourceId": "${elem["ResourceId"]}", "Type": "${elem["Type"]}"`);
                                        fields["ResourceId"] = newId;
                                    }
                                }
                                return root_img.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_lsn = course_obj.getDataRoot("LessonCourse");
                        let collection = root_lsn.getCol("DataElements");
                        let Number = 1;
                        let parent_lc_id = -1;
                        if (hasParent) {
                            for (let i = 0; i < collection.count(); i++){
                                if (collection.get(i).lessonId() === parent_id) {
                                    parent_lc_id = collection.get(i).id();
                                    break;
                                }
                            }
                            if (parent_lc_id === -1)
                                throw new Error("Parent lesson (Id=" + parent_id + ") doesn't belong to a course (Id=" + course_id + ").");
                            for (let i = 0; i < collection.count(); i++) {
                                if (collection.get(i).parentId() === parent_lc_id)
                                    Number++;
                            }
                        }
                        else {
                            for (let i = 0; i < collection.count(); i++)
                                if (!collection.get(i).parentId())
                                    Number++;
                        }
                        let fields = { LessonId: newId, State: inpFields.State, Number: Number };
                        if (parent_lc_id !== -1)
                            fields.ParentId = parent_lc_id;
                        if (typeof (inpFields["ReadyDate"]) !== "undefined")
                            fields["ReadyDate"] = inpFields["ReadyDate"];
                        return root_lsn.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        let parent_lc_id = result.keyValue;
                        if ((!hasParent) && inpFields.Childs && (inpFields.Childs.length > 0)) {
                            let Number = 1;
                            let root_lsn = course_obj.getDataRoot("LessonCourse");
                            return Utils.seqExec(inpFields.Childs, (elem) => {
                                let fields = { LessonId: elem.Id, ParentId: parent_lc_id, State: elem.State, Number: Number++ };
                                if (typeof (inpFields["ReadyDate"]) !== "undefined")
                                    fields["ReadyDate"] = inpFields["ReadyDate"];
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
                                return root_obj.save(opts);
                            })
                            .then(() => {
                                return course_obj.save(opts);
                            });
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Lesson added: Id="${newId}".`));
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (course_obj)
                            this._db._deleteRoot(course_obj.getRoot());
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

let dbLesson = null;
exports.LessonsService = () => {
    return dbLesson ? dbLesson : dbLesson = new DbLesson();
}
