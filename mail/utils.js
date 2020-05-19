'use strict';
const querystring = require('querystring');
const config = require('config');
const { HttpCode } = require("../const/http-codes");
const { SEO } = require('../const/common');
const { PrerenderCache } = require('../prerender/prerender-cache');

async function renderMailHTML(path, options) {
    let result = {};
    let opts = options || {};
    let host = opts.host ? opts.host : config.proxyServer.siteHost;
    let render_path = `/${path}`;
    if (opts.params) {
        let query = null;
        for (let param in opts.params) {
            let val = opts.params[param];
            if (val) {
                if (!query)
                    query = {};
                query[param] = val;
            }
        }
        if (query)
            render_path += `?${querystring.stringify(query)}`;
    }
    let { statusCode, body: html } = await PrerenderCache().prerender(render_path, false,
        { "User-Agent": SEO.NULL_USER_AGENT }, { host: host, response: true });
    if (statusCode !== HttpCode.OK)
        throw new HttpError(statusCode, `HTTP error "${statusCode}" accessing "${host + render_path}".`);
    result.html = html;
    return result;
}

exports.RenderMailHTML = renderMailHTML;