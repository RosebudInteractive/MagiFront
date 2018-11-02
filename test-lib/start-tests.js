'use strict';
const { UploadFiles } = require('./upload-files');
const { SetPosition } = require('./set-position');

if (false)
    UploadFiles.getCourse(17, false)
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

let token;
SetPosition.setPositionTest(1000)
    .then(result => {
        console.log(`Result: ${JSON.stringify(result)}`);
    })
    .catch(err => {
        console.error(err);
        console.log(err);
    });