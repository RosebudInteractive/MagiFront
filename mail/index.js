'use strict';
const config = require('config');
const nodemailer = require('nodemailer');
const htmlToText = require('nodemailer-html-to-text').htmlToText;

let transporters = {};

function getTransporter(transporter) {
    return new Promise((resolve, reject) => {
        let result = transporters[transporter];
        if (!result) {
            if (config.has('mail.' + transporter)) {
                let type = config.get('mail.' + transporter + '.type');
                switch (type) {
                    case "smtp":
                        result = transporters[transporter] = nodemailer.createTransport(config.get('mail.' + transporter + '.options'));
                        result.use('compile', htmlToText());
                        break;
                    case "test":
                        result = new Promise((resolve, reject) => {
                            nodemailer.createTestAccount((err, account) => {
                                if (err)
                                    reject(err)
                                else {
                                    let tran = transporters[transporter] = nodemailer.createTransport({
                                        host: 'smtp.ethereal.email',
                                        port: 587,
                                        secure: false, // true for 465, false for other ports
                                        auth: {
                                            user: account.user, // generated ethereal user
                                            pass: account.pass // generated ethereal password
                                        }
                                    });
                                    tran.use('compile', htmlToText());
                                    resolve(tran);
                                }
                            });
                        });
                        break;
                    default:
                        throw new Error("Invalid EMail transporter type: \"" + type + "\" (mail." + transporter + ").");
                }
            }
            else
                throw new Error('Configuration doesn\'t contain a key "mail.' + transporter + '".');
        }
        resolve(result);
    });
}

exports.SendMail = (transporter, message) => {
    return new Promise((resolve, reject) => {
        resolve(getTransporter(transporter));
    })
        .then((trans) => {
            return trans.sendMail(message)
                .then((info) => {
                    let msgUrl = nodemailer.getTestMessageUrl(info);
                    return { info: info, msgUrl: msgUrl };
                });
    })
}
