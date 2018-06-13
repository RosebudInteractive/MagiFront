'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const RSS = require('rss');
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

let dfltRssSettings = {
    'yandex-zen': {
        enabled: false,
        title: "Магистерия",
        description: "Образовательный сайт с лекциями о живописи, музыке, философии, литературе, истории и многом другом. Отличная помощь студентам, продвинутым старшеклассникам и всем людям с культурными запросами. Зачерпни знания у источника!",
        language: "ru",
        author: "Magisteria.ru",
        category: "Общество",
        maxItems: 20,
        file: "zen.xml",
        guid: "8e295db3-3c27-4bc3-a814-013230b3a7f8"
    },
    'rss': {
        enabled: false,
        description: "Аудио лекции",
        maxItems: 10,
        file: "rss.xml",
        guid: "78d7b935-0b61-4df5-a540-57ebd394115b"
    }
};

const RSS_GENERATOR_NAME = "Magisteria RSS Generator";

exports.RssTask = class RssTask extends FileTask {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._siteHost = config.proxyServer.siteHost;
        this._rssSettings = _.defaultsDeep(opts.channels, dfltRssSettings);
    }

    _genYandexZen() {
        let chOptions = this._rssSettings['yandex-zen'];
        let data = new Promise((resolve, reject) => {
            resolve();
        })
            .then(() => {
                let rssXml;
                let feedData = {
                    site_url: this._href(this._siteHost),
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
                    feedData.feed_url = this._href(this._siteHost + "/" + chOptions.feedUrl);
                let feed = new RSS(feedData);

                let item = {
                    title: "sdfsfsdfsdf",
                    description: "asdADad",
                    url: this._href(this._siteHost + "/" + "dfsdfdsafsad"),
                    date: new Date(),
                    categories: [],
                    enclosure: { url: this._href('https://magisteria.ru/data/Пушкин на Ай-Петри.jpg'), size: 0 }, // optional enclosure
                    custom_elements: [
                        { 'author': chOptions.author },
                        { 'media:rating': [{ _attr: { scheme: "urn:simple" } }, 'nonadult'] },
                        { 'content:encoded': { _cdata: "asdADCXZCZX ]]> SDCCVDSVDFV Fvxadfvdfvd" } }
                    ]
                };
                if (chOptions.category)
                    item.categories.push(chOptions.category);

                feed.item(item);
                rssXml = feed.xml({ indent: true });
                return rssXml;
            });
        return this._genFile(data, chOptions);
    }

    _genRss() {
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
