'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const escape = require('escape-html');

const { SendMail } = require('../../mail');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

exports.Feedback = class Feedback {
    constructor() { }

    processFeedback(sender, message, options) {
        let dbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        if ((!dbOpts.userId) && opts.user)
            dbOpts.userId = opts.user.Id;
        let root_obj;
        let db = $memDataBase;
        let templateBody;

        let new_obj;
        let root_lsn;
        let fields;
        let resData;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(db, (resolve, reject) => {

                if ((typeof (sender) !== "string") || (sender.length === 0))
                    throw new Error(`Argument "sender" is empty or invalid: "${sender}"`);

                if ((typeof (message) !== "string") || (message.length === 0))
                    throw new Error(`Argument "message" is empty or invalid: "${message}"`);

                var predicate = new Predicate(db, {});
                predicate
                    .addCondition({ field: "Id", op: "=", value: -1 });
                let exp =
                {
                    expr: {
                        model: {
                            name: "Feedback"
                        },
                        predicate: predicate.serialize(true)
                    }
                };
                db._deleteRoot(predicate.getRoot());
                resolve(db.getData(Utils.guid(), null, null, exp, {}));
            })
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("Invalid result of \"getData\": " + JSON.stringify(result));

                    dbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    if (config.has("mail.feedback.template")) {
                        return readFileAsync(config.mail.feedback.template, "utf8")
                            .then(data => { templateBody = data });
                    }
                })
                .then(() => {
                    fields = {
                        SenderContact: sender,
                        MessageText: message,
                        Status: "ready"
                    };
                    let user = "";
                    if (opts.user) {
                        fields.UserId = opts.user.Id;
                        user = _.template(`<b>Пользователь: </b><%= udata %><br>`)
                            ({ udata: escape(`{id: ${opts.user.Id}, email: "${opts.user.Email}"}`) });
                    }
                    if (templateBody)
                        fields.Body = _.template(templateBody)({ sender: escape(sender), user: user, message: escape(message) });
                    if (config.has("mail.feedback.subject"))
                        fields.Subject = _.template(config.mail.feedback.subject)({ sender: sender, dt: (new Date()).toISOString() });
                    if (config.has("mail.feedback.recipients"))
                        fields.Recipients = config.mail.feedback.recipients;
                    
                    return root_obj.newObject({
                        fields: fields
                    }, dbOpts);
                })
                .then((result) => {
                    new_obj = db.getObj(result.newObject);
                    return root_obj.save(dbOpts);
                })
                .then(() => {
                    return new_obj.edit();
                })
                .then(() => {
                    if (fields.Recipients) {
                        let mailOptions = {
                            from: config.mail.feedback.sender, // sender address
                            to: fields.Recipients // list of receivers
                        };
                        if (fields.Subject)
                            mailOptions.subject = fields.Subject;
                        if (fields.Body)
                            mailOptions.html = fields.Body;
                        return SendMail("feedback", mailOptions)
                            .then(msg => {
                                resData = {
                                    result: "OK"
                                };
                                if (msg && msg.msgUrl)
                                    resData.msgUrl = msg.msgUrl;
                            }, err => {
                                resData = {
                                    result: "ERROR",
                                    message: err && err.message ? err.message : JSON.stringify(err)
                                };
                            });
                    }
                })
                .then(() => {
                    if (resData) {
                        new_obj.status(resData.result === "OK" ? "sent" : "error");
                        new_obj.resBody(JSON.stringify(resData));
                        return new_obj.save(dbOpts);
                    }
                    else
                        resData = { result: "OK" };
                })
                .then(() => {
                    return resData;
                });
        }, dbOptions)
    }
}