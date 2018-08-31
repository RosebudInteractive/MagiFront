'use strict'
let prerender = require('prerender-node');
const _ = require('lodash');
const config = require('config');
const { PrerenderCache } = require('./prerender-cache');
const { SEO } = require('../const/common');

let additionalBots = [
    "yandex",
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
                    throw new Error(`Query argument "filter" is missing. Allowed values: ("all", "courses", "authors" or link path).`);
            };
            let rc;
            switch (mode) {

                case "list":
                    rc = prerenderCache.getList(filter);
                    break;

                case "get":
                    rc = prerenderCache.get(path)
                        .then((data) => { content = data });
                    break;

                case "render":
                    rc = prerenderCache.prerender(path)
                        .then(() => [path]);
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
        prerender
            .set('crawlerUserAgents', crawlerUserAgents)
            .set('beforeRender', function (req, done) {
                // do whatever you need to do
                let userAgent = req.headers['user-agent'];
                console.log(`${(new Date()).toLocaleString()} ==> ${userAgent}`);
                if (userAgent === SEO.FORCE_RENDER_USER_AGENT)
                    done(null, null)
                else
                    prerenderCache.get(req.path)
                        .then((res) => {
                            done(null, res);
                        }).catch((err) => {
                            console.error(`prerender:beforeRender::${err && err.message ? err.message : JSON.stringify(err)}`);
                            done(null, null);
                        });
            })
            .set('afterRender', function (err, req, prerender_res) {
                // do whatever you need to do
                if (!err) {
                    prerenderCache.get(req.path)
                        .then((res) => {
                            if (!res)
                                return prerenderCache.set(req.path, prerender_res.body);
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