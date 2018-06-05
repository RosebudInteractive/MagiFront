'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const sm = require('sitemap');
const config = require('config');
const { Task } = require('../lib/task');
const { DbUtils } = require('../../database/db-utils');

const GET_LESSONS_SM_MSSQL =
    "select lc.[ReadyDate], c.[URL], l.[URL] as LURL, l.[Cover] from [Course] c\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R'\n" +
    "order by lc.[ReadyDate] desc";

const GET_LESSONS_SM_MYSQL =
    "select lc.`ReadyDate`, c.`URL`, l.`URL` as LURL, l.`Cover` from `Course` c\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R'\n" +
    "order by lc.`ReadyDate` desc";

const LESSONS_SITEMAP_FILE = "post-sitemap.xml";
const TRANSCRIPT_URL = "/transcript";

exports.SiteMapTask = class SiteMapTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._path = opts.path;
        if (typeof (this._path) !== "string")
            throw new Error(`SiteMapTask::constructor: Invalid argument "path": "${this._path}".`);
        this._siteHost = config.proxyServer.siteHost;
        this._dataUrl = this._siteHost + config.get('dataUrl');
    }

    _genLessonSM() {
        let startTime;
        let finTime;
        let self = this;
        return new Promise((resolve, reject) => {
            startTime = new Date();
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
                    result.detail.forEach((elem) => {
                        urls.push({
                            url: self._siteHost + "/" + elem.URL + "/" + elem.LURL,
                            lastmodISO: elem.ReadyDate.toISOString(),
                            img: [{
                                url: this._dataUrl + "/" + elem.Cover,
                                title: elem.Cover
                            }]
                        });
                        urls.push({
                            url: self._siteHost + "/" + elem.URL + "/" + elem.LURL + TRANSCRIPT_URL,
                            lastmodISO: elem.ReadyDate.toISOString(),
                        });
                    });
                    sitemap = sm.createSitemap({
                        hostname: self._siteHost,
                        cacheTime: 600000, // 600 sec - cache purge period
                        urls: urls
                    }).toString();
                }
                return sitemap;
            })
            .then((sitemap) => {
                if (sitemap)
                    fs.writeFileSync(path.join(this._path, LESSONS_SITEMAP_FILE), sitemap);
            });
    }

    run(fireDate) {
        return new Promise((resolve, reject) => {
            resolve(this._genLessonSM());
        })
    }
};
