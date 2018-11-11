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
const PRERENDER_API = "/api/adm/prerender";
const PRERENDER_HEADER = "magisteria-internal";
// const PRERENDER_HEADER = "yandex";

let admin = { login: "sokolov@rosebud.ru", password: "12345" };

function _prerender(url) {
    return new Promise((resolve, reject) => {
        request.get(
            {
                url: url,
                headers: { "User-Agent": PRERENDER_HEADER },
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

function prerenderUserTest(num, urls) {
    let token;
    let ts = 0;
    let stTime;
    let maxLesson;
    let currNum = 0;
    return new Promise(resolve => {
        stTime = new Date();
        let rc = uccelloUtils.seqExec(num, n => {
            let url = urls[Math.round(Math.random() * (urls.length - 1))];
            return _prerender(HOST + url)
                .then(result => {
                    currNum++;
                });
        });
        resolve(rc);
    })
        .then(() => {
            let time = ((new Date()) - stTime) / 1000;
            return { isErr: false, result: { num: currNum, time: time, rate: (time > 10e-6 ? (currNum / time) : 0) } };
        })
        .catch(err => {
            let time = ((new Date()) - stTime) / 1000;
            return {
                isErr: true,
                error: (err instanceof Error ? err.message : JSON.stringify(err)),
                result: { num: currNum, time: time, rate: (time > 10e-6 ? (currNum / time) : 0) }
            };
        })
}

function _getPrerenderUrls(user, password) {
    return new Promise(resolve => {
        resolve(login(HOST, user, password));
    })
        .then(token => {
            return new Promise((resolve, reject) => {
                let url = new URL(HOST + PRERENDER_API);
                url.searchParams.append('mode', 'list');
                url.searchParams.append('filter', 'all');
                request.get(
                    {
                        url: url.href,
                        headers: { "Authorization": "JWT " + token },
                        json: true
                    }, (error, response, body) => {
                        try {
                            if (error)
                                reject(error)
                            else {
                                if (response.statusCode === HttpCode.OK) {
                                    let urls = [];
                                    if (body.keys && Array.isArray(body.keys)) {
                                        body.keys.forEach(item => {
                                            let arr = item.split(":");
                                            if (arr.length > 1)
                                                urls.push(arr[1]);
                                        })
                                    }
                                    resolve(urls)
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
        })
}

let NCLIENTS = 5;
let urls = [];

function prerenderTest(num) {
    return _getPrerenderUrls(admin.login, admin.password, urls)
        .then(result => {
            urls = result;
            if (urls && Array.isArray(urls) && (urls.length > 0)) {
                return new Promise(resolve => {
                    let promises = [];
                    for (let i = 0; i < NCLIENTS; i++)
                        promises.push(prerenderUserTest(num, urls));
                    resolve(Promise.all(promises));
                });
            }
            else
                throw new Error(`Prerender urls list is empty or invalid.`);
        });
}

exports.Prerender = {
    prerenderTest: prerenderTest
};