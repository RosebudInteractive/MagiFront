'use strict';
const { DownloadFiles } = require('./download-files');
const { SetPosition } = require('./set-position');
const { GetCourseLesson } = require('./get-course-lesson');
const { Prerender } = require('./prerender');
const { CreateInvoice } = require('./create-invoice');
const { UploadFile } = require('./upload-file');
const { login } = require('./utils');

let user, password;
let courses = [1, 2, 3, 17];
for (let _cnt = 2; _cnt < process.argv.length; _cnt++) {
    switch (_cnt) {
        case 2:
            user = process.argv[_cnt];
            break;
        case 3:
            password = process.argv[_cnt];
            break;
        case 4:
            courses = process.argv[_cnt].split(",");
            break;
    }
}

async function start() {
    if (false) {
        let st = new Date();
        await DownloadFiles.getLessonSeq(1, false)
            .then(result => {
                if (result && (result.isErr === false)) {
                    console.log(`Time taken: ${(((new Date()) - st) / 1000).toFixed(3)} sec.`)
                    console.log(result);
                }
                else
                    throw Error(`Invalid result: "${JSON.stringify(result)}"`);
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });
    }

    if (false) {
        let st = new Date();
        let host = "https://magisteria.ru";
        try {
            let token = await login(host, "sokolov@rosebud.ru", "Super1206");
            // await DownloadFiles.getLesson(1, false, null, null, 10, true)
            await DownloadFiles.getLesson(1, false, host, null, 10, false, token)
                .then(result => {
                    if (result && (result.isErr === false)) {
                        console.log(`Time taken: ${(((new Date()) - st) / 1000).toFixed(3)} sec.`)
                        console.log(result);
                    }
                    else
                        throw Error(`Invalid result: "${JSON.stringify(result)}"`);
                })
        }
        catch (err) {
            console.error(err);
            console.log(err);
        }
    }

    if (true) {
        let host = "https://magisteria.ru";
        try {
            let token = await login(host, user, password);
            let tot_bytes = 0;
            let tot_time = 0;

            function totSize(res) {
                let size = 0;
                if (Array.isArray(res.result))
                    for (let i = 0; i < res.result.length; i++)
                        size += totSize(res.result[i])
                else {
                    if (res.isErr === false)
                        size = res.result && res.result.length ? res.result.length : 0;
                }
                return size;
            }

            let tot_result = [];
            let isErr = false;
            for (let i = 0; i < courses.length; i++) {
                let st = new Date();
                await DownloadFiles.getCourse(0 + courses[i], false, host, null, 10, false, token)
                    .then(result => {
                        Array.prototype.push.apply(tot_result, result);
                        isErr = isErr || result.isErr;
                        let dt = ((new Date()) - st) / 1000;
                        let sz = totSize(result);
                        console.log(`Time taken: ${dt.toFixed(3)} sec. Speed: ${((sz / 1024 / 1024 * 8) / dt).toFixed(3)} Mbit/sec.`);
                        tot_time += dt;
                        tot_bytes += sz;
                    });
            }
            if (tot_time)
                console.log(`Time taken: ${tot_time.toFixed(3)} sec. Speed: ${((tot_bytes / 1024 / 1024 * 8) / tot_time).toFixed(3)} Mbit/sec.`);
            if(isErr)
                throw Error(`Invalid result: "${JSON.stringify(tot_result)}"`);
        }
        catch (err) {
            console.error(err);
            console.log(err);
        }
    }

    if (false)
        await DownloadFiles.getCourse(17, false)
            .then(result => {
                if (result && (result.isErr === false))
                    console.log(result)
                else
                    throw Error(`Invalid result: "${JSON.stringify(result)}"`);
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });

    if (false)
        await SetPosition.setPositionTest(1000)
            .then(result => {
                // console.log(`Result: ${JSON.stringify(result)}`);
                let totTime = 0;
                let totOp = 0;
                let errors = [];
                result.forEach(item => {
                    totOp += item.result.num;
                    totTime = totTime > item.result.time ? totTime : item.result.time;
                    if (item.isErr === true)
                        errors.push(item);
                });
                console.log(`Rate: ${(totOp / totTime).toFixed(4)} op/sec, ops: ${totOp}, time: ${totTime} sec.`);
                if (errors.length > 0) {
                    console.error(`Errors: ${JSON.stringify(errors)}`);
                    throw new Error(errors[0].error);
                }
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });

    if (false)
        await GetCourseLesson.getCourseLessonTest(1000)
            .then(result => {
                // console.log(`Result: ${JSON.stringify(result)}`);
                let totTime = 0;
                let totOp = 0;
                let errors = [];
                result.forEach(item => {
                    totOp += item.result.num;
                    totTime = totTime > item.result.time ? totTime : item.result.time;
                    if (item.isErr === true)
                        errors.push(item);
                });
                console.log(`Rate: ${(totOp / totTime).toFixed(4)} op/sec, ops: ${totOp}, time: ${totTime} sec.`);
                if (errors.length > 0) {
                    console.error(`Errors: ${JSON.stringify(errors)}`);
                    throw new Error(errors[0].error);
                }
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });

    if (false)
        await Prerender.prerenderTest(1000)
            .then(result => {
                // console.log(`Result: ${JSON.stringify(result)}`);
                let totTime = 0;
                let totOp = 0;
                let errors = [];
                result.forEach(item => {
                    totOp += item.result.num;
                    totTime = totTime > item.result.time ? totTime : item.result.time;
                    if (item.isErr === true)
                        errors.push(item);
                });
                console.log(`Rate: ${(totOp / totTime).toFixed(4)} op/sec, ops: ${totOp}, time: ${totTime} sec.`);
                if (errors.length > 0) {
                    console.error(`Errors: ${JSON.stringify(errors)}`);
                    throw new Error(errors[0].error);
                }
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });

    if (false)
        await CreateInvoice.createInvoiceTest(1000)
            .then(result => {
                // console.log(`Result: ${JSON.stringify(result)}`);
                let totTime = 0;
                let totOp = 0;
                let errors = [];
                result.forEach(item => {
                    totOp += item.result.num;
                    totTime = totTime > item.result.time ? totTime : item.result.time;
                    if (item.isErr === true)
                        errors.push(item);
                });
                console.log(`Rate: ${(totOp / totTime).toFixed(4)} op/sec, ops: ${totOp}, time: ${totTime} sec.`);
                if (errors.length > 0) {
                    console.error(`Errors: ${JSON.stringify(errors)}`);
                    throw new Error(errors[0].error);
                }
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });

    if (false)
        await UploadFile.uploadFileTest(3)
            .then(result => {
                // console.log(`Result: ${JSON.stringify(result)}`);
                let totTime = 0;
                let totOp = 0;
                let errors = [];
                result.forEach(item => {
                    totOp += item.result.num;
                    totTime = totTime > item.result.time ? totTime : item.result.time;
                    if (item.isErr === true)
                        errors.push(item);
                });
                console.log(`Rate: ${(totOp / totTime).toFixed(4)} op/sec, ops: ${totOp}, time: ${totTime} sec.`);
                if (errors.length > 0) {
                    console.error(`Errors: ${JSON.stringify(errors)}`);
                    throw new Error(errors[0].error);
                }
            })
            .catch(err => {
                console.error(err);
                console.log(err);
            });
}

start();