'use strict';
const config = require('config');
const nodemailer = require('nodemailer');
const htmlToText = require('nodemailer-html-to-text').htmlToText;

let transporters = {};

function getTransporter(transporter) {
    let result = transporters[transporter];
    if (!result) {
        if (config.has('mail.' + transporter)) {
            let type = config.get('mail.' + transporter + '.type');
            switch (type) {
                case "smtp":
                    result = transporters[transporter] = nodemailer.createTransport(config.get('mail.' + transporter + '.options'));
                    result.use('compile', htmlToText());
                    break;
                default:
                    throw new Error("Invalid EMail transporter type: \"" + type + "\" (mail." + transporter + ").");
            }
        }
        else
            throw new Error('Configuration doesn\'t contain a key "mail.' + transporter + '".');
    }
    return result;
}

exports.SendMail = (transporter, message) => {
    return new Promise((resolve, reject) => {
        resolve(getTransporter(transporter));
    })
        .then((trans) => {
            return trans.sendMail(message);
    })
}