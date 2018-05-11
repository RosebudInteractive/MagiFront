'use strict';
const path = require('path');
const fs = require('fs');
const config = require('config');
const _ = require('lodash');
const randomstring = require('randomstring');

const { Activation } = require('../const/activation');
const { SendMail } = require('../mail');

const MAIL_CFG_NAME = "userReg";

let SendRegMail = (userCache, user, address, activationKey) => {
    return new Promise((resolve, reject) => {
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
        resolve(result);
    })
        .then((template) => {
            let body = _.template(template)(
                {
                    link: config.proxyServer.siteHost + config.authentication.activationRoute + '/' + activationKey
                });
            let mailOptions = {
                disableUrlAccess: false,
                from: config.mail[MAIL_CFG_NAME].sender, // sender address
                to: address, // list of receivers
                subject: config.mail[MAIL_CFG_NAME].subject, // Subject line
                html: body // html body
            };
            return SendMail(MAIL_CFG_NAME, mailOptions)
                .then((mailResult) => {
                    let rc = userCache.userToClientJSON(user);
                    if (mailResult && mailResult.msgUrl && rc.PData)
                        rc.PData.msgUrl = mailResult.msgUrl;
                    return rc;
                });
        });
};

exports.SendRegMail = SendRegMail;
exports.UserRegister = (password, data, userCache) => {
    let user;
    return new Promise((resolve, reject) => {
        data.PData = { "roles": { "p": 1 }, "isAdmin": false }; // Role - "pending"
        data.Name = data.Name ? data.Name : data.Login;
        data.DisplayName = data.DisplayName ? data.DisplayName : data.Name;
        data.Email = data.Email ? data.Email : data.Login;
        if (!/^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(data.Email))
            throw new Error("Email \"" + data.Email + "\"has incorrect format.");
        data.RegDate = new Date();
        data.ExpDate = new Date(data.RegDate - 0 + (Activation.EXP_PERIOD_SEC * 1000));
        data.ActivationKey = randomstring.generate(Activation.ACTIVATION_KEY_LENGTH);
        resolve(userCache.createUser(password, data));
    })
        .then((res) => {
            return SendRegMail(userCache, res, data.Login, data.ActivationKey);
        });
};
