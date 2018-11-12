'use strict';
const request = require('request');
const { HttpMessage, HttpCode } = require('../../const/http-codes');
const { HttpError } = require('../../errors/http-error');

exports.login = (host, userName, password, isFullUserInfo) => {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: host + "/api/jwtlogin",
                body: { login: userName, password: password },
                json: true
            }, (error, response, body) => {
                try {
                    if (error)
                        reject(error)
                    else {
                        if (response.statusCode === HttpCode.OK) {
                            if (body.token)
                                resolve(isFullUserInfo ? body : body.token)
                            else
                                reject(new Error(`Authorithation failed for "${userName}": An empty JWT.`));
                        }
                        else
                            reject(new HttpError(response.statusCode, HttpMessage[response.statusCode]));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
    });
};

