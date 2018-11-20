'use strict';
const request = require('request');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { login } = require('./utils');
const { HttpMessage, HttpCode } = require('../const/http-codes');
const { HttpError } = require('../errors/http-error');
const uccelloUtils = require('../../Uccello2/system/utils');

// const HOST = "http://localhost:3000";
const HOST = "https://new.magisteria.ru";
const UPLOAD_API = "/api/adm/upload";
const FILE_PATH = "./data/upload/_T2A4559s.jpg";
const PACKET_SIZE = 40;
const users = [
    { login: "sokolov@rosebud.ru", password: "12345" }
];

function uploadFile(token, filePath, n) {
    return new Promise((resolve, reject) => {
        let nfiles = (typeof (n) === "number") && (n > 0) ? n : 1;
        let formData = {
            // field1: "value1",
            // field2: "value2",
            attachments: []
        };
        const { name, ext } = path.parse(filePath);
        for (let i = 0; i < nfiles; i++)
            formData.attachments.push({
                value: fs.createReadStream(filePath),
                options: {
                    filename: name + ext,
                    contentType: "image/jpeg"
                }
            });
        request.post(
            {
                url: HOST + UPLOAD_API,
                headers: { "Authorization": "JWT " + token },
                formData: formData
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

function userUploadFileTest(user, password, num) {
    let stTime;
    let currNum = 0;
    return new Promise(resolve => {
        resolve(login(HOST, user, password, true));
    })
        .then(result => {
            stTime = new Date();
            return uccelloUtils.seqExec(num, n => {
                return uploadFile(result.token, FILE_PATH, PACKET_SIZE)
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

function uploadFileTest(num) {
    return new Promise(resolve => {
        let promises = [];
        users.forEach(elem => {
            promises.push(userUploadFileTest(elem.login, elem.password, num));
        });
        resolve(Promise.all(promises));
    })
}

exports.UploadFile = {
    uploadFileTest: uploadFileTest
};