'use strict';
const _ = require('lodash');
const config = require('config');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { getTimeStr, buildLogString } = require('../utils');

const Session = class Session extends DbObject {

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = config.has('redisSession.prefix') ? config.redisSession.prefix : '';
        super(opts);
    }

    async getStat(options) {
        let opts = options || {};
        let content = "Id\tSize\tTTL\tExpires\tUserId\tCampagnId";
        let rc = { filename: `sessions_all_${(new Date()).toLocaleString()}.txt` };
        let codes = await this.cacheGetKeyList("*");
        if (codes && Array.isArray(codes) && (codes.length > 0)) {
            for (let i = 0; i < codes.length; i++) {
                let elem = codes[i];
                let sesRaw = await this.cacheGet(elem, { isInternal: true, withTtl: true });
                if (sesRaw) {
                    let sz = sesRaw.value.length;
                    let value = JSON.parse(sesRaw.value);
                    content += `\n${elem}\t${sz}\t${sesRaw.time ? (sesRaw.time / 3600).toFixed(2) : 0}` +
                        `\t${value.cookie && value.cookie.expires ? value.cookie.expires : ''}` +
                        `\t${value.passport && value.passport.user ? value.passport.user : ''}` +
                        `\t${value.campaignId ? value.campaignId : ''}`;
                }
            }
        }
        rc.content = content;
        return rc;
    }
};

let session = null;
exports.SessionService = (options) => {
    return session ? session : session = new Session(options);
}
