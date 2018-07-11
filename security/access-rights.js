const mime = require('mime');
const _ = require('lodash');
const { DbUtils } = require('../database/db-utils');
const { ACCOUNT_ID } = require('../const/sql-req-common');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const LESSON_FILE_MSSQL_REQ =
    "select l.[Id], l.[IsAuthRequired], l.[IsSubsRequired] from[FreeExpDate] el\n" +
    "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join [Lesson] l on l.[Id] = e.[LessonId]\n" +
    "where el.[Audio] = '<%= file %>'";
    
const LESSON_FILE_MYSQL_REQ =
    "select l.`Id`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate` from`EpisodeLng` el\n" +
    "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join `Lesson` l on l.`Id` = e.`LessonId`\n" +
    "where el.`Audio` = '<%= file %>'";

exports.AccessRights = class {

    static _canAccessAudio(user, file) {
        return new Promise((resolve) => {
            let canAccess = $data.execSql({
                dialect: {
                    mysql: _.template(LESSON_FILE_MYSQL_REQ)({ file: file }),
                    mssql: _.template(LESSON_FILE_MSSQL_REQ)({ file: file })
                }
            }, {})
                .then((result) => {
                    let res = false;
                    if (result && result.detail && (result.detail.length === 1))
                        res = result.detail[0].IsAuthRequired ? true : false;
                    if (!res)
                        res = true
                    else {
                        res = user ? true : false;
                        if (res) {
                            let rec = result.detail[0];
                            let now = new Date();
                            if ((!rec.FreeExpDate)||(now > rec.FreeExpDate)) {
                                if (rec.IsSubsRequired && ((!user.SubsExpDate) || (now > rec.SubsExpDate)))
                                    res = false;    
                            }
                        }
                    }
                    return res;
                });
            resolve(canAccess);
        });
    }

    static canAccessFile(user, file) {
        return new Promise((resolve) => {
            let result = user ? true : false;
            if (!result) {
                result = true;
                let mimeType = mime.getType(file);
                let typeArr = mimeType ? mimeType.split("/") : null;
                if (typeArr && (typeArr.length > 0)) {
                    let fn = file.substring(0, 1) === "/" ? file.substring(1) : file;
                    switch (typeArr[0]) {
                        case "audio":
                            result = this._canAccessAudio(user, fn);
                            break;
                    }
                }
            }
            resolve(result);
        });
    }
};

