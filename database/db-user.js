const _ = require('lodash');
const config = require('config');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const { DbObject } = require('./db-object');
const { UsersCache } = require('../security/users-cache');
const { PositionsService } = require('../services/lesson-positions');
const { Intervals } = require('../const/common');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { CoursesService } = require('./db-course');
const { splitArray } = require('../utils');
const { AccessFlags } = require('../const/common');
const { AccessRights } = require('../security/access-rights');
const { EpisodeContentType } = require('../const/sql-req-common');
const { ProductService } = require('./db-product');
const { parseInt } = require('lodash');

const isBillingTest = config.has("billing.billing_test") ? config.billing.billing_test : false;

const GET_HISTORY_MSSQL =
    "select lc.[Id] as[LcId], lc.[ParentId], c.[Id], c.[OneLesson], l.[Id] as[LessonId], c.[LanguageId], c.[Cover], c.[CoverMeta], c.[Mask], c.[Color], cl.[Name],\n" +
    "  c.[URL], lc.[Number], lc.[ReadyDate], ell.[Audio], el.[Number] Eln,\n" +
    "  ell.[VideoLink], e.[ContentType],\n" +
    "  c.[IsPaid], c.[IsSubsFree], c.[ProductId], l.[IsFreeInPaidCourse], pc.[Counter],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId,\n" +
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
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
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
    "select lc.`Id` as`LcId`, lc.`ParentId`, c.`Id`, c.`OneLesson`, l.`Id` as`LessonId`, c.`LanguageId`, c.`Cover`, c.`CoverMeta`, c.`Mask`, c.`Color`, cl.`Name`,\n" +
    "  c.`URL`, lc.`Number`, lc.`ReadyDate`, ell.`Audio`, el.`Number` Eln,\n" +
    "  ell.`VideoLink`, e.`ContentType`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, l.`IsFreeInPaidCourse`, pc.`Counter`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId,\n" +
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
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
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

const GET_LESSON_COURSE_ID_BYID_MSSQL =
    "select lc.[Id] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where c.[Id] = '<%= courseId %>' and l.[Id] = '<%= lessonId %>'";

const DEL_COURSE_BKM_MSSQL =
    "delete b from [Bookmark] b\n" +
    "  join[Course] c on c.[Id] = b.[CourseId]\n" +
    "where b.[UserId] = <%= userId %> and c.[URL] = '<%= courseUrl %>'";

const DEL_COURSE_BKM_ID_MSSQL =
    "delete b from [Bookmark] b\n" +
    "  join[Course] c on c.[Id] = b.[CourseId]\n" +
    "where b.[UserId] = <%= userId %> and c.[Id] = '<%= id %>'";

const DEL_LESSON_BKM_MSSQL =
    "delete b from[Bookmark] b\n" +
    "  join[LessonCourse] lc on lc.[Id] = b.[LessonCourseId]\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where b.[UserId] = <%= userId %> and c.[URL] = '<%= courseUrl %>' and l.[URL] = '<%= lessonUrl %>'";

const DEL_LESSON_BKM_ID_MSSQL =
    "delete b from[Bookmark] b\n" +
    "  join[LessonCourse] lc on lc.[Id] = b.[LessonCourseId]\n" +
    "  join[Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where b.[UserId] = <%= userId %> and c.[Id] = '<%= courseId %>' and l.[Id] = '<%= lessonId %>'";

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

const GET_SHORT_BKM_MSSQL_APP =
    "select c.[Id] as [CourseId], NULL as [LessonId] from [Bookmark] b\n" +
    "  join[Course] c on c.[Id] = b.[CourseId]\n" +
    "where b.[UserId] = <%= userId %>\n" +
    "union\n" +
    "select NULL as [CourseId], lc.[LessonId] from[Bookmark] b\n" +
    "  join[LessonCourse] lc on lc.[Id] = b.[LessonCourseId]\n" +
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
    "select c.[Id], pc.[Counter], c.[IsPaid], c.[IsSubsFree], c.[ProductId], c.[OneLesson], c.[Cover],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId, c.[CourseType],\n" +
    "  c.[CoverMeta], c.[Mask], c.[URL], cl.[Name]\n" +
    "from [Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= user_id %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= user_id %>) and (gc.[CourseId] = c.[Id])\n" +
    "where c.[Id] in (<%= courseIds %>)";

const GET_PAID_COURSES_MSSQL =
    "select [CourseId] as [Id], [TimeCr] from [UserPaidCourse]\n" +
    "where [UserId] = <%= userId %>\n" +
    "union all\n" +
    "select [CourseId] as [Id], [TimeCr] from [UserGiftCourse]\n" +
    "where [UserId] = <%= userId %>\n" +
    "order by 2 desc";

const GET_GIFT_COURSES_MSSQL =
    "select[Id] from [Course]\n" +
    "where ([PaidTp] = 2) and ([PaidRegDate] > convert(datetime, '<%= dt %>'))\n" +
    "order by [PaidRegDate] desc";

    // "select t.[Id], min(t.dt) dt\n" +
    // "from (select [Id], [PaidRegDate] as dt from [Course]\n" +
    // "where ([PaidTp] = 2) and ([PaidRegDate] > convert(datetime, '<%= dt %>'))\n" +
    // "union all\n" +
    // "select [CourseId], [TimeCr] from [UserGiftCourse]\n" +
    // "where [UserId] = <%= userId %>) as t\n" +
    // "group by t.[Id]\n" +
    // "order by 2 desc";

const GET_AUTHORS_BY_COURSE_IDS_MSSQL =
    "select a.[Id], ac.[CourseId], a.[Portrait], a.[PortraitMeta], a.[URL],\n" +
    "  al.[FirstName], al.[LastName] from [Author] a\n" +
    "  join[AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "  join[AuthorToCourse] ac on ac.[AuthorId] = a.[Id]\n" +
    "where ac.[CourseId] in (<%= courseIds %>)";

const GET_COURSE_ID_MYSQL =
    "select `Id` from `Course` where `URL` = '<%= courseUrl %>'";

const GET_LESSON_COURSE_ID_MYSQL =
    "select lc.`Id` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where c.`URL` = '<%= courseUrl %>' and l.`URL` = '<%= lessonUrl %>'";

const GET_LESSON_COURSE_ID_BYID_MYSQL =
    "select lc.`Id` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where c.`Id` = '<%= courseId %>' and l.`Id` = '<%= lessonId %>'";

const DEL_COURSE_BKM_MYSQL =
    "delete b from `Bookmark` b\n" +
    "  join`Course` c on c.`Id` = b.`CourseId`\n" +
    "where b.`UserId` = <%= userId %> and c.`URL` = '<%= courseUrl %>'";

const DEL_COURSE_BKM_ID_MYSQL =
    "delete b from `Bookmark` b\n" +
    "  join`Course` c on c.`Id` = b.`CourseId`\n" +
    "where b.`UserId` = <%= userId %> and c.`Id` = '<%= id %>'";

const DEL_LESSON_BKM_MYSQL =
    "delete b from`Bookmark` b\n" +
    "  join`LessonCourse` lc on lc.`Id` = b.`LessonCourseId`\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where b.`UserId` = <%= userId %> and c.`URL` = '<%= courseUrl %>' and l.`URL` = '<%= lessonUrl %>'";

const DEL_LESSON_BKM_ID_MYSQL =
    "delete b from`Bookmark` b\n" +
    "  join`LessonCourse` lc on lc.`Id` = b.`LessonCourseId`\n" +
    "  join`Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where b.`UserId` = <%= userId %> and c.`Id` = '<%= courseId %>' and l.`Id` = '<%= lessonId %>'";

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

const GET_SHORT_BKM_MYSQL_APP =
    "select c.`Id` as `CourseId`, NULL as `LessonId` from `Bookmark` b\n" +
    "  join`Course` c on c.`Id` = b.`CourseId`\n" +
    "where b.`UserId` = <%= userId %>\n" +
    "union\n" +
    "select NULL as `CourseId`, lc.`LessonId` from`Bookmark` b\n" +
    "  join`LessonCourse` lc on lc.`Id` = b.`LessonCourseId`\n" +
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
    "select c.`Id`, pc.`Counter`, c.`IsPaid`, c.`IsSubsFree`, c.`ProductId`, c.`OneLesson`, c.`Cover`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId, c.`CourseType`,\n" +
    "  c.`CoverMeta`, c.`Mask`, c.`URL`, cl.`Name`\n" +
    "from `Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= user_id %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= user_id %>) and (gc.`CourseId` = c.`Id`)\n" +
    "where c.`Id` in (<%= courseIds %>)";

const GET_PAID_COURSES_MYSQL =
    "select `CourseId` as `Id`, `TimeCr` from `UserPaidCourse`\n" +
    "where `UserId` = <%= userId %>\n" +
    "union all\n" +
    "select `CourseId` as `Id`, `TimeCr` from `UserGiftCourse`\n" +
    "where `UserId` = <%= userId %>\n" +
    "order by 2 desc";

const GET_GIFT_COURSES_MYSQL =
    "select`Id` from `Course`\n" +
    "where (`PaidTp` = 2) and (`PaidRegDate` > '<%= dt %>')\n" +
    "order by `PaidRegDate` desc";    
    
    // "select t.`Id`, min(t.dt) dt\n" +
    // "from (select `Id`, `PaidRegDate` as dt from `Course`\n" +
    // "where (`PaidTp` = 2) and (`PaidRegDate` > '<%= dt %>')\n" +
    // "union all\n" +
    // "select `CourseId`, `TimeCr` from `UserGiftCourse`\n" +
    // "where `UserId` = <%= userId %>) as t\n" +
    // "group by t.`Id`\n" +
    // "order by 2 desc";

const GET_AUTHORS_BY_COURSE_IDS_MYSQL =
    "select a.`Id`, ac.`CourseId`, a.`Portrait`, a.`PortraitMeta`, a.`URL`,\n" +
    "  al.`FirstName`, al.`LastName` from `Author` a\n" +
    "  join`AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "  join`AuthorToCourse` ac on ac.`AuthorId` = a.`Id`\n" +
    "where ac.`CourseId` in (<%= courseIds %>)";

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

const GET_NOT_SENT_TRANS_MSSQL =
    "select c.[Id] [TranId], ii.[Id] [ItemId], cc.[CourseId], al.[FirstName]+ ' ' + al.[LastName] [Author],\n" +
    "  ct.[Name] [Category], cl.[Name], ii.[Price], ii.[Qty], ii.[Qty] * ii.[Price] [Sum],\n" +
    "  ii.[Qty] * round(ii.[Price] * ii.[VATRate] / (100 + ii.[VATRate]), 2) [Tax], c.[PromoCode] [Coupon]\n" +
    "from [Cheque] c\n" +
    "  join [Invoice] i on i.[Id] = c.[InvoiceId]\n" +
    "  join [InvoiceItem] ii on ii.[InvoiceId] = i.[Id]\n" +
    "  join [Product] p on p.[Id] = ii.[ProductId]\n" +
    "  join [Course] cr on cr.[ProductId] = p.[Id]\n" +
    "  join [CourseLng] cl on cl.[CourseId] = cr.[Id]\n" +
    "  join [CourseCategory] cc on cc.[CourseId] = cr.[Id]\n" +
    "  join [CategoryLng] ct on ct.[CategoryId] = cc.[CategoryId]\n" +
    "  join [AuthorToCourse] ac on ac.[CourseId] = cc.[CourseId]\n" +
    "  join [AuthorLng] al on ac.[AuthorId] = al.[AuthorId]\n" +
    "where (c.[PaymentType] = 1) and (c.[UserId] = <%= user_id %>) and (c.[StateId] = 4) and (c.[ChequeTypeId] = 1) and (c.[SendStatus] = 0)\n" +
    "union all\n" +
    "select c.[Id] [TranId], ii.[Id] [ItemId], cc.[CourseId], al.[FirstName] + ' ' + al.[LastName] [Author],\n" +
    "  ct.[Name] [Category], cl.[Name], ii.[Price], ii.[Qty], ii.[Qty] * ii.[Price] [Sum],\n" +
    "  ii.[Qty] * round(ii.[Price] * ii.[VATRate] / (100 + ii.[VATRate]), 2) [Tax], c.[PromoCode] [Coupon]\n" +
    "from [PromoCode] pc\n" +
    "  join [InvoiceItem] ii on ii.[ProductId] = pc.[PromoProductId]\n" +
    "  join [Invoice] i on i.[Id] = ii.[InvoiceId]\n" +
    "  join [Cheque] c on c.[InvoiceId] = i.[Id]\n" +
    "  join [PromoCodeProduct] pcp on pcp.[PromoCodeId] = pc.[Id]\n" +
    "  join [Product] p on p.[Id] = pcp.[ProductId]\n" +
    "  join [Course] cr on cr.[ProductId] = p.[Id]\n" +
    "  join [CourseLng] cl on cl.[CourseId] = cr.[Id]\n" +
    "  join [CourseCategory] cc on cc.[CourseId] = cr.[Id]\n" +
    "  join [CategoryLng] ct on ct.[CategoryId] = cc.[CategoryId]\n" +
    "  join [AuthorToCourse] ac on ac.[CourseId] = cc.[CourseId]\n" +
    "  join [AuthorLng] al on ac.[AuthorId] = al.[AuthorId]\n" +
    "where (c.[PaymentType] = 1) and (c.[UserId] = <%= user_id %>) and (c.[StateId] = 4) and (c.[ChequeTypeId] = 1) and (c.[SendStatus] = 0)\n" +
    "order by 1, 2";

const GET_SHORT_NOT_SENT_TRANS_MSSQL =
    "select c.[Id] from [Cheque] c\n" +
    "where (c.[PaymentType] = 1) and (c.[UserId] = <%= user_id %>) and (c.[StateId] = 4) and (c.[ChequeTypeId] = 1) and (c.[SendStatus] = 0)";

const SET_TRAN_SEND_STATUS_MSSQL =
    "update [Cheque] set [SendStatus] = 1, [SendStatusChangedAt] = GETDATE()\n" +
    "where ([Id] = <%= tran_id %>) and ([StateId] = 4) and ([SendStatus] = 0)";

const GET_NOT_SENT_TRANS_MYSQL =
    "select c.`Id` `TranId`, ii.`Id` `ItemId`, cc.`CourseId`, concat(al.`FirstName`, ' ', al.`LastName`) `Author`,\n" +
    "  ct.`Name` `Category`, cl.`Name`, ii.`Price`, ii.`Qty`, ii.`Qty` * ii.`Price` `Sum`,\n" +
    "  ii.`Qty` * round(ii.`Price` * ii.`VATRate` / (100 + ii.`VATRate`), 2) `Tax`, c.`PromoCode` `Coupon`\n" +
    "from `Cheque` c\n" +
    "  join `Invoice` i on i.`Id` = c.`InvoiceId`\n" +
    "  join `InvoiceItem` ii on ii.`InvoiceId` = i.`Id`\n" +
    "  join `Product` p on p.`Id` = ii.`ProductId`\n" +
    "  join `Course` cr on cr.`ProductId` = p.`Id`\n" +
    "  join `CourseLng` cl on cl.`CourseId` = cr.`Id`\n" +
    "  join `CourseCategory` cc on cc.`CourseId` = cr.`Id`\n" +
    "  join `CategoryLng` ct on ct.`CategoryId` = cc.`CategoryId`\n" +
    "  join `AuthorToCourse` ac on ac.`CourseId` = cc.`CourseId`\n" +
    "  join `AuthorLng` al on ac.`AuthorId` = al.`AuthorId`\n" +
    "where (c.`PaymentType` = 1) and (c.`UserId` = <%= user_id %>) and (c.`StateId` = 4) and (c.`ChequeTypeId` = 1) and (c.`SendStatus` = 0)\n" +
    "union all\n" +
    "select c.`Id` `TranId`, ii.`Id` `ItemId`, cc.`CourseId`, concat(al.`FirstName`, ' ', al.`LastName`) `Author`,\n" +
    "  ct.`Name` `Category`, cl.`Name`, ii.`Price`, ii.`Qty`, ii.`Qty` * ii.`Price` `Sum`,\n" +
    "  ii.`Qty` * round(ii.`Price` * ii.`VATRate` / (100 + ii.`VATRate`), 2) `Tax`, c.`PromoCode` `Coupon`\n" +
    "from `PromoCode` pc\n" +
    "  join `InvoiceItem` ii on ii.`ProductId` = pc.`PromoProductId`\n" +
    "  join `Invoice` i on i.`Id` = ii.`InvoiceId`\n" +
    "  join `Cheque` c on c.`InvoiceId` = i.`Id`\n" +
    "  join `PromoCodeProduct` pcp on pcp.`PromoCodeId` = pc.`Id`\n" +
    "  join `Product` p on p.`Id` = pcp.`ProductId`\n" +
    "  join `Course` cr on cr.`ProductId` = p.`Id`\n" +
    "  join `CourseLng` cl on cl.`CourseId` = cr.`Id`\n" +
    "  join `CourseCategory` cc on cc.`CourseId` = cr.`Id`\n" +
    "  join `CategoryLng` ct on ct.`CategoryId` = cc.`CategoryId`\n" +
    "  join `AuthorToCourse` ac on ac.`CourseId` = cc.`CourseId`\n" +
    "  join `AuthorLng` al on ac.`AuthorId` = al.`AuthorId`\n" +
    "where (c.`PaymentType` = 1) and (c.`UserId` = <%= user_id %>) and (c.`StateId` = 4) and (c.`ChequeTypeId` = 1) and (c.`SendStatus` = 0)\n" +
    "order by 1, 2";

const GET_SHORT_NOT_SENT_TRANS_MYSQL =
    "select c.`Id` from `Cheque` c\n" +
    "where (c.`PaymentType` = 1) and (c.`UserId` = <%= user_id %>) and (c.`StateId` = 4) and (c.`ChequeTypeId` = 1) and (c.`SendStatus` = 0)";

const SET_TRAN_SEND_STATUS_MYSQL =
    "update `Cheque` set `SendStatus` = 1, `SendStatusChangedAt` = NOW()\n" +
    "where (`Id` = <%= tran_id %>) and (`StateId` = 4) and (`SendStatus` = 0)";

const GET_COURSES_FOR_SALE_MSSQL =
    "select distinct c.[Id]\n" +
    "from [Discount] d\n" +
    "  join [Product] p on p.[Id] = d.[ProductId]\n" +
    "  join [Course] c on c.[ProductId] = p.[Id]\n" +
    "where (c.[State] = 'P') and (d.[FirstDate] <= convert(datetime, '<%= dt %>'))\n" +
    "  and ((d.[LastDate] > convert(datetime, '<%= dt %>')) or (d.[LastDate] is NULL))\n" +
    "  and (d.[UserId] is NULL) and ((d.[DiscountTypeId] = 2)<%= where_dyn %>)";
const WHERE_DYN_MSSQL = "\n  or ((d.[DiscountTypeId] = 3) and (<%= code_dyn %>))";
const COND_DYN_CODE_MSSQL = "((d.[Code] = '<%= code %>')<%= id_dyn %>)";
const COND_DYN_ID_MSSQL = " and (c.[Id] = '<%= id %>')";
    
const GET_COURSES_FOR_SALE_MYSQL =
    "select distinct c.`Id`\n" +
    "from `Discount` d\n" +
    "  join `Product` p on p.`Id` = d.`ProductId`\n" +
    "  join `Course` c on c.`ProductId` = p.`Id`\n" +
    "where (c.`State` = 'P') and (d.`FirstDate` <= '<%= dt %>')\n" +
    "  and ((d.`LastDate` > '<%= dt %>') or (d.`LastDate` is NULL))\n" +
    "  and (d.`UserId` is NULL) and ((d.`DiscountTypeId` = 2)<%= where_dyn %>)";
const WHERE_DYN_MYSQL = "\n  or ((d.`DiscountTypeId` = 3) and (<%= code_dyn %>))";
const COND_DYN_CODE_MYSQL = "((d.`Code` = '<%= code %>')<%= id_dyn %>)";
const COND_DYN_ID_MYSQL = " and (c.`Id` = '<%= id %>')";

const GET_USER_LIST_MSSQL =
    "select TOP <%= limit %> s.[Id], s.[Login], u.[Email], u.[DisplayName], u.[PData]\n" +
    "from [SysUser] s\n" +
    "  join [User] u on u.[SysParentId] = s.[Id]\n" +
    "  join [UserRole] ur on ur.[UserId] = s.[Id]\n" +
    "  join [Role] r on r.[Id] = ur.[RoleId]";

const GET_USER_LIST_MYSQL =
    "select s.`Id`, s.`Login`, u.`Email`, u.`DisplayName`, u.`PData`\n" +
    "from `SysUser` s\n" +
    "  join `User` u on u.`SysParentId` = s.`Id`\n" +
    "  join `UserRole` ur on ur.`UserId` = s.`Id`\n" +
    "  join `Role` r on r.`Id` = ur.`RoleId`";

const MAX_LESSONS_REQ_NUM = 15;
const MAX_COURSES_REQ_NUM = 10;
const CACHE_PREFIX = "user:";
const LOCK_TIMEOUT_SEC = 60 * 5; // 5 min

const DFLT_STAT_OPTIONS = {
    serverTimeout: 60 * 9, // 9 min
};
const DFLT_SRC_LIST = ["fb", "vk", "ya", "gl", "cq", "mt"];

const DbUser = class DbUser extends DbObject {

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = CACHE_PREFIX;
        super(opts);
        this._usersCache = UsersCache();
        this._coursesService = CoursesService();
        this._productService = ProductService();
        this._stat_settings = _.defaultsDeep(config.statistics ? config.get('statistics') : {}, DFLT_STAT_OPTIONS);
        if (typeof (this._stat_settings.srcList) === "undefined")
            this._stat_settings.srcList = DFLT_SRC_LIST;
        this._stat_settings.serverTimeoutMs = this._stat_settings.serverTimeout * 1000;
        this._srcList = {};
        for (let i = 0; i < this._stat_settings.srcList.length; i++)
            this._srcList[this._stat_settings.srcList[i]] = true;
    }

    _getTranLockKey(userId) {
        return `tranlock:${userId}`;
    }

    _getTranStateKey(tranId) {
        return `transtate:${tranId}`;
    }

    async _checkAndSetTranSent(tran, userId) {
        let rc = false;
        let done_cnt = 0;
        if (tran["_sys"]) {
            for (let j = 0; j < this._stat_settings.srcList.length; j++) {
                let curr_src = this._stat_settings.srcList[j];
                if (tran[curr_src + "_done"])
                    done_cnt++;
            }
            if ((!tran["_sys"]) || (done_cnt === this._stat_settings.srcList.length)) {
                await $data.execSql({
                    dialect: {
                        mysql: _.template(SET_TRAN_SEND_STATUS_MYSQL)({ tran_id: tran["_sys"].id }),
                        mssql: _.template(SET_TRAN_SEND_STATUS_MSSQL)({ tran_id: tran["_sys"].id })
                    }
                }, {});
                await this.cacheDel(this._getTranStateKey(tran["_sys"].id));
                await this.cacheDel(this._getTranLockKey(userId));
                rc = true;
            }
        }
        return rc;
    }

    async _LogTranStat(id, tp, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        
        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, { expr: { model: { name: "ChequeStatLog" } } }, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = { ChequeId: id, RecType: tp, Data: JSON.stringify(data) };
                    await root_obj.newObject({ fields: fields }, dbOpts);

                    await root_obj.save(dbOpts);
                })
        }, memDbOptions);
    }

    async getNotSentTrans(userId, bySrc) {
        let trans = [];
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_SHORT_NOT_SENT_TRANS_MYSQL)({ user_id: userId }),
                mssql: _.template(GET_SHORT_NOT_SENT_TRANS_MSSQL)({ user_id: userId })
            }
        }, {});
        if (result && result.detail && (result.detail.length > 0)) {
            let key = this._getTranLockKey(userId);
            let lockRes = await this.cacheSet(key, "1", {
                ttlInSec: LOCK_TIMEOUT_SEC,
                nx: true
            });
            if (lockRes === "OK") {
                result = await $data.execSql({
                    dialect: {
                        mysql: _.template(GET_NOT_SENT_TRANS_MYSQL)({ user_id: userId }),
                        mssql: _.template(GET_NOT_SENT_TRANS_MSSQL)({ user_id: userId })
                    }
                }, {});
            
                if (result && result.detail && (result.detail.length > 0)) {
                    let currTranId = -1;
                    let cuttItemId = -1;
                    let currTran = null;
                    for (let i = 0; i < result.detail.length; i++) {
                        let elem = result.detail[i];
                        if (elem.TranId !== currTranId) {
                            currTran = null;
                            let src = [];
                            if (bySrc) {
                                let tstate_key = this._getTranStateKey(elem.TranId);
                                let lastDate = (new Date()) - 0;
                                let tran = await this.cacheHgetAll(tstate_key, { json: true });
                                if (!tran) {
                                    await this.cacheHset(tstate_key, "_sys", {
                                        id: elem.TranId,
                                        crDate: lastDate,
                                        lastDate: lastDate
                                    }, { json: true });
                                    for (let j = 0; j < this._stat_settings.srcList.length; j++){
                                        let curr_src = this._stat_settings.srcList[j];
                                        await this.cacheHset(tstate_key, curr_src, {
                                            lastDate: lastDate,
                                            cnt: 1,
                                        }, { json: true });
                                        src.push(curr_src);
                                    }
                                }
                                else {
                                    let is_already_sent = await this._checkAndSetTranSent(tran, userId);
                                    if (!is_already_sent) {
                                        if ((lastDate - tran["_sys"].lastDate) > this._stat_settings.serverTimeoutMs) {
                                            await this.cacheHset(tstate_key, "_sys", {
                                                id: tran["_sys"].id,
                                                crDate: tran["_sys"].crDate,
                                                lastDate: lastDate
                                            }, { json: true });
                                            for (let j = 0; j < this._stat_settings.srcList.length; j++) {
                                                let curr_src = this._stat_settings.srcList[j];
                                                let prev_data = tran[curr_src];
                                                if (prev_data && (!tran[curr_src + "_done"])) {
                                                    await this.cacheHset(tstate_key, curr_src,
                                                        {
                                                            lastDate: lastDate,
                                                            cnt: ++prev_data.cnt,
                                                        }, { json: true });
                                                    src.push(curr_src);
                                                }
                                            }
                                        }
                                        // else
                                        //     trans.push({ id: elem.TranId, waitFor: (lastDate - tran["_sys"].lastDate) });
                                    }
                                }
                            }
                            if ((!bySrc) || (bySrc && (src.length > 0))) {
                                currTran = { id: elem.TranId, currencyCode: "RUB", revenue: 0, tax: 0, coupon: elem.Coupon, products: [] };
                                if (src.length > 0)
                                    currTran.call_payment = src;
                                trans.push(currTran);
                            }
                            currTranId = elem.TranId;
                        }
                        if (currTran && (cuttItemId !== elem.ItemId)) {
                            let currItem = {
                                id: elem.CourseId,
                                name: elem.Name,
                                price: elem.Price,
                                brand: elem.Author,
                                category: elem.Category,
                                quantity: elem.Qty
                            };
                            currTran.products.push(currItem);
                            currTran.revenue += elem.Sum;
                            currTran.tax += elem.Tax;
                            cuttItemId = elem.ItemId;
                        }
                    }
                }

                if (bySrc) {
                    for (let i = 0; i < trans.length; i++) {
                        let tran = trans[i];
                        await this._LogTranStat(tran.id, 1, tran, { dbOptions: { userId: userId } });
                    }
                    await this.cacheDel(key);
                }
                else
                    if (trans.length === 0)
                        await this.cacheDel(key);
            }
        }
        return trans;
    }

    async markTransSrcAsSent(userId, data, options) {
        let opts = options || {};
        let trans = data || {};

        if (!trans.id)
            throw new HttpError(HttpCode.ERR_BAD_REQ, `Arg "id" is invalid or missig ("${trans.id}").`);
        let id = +trans.id;

        await this._LogTranStat(id, 2, trans, { dbOptions: { userId: userId } });

        if (!this._srcList[trans.src])
            throw new HttpError(HttpCode.ERR_BAD_REQ, `Arg "src" is invalid or missig ("${trans.src}").`);

        let tstate_key = this._getTranStateKey(id);
        await this.cacheHset(tstate_key, trans.src + "_done", { ts: (new Date()) - 0 }, { json: true });

        let tran = await this.cacheHgetAll(tstate_key, { json: true });
        if (tran["_sys"])
            await this._checkAndSetTranSent(tran, userId)
        else
            await this.cacheDel(tstate_key);

        return { result: "OK" };
    }

    async markTransAsSent(userId, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let trans = data || {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjects({ expr: { model: { name: "Cheque" } } },
                    [
                        { field: "UserId", op: "=", value: userId },
                        { field: "StateId", op: "=", value: 4 },
                        { field: "ChequeTypeId", op: "=", value: 1 },
                        { field: "SendStatus", op: "=", value: 0 }
                    ], dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let col = root_obj.getCol("DataElements");
                    let chequeList = {};
                    for (let i = 0; i < col.count(); i++){
                        let obj = col.get(i);
                        chequeList[obj.id()] = obj;
                    }
                    for (let i = 0; i < trans.length; i++){
                        let obj = chequeList[trans[i]];
                        if (obj) {
                            obj.sendStatus(1);
                            obj.sendStatusChangedAt(new Date());
                        }
                    }
                    
                    await root_obj.save(dbOpts);
                    await this.cacheDel(this._getTranLockKey(userId));
                    return { result: "OK" };
                })
        }, memDbOptions);
    }

    async getUserList(user, options) {
        const DEFAULT_LIMIT = 50;

        let result = [];
        let opts = _.cloneDeep(options || {});
        if (!(user && user.Id))
            throw new HttpError(HttpCode.ERR_BAD_REQ, "Missing user argument.");
        let dbOpts = _.defaultsDeep({ userId: user.Id }, opts.dbOptions || {});
        
        let permissions = AccessFlags.Administrator | AccessFlags.PmAdmin | AccessFlags.PmSupervisor | AccessFlags.PmElemManager;
        if(AccessRights.checkPermissions(user, permissions) === 0)
            throw new HttpError(HttpCode.ERR_FORBIDDEN, "User is not permitted to request this data.");

        let limit = opts.limit ? +opts.limit : DEFAULT_LIMIT;
        let sql_mysql = GET_USER_LIST_MYSQL;
        let sql_mssql = _.template(GET_USER_LIST_MSSQL)({ limit: limit });

        let mssql_conds = [];
        let mysql_conds = [];

        if (opts.email) {
            mssql_conds.push(`(u.[Email] like N'%${opts.email}%')`);
            mysql_conds.push(`(u.${'`'}Email${'`'} like '%${opts.email}%')`);
        }
        if (opts.name) {
            mssql_conds.push(`(u.[DisplayName] like N'%${opts.name}%')`);
            mysql_conds.push(`(u.${'`'}DisplayName${'`'} like '%${opts.name}%')`);
        }
        if (opts.role) {
            let roles = Array.isArray(opts.role) ? opts.role : opts.role.split(',');
            for (let i = 0; i < roles.length; i++)
                roles[i] = `'${roles[i]}'`;
            mssql_conds.push(`(r.[ShortCode] in (${roles.join(',')}))`);
            mysql_conds.push(`(r.${'`'}ShortCode${'`'} in (${roles.join(',')}))`);
        }

        if (mysql_conds.length > 0) {
            sql_mysql += `\nWHERE ${mysql_conds.join("\n  AND")}`;
            sql_mssql += `\nWHERE ${mssql_conds.join("\n  AND")}`;
        }

        if (opts.order) {
            let ord_arr = opts.order.split(',');
            let dir = ord_arr.length > 1 && (ord_arr[1].toUpperCase() === "DESC") ? "DESC" : "ASC";
            let mysql_field;
            let mssql_field;
            switch (ord_arr[0]) {
                case "Id":
                    mssql_field = "s.[Id]";
                    mysql_field = "s.`Id`";
                    break;
                case "DisplayName":
                    mssql_field = "u.[DisplayName]";
                    mysql_field = "u.`DisplayName`";
                    break;
                case "Email":
                    mssql_field = "u.[Email]";
                    mysql_field = "u.`Email`";
                    break;
                case "Role":
                    mssql_field = "r.[Name]";
                    mysql_field = "r.`Name`";
                    break;
            }
            if (mysql_field) {
                sql_mysql += `\nORDER BY ${mysql_field} ${dir}`;
                sql_mssql += `\nORDER BY ${mssql_field} ${dir}`;
            }
        }

        sql_mysql = `${sql_mysql}\nlimit ${limit}`;

        let records = await $data.execSql({
            dialect: {
                mysql: _.template(sql_mysql)(),
                mssql: _.template(sql_mssql)()
            }
        }, dbOpts)
        if (records && records.detail && (records.detail.length > 0)) {
            let user_ids = {};
            records.detail.forEach(elem => {
                if (!user_ids[elem.Id]) {
                    user_ids[elem.Id] = 1;
                    result.push({
                        Id: elem.Id,
                        Email: elem.Email,
                        DisplayName: elem.DisplayName,
                        PData: JSON.parse(elem.PData)
                    });
                }
            })
        }
        return result;
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
                        SubsAutoPayId: row.SubsAutoPayId,
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

    async getCoursesForSale(user, options) {
        let result = {};
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;

        let dt = new Date(Math.round(((new Date()) - 0) / 1000) * 1000); // round ms
        let dt_str = this._dateToString(dt, true, false);
        let where_dyn_mssql = '';
        let where_dyn_mysql = '';
        let dyn_codes = {};
        if (opts.Codes) {
            let arr = [];
            if (typeof (opts.Codes) === "string") {
                arr = opts.Codes.split(",");
            }
            else {
                if (!Array.isArray(opts.Codes))
                    throw new Error(`Invalid parameter "Codes": ${JSON.stringify(opts.Codes)}.`);
                arr = opts.Codes;
            }
            if (arr.length === 0)
                throw new Error(`Parameter "Codes" is empty.`);
            let order = 0;
            let cond_mssql;
            let cond_mysql;
            arr.forEach(element => {
                let arr_code = element.split(':');
                let code = arr_code[0];
                let key = code;
                let id = null;
                let code_elem = { order: ++order };
                if (arr_code.length > 1) {
                    id = parseInt(arr_code[1]);
                    id = isNaN(id) ? null : id;
                    if (id)
                        key += ":" + id;
                    if (arr_code.length > 2) {
                        let perc = parseFloat(arr_code[2]);
                        if (!isNaN(perc))
                            code_elem.perc = perc;
                    }
                }
                dyn_codes[key] = code_elem;
                if (order > 1) {
                    cond_mssql += "\n  or ";
                    cond_mysql += "\n  or ";
                }
                else {
                    cond_mssql = "";
                    cond_mysql = "";
                }
                let cond_id_mssql = "";
                let cond_id_mysql = "";
                if (id) {
                    cond_id_mssql = _.template(COND_DYN_ID_MSSQL)({ id: id });
                    cond_id_mysql = _.template(COND_DYN_ID_MYSQL)({ id: id });
                }
                cond_mssql += _.template(COND_DYN_CODE_MSSQL)({ code: code, id_dyn: cond_id_mssql });
                cond_mysql += _.template(COND_DYN_CODE_MYSQL)({ code: code, id_dyn: cond_id_mysql });
            });
            where_dyn_mysql = _.template(WHERE_DYN_MYSQL)({ code_dyn: cond_mysql });
            where_dyn_mssql = _.template(WHERE_DYN_MSSQL)({ code_dyn: cond_mssql });
        }

        let res = await $data.execSql({
            dialect: {
                mysql: _.template(GET_COURSES_FOR_SALE_MYSQL)({ dt: dt_str, where_dyn: where_dyn_mysql }),
                mssql: _.template(GET_COURSES_FOR_SALE_MSSQL)({ dt: dt_str, where_dyn: where_dyn_mssql })
            }
        }, {});
        let course_ids = [];
        if (res && res.detail && (res.detail.length > 0)) {
            res.detail.forEach(elem => {
                course_ids.push(elem.Id);
            })
        }

        if (course_ids.length > 0) {
            let arrayOfIds = splitArray(course_ids, MAX_COURSES_REQ_NUM);
            let { Courses: courses } = await this._getCoursesByIds(user,
                { Courses: [] }, arrayOfIds, isAbsPath, dLink, null, { alwaysShowDiscount: false });
            let other = [];
            let dynamic = [];
            for (let i = 0; i < courses.length; i++){
                let course = courses[i];
                let has_discount = course.Discount && ((dt - course.Discount.FirstDate) >= 0)
                    && (((dt - course.Discount.LastDate) < 0) || (!course.Discount.LastDate)) ? true : false;
                if (!has_discount)
                    delete course.Discount;
                let curr_perc = has_discount ? course.Discount.Perc : 0;
                let has_dyn_discount = false;
                if (course.DynDiscounts) {
                    let keys = Object.keys(course.DynDiscounts);
                    let curr_dyn_code = null;
                    for (let j = 0; j < keys.length; j++) {
                        let code = keys[j];
                        let key_dyn_id = `${code}:${course.Id}`;
                        let dsc_elem = dyn_codes[key_dyn_id] ? dyn_codes[key_dyn_id] : dyn_codes[code];
                        if (dsc_elem) {
                            let discount = course.DynDiscounts[code];
                            let perc = dsc_elem.perc ? dsc_elem.perc : discount.Perc;
                            let recalcDPrice = perc !== discount.Perc ? true : false;
                            if (perc > curr_perc) {
                                if (curr_dyn_code)
                                    delete course.DynDiscounts[curr_dyn_code]
                                else {
                                    delete course.Discount;
                                    has_discount = false;
                                }
                                curr_dyn_code = code;
                                curr_perc = perc;
                                has_dyn_discount = true;
                                if (recalcDPrice) {
                                    discount.Perc = perc;
                                    discount.DPrice = this._productService.calcDPrice(course.Price, perc, true);
                                }
                                course.DPrice = discount.DPrice;
                            }
                            else
                                delete course.DynDiscounts[code];
                        }
                        else
                            delete course.DynDiscounts[code];
                    }
                }
                if (has_discount)
                    other.push(course)
                else
                    if (has_dyn_discount)
                        dynamic.push(course);
            }
            if (dynamic.length > 0) {
                dynamic.sort((a, b) => {
                    let result = 0;
                    let keys_a = Object.keys(a.DynDiscounts);
                    let keys_b = Object.keys(b.DynDiscounts);
                    if ((keys_a.length === 1) && (keys_b.length === 1)) {
                        let key_id_a = `${keys_a[0]}:${a.Id}`;
                        let key_id_b = `${keys_b[0]}:${b.Id}`;
                        let order_a = dyn_codes[key_id_a] ? dyn_codes[key_id_a] : dyn_codes[keys_a[0]];
                        let order_b = dyn_codes[key_id_b] ? dyn_codes[key_id_b] : dyn_codes[keys_b[0]];
                        if (order_a && order_b)
                            result = order_a.order - order_b.order;
                    }
                    return result;
                })
                result.Dynamic = dynamic;
            }
            if (other.length > 0) {
                other.sort((a, b) => {
                    let result = 0;
                    if (a.Discount.LastDate && b.Discount.LastDate)
                        result = a.Discount.LastDate - b.Discount.LastDate
                    else
                        if (a.Discount.LastDate)
                            result = -1
                        else
                            if (b.Discount.LastDate)
                                result = 1;
                    return result;
                })
                result.Other = other;
            }
        }
        return result;
    }

    getHistory(user, lessonFilter, options) {
        let positions = {};
        let lessonIds = [];
        let history = { Lessons: [], Courses: {}, Authors: {}, Categories: {} };
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;
        let pendingCourses = {};
        let id = user.Id;
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest);

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
                                mysql: _.template(GET_HISTORY_MYSQL)({ lessonIds: elem.join(), user_id: id ? id : 0 }),
                                mssql: _.template(GET_HISTORY_MSSQL)({ lessonIds: elem.join(), user_id: id ? id : 0 })
                            }
                        }, {})
                            .then(async (result) => {
                                if (result && result.detail && (result.detail.length > 0)) {
                                    if (id) {
                                        let paymentService = this.getService("payments", true);
                                        if (paymentService)
                                            pendingCourses = await paymentService.getPendingObjects(id);
                                    }
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
                                                Cover: this._convertDataUrl(elem.Cover, isAbsPath, dLink),
                                                CoverMeta: this._convertMeta(elem.CoverMeta, isAbsPath, dLink),
                                                Mask: elem.Mask,
                                                Color: elem.Color,
                                                Name: elem.Name,
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
                                                URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                                                OneLesson: elem.OneLesson ? true : false,
                                                Categories: []
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
                                                ContentType: elem.ContentType,
                                                Cover: this._convertDataUrl(elem.LCover, isAbsPath, dLink),
                                                CoverMeta: this._convertMeta(elem.LCoverMeta, isAbsPath, dLink),
                                                URL: isAbsPath ? this._baseUrl + '/' + elem.URL + '/' + elem.LURL : elem.LURL,
                                                IsAuthRequired: elem.IsAuthRequired ? true : false,
                                                IsSubsRequired: elem.IsSubsRequired ? true : false,
                                                IsFreeInPaidCourse: elem.IsFreeInPaidCourse ? true : false,
                                                Name: elem.LName,
                                                Duration: elem.Duration,
                                                DurationFmt: elem.DurationFmt,
                                                AuthorId: elem.AuthorId,
                                                Audios: [],
                                                Videos: []
                                            };
                                            if (lsn.IsSubsRequired && elem.FreeExpDate && ((now - elem.FreeExpDate) > Intervals.MIN_FREE_LESSON))
                                                lsn.FreeExpDate = elem.FreeExpDate;
                                            let author = history.Authors[elem.AuthorId];
                                            if (!author) {
                                                author = {
                                                    Id: elem.AuthorId,
                                                    FirstName: elem.FirstName,
                                                    LastName: elem.LastName,
                                                    URL: isAbsPath ? this._absAuthorUrl + elem.AURL : elem.AURL
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
                                        if (elem.Audio && (elem.ContentType === EpisodeContentType.AUDIO))
                                            lsn.Audios.push(this._convertDataUrl(elem.Audio, isAbsPath, dLink));
                                        if (elem.VideoLink && (elem.ContentType === EpisodeContentType.VIDEO))
                                            lsn.Videos.push(elem.VideoLink);
                                    })
                                    let courseIds = [];
                                    let ctgService = this.getService("categories", true);
                                    if (ctgService) {
                                        for (let courseId in history.Courses)
                                            courseIds.push(+courseId);
                                        let cats = await ctgService.getCourseCategories(courseIds, isAbsPath);
                                        history.Categories = cats.Categories;
                                        for (let courseId in history.Courses) {
                                            let course = history.Courses[courseId];
                                            let cat_course = cats.Courses[courseId];
                                            if (cat_course)
                                                course.Categories = cat_course.Categories;
                                        }
                                    }
                                    if (Object.keys(history.Courses).length > 0) {
                                        await this._coursesService.getCoursesPrice(history.Courses);
                                    }
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

    async getUserInfo(options) {
        let opts = options || {};
        let user;
        if (opts.id) {
            user = await this._usersCache.getUserInfoById(+opts.id);
            if (!user)
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `User [id] = ${opts.id} not found.`);
        }
        else
            if (opts.email) {
                let condition = { field: "Email", op: "=", value: opts.email }
                user = await this._usersCache.getUserInfo(condition, false);
                if (!user)
                    throw new HttpError(HttpCode.ERR_NOT_FOUND, `User [email] = "${opts.email}" not found.`);
            }
            else
                throw new HttpError(HttpCode.ERR_BAD_REQ, `Invalid or missig parameters: ${JSON.stringify(opts)}.`);
        return user;
    }

    async getPaidCourses(user_or_id, isDetailed, options) {
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;
        let userId = user_or_id;
        let user;
        if (typeof (user_or_id) !== "number") {
            userId = user_or_id.Id;
            user = user_or_id;
        }

        let getPaid = (opts.paid === true) || (opts.paid === "true") ? true : false;
        let getGift = (opts.gift === true) || (opts.gift === "true") ? true : false;
        if (!(getPaid || getGift))
            getPaid = true;

        let courseIds = [];
        let courseList = {};
        let courseBoookmarkOrder = {};
        let i = 0;
        for (let n = 0; n < 2; n++) {
            let dialect;
            switch (n) {
                case 0:
                    if (!getPaid)
                        continue;
                    dialect = {
                        mysql: _.template(GET_PAID_COURSES_MYSQL)({ userId: userId }),
                        mssql: _.template(GET_PAID_COURSES_MSSQL)({ userId: userId })
                    }
                    break;
                case 1:
                    if (!getGift)
                        continue;
                    if (!user)
                        user = await this._usersCache.getUserInfoById(user_or_id);
                    let dt = this._dateToString(user.RegDate, true);
                    dialect = {
                        mysql: _.template(GET_GIFT_COURSES_MYSQL)({ userId: userId, dt: dt }),
                        mssql: _.template(GET_GIFT_COURSES_MSSQL)({ userId: userId, dt: dt })
                    }
                    break;
                default:
                    throw new Error(`DbUser::getPaidCourses: Invalid "n" value: ${n}.`);
            }
            let data = await $data.execSql({
                dialect: dialect
            }, {});
            if (data && data.detail && (data.detail.length > 0)) {
                data.detail.forEach(elem => {
                    if (!courseList[elem.Id]) {
                        courseIds.push(elem.Id);
                        courseList[elem.Id] = true;
                        courseBoookmarkOrder[elem.Id] = ++i;
                    }
                })
            }
        }
        let result;
        if (isDetailed && (courseIds.length > 0)) {
            result = [];
            let arrayOfIds = splitArray(courseIds, MAX_COURSES_REQ_NUM);
            result = await this._getCoursesByIds(user ? user : user_or_id, { Authors: {}, Categories: {}, Courses: [] },
                arrayOfIds, isAbsPath, dLink, courseBoookmarkOrder);
        }
        else
            if (opts.is_list)
                result = courseList
            else
                result = courseIds;
        return result;
    }

    async _getCoursesByIds(user_or_id, data, arrayOfIds, isAbsPath, dLink, courseBoookmarkOrder, options) {
        let opts = _.cloneDeep(options || {});
        let courseList = {};
        let pendingCourses = {};
        let user = user_or_id;
        let userId = user_or_id;
        if (typeof (user_or_id) === "number")
            user = await this._usersCache.getUserInfoById(user_or_id)
        else
            userId = user ? user.Id : 0;
        let show_paid = user && (AccessRights.checkPermissions(user, AccessFlags.Administrator) !== 0) ? true : false;
        show_paid = show_paid || (!isBillingTest);

        if (arrayOfIds.length > 0) {
            await Utils.seqExec(arrayOfIds, (elem) => {
                return $data.execSql({
                    dialect: {
                        mysql: _.template(GET_COURSES_BY_IDS_MYSQL)({ courseIds: elem.join(), user_id: userId ? userId : 0 }),
                        mssql: _.template(GET_COURSES_BY_IDS_MSSQL)({ courseIds: elem.join(), user_id: userId ? userId : 0 })
                    }
                }, {})
                    .then(async (result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            if (userId) {
                                let paymentService = this.getService("payments", true);
                                if (paymentService)
                                    pendingCourses = await paymentService.getPendingObjects(userId);
                            }
                            let now = new Date();
                            result.detail.forEach((elem) => {
                                let course = {
                                    Id: elem.Id,
                                    Name: elem.Name,
                                    CourseType: elem.CourseType,
                                    URL: isAbsPath ? this._absCourseUrl + elem.URL : elem.URL,
                                    Cover: this._convertDataUrl(elem.Cover, isAbsPath, dLink),
                                    CoverMeta: this._convertMeta(elem.CoverMeta, isAbsPath, dLink),
                                    Mask: elem.Mask,
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
                                    Authors: [],
                                    Categories: []
                                };
                                if (courseBoookmarkOrder)
                                    course.Order = courseBoookmarkOrder[elem.Id];
                                data.Courses.push(course);
                                courseList[elem.Id] = course;
                            })
                            if (data.Courses.length > 0) {
                                let withCheckProd = opts.withCheckProd ? opts.withCheckProd : false;
                                let alwaysShowDiscount = opts.alwaysShowDiscount ? opts.alwaysShowDiscount : false;
                                await this._coursesService.getCoursesPrice(data.Courses, withCheckProd, alwaysShowDiscount);
                            }
                        }
                    })
            })
                .then(() => {
                    if (data.Authors)
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
                                            let author = data.Authors[elem.Id];
                                            if (!author) {
                                                author = {
                                                    Id: elem.Id,
                                                    URL: isAbsPath ? this._absAuthorUrl + elem.URL : elem.URL,
                                                    FirstName: elem.FirstName,
                                                    LastName: elem.LastName,
                                                    Portrait: this._convertDataUrl(elem.Portrait, isAbsPath, dLink),
                                                    PortraitMeta: this._convertMeta(elem.PortraitMeta, isAbsPath, dLink)
                                                };
                                                data.Authors[elem.Id] = author;
                                            }
                                            let course = courseList[elem.CourseId];
                                            if (course)
                                                course.Authors.push(author.Id);
                                        })
                                    }
                                })
                        });
                })
                .then(() => {
                    if (data.Categories)
                        return Utils.seqExec(arrayOfIds, (elem) => {
                            return this.getService("categories", true).reqCourseCategories(elem)
                                .then((result) => {
                                    if (result && result.detail && (result.detail.length > 0)) {
                                        result.detail.forEach((elem) => {
                                            let category = data.Categories[elem.Id];
                                            if (!category) {
                                                category = {
                                                    Id: elem.Id,
                                                    URL: isAbsPath ? this._absCategoryUrl + elem.URL : elem.URL,
                                                    Name: elem.Name
                                                };
                                                data.Categories[elem.Id] = category;
                                            }
                                            let course = courseList[elem.CourseId];
                                            if (course)
                                                course.Categories.push(category.Id);
                                        })
                                    }
                                })
                        });
                });
        }
        return data;
    }

    getExtBookmarks(user, options) {
        let courseIds = [];
        let courseList = {};
        let bookmarks = { Authors: {}, Categories: {}, LessonCourses: {}, Courses: [], Lessons: [] };
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;
        let arrayOfIds = [];
        let lessonBoookmarkOrder = {};
        let courseBoookmarkOrder = {};
        let userId = user.Id;

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

        return new Promise(resolve => {
            resolve(this.getHistory(user, getLessonIdsByBookmarks, opts))
        })
            .then((result) => {
                bookmarks.Authors = result.Authors;
                bookmarks.Categories = result.Categories;
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
            .then(async () => {
                arrayOfIds = splitArray(courseIds, MAX_COURSES_REQ_NUM);
                await this._getCoursesByIds(user, bookmarks, arrayOfIds, isAbsPath, dLink, courseBoookmarkOrder);
                return bookmarks;
            });
    }
    
    getShortBookmarks(userId, isApp) {
        let opts = {};
        return new Promise((resolve, reject) => {
            let dialect = isApp ?
                {
                    mysql: _.template(GET_SHORT_BKM_MYSQL_APP)({ userId: userId }),
                    mssql: _.template(GET_SHORT_BKM_MSSQL_APP)({ userId: userId })

                } :
                {
                    mysql: _.template(GET_SHORT_BKM_MYSQL)({ userId: userId }),
                    mssql: _.template(GET_SHORT_BKM_MSSQL)({ userId: userId })

                };
            resolve($data.execSql({ dialect: dialect }, {}));
        })
            .then((result) => {
                let res = isApp ? { courses: [], lessons: [] } : [];
                if (result && result.detail && (result.detail.length >0)) {
                    result.detail.forEach((elem) => {
                        if (isApp) {
                            if (elem.CourseId)
                                res.courses.push(elem.CourseId)
                            else
                                res.lessons.push(elem.LessonId);
                        }
                        else
                            res.push(elem.URL);
                    })
                }
                return res;
            });
    }
    
    convertToNumber(str) {
        let result = { isInt: false, val: str };
        result.isInt = (typeof (str) === "number");
        if (result.isInt && isNaN(str))
            throw new Error(`Invalid argument "str": ${str}.`);
        if (!result.isInt)
            if (typeof (str) === "string") {
                let res = str.match(/[0-9]*/);
                if (res && (str.length > 0) && (res[0].length === str.length)) {
                    result.val = parseInt(str);
                    result.isInt = true;
                }
            }
            else
                throw new Error(`Invalid argument "str": ${str}.`);
        return result;
    }

    insBookmark(userId, courseUrl, lessonUrl) {
        let isLessonBookmark = lessonUrl ? true : false;
        let opts = {};
        return new Promise((resolve, reject) => {
            let req = {};
            let rc;
            if (isLessonBookmark) {
                let { isInt, val } = this.convertToNumber(lessonUrl);
                let { isInt: isCourseInt, val: courseVal } = this.convertToNumber(courseUrl);
                if (isInt && isCourseInt)
                    req.dialect = {
                        mysql: _.template(GET_LESSON_COURSE_ID_BYID_MYSQL)({ courseId: courseVal, lessonId: val }),
                        mssql: _.template(GET_LESSON_COURSE_ID_BYID_MSSQL)({ courseId: courseVal, lessonId: val })
                    };
                else
                    req.dialect = {
                        mysql: _.template(GET_LESSON_COURSE_ID_MYSQL)({ courseUrl: courseUrl, lessonUrl: lessonUrl }),
                        mssql: _.template(GET_LESSON_COURSE_ID_MSSQL)({ courseUrl: courseUrl, lessonUrl: lessonUrl })
                    };
            }
            else {
                let { isInt, val } = this.convertToNumber(courseUrl);
                if (isInt)
                    rc = { detail: [{ Id: val }] }
                else
                    req.dialect = {
                        mysql: _.template(GET_COURSE_ID_MYSQL)({ courseUrl: courseUrl }),
                        mssql: _.template(GET_COURSE_ID_MSSQL)({ courseUrl: courseUrl })
                    };
            };
            resolve(rc ? rc : $data.execSql(req, {}));
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
            if (isLessonBookmark) {
                let { isInt, val } = this.convertToNumber(lessonUrl);
                let { isInt: isCourseInt, val: courseVal } = this.convertToNumber(courseUrl);
                if (isInt && isCourseInt)
                    req.dialect = {
                        mysql: _.template(DEL_LESSON_BKM_ID_MYSQL)({ userId: userId, courseId: courseVal, lessonId: val }),
                        mssql: _.template(DEL_LESSON_BKM_ID_MSSQL)({ userId: userId, courseId: courseVal, lessonId: val })
                    }
                else
                    req.dialect = {
                        mysql: _.template(DEL_LESSON_BKM_MYSQL)({ userId: userId, courseUrl: courseUrl, lessonUrl: lessonUrl }),
                        mssql: _.template(DEL_LESSON_BKM_MSSQL)({ userId: userId, courseUrl: courseUrl, lessonUrl: lessonUrl })
                    }
            }
            else {
                let { isInt, val } = this.convertToNumber(courseUrl);
                if (isInt)
                    req.dialect = {
                        mysql: _.template(DEL_COURSE_BKM_ID_MYSQL)({ userId: userId, id: val }),
                        mssql: _.template(DEL_COURSE_BKM_ID_MSSQL)({ userId: userId, id: val })
                    }
                else
                    req.dialect = {
                        mysql: _.template(DEL_COURSE_BKM_MYSQL)({ userId: userId, courseUrl: courseUrl }),
                        mssql: _.template(DEL_COURSE_BKM_MSSQL)({ userId: userId, courseUrl: courseUrl })
                    }
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
