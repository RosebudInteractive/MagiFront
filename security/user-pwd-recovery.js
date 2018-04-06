'use strict';
const path = require('path');
const fs = require('fs');
const config = require('config');
const _ = require('lodash');
const randomstring = require('randomstring');

const { Activation } = require('../const/activation');
const { SendMail } = require('../mail');

const MAIL_CFG_NAME = "pwdRecovery";

exports.UserPwdRecovery = (user_data, userCache) => {
    let user;
    return new Promise((resolve, reject) => {
        if (!user_data.Password) {
            user_data.ActivationKey = randomstring.generate(Activation.ACTIVATION_KEY_LENGTH);
            user_data.ExpDate = new Date((new Date()) - 0 + (Activation.EXP_PERIOD_SEC * 1000));
        }
        resolve(userCache.userPwdRecovery(user_data));
    })
        .then((res) => {
            user = res;
            let result;
            if (config.has("mail." + MAIL_CFG_NAME + ".template")) {
                let fn = config.mail[MAIL_CFG_NAME].template;
                if (!path.isAbsolute(fn))
                    fn = path.join(config.root, fn);
                result = new Promise((resolve, reject) => {
                    fs.readFile(fn, "utf8", (err, data) => {
                        if (err) reject(err)
                        else
                            resolve(data);
                    });
                })
            }
            else
                result = config.mail[MAIL_CFG_NAME].htmlBody;
            return result;
        })
        .then((template) => {
            let body = _.template(template)(
                {
                    link: config.proxyServer.siteHost + config.authentication.recoveryRoute + '/' + user_data.ActivationKey
                });
            let mailOptions = {
                disableUrlAccess: false,
                from: config.mail[MAIL_CFG_NAME].sender, // sender address
                to: user.Email, // list of receivers
                subject: config.mail[MAIL_CFG_NAME].subject, // Subject line
                html: body // html body
            };
            return SendMail(MAIL_CFG_NAME, mailOptions)
                .then((mailResult) => {
                    let result = userCache.userToClientJSON(user);
                    if (mailResult.msgUrl)
                        result.msgUrl = mailResult.msgUrl;
                    return result;
                });
        });
};