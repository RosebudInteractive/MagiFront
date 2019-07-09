'use strict';
const request = require('request');
const fs = require('fs');
const { URL } = require('url');
const path = require('path');
const { buildLogString } = require('../utils');

function getFile(url, fileName) {
    return new Promise(resolve => {
        try {
            let statusCode;
            let length;
            let stTime = new Date();
            console.log(buildLogString(`+++ Started: "${url}"`));
            let inpStream = request(url)
                .on('response', response => {
                    statusCode = response.statusCode;
                    length = response.headers['content-length'] ? parseInt(response.headers['content-length']) : -1;
                    if (statusCode !== 200) {
                        console.error(buildLogString(`### HTTP Error: "${url}": StatusCode = ${statusCode}.`));
                        console.log(buildLogString(`### HTTP Error: "${url}": StatusCode = ${statusCode}.`));
                    }
                })
                .on('error', (err) => {
                    console.error(buildLogString(`### REQUEST Error: "${url}": "${err.message ? err.message : JSON.stringify(err, null, 2)}".`));
                    console.log(buildLogString(`### REQUEST Error: "${url}": "${err.message ? err.message : JSON.stringify(err, null, 2)}".`));
                    resolve({ isErr: true, result: err });
                });
            let outStream = fs.createWriteStream(fileName)
                .on('error', (err) => {
                    console.error(buildLogString(`### WRITE Error: "${url}": "${err.message ? err.message : JSON.stringify(err, null, 2)}".`));
                    console.log(buildLogString(`### WRITE Error: "${url}": "${err.message ? err.message : JSON.stringify(err, null, 2)}".`));
                    resolve({ isErr: true, result: err });
                })
                .on('close', () => {
                    let time = ((new Date()) - stTime) / 1000;
                    console.log(buildLogString(`--- Finished: "${url}", size: ${(length / 1024 / 1024).toFixed(3)}Mb, time: ${time.toFixed(3)}s.`));
                    resolve({
                        isErr: statusCode !== 200 ? true : false,
                        result: {
                            url: url,
                            file: fileName,
                            statusCode: statusCode,
                            length: length,
                            time: time
                        }
                    });
                });
            inpStream.pipe(outStream);
        }
        catch (err) {
            console.error(buildLogString(`### Error: "${url}": "${err.message ? err.message : JSON.stringify(err, null, 2)}".`));
            console.log(buildLogString(`### Error: "${url}": "${err.message ? err.message : JSON.stringify(err, null, 2)}".`));
            resolve({ isErr: true, result: err });
        }
    });
}

const BASE_URL = "https://new.magisteria.ru";
const BASE_DIR = "./data";

function makeDir(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err) => {
            if (err)
                reject(err)
            else
                resolve(path);
        });
    });
};

async function getLessonSeq(id, isOld, baseUrl, baseDir) {
    return new Promise(resolve => {
        try {
            let url = `${baseUrl ? baseUrl : BASE_URL}/api/lessons/play/${id.toString()}?abs_path=true`;
            let stTime = new Date();
            request({ url: url, json: true }, (error, res, body) => {
                try {
                    if (error)
                        throw error;

                    if (res.statusCode !== 200)
                        throw new Error(`Lesson: "${url}": HTTP StatusCode: ${res.statusCode}`);

                    let rc = new Promise((resolve, reject) => {
                        let dir_path = `${(baseDir ? baseDir : BASE_DIR)}/${id}`;
                        fs.stat(dir_path, (err, stats) => {
                            if (err) {
                                if (err.code === "ENOENT")
                                    resolve(makeDir(dir_path))
                                else
                                    reject(err);
                            }
                            else
                                if (stats.isDirectory())
                                    resolve(dir_path)
                                else
                                    reject(new Error("Path \"" + dir_path + "\" exists, but it's not a directory."));
                        });
                    })
                        .then(async (dir) => {
                            let promises = [];
                            if (body) {
                                if (body.assets) {
                                    for (let i = 0; i < body.assets.length; i++){
                                        let elem = body.assets[i];
                                        let parsed = path.parse(elem.file);
                                        let fileName = `${dir}/${parsed.base}`;
                                        let fileUrl = isOld ? elem.file.replace("new.magisteria.ru/data", "magisteria.ru/wp-content/uploads") : elem.file;
                                        promises.push(await getFile(fileUrl, fileName));
                                    }
                                }
                                if (body.episodes) {
                                    for (let i = 0; i < body.episodes.length; i++) {
                                        let elem = body.episodes[i];
                                        let parsed = path.parse(elem.audio.file);
                                        let fileName = `${dir}/${parsed.base}`;
                                        let fileUrl = isOld ? elem.audio.file.replace("new.magisteria.ru/data", "magisteria.ru/wp-content/uploads") : elem.audio.file;
                                        promises.push(await getFile(fileUrl, fileName));
                                    }
                                }
                            }
                            return promises;
                        })
                        .then(result => {
                            let res = { isErr: true, result: result };
                            if (result && Array.isArray(result)) {
                                res.isErr = false;
                                result.forEach(elem => {
                                    if (elem.isErr)
                                        res.isErr = true;
                                })
                            }
                            return res;
                        })
                        .catch(err => {
                            return { isErr: true, result: err };
                        });
                    resolve(rc);
                }
                catch (err) {
                    resolve({ isErr: true, result: err });
                }
            })
        }
        catch (err) {
            resolve({ isErr: true, result: err });
        }
    });
}

async function concurExec(promise, p_arr, res_arr, degree) {
    let dg = degree ? degree : 0;
    if (promise)
        p_arr.push(promise);
    if (((dg > 0) && (p_arr.length >= dg)) || ((!promise) && (p_arr.length > 0))) {
        let res = await Promise.all(p_arr);
        p_arr.length = 0;
        Array.prototype.push.apply(res_arr, res);
    }
    return res_arr;
}

function getLesson(id, isOld, baseUrl, baseDir, degree) {
    return new Promise(resolve => {
        try {
            let url = `${baseUrl ? baseUrl : BASE_URL}/api/lessons/play/${id.toString()}?abs_path=true`;
            let stTime = new Date();
            request({ url: url, json: true }, (error, res, body) => {
                try {
                    if (error)
                        throw error;

                    if (res.statusCode !== 200)
                        throw new Error(`Lesson: "${url}": HTTP StatusCode: ${res.statusCode}`);

                    let rc = new Promise((resolve, reject) => {
                        let dir_path = `${(baseDir ? baseDir : BASE_DIR)}/${id}`;
                        fs.stat(dir_path, (err, stats) => {
                            if (err) {
                                if (err.code === "ENOENT")
                                    resolve(makeDir(dir_path))
                                else
                                    reject(err);
                            }
                            else
                                if (stats.isDirectory())
                                    resolve(dir_path)
                                else
                                    reject(new Error("Path \"" + dir_path + "\" exists, but it's not a directory."));
                        });
                    })
                        .then(async (dir) => {
                            let promises = [];
                            let res = [];
                            if (body) {
                                if (body.assets) {
                                    for (let i = 0; i < body.assets.length; i++){
                                        let elem = body.assets[i];
                                        let parsed = path.parse(elem.file);
                                        let fileName = `${dir}/${parsed.base}`;
                                        let fileUrl = isOld ? elem.file.replace("new.magisteria.ru/data", "magisteria.ru/wp-content/uploads") : elem.file;
                                        await concurExec(getFile(fileUrl, fileName), promises, res, degree)
                                    }
                                }
                                if (body.episodes) {
                                    for (let i = 0; i < body.episodes.length; i++) {
                                        let elem = body.episodes[i];
                                        let parsed = path.parse(elem.audio.file);
                                        let fileName = `${dir}/${parsed.base}`;
                                        let fileUrl = isOld ? elem.audio.file.replace("new.magisteria.ru/data", "magisteria.ru/wp-content/uploads") : elem.audio.file;
                                        await concurExec(getFile(fileUrl, fileName), promises, res, degree)
                                    }
                                }
                            }
                            return await concurExec(null, promises, res, degree);
                        })
                        .then(result => {
                            let res = { isErr: true, result: result };
                            if (result && Array.isArray(result)) {
                                res.isErr = false;
                                result.forEach(elem => {
                                    if (elem.isErr)
                                        res.isErr = true;
                                })
                            }
                            return res;
                        })
                        .catch(err => {
                            return { isErr: true, result: err };
                        });
                    resolve(rc);
                }
                catch (err) {
                    resolve({ isErr: true, result: err });
                }
            })
        }
        catch (err) {
            resolve({ isErr: true, result: err });
        }
    });
}

function getCourse(id, isOld, baseUrl, baseDir) {
    return new Promise(resolve => {
        try {
            let url = `${baseUrl ? baseUrl : BASE_URL}/api/courses/${id.toString()}?abs_path=true`;
            let stTime = new Date();
            request({ url: url, json: true }, (error, res, body) => {
                try {
                    if (error)
                        throw error;

                    if (res.statusCode !== 200)
                        throw new Error(`Lesson: "${url}": HTTP StatusCode: ${res.statusCode}`);

                    let rc = Promise.resolve()
                        .then(() => {
                            let promises = [];
                            if (body) {
                                if (body.Lessons) {
                                    body.Lessons.forEach(elem => {
                                        promises.push(getLesson(elem.Id, isOld, baseUrl, baseDir));
                                        if (elem.Lessons.length > 0)
                                            elem.Lessons.forEach(subElem => {
                                                promises.push(getLesson(subElem.Id, isOld, baseUrl, baseDir));
                                            });
                                    })
                                }
                            }
                            return Promise.all(promises);
                        })
                        .then(result => {
                            let res = { isErr: true, result: result };
                            if (result && Array.isArray(result)) {
                                res.isErr = false;
                                result.forEach(elem => {
                                    if (elem.isErr)
                                        res.isErr = true;
                                })
                            }
                            return res;
                        })
                        .catch(err => {
                            return { isErr: true, result: err };
                        });

                    resolve(rc);
                }
                catch (err) {
                    resolve({ isErr: true, result: err });
                }
            })
        }
        catch (err) {
            resolve({ isErr: true, result: err });
        }
    });
}

exports.DownloadFiles = {
    getCourse: getCourse,
    getLesson: getLesson,
    getLessonSeq: getLessonSeq
};