'use strict';
const { UploadFiles } = require('./upload-files');

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
