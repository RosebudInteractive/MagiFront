'use strict';
const striptags = require('striptags');
const _ = require('lodash');
const { ImportBase } = require('./import-base');
const { splitArray } = require('../../../utils');

const MAX_IDS_PER_REQ = 5;

const COURSES_FLDS_MSSQL =
    "c.[Id], cl.[Name], cl.[Description], cl.[ShortDescription], cl.[TargetAudience], cl.[Aims],\n" +
    "  al.[FirstName]+ ' ' + al.[LastName] as [Author], ctl.[Name] as [Category], cp.[PubDate],\n" +
    "  c.[URL] as [CourseURL], c.[Cover], c.[CoverMeta], a.[Id] as [AuthorId], a.[URL] as [AuthorURL],\n" +
    "  a.[Portrait], a.[PortraitMeta], ctg.[Id] as [CategoryId], ctg.[URL] as [CategoryURL],\n" +
    "  c.[IsPaid], c.[IsLandingPage], c.[LandCover], c.[LandCoverMeta]\n";

const COURSES_FLDS_ID_MSSQL = "distinct<%= limit %> c.[Id]\n";
const COURSES_WHERE_MSSQL = "";
const COURSES_WHERE_IDS_MSSQL = "\n where c.[Id] in (<%= ids %>)";

const COURSES_MSSQL =
    "select <%= fields %>" +
    "from [Course] c\n" +
    "  join [CourseLng] cl on cl.[CourseId] = c.[Id]\n" +
    "  join [CourseCategory] cc on cc.[CourseId] = c.[Id]\n" +
    "  join [AuthorToCourse] ac on ac.[CourseId] = c.[Id]\n" +
    "  join [CategoryLng] ctl on ctl.[CategoryId] = cc.[CategoryId]\n" +
    "  join [Category] ctg on ctg.[Id] = cc.[CategoryId]\n" +
    "  join [Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join [AuthorLng] al on al.[AuthorId] = ac.[AuthorId]\n" +
    "  join (select c.[Id], min(lc.[ReadyDate]) as [PubDate] from[Course] c\n" +
    "    join [LessonCourse] lc on lc.[CourseId] = c.[Id]\n" +
    "    where c.[State] = 'P' and lc.[State] = 'R'\n" +
    "    group by c.[Id]) cp on cp.[Id] = c.[Id]<%= where %>\n" +
    "order by c.[Id]";

const COURSES_FLDS_MYSQL =
    "c.`Id`, cl.`Name`, cl.`Description`, cl.`ShortDescription`, cl.`TargetAudience`, cl.`Aims`,\n" +
    "  concat(al.`FirstName`, ' ', al.`LastName`) as `Author`, ctl.`Name` as `Category`, cp.`PubDate`,\n" +
    "  c.`URL` as `CourseURL`, c.`Cover`, c.`CoverMeta`, a.`Id` as `AuthorId`, a.`URL` as `AuthorURL`,\n" +
    "  a.`Portrait`, a.`PortraitMeta`, ctg.`Id` as `CategoryId`, ctg.`URL` as `CategoryURL`,\n"+
    "  c.`IsPaid`, c.`IsLandingPage`, c.`LandCover`, c.`LandCoverMeta`\n";

const COURSES_FLDS_ID_MYSQL = "distinct c.`Id`\n";
const COURSES_WHERE_MYSQL = "";
const COURSES_WHERE_IDS_MYSQL = "\n  where c.`Id` in (<%= ids %>)";

const COURSES_MYSQL =
    "select <%= fields %>" +
    "from `Course` c\n" +
    "  join `CourseLng` cl on cl.`CourseId` = c.`Id`\n" +
    "  join `CourseCategory` cc on cc.`CourseId` = c.`Id`\n" +
    "  join `AuthorToCourse` ac on ac.`CourseId` = c.`Id`\n" +
    "  join `CategoryLng` ctl on ctl.`CategoryId` = cc.`CategoryId`\n" +
    "  join `Category` ctg on ctg.`Id` = cc.`CategoryId`\n" +
    "  join `Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join `AuthorLng` al on al.`AuthorId` = ac.`AuthorId`\n" +
    "  join (select c.`Id`, min(lc.`ReadyDate`) as `PubDate` from`Course` c\n" +
    "    join `LessonCourse` lc on lc.`CourseId` = c.`Id`\n" +
    "    where c.`State` = 'P' and lc.`State` = 'R'\n" +
    "    group by c.`Id`) cp on cp.`Id` = c.`Id`<%= where %>\n" +
    "order by c.`Id`<%= limit %>";

const DFLT_INDEX_NAME = "course";

const mapping = {
    properties: {
        createDate: { type: "date" },
        modifyDate: { type: "date" },
        pubDate: { type: "date" },
        csInfo: { type: "object" },
        csAuthor: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 100
                }
            }
        },
        csCategory: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 150
                }
            }
        },
        csName: {
            type: "text",
            analyzer: "russian",
            fields: {
                key: {
                    type: "keyword",
                    ignore_above: 150
                }
            }
        },
        csShortDescription: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        },
        csDescription: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        },
        csTargetAudience: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        },
        csAims: {
            type: "text",
            analyzer: "russian",
            term_vector: "with_positions_offsets"
        }
    }
};

class ImportCourse extends ImportBase {

    constructor() {
        super({ index: DFLT_INDEX_NAME, mappings: mapping });
    }

    async _getData(store_func, opts) {
        let all_ids = [];

        let ds_ids = await $data.execSql({
            dialect: {
                mysql: _.template(COURSES_MYSQL)({
                    fields: COURSES_FLDS_ID_MYSQL,
                    where: _.template(COURSES_WHERE_MYSQL)(),
                    limit: opts.limit ? ` limit ${opts.limit}` : ``
                }),
                mssql: _.template(COURSES_MSSQL)({
                    fields: _.template(COURSES_FLDS_ID_MSSQL)({ limit: opts.limit ? ` top ${opts.limit}` : `` }),
                    where: _.template(COURSES_WHERE_MSSQL)()
                })
            }
        }, {});
        if (ds_ids && ds_ids.detail && (ds_ids.detail.length > 0)) {

            ds_ids.detail.forEach(elem => {
                all_ids.push(elem.Id);
            });

            let arrayOfIds = splitArray(all_ids, opts.page ? opts.page : MAX_IDS_PER_REQ);

            for (let i = 0; i < arrayOfIds.length; i++) {

                let courses = [];
                let ds = await $data.execSql({
                    dialect: {
                        mysql: _.template(COURSES_MYSQL)({
                            fields: COURSES_FLDS_MYSQL,
                            where: _.template(COURSES_WHERE_IDS_MYSQL)({ ids: arrayOfIds[i].join() }),
                            limit: ``
                        }),
                        mssql: _.template(COURSES_MSSQL)({
                            fields: COURSES_FLDS_MSSQL,
                            where: _.template(COURSES_WHERE_IDS_MSSQL)({ ids: arrayOfIds[i].join() })
                        })
                    }
                }, {});

                if (ds && ds.detail && (ds.detail.length > 0)) {
                    let currId = -1;
                    let currCrs;
                    let authors = {};
                    let categories = {};
                    ds.detail.forEach(elem => {
                        if (currId !== elem.Id) {
                            currId = elem.Id;
                            let ts = new Date();
                            currCrs = {
                                Id: elem.Id,
                                createDate: ts,
                                modifyDate: ts,
                                pubDate: elem.PubDate,
                                csInfo: {
                                    URL: elem.CourseURL,
                                    Cover: elem.IsLandingPage ? elem.LandCover : elem.Cover,
                                    CoverMeta: elem.IsLandingPage ? elem.LandCoverMeta : elem.CoverMeta,
                                    IsPaid: elem.IsPaid ? true : false,
                                    Authors: {},
                                    Categories: {}
                                },
                                csAuthor: [],
                                csCategory: [],
                                csName: elem.Name,
                                csShortDescription: striptags(elem.ShortDescription),
                                csDescription: striptags(elem.Description),
                                csTargetAudience: striptags(elem.TargetAudience),
                                csAims: striptags(elem.Aims)
                            };
                            courses.push(currCrs);
                            authors = {};
                            categories = {};
                        }
                        if (!authors[elem.Author]) {
                            authors[elem.Author] = true;
                            currCrs.csAuthor.push(elem.Author);
                            currCrs.csInfo.Authors[elem.Author] = {
                                Id: elem.AuthorId,
                                URL: elem.AuthorURL,
                                Portrait: elem.Portrait,
                                PortraitMeta: elem.PortraitMeta
                            }
                        }
                        if (!categories[elem.Category]) {
                            categories[elem.Category] = true;
                            currCrs.csCategory.push(elem.Category);
                            currCrs.csInfo.Categories[elem.Category] = {
                                Id: elem.CategoryId,
                                URL: elem.CategoryURL
                            }
                        }
                    });
                }

                await store_func(courses, { createDateField: "createDate" });
            }
        }
    }
}

let importCourse = null;
exports.ImportCourseService = () => {
    return importCourse ? importCourse : importCourse = new ImportCourse();
}