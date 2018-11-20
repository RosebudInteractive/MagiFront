'use strict';
const { DownloadFiles } = require('./download-files');
const { SetPosition } = require('./set-position');
const { GetCourseLesson } = require('./get-course-lesson');
const { Prerender } = require('./prerender');
const { CreateInvoice } = require('./create-invoice');
const { UploadFile } = require('./upload-file');

if (false)
    DownloadFiles.getCourse(17, false)
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
    SetPosition.setPositionTest(1000)
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
    GetCourseLesson.getCourseLessonTest(1000)
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
    Prerender.prerenderTest(1000)
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
    CreateInvoice.createInvoiceTest(1000)
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

if (true)
    UploadFile.uploadFileTest(3)
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