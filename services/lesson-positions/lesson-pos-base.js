'use strict'
const config = require('config');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { LessonPos } = require('../../const/lesson-pos');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

exports.LessonPositionsBase = class LessonPositionsBase {

    get keyPrefix() {
        return this._keyPrefix;
    }

    get keyHistPrefix() {
        return this._keyHistPrefix;
    }

    get maxIdle() {
        return this._maxIdle;
    }

    get histTTL() {
        return this._histTTL;
    }

    get maxInterval() {
        return this._maxInterval;
    }

    constructor(options) {
        let opts = options || {};
        let prefix = config.has("lessonPositions.keyPrefix") ? config.lessonPositions.keyPrefix : null;
        this._keyPrefix = opts.keyPrefix ? opts.keyPrefix : (prefix ? prefix : LessonPos.KEY_PREFIX);
        let hist_prefix = config.has("lessonPositions.keyHistPrefix") ? config.lessonPositions.keyHistPrefix : null;
        this._keyHistPrefix = opts.keyHistPrefix ? opts.keyHistPrefix : (hist_prefix ? hist_prefix : LessonPos.KEY_HIST_PREFIX);
        let maxIdle = config.has("lessonPositions.maxIdle") ? config.lessonPositions.maxIdle : null;
        this._maxIdle = opts.maxIdle ? opts.maxIdle : (maxIdle ? maxIdle : LessonPos.MAX_IDLE_INTERVAL);
        let histTTL = config.has("lessonPositions.histTTL") ? config.lessonPositions.histTTL : null;
        this._histTTL = opts.histTTL ? opts.histTTL : (histTTL ? histTTL : LessonPos.HIST_TTL);
        let maxInterval = config.has("lessonPositions.maxInterval") ? config.lessonPositions.maxInterval : null;
        this._maxInterval = opts.maxInterval ? opts.maxInterval : (maxInterval ? maxInterval : LessonPos.MAX_INTERVAL);
    }

    getAllLessonPositions(userId) {
        return this._getAllPos(userId);
    }

    setHist(userId, data) {
        return new Promise(resolve => {
            if (!data)
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Arg "data" is empty.`
                });
            if (typeof (data.id) !== "number")
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Field "id" isn't a number: "${data.id}".`
                });
            if (typeof (data.t) !== "number")
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Field "t" isn't a number: "${data.t}".`
                });
            if (typeof (data.ut) !== "number")
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Field "ut" isn't a number: "${data.ut}".`
                });
            if (typeof (data.ts) !== "number")
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Field "ts" isn't a number: "${data.ts}".`
                });
            if (typeof (data.ts_start) !== "number")
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Field "ts_start" isn't a number: "${data.ts_start}".`
                });
            if (data.ts_start > data.ts)
                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, {
                    error: "invArg",
                    message: `LessonPositionsBase::setHist: Field "ts_start" (${data.ts_start}) > "ts" (${data.ts}).`
                });
            let hist = { t: data.t, ut: data.ut, ts: data.ts };
            let rc = this._setHist(userId, data.id, data.ts_start, null, hist, this.histTTL);
            resolve(rc);
        });
    }

    setLessonPositions(userId, pos) {
        return new Promise((resolve) => {
            // console.error(`### ${userId}: ${JSON.stringify(pos)}`);
            resolve(
                this._getAllPos(userId)
                    .then((currPos) => {
                        let resData = { lsn: {} };
                        let result = resData;

                        let positions = pos || {};
                        let campaignId = positions.campaignId ? positions.campaignId : null;
                        delete positions.campaignId;
                        let ts = positions.ts ? positions.ts : 0;
                        let lessons = positions.lsn ? positions.lsn : {};
                        resData.ts = ts;
                        let newPos = [];
                        let currTime = (new Date()) - 0;

                        for (let lsnId in lessons) {
                            let cpos = currPos[lsnId];
                            let ts_start = 0;
                            let ts = 0;
                            if (cpos) {
                                ts_start = cpos.ts_start ? cpos.ts_start : ts_start;
                                ts = cpos.ts ? cpos.ts : ts;
                                if (cpos.ts > resData.ts)
                                    resData.ts = cpos.ts;
                                delete currPos[lsnId];
                            }
                            let lpos = lessons[lsnId];
                            if (lpos.pos || lpos.isFinished) {
                                let dt = lpos.dt ? lpos.dt : 0;
                                let r = lpos.r ? lpos.r : 1;
                                if ((!ts_start) || (!ts) || (((currTime - ts) / 1000) > this.maxIdle)
                                    || (((currTime - ts_start) / 1000) > this.maxInterval))
                                    ts_start = currTime;
                                ts = currTime;
                                let pos = { id: lsnId, data: { ts_start: ts_start, ts: ts }, hist: { t: dt, ut: (dt / r), ts: ts } };
                                if (lpos.isFinished)
                                    pos.data.isFinished = true
                                else
                                    pos.data.pos = lpos.pos;
                                newPos.push(pos);
                            }
                        }

                        for (let lsnId in currPos) {
                            let pos = currPos[lsnId];
                            if (pos.ts > resData.ts)
                                resData.ts = pos.ts;
                            if (pos.ts > ts) {
                                if (pos.isFinished)
                                    resData.lsn[lsnId] = { isFinished: true, ts: pos.ts }
                                else
                                    resData.lsn[lsnId] = { pos: pos.pos, ts: pos.ts };
                            }
                        }
                        
                        if (newPos.length > 0) {
                            result = Utils.seqExec(newPos, (elem) => {
                                return this._getHist(userId, elem.id, elem.data.ts_start, campaignId)
                                    .then(histRes => {
                                        if (histRes) {
                                            elem.hist.t += histRes.t ? histRes.t : 0;
                                            elem.hist.ut += histRes.ut ? histRes.ut : 0;
                                        }
                                        return this._setHist(userId, elem.id, elem.data.ts_start, campaignId, elem.hist, this.histTTL)
                                    })
                                    .then(() => {
                                        return this._setPos(userId, elem);
                                    });
                            })
                                .then(() => {
                                    return resData;
                                });
                        }
                        return result;
                    })
            );
        });
    }

    _getAllPos(userId) {
        return Promise.reject(new Error("LessonPositionsBase::_getAllPos: Not implemented."));
    }

    _setPos(userId, pos) {
        return Promise.reject(new Error("LessonPositionsBase::_getAllPos: Not implemented."));
    }

    _getHist(userId, lsnId, ts, campaignId) {
        return Promise.reject(new Error("LessonPositionsBase::_getHist: Not implemented."));
    }

    _setHist(userId, lsnId, ts, campaignId, data, ttl) {
        return Promise.reject(new Error("LessonPositionsBase::_setHist: Not implemented."));
    }
}