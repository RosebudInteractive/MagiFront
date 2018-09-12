'use strict';
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const { MailSubscription } = require('./mail-subscription');

let mailSubscription = null;
let subscriptionService = () => {
    if (!mailSubscription)
        mailSubscription = new MailSubscription();
    return mailSubscription;
}
exports.SubscriptionService = subscriptionService;

exports.SetupRoute = (app) => {
};