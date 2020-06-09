const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../db-object');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { getTimeStr, buildLogString } = require('../../utils');
const { ElasticConWrapper } = require('../providers/elastic/elastic-connections');
const { importProc, getSearchFields, processHits } = require('./indices');

const DFLT_INDEX_LIST = { lesson: true, course: true, author: true };

const DbElastic = class DbElastic extends DbObject {

    constructor(options) {
        super(options);
        this._resBaseUrl = config.has('search.baseURL') ? config.get('search.baseURL') : this._baseUrl;
    }

    async import(options) {
        let result = ElasticConWrapper(async conn => {
            return importProc(conn, options);
        }, true);
        return result;
    }

    async search(options) {
        const DFLT_RESULT_SIZE = 100;

        let result = ElasticConWrapper(async conn => {
            let req = options || {};
            if (!req.query)
                throw new HttpError(HttpCode.ERR_BAD_REQ, `DbElastic::search: Missing or empty "query" field.`);
            let idx_list = req.index || DFLT_INDEX_LIST;
            let fields = getSearchFields(idx_list);

            let fields_analyzer = [];
            fields.analyzer.forEach(elem => {
                let fld = elem.name;
                if (elem.boost && (elem.boost > 1))
                    fld = `${fld}^${elem.boost}`;
                fields_analyzer.push(fld);
            });

            let fields_highlight = {};
            fields.highlight.forEach(elem => {
                let opts = _.cloneDeep(typeof (elem) === "string" ? { name: elem } : elem);
                let helem = fields_highlight[opts.name] = { type: opts.type ? opts.type : "unified" };
                delete opts.name;
                delete opts.type;
                for (let key in opts)
                    helem[key] = opts[key];
            });

            let search_body = {
                query: {
                    bool: {
                        should: [
                            {
                                multi_match: {
                                    query: req.query,
                                    // type: "phrase_prefix",
                                    type: "phrase",
                                    slop: 3,
                                    boost: 500,
                                    analyzer: "russian",
                                    fields: fields_analyzer
                                }
                            },
                            {
                                multi_match: {
                                    query: req.query,
                                    analyzer: "russian",
                                    fields: fields_analyzer
                                }
                            }
                        ],
                        // filter: {
                        //     ids: { values: [89] }
                        // }
                    }
                },
                // sort: [{ "lsName.key": "desc" }],
                // sort: [{ "pubDate": "desc" }],
                highlight: {
                    pre_tags: ["<em>"],
                    post_tags: ["</em>"],
                    number_of_fragments: 2,
                    fields: fields_highlight
                }
            };

            if (req.sort) {
                let sort = req.sort;
                if (!Array.isArray(sort))
                    sort = [sort];
                let sort_body = [];
                sort.forEach(elem => {
                    let keys = Object.keys(elem);
                    keys.forEach(key => {
                        if (!fields.sort[key])
                            throw new HttpError(HttpCode.ERR_BAD_REQ, `DbElastic::search: Invalid "sort" field: ${key}.`);
                        switch (elem[key]) {
                            case "asc":
                                break;
                            case "desc":
                                break;
                            default:
                                throw new HttpError(HttpCode.ERR_BAD_REQ, `DbElastic::search: Invalid "sort" order: ${elem[key]}.`);
                        }
                        sort_body.push(elem);
                    });
                });
                if (sort_body.length > 0)
                    search_body.sort = sort_body;
            }

            if (req.highlight) {
                if (Array.isArray(req.highlight.pre_tags))
                    search_body.highlight.pre_tags = req.highlight.pre_tags;
                if (Array.isArray(req.highlight.post_tags))
                    search_body.highlight.post_tags = req.highlight.post_tags;
                if (typeof (req.highlight.number_of_fragments) !== "undefined")
                    search_body.highlight.number_of_fragments = req.highlight.number_of_fragments;
            }

            let search_options = {
                index: fields.index,
                size: req.size ? req.size : DFLT_RESULT_SIZE,
                _source: fields.source,
                body: search_body
            };
            if (typeof (req.from) === "number")
                search_options.from = req.from;
            
            let search_res = await conn.search(search_options);

            let { body: { hits: { hits } } } = search_res;
            let result = {
                hits: await processHits(hits ? hits : null, this._resBaseUrl)
            }

            if (req.withCount) {
                let count_body = _.cloneDeep(search_body);
                delete count_body.highlight;
                delete count_body.sort;
                let { body: { count } } = await conn.count({
                    index: fields.index,
                    body: count_body
                });
                result.count = count;
            }

            return result;
        }, true);
        return result;
        
    }
};

let dbElastic = null;
exports.ElasticService = () => {
    return dbElastic ? dbElastic : dbElastic = new DbElastic();
}
