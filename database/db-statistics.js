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
        let caption = `Статистика по рекламным компаниям с ` +
            `${this._dateToString(firsDate, true, false)} по ${this._dateToString(lastDate, true, false)}.`;
        opts.first_date = firsDate;
        opts.last_date = lastDate;
        return this._stat_report(caption, "stat_report_by_campaign", opts);
    }

    _getInterval(options) {
        let opts = options || {};
        let firsDate = opts.first_date ? new Date(opts.first_date) : DEFAULT_FIRST_DATE;
        let lastDate = opts.last_date ? new Date(opts.last_date) : new Date();
        return { firsDate: firsDate, lastDate: lastDate };
    }

    async _stat_report(caption, report_nane, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let data = [];
        let header = [];

        let { firsDate, lastDate } = this._getInterval(opts);

        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_STAT_MYSQL)({
                    stat_func: report_nane,
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                }),
                mssql: _.template(GET_STAT_MSSQL)({
                    stat_func: report_nane,
                    first_date: this._dateToString(firsDate, true, false),
                    last_date: this._dateToString(lastDate, true, false)
                })
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length > 0)) {
            let isFirst = true;
            result.detail.forEach(elem => {
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
