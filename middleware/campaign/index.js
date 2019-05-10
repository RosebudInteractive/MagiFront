'use strict';
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const { buildLogString } = require('../../utils');
const { CampaignService } = require('../../database/db-campaign');

async function _processor(req, res, next) {
    try {
        if (req.session && req.query.utm_source && req.query.utm_medium && req.query.utm_campaign) {
            let opts = req.user ? { dbOptions: { userId: req.user.Id } } : {};
            let campaignId = await CampaignService().getOrCreateByCode({
                Source: req.query.utm_source,
                Medium: req.query.utm_medium,
                Campaign: req.query.utm_campaign
            }, opts);
            if (campaignId && (campaignId !== req.session.campaignId)) {
                req.session.campaignId = campaignId;
            }
        }
        if (req.session.campaignId)
            req.campaignId = req.session.campaignId;
    }
    catch (err) {
        console.error(buildLogString(`campaign::_processor: ${err.message ? err.message : err.toString()}`));
    }
    next();   
}

module.exports = (req, res, next) => {
    _processor(req, res, next);
};
