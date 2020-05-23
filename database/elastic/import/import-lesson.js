'use strict';
const striptags = require('striptags');
const _ = require('lodash');
const { ImportBase } = require('./import-base');
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
                    ignore_above: 100
                }
            }
        },
        lsCourse: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 150
                }
            }
        },
        lsName: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 150
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

class ImportLesson extends ImportBase{

    constructor() {
        super({ index: DFLT_INDEX_NAME, mappings: mapping });
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
                                lsShortDescription: striptags(elem.ShortDescription),
                                lsFullDescription: striptags(elem.FullDescription),
                                lsTranscript: ""
                            };
                            lessons.push(currLsn);
                        }
                        let filtered = elem.Transcript.replace(/<b><u>ts:\{.*?\}<\/u><\/b>/gim, ''); // remove time labels
                        currLsn.lsTranscript += striptags(filtered);
                    });
                }

                await store_func(lessons, { createDateField: "createDate" });
            }
        }
    }
}

let importLesson = null;
exports.ImportLessonService = () => {
    return importLesson ? importLesson : importLesson = new ImportLesson();
}