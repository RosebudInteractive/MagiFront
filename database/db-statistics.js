'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const Mustache = require('mustache');
const { roundNumber, validateEmail } = require('../utils');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const { number } = require('prop-types');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const GET_STAT_MSSQL =
    "declare @d1 datetime, @d2 datetime\n" +
    "set @d1 = convert(datetime, '<%= first_date %>')\n" +
    "set @d2 = convert(datetime, '<%= last_date %>')\n" +
    "exec <%= stat_func %> @d1, @d2";

const GET_STAT_MYSQL =
    "call <%= stat_func %>('<%= first_date %>', '<%= last_date %>')";

const GET_USER_PURCHASE_MSSQL =
    "select c.[Id], c.[ChequeDate], u.[RegDate], c.[UserId], coalesce(upd.[Qty], 0) Qty, u.[DisplayName],\n" +
    "  u.[Email], ii.[Name] [Название курса], N''[Подарок], p.[Price] PriceIni, (case when c.[PaymentType] = 1 then (p.[Price] - ii.[Price]) else 0 end) Discount,\n" +
    "  ii.[Price], (case when c.[PaymentType] = 2 then ii.[Price] else 0 end) PriceApple, (case when c.[PaymentType] = 3 then ii.[Price] else 0 end) PriceAndroid, coalesce(g.[Campaign] + ' (' + g.[Source] + '+' + g.[Medium] + ')', '') Campaign,\n" +
    "  coalesce(gr.[Campaign] + ' (' + gr.[Source] + '+' + gr.[Medium] + ')', '') CampaignReg, coalesce(c.[PromoCode], '') as Promo,\n" +
    "  round(coalesce(sum(h.[LsnTime]), 0) / 3600.0, 2) as LsnTime, cd.[Duration] as CourseDuration,\n" +
    "  round(coalesce(sum(h.[LsnTime]), 0) / 3600.0 / cd.[Duration], 2) as LsnPart,\n" +
    "  max(h.[FinDate]) as ThisLastTime,\n" +
    "  max(hu.[FinDate]) as LastTime\n" +
    "from[Cheque] c\n" +
    "  join[Invoice] i on i.[Id] = c.[InvoiceId]\n" +
    "  join[InvoiceItem] ii on ii.[InvoiceId] = i.[Id]\n" +
    "  left join[Price] p on p.[ProductId] = ii.[ProductId] and(p.[FirstDate] <= c.[ChequeDate])\n" +
    "    and((p.[LastDate] is null) or(p.[LastDate] > c.[ChequeDate]))\n" +
    "  join[User] u on u.[SysParentId] = c.[UserId]\n" +
    "  left join[Campaign] g on g.[Id] = c.[CampaignId]\n" +
    "  left join[Campaign] gr on gr.[Id] = u.[CampaignId]\n" +
    "  left join[PromoCode] pc on pc.[Id] = c.[PromoCodeId]\n" +
    "  join[Course] cs on cs.[ProductId] = ii.[ProductId]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = cs.[Id]\n" +
    "  left join(select[UserId], count(*)[Qty] from[UserPaidCourse] group by[UserId]) upd on upd.[UserId] = c.[UserId]\n" +
    "  join(select lc.[CourseId], round(sum(coalesce(lg.[Duration], 0)) / 3600.0, 2) Duration from[LessonCourse] lc\n" +
    "    join[LessonLng] lg on lg.[LessonId] = lc.[LessonId]\n" +
    "    group by lc.[CourseId]) cd on cd.[CourseId] = cs.[Id]\n" +
    "  left join[LsnHistory] h on h.[UserId] = c.[UserId] and h.[LessonId] = lc.[LessonId]\n" +
    "  left join(select[UserId], max([FinDate]) FinDate from[LsnHistory]\n" +
    "    group by[UserId]) hu on hu.[UserId] = c.[UserId]\n" +
    "where(c.[ChequeTypeId] = 1) and(c.[StateId] = 4) and(c.[ChequeDate] >= convert(datetime, '<%= first_date %>'))\n" +
    "  and(c.[ChequeDate] < convert(datetime, '<%= last_date %>'))\n" +
    "group by c.[Id], c.[ChequeDate], u.[RegDate], c.[UserId], upd.[Qty], u.[DisplayName], u.[Email], ii.[Name],\n" +
    "  p.[Price], ii.[Price], g.[Campaign], g.[Source], g.[Medium], c.[PromoCode], cd.[Duration],\n" +
    "  c.[PaymentType], gr.[Campaign], gr.[Source], gr.[Medium]\n" +
    "union all\n" +
    "select c.[Id], c.[ChequeDate], u.[RegDate], c.[UserId], coalesce(upd.[Qty], 0) Qty, u.[DisplayName],\n" +
    "  u.[Email], N'Курс: ' + cl.[Name] Course, N'да'[Подарок], p.[Price] PriceIni, (p.[Price] - ii.[Price]) Discount, ii.[Price], 0 PriceApple, 0 PriceAndroid,\n" +
    "  coalesce(g.[Campaign] + ' (' + g.[Source] + '+' + g.[Medium] + ')', '') Campaign,\n" +
    "  coalesce(gr.[Campaign] + ' (' + gr.[Source] + '+' + gr.[Medium] + ')', '') CampaignReg, coalesce(c.[PromoCode], '') as Promo,\n" +
    "  round(coalesce(sum(h.[LsnTime]), 0) / 3600.0, 2) as LsnTime, cd.[Duration] as CourseDuration,\n" +
    "  round(coalesce(sum(h.[LsnTime]), 0) / 3600.0 / cd.[Duration], 2) as LsnPart,\n" +
    "  max(h.[FinDate]) as ThisLastTime,\n" +
    "  max(hu.[FinDate]) as LastTime\n" +
    "from[PromoCode] ppc\n" +
    "  join[InvoiceItem] ii on ii.[ProductId] = ppc.[PromoProductId]\n" +
    "  join[Invoice] i on i.[Id] = ii.[InvoiceId]\n" +
    "  join[Cheque] c on c.[InvoiceId] = i.[Id]\n" +
    "  join[PromoCodeProduct] pcp on pcp.[PromoCodeId] = ppc.[Id]\n" +
    "  join[Product] pr on pr.[Id] = pcp.[ProductId]\n" +
    "  join[Course] cs on cs.[ProductId] = pr.[Id]\n" +
    "  join[CourseLng] cl on cl.[CourseId] = cs.[Id]\n" +
    "  left join[Price] p on p.[ProductId] = ii.[ProductId] and(p.[FirstDate] <= c.[ChequeDate])\n" +
    "    and((p.[LastDate] is null) or(p.[LastDate] > c.[ChequeDate]))\n" +
    "  join[User] u on u.[SysParentId] = c.[UserId]\n" +
    "  left join[Campaign] g on g.[Id] = c.[CampaignId]\n" +
    "  left join[Campaign] gr on gr.[Id] = u.[CampaignId]\n" +
    "  left join[PromoCode] pc on pc.[Id] = c.[PromoCodeId]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = cs.[Id]\n" +
    "  left join(select[UserId], count(*)[Qty] from[UserPaidCourse] group by[UserId]) upd on upd.[UserId] = c.[UserId]\n" +
    "  join(select lc.[CourseId], round(sum(coalesce(lg.[Duration], 0)) / 3600.0, 2) Duration from[LessonCourse] lc\n" +
    "    join[LessonLng] lg on lg.[LessonId] = lc.[LessonId]\n" +
    "    group by lc.[CourseId]) cd on cd.[CourseId] = cs.[Id]\n" +
    "  left join[LsnHistory] h on h.[UserId] = c.[UserId] and h.[LessonId] = lc.[LessonId]\n" +
    "  left join(select[UserId], max([FinDate]) FinDate from[LsnHistory]\n" +
    "    group by[UserId]) hu on hu.[UserId] = c.[UserId]\n" +
    "where(c.[ChequeTypeId] = 1) and(c.[StateId] = 4) and(c.[ChequeDate] >= convert(datetime, '<%= first_date %>'))\n" +
    "  and(c.[ChequeDate] < convert(datetime, '<%= last_date %>'))\n" +
    "group by c.[Id], c.[ChequeDate], u.[RegDate], c.[UserId], upd.[Qty], u.[DisplayName], u.[Email], cl.[Name],\n" +
    "  p.[Price], ii.[Price], g.[Campaign], g.[Source], g.[Medium], c.[PromoCode], cd.[Duration],\n" +
    "  gr.[Campaign], gr.[Source], gr.[Medium]\n" +
    "order by 2 desc";

const GET_USER_PURCHASE_MYSQL =
    "select t.`Id`, t.`ChequeDate`, t.`RegDate`, t.`UserId`, t.`Qty`, t.`DisplayName`, t.`Email`, t.`Course` `Название курса`, t.`Подарок`,\n" +
    "  t.`PriceIni`, t.`Discount`, t.`Price`, t.`PriceApple`, t.`PriceAndroid`, coalesce(concat(g.`Campaign`, ' (', g.`Source`, '+', g.`Medium`, ')'), '') Campaign,\n" +
    "  coalesce(concat(gr.`Campaign`, ' (', gr.`Source`, '+', gr.`Medium`, ')'), '') CampaignReg, t.`Promo`, t.`LsnTime`, t.`CourseDuration`,\n" +
    "  t.`LsnPart`, t.`ThisLastTime`, t.`LastTime`\n" +
    "from\n" +
    "(select c.`Id`, c.`ChequeDate`, u.`RegDate`, c.`UserId`, coalesce(upd.`Qty`, 0) Qty, u.`DisplayName`,\n" +
    "  u.`Email`, ii.`Name` Course, '' `Подарок`, p.`Price` PriceIni, (case when c.`PaymentType` = 1 then (p.`Price` - ii.`Price`) else 0 end) Discount,\n" +
    "  ii.`Price`, (case when c.`PaymentType` = 2 then ii.`Price` else 0 end) PriceApple,\n" +
    "  (case when c.`PaymentType` = 3 then ii.`Price` else 0 end) PriceAndroid, c.`CampaignId`,\n" +
    "  u.`CampaignId` as UCampaignId, coalesce(c.`PromoCode`, '') as Promo,\n" +
    "  round(coalesce(sum(h.`LsnTime`), 0) / 3600.0, 2) as LsnTime, cd.`Duration` as CourseDuration,\n" +
    "  round(coalesce(sum(h.`LsnTime`), 0) / 3600.0 / cd.`Duration`, 2) as LsnPart,\n" +
    "  max(h.`FinDate`) as ThisLastTime,\n" +
    "  max(hu.`FinDate`) as LastTime\n" +
    "from`Cheque` c\n" +
    "  join`Invoice` i on i.`Id` = c.`InvoiceId`\n" +
    "  join`InvoiceItem` ii on ii.`InvoiceId` = i.`Id`\n" +
    "  left join`Price` p on p.`ProductId` = ii.`ProductId` and(p.`FirstDate` <= c.`ChequeDate`)\n" +
    "    and((p.`LastDate` is null) or(p.`LastDate` > c.`ChequeDate`))\n" +
    "  join`User` u on u.`SysParentId` = c.`UserId`\n" +
    "  left join`PromoCode` pc on pc.`Id` = c.`PromoCodeId`\n" +
    "  join`Course` cs on cs.`ProductId` = ii.`ProductId`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = cs.`Id`\n" +
    "  left join(select`UserId`, count(*)`Qty` from`UserPaidCourse` group by`UserId`) upd on upd.`UserId` = c.`UserId`\n" +
    "  join(select lc.`CourseId`, round(sum(coalesce(lg.`Duration`, 0)) / 3600.0, 2) Duration from`LessonCourse` lc\n" +
    "    join`LessonLng` lg on lg.`LessonId` = lc.`LessonId`\n" +
    "  group by lc.`CourseId`) cd on cd.`CourseId` = cs.`Id`\n" +
    "  left join`LsnHistory` h on h.`UserId` = c.`UserId` and h.`LessonId` = lc.`LessonId`\n" +
    "  left join(select`UserId`, max(`FinDate`) FinDate from`LsnHistory`\n" +
    "    group by`UserId`) hu on hu.`UserId` = c.`UserId`\n" +
    "where(c.`ChequeTypeId` = 1) and(c.`StateId` = 4) and(c.`ChequeDate` >= '<%= first_date %>')\n" +
    "  and(c.`ChequeDate` < '<%= last_date %>')\n" +
    "group by c.`Id`, c.`ChequeDate`, u.`RegDate`, c.`UserId`, upd.`Qty`, u.`DisplayName`, u.`Email`, ii.`Name`,\n" +
    "  p.`Price`, ii.`Price`, c.`PromoCode`, c.`PaymentType`, cd.`Duration`, c.`CampaignId`, u.`CampaignId`\n" +
    "union all\n" +
    "select c.`Id`, c.`ChequeDate`, u.`RegDate`, c.`UserId`, coalesce(upd.`Qty`, 0) Qty, u.`DisplayName`,\n" +
    "  u.`Email`, concat('Курс: ', cl.`Name`) Course, 'да' `Подарок`, p.`Price` PriceIni, (p.`Price` - ii.`Price`) Discount, ii.`Price`,\n" +
    "  0 PriceApple, 0 PriceAndroid, c.`CampaignId`,\n" +
    "  u.`CampaignId` as UCampaignId, coalesce(c.`PromoCode`, '') as Promo,\n" +
    "  round(coalesce(sum(h.`LsnTime`), 0) / 3600.0, 2) as LsnTime, cd.`Duration` as CourseDuration,\n" +
    "  round(coalesce(sum(h.`LsnTime`), 0) / 3600.0 / cd.`Duration`, 2) as LsnPart,\n" +
    "  max(h.`FinDate`) as ThisLastTime,\n" +
    "  max(hu.`FinDate`) as LastTime\n" +
    "from`PromoCode` ppc\n" +
    "  join`InvoiceItem` ii on ii.`ProductId` = ppc.`PromoProductId`\n" +
    "  join`Invoice` i on i.`Id` = ii.`InvoiceId`\n" +
    "  join`Cheque` c on c.`InvoiceId` = i.`Id`\n" +
    "  join`PromoCodeProduct` pcp on pcp.`PromoCodeId` = ppc.`Id`\n" +
    "  join`Product` pr on pr.`Id` = pcp.`ProductId`\n" +
    "  join`Course` cs on cs.`ProductId` = pr.`Id`\n" +
    "  join`CourseLng` cl on cl.`CourseId` = cs.`Id`\n" +
    "  left join`Price` p on p.`ProductId` = ii.`ProductId` and(p.`FirstDate` <= c.`ChequeDate`)\n" +
    "    and((p.`LastDate` is null) or(p.`LastDate` > c.`ChequeDate`))\n" +
    "  join`User` u on u.`SysParentId` = c.`UserId`\n" +
    "  left join`PromoCode` pc on pc.`Id` = c.`PromoCodeId`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = cs.`Id`\n" +
    "  left join(select`UserId`, count(*)`Qty` from`UserPaidCourse` group by`UserId`) upd on upd.`UserId` = c.`UserId`\n" +
    "  join(select lc.`CourseId`, round(sum(coalesce(lg.`Duration`, 0)) / 3600.0, 2) Duration from`LessonCourse` lc\n" +
    "    join`LessonLng` lg on lg.`LessonId` = lc.`LessonId`\n" +
    "  group by lc.`CourseId`) cd on cd.`CourseId` = cs.`Id`\n" +
    "  left join`LsnHistory` h on h.`UserId` = c.`UserId` and h.`LessonId` = lc.`LessonId`\n" +
    "  left join(select`UserId`, max(`FinDate`) FinDate from`LsnHistory`\n" +
    "    group by`UserId`) hu on hu.`UserId` = c.`UserId`\n" +
    "where(c.`ChequeTypeId` = 1) and(c.`StateId` = 4) and(c.`ChequeDate` >= '<%= first_date %>')\n" +
    "  and(c.`ChequeDate` < '<%= last_date %>')\n" +
    "group by c.`Id`, c.`ChequeDate`, u.`RegDate`, c.`UserId`, upd.`Qty`, u.`DisplayName`, u.`Email`, cl.`Name`,\n" +
    "  p.`Price`, ii.`Price`, c.`CampaignId`, u.`CampaignId`) t\n" +
    "left join`Campaign` g on g.`Id` = t.`CampaignId`\n" +
    "left join`Campaign` gr on gr.`Id` = t.`UCampaignId`\n" +
    "order by 2 desc";

const GET_COURSE_PURCHASE_MSSQL =
    "select t.Course, sum(t.Qty) Qty, sum(t.TotSum) TotSum, sum(t.TotIosSum) TotIosSum, sum(t.TotAndroidSum) TotAndroidSum, sum(t.GiftQty) GiftQty\n" +
    "from\n" +
    "  (select cl.[Name] Course, count(*) Qty, sum(ii.[Price] * ii.[Qty]) TotSum, sum(case when c.[PaymentType] = 2 then (ii.[Price] * ii.[Qty]) else 0 end) TotIosSum,\n" +
    "    sum(case when c.[PaymentType] = 3 then (ii.[Price] * ii.[Qty]) else 0 end) TotAndroidSum,\n" +
    "    0 as GiftQty\n" +
    "  from[Cheque] c\n" +
    "    join[Invoice] i on i.[Id] = c.[InvoiceId]\n" +
    "    join[InvoiceItem] ii on ii.[InvoiceId] = i.[Id]\n" +
    "    join[Course] cs on cs.[ProductId] = ii.[ProductId]\n" +
    "    join[CourseLng] cl on cl.[CourseId] = cs.[Id]\n" +
    "  where(c.[ChequeTypeId] = 1) and(c.[StateId] = 4) and(c.[ChequeDate] >= convert(datetime, '<%= first_date %>'))\n" +
    "    and(c.[ChequeDate] < convert(datetime, '<%= last_date %>'))\n" +
    "  group by cl.[Name]\n" +
    "  union all\n" +
    "  select cl.[Name] Course, count(*) Qty, sum(ii.[Price] * ii.[Qty]) TotSum, 0 as TotIosSum, 0 as TotAndroidSum, 0 as GiftQty\n" +
    "  from[PromoCode] ppc\n" +
    "    join[InvoiceItem] ii on ii.[ProductId] = ppc.[PromoProductId]\n" +
    "    join[Invoice] i on i.[Id] = ii.[InvoiceId]\n" +
    "    join[Cheque] c on c.[InvoiceId] = i.[Id]\n" +
    "    join[PromoCodeProduct] pcp on pcp.[PromoCodeId] = ppc.[Id]\n" +
    "    join[Product] pr on pr.[Id] = pcp.[ProductId]\n" +
    "    join[Course] cs on cs.[ProductId] = pr.[Id]\n" +
    "    join[CourseLng] cl on cl.[CourseId] = cs.[Id]\n" +
    "  where(c.[ChequeTypeId] = 1) and(c.[StateId] = 4) and(c.[ChequeDate] >= convert(datetime, '<%= first_date %>'))\n" +
    "    and(c.[ChequeDate] < convert(datetime, '<%= last_date %>'))\n" +
    "  group by cl.[Name]\n" +
    "  union all\n" +
    "  select cl.[Name] Course, 0, 0, 0, 0, count(*)\n" +
    "  from[UserGiftCourse] gc\n" +
    "    join[CourseLng] cl on cl.[CourseId] = gc.[CourseId]\n" +
    "  where(gc.[TimeCr] >= convert(datetime, '<%= first_date %>'))\n" +
    "    and(gc.[TimeCr] < convert(datetime, '<%= last_date %>'))\n" +
    "  group by cl.[Name]) as t\n" +
    "group by t.Course\n" +
    "order by 3 desc";

const GET_COURSE_PURCHASE_MYSQL =
    "select t.Course, sum(t.Qty) Qty, sum(t.TotSum) TotSum, sum(t.TotIosSum) TotIosSum, sum(t.TotAndroidSum) TotAndroidSum, sum(t.GiftQty) GiftQty\n" +
    "from\n" +
    "  (select cl.`Name` Course, count(*) Qty, sum(ii.`Price` * ii.`Qty`) TotSum, sum(case when c.`PaymentType` = 2 then (ii.`Price` * ii.`Qty`) else 0 end) TotIosSum,\n" +
    "    sum(case when c.`PaymentType` = 3 then (ii.`Price` * ii.`Qty`) else 0 end) TotAndroidSum,\n" +
    "    0 as GiftQty\n" +
    "  from`Cheque` c\n" +
    "    join`Invoice` i on i.`Id` = c.`InvoiceId`\n" +
    "    join`InvoiceItem` ii on ii.`InvoiceId` = i.`Id`\n" +
    "    join`Course` cs on cs.`ProductId` = ii.`ProductId`\n" +
    "    join`CourseLng` cl on cl.`CourseId` = cs.`Id`\n" +
    "  where(c.`ChequeTypeId` = 1) and(c.`StateId` = 4) and(c.`ChequeDate` >= '<%= first_date %>')\n" +
    "    and(c.`ChequeDate` < '<%= last_date %>')\n" +
    "  group by cl.`Name`\n" +
    "  union all\n" +
    "  select cl.`Name` Course, count(*) Qty, sum(ii.`Price` * ii.`Qty`) TotSum, 0 as TotIosSum, 0 as TotAndroidSum, 0 as GiftQty\n" +
    "  from`PromoCode` ppc\n" +
    "    join`InvoiceItem` ii on ii.`ProductId` = ppc.`PromoProductId`\n" +
    "    join`Invoice` i on i.`Id` = ii.`InvoiceId`\n" +
    "    join`Cheque` c on c.`InvoiceId` = i.`Id`\n" +
    "    join`PromoCodeProduct` pcp on pcp.`PromoCodeId` = ppc.`Id`\n" +
    "    join`Product` pr on pr.`Id` = pcp.`ProductId`\n" +
    "    join`Course` cs on cs.`ProductId` = pr.`Id`\n" +
    "    join`CourseLng` cl on cl.`CourseId` = cs.`Id`\n" +
    "  where(c.`ChequeTypeId` = 1) and(c.`StateId` = 4) and(c.`ChequeDate` >= '<%= first_date %>')\n" +
    "    and(c.`ChequeDate` < '<%= last_date %>')\n" +
    "  group by cl.`Name`\n" +
    "  union all\n" +
    "  select cl.`Name` Course, 0, 0, 0, 0, count(*)\n" +
    "  from`UserGiftCourse` gc\n" +
    "    join`CourseLng` cl on cl.`CourseId` = gc.`CourseId`\n" +
    "  where(gc.`TimeCr` >= '<%= first_date %>')\n" +
    "    and(gc.`TimeCr` < '<%= last_date %>')\n" +
    "  group by cl.`Name`) as t\n" +
    "group by t.Course\n" +
    "order by 3 desc";

const GET_COURSE_LISTEN_MSSQL =
    "select cl.[CourseId] Id, cl.[Name] Course,\n" +
    "  round(sum(h.[LsnTime]) / 3600.0, 2) as LsnTime,\n" +
    "  round(sum(case when(not lc.[ParentId] is null) then h.[LsnTime] else 0 end) / 3600.0, 2) as ExtLsnTime,\n" +
    "  round(max(cd.[Duration]) / 3600.0, 2) as Duration,\n" +
    "  round(sum(h.[LsnTime]) / max(cd.[Duration]), 2) Ratio\n" +
    "from [LsnHistory] h\n" +
    "  join [LessonCourse] lc on lc.[LessonId] = h.[LessonId]\n" +
    "  join [LessonLng] ll on ll.[LessonId] = lc.[LessonId]\n" +
    "  join [CourseLng] cl on cl.[CourseId] = lc.[CourseId]\n" +
    "  join (select lc.[CourseId], sum(coalesce(lg.[Duration], 0)) Duration from[LessonCourse] lc\n" +
    "    join[LessonLng] lg on lg.[LessonId] = lc.[LessonId]\n" +
    "  group by lc.[CourseId]) cd on cd.[CourseId] = lc.[CourseId]\n" +
    "where h.[StDate] >= convert(datetime, '<%= first_date %>') and h.[FinDate] < convert(datetime, '<%= last_date %>')\n" +
    "group by cl.[CourseId], cl.[Name]\n" +
    "order by 6 desc";
    
const GET_COURSE_LISTEN_MYSQL =
    "select cl.`CourseId` Id, cl.`Name` Course,\n" +
    "  round(sum(h.`LsnTime`) / 3600.0, 2) as LsnTime,\n" +
    "  round(sum(case when(not lc.`ParentId` is null) then h.`LsnTime` else 0 end) / 3600.0, 2) as ExtLsnTime,\n" +
    "  round(max(cd.`Duration`) / 3600.0, 2) as Duration,\n" +
    "  round(sum(h.`LsnTime`) / max(cd.`Duration`), 2) Ratio\n" +
    "from `LsnHistory` h\n" +
    "  join `LessonCourse` lc on lc.`LessonId` = h.`LessonId`\n" +
    "  join `LessonLng` ll on ll.`LessonId` = lc.`LessonId`\n" +
    "  join `CourseLng` cl on cl.`CourseId` = lc.`CourseId`\n" +
    "  join (select lc.`CourseId`, sum(coalesce(lg.`Duration`, 0)) Duration from`LessonCourse` lc\n" +
    "    join`LessonLng` lg on lg.`LessonId` = lc.`LessonId`\n" +
    "  group by lc.`CourseId`) cd on cd.`CourseId` = lc.`CourseId`\n" +
    "where h.`StDate` >= '<%= first_date %>' and h.`FinDate` < '<%= last_date %>'\n" +
    "group by cl.`CourseId`, cl.`Name`\n" +
    "order by 6 desc";

const GET_USER_REG_MSSQL =
    "select u.[SysParentId] as UserId, u.[RegDate], u.[Email], u.[DisplayName], coalesce(p.[Name], 'Email') Src, pf.[Identifier],\n" +
    "  coalesce(gr.[Campaign] + ' (' + gr.[Source] + '+' + gr.[Medium] + ')', '') CampaignReg,\n" +
    "  coalesce(uq.[Qty], 0) as Qty\n" +
    "from [User] u\n" +
    "  left join [SNetProvider] p on p.[Id] = u.[RegProviderId]\n" +
    "  left join [SNetProfile] pf on pf.[UserId] = u.[SysParentId] and pf.[ProviderId] = p.[Id]\n" +
    "  left join [Campaign] gr on gr.[Id] = u.[CampaignId]\n" +
    "  left join (select c.[UserId], sum(ii.[Qty]) Qty from[Cheque] c\n" +
    "      join [InvoiceItem] ii on ii.[InvoiceId] = c.[InvoiceId]\n" +
    "      join [Product] p on p.[Id] = ii.[ProductId]\n" +
    "      join [ProductType] pt on pt.[Id] = p.[ProductTypeId] and(pt.[Id] in (5, 6))\n" +
    "    where c.[ChequeTypeId] = 1 and c.[StateId] = 4\n" +
    "    group by c.[UserId]) uq on uq.[UserId] = u.[SysParentId]\n" +
    "where u.[RegDate] >= convert(datetime, '<%= first_date %>')\n" +
    "  and u.[RegDate] < convert(datetime, '<%= last_date %>')\n" +
    "order by 2 desc";

const GET_USER_REG_MYSQL =
    "select u.`SysParentId` as UserId, u.`RegDate`, u.`Email`, u.`DisplayName`, coalesce(p.`Name`, 'Email') Src, pf.`Identifier`,\n" +
    "  coalesce(concat(gr.`Campaign`, ' (', gr.`Source`, '+', gr.`Medium`, ')'), '') CampaignReg,\n" +
    "  coalesce(uq.`Qty`, 0) as Qty\n" +
    "from `User` u\n" +
    "  left join `SNetProvider` p on p.`Id` = u.`RegProviderId`\n" +
    "  left join `SNetProfile` pf on pf.`UserId` = u.`SysParentId` and pf.`ProviderId` = p.`Id`\n" +
    "  left join `Campaign` gr on gr.`Id` = u.`CampaignId`\n" +
    "  left join (select c.`UserId`, sum(ii.`Qty`) Qty from`Cheque` c\n" +
    "      join `InvoiceItem` ii on ii.`InvoiceId` = c.`InvoiceId`\n" +
    "      join `Product` p on p.`Id` = ii.`ProductId`\n" +
    "      join `ProductType` pt on pt.`Id` = p.`ProductTypeId` and(pt.`Id` in (5, 6))\n" +
    "    where c.`ChequeTypeId` = 1 and c.`StateId` = 4\n" +
    "    group by c.`UserId`) uq on uq.`UserId` = u.`SysParentId`\n" +
    "where u.`RegDate` >= '<%= first_date %>'\n" +
    "  and u.`RegDate` < '<%= last_date %>'\n" +
    "order by 2 desc";

const GET_USER_INFO_MSSQL =
    "select u.[SysParentId] [ID], u.[DisplayName] [Имя], u.[Email], u.[RegDate] [Дата рег.], coalesce(sp.[Name], 'Email or unknown') [Способ рег.],\n" +
    "  ch.[ChequeDate] [Дата покупки], ii.[Name] [Курс], ch.[Sum] [Сумма],\n" +
    "  case when ch.[PaymentType] = 1 then 'site' when ch.[PaymentType] = 2 then 'ios' when ch.[PaymentType] = 3 then 'android' else '' end [Способ покупки],\n" +
    "  ch.[PromoCode] [Промокод]\n" +
    "from [User] u\n" +
    "  left join [Cheque] ch on ch.[UserId] = u.[SysParentId] and ch.[ChequeTypeId] = 1 and ch.[StateId] = 4\n" +
    "  left join [InvoiceItem] ii on ii.[InvoiceId] = ch.[InvoiceId]\n" +
    "  left join [SNetProvider] sp on sp.[Id] = u.[RegProviderId]\n" +
    "where  u.[<%= field %>] = <%= val %>\n" +
    "order by ch.[ChequeDate]";

const GET_USER_INFO_MYSQL =
    "select u.`SysParentId` `ID`, u.`DisplayName` `Имя`, u.`Email`, u.`RegDate` `Дата рег.`, coalesce(sp.`Name`, 'Email or unknown') `Способ рег.`,\n" +
    "  ch.`ChequeDate` `Дата покупки`, ii.`Name` `Курс`, ch.`Sum` `Сумма`,\n" +
    "  case when ch.`PaymentType` = 1 then 'site' when ch.`PaymentType` = 2 then 'ios' when ch.`PaymentType` = 3 then 'android' else '' end `Способ покупки`,\n" +
    "  ch.`PromoCode` `Промокод`\n" +
    "from `User` u\n" +
    "  left join `Cheque` ch on ch.`UserId` = u.`SysParentId` and ch.`ChequeTypeId` = 1 and ch.`StateId` = 4\n" +
    "  left join `InvoiceItem` ii on ii.`InvoiceId` = ch.`InvoiceId`\n" +
    "  left join `SNetProvider` sp on sp.`Id` = u.`RegProviderId`\n" +
    "where  u.`<%= field %>` = <%= val %>\n" +
    "order by ch.`ChequeDate`";

const DEFAULT_FIRST_DATE = new Date("2019-05-08T00:00:00+0300");

const DbStatistics = class DbStatistics extends DbObject {

    constructor(options) {
        super(options);
    }

    async user_info(options) {
        let opts = _.cloneDeep(options);
        let val = 0;
        let field = 'SysParentId';
        let title = '';

        if (opts.id) {
            if (validateEmail(opts.id)) {
                val = `'${opts.id}'`;
                field = 'Email';
                title = ` ( Email = ${opts.id} )`
            }
            else {
                let id = Number.parseInt(opts.id);
                if (!Number.isNaN(id)) {
                    val = opts.id;
                    title = ` ( ID = ${opts.id} )`
                }
            }
        }

        let caption = `Информация о пользователе${title}.`;
        return this._stat_report(caption, async () => {
            let dbOpts = opts.dbOptions || {};
            let res_data = [];
            let dialect = {
                mysql: _.template(GET_USER_INFO_MYSQL)({ field: field, val: val }),
                mssql: _.template(GET_USER_INFO_MSSQL)({ field: field, val: val })
            };
            let result = await $data.execSql({ dialect: dialect }, dbOpts);
            if (result && result.detail && (result.detail.length > 0))
                res_data = result.detail;
            return res_data;
        }, opts);
    }

    async stat_report(options) {
        let opts = _.cloneDeep(options);
        let { firsDate, lastDate } = this._getInterval(opts);
        let caption = `Статистика по датам с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, "stat_report", options);
    }

    async stat_report_by_campaign(options) {
        let opts = _.cloneDeep(options);
        opts.exclude = {
            st_date: true,
            fin_date: true
        }
        let { firsDate, lastDate } = this._getInterval(opts);
        let caption = `Статистика по рекламным кампаниям с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, "stat_report_by_campaign", opts);
    }

    async user_register(options) {
        let opts = _.cloneDeep(options);
        opts.exclude = {
            st_date: true,
            fin_date: true
        }
        let { firsDate, lastDate } = this._getInterval(opts);
        let caption = `Регистрация пользователей с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, async () => {
            let dbOpts = opts.dbOptions || {};
            let res_data = [];
            let dialect = {
                mysql: _.template(GET_USER_REG_MYSQL)({
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                }),
                mssql: _.template(GET_USER_REG_MSSQL)({
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                })
            };
            let result = await $data.execSql({ dialect: dialect }, dbOpts);
            if (result && result.detail && (result.detail.length > 0))
                res_data = result.detail;
            return res_data;
        }, opts);
    }

    async user_course_purchase(options) {
        let opts = _.cloneDeep(options);
        opts.exclude = {
            st_date: true,
            fin_date: true
        }
        let { firsDate, lastDate } = this._getInterval(opts);
        let caption = `Покупки курсов пользователями с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, async () => {
            let dbOpts = opts.dbOptions || {};
            let res_data = [];
            let dialect = {
                mysql: _.template(GET_USER_PURCHASE_MYSQL)({
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                }),
                mssql: _.template(GET_USER_PURCHASE_MSSQL)({
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                })
            };
            let result = await $data.execSql({ dialect: dialect }, dbOpts);
            if (result && result.detail && (result.detail.length > 0))
                res_data = result.detail;
            return res_data;
        }, opts);
    }

    async course_listen(options) {
        let opts = _.cloneDeep(options);
        let { firsDate, lastDate } = this._getInterval(opts);
        let caption = `Прослушивание курсов с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, async () => {
            let dbOpts = opts.dbOptions || {};
            let res_data = [];
            let dialect = {
                mysql: _.template(GET_COURSE_LISTEN_MYSQL)({
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                }),
                mssql: _.template(GET_COURSE_LISTEN_MSSQL)({
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                })
            };
            let result = await $data.execSql({ dialect: dialect }, dbOpts);
            if (result && result.detail && (result.detail.length > 0))
                res_data = result.detail;
            return res_data;
        }, opts);
    }

    async course_sale(options) {
        let opts = _.cloneDeep(options);
        opts.exclude = {
            st_date: true,
            fin_date: true
        }
        let { firsDate, lastDate } = this._getInterval(opts);
        let caption = `Продажи курсов с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, {
            mysql: GET_COURSE_PURCHASE_MYSQL,
            mssql: GET_COURSE_PURCHASE_MSSQL
        }, opts);
    }

    _getInterval(options) {
        let opts = options || {};
        let firsDate = opts.first_date ? new Date(opts.first_date) : DEFAULT_FIRST_DATE;
        let lastDate = opts.last_date ? new Date(opts.last_date) : new Date();
        return { firsDate: firsDate, lastDate: lastDate };
    }

    async _stat_report(caption, report_name, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let data = [];
        let header = [];
        let res_data = [];

        let { firsDate, lastDate } = this._getInterval(opts);
        let dialect;
        switch (typeof (report_name)) {

            case "string":
                dialect = {
                    mysql: _.template(GET_STAT_MYSQL)({
                        stat_func: report_name,
                        first_date: this._dateToString(firsDate, true, false),
                        last_date: this._dateToString(lastDate, true, false)
                    }),
                    mssql: _.template(GET_STAT_MSSQL)({
                        stat_func: report_name,
                        first_date: this._dateToString(firsDate, true, false),
                        last_date: this._dateToString(lastDate, true, false)
                    })
                };
                let result = await $data.execSql({ dialect: dialect }, dbOpts);
                if (result && result.detail && (result.detail.length > 0))
                    res_data = result.detail;
                break;

            case "function":
                res_data = await report_name();
                break;

            default:
                if (report_name && report_name.mysql && report_name.mssql) {
                    dialect = {
                        mysql: _.template(report_name.mysql)({
                            first_date: this._dateToString(firsDate, true, false),
                            last_date: this._dateToString(lastDate, true, false)
                        }),
                        mssql: _.template(report_name.mssql)({
                            first_date: this._dateToString(firsDate, true, false),
                            last_date: this._dateToString(lastDate, true, false)
                        })
                    };
                    let result = await $data.execSql({ dialect: dialect }, dbOpts);
                    if (result && result.detail && (result.detail.length > 0))
                        res_data = result.detail;
                }
                else
                    throw new Error(`Invalid parameter "report_name": ${report_name}`);
        }
        if (res_data.length > 0) {
            let isFirst = true;
            res_data.forEach(elem => {
                if (isFirst) {
                    for (let fld in elem) {
                        if (((!opts.fields) || (opts.fields[fld])) &&
                            ((!opts.exclude) || (!opts.exclude[fld])))
                            header.push(fld);
                    }
                    isFirst = false;
                }
                let rowVals = [];
                header.forEach(fld => {
                    rowVals.push(elem[fld] === null ? '' : elem[fld]);
                })
                data.push(rowVals);
            });
        };

        let getFormatCell = () => {
            let self = this;
            let cellNum = 0;
            let totColNum = header.length;
            return function () {
                let row = Math.trunc(cellNum / totColNum);
                let col = cellNum - row * totColNum;
                let res = this;
                if (res instanceof Date) {
                    let secFlag = header[col] !== "date";
                    res = self._dateToString(res, secFlag, false);
                }
                cellNum++;
                return res;
            }
        }

        let view = {
            caption: caption,
            header: header,
            data: data,
            formatCell: getFormatCell()
        }
        let template = await readFileAsync('./templates/stat/stat-report.html', 'utf8');
        let html = Mustache.render(template, view);
        return html;
    }
}

let dbStatistics = null;
exports.StatisticsService = () => {
    return dbStatistics ? dbStatistics : dbStatistics = new DbStatistics();
}
