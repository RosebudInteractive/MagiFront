'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const _ = require('lodash');
const sm = require('sitemap');
const config = require('config');
const { Task } = require('../lib/task');
const { DbUtils } = require('../../database/db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_LESSONS_SM_MSSQL =
    "select lc.[ReadyDate], c.[URL], l.[URL] as LURL, l.[Cover] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R'\n" +
    "order by lc.[ReadyDate] desc, c.[URL], l.[URL]";

const GET_COURSES_SM_MSSQL =
    "select max(lc.[ReadyDate]) as [ReadyDate], c.[URL], c.[Cover] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "where lc.[State] = 'R'\n" +
    "group by c.[URL], c.[Cover]\n" +
    "order by 1 desc, c.[URL]";

const GET_CATEGORIES_SM_MSSQL =
    "select max(lc.[ReadyDate]) as [ReadyDate], g.[URL] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[CourseCategory] cc on cc.[CourseId] = c.[Id]\n" +
    "  join[Category] g on g.[Id] = cc.[CategoryId]\n" +
    "where lc.[State] = 'R'\n" +
    "group by g.[URL]\n" +
    "order by 1 desc, g.[URL]";

const GET_AUTHORS_SM_MSSQL =
    "select distinct a.[TimeMdf] as [Atime], al.[TimeMdf] as [Altime], a.[URL], a.[Portrait], al.[FirstName], al.[LastName] from[Author] a\n" +
    "  join[AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "  join[AuthorToCourse] ac on ac.[AuthorId] = a.[Id]\n" +
    "  join[Course] c on c.[Id] = ac.[CourseId]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "where lc.[State] = 'R'\n" +
    "order by a.[URL]";

const GET_LASTDATE_SM_MSSQL =
    "select max(lc.[ReadyDate]) as [ReadyDate] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "where lc.[State] = 'R'";

const GET_LESSONS_SM_MYSQL =
    "select lc.`ReadyDate`, c.`URL`, l.`URL` as LURL, l.`Cover` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R'\n" +
    "order by lc.`ReadyDate` desc, c.`URL`, l.`URL`";

const GET_COURSES_SM_MYSQL =
    "select max(lc.`ReadyDate`) as `ReadyDate`, c.`URL`, c.`Cover` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "where lc.`State` = 'R'\n" +
    "group by c.`URL`, c.`Cover`\n" +
    "order by 1 desc, c.`URL`";

const GET_CATEGORIES_SM_MYSQL =
    "select max(lc.`ReadyDate`) as `ReadyDate`, g.`URL` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`CourseCategory` cc on cc.`CourseId` = c.`Id`\n" +
    "  join`Category` g on g.`Id` = cc.`CategoryId`\n" +
    "where lc.`State` = 'R'\n" +
    "group by g.`URL`\n" +
    "order by 1 desc, g.`URL`";

const GET_AUTHORS_SM_MYSQL =
    "select distinct a.`TimeMdf` as `Atime`, al.`TimeMdf` as `Altime`, a.`URL`, a.`Portrait`, al.`FirstName`, al.`LastName` from`Author` a\n" +
    "  join`AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "  join`AuthorToCourse` ac on ac.`AuthorId` = a.`Id`\n" +
    "  join`Course` c on c.`Id` = ac.`CourseId`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "where lc.`State` = 'R'\n" +
    "order by a.`URL`";

const GET_LASTDATE_SM_MYSQL =
    "select max(lc.`ReadyDate`) as `ReadyDate` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "where lc.`State` = 'R'";

let dfltSiteMapSettings = {
    lesson: {
        xslUrl: "/main-sitemap.xsl",
        file: "post-sitemap.xml",
        guid: "596ca7cd-c367-4ac5-85a0-26e28ab60005",
        transcriptUrl: "/transcript"
    },
    course: {
        file: "category-sitemap.xml",
        prefixUrl: "/category",
        guid: "3cd6a4ab-2191-41e9-81b0-2ae5ecdcab3c"
    },
    category: {
        file: "razdel-sitemap.xml",
        prefixUrl: "/razdel",
        guid: "c0fe5abe-a995-4842-84a4-3ac7c94b0272"
    },
    author: {
        file: "author-sitemap.xml",
        prefixUrl: "/author",
        guid: "300111dd-0432-4e8f-aed1-cbc056e0659b"
    },
    page: {
        file: "page-sitemap.xml",
        aboutUrl: "/about",
        guid: "9902d23d-0dd6-4fb1-95f9-04f801762969"
    },
    index: {
        file: "sitemap_index.xml",
        guid: "156ba961-62d9-4095-a609-5c4c80e706f0"
    }
};

const FILE_INFO_LENGTH = 150;

const { promisify } = require('util');
const { Buffer } = require('buffer');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const openAsync = promisify(fs.open);
const readAsync = promisify(fs.read);
const closeAsync = promisify(fs.close);

exports.SiteMapTask = class SiteMapTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._path = opts.path;
        if (typeof (this._path) !== "string")
            throw new Error(`SiteMapTask::constructor: Invalid argument "path": "${this._path}".`);
        this._siteHost = config.proxyServer.siteHost;
        this._dataUrl = this._siteHost + config.get('dataUrl');
        this._siteMapSettings = _.defaultsDeep(opts.maps, dfltSiteMapSettings);
        this._xslUrl = opts.xslUrl;
    }

    _getFileInfo(fileName, fileGuid) {
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
                position = (stats.size - FILE_INFO_LENGTH) > 0 ? stats.size - FILE_INFO_LENGTH : 0;
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

    _saveSiteMap(sitemap, startTime, finTime, fileName, fileGuid) {
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

    _genSM(dataSourse, mapOptions) {
        let startTime;
        return new Promise((resolve, reject) => {
            startTime = new Date();
            resolve(dataSourse);
        })
            .then((sitemap) => {
                if (sitemap) {
                    let fileName = path.join(this._path, mapOptions.file);
                    let fileGuid = mapOptions.guid
                    return this._saveSiteMap(sitemap, startTime, new Date(), fileName, fileGuid);
                }
                else
                    return false;
            });
    }

    _genLessonSM() {
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_LESSONS_SM_MYSQL,
                        mssql: GET_LESSONS_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                let sitemap;
                if (result && result.detail && (result.detail.length > 0)) {
                    let urls = [];
                    let firstTranscriptDate = new Date();
                    if (this._siteMapSettings.lesson.firstTranscriptDate) {
                        let d = Date.parse(this._siteMapSettings.lesson.firstTranscriptDate);
                        if (!isNaN(d))
                            firstTranscriptDate = new Date(d);
                    }
                    result.detail.forEach((elem) => {
                        urls.push({
                            url: this._siteHost + "/" + elem.URL + "/" + elem.LURL,
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [{
                                url: this._dataUrl + "/" + elem.Cover,
                                title: elem.Cover
                            }]
                        });
                        urls.push({
                            url: this._siteHost + "/" + elem.URL + "/" + elem.LURL + this._siteMapSettings.lesson.transcriptUrl,
                            lastmodISO: firstTranscriptDate > elem.ReadyDate ? firstTranscriptDate.toISOString() : elem.ReadyDate.toISOString(),
                        });
                    });
                    let siteMapOptions = { urls: urls };
                    let xslUrl = this._siteMapSettings.lesson.xslUrl || this._xslUrl;
                    if (xslUrl)
                        siteMapOptions.xslUrl = xslUrl;
                    sitemap = sm.createSitemap(siteMapOptions).toString();
                }
                return sitemap;
            });
        return this._genSM(data, this._siteMapSettings.lesson);
    }

    _genCourseSM() {
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_COURSES_SM_MYSQL,
                        mssql: GET_COURSES_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                let sitemap;
                if (result && result.detail && (result.detail.length > 0)) {
                    let urls = [];
                    let prefixUrl = this._siteMapSettings.course.prefixUrl;
                    result.detail.forEach((elem) => {
                        urls.push({
                            url: this._siteHost + prefixUrl + "/" + elem.URL,
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [{
                                url: this._dataUrl + "/" + elem.Cover,
                                title: elem.Cover
                            }]
                        });
                    });
                    let siteMapOptions = { urls: urls };
                    let xslUrl = this._siteMapSettings.course.xslUrl || this._xslUrl;
                    if (xslUrl)
                        siteMapOptions.xslUrl = xslUrl;
                    sitemap = sm.createSitemap(siteMapOptions).toString();
                }
                return sitemap;
            });
        return this._genSM(data, this._siteMapSettings.course);
    }

    _genCategorySM() {
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_CATEGORIES_SM_MYSQL,
                        mssql: GET_CATEGORIES_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                let sitemap;
                if (result && result.detail && (result.detail.length > 0)) {
                    let urls = [];
                    let prefixUrl = this._siteMapSettings.category.prefixUrl;
                    result.detail.forEach((elem) => {
                        urls.push({
                            url: this._siteHost + prefixUrl + "/" + elem.URL,
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [{
                                url: this._dataUrl + "/" + elem.Cover,
                                title: elem.Cover
                            }]
                        });
                    });
                    let siteMapOptions = { urls: urls };
                    let xslUrl = this._siteMapSettings.category.xslUrl || this._xslUrl;
                    if (xslUrl)
                        siteMapOptions.xslUrl = xslUrl;
                    sitemap = sm.createSitemap(siteMapOptions).toString();
                }
                return sitemap;
            });
        return this._genSM(data, this._siteMapSettings.category);
    }

    _genAuthorSM() {
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_AUTHORS_SM_MYSQL,
                        mssql: GET_AUTHORS_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                let sitemap;
                if (result && result.detail && (result.detail.length > 0)) {
                    let urls = [];
                    let prefixUrl = this._siteMapSettings.author.prefixUrl;
                    result.detail.forEach((elem) => {
                        urls.push({
                            url: this._siteHost + prefixUrl + "/" + elem.URL,
                            lastmodISO: elem.Atime > elem.Altime ? elem.Atime.toISOString() : elem.Altime.toISOString(),
                            img: [{
                                url: this._dataUrl + "/" + elem.Portrait,
                                title: elem.FirstName + " " + elem.LastName
                            }]
                        });
                    });
                    let siteMapOptions = { urls: urls };
                    let xslUrl = this._siteMapSettings.author.xslUrl || this._xslUrl;
                    if (xslUrl)
                        siteMapOptions.xslUrl = xslUrl;
                    sitemap = sm.createSitemap(siteMapOptions).toString();
                }
                return sitemap;
            });
        return this._genSM(data, this._siteMapSettings.author);
    }

    _genPageSM() {
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_LASTDATE_SM_MYSQL,
                        mssql: GET_LASTDATE_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                let sitemap;
                let urls = [];
                if (result && result.detail && (result.detail.length > 0)) {
                    let elem = result.detail[0];
                    urls.push({
                        url: this._siteHost,
                        lastmodISO: elem.ReadyDate.toISOString()
                    });
                }
                let firstAboutDate = new Date();
                if (this._siteMapSettings.page.firstAboutDate) {
                    let d = Date.parse(this._siteMapSettings.page.firstAboutDate);
                    if (!isNaN(d))
                        firstAboutDate = new Date(d);
                }
                urls.push({
                    url: this._siteHost + this._siteMapSettings.page.aboutUrl,
                    lastmodISO: firstAboutDate.toISOString()
                });
                let siteMapOptions = { urls: urls };
                let xslUrl = this._siteMapSettings.page.xslUrl || this._xslUrl;
                if (xslUrl)
                    siteMapOptions.xslUrl = xslUrl;
                sitemap = sm.createSitemap(siteMapOptions).toString();
                return sitemap;
            });
        return this._genSM(data, this._siteMapSettings.page);
    }

    _genIndexSM() {
        let urls = [];
        let lastmod = 0;
        let data = Utils.seqExec(this._siteMapSettings, (obj, key) => {
            let rc = Promise.resolve();
            if (key !== "index") {
                if (obj.file) {
                    let fileName = path.join(this._path, obj.file);
                    let fileGuid = obj.guid;
                    rc = this._getFileInfo(fileName, fileGuid)
                        .then((fileInfo) => {
                            if (fileInfo.lastModif) {
                                let t = fileInfo.lastModif - 0;
                                lastmod = lastmod && (t > lastmod) ? t : ((!lastmod) ? t : lastmod);
                            }
                            urls.push(this._siteHost + "/" + obj.file);
                        });
                }
                else
                    rc = Promise.reject(`Sitemap file is undefined for "${key}".`);
            }
            return rc;
        })
            .then(() => {
                if (urls.length > 0) {
                    let siteMapIdxOptions = { lastmod: lastmod ? new Date(lastmod) : new Date(), urls: urls };
                    let xslUrl = this._siteMapSettings.index.xslUrl || this._xslUrl;
                    if (xslUrl)
                        siteMapIdxOptions.xslUrl = xslUrl;
                    return sm.buildSitemapIndex(siteMapIdxOptions);
                }
            });
        return this._genSM(data, this._siteMapSettings.index);
    }

    run(fireDate) {
        let isModified = false;
        return new Promise((resolve, reject) => {
            resolve(this._genLessonSM());
        })
            .then((result) => {
                isModified = isModified || result;
                return this._genCourseSM();
            })
            .then((result) => {
                isModified = isModified || result;
                return this._genCategorySM();
            })
            .then((result) => {
                isModified = isModified || result;
                return this._genAuthorSM();
            })
            .then((result) => {
                isModified = isModified || result;
                return this._genPageSM();
            })
            .then((result) => {
                isModified = isModified || result;
                if (isModified)
                    return this._genIndexSM();
            });
    }
};
