'use strict'
const _ = require('lodash');
const config = require('config');
const { URL, URLSearchParams } = require('url');

exports.PartnerLink = class PartnerLink {
    constructor(options) {
        this._settings = options ? _.cloneDeep(options) :
            (config.has('partnership') ? _.cloneDeep(config.partnership) : {});
    }
    processLink(link) {
        let rc = link;
        if (typeof (link) === "string") {
            let url = new URL(link);
            let params = this._settings[url.hostname];
            if (params) {
                let sparams = url.searchParams;
                for (let pname in params) {
                    sparams.delete(pname);
                    sparams.append(pname, params[pname]);
                }
                rc = url.href;
            }
        }
       return rc;
    }

    processLinks(links) {
        let rc = links;
        if (typeof (links) === "string") {
            let data = JSON.parse(links);
            rc = {};
            Object.keys(data).forEach(el => {
                let link = this.processLink(data[el].trim());
                if (rc.length > 0)
                    rc += "\n";
                rc[el] = link;
            });
            rc = JSON.stringify(rc);
        }
        return rc;
    }
}
