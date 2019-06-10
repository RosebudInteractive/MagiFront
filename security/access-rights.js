const mime = require('mime');
const _ = require('lodash');
const config = require('config');
const { DbUtils } = require('../database/db-utils');
const { ACCOUNT_ID } = require('../const/sql-req-common');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { AccessFlags } = require('../const/common');

const LESSON_FILE_MSSQL_REQ =
    "select l.[Id], l.[IsAuthRequired], l.[IsSubsRequired], l.[FreeExpDate],\n" +
    "  c.[IsPaid], c.[IsSubsFree], l.[IsFreeInPaidCourse], pc.[CourseId],\n" +
    "  c.[PaidTp], c.[PaidDate], c.[PaidRegDate], gc.[Id] GiftId\n" +
    "from [EpisodeLng] el\n" +
    "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join [Lesson] l on l.[Id] = e.[LessonId]\n" +
    "  join [Course] c on c.[Id] = l.[CourseId]\n" +
    "  left join [UserPaidCourse] pc on (pc.[UserId] = <%= userId %>) and (pc.[CourseId] = c.[Id])\n" +
    "  left join [UserGiftCourse] gc on (gc.[UserId] = <%= userId %>) and (gc.[CourseId] = c.[Id])\n" +
    "where el.[Audio] = '<%= file %>'";
    
const LESSON_FILE_MYSQL_REQ =
    "select l.`Id`, l.`IsAuthRequired`, l.`IsSubsRequired`, l.`FreeExpDate`,\n" +
    "  c.`IsPaid`, c.`IsSubsFree`, l.`IsFreeInPaidCourse`, pc.`CourseId`,\n" +
    "  c.`PaidTp`, c.`PaidDate`, c.`PaidRegDate`, gc.`Id` GiftId\n" +
    "from `EpisodeLng` el\n" +
    "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join `Lesson` l on l.`Id` = e.`LessonId`\n" +
    "  join `Course` c on c.`Id` = l.`CourseId`\n" +
    "  left join `UserPaidCourse` pc on (pc.`UserId` = <%= userId %>) and (pc.`CourseId` = c.`Id`)\n" +
    "  left join `UserGiftCourse` gc on (gc.`UserId` = <%= userId %>) and (gc.`CourseId` = c.`Id`)\n" +
    "where el.`Audio` = '<%= file %>'";

const isBillingTest = config.has("billing.billing_test") ? config.billing.billing_test : false;

exports.AccessRights = class {

    static _canAccessAudio(user, file) {
        return new Promise(resolve => {
            let canAccess = $data.execSql({
                dialect: {
                    mysql: _.template(LESSON_FILE_MYSQL_REQ)({ file: file, userId: user ? user.Id : 0 }),
                    mssql: _.template(LESSON_FILE_MSSQL_REQ)({ file: file, userId: user ? user.Id : 0 })
                }
            }, {})
                .then((result) => {
                    let res = false;
                    if (result && result.detail && (result.detail.length === 1)) {
                        let now = new Date();
                        let rec = result.detail[0];
                        let IsPaid = rec.IsPaid && (!isBillingTest);
                        if (IsPaid) {
                            switch (rec.PaidTp) {
                                case 1:
                                    if (rec.PaidDate && ((rec.PaidDate - now) > 0))
                                        IsPaid = false;
                                    break;
                                case 2:
                                    if (user && user.RegDate && rec.PaidRegDate
                                        && ((rec.PaidRegDate - user.RegDate) > 0))
                                        IsPaid = false;
                                    break;
                                default:
                                    IsPaid = false;
                            }
                        }
                        let needAuth = rec.IsAuthRequired || rec.IsSubsRequired || (IsPaid && (!rec.IsFreeInPaidCourse));
                        if (needAuth) {
                            if (user) {
                                if (rec.IsSubsRequired || IsPaid) {
                                    res = IsPaid && (rec.IsFreeInPaidCourse || rec.CourseId || rec.GiftId);
                                    if (!res) {
                                        if (rec.IsSubsRequired || (IsPaid && rec.IsSubsFree)) {
                                            res = rec.FreeExpDate && (now <= rec.FreeExpDate);
                                            res = res || (user.SubsExpDateExt && (now <= rec.SubsExpDateExt));
                                        }
                                    }
                                }
                                else
                                    res = true;
                            }
                        }
                        else
                            res = true;
                    }
                    return res ? true : false;
                });
            resolve(canAccess);
        });
    }

    static canAccessFile(user, file) {
        return new Promise((resolve) => {
            let requiredRights = AccessFlags.Administrator + AccessFlags.ContentManager;
            let result = this.checkPermissions(user, requiredRights) !== 0 ? true : false;
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

    static checkPermissions(user, accessRights) {
        let result = 0;
        if (user && user.PData) {
            if (accessRights & AccessFlags.Administrator)
                result += user.PData.isAdmin ? AccessFlags.Administrator : 0;
            if (accessRights & AccessFlags.ContentManager)
                result += (user.PData.isAdmin || user.PData.roles.e) ? AccessFlags.ContentManager : 0;
            if (accessRights & AccessFlags.Pending)
                result += user.PData.roles.p ? AccessFlags.Pending : 0;
            if (accessRights & AccessFlags.Subscriber)
                result += user.PData.roles.s ? AccessFlags.Subscriber : 0;
        }
        return result;
    }
};

