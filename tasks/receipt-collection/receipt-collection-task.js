'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const { URL, URLSearchParams } = require('url');

const { Task } = require('../lib/task');
const { HttpCode } = require('../../const/http-codes');
const { DbObject } = require('../../database/db-object');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_CHEQUE_MSSQL =
    "select<%= limit %> [Id], coalesce([LastTrialTs], convert(datetime, 0)) Ts from[Cheque]\n" +
    "where ([StateId] = 4) and ([ChequeDate] >= convert(datetime, '<%= st_date %>'))\n" +
    "and ([ReceiptDate] is NULL) and (([TrialNum] is NULL) or ([TrialNum] < <%= max_trial %>))\n" +
    "order by 2";

const GET_CHEQUE_MYSQL =
    "select `Id`, coalesce(`LastTrialTs`, convert(0, datetime)) Ts from`Cheque`\n" +
    "where (`StateId` = 4) and (`ChequeDate` >= '<%= st_date %>')\n" +
    "and (`ReceiptDate` is NULL) and ((`TrialNum` is NULL) or (`TrialNum` < <%= max_trial %>))\n" +
    "order by 2<%= limit %>";

const dfltSettings = {
    maxRecNum: 100,
    maxTrial: 10,
    startDate: "2019-05-08 00:00:00"
};

exports.ReceiptCollectionTask = class ReceiptCollectionTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._settings = _.defaultsDeep(opts, dfltSettings);
        this._settings.startDate = new Date(this._settings.startDate);
        if (config.billing.enabled && config.has("billing.module")) {
            const { PaymentObject } = require(config.billing.module);
            this._paymentServise = PaymentObject();
        }
        else
            throw new Error(`Billing isn't configured.`);
    }

    async _collectReceipts() {
        // let dbg_data = [
        //     { ChequeNum: "2515ed73-000f-5000-9000-11c328871649", Id: 1, ChequeTypeId: 1 },
        //     { ChequeNum: "2458fa21-000f-5000-a000-16213b33bcaf", Id: 1, ChequeTypeId: 1 },
        //     { ChequeNum: "2458fc59-0015-5000-a000-1ff646e6357e", Id: 1, ChequeTypeId: 2 }
        // ];
        let data = [];
        let isDebug = (typeof (dbg_data) !== "undefined");
        if (!isDebug) {
            let limit_mssql = "";
            let limit_mysql = "";
            if (this._settings.maxRecNum) {
                limit_mssql = ` top ${this._settings.maxRecNum}`;
                limit_mysql = `\nlimit ${this._settings.maxRecNum}`;
            }
            let st_date = DbObject.dateToString(this._settings.startDate, true, true);
            let recs = await $data.execSql({
                dialect: {
                    mysql: _.template(GET_CHEQUE_MYSQL)({ max_trial: this._settings.maxTrial, limit: limit_mysql, st_date: st_date }),
                    mssql: _.template(GET_CHEQUE_MSSQL)({ max_trial: this._settings.maxTrial, limit: limit_mssql, st_date: st_date })
                }
            }, {});
            if (recs && recs.detail && (recs.detail.length > 0))
                data = recs.detail;
        }
        else
            data = dbg_data;
        for (let i = 0; i < data.length; i++){
            let elem = data[i];
            if (isDebug)
                await this._paymentServise.getReceipt(elem.Id, null, elem.ChequeNum, elem.ChequeTypeId)
            else
                await this._paymentServise.getReceipt(elem.Id);
        }
    }

    async run(fireDate) {
        return this._collectReceipts();
    }
};
