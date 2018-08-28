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

exports.init = (app) => {
    console.log('Prerender Init.')
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