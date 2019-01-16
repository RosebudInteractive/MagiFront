'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const RSS = require('rss');
const { FileTask } = require('../lib/file-task');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_LESSONS_IDS_MSSQL =
    "select top <%= nrec %> lc.[Id] from[Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "order by lc.[ReadyDate] desc, lc.[Id] desc";

const GET_CATEGORIES_MSSQL =
    "select lc.[Id], cl.[Name] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[CourseCategory] cc on cc.[CourseId] = c.[Id]\n" +
    "  join[CategoryLng] cl on cl.[CategoryId] = cc.[CategoryId]\n" +
    "where lc.[Id] in (<%= ids %>)";

const GET_LESSONS_MSSQL =
    "select lc.[ReadyDate], l.[Id], c.[URL], l.[URL] as [LURL], l.[Cover], l.[CoverMeta],\n" +
    "  ell.[Transcript], ll.[ShortDescription], ll.[Name], cl.[Name] as [CName]\n" +
    "from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "  join[LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join[EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  join[Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join[EpisodeLng] ell on ell.[EpisodeId] = e.[Id]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P' and lc.[Id] in (<%= ids %>)\n" +
    "order by lc.[ReadyDate] desc, lc.[Id] desc, el.[Number]";

const GET_LESSONS_IDS_MYSQL =
    "select lc.`Id` from`Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "order by lc.`ReadyDate` desc, lc.`Id` desc\n" +
    "limit <%= nrec %>";

const GET_CATEGORIES_MYSQL =
    "select lc.`Id`, cl.`Name` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`CourseCategory` cc on cc.`CourseId` = c.`Id`\n" +
    "  join`CategoryLng` cl on cl.`CategoryId` = cc.`CategoryId`\n" +
    "where lc.`Id` in (<%= ids %>)";

const GET_LESSONS_MYSQL =
    "select lc.`ReadyDate`, l.`Id`, c.`URL`, l.`URL` as `LURL`, l.`Cover`, l.`CoverMeta`,\n" +
    "  ell.`Transcript`, ll.`ShortDescription`, ll.`Name`, cl.`Name` as `CName`\n" +
    "from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "  join`LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join`EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  join`Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join`EpisodeLng` ell on ell.`EpisodeId` = e.`Id`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P' and lc.`Id` in (<%= ids %>)\n" +
    "order by lc.`ReadyDate` desc, lc.`Id` desc, el.`Number`";

const MAX_LESSONS_REQ_NUM = 20;

let dfltRssSettings = {
    'yandex-zen': {
        enabled: false,
        categoryMap: {
            "Психология": "Психология",
            "История": "Общество",
            "Философия": "Культура",
            "Музыка": "Музыка",
            "Литература": "Литература",
            "Искусство": "Культура",
            "Религия": "Общество"
        },
        title: "Магистерия",
        description: "Образовательный сайт с лекциями о живописи, музыке, философии, литературе, истории и многом другом. Отличная помощь студентам, продвинутым старшеклассникам и всем людям с культурными запросами. Зачерпни знания у источника!",
        language: "ru",
        author: "Magisteria.ru",
        category: "Общество",
        maxItems: 20,
        file: "yandex-zen.xml",
        feedUrl: "/feed/zen",
        guid: "8e295db3-3c27-4bc3-a814-013230b3a7f8"
    },
    'rss': {
        enabled: false,
        title: "Магистерия RSS",
        description: "Аудио лекции",
        language: "ru-RU",
        updatePeriod: "hourly",
        updateFrequency: "1",
        maxItems: 10,
        author: "Magisteria.ru",
        file: "magisteria-rss.xml",
        feedUrl: "/feed",
        guid: "78d7b935-0b61-4df5-a540-57ebd394115b"
    }
};

const RSS_GENERATOR_NAME = "Magisteria RSS Generator";
const FIGURE_TAG = '<figure><img src="<%= url %>" width="<%= width %>" height="<%= height %>" /><figcaption><%= caption %> <span class="copyright">Magisteria.ru</span></figcaption></figure>'

exports.RssTask = class RssTask extends FileTask {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._siteHost = opts.host ? opts.host : config.proxyServer.siteHost;
        this._rssSettings = _.defaultsDeep(opts.channels, dfltRssSettings);
    }

    _genYandexZen() {
        let chOptions = this._rssSettings['yandex-zen'];
        let items = [];

        let data = new Promise((resolve, reject) => {
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_LESSONS_IDS_MYSQL)({ nrec: chOptions.maxItems }),
                    mssql: _.template(GET_LESSONS_IDS_MSSQL)({ nrec: chOptions.maxItems })
                }
            }, {}));
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length > 0)) {
                    let lessonIds = [];
                    result.detail.forEach((elem) => {
                        lessonIds.push(elem.Id);
                    });
                    let restIds = lessonIds.length;
                    let currPos = 0;
                    let arrayOfIds = [];
                    while (restIds > 0) {
                        let len = restIds > MAX_LESSONS_REQ_NUM ? MAX_LESSONS_REQ_NUM : restIds;
                        arrayOfIds.push(lessonIds.slice(currPos, currPos + len));
                        restIds -= len;
                        currPos += len;
                    }
                    return Utils.seqExec(arrayOfIds, (elem) => {
                        let categories = {};
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_CATEGORIES_MYSQL)({ ids: elem.join() }),
                                mssql: _.template(GET_CATEGORIES_MSSQL)({ ids: elem.join() })
                            }
                        }, {})
                            .then((result) => {
                                if (result && result.detail && (result.detail.length > 0)) {
                                    result.detail.forEach((elem) => {
                                        let catLsn = categories[elem.Id];
                                        if (!catLsn)
                                            catLsn = categories[elem.Id] = {};
                                        let cat;
                                        if (chOptions.categoryMap)
                                            cat = chOptions.categoryMap[elem.Name];
                                        if ((!cat) && chOptions.category)
                                            cat = chOptions.category;
                                        if (cat)
                                            catLsn[cat] = true;
                                    })
                                }
                                return $data.execSql({
                                    dialect: {
                                        mysql: _.template(GET_LESSONS_MYSQL)({ ids: elem.join() }),
                                        mssql: _.template(GET_LESSONS_MSSQL)({ ids: elem.join() })
                                    }
                                }, {});
                            })
                            .then((result) => {
                                let lsns = [];
                                if (result && result.detail && (result.detail.length > 0)) {
                                    let lsn = null;
                                    result.detail.forEach((elem) => {
                                        if ((!lsn) || (lsn.Id !== elem.Id)) {
                                            lsn = {};
                                            lsn.Id = elem.Id;
                                            lsn.date = elem.ReadyDate;
                                            lsn.url = elem.URL + "/" + elem.LURL;
                                            lsn.imgFile = elem.Cover;
                                            lsn.imgMeta = JSON.parse(elem.CoverMeta);
                                            lsn.title = elem.Name;
                                            lsn.description = elem.ShortDescription;
                                            lsn.transcript = "";
                                            lsn.categories = [];
                                            let ctg = categories[elem.Id];
                                            if (ctg)
                                                lsn.categories = Object.keys(ctg);
                                            lsns.push(lsn);
                                            items.push(lsn);
                                        }
                                        lsn.transcript += elem.Transcript;
                                    });
                                }
                                return lsns;
                            })
                            .then((lsns) => {
                                if (lsns.length > 0) {
                                    let filePath = config.uploadPath ? config.uploadPath : "./";
                                    return Utils.seqExec(lsns, (elem) => {
                                        let fileName = path.join(filePath, elem.imgFile);
                                        return this._getFileSize(fileName)
                                            .then((size) => {
                                                if (size !== -1)
                                                    elem.imgMeta.length = size;
                                            });
                                    });
                                }
                            });
                    });
                }
            })
            .then(() => {
                let rssXml;
                if (items.length > 0) {
                    let feedData = {
                        site_url: this._siteHost,
                        generator: RSS_GENERATOR_NAME,
                        custom_namespaces: {
                            'media': 'http://search.yahoo.com/mrss/'
                        },
                    };
                    if (chOptions.description)
                        feedData.description = chOptions.description;
                    if (chOptions.title)
                        feedData.title = chOptions.title;
                    if (chOptions.language)
                        feedData.language = chOptions.language;
                    if (chOptions.feedUrl)
                        feedData.feed_url = this._href(this._siteHost + chOptions.feedUrl);
                    let feed = new RSS(feedData);
                    items.forEach((elem) => {
                        let imgUrl = this._href(this._siteHost + config.dataUrl + "/" + elem.imgFile);
                        let item = {
                            title: elem.title,
                            description: elem.description,
                            url: this._href(this._siteHost + "/" + elem.url),
                            date: elem.date,
                            categories: elem.categories,
                            enclosure: { url: imgUrl, size: elem.imgMeta.length }, // optional enclosure
                            custom_elements: [
                                { 'author': chOptions.author },
                                { 'media:rating': [{ _attr: { scheme: "urn:simple" } }, 'nonadult'] }
                            ]
                        };
                        let content = _.template(FIGURE_TAG)(
                            {
                                url: imgUrl,
                                width: elem.imgMeta.size.width,
                                height: elem.imgMeta.size.height,
                                caption: elem.imgMeta.name
                            });
                        let filtered = elem.transcript.replace(/<a\s.*?>.*?<\/a>/gim, ''); // remove links (tags <a>) from transcript
                        filtered = filtered.replace(/<b><u>ts:\{.*?\}<\/u><\/b>/gim, ''); // remove time labels
                        content += filtered;
                        item.custom_elements.push({ 'content:encoded': { _cdata: content } });
                        feed.item(item);
                    });
                    rssXml = { content: feed.xml({ indent: true }) };
                    rssXml.csContent = rssXml.content.replace(/\s*<lastBuildDate>.*?<\/lastBuildDate>/g, ''); // remove <lastBuildDate> tag
                }
                return rssXml;
            });
        return this._genFile(data, chOptions);
    }

    _genRss() {
        let chOptions = this._rssSettings['rss'];
        let items = [];

        let data = new Promise((resolve, reject) => {
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_LESSONS_IDS_MYSQL)({ nrec: chOptions.maxItems }),
                    mssql: _.template(GET_LESSONS_IDS_MSSQL)({ nrec: chOptions.maxItems })
                }
            }, {}));
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length > 0)) {
                    let lessonIds = [];
                    result.detail.forEach((elem) => {
                        lessonIds.push(elem.Id);
                    });
                    let restIds = lessonIds.length;
                    let currPos = 0;
                    let arrayOfIds = [];
                    while (restIds > 0) {
                        let len = restIds > MAX_LESSONS_REQ_NUM ? MAX_LESSONS_REQ_NUM : restIds;
                        arrayOfIds.push(lessonIds.slice(currPos, currPos + len));
                        restIds -= len;
                        currPos += len;
                    }
                    return Utils.seqExec(arrayOfIds, (elem) => {
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(GET_LESSONS_MYSQL)({ ids: elem.join() }),
                                mssql: _.template(GET_LESSONS_MSSQL)({ ids: elem.join() })
                            }
                        }, {})
                            .then((result) => {
                                let lsns = [];
                                if (result && result.detail && (result.detail.length > 0)) {
                                    let lsn = null;
                                    result.detail.forEach((elem) => {
                                        if ((!lsn) || (lsn.Id !== elem.Id)) {
                                            lsn = {};
                                            lsn.Id = elem.Id;
                                            lsn.date = elem.ReadyDate;
                                            lsn.url = elem.URL + "/" + elem.LURL;
                                            lsn.imgFile = elem.Cover;
                                            lsn.imgMeta = JSON.parse(elem.CoverMeta);
                                            lsn.title = elem.Name;
                                            lsn.category = elem.CName;
                                            lsn.description = elem.ShortDescription;
                                            lsn.transcript = "";
                                            lsns.push(lsn);
                                            items.push(lsn);
                                        }
                                        lsn.transcript += elem.Transcript;
                                    });
                                }
                                return lsns;
                            })
                            .then((lsns) => {
                                if (lsns.length > 0) {
                                    let filePath = config.uploadPath ? config.uploadPath : "./";
                                    return Utils.seqExec(lsns, (elem) => {
                                        let fileName = path.join(filePath, elem.imgFile);
                                        return this._getFileSize(fileName)
                                            .then((size) => {
                                                if (size !== -1)
                                                    elem.imgMeta.length = size;
                                            });
                                    });
                                }
                            })
                    });
                }
            })
            .then(() => {
                let rssXml;
                if (items.length > 0) {
                    let feedData = {
                        site_url: this._siteHost,
                        generator: RSS_GENERATOR_NAME,
                        custom_namespaces: {
                            sy: "http://purl.org/rss/1.0/modules/syndication/"
                        },
                        custom_elements: []
                    };
                    if (chOptions.updatePeriod)
                        feedData.custom_elements.push({ 'sy:updatePeriod': chOptions.updatePeriod });
                    if (chOptions.updateFrequency)
                        feedData.custom_elements.push({ 'sy:updateFrequency': chOptions.updateFrequency });
                    if (chOptions.description)
                        feedData.description = chOptions.description;
                    if (chOptions.title)
                        feedData.title = chOptions.title;
                    if (chOptions.language)
                        feedData.language = chOptions.language;
                    if (chOptions.feedUrl)
                        feedData.feed_url = this._href(this._siteHost + chOptions.feedUrl);
                    let feed = new RSS(feedData);
                    items.forEach((elem) => {
                        let imgUrl = this._href(this._siteHost + config.dataUrl + "/" + elem.imgFile);
                        let item = {
                            title: elem.title,
                            description: elem.description,
                            url: this._href(this._siteHost + "/" + elem.url),
                            date: elem.date,
                            author: chOptions.author,
                            categories: [],
                            enclosure: { url: imgUrl, size: elem.imgMeta.length } // optional enclosure
                        };
                        if (elem.category)
                            item.categories.push(elem.category);
                        feed.item(item);
                    });
                    rssXml = { content: feed.xml({ indent: true }) };
                    rssXml.csContent = rssXml.content.replace(/\s*<lastBuildDate>.*?<\/lastBuildDate>/g, ''); // remove <lastBuildDate> tag
                }
                return rssXml;
            });
        return this._genFile(data, chOptions);
    }

    run(fireDate) {
        return new Promise((resolve, reject) => {
            if (this._rssSettings['yandex-zen'].enabled)
                resolve(this._genYandexZen())
            else
                resolve();
        })
            .then((result) => {
                if (this._rssSettings['rss'].enabled)
                    return this._genRss();
            })
    }
};
