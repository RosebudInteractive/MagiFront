'use strict';
const request = require('request');
const fs = require('fs');
const { URL } = require('url');
const { HttpMessage, HttpCode } = require('../const/http-codes');
const { HttpError } = require('../errors/http-error');
const uccelloUtils = require('../../Uccello2/system/utils');

// const HOST = "http://localhost:3000";
const HOST = "https://new.magisteria.ru";

function _login(userName, password) {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: HOST + "/api/jwtlogin",
                body: { login: userName, password: password },
                json: true
            }, (error, response, body) => {
                try {
                    if (error)
                        reject(error)
                    else {
                        if (response.statusCode === HttpCode.OK) {
                            if (body.token)
                                resolve(body.token)
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
}

function _setPosition(token, ts, lessonId, pos, dt) {
    return new Promise((resolve, reject) => {
        let position = {
            ts: ts,
            lsn: {}
        };
        position.lsn[lessonId] = { pos: pos, dt: dt };
        request.post(
            {
                url: HOST + "/api/lsnpos",
                headers: { "Authorization": "JWT " + token },
                body: position,
                json: true
            }, (error, response, body) => {
                try {
                    if (error)
                        reject(error)
                    else {
                        if (response.statusCode === HttpCode.OK)
                            resolve(body)
                        else
                            reject(new HttpError(response.statusCode, HttpMessage[response.statusCode]));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
    });
}

let maxLesson = 200;
let users = [
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" }
]
function setUserPositionTest(login, password, num) {
    let token;
    let ts = 0;
    let stTime;
    return new Promise(resolve => {
        resolve(_login(login, password));
    })
        .then(result => {
            token = result;
            stTime = new Date();
            let lsn = Math.round(Math.random() * (maxLesson - 1)) + 1;
            return _setPosition(token, ts, lsn, 1.1, 0.1);
        })
        .then(result => {
            ts = result.ts;
            return uccelloUtils.seqExec(num, n => {
                let lsn = Math.round(Math.random() * (maxLesson - 1)) + 1;
                return _setPosition(token, ts, lsn, 1.2, 0.1)
                    .then(result => {
                        ts = result.ts;
                    });
            })
        })
        .then(() => {
            let time = ((new Date()) - stTime) / 1000;
            return { isErr: false, result: { num: num, time: time, rate: num / time } };
        })
        .catch(err => {
            return { isErr: true, error: (err instanceof Error ? err.message : JSON.stringify(err)) };
        })
}

function setPositionTest(num) {
    return new Promise(resolve => {
        let promises = [];
        users.forEach(elem => {
            promises.push(setUserPositionTest(elem.login, elem.password, num));
        });
        resolve(Promise.all(promises));
    })
}

exports.SetPosition = {
    _login: _login,
    _setPosition: _setPosition,
    setPositionTest: setPositionTest
};