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
const GET_COURSE = "/api/courses";
const GET_LESSON = "/api/lessons/v2";

const ALL_COURSES = 0;
const SINGLE_COURSE = 1;
const SINGLE_LESSON = 2;

let users = [
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" }
];

// Mixed  ==> Rate: 57.9820 op/sec, ops: 30000, time: 517.402 sec.
//  with MySql cache => Rate: 61.4966 op/sec, ops: 30000, time: 487.832 sec.
let types = [
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON],
    [ALL_COURSES, SINGLE_COURSE, SINGLE_LESSON]
];

let tp_ranges = {};
tp_ranges[SINGLE_COURSE] = { min: 1, max: 20 };
tp_ranges[SINGLE_LESSON] = { min: 1, max: 150 };

/*
// Single lesson ==> Rate: 83.2612 op/sec, ops: 30000, time: 360.312 sec.
//  with MySql cache => Rate: 82.9435 op/sec, ops: 30000, time: 361.692 sec.
let types = [
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON],
    [SINGLE_LESSON]
];

let tp_ranges = {};
tp_ranges[SINGLE_COURSE] = { min: 1, max: 20 };
tp_ranges[SINGLE_LESSON] = { min: 1, max: 2 };
*/
/*
// Single course ==> Rate: 97.2116 op/sec, ops: 30000, time: 308.605 sec.
//  with MySql cache => Rate: 176.0584 op/sec, ops: 30000, time: 170.398 sec.
let types = [
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE],
    [SINGLE_COURSE]
];

let tp_ranges = {};
tp_ranges[SINGLE_COURSE] = { min: 2, max: 2 };
tp_ranges[SINGLE_LESSON] = { min: 2, max: 2 };
*/
/*
// All courses ==> Rate: 21.6318 op/sec, ops: 27793, time: 1284.822 sec
//  with MySql cache => Rate: 22.3236 op/sec, ops: 26330, time: 1179.47 sec.
let types = [
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES],
    [ALL_COURSES]
];

let tp_ranges = {};
tp_ranges[SINGLE_COURSE] = { min: 2, max: 2 };
tp_ranges[SINGLE_LESSON] = { min: 2, max: 2 };
*/
function _getData(token, tp) {
    return new Promise((resolve, reject) => {
        let url;
        let id;
        let id_range = tp_ranges[tp];
        if (id_range) {
            id = Math.round(Math.random() * (id_range.max - id_range.min)) + id_range.min;
        }
        switch (tp) {
            case ALL_COURSES:
                url = new URL(HOST + GET_COURSE);
                break;
            case SINGLE_COURSE:
                if (!id)
                    throw new Error(`Invalid course Id: "${id}".`);
                url = new URL(HOST + GET_COURSE+`/${id}`);
                break;
            case SINGLE_LESSON:
                if (!id)
                    throw new Error(`Invalid lesson Id: "${id}".`);
                url = new URL(HOST + GET_LESSON + `/${id}`);
                break;
            default:
                throw new Error(`Unknown request type: "${tp}"`);
        }
        url.searchParams.append('abs_path', 'true');
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

function getUserCourseLessonTest(user, password, num, tps) {
    let token;
    let ts = 0;
    let stTime;
    let maxLesson;
    let currNum = 0;
    return new Promise(resolve => {
        if ((!Array.isArray(tps)) || (tps.length === 0))
            throw new Error(`Invalid parameter "tps": ${JSON.stringify(tps)}`);
        resolve(login(HOST, user, password));
    })
        .then(result => {
            token = result;
            stTime = new Date();
            return uccelloUtils.seqExec(num, n => {
                let tp = tps[Math.round(Math.random() * (tps.length - 1))];
                return _getData(token, tp)
                    .then(result => {
                        currNum++;
                    });
            })
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

function getCourseLessonTest(num) {
    return new Promise(resolve => {
        let promises = [];
        users.forEach(elem => {
            types.forEach(item => {
                promises.push(getUserCourseLessonTest(elem.login, elem.password, num, item));
            });
        });
        resolve(Promise.all(promises));
    })
}

exports.GetCourseLesson = {
    getCourseLessonTest: getCourseLessonTest
};