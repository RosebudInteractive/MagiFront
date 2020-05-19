'use strict';
const config = require('config');
const { RenderMailHTML } = require('./utils');
const { SendMail } = require('./index');
const { buildLogString, validateEmail } = require('../utils');

const WELCOME_MAILING_PATH = "/mailing/registration";
const WELCOME_MAIL_CFG_NAME = "userWelcome";

exports.SendWelcomeMail = async (user) => {
    try {
        if (config.has(`mail.${WELCOME_MAIL_CFG_NAME}`)) {
            let user_name = user.DisplayName && (!validateEmail(user.DisplayName)) ? user.DisplayName : null;
            let params = { username: user_name };
            let { html } = await RenderMailHTML(WELCOME_MAILING_PATH, { params: params });
            let mailOptions = {
                disableUrlAccess: false,
                from: config.mail[WELCOME_MAIL_CFG_NAME].sender, // sender address
                to: user.Email, // list of receivers
                subject: config.mail[WELCOME_MAIL_CFG_NAME].subject, // Subject line
                html: html // html body
            };
            let mailResult = await SendMail(WELCOME_MAIL_CFG_NAME, mailOptions);
            if (mailResult && mailResult.msgUrl)
                console.error(buildLogString(`### Course purchase email: ${mailResult.msgUrl}`));
        }
    }
    catch (err) {
        console.error(buildLogString(`SendWelcomeMail: ${err}`));
    }
}