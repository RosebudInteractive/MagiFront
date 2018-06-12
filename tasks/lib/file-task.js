'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Task } = require('../lib/task');
const { DbUtils } = require('../../database/db-utils');

const FILE_INFO_LENGTH = 150;

const { promisify } = require('util');
const { Buffer } = require('buffer');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const openAsync = promisify(fs.open);
const readAsync = promisify(fs.read);
const closeAsync = promisify(fs.close);

exports.FileTask = class FileTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._path = opts.path;
        if (typeof (this._path) !== "string")
            throw new Error(`FileTask::constructor: Invalid argument "path": "${this._path}".`);
    }

    _getFileInfo(fileName, fileGuid, infoLen) {
        let fileInfoLength = infoLen ? infoLen : FILE_INFO_LENGTH;
        let fileInfo = {};
        let position;
        let length;
        let fdesc = -1;

        let finalize = () => {
            let retFileInfo = () => {
                return fileInfo;
            }
            let rc = Promise.resolve();
            if (fdesc !== -1)
                rc = closeAsync(fdesc);
            return rc.then(retFileInfo, retFileInfo);
        }

        return statAsync(fileName)
            .then((stats) => {
                position = (stats.size - fileInfoLength) > 0 ? stats.size - fileInfoLength : 0;
                length = stats.size - position;
            })
            .then(() => {
                return openAsync(fileName, "r");
            })
            .then((fd) => {
                fdesc = fd;
                let buffer = Buffer.alloc(length);
                return readAsync(fd, buffer, 0, length, position);
            })
            .then((data) => {
                let str = data.buffer.toString('utf8');
                let parsed = str.match(/guid:[a-f0-9-]{36}|ts:[0-9]*|md5:[a-f0-9]*/ig);
                let guid, md5, ts, val;
                parsed.forEach((elem) => {
                    let arr = elem.split(':');
                    if (arr.length === 2) {
                        switch (arr[0]) {
                            case "guid":
                                guid = arr[1];
                                break;
                            case "ts":
                                ts = new Date(parseInt(arr[1]));
                                break;
                            case "md5":
                                md5 = arr[1];
                                break;
                        }
                    }
                })
                if (guid === fileGuid) {
                    fileInfo.checkSum = md5;
                    fileInfo.lastModif = ts;
                }
                return finalize();
            })
            .catch((err) => {
                return finalize();
            });
    }

    _genFooter(time, dt, guid, checkSum) {
        let dfmt = { h: "h ", m: "m ", s: "s", ms: true };
        return `\n<!-- Generated at ${time.toISOString()}, duration: ${DbUtils.fmtDuration(dt, dfmt)}.` +
            ` ( guid:${guid}, ts:${time - 0}, md5:${checkSum}) -->`;
    }

    _saveFile(sitemap, startTime, finTime, fileName, fileGuid) {
        let checkSum;
        let lastMdf;
        return this._getFileInfo(fileName, fileGuid)
            .then((fileInfo) => {
                let rc = Promise.resolve(false);
                let checkSum = fileInfo.checkSum;
                let md5sum = crypto.createHash('md5');
                md5sum.update(sitemap);
                let currCheckSum = md5sum.digest('hex');
                let data = ((new Date()) - 0) + ";" + currCheckSum;
                let isModified = ((!checkSum) || (currCheckSum !== checkSum));
                if (isModified)
                    rc = rc
                        .then(() => {
                            let dt = (finTime - startTime) / 1000;
                            let footer = this._genFooter(finTime, dt, fileGuid, currCheckSum);
                            return writeFileAsync(fileName, sitemap + footer);
                        })
                        .then(() => { return true; });
                return rc;
            });
    }

    _genFile(dataSourse, fileOptions) {
        let startTime;
        return new Promise((resolve, reject) => {
            startTime = new Date();
            resolve(dataSourse);
        })
            .then((sitemap) => {
                if (sitemap) {
                    let fileName = path.join(this._path, fileOptions.file);
                    let fileGuid = fileOptions.guid
                    return this._saveFile(sitemap, startTime, new Date(), fileName, fileGuid);
                }
                else
                    return false;
            });
    }

    _getFileName(fullName) {
        let fn = path.parse(fullName);
        return fn.name;
    }

}