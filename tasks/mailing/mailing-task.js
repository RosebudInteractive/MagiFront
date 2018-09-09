'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const sharp = require('sharp');
const sendpulse = require("sendpulse-api");
const { URL, URLSearchParams } = require('url');
const fs = require('fs');

const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const mkdirAsync = promisify(fs.mkdir);

const { Task } = require('../lib/task');
const { HttpCode } = require('../../const/http-codes');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_LESSONS_MSSQL =
    "select lc.[ReadyDate], l.[Id], cl.[Name] as [CourseName], c.[URL] as [CourseURL], pl.[Number] as [ParentNumber],\n" +
    "  lc.[Number], ll.[Name], l.[URL], ll.[ShortDescription], l.[Cover] from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  left join[LessonCourse] pl on pl.[Id] = lc.[ParentId]\n" +
    "  left join[LsnMailing] m on m.[LessonId] = l.[Id]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "  and (m.[LessonId] is NULL)\n" +
    "  and (lc.[ReadyDate] >= convert(datetime, '<%= first_date %>')) and (lc.[ReadyDate] < convert(datetime, '<%= last_date %>'))\n" +
    "order by lc.[ReadyDate] desc, l.[Id] desc";

const GET_LESSONS_MYSQL =
    "select lc.`ReadyDate`, l.`Id`, cl.`Name` as `CourseName`, c.`URL` as `CourseURL`, pl.`Number` as `ParentNumber`,\n" +
    "  lc.`Number`, ll.`Name`, l.`URL`, ll.`ShortDescription`, l.`Cover` from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  left join`LessonCourse` pl on pl.`Id` = lc.`ParentId`\n" +
    "  left join`LsnMailing` m on m.`LessonId` = l.`Id`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "  and (m.`LessonId` is NULL)\n" +
    "  and (lc.`ReadyDate` >= '<%= first_date %>') and (lc.`ReadyDate` < '<%= last_date %>')\n" +
    "order by lc.`ReadyDate` desc, l.`Id` desc";

const dfltSettings = {
    period: "week",
    sender: "test@magisteria.ru",
    senderName: "Magisteria.Ru",
    mailList: "My emails",
    infoMailList: "Info",
    errMailList: "Errors",
    imgDir: "mails",
    imgUrl: "/data/mails/",
    fbUrl: "/",
    okUrl: "/",
    twUrl: "/",
    vkUrl: "/",
    mailLogo: "/assets/mail/logo.png",
    fbLogo: "/assets/images/svg/fb.svg",
    okLogo: "/assets/images/svg/ok.svg",
    twLogo: "/assets/images/svg/tw.svg",
    vkLogo: "/assets/images/svg/vk.svg",
};

const IMG_WIDTH = 360;
const IMG_HEIGHT = 283;

exports.MailingTask = class MailingTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._addressBooks = {};
        this._settings = _.defaultsDeep(opts, dfltSettings);
        this._settings.baseUrl = this._settings.testUrl ? this._settings.testUrl : config.proxyServer.siteHost;
        sendpulse.init(config.mail.sendPulse.apiUserId, config.mail.sendPulse.apiSecret, config.mail.sendPulse.tmpPath);
    }

    _formatDate(dt, mode) {
        let rc;
        const monthes = [
            "января",
            "февраля",
            "марта",
            "апреля",
            "мая",
            "июня",
            "июля",
            "августа",
            "сентября",
            "октября",
            "ноября",
            "декабря",
        ];
        switch (mode) {
            case "text":
                rc = dt.getDate() + " " + monthes[dt.getMonth()];
                break;
            default:
                rc = "" + dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
        }
        return rc;
    }

    _getLessons() {
        let first_date;
        let last_date;
        return new Promise((resolve, reject) => {
            this._settings.letter = {};
            switch (this._settings.period) {
                case "week":
                    if (this._settings.first_date) {
                        first_date = new Date(this._settings.first_date);
                        last_date = new Date(first_date);
                        last_date.setDate(first_date.getDate() + 7);
                    }
                    else {
                        last_date = new Date();
                        first_date = new Date(last_date);
                        first_date.setDate(last_date.getDate() - 7);
                    }
                    break;
                default:
                    throw new Error(`Invalid mailing period "${this._settings.period}".`);
            }
            this._settings.letter.first_date = first_date;
            this._settings.letter.last_date = last_date;
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_LESSONS_MYSQL)({ first_date: this._formatDate(first_date), last_date: this._formatDate(last_date) }),
                    mssql: _.template(GET_LESSONS_MSSQL)({ first_date: this._formatDate(first_date), last_date: this._formatDate(last_date) })
                }
            }, {}));
        })
            .then((result) => {
                let data = (result && result.detail && (result.detail.length > 0)) ? result.detail : [];
                return {
                    first_date: first_date,
                    last_date: new Date(last_date.setDate(last_date.getDate() - 1)),
                    data: data
                };
            })
    }

    _processItem(item, url, modelName, filterFieldName, itemFieldName) {

        let self = this;
        let options = { dbRoots: [] };
        let root_obj;
        let db = $memDataBase;
        let cntList = {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(db, (resolve, reject) => {
                var predicate = new Predicate(db, {});
                predicate
                    .addCondition({ field: filterFieldName, op: "=", value: item[itemFieldName] });
                let exp =
                {
                    expr: {
                        model: {
                            name: modelName,
                        },
                        predicate: predicate.serialize(true)
                    }
                };
                db._deleteRoot(predicate.getRoot());
                resolve(db.getData(Utils.guid(), null, null, exp, {}));
            })
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("Invalid result of \"getData\": " + JSON.stringify(result));

                    options.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    let collection = root_obj.getCol("DataElements");
                    for (let i = 0; i < collection.count(); i++) {
                        let obj = collection.get(i);
                        cntList[obj.sNetProviderId()] = obj;
                    }
                })
                .then(() => {
                    return Utils.seqExec(self._settings.snets, (elem) => {
                        let rc = Promise.resolve();
                        let snId = self._snList[elem];
                        if (snId) {
                            let getCnt = null;
                            let obj = cntList[snId];
                            let options = self._settings.snPrefs[elem];
                            switch (elem) {
                                case "facebook":
                                    getCnt = self._getFBCount(url, options);
                                    break;
                                case "vkontakte":
                                    getCnt = self._getVKCount(url, options);
                                    break;
                                case "odnoklassniki":
                                    getCnt = self._getOKCount(url, options);
                                    break;
                            }
                            if (getCnt) {
                                rc = getCnt
                                    .then((counter) => {
                                        if (counter) {
                                            if (obj)
                                                obj.counter(counter)
                                            else {
                                                let fields = { SNetProviderId: snId, Counter: counter };
                                                fields[filterFieldName] = item[itemFieldName];
                                                return root_obj.newObject({
                                                    fields: fields
                                                }, {});
                                            }
                                        }
                                    })
                            }
                        }
                        return rc;
                    });
                })
                .then(() => {
                    return root_obj.save();
                })
        }, options);
    }

    _processLessons() {
        let self = this;
        return this._getLessons()
            .then((lessons) => {
                return Utils.seqExec(lessons, (lesson) => {
                    let rc = self._delay();
                    if (!self._courses[lesson.CID]) {
                        rc = rc.then(() => {
                            let url = self._settings.baseUrl + '/category/' + lesson.URL;
                            return self._processItem(lesson, url, "CrsShareCounter", "CourseId", "CID");
                        })
                            .then(() => {
                                self._courses[lesson.CID] = true;
                                return self._delay();
                            });
                    }
                    return rc.then(() => {
                        let url = self._settings.baseUrl + '/' + lesson.URL + '/' + lesson.LURL;
                        return self._processItem(lesson, url, "LsnShareCounter", "LessonId", "Id");
                    })
                });
            });
    }

    _forceDir(dir) {
        return statAsync(dir)
            .then(() => { }, (err => {
                if (err.code === "ENOENT")
                    return mkdirAsync(dir)
                else
                    throw err;
            }));
    }

    _makePicture(lesson, imgDir) {
        return new Promise(resolve => {
            let coverPath = path.join(config.uploadPath, lesson.Cover);
            console.log(coverPath);
            let fn = lesson.Id + ".png";
            let rc = sharp(coverPath)
                .resize(IMG_WIDTH, IMG_HEIGHT)
                .png()
                .toFile(path.join(imgDir, fn))
                .then(info => {
                    return fn;
                });
            resolve(rc);
        })
    }

    _buildLetter(lessons) {
        let imgDir;
        let letter = { first_date: lessons.first_date, last_date: lessons.last_date, ids: [] };
        let letterTmpl;
        return new Promise(resolve => {
            imgDir = path.join(config.uploadPath, this._settings.imgDir);
            resolve(this._forceDir(imgDir));
        })
            .then(() => {
                return readFileAsync("./mailing/templates/letter.tmpl", "utf8")
                    .then((result) => { letterTmpl = result });
            })
            .then(() => {
                let lessons_body = "";
                return readFileAsync("./mailing/templates/lesson-item.tmpl", "utf8")
                    .then(lessonTmpl => {
                        return Utils.seqExec(lessons.data, (lesson) => {
                            return this._makePicture(lesson, imgDir)
                                .then(imgFile => {
                                    let lsn = _.template(lessonTmpl)({
                                        course_url: this._settings.baseUrl + "/category/" + lesson.CourseURL,
                                        course_title: lesson.CourseName,
                                        lesson_number: (lesson.ParentNumber ? (lesson.ParentNumber + "." + lesson.Number) : lesson.Number) + ".",
                                        lesson_url: this._settings.baseUrl + "/" + lesson.CourseURL + "/" + lesson.URL,
                                        lesson_title: lesson.Name,
                                        lesson_short_description: lesson.ShortDescription,
                                        lesson_img_url: this._settings.baseUrl + this._settings.imgUrl + imgFile
                                    });
                                    lessons_body += lsn;
                                    letter.ids.push(lesson.Id);
                                });
                        });
                    })
                    .then(() => {
                        letter.body = _.template(letterTmpl)({
                            root_url: this._settings.baseUrl,
                            logo_url: this._settings.baseUrl + this._settings.mailLogo,
                            lessons: lessons_body,
                            fb_url: this._settings.baseUrl + this._settings.fbUrl,
                            fb_img_url: this._settings.baseUrl + this._settings.fbLogo,
                            vk_url: this._settings.baseUrl + this._settings.vkUrl,
                            vk_img_url: this._settings.baseUrl + this._settings.vkLogo,
                            tw_url: this._settings.baseUrl + this._settings.twUrl,
                            tw_img_url: this._settings.baseUrl + this._settings.twLogo,
                            ok_url: this._settings.baseUrl + this._settings.okUrl,
                            ok_img_url: this._settings.baseUrl + this._settings.okLogo
                        });
                        return writeFileAsync("../../test.html", letter.body, "utf8");
                    })
                    .then(() => letter);
            });
    }

    _sendLetter(letter) {
        let mailList;
        return new Promise(resolve => {
            this._addressBooks = {};
            sendpulse.listAddressBooks(result => {
                if (result && Array.isArray(result) && (result.length)) {
                    result.forEach(elem => {
                        this._addressBooks[elem.name] = elem;
                    })
                    mailList = this._addressBooks[this._settings.mailList];
                    if (!mailList)
                        throw new Error(`Mail list "${this._settings.mailList}" is missing!`);
                    resolve(mailList);
                }
                else
                    throw new Error(`List of address books is empty!`);
            });
        })
            .then(() => {
                return new Promise((resolve, reject) => {
                    let msgSubject = _.template("Новые лекции с <%= first_date %> по <%= last_date %>")({
                        first_date: this._formatDate(letter.first_date, "text"),
                        last_date: this._formatDate(letter.last_date, "text")
                    });
                    sendpulse.createCampaign(data => {
                        if (data && (!data.is_error)) {
                            resolve(data);
                        }
                        else
                            reject(new Error(`Send error: ${data.message ? data.message : "Unknown error."}`));
                    }, this._settings.senderName, this._settings.sender, msgSubject, letter.body, mailList.id, msgSubject);
                });
            })
            .then(data => {
                console.log(data);
            });
    }

    run(fireDate) {
        return this._getLessons()
            .then(lessons => {
                if (lessons && (lessons.data.length > 0))
                    return this._buildLetter(lessons);
            })
            .then(letter => {
                if (letter)
                    return this._sendLetter(letter);
            });
    }
};
