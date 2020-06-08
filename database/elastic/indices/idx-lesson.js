'use strict';
const _ = require('lodash');
const { IdxBase } = require('./idx-base');
const { splitArray } = require('../../../utils');

const MAX_IDS_PER_REQ = 5;

const LESSONS_FLDS_MSSQL =
    "l.[Id], al.[FirstName]+ ' ' + al.[LastName] as [Author], cl.[Name] as [Course], ll.[Name],\n" +
    "  ll.[ShortDescription], ll.[FullDescription], ell.[Transcript], l.[URL], l.[Cover], l.[CoverMeta],\n" +
    "  c.[Id] as [CourseId], c.[URL] as [CourseURL], a.[Id] as [AuthorId], a.[URL] as [AuthorURL], lc.[ReadyDate]\n";

const LESSONS_FLDS_ID_MSSQL = "distinct<%= limit %> l.[Id]\n";

const LESSONS_WHERE_MSSQL = "\n  where l.[Id] in (<%= ids %>)";

const LESSONS_MSSQL =
    "select <%= fields %>" +
    "from [Lesson] l\n" +
    "  join [LessonLng] ll on ll.[LessonId] = l.[Id]\n" +
    "  join [Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join [AuthorLng] al on al.[AuthorId] = a.[Id]\n" +
    "  join [LessonCourse] lc on(lc.[LessonId] = l.[Id]) and(lc.[State] = 'R')\n" +
    "  join [Course] c on(c.[Id] = lc.[CourseId]) and(c.[State] = 'P')\n" +
    "  join [CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join [EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
    "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join [EpisodeLng] ell on ell.[EpisodeId] = e.[Id]<%= where %>\n" +
    "order by l.[Id]";

const LESSONS_FLDS_MYSQL =
    "l.`Id`, concat(al.`FirstName`, ' ', al.`LastName`) as `Author`, cl.`Name` as `Course`, ll.`Name`,\n" +
    "  ll.`ShortDescription`, ll.`FullDescription`, ell.`Transcript`, l.`URL`, l.`Cover`, l.`CoverMeta`,\n" +
    "  c.`Id` as `CourseId`, c.`URL` as `CourseURL`, a.`Id` as `AuthorId`, a.`URL` as `AuthorURL`, lc.`ReadyDate`\n";

const LESSONS_FLDS_ID_MYSQL = "distinct l.`Id`\n";

const LESSONS_WHERE_MYSQL = "\n  where l.`Id` in (<%= ids %>)";

const LESSONS_MYSQL =
    "select <%= fields %>" +
    "from `Lesson` l\n" +
    "  join `LessonLng` ll on ll.`LessonId` = l.`Id`\n" +
    "  join `Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join `AuthorLng` al on al.`AuthorId` = a.`Id`\n" +
    "  join `LessonCourse` lc on(lc.`LessonId` = l.`Id`) and(lc.`State` = 'R')\n" +
    "  join `Course` c on(c.`Id` = lc.`CourseId`) and(c.`State` = 'P')\n" +
    "  join `CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join `EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
    "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join `EpisodeLng` ell on ell.`EpisodeId` = e.`Id`<%= where %>\n" +
    "order by l.`Id`<%= limit %>";

const DFLT_INDEX_NAME = "lesson";

const mapping = {
    properties: {
        createDate: { type: "date" },
        modifyDate: { type: "date" },
        pubDate: { type: "date" },
        lsInfo: { type: "object" },
        lsAuthor: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 255
                }
            }
        },
        lsCourse: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 255
                }
            }
        },
        lsName: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 255
                }
            }
        },
        lsShortDescription: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        },
        lsFullDescription: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        },
        lsTranscript: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        }
    }
};

class IdxLesson extends IdxBase{

    static get sortFields() {
        return [
            "createDate",
            "modifyDate",
            "pubDate",
            "lsAuthor.key",
            "lsCourse.key",
            "lsName.key"
        ];
    }

    static get analyzerFields() {
        return [
            { name: "lsTranscript" },
            { name: "lsShortDescription" },
            { name: "lsFullDescription" },
            { name: "lsName", boost: 100 },
            { name: "lsAuthor", boost: 5 },
            { name: "lsCourse", boost: 2 }
        ];
    }

    static get highlightFields() {
        return [
            { name: "lsTranscript", fragment_size: 200 },
            { name: "lsShortDescription", fragment_size: 200 },
            { name: "lsFullDescription", fragment_size: 200 },
            { name: "lsName", number_of_fragments: 0 },
            { name: "lsAuthor", number_of_fragments: 0 },
            { name: "lsCourse", number_of_fragments: 0 }
        ];
    }

    static get dataFields() {
        return [
            "lsName",
            "lsShortDescription",
            "lsFullDescription",
            "lsAuthor",
            "lsCourse",
            "lsInfo",
            "pubDate"
        ];
    }

    static get highlightMapping() {
        return {
            lsTranscript: "Transcript",
            lsShortDescription: "ShortDescription",
            lsFullDescription: "FullDescription",
            lsName: "Name",
            lsAuthor: "Author",
            lsCourse: "Course"
        };
    }

    constructor() {
        super({ index: DFLT_INDEX_NAME, mappings: mapping });
    }

    async processHit(hit, baseUrl) {
        let base_url = baseUrl ? baseUrl : this._baseUrl;
        let result = {
            Id: hit["_id"],
            Name: hit["_source"].lsName,
            ShortDescription: hit["_source"].lsShortDescription,
            FullDescription: hit["_source"].lsFullDescription,
            PubDate: hit["_source"].pubDate,
            "_score": hit["_score"]
        };
        result.Cover = this._convertDataUrl(hit["_source"].lsInfo.Cover, true, false, base_url);
        result.CoverMeta = this._convertMeta(hit["_source"].lsInfo.CoverMeta, true, false, base_url);
        result.URL = this._removeTrailingSlash(base_url) + '/' + hit["_source"].lsInfo.CourseURL + '/' + hit["_source"].lsInfo.URL;
        result.Author = {
            Id: hit["_source"].lsInfo.AuthorId,
            Name: hit["_source"].lsAuthor,
            URL: this._getAbsAuthorUrl(base_url) + hit["_source"].lsInfo.AuthorURL
        }
        result.Course = {
            Id: hit["_source"].lsInfo.CourseId,
            Name: hit["_source"].lsCourse,
            URL: this._getAbsCourseUrl(base_url) + hit["_source"].lsInfo.CourseURL
        }
        result.highlight = {};
        for (let fld in hit.highlight) {
            let fld_orig = IdxLesson.highlightMapping[fld] ? IdxLesson.highlightMapping[fld] : fld;
            result.highlight[fld_orig] = hit.highlight[fld];
        }
        return result;
    }

    async _getData(store_func, opts) {
        let all_ids = [];

        let ds_ids = await $data.execSql({
            dialect: {
                mysql: _.template(LESSONS_MYSQL)({
                    fields: LESSONS_FLDS_ID_MYSQL,
                    where: ``,
                    limit: opts.limit ? ` limit ${opts.limit}` : ``
                }),
                mssql: _.template(LESSONS_MSSQL)({
                    fields: _.template(LESSONS_FLDS_ID_MSSQL)({ limit: opts.limit ? ` top ${opts.limit}` : `` }),
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

                let lessons = [];
                let ds = await $data.execSql({
                    dialect: {
                        mysql: _.template(LESSONS_MYSQL)({
                            fields: LESSONS_FLDS_MYSQL,
                            where: _.template(LESSONS_WHERE_MYSQL)({ ids: arrayOfIds[i].join() }),
                            limit: ``
                        }),
                        mssql: _.template(LESSONS_MSSQL)({
                            fields: LESSONS_FLDS_MSSQL,
                            where: _.template(LESSONS_WHERE_MSSQL)({ ids: arrayOfIds[i].join() })
                        })
                    }
                }, {});

                if (ds && ds.detail && (ds.detail.length > 0)) {
                    let currId = -1;
                    let currLsn;
                    ds.detail.forEach(elem => {
                        if (currId !== elem.Id) {
                            currId = elem.Id;
                            let ts = new Date();
                            currLsn = {
                                Id: elem.Id,
                                createDate: ts,
                                modifyDate: ts,
                                pubDate: elem.ReadyDate,
                                lsInfo: {
                                    URL: elem.URL,
                                    Cover: elem.Cover,
                                    CoverMeta: elem.CoverMeta,
                                    CourseURL: elem.CourseURL,
                                    CourseId: elem.CourseId,
                                    AuthorId: elem.AuthorId,
                                    AuthorURL: elem.AuthorURL
                                },
                                lsAuthor: elem.Author,
                                lsCourse: elem.Course,
                                lsName: elem.Name,
                                lsShortDescription: this._striptags(elem.ShortDescription),
                                lsFullDescription: this._striptags(elem.FullDescription),
                                lsTranscript: ""
                            };
                            lessons.push(currLsn);
                        }
                        let filtered = elem.Transcript.replace(/<b><u>ts:\{.*?\}<\/u><\/b>/gim, ''); // remove time labels
                        currLsn.lsTranscript += this._striptags(filtered);
                    });
                }

                await store_func(lessons, { createDateField: "createDate" });
            }
        }
    }
}

let idxLesson = null;
exports.IdxLesson = IdxLesson;
exports.IdxLessonService = () => {
    return idxLesson ? idxLesson : idxLesson = new IdxLesson();
}