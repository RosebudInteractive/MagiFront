'use strict'
// let prerender = require('prerender-node');
let prerender = require('./prerender-magisteria');
const _ = require('lodash');
const config = require('config');
const { PrerenderCache } = require('./prerender-cache');
const { SEO } = require('../const/common');
const { HttpCode } = require('../const/http-codes');
const { getTimeStr } = require('../utils');

const DFLT_EXPIRATION = 14 * 24 * 60 * 60; // 14 days
const DFLT_MAX_DEV = 14 * 24 * 60 * 60; // 7 days

let additionalBots = [
    "yandex",
    "odklbot",
    SEO.FORCE_RENDER_USER_AGENT,
    SEO.BOT_USER_AGENT
];

exports.setupPrerender = (app) => {
    let prerenderCache = PrerenderCache();

    app.get('/api/adm/prerender', (req, res, next) => {
        let content;
        new Promise((resolve, reject) => {
            let mode = (req.query && req.query.mode) ? req.query.mode : null;
            if (!mode)
                throw new Error(`Query argument "mode" is missing. It can be "list", "get", render", "renew" or "clear".`);
            let filter = (req.query && req.query.filter) ? req.query.filter : null;
            let path = (req.query && req.query.path) ? req.query.path : null;
            if ((mode === "render") || (mode === "get")){
                if (!path)
                    throw new Error(`Query argument "path" is missing.`);
            }
            else
            {
                if (!filter)
                    throw new Error(`Query argument "filter" is missing. Allowed values: ("all", "courses", "authors", "categories" or link path).`);
            };
            let rc;
            switch (mode) {

                case "list":
                    rc = prerenderCache.getList(filter);
                    break;

                case "get":
                    rc = prerenderCache.get(path)
                        .then((data) => {
                            if (data)
                                content = data
                            else
                                throw new Error(`Path [${path}] doesn't exist.`);
                        });
                    break;

                case "render":
                    let isPersist = (req.query && req.query.persist) ? (req.query.persist === "true") : false;
                    rc = prerenderCache.prerender(path, isPersist)
                        .then(() => prerenderCache.get(path))
                        .then((data) => {
                            if (!data)
                                throw new Error(`Path [${path}] doesn't exist.`);
                            return [path];
                        });
                    break;

                case "renew":
                    let count = (req.query && req.query.count) ? parseInt(req.query.count) : null;
                    let delay = (req.query && req.query.delay) ? parseInt(req.query.delay) : null;
                    rc = prerenderCache.prerenderList(filter, count, delay);
                    break;

                case "clear":
                    rc = prerenderCache.delList(filter);
                    break;

                default:
                    throw new Error(`Query argument "mode" is invalid: "${mode}".`);
            }
            resolve(rc);
        })
            .then(rows => {
                if (content)
                    res.send(content)
                else
                    res.send({ result: "OK", keysAffected: rows.length, keys: rows });
            })
            .catch(err => {
                next(err);
            });
    });
};

exports.PrerenderInit = (app) => {
    console.log('Prerender Middleware init.')
    if (config.has('server.prerender.usePrerender') && config.server.prerender.usePrerender) {
        let crawlerUserAgents = prerender.crawlerUserAgents.slice(0);
        additionalBots.forEach((elem) => {
            if (!prerender.crawlerUserAgents.some(function (crawlerUserAgent) { return elem.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1; })) {
                crawlerUserAgents.push(elem);
            }
        });

        let prerenderCache = PrerenderCache();
        let expInSec = config.has("server.prerender.expInSec") ? config.get("server.prerender.expInSec") : DFLT_EXPIRATION;
        let maxDevSec = config.has("server.prerender.maxDevSec") ? config.get("server.prerender.maxDevSec") : DFLT_MAX_DEV;
        let logEnabled = config.has("server.prerender.logEnabled") ? config.get("server.prerender.logEnabled") : false;

        prerender
            .set('crawlerUserAgents', crawlerUserAgents)
            .set('beforeRender', function (req, done) {
                // do whatever you need to do
                let userAgent = req.headers['user-agent'];
                if (logEnabled)
                    console.log(`[${getTimeStr()}] Prerender: url:"${req.url}", userAgent:"${userAgent}"`);
                // console.log(`${(new Date()).toLocaleString()} ==> ${userAgent}`);
                if (userAgent === SEO.FORCE_RENDER_USER_AGENT) {
                    req.forceRender = true;
                    done(null, null);
                }
                else
                    prerenderCache.get(req.path)
                        .then((res) => {
                            done(null, res);
                        }).catch((err) => {
                            console.error(`[${getTimeStr()}] prerender:beforeRender::${err && err.message ? err.message : JSON.stringify(err)}`);
                            done(null, null);
                        });
            })
            .set('afterRender', function (err, req, prerender_res) {
                // do whatever you need to do
                if (!err) {
                    (req.forceRender ? Promise.resolve() : prerenderCache.get(req.path))
                        .then((res) => {
                            if (prerender_res.statusCode === HttpCode.OK) { // Save only if result is OK.
                                if (!res) {
                                    let ttl = expInSec;
                                    if (ttl) {
                                        ttl += Math.round((Math.random() - 0.5) * (maxDevSec ? maxDevSec : ttl));
                                    }
                                    return prerenderCache.set(req.path, prerender_res.body, ttl);
                                }
                            }
                            else
                                return prerenderCache.delList(req.path);
                        })
                        .catch((err) => {
                            console.error(`prerender:afterRender::${err && err.message ? err.message : JSON.stringify(err)}`);
                        });
                }
            });

        if (config.has('server.prerender.url') && config.server.prerender.url)
            prerender
                .set('prerenderServiceUrl', config.server.prerender.url);
        app.use(prerender);
    }
}