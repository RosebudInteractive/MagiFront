'use strict';
const config = require('config');

exports.UserActivate = (activationKey, userCache) => {
    return new Promise((resolve, reject) => {
        resolve(userCache.activateUser(activationKey));
    });
};