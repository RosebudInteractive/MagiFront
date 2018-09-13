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

    addEmails(id, emails) {
        return new Promise(resolve => {
            sendpulse.addEmails(result => { resolve(result) }, id, emails);
        })
    }

    addEmailToAddressBook(addressBookName, email, name, lastName) {
        return this.listAddressBooks()
            .then(result => {
                let addressBooks = {};
                if (result && Array.isArray(result) && (result.length)) {
                    result.forEach(elem => {
                        addressBooks[elem.name] = elem;
                    })
                    let book = addressBooks[addressBookName];
                    if (!book)
                        throw new Error(`Mail list "${addressBookName}" is missing!`);
                    return book.id;
                }
                else
                    throw new Error(`List of address books is empty!`);
            })
            .then((bookId) => {
                return new Promise(resolve => {
                    let emailObj = { email: email, variables: {} };
                    if (typeof (name) === "string") {
                        emailObj.variables.name = name;
                    }
                    if (typeof (lastName) === "string") {
                        emailObj.variables.last_name = lastName;
                    }
                    else
                        if (emailObj.variables.name) {
                            let parts = emailObj.variables.name.split(" ");
                            let cnt = 0;
                            for (let i = 0; i < parts.length; i++){
                                if (parts[i].length > 0) {
                                    cnt++;
                                    if (cnt === 1)
                                        emailObj.variables.name = parts[i]
                                    else
                                        if (cnt === 2) {
                                            emailObj.variables.last_name = parts[i]
                                            break;
                                        }
                                }
                            }
                        }
                    sendpulse.addEmails(result => { resolve(result) }, bookId, [emailObj]);
                })
            });
    }
}