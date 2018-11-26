'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const convert = require('xml-js');
const fs = require('fs');

const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { Task } = require('../lib/task');
const { PrerenderCache } = require('../../prerender/prerender-cache');
const { XMLParserBase } = require('../../utils/xml-parser-base');
const { buildLogString } = require('../../utils');

const dfltMapFiles = ["category-sitemap.xml", "post-sitemap.xml", "author-sitemap.xml", "page-sitemap.xml", "razdel-sitemap.xml"];
const dfltPrerenderSettings =
{
    path: path.normalize(path.join(process.cwd(), "..", "..", "sitemaps")),
    maxLinksLimit: 0,
    maxAgeSec: 365 * 24 * 60 * 60, // max link age
    renderDelay: 10* 1000 // render request delay in ms
};

exports.PrerenderTask = class PrerenderTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._siteHost = config.proxyServer.siteHost;
        this._prerenderSettings = _.defaultsDeep(opts, dfltPrerenderSettings);
        if (!this._prerenderSettings.mapFiles)
            this._prerenderSettings.mapFiles = dfltMapFiles;
        this._prerenderCache = PrerenderCache(opts.renderCache);
        this._links = {};
        this._lastReqTime = null;
        this._totLinks = 0;
        this._alreadyCached = 0;
        this._renderedLinks = 0;
        this._outdatedLinks = 0;
    }

    _processLink(link, mdfDate) {
        return new Promise((resolve, reject) => {
            let rc;
            let key = link.pathname;
            let cacheKey = this._prerenderCache.getKey(key);
            this._totLinks++;
            if (!this._links[cacheKey]) {
                let now = new Date();
                let isOutDated = (!this._prerenderSettings.maxAgeSec) || (((now - mdfDate) / 1000.) >= this._prerenderSettings.maxAgeSec);
                if ((!this._prerenderSettings.maxLinksLimit) ||
                    (this._renderedLinks < this._prerenderSettings.maxLinksLimit)) {
                    this._renderedLinks++;
                    if (isOutDated)
                        this._outdatedLinks++;
                    rc = this._delay(this._lastReqTime ? (this._prerenderSettings.renderDelay - (now - this._lastReqTime)) : 0)
                        .then(() => {
                            this._lastReqTime = new Date();
                            return this._prerenderCache.prerender(key, isOutDated);
                        });
                }
            }
            else {
                this._alreadyCached++;
                delete this._links[cacheKey];
            }
            resolve(rc);
        })
    }

    _processFile(fileName) {
        return new Promise((resolve, reject) => {
            resolve(readFileAsync(path.join(this._prerenderSettings.path, fileName), 'utf8'));
        })
            .then(data => {
                let json = convert.xml2js(data);
                let urls = [];
                XMLParserBase.findAll("url", json, urls, true);
                if (urls.length > 0)
                    return Utils.seqExec(urls, (urlObj) => {
                        let link;
                        let dtModif;
                        urlObj.elements.forEach(elem => {
                            let parseTextElement = (text) => {
                                let rc;
                                if (text.elements && (text.elements.length === 1) && (text.elements[0].type === "text"))
                                    rc = text.elements[0].text;
                                return rc;
                            }
                            if (elem.type === "element")
                                switch (elem.name) {
                                    case "loc":
                                        let txt = parseTextElement(elem);
                                        if (txt)
                                            link = this._urlObj(txt);
                                        break;
                                    case "lastmod":
                                        let dtxt = parseTextElement(elem);
                                        if (dtxt)
                                            dtModif = new Date(dtxt);
                                        break;
                                }
                        });
                        if (link && dtModif)
                            return this._processLink(link, dtModif);
                    });
            });        
    }

    run(fireDate) {
        this._totLinks = 0;
        this._renderedLinks = 0;
        this._alreadyCached = 0;
        this._outdatedLinks = 0;
        return new Promise((resolve, reject) => {
            let rc;
            if (this._prerenderSettings.mapFiles && (this._prerenderSettings.mapFiles.length > 0)) {
                rc = this._prerenderCache.getList()
                    .then((result) => {
                        this._links = {};
                        result.forEach(elem => {
                            this._links[elem] = true;
                        });
                    })
                    .then(() => {
                        return Utils.seqExec(this._prerenderSettings.mapFiles, (fileName) => {
                            return this._processFile(fileName);
                        });
                    });
            }
            resolve(rc);
        })
            .then(() => {
                let outTxt = this._prerenderSettings.maxAgeSec ? (', outdated: ' + this._outdatedLinks + " > " +
                    Math.round(this._prerenderSettings.maxAgeSec / 24 / 60 / 60) + " day(s)") : '';
                let limitTxt = this._prerenderSettings.maxLinksLimit ? (', limit: ' + this._prerenderSettings.maxLinksLimit) : '';
                console.log(buildLogString(`Total links: ${this._totLinks}${outTxt}, already cached: ${this._alreadyCached}, rendered ${this._renderedLinks}${limitTxt}.`));
            });
    }
}