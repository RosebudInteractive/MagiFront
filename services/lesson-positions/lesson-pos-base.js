'use strict'
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const KEY_PREFIX = "lpos:user:";

exports.LessonPositionsBase = class LessonPositionsBase {

    get keyPrefix() {
        return this._keyPrefix;
    }

    constructor(options) {
        let opts = options || {};
        this._keyPrefix = opts.keyPrefix ? opts.keyPrefix : KEY_PREFIX;
    }

    getAllLessonPositions(userId) {
        return this._getAllPos(userId);
    }

    setLessonPositions(userId, pos) {
        return new Promise((resolve) => {
            resolve(
                this._getAllPos(userId)
                    .then((currPos) => {
                        let resData = { lsn: {} };
                        let result = resData;

                        let positions = pos || {};
                        let ts = positions.ts ? positions.ts : 0;
                        let lessons = positions.lsn ? positions.lsn : {};
                        resData.ts = ts;
                        let newPos = [];

                        for (let lsnId in lessons) {
                            let cpos = currPos[lsnId];
                            let t = 0;
                            let ut = 0;
                            if (cpos) {
                                t = cpos.t ? cpos.t : 0;
                                ut = cpos.ut ? cpos.ut : 0;
                                if (cpos.ts > resData.ts)
                                    resData.ts = cpos.ts;
                                delete currPos[lsnId];
                            }
                            let lpos = lessons[lsnId];
                            if (lpos.pos || lpos.isFinished) {
                                let dt = lpos.dt ? lpos.dt : 0;
                                let r = lpos.r ? lpos.r : 1;
                                let pos = { id: lsnId, data: { t: t + dt, ut: ut + (dt / r) } };
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
                                    resData.lsn[lsnId] = { isFinished: true }
                                else
                                    resData.lsn[lsnId] = { pos: pos.pos };
                            }
                        }
                        
                        if (newPos.length > 0) {
                            result = Utils.seqExec(newPos, (elem) => {
                                elem.data.ts = (new Date()) - 0;
                                return this._setPos(userId, elem);
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
}