'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const sharp = require('sharp');
const { URL, URLSearchParams } = require('url');
const fs = require('fs');

const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const mkdirAsync = promisify(fs.mkdir);

const { SubscriptionService } = require('../../services/mail-subscription');
const { Task } = require('../lib/task');
const { HttpCode } = require('../../const/http-codes');
const { SendMail } = require('../../mail');
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
    senderName: "Magisteria.ru",
    mailList: "Магистерия",
    imgDir: "mails",
    imgUrl: "/data/mails/",
    fbUrl: "https://www.facebook.com/Magisteria.ru/",
    okUrl: "https://ok.ru/group/54503517782126",
    twUrl: "https://twitter.com/MagisteriaRu",
    vkUrl: "https://vk.com/magisteriaru",
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
        this._settings = _.defaultsDeep(opts, dfltSettings);
        this._settings.baseUrl = this._settings.host ? this._settings.host : config.proxyServer.siteHost;
        this._subsServise = SubscriptionService();
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

    _getLessons(options) {
        let first_date;
        let last_date;
        return new Promise((resolve, reject) => {
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
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_LESSONS_MYSQL)({ first_date: this._formatDate(first_date), last_date: this._formatDate(last_date) }),
                    mssql: _.template(GET_LESSONS_MSSQL)({ first_date: this._formatDate(first_date), last_date: this._formatDate(last_date) })
                }
            }, {}));
        })
            .then((result) => {
                let data = (result && result.detail && (result.detail.length > 0)) ? result.detail : [];
                options.first_date = first_date;
                options.last_date = new Date(last_date.setDate(last_date.getDate() - 1));
                options.data = data;
                return options;
            })
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

    _buildLetter(options) {
        let imgDir;
        options.letter = { ids: [] };
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
                        return Utils.seqExec(options.data, (lesson) => {
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
                                    options.letter.ids.push(lesson.Id);
                                });
                        });
                    })
                    .then(() => {
                        options.letter.body = _.template(letterTmpl)({
                            root_url: this._settings.baseUrl,
                            logo_url: this._settings.baseUrl + this._settings.mailLogo,
                            lessons: lessons_body,
                            fb_url: this._settings.fbUrl,
                            fb_img_url: this._settings.baseUrl + this._settings.fbLogo,
                            vk_url: this._settings.vkUrl,
                            vk_img_url: this._settings.baseUrl + this._settings.vkLogo,
                            tw_url: this._settings.twUrl,
                            tw_img_url: this._settings.baseUrl + this._settings.twLogo,
                            ok_url: this._settings.okUrl,
                            ok_img_url: this._settings.baseUrl + this._settings.okLogo
                        });
                        return writeFileAsync("../../test.html", options.letter.body, "utf8");
                    })
                    .then(() => options.letter);
            });
    }

    _getAddressBook(options) {
        options.addressBooks = {};
        options.mailList = null;
        return this._subsServise.listAddressBooks()
            .then(result => {
                if (result && Array.isArray(result) && (result.length)) {
                    result.forEach(elem => {
                        options.addressBooks[elem.name] = elem;
                    })
                    options.mailList = options.addressBooks[this._settings.mailList];
                    if (!options.mailList)
                        throw new Error(`Mail list "${this._settings.mailList}" is missing!`);
                    return options.mailList;
                }
                else
                    throw new Error(`List of address books is empty!`);
            });
    }

    _getMailingName(options) {
        return _.template("Новые лекции с <%= first_date %> по <%= last_date %>")({
            first_date: this._formatDate(options.first_date, "text"),
            last_date: this._formatDate(options.last_date, "text")
        });
    }

    _sendLetter(options) {
        let self = this;
        let dbOptions = { dbRoots: [] };
        let root_obj;
        let db = $memDataBase;

        let newId;
        let new_obj;
        let root_lsn;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(db, (resolve, reject) => {
                var predicate = new Predicate(db, {});
                predicate
                    .addCondition({ field: "Id", op: "=", value: -1 });
                let exp =
                {
                    expr: {
                        model: {
                            name: "Mailing",
                            childs: [
                                {
                                    dataObject: {
                                        name: "LsnMailing"
                                    }
                                }
                            ]
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

                    dbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    options.letter.senderName = this._settings.senderName;
                    options.letter.senderEmail = this._settings.sender;
                    options.letter.name = options.letter.subject = this._getMailingName(options);

                    let fields = {
                        Name: options.letter.name,
                        SenderName: options.letter.senderName,
                        SenderEmail: options.letter.senderEmail,
                        Subject: options.letter.subject,
                        BookId: options.mailList.id,
                        Body: options.letter.body,
                        IsSent: false
                    };

                    return root_obj.newObject({
                        fields: fields
                    }, {});
                })
                .then((result) => {
                    newId = result.keyValue;
                    new_obj = db.getObj(result.newObject);
                    root_lsn = new_obj.getDataRoot("LsnMailing");
                    return root_obj.save();
                })
                .then(() => {
                    return new_obj.edit();
                })
                .then(() => {
                    return this._subsServise.createCampaign(options.letter.senderName, options.letter.senderEmail,
                        options.letter.subject, options.letter.body, options.mailList.id, options.letter.name);
                })
                .then(data => {
                    options.result = data;
                    if (data && (!data.is_error) && (!data.error_code)) {
                        new_obj.isSent(true);
                        new_obj.campaignId(data.id);
                        new_obj.status(data.status);
                    }
                    else {
                        options.result = {
                            is_error: true,
                            message: `Send error: ${data.message ? data.message : "Unknown error."}` +
                                (data.error_code ? ` (error_code: ${data.error_code})` : "")
                        };
                    }
                    new_obj.resBody(JSON.stringify(options.result));
                    
                    if (!options.result.is_error)
                        return Utils.seqExec(options.letter.ids, (elem) => {
                            return root_lsn.newObject({
                                fields: { LessonId: elem }
                            }, {});
                        });
                })
                .then(() => {
                    return new_obj.save();
                });
        }, dbOptions)
            .then(() => {
                if (options.result.is_error)
                    throw new Error(options.result.message);
            });
    }

    _sendMail(options, recipients) {
        let mailOptions = {
            disableUrlAccess: false,
            from: config.mail.mailing.sender, // sender address
            to: recipients // list of receivers
        };
        mailOptions.html = `Завершена: ${(new Date()).toISOString()}<br>`;
        if (options.result.is_error) {
            mailOptions.subject = `Ошибка при формировании рассылки ( ${(new Date()).toISOString()} )`;
            if (options.first_date) {
                mailOptions.subject = `Ошибка при формировании рассылки "${this._getMailingName(options)}"`;
                mailOptions.html += `Рассылка: "${this._getMailingName(options)}"<br>`;
            }
            mailOptions.html += `Ошибка: ${options.result.message}`;
        }
        else {
            mailOptions.subject = `Информация по рассылке: "${this._getMailingName(options)}"`;
            if (options.data.length) {
                mailOptions.html += `Количество лекций: ${options.data.length}<br>`;
                mailOptions.html += `Статус: ${JSON.stringify(options.result, null, 2).replace(/\n/g, "<br>")}<br>`;
            }
            else {
                mailOptions.html += `Нет лекций для рассылки.`;
            }
        }
        return SendMail("mailing", mailOptions);
    }

    run(fireDate) {
        let options = { result: {} };
        return this._getAddressBook(options)
            .then(() => {
                return this._getLessons(options);
            })
            .then(lessons => {
                if (lessons && (lessons.data.length > 0))
                    return this._buildLetter(options);
            })
            .then(letter => {
                if (letter)
                    return this._sendLetter(options);
            })
            .then(() => {
                if (this._settings.infoRecipients && config.mail.mailing)
                    return this._sendMail(options, this._settings.infoRecipients);
            }, (err) => {
                let rc = Promise.resolve();
                options.result = {
                    is_error: true,
                    message: err.message ? err.message : JSON.stringify(err)
                }
                if (this._settings.errRecipients && config.mail.mailing)
                    rc = this._sendMail(options, this._settings.errRecipients);
                return rc.then(msg => {
                    if (msg && msg.msgUrl)
                        console.log(`Message URL: ${msg.msgUrl}`);
                    throw err;
                });
            })
            .then(msg => {
                if (msg && msg.msgUrl)
                    console.log(`Message URL: ${msg.msgUrl}`);
            });
    }
};
