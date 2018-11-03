'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const request = require('request');
const { URL, URLSearchParams } = require('url');
const { Task } = require('../lib/task');
const { HttpCode } = require('../../const/http-codes');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_LESSONS_MSSQL =
    "select lc.[ReadyDate], c.[Id] as [CID], l.[Id], c.[URL], l.[URL] as [LURL]\n" +
    "from[Course] c\n" +
    "  join[CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join[LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "  join[Lesson] l on l.[Id] = lc.[LessonId]\n" +
    "where lc.[State] = 'R' and c.[State] = 'P'\n" +
    "order by lc.[ReadyDate] desc\n" +
    "offset <%= offset %> rows fetch next <%= nrec %> rows only";

const GET_SNLIST_MSSQL =
    "select [Id], [Code] from [SNetProvider]";

const GET_LESSONS_MYSQL =
    "select lc.`ReadyDate`, c.`Id` as `CID`, l.`Id`, c.`URL`, l.`URL` as `LURL`\n" +
    "from`Course` c\n" +
    "  join`CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join`LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "  join`Lesson` l on l.`Id` = lc.`LessonId`\n" +
    "where lc.`State` = 'R' and c.`State` = 'P'\n" +
    "order by lc.`ReadyDate` desc\n" +
    "limit <%= offset %>,<%= nrec %>";

const GET_SNLIST_MYSQL =
    "select `Id`, `Code` from `SNetProvider`";

const MAX_URLS = 1000;
const URL_DELAY = 1000;

const MIN_FB_DELAY = 30 * 1000;
const FB_REPAIR_TIME = 65 * 60 * 1000;
const FB_USAGE_LIMIT_PERC = 90;

let dfltSnets = ["facebook", "vkontakte", "odnoklassniki"];
let dfltSettings = {
    urlDelay: URL_DELAY,
    offset: 0,
    maxUrls: MAX_URLS,
    snPrefs: {
        facebook: {
            usageLimitPerc: FB_USAGE_LIMIT_PERC,
            repairTime: FB_REPAIR_TIME,
            minDelay: MIN_FB_DELAY
        }
    }
};

exports.SnCounterTask = class SnCounterTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._settings = _.defaultsDeep(opts, dfltSettings);
        if (!this._settings.snets)
            this._settings.snets = dfltSnets;
        this._settings.baseUrl = this._settings.baseUrl ? this._settings.baseUrl : config.proxyServer.siteHost;
        this._snList = {};
        this._snListById = {};
        this._courses = {};
        this._setDfltDelay(this._settings.urlDelay);
    }

    _getSnList() {
        let self = this;
        return new Promise((resolve, reject) => {
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_SNLIST_MYSQL)(),
                    mssql: _.template(GET_SNLIST_MSSQL)()
                }
            }, {}));
        })
            .then((result) => {
                if (result && result.detail && (result.detail.length > 0)) {
                    result.detail.forEach((elem) => {
                        self._snList[elem.Code] = elem.Id;
                        self._snListById[elem.Id] = elem.Code;
                    });
                };
            })
            .then(() => {
                self._settings.snets.forEach((elem) => {
                    if (!self._snList[elem])
                        console.error(`SnCounterTask: Unsupported share counter: "${elem}" has been ignored.`);
                })
            });
    }

    _getLessons() {
        let self = this;
        return this._getSnList()
            .then(() => {
                return $data.execSql({
                    dialect: {
                        mysql: _.template(GET_LESSONS_MYSQL)({ offset: self._settings.offset, nrec: self._settings.maxUrls }),
                        mssql: _.template(GET_LESSONS_MSSQL)({ offset: self._settings.offset, nrec: self._settings.maxUrls })
                    }
                }, {});
            })
            .then((result) => {
                let lessons = (result && result.detail) ? result.detail : [];
                return lessons;
            });
    }

    // А можно и без авторизации: https://graph.facebook.com/?id=https://magisteria.ru/islam/intro/
    /*
        https://magisteria.ru/quattrocento/brunelleschi/
        FB: https://graph.facebook.com/v3.0/?id=https%3A%2F%2Fmagisteria.ru%2Fquattrocento%2Fbrunelleschi%2F&fields=engagement&access_token=591000364592228|386e5c11ab88a43c5c96b7df69c9e06d
    */
    _getFBCount(url, options)
    {
        //
        // DOC: https://developers.facebook.com/docs/graph-api/advanced/rate-limiting/
        // response.headers["x-app-usage"] = "{"call_count":724,"total_cputime":0,"total_time":24}"
        // response.statusCode === ERR_FORBIDDEN, body = "{"error":{"message":"(#4) Application request limit reached","type":"OAuthException","is_transient":true,"code":4,"fbtrace_id":"GoyjxuQpQMG"}}"
        //
        let self = this;
        let counter = 0;
    
        return getCounter(url)
            .then((cnt) => {
                counter = cnt;
                return getCounter(url + "/");
            })
            .then((cnt) => {
                return cnt > counter ? cnt : counter;
            })
            .catch(err => {
                return 0;
            });
    
        function getCounter(_url) {
            let rc = Promise.resolve();
            if (options.lastReq) {
                let delay = options.minDelay - ((new Date()) - options.lastReq);
                if (delay > 0)
                    rc = self._delay(delay);
            }
            return rc.then(() => {
                return new Promise((resolve, reject) => {
                    let counter = 0;

                    if (options.lock && options.lockTime) {
                        let now = new Date();
                        if ((now - options.lockTime) > options.repairTime) {
                            options.lock = false;
                            delete options.lockTime;
                        }
                    }
                    if (!options.lock) {
                        let reqUrl = new URL("https://graph.facebook.com/v3.0");
                        reqUrl.searchParams.append('id', _url);
                        reqUrl.searchParams.append('fields', 'engagement');
                        reqUrl.searchParams.append('access_token', config.snets.facebook.appId + '|' + config.snets.facebook.appSecret);
                        options.lastReq = new Date();
                        request(reqUrl.href, (error, response, body) => {
                            if (error) {
                                console.error(`${(new Date()).toLocaleString()} FB Counter Error: "${error.message}",` +
                                    ` API: "${reqUrl.href}", URL: "${_url}"`);
                                reject(error);
                            }
                            else {
                                if (response.statusCode === HttpCode.OK) {
                                    let usageStat = response.headers["x-app-usage"];
                                    if (usageStat) {
                                        try {
                                            usageStat = JSON.parse(usageStat);
                                            if ((usageStat.call_count > options.usageLimitPerc)
                                                || (usageStat.total_cputime > options.usageLimitPerc)
                                                || (usageStat.total_time > options.usageLimitPerc)) {

                                                options.lock = true;
                                                options.lockTime = new Date();
                                                console.error(`${(new Date()).toLocaleString()} SnCounterTask: FB app usage limits have exceeded a threshold (${options.usageLimitPerc}%) : ` +
                                                    `${JSON.stringify(usageStat)}`);
                                            }
                                        } catch (err) { };
                                    }
                                    try {
                                        let counters = JSON.parse(body);
                                        if (counters.engagement)
                                            for (let key in counters.engagement)
                                                counter += counters.engagement[key];
                                    }
                                    catch (err) { };
                                }
                                else {
                                    if (response.statusCode === HttpCode.ERR_FORBIDDEN) {
                                        options.lock = true;
                                        console.error(`${(new Date()).toLocaleString()} SnCounterTask: FB access error: ${body}`);
                                    }
                                }
                                resolve(counter);
                            }
                        });
                    }
                    else
                        resolve(counter);
                });
            });
        };
    }

    /*
        https://magisteria.ru/quattrocento/brunelleschi/
        VK: https://vk.com/share.php?act=count&url=https%3A%2F%2Fmagisteria.ru%2Fquattrocento%2Fbrunelleschi%2F
    */
    _getVKCount(url, options) {
        let counter = 0;
        let reqUrl;

        return getCounter(url)
            .then((cnt) => {
                counter = cnt;
                return getCounter(url + "/");
            })
            .then((cnt) => {
                return cnt + counter;
            })
            .catch(err => {
                console.error(`${(new Date()).toLocaleString()} VK Counter Error: "${error.message}",` +
                    ` API: "${reqUrl ? reqUrl.href : "???"}", URL: "${_url}"`);
                return 0;
            });

        function getCounter(_url) {
            return new Promise((resolve, reject) => {
                reqUrl = new URL("https://vk.com/share.php");
                reqUrl.searchParams.append('act', 'count');
                reqUrl.searchParams.append('url', _url);
                request(reqUrl.href, (error, response, body) => {
                    if (error)
                        reject(error)
                    else {
                        let counter = 0;
                        if (response.statusCode === HttpCode.OK)
                            try {
                                counter = body.match(/^VK\.Share\.count\(\d, (\d+)\);$/)[1] / 1;
                            }
                            catch (err) { };
                        resolve(counter);
                    }
                });
            });
        };
    }

    /*
        https://magisteria.ru/quattrocento/brunelleschi/
        OK: https://connect.ok.ru/dk?st.cmd=extLike&uid=odklcnt0&ref=https%3A%2F%2Fmagisteria.ru%2Fquattrocento%2Fbrunelleschi%2F
    */
    _getOKCount(url, options) {
        let counter = 0;
        let reqUrl;
        
        return getCounter(url)
            .then((cnt) => {
                counter = cnt;
                return getCounter(url + "/");
            })
            .then((cnt) => {
                return cnt + counter;
            })
            .catch(err => {
                console.error(`${(new Date()).toLocaleString()} OK Counter Error: "${error.message}",` +
                    ` API: "${reqUrl ? reqUrl.href : "???"}", URL: "${_url}"`);
                return 0;
            });

        function getCounter(_url) {
            return new Promise((resolve, reject) => {
                reqUrl = new URL("https://connect.ok.ru/dk");
                reqUrl.searchParams.append('st.cmd', 'extLike');
                reqUrl.searchParams.append('uid', 'odklcnt0');
                reqUrl.searchParams.append('ref', _url);
                request(reqUrl.href, (error, response, body) => {
                    if (error)
                        reject(error)
                    else {
                        let counter = 0;
                        if (response.statusCode === HttpCode.OK)
                            try {
                                counter = body.match(/^ODKL\.updateCount\(\'odklcnt0\',\'(\d+)\'\);$/)[1] / 1;
                            }
                            catch (err) { };
                        resolve(counter);
                    }
                });
            });
        };
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

    run(fireDate) {
        return this._processLessons();
    }
};
