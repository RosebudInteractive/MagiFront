'use strict';
const striptags = require('striptags');
const _ = require('lodash');
const { ImportBase } = require('./import-base');
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
                    ignore_above: 150
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

class ImportAuthor extends ImportBase{

    constructor() {
        super({ index: DFLT_INDEX_NAME, mappings: mapping });
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
                                csInfo: {
                                    URL: elem.AuthorURL,
                                    Portrait: elem.Portrait,
                                    PortraitMeta: elem.PortraitMeta
                                },
                                auName: elem.Name,
                                auShortDescription: striptags(elem.ShortDescription),
                                auDescription: striptags(elem.Description)
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

let importAuthor = null;
exports.ImportAuthorService = () => {
    return importAuthor ? importAuthor : importAuthor = new ImportAuthor();
}