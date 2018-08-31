'use strict';
const path = require('path');
const _ = require('lodash');
const sm = require('sitemap');
const config = require('config');
const { FileTask } = require('../lib/file-task');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_LESSONS_SM_MSSQL =
    "select lc.[ReadyDate], c.[URL], l.[URL] as LURL, l.[Cover], l.[CoverMeta] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "order by lc.[ReadyDate] desc, c.[URL], l.[URL]";

const GET_COURSES_SM_MSSQL =
    "select max(lc.[ReadyDate]) as [ReadyDate], c.[URL], c.[Cover] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "group by c.[URL], c.[Cover]\n" +
    "order by 1 desc, c.[URL]";

const GET_COURSES_IMG_SM_MSSQL =
    "select c.[URL], c.[CoverMeta] from[Course] c where c.[State] = 'P'";

const GET_CATEGORIES_SM_MSSQL =
    "select max(lc.[ReadyDate]) as [ReadyDate], g.[URL] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[CourseCategory] cc on cc.[CourseId] = c.[Id]\n" +
    "  join[Category] g on g.[Id] = cc.[CategoryId]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "group by g.[URL]\n" +
    "order by 1 desc, g.[URL]";

const GET_AUTHORS_SM_MSSQL =
    "select distinct a.[TimeMdf] as [Atime], al.[TimeMdf] as [Altime], a.[URL], a.[Portrait], al.[FirstName], al.[LastName] from[Author] a\n" +
    "  join[AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "  join[AuthorToCourse] ac on ac.[AuthorId] = a.[Id]\n" +
    "  join[Course] c on c.[Id] = ac.[CourseId]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "order by a.[URL]";

const GET_AUTHORS_IMG_SM_MSSQL =
    "select a.[URL], a.[PortraitMeta] from[Author] a";

const GET_LASTDATE_SM_MSSQL =
    "select max(lc.[ReadyDate]) as [ReadyDate] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'";

const GET_LESSONS_SM_MYSQL =
    "select lc.`ReadyDate`, c.`URL`, l.`URL` as LURL, l.`Cover`, l.`CoverMeta` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "order by lc.`ReadyDate` desc, c.`URL`, l.`URL`";

const GET_COURSES_SM_MYSQL =
    "select max(lc.`ReadyDate`) as `ReadyDate`, c.`URL`, c.`Cover` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "group by c.`URL`, c.`Cover`\n" +
    "order by 1 desc, c.`URL`";

const GET_COURSES_IMG_SM_MYSQL =
    "select c.`URL`, c.`CoverMeta` from`Course` c where c.`State` = 'P'";

const GET_CATEGORIES_SM_MYSQL =
    "select max(lc.`ReadyDate`) as `ReadyDate`, g.`URL` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`CourseCategory` cc on cc.`CourseId` = c.`Id`\n" +
    "  join`Category` g on g.`Id` = cc.`CategoryId`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "group by g.`URL`\n" +
    "order by 1 desc, g.`URL`";

const GET_AUTHORS_SM_MYSQL =
    "select distinct a.`TimeMdf` as `Atime`, al.`TimeMdf` as `Altime`, a.`URL`, a.`Portrait`, al.`FirstName`, al.`LastName` from`Author` a\n" +
    "  join`AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "  join`AuthorToCourse` ac on ac.`AuthorId` = a.`Id`\n" +
    "  join`Course` c on c.`Id` = ac.`CourseId`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "order by a.`URL`";

const GET_AUTHORS_IMG_SM_MYSQL =
    "select a.`URL`, a.`PortraitMeta` from`Author` a";

const GET_LASTDATE_SM_MYSQL =
    "select max(lc.`ReadyDate`) as `ReadyDate` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'";

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
        prefixUrl: "/autor",
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

exports.SiteMapTask = class SiteMapTask extends FileTask {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._siteHost = config.proxyServer.siteHost;
        this._dataUrl = this._siteHost + config.get('dataUrl');
        this._siteMapSettings = _.defaultsDeep(opts.maps, dfltSiteMapSettings);
        this._xslUrl = opts.xslUrl;
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
                        let img = { url: this._href(this._dataUrl + "/" + elem.Cover), title: this._getFileName(elem.Cover) };
                        if (elem.CoverMeta) {
                            try {
                                let meta = JSON.parse(elem.CoverMeta);
                                if (meta.name)
                                    img.title = meta.name;
                                if (meta.description)
                                    img.caption = meta.description;
                            } catch (err) { };
                        }
                        urls.push({
                            url: this._href(this._siteHost + "/" + elem.URL + "/" + elem.LURL),
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [img]
                        });
                        // urls.push({
                        //     url: this._href(this._siteHost + "/" + elem.URL + "/" + elem.LURL + this._siteMapSettings.lesson.transcriptUrl),
                        //     lastmodISO: firstTranscriptDate > elem.ReadyDate ? firstTranscriptDate.toISOString() : elem.ReadyDate.toISOString(),
                        // });
                    });
                    let siteMapOptions = { urls: urls };
                    let xslUrl = this._siteMapSettings.lesson.xslUrl || this._xslUrl;
                    if (xslUrl)
                        siteMapOptions.xslUrl = xslUrl;
                    sitemap = sm.createSitemap(siteMapOptions).toString();
                }
                return sitemap;
            });
        return this._genFile(data, this._siteMapSettings.lesson);
    }

    _genCourseSM() {
        let imgs = {};
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_COURSES_IMG_SM_MYSQL,
                        mssql: GET_COURSES_IMG_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length > 0)) {
                    result.detail.forEach((elem) => {
                        if (elem.CoverMeta) {
                            try {
                                let meta = JSON.parse(elem.CoverMeta);
                                imgs[elem.URL] = meta;
                            } catch (err) { };
                        }
                    });
                    return $data.execSql({
                        dialect: {
                            mysql: GET_COURSES_SM_MYSQL,
                            mssql: GET_COURSES_SM_MSSQL
                        }
                    }, {});
                }
            })
            .then((result) => {
                let sitemap;
                if (result && result.detail && (result.detail.length > 0)) {
                    let urls = [];
                    let prefixUrl = this._siteMapSettings.course.prefixUrl;
                    result.detail.forEach((elem) => {
                        let img = { url: this._href(this._dataUrl + "/" + elem.Cover), title: this._getFileName(elem.Cover) };
                        let meta = imgs[elem.URL];
                        if (meta) {
                            if (meta.name)
                                img.title = meta.name;
                            if (meta.description)
                                img.caption = meta.description;
                        }
                        urls.push({
                            url: this._href(this._siteHost + prefixUrl + "/" + elem.URL),
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [img]
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
        return this._genFile(data, this._siteMapSettings.course);
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
                            url: this._href(this._siteHost + prefixUrl + "/" + elem.URL),
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [{
                                url: this._href(this._dataUrl + "/" + elem.Cover),
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
        return this._genFile(data, this._siteMapSettings.category);
    }

    _genAuthorSM() {
        let imgs = {};
        let data = new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: GET_AUTHORS_IMG_SM_MYSQL,
                        mssql: GET_AUTHORS_IMG_SM_MSSQL
                    }
                }, {})
            );
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length > 0)) {
                    result.detail.forEach((elem) => {
                        if (elem.PortraitMeta) {
                            try {
                                let meta = JSON.parse(elem.PortraitMeta);
                                imgs[elem.URL] = meta;
                            } catch (err) { };
                        }
                    });
                    return $data.execSql({
                        dialect: {
                            mysql: GET_AUTHORS_SM_MYSQL,
                            mssql: GET_AUTHORS_SM_MSSQL
                        }
                    }, {});
                }
            })
            .then((result) => {
                let sitemap;
                if (result && result.detail && (result.detail.length > 0)) {
                    let urls = [];
                    let prefixUrl = this._siteMapSettings.author.prefixUrl;
                    result.detail.forEach((elem) => {
                        let img = { url: this._href(this._dataUrl + "/" + elem.Portrait), title: elem.FirstName + " " + elem.LastName };
                        let meta = imgs[elem.URL];
                        if (meta) {
                            if (meta.name)
                                img.title = meta.name;
                            if (meta.description)
                                img.caption = meta.description;
                        }
                        urls.push({
                            url: this._href(this._siteHost + prefixUrl + "/" + elem.URL),
                            lastmodISO: elem.Atime > elem.Altime ? elem.Atime.toISOString() : elem.Altime.toISOString(),
                            img: [img]
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
        return this._genFile(data, this._siteMapSettings.author);
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
                        url: this._href(this._siteHost),
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
                    url: this._href(this._siteHost + this._siteMapSettings.page.aboutUrl),
                    lastmodISO: firstAboutDate.toISOString()
                });
                let siteMapOptions = { urls: urls };
                let xslUrl = this._siteMapSettings.page.xslUrl || this._xslUrl;
                if (xslUrl)
                    siteMapOptions.xslUrl = xslUrl;
                sitemap = sm.createSitemap(siteMapOptions).toString();
                return sitemap;
            });
        return this._genFile(data, this._siteMapSettings.page);
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
        return this._genFile(data, this._siteMapSettings.index);
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
