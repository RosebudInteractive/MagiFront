const _ = require('lodash');
const config = require('config');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { getTimeStr, buildLogString } = require('../utils');
const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;

const CAMPAIGN_REQ_TREE = {
    expr: {
        model: {
            name: "Campaign",
        }
    }
};

const CAMPAIGN_CACHE_PREFIX = "cmpgn:";
const CACHE_TTL_IN_SEC = 20 * 24 * 60 * 60; // 20 days

const DbCampaign = class DbCampaign extends DbObject {

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = CAMPAIGN_CACHE_PREFIX;
        super(opts);
    }

    _getObjById(id, expression, options) {
        var exp = expression || CAMPAIGN_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    async getOrCreateByCode(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = _.cloneDeep(options || {});
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let campaignData = data || [];
        let isNew = false;
        let campaignId = null;
        
        let cacheId = `${campaignData.Source}:${campaignData.Medium}:${campaignData.Campaign}`;
        let rc = + await this.cacheGet(cacheId);

        if (!rc)
            return Utils.editDataWrapper(() => {
                return new MemDbPromise(this._db, resolve => {
                    let conds = [];
                    if (campaignData.Source)
                        conds.push({ field: "Source", op: "=", value: campaignData.Source })
                    else
                        throw new Error(`Missing field "Source".`);
                    if (campaignData.Medium)
                        conds.push({ field: "Medium", op: "=", value: campaignData.Medium })
                    else
                        throw new Error(`Missing field "Medium".`);
                    if (campaignData.Campaign)
                        conds.push({ field: "Campaign", op: "=", value: campaignData.Campaign })
                    else
                        throw new Error(`Missing field "Campaign".`);
                    resolve(this._getObjects(CAMPAIGN_REQ_TREE, conds, dbOpts));
                })
                    .then(async (result) => {
                        root_obj = result;
                        memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                        let collection = root_obj.getCol("DataElements");
                        let count = collection.count();
                        switch (count) {
                            case 0:
                                isNew = true;
                                break;
                            case 1:
                                campaignId = collection.get(0).id();
                                break;
                            default:
                                throw new Error(`Duplicate campaign: "${campaignData.Source}:${campaignData.Medium}:${campaignData.Campaign}".`)
                        }
                        if (isNew) {
                            await root_obj.edit();
                            let fields = {
                                Source: campaignData.Source,
                                Medium: campaignData.Medium,
                                Campaign: campaignData.Campaign
                            };
                            let { keyValue } = await root_obj.newObject({
                                fields: fields
                            }, dbOpts);

                            await root_obj.save(dbOpts);
                            campaignId = keyValue;
                        }
                    })
            }, memDbOptions)
                .then(async () => {
                    if (campaignId)
                        await this.cacheSet(cacheId, campaignId, { ttlInSec: CACHE_TTL_IN_SEC });
                    return campaignId;
                })
                .catch(err => {
                    if ((!opts.retry) && err.message) {
                        let message = err.message;
                        let parsed = message.match(/.*?duplicate.*?u_Idx_Campaign_Source_Medium_Campaign.*/ig);
                        if (parsed) {
                            opts.retry = true;
                            return this.getOrCreateByCode(data, opts);
                        }
                        else
                            throw err;
                    }
                    else
                        throw err;
                });
        return rc;
    }
};

let dbCampaign = null;
exports.CampaignService = () => {
    return dbCampaign ? dbCampaign : dbCampaign = new DbCampaign();
}
