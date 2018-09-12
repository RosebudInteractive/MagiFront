'use strict';
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const { MailSubscription } = require('./mail-subscription');
const { UsersCache } = require('../../security/users-cache');

let mailSubscription = null;
let subscriptionService = () => {
    if (!mailSubscription)
        mailSubscription = new MailSubscription();
    return mailSubscription;
}

if (config.has("mail.autosubscribe.enabled") && config.mail.autosubscribe.enabled
    && config.has("mail.autosubscribe.mailList")) {
    let subsService = subscriptionService();
    let mailList = config.mail.autosubscribe.mailList;
    UsersCache().setAfterUserCreateEvent(userData => {
        return subsService.addEmailToAddressBook(mailList, userData.Email, userData.DisplayName)
            .then(result => {
                if (result === false)
                    console.error(`addEmailToAddressBook: Failed to add email "${userData.Email}" to mailing list: "${mailList}".`)
            }, err => {
                console.error(`addEmailToAddressBook: Failed to add email "${userData.Email}" to mailing list: "${mailList}".` +
                    ` Error: ${err && err.message ? err.message : JSON.stringify(err)}`);
                })
            .then(() => userData);
    })
}

exports.SubscriptionService = subscriptionService;
exports.SetupRoute = (app) => {
    if (config.has("mail.autosubscribe.mailList")) {
        let subsService = subscriptionService();
        let mailList = config.mail.autosubscribe.mailList;
        app.post('/api/mail-subscription', (req, res, next) => {
            subsService.addEmailToAddressBook(mailList, req.body.Email, req.body.Name, req.body.LastName)
                .then(result => {
                    if (result === false)
                        throw new Error(`Failed to add email "${req.body.Email}" to mailing list: "${mailList}".`)
                    res.send({ result: "OK" });
                })
                .catch(err => {
                    next(err);
                });
        });
    }
};