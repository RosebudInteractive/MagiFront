'use strict';
const _ = require('lodash');
const { IdxBase } = require('./idx-base');
const { splitArray } = require('../../../utils');

const MAX_IDS_PER_REQ = 5;

const AUTHORS_FLDS_MSSQL =
    "a.[Id], al.[FirstName]+ ' '+ al.[LastName] as [Name], al.[ShortDescription], al.[Description],\n" +
    "  a.[URL] as [AuthorURL], a.[Portrait], a.[PortraitMeta], a.[TimeCr] as [PubDate]\n";

const AUTHORS_FLDS_ID_MSSQL = "<%= limit %> a.[Id]\n";

const AUTHORS_WHERE_MSSQL = "\n  where a.[Id] in (<%= ids %>)";

const AUTHORS_MSSQL =
    "select <%= fields %>" +
    "from [Author] a\n" +
    "  join [AuthorLng] al on al.[AuthorId] = a.[Id]<%= where %>\n" +
    "order by a.[Id]";

const AUTHORS_FLDS_MYSQL =
    "a.`Id`, concat(al.`FirstName`, ' ', al.`LastName`) as `Name`, al.`ShortDescription`, al.`Description`,\n" +
    "  a.`URL` as `AuthorURL`, a.`Portrait`, a.`PortraitMeta`, a.`TimeCr` as `PubDate`\n";

const AUTHORS_FLDS_ID_MYSQL = "a.`Id`\n";

const AUTHORS_WHERE_MYSQL = "\n  where a.`Id` in (<%= ids %>)";

const AUTHORS_MYSQL =
    "select <%= fields %>" +
    "from `Author` a\n" +
    "  join `AuthorLng` al on al.`AuthorId` = a.`Id`<%= where %>\n" +
    "order by a.`Id`";

const DFLT_INDEX_NAME = "author";

const mapping = {
    properties: {
        createDate: { type: "date" },
        modifyDate: { type: "date" },
        pubDate: { type: "date" },
        auInfo: { type: "object" },
        auName: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 255
                }
            }
        },
        auShortDescription: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        },
        auDescription: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        }
    }
};

class IdxAuthor extends IdxBase{

    static get sortFields() {
        return [
            "createDate",
            "modifyDate",
            "pubDate",
            "auName.key"
        ];
    }

    static get analyzerFields() {
        return [
            { name: "auShortDescription" },
            { name: "auDescription" },
            { name: "auName", boost: 200 }
        ];
    }

    static get highlightFields() {
        return [
            { name: "auName", number_of_fragments: 0 },
            { name: "auShortDescription", fragment_size: 200 },
            { name: "auDescription", fragment_size: 200 }
        ];
    }

    static get dataFields() {
        return [
            "auName",
            "auInfo",
            "auShortDescription",
            "auDescription",
            "pubDate"
        ];
    }

    static get highlightMapping() {
        return {
            auName: "Name",
            auShortDescription: "ShortDescription",
            auDescription: "Description"
        };
    }

    constructor() {
        super({ index: DFLT_INDEX_NAME, mappings: mapping });
    }

    async processHit(hit, baseUrl) {
        let base_url = baseUrl ? baseUrl : this._baseUrl;
        let result = {
            Id: hit["_id"],
            Name: hit["_source"].auName,
            ShortDescription: hit["_source"].auShortDescription,
            Description: hit["_source"].auDescription,
            PubDate: hit["_source"].pubDate,
            "_score": hit["_score"]
        };
        result.Portrait = this._convertDataUrl(hit["_source"].auInfo.Portrait, true, false, base_url);
        result.PortraitMeta = this._convertMeta(hit["_source"].auInfo.PortraitMeta, true, false, base_url);
        result.URL = this._getAbsAuthorUrl(base_url) + hit["_source"].auInfo.URL;
        result.highlight = {};
        for (let fld in hit.highlight) {
            let fld_orig = IdxAuthor.highlightMapping[fld] ? IdxAuthor.highlightMapping[fld] : fld;
            result.highlight[fld_orig] = hit.highlight[fld];
        }
        return result;
    }

    async _getData(store_func, opts) {
        let all_ids = [];

        let ds_ids = await $data.execSql({
            dialect: {
                mysql: _.template(AUTHORS_MYSQL)({
                    fields: AUTHORS_FLDS_ID_MYSQL,
                    where: ``,
                    limit: opts.limit ? ` limit ${opts.limit}` : ``
                }),
                mssql: _.template(AUTHORS_MSSQL)({
                    fields: _.template(AUTHORS_FLDS_ID_MSSQL)({ limit: opts.limit ? ` top ${opts.limit}` : `` }),
                    where: ``
                })
            }
        }, {});
        if (ds_ids && ds_ids.detail && (ds_ids.detail.length > 0)) {

            ds_ids.detail.forEach(elem => {
                all_ids.push(elem.Id);
            });

            let arrayOfIds = splitArray(all_ids, opts.page ? opts.page: MAX_IDS_PER_REQ);
            
            for (let i = 0; i < arrayOfIds.length; i++) {

                let authors = [];
                let ds = await $data.execSql({
                    dialect: {
                        mysql: _.template(AUTHORS_MYSQL)({
                            fields: AUTHORS_FLDS_MYSQL,
                            where: _.template(AUTHORS_WHERE_MYSQL)({ ids: arrayOfIds[i].join() }),
                            limit: ``
                        }),
                        mssql: _.template(AUTHORS_MSSQL)({
                            fields: AUTHORS_FLDS_MSSQL,
                            where: _.template(AUTHORS_WHERE_MSSQL)({ ids: arrayOfIds[i].join() })
                        })
                    }
                }, {});

                if (ds && ds.detail && (ds.detail.length > 0)) {
                    let currId = -1;
                    let currAuthor;
                    ds.detail.forEach(elem => {
                        if (currId !== elem.Id) {
                            currId = elem.Id;
                            let ts = new Date();
                            currAuthor = {
                                Id: elem.Id,
                                createDate: ts,
                                modifyDate: ts,
                                pubDate: elem.PubDate,
                                auInfo: {
                                    URL: elem.AuthorURL,
                                    Portrait: elem.Portrait,
                                    PortraitMeta: elem.PortraitMeta
                                },
                                auName: elem.Name,
                                auShortDescription: this._striptags(elem.ShortDescription),
                                auDescription: this._striptags(elem.Description)
                            };
                            authors.push(currAuthor);
                        }
                    });
                }

                await store_func(authors, { createDateField: "createDate" });
            }
        }
    }
}

let idxAuthor = null;
exports.IdxAuthor = IdxAuthor;
exports.IdxAuthorService = () => {
    return idxAuthor ? idxAuthor : idxAuthor = new IdxAuthor();
}