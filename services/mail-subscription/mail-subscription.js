'use strict';
const config = require('config');
const sendpulse = require("sendpulse-api");

exports.MailSubscription = class MailSubscription {
    constructor() {
        sendpulse.init(config.mail.sendPulse.apiUserId, config.mail.sendPulse.apiSecret, config.mail.sendPulse.tmpPath);
    }

    listAddressBooks(limit, offset) {
        return new Promise(resolve => {
            sendpulse.listAddressBooks(result => { resolve(result) }, limit, offset);
        })
    }

    createCampaign(senderName, senderEmail, subject, body, bookId, name, attachments) {
        return new Promise(resolve => {
            sendpulse.createCampaign(result => { resolve(result) }, senderName, senderEmail, subject, body, bookId, name, attachments);
        })
    }
}