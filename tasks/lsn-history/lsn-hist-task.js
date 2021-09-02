'use strict';
const _ = require('lodash');
const config = require('config');
const { URL, URLSearchParams } = require('url');
const fs = require('fs');

const { Task } = require('../lib/task');
const { HttpCode } = require('../../const/http-codes');
const { SendMail } = require('../../mail');
const { UsersCache } = require("../../security/users-cache");
const { LsnHistoryService } = require('../../database/db-lsn-history');
const { getTimeStr, buildLogString } = require('../../utils');
const { DbUtils } = require('../../database/db-utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const MAX_CORRUPT_CODES = 5000;

const dfltSettings = {
    maxInsertNum: 10,
    completion: {
        maxInsertNum: 10,
        coeff: 0.95,
    },
    logStat: false
};

exports.LsnHistTask = class LsnHistTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._settings = _.defaultsDeep(opts, dfltSettings);
        let hstOpts;
        if (config.has("lessonPositions.keyHistPrefix"))
            hstOpts = {
                cache: { prefix: config.lessonPositions.keyHistPrefix }
            };
        let maxIdle = config.has("lessonPositions.maxIdle") ? config.lessonPositions.maxIdle : null;
        this._settings.maxIdle = opts.maxIdle ? opts.maxIdle : (maxIdle ? maxIdle : LessonPos.MAX_IDLE_INTERVAL);
        this._lsnHstService = LsnHistoryService(hstOpts);
    }

    _processHstElems(elemCodes, hstElems) {
        return new Promise(resolve => {
            let rc;
            if (elemCodes.length > 0) {
                rc = this._lsnHstService.insert(hstElems)
                    .then(() => {
                        return this._lsnHstService.cacheDelKeyList(elemCodes);
                    });
            }
            resolve(rc);
        });  
    }

    async _processCompletion() {
        let stTime = new Date();
        let rc = await this._lsnHstService.setLessonCompleted(this._settings.completion);
        if (this._settings.logStat) {
            let msg = `Lesson completion: ${rc} lesson(s), ` +
                `time taken: ${DbUtils.fmtDuration(((new Date()) - stTime) / 1000)}.`;
            console.log(buildLogString(msg));
        };
    }

    _importHstFromCache() {
        let totUsers = {};
        let totLessons = {};
        let corruptCodes = [];
        let totTime = 0;
        let totUserTime = 0;
        let totItems = 0;
        let totCorrupt = 0;
        let totCorruptRemoved = 0;
        return new Promise(resolve => {
            let rc = this._lsnHstService.cacheGetKeyList("*");
            resolve(rc);
        })
            .then(codes => {
                if (codes && Array.isArray(codes) && (codes.length > 0)) {
                    let hstElems = [];
                    let elemCodes = [];
                    return Utils.seqExec(codes, (elem) => {
                        return this._lsnHstService.cacheGet(elem, { isInternal: true })
                            .then(_elem => {
                                let hstElem = JSON.parse(_elem);
                                if (hstElem && hstElem.ts) {
                                    let now = (new Date()) - 0;
                                    if (((now - hstElem.ts) / 1000) > this._settings.maxIdle) {
                                        let flds = elem.split(":");
                                        if (flds.length >= 4) {
                                            let ts_start = +flds[3];
                                            hstElem.ts_start = ts_start;

                                            let data = {
                                                UserId: +flds[1],
                                                LessonId: +flds[2],
                                                StDate: new Date(ts_start),
                                                FinDate: new Date(hstElem.ts),
                                                LsnTime: hstElem.t,
                                                UserTime: hstElem.ut,
                                                RawData: JSON.stringify(hstElem)
                                            };

                                            if ((flds.length > 4) && flds[4])
                                                data.CampaignId = +flds[4];
                                            
                                            totUsers[data.UserId] = true;
                                            totLessons[data.LessonId] = true;
                                            totTime += data.LsnTime;
                                            totUserTime += data.UserTime;
                                            totItems++;

                                            hstElems.push(data);
                                            elemCodes.push(elem);
                                        }
                                    }
                                }
                                else {
                                    totCorrupt++;
                                    if (corruptCodes.length < MAX_CORRUPT_CODES) {
                                        corruptCodes.push(elem);
                                        totCorruptRemoved++;
                                    }
                                }
                                if (hstElems.length >= this._settings.maxInsertNum)
                                    return this._processHstElems(elemCodes, hstElems)
                                        .then(() => {
                                            elemCodes = [];
                                            hstElems = [];
                                        });
                            })
                    })
                        .then(() => {
                            return this._processHstElems(elemCodes, hstElems);
                        });
                }
            })
            .then(() => {
                if (corruptCodes.length > 0)
                    return this._lsnHstService.cacheDelKeyList(corruptCodes);
            })
            .then(() => {
                if (this._settings.logStat) {
                    let tot_users = Object.keys(totUsers).length;
                    let tot_lessons = Object.keys(totLessons).length;
                    totTime = Math.round(totTime);
                    totUserTime = Math.round(totUserTime);
                    let msg = `Listening history import: ${totItems} item(s), ${tot_lessons} lesson(s), ${tot_users} user(s), ` +
                        ` ${totCorruptRemoved}:${totCorrupt} corrupted, `+
                        `total time: ${DbUtils.fmtDuration(totTime)}, user time: ${DbUtils.fmtDuration(totUserTime)}.`;
                    console.log(buildLogString(msg));
                };
            });
    }

    async run(fireDate) {
        await this._importHstFromCache();
        await this._processCompletion();
    }
};
