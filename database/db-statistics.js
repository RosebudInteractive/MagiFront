'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const Mustache = require('mustache');
const { roundNumber } = require('../utils');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
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
    "select c.[ChequeDate], u.[RegDate], c.[UserId], coalesce(upd.[Qty], 0) Qty, u.[DisplayName],\n" +
    "  u.[Email], ii.[Name] Course, p.[Price] PriceIni, (p.[Price] - ii.[Price]) Discount, ii.[Price],\n" +
    "  coalesce(g.[Campaign] + ' (' + g.[Source] + '+' + g.[Medium] + ')', '') Campaign,\n" +
    "  coalesce(gr.[Campaign] + ' (' + gr.[Source] + '+' + gr.[Medium] + ')', '') CampaignReg, coalesce(pc.[Code], '') as Promo,\n" +
    "  round(coalesce(sum(h.[LsnTime]), 0) / 3600.0, 2) as LsnTime, cd.[Duration] as CourseDuration,\n" +
    "  round(coalesce(sum(h.[LsnTime]), 0) / 3600.0 / cd.[Duration], 2) as LsnPart,\n" +
    "  max(h.[FinDate]) as ThisLastTime,\n" +
    "  max(hu.[FinDate]) as LastTime\n" +
    "from[Cheque] c\n" +
    "  join[Invoice] i on i.[Id] = c.[InvoiceId]\n" +
    "  join[InvoiceItem] ii on ii.[InvoiceId] = i.[Id]\n" +
    "  left join[Price] p on p.[ProductId] = ii.[ProductId] and(p.[FirstDate] <= c.[ChequeDate])\n" +
    "  and((p.[LastDate] is null) or(p.[LastDate] > c.[ChequeDate]))\n" +
    "  join[User] u on u.[SysParentId] = c.[UserId]\n" +
    "  left join[Campaign] g on g.[Id] = c.[CampaignId]\n" +
    "  left join[Campaign] gr on gr.[Id] = u.[CampaignId]\n" +
    "  left join[PromoCode] pc on pc.[Id] = c.[PromoCodeId]\n" +
    "  join[Course] cs on cs.[ProductId] = ii.[ProductId]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = cs.[Id]\n" +
    "  left join (select [UserId], count(*) [Qty] from [UserPaidCourse] group by [UserId]) upd on upd.[UserId] = c.[UserId]\n" +
    "  join ( select lc.[CourseId], round(sum(coalesce(lg.[Duration], 0)) / 3600.0, 2) Duration from [LessonCourse] lc\n" +
    "      join [LessonLng] lg on lg.[LessonId] = lc.[LessonId]\n" +
    "    group by lc.[CourseId]) cd on cd.[CourseId] = cs.[Id]\n" +
    "  left join[LsnHistory] h on h.[UserId] = c.[UserId] and h.[LessonId] = lc.[LessonId]\n" +
    "  left join ( select [UserId], max([FinDate]) FinDate from [LsnHistory]\n" +
    "    group by [UserId]) hu on hu.[UserId] = c.[UserId]\n" +
    "where(c.[ChequeTypeId] = 1) and(c.[StateId] = 4) and(c.[ChequeDate] >= convert(datetime, '<%= first_date %>'))\n" +
    "  and(c.[ChequeDate] < convert(datetime, '<%= last_date %>'))\n" +
    "group by c.[ChequeDate], u.[RegDate], c.[UserId], upd.[Qty], u.[DisplayName], u.[Email], ii.[Name],\n" +
    "  p.[Price], ii.[Price], g.[Campaign], g.[Source], g.[Medium], pc.[Code], cd.[Duration],\n" +
    "  gr.[Campaign], gr.[Source], gr.[Medium]\n" +
    "order by c.[ChequeDate] desc";

const GET_USER_PURCHASE_MYSQL =
    "select c.`ChequeDate`, u.`RegDate`, c.`UserId`, coalesce(upd.`Qty`, 0) Qty, u.`DisplayName`,\n" +
    "  u.`Email`, ii.`Name` Course, p.`Price` PriceIni, (p.`Price` - ii.`Price`) Discount, ii.`Price`,\n" +
    "  coalesce(concat(g.`Campaign`, ' (', g.`Source`, '+', g.`Medium`, ')'), '') Campaign,\n" +
    "  coalesce(concat(gr.`Campaign`, ' (', gr.`Source`, '+', gr.`Medium`, ')'), '') CampaignReg, coalesce(pc.`Code`, '') as Promo,\n" +
    "  round(coalesce(sum(h.`LsnTime`), 0) / 3600.0, 2) as LsnTime, cd.`Duration` as CourseDuration,\n" +
    "  round(coalesce(sum(h.`LsnTime`), 0) / 3600.0 / cd.`Duration`, 2) as LsnPart,\n" +
    "  max(h.`FinDate`) as ThisLastTime,\n" +
    "  max(hu.`FinDate`) as LastTime\n" +
    "from`Cheque` c\n" +
    "  join`Invoice` i on i.`Id` = c.`InvoiceId`\n" +
    "  join`InvoiceItem` ii on ii.`InvoiceId` = i.`Id`\n" +
    "  left join`Price` p on p.`ProductId` = ii.`ProductId` and(p.`FirstDate` <= c.`ChequeDate`)\n" +
    "  and((p.`LastDate` is null) or(p.`LastDate` > c.`ChequeDate`))\n" +
    "  join`User` u on u.`SysParentId` = c.`UserId`\n" +
    "  left join`Campaign` g on g.`Id` = c.`CampaignId`\n" +
    "  left join`Campaign` gr on gr.`Id` = u.`CampaignId`\n" +
    "  left join`PromoCode` pc on pc.`Id` = c.`PromoCodeId`\n" +
    "  join`Course` cs on cs.`ProductId` = ii.`ProductId`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = cs.`Id`\n" +
    "  left join (select `UserId`, count(*) `Qty` from `UserPaidCourse` group by `UserId`) upd on upd.`UserId` = c.`UserId`\n" +
    "  join ( select lc.`CourseId`, round(sum(coalesce(lg.`Duration`, 0)) / 3600.0, 2) Duration from`LessonCourse` lc\n" +
    "      join`LessonLng` lg on lg.`LessonId` = lc.`LessonId`\n" +
    "    group by lc.`CourseId`) cd on cd.`CourseId` = cs.`Id`\n" +
    "  left join`LsnHistory` h on h.`UserId` = c.`UserId` and h.`LessonId` = lc.`LessonId`\n" +
    "  left join ( select `UserId`, max(`FinDate`) FinDate from `LsnHistory`\n" +
    "    group by `UserId`) hu on hu.`UserId` = c.`UserId`\n" +
    "where(c.`ChequeTypeId` = 1) and(c.`StateId` = 4) and(c.`ChequeDate` >= '<%= first_date %>') and(c.`ChequeDate` < '<%= last_date %>')\n" +
    "group by c.`ChequeDate`, u.`RegDate`, c.`UserId`, upd.`Qty`, u.`DisplayName`, u.`Email`, ii.`Name`,\n" +
    "  p.`Price`, ii.`Price`, g.`Campaign`, g.`Source`, g.`Medium`, pc.`Code`, cd.`Duration`,\n" +
    "  gr.`Campaign`, gr.`Source`, gr.`Medium`\n" +
    "order by c.`ChequeDate` desc";

const GET_COURSE_PURCHASE_MSSQL =
    "select t.Course, sum(t.Qty) Qty, sum(t.TotSum) TotSum, sum(t.GiftQty) GiftQty\n" +
    "from\n" +
    "  (select cl.[Name] Course, count(*) Qty, sum(ii.[Price] * ii.[Qty]) TotSum, 0 as GiftQty\n" +
    "  from[Cheque] c\n" +
    "    join[Invoice] i on i.[Id] = c.[InvoiceId]\n" +
    "    join[InvoiceItem] ii on ii.[InvoiceId] = i.[Id]\n" +
    "    join[Course] cs on cs.[ProductId] = ii.[ProductId]\n" +
    "    join[CourseLng] cl on cl.[CourseId] = cs.[Id]\n" +
    "    left join[UserGiftCourse] gc on gc.[UserId] = c.[UserId] and gc.[CourseId] = cs.[Id]\n" +
    "  where(c.[ChequeTypeId] = 1) and(c.[StateId] = 4) and(c.[ChequeDate] >= convert(datetime, '<%= first_date %>'))\n" +
    "    and(c.[ChequeDate] < convert(datetime, '<%= last_date %>'))\n" +
    "  group by cl.[Name]\n" +
    "  union all\n" +
    "  select cl.[Name] Course, 0, 0, count(*)\n" +
    "  from[UserGiftCourse] gc\n" +
    "    join[CourseLng] cl on cl.[CourseId] = gc.[CourseId]\n" +
    "  where(gc.[TimeCr] >= convert(datetime, '<%= first_date %>'))\n" +
    "    and(gc.[TimeCr] < convert(datetime, '<%= last_date %>'))\n" +
    "  group by cl.[Name]) as t\n" +
    "group by t.Course\n" +
    "order by 3 desc";

const GET_COURSE_PURCHASE_MYSQL =
    "select t.Course, sum(t.Qty) Qty, sum(t.TotSum) TotSum, sum(t.GiftQty) GiftQty\n" +
    "from\n" +
    "  (select cl.`Name` Course, count(*) Qty, sum(ii.`Price` * ii.`Qty`) TotSum, 0 as GiftQty\n" +
    "  from`Cheque` c\n" +
    "    join`Invoice` i on i.`Id` = c.`InvoiceId`\n" +
    "    join`InvoiceItem` ii on ii.`InvoiceId` = i.`Id`\n" +
    "    join`Course` cs on cs.`ProductId` = ii.`ProductId`\n" +
    "    join`CourseLng` cl on cl.`CourseId` = cs.`Id`\n" +
    "    left join`UserGiftCourse` gc on gc.`UserId` = c.`UserId` and gc.`CourseId` = cs.`Id`\n" +
    "  where(c.`ChequeTypeId` = 1) and(c.`StateId` = 4) and(c.`ChequeDate` >= '<%= first_date %>')\n" +
    "    and(c.`ChequeDate` < '<%= last_date %>')\n" +
    "  group by cl.`Name`\n" +
    "  union all\n" +
    "  select cl.`Name` Course, 0, 0, count(*)\n" +
    "  from`UserGiftCourse` gc\n" +
    "    join`CourseLng` cl on cl.`CourseId` = gc.`CourseId`\n" +
    "  where(gc.`TimeCr` >= '<%= first_date %>')\n" +
    "    and(gc.`TimeCr` < '<%= last_date %>')\n" +
    "  group by cl.`Name`) as t\n" +
    "group by t.Course\n" +
    "order by 3 desc";

const DEFAULT_FIRST_DATE = new Date("2019-05-08T00:00:00+0300");

const DbStatistics = class DbStatistics extends DbObject {

    constructor(options) {
        super(options);
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
