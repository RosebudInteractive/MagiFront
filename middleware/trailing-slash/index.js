'use strict';
const _ = require('lodash');
const config = require('config');
const { URL, URLSearchParams } = require('url');
const { HttpCode } = require("../../const/http-codes");
const { buildLogString } = require('../../utils');

module.exports = (options) => {

    async function _processor(req, res, next) {
        try {
            let path = req.path;
            let hasTrailingSlash = ((path.length > 1) && (path !== "/adm/") && (path !== "/pm/") && (path[path.length - 1] === "/")) ? true : false;
            if (hasTrailingSlash) {
                path = path.substr(0, path.length - 1);
                let url = new URL(path, config.proxyServer.siteHost);
                for (let p in req.query)
                    url.searchParams.append(p, req.query[p]);
                res.redirect(HttpCode.MOVED_PERMANENTLY, url.href);
            }
            else
                next();
        }
        catch (err) {
            next(err);
        }
    }

    return function (req, res, next) {
        _processor(req, res, next);
    };
};
