'use strict';
const request = require('request');
const fs = require('fs');
const { URL } = require('url');
const { login } = require('./utils');
const { HttpMessage, HttpCode } = require('../const/http-codes');
const { HttpError } = require('../errors/http-error');
const uccelloUtils = require('../../Uccello2/system/utils');

// const HOST = "http://localhost:3000";
const HOST = "https://new.magisteria.ru";

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

let users = [
    { login: "adm@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" }
];

// ===================================================================
// Output: Rate: 311.3406 op/sec, ops: 60000, time: 192.715 sec.
// Server: new.magisteria.ru, ? node instance
// ===================================================================
// Output: Rate: 277.1913 op/sec, ops: 60000, time: 216.457 sec.
// Date: 2019-02-03
// SHA-1: 3e2459951ce4f7f57c1570cdd9493978b757ad1e
// Comment: Listening history collection in Cache & DB.
// Server: new.magisteria.ru, 1 node instance
// ===================================================================

let ranges = [
    { min: 1, max: 10 },
    { min: 11, max: 20 },
    { min: 21, max: 30 },
    { min: 31, max: 40 },
    { min: 41, max: 50 },
    { min: 51, max: 60 },
    { min: 61, max: 70 },
    { min: 71, max: 80 },
    { min: 81, max: 90 },
    { min: 91, max: 100 },
    { min: 101, max: 110 },
    { min: 111, max: 120 },
    { min: 121, max: 130 },
    { min: 131, max: 140 },
    { min: 141, max: 150 },
    { min: 151, max: 160 },
    { min: 161, max: 170 },
    { min: 171, max: 180 },
    { min: 181, max: 190 },
    { min: 191, max: 200 }
];

function setUserPositionTest(user, password, num, range) {
    let token;
    let ts = 0;
    let stTime;
    let maxLesson;
    let currNum = 0;
    return new Promise(resolve => {
        maxLesson = range.max - range.min;
        if ((typeof (maxLesson) !== "number") || (maxLesson <= 0)) {
            throw new Error(`Invalid range: "${JSON.stringify(range)}"`);
        }
        resolve(login(HOST, user, password));
    })
        .then(result => {
            token = result;
            stTime = new Date();
            let lsn = Math.round(Math.random() * maxLesson) + range.min;
            return _setPosition(token, ts, lsn, 1.1, 0.1);
        })
        .then(result => {
            ts = result.ts;
            return uccelloUtils.seqExec(num, n => {
                let lsn = Math.round(Math.random() * maxLesson) + range.min;
                return _setPosition(token, ts, lsn, 1.2, 0.1)
                    .then(result => {
                        ts = result.ts;
                        currNum++;
                    });
            })
        })
        .then(() => {
            let time = ((new Date()) - stTime) / 1000;
            return { isErr: false, result: { num: currNum, time: time, rate: (time > 10e-6 ? (currNum / time) : 0) } };
        })
        .catch(err => {
            return {
                isErr: true,
                error: (err instanceof Error ? err.message : JSON.stringify(err)),
                result: { num: currNum, time: time, rate: (time > 10e-6 ? (currNum / time) : 0) }
            };
        })
}

function setPositionTest(num) {
    return new Promise(resolve => {
        let promises = [];
        users.forEach(elem => {
            ranges.forEach(item => {
                promises.push(setUserPositionTest(elem.login, elem.password, num, item));
            });
        });
        resolve(Promise.all(promises));
    })
}

exports.SetPosition = {
    setPositionTest: setPositionTest
};