'use strict'
const _ = require('lodash');
const config = require('config');
const { Data } = require('../../const/common');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

class PushNotification {
    constructor() { }

    subscribe(data) {
        
    }    

    unSubscribe(data) {

    }    
}

let pushNotification = null;
function getPushNotification() {
    return pushNotification ? pushNotification : pushNotification = new PushNotification();
}
exports.SetupRoute = (app) => {

    app.post("/api/push/subscribe", (req, res, next) => {
        getPushNotification().subscribe(req.body)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                next(err);
            });
    });

    app.post("/api/push/unsubscribe", (req, res, next) => {
        getPushNotification().unSubscribe(req.body)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                next(err);
            });
    });
};