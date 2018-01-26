const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const _ = require('lodash');

const ACCOUNT_ID = 1;
const LANGUAGE_ID = 1;

const COURSE_REQ_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "LessonCourse"
                    }
                }
            ]
        }
    }
};

const LESSON_REQ_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "LessonLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "Reference"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "Lesson"
                    }
                },
                {
                    dataObject: {
                        name: "Resource",
                        childs: [
                            {
                                dataObject: {
                                    name: "ResourceLng"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "EpisodeLesson"
                    }
                }
            ]
        }
    }
};

const LESSON_UPD_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "LessonLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "Reference"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "Episode"
                    }
                },
                {
                    dataObject: {
                        name: "Lesson"
                    }
                },
                {
                    dataObject: {
                        name: "Resource",
                        childs: [
                            {
                                dataObject: {
                                    name: "ResourceLng"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "EpisodeLesson"
                    }
                }
            ]
        }
    }
};

const LESSON_MSSQL_ID_REQ =
    "select l.[Id], l.[URL], ll.[Name], ll.[ShortDescription], ll.[FullDescription], cl.[Name] as [CourseName], c.[Id] as [CourseId],\n" + 
    "  clo.[Name] as [CourseNameOrig], co.[Id] as [CourseIdOrig], a.[Id] as [AuthorId], l.[Cover], lc.[Number], lc.[ReadyDate],\n"+
    "  lc.[State], l.[LessonType], l.[ParentId], lcp.[LessonId] as [CurrParentId], lpl.[Name] as [CurrParentName] from [Lesson] l\n" +
    "  join [LessonLng] ll on l.[Id] = ll.[LessonId] and ll.[LanguageId] = <%= languageId %>\n" +
    "  join [LessonCourse] lc on l.[Id] = lc.[LessonId]\n" +
    "  join [Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join [AuthorLng] al on a.[Id] = al.[AuthorId] and al.[LanguageId] = <%= languageId %>\n" +
    "  join [Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId] and cl.[LanguageId] = <%= languageId %>\n" +
    "  join [Course] co on co.[Id] = l.[CourseId]\n" +
    "  join [CourseLng] clo on co.[Id] = clo.[CourseId] and clo.[LanguageId] = <%= languageId %>\n" +
    "  left join [LessonCourse] lcp on lc.[ParentId] = lcp.[Id]\n" +
    "  left join [LessonLng] lpl on lcp.[LessonId] = lpl.[LessonId] and lpl.[LanguageId] = <%= languageId %>\n" +
    "where l.[Id] = <%= id %> and lc.[CourseId] = <%= courseId %>";

const LESSON_MSSQL_CHLD_REQ =
    "select l.[Id], l.[URL], ll.[Name], ll.[ShortDescription], ll.[FullDescription], cl.[Name] as [CourseName], c.[Id] as [CourseId],\n" +
    "  clo.[Name] as [CourseNameOrig], co.[Id] as [CourseIdOrig], a.[Id] as [AuthorId], l.[Cover], lc.[Number], lc.[ReadyDate],\n" +
    "  lc.[State], l.[LessonType], l.[ParentId], lcp.[LessonId] as [CurrParentId] from [Lesson] l\n" +
    "  join [LessonLng] ll on l.[Id] = ll.[LessonId] and ll.[LanguageId] = <%= languageId %>\n" +
    "  join [LessonCourse] lc on l.[Id] = lc.[LessonId]\n" +
    "  join [Author] a on a.[Id] = l.[AuthorId]\n" +
    "  join [AuthorLng] al on a.[Id] = al.[AuthorId] and al.[LanguageId] = <%= languageId %>\n" +
    "  join [Course] c on c.[Id] = lc.[CourseId]\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId] and cl.[LanguageId] = <%= languageId %>\n" +
    "  join [Course] co on co.[Id] = l.[CourseId]\n" +
    "  join [CourseLng] clo on co.[Id] = clo.[CourseId] and clo.[LanguageId] = <%= languageId %>\n" +
    "  join [LessonCourse] lcp on lc.[ParentId] = lcp.[Id]\n" +
    "where lcp.[LessonId] = <%= id %> and lcp.[CourseId] = <%= courseId %>";

const LESSON_MYSQL_ID_REQ =
    "select l.`Id`, l.`URL`, ll.`Name`, ll.`ShortDescription`, ll.`FullDescription`, cl.`Name` as `CourseName`, c.`Id` as `CourseId`,\n" +
    "  clo.`Name` as `CourseNameOrig`, co.`Id` as `CourseIdOrig`, a.`Id` as `AuthorId`, l.`Cover`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  lc.`State`, l.`LessonType`, l.`ParentId`, lcp.`LessonId` as `CurrParentId`, lpl.`Name` as `CurrParentName` from `Lesson` l\n" +
    "  join `LessonLng` ll on l.`Id` = ll.`LessonId` and ll.`LanguageId` = <%= languageId %>\n" +
    "  join `LessonCourse` lc on l.`Id` = lc.`LessonId`\n" +
    "  join `Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join `AuthorLng` al on a.`Id` = al.`AuthorId` and al.`LanguageId` = <%= languageId %>\n" +
    "  join `Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId` and cl.`LanguageId` = <%= languageId %>\n" +
    "  join `Course` co on co.`Id` = l.`CourseId`\n" +
    "  join `CourseLng` clo on co.`Id` = clo.`CourseId` and clo.`LanguageId` = <%= languageId %>\n" +
    "  left join `LessonCourse` lcp on lc.`ParentId` = lcp.`Id`\n" +
    "  left join `LessonLng` lpl on lcp.`LessonId` = lpl.`LessonId` and lpl.`LanguageId` = <%= languageId %>\n" +
    "where l.`Id` = <%= id %> and lc.`CourseId` = <%= courseId %>";

const LESSON_MYSQL_CHLD_REQ =
    "select l.`Id`, l.`URL`, ll.`Name`, ll.`ShortDescription`, ll.`FullDescription`, cl.`Name` as `CourseName`, c.`Id` as `CourseId`,\n" +
    "  clo.`Name` as `CourseNameOrig`, co.`Id` as `CourseIdOrig`, a.`Id` as `AuthorId`, l.`Cover`, lc.`Number`, lc.`ReadyDate`,\n" +
    "  lc.`State`, l.`LessonType`, l.`ParentId`, lcp.`LessonId` as `CurrParentId` from `Lesson` l\n" +
    "  join `LessonLng` ll on l.`Id` = ll.`LessonId` and ll.`LanguageId` = <%= languageId %>\n" +
    "  join `LessonCourse` lc on l.`Id` = lc.`LessonId`\n" +
    "  join `Author` a on a.`Id` = l.`AuthorId`\n" +
    "  join `AuthorLng` al on a.`Id` = al.`AuthorId` and al.`LanguageId` = <%= languageId %>\n" +
    "  join `Course` c on c.`Id` = lc.`CourseId`\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId` and cl.`LanguageId` = <%= languageId %>\n" +
    "  join `Course` co on co.`Id` = l.`CourseId`\n" +
    "  join `CourseLng` clo on co.`Id` = clo.`CourseId` and clo.`LanguageId` = <%= languageId %>\n" +
    "  join `LessonCourse` lcp on lc.`ParentId` = lcp.`Id`\n" +
    "where lcp.`LessonId` = <%= id %> and lcp.`CourseId` = <%= courseId %>";

const LESSON_MSSQL_EPISODE_REQ =
    "select e.[Id], epl.[Name], el.[Number], epl.[State], el.[Supp] from [EpisodeLesson] el\n" +
    "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
    "  join [EpisodeLng] epl on e.[Id] = epl.[EpisodeId] and epl.[LanguageId] = <%= languageId %>\n" +
    "where el.[LessonId] = <%= id %>";
const LESSON_MSSQL_REFERENCE_REQ =
    "select r.[Id], r.[Description], r.[Number], r.[URL], r.[Recommended] from [Reference] r\n" +
    "  join [LessonLng] l on l.[Id] = r.[LessonLngId]\n" +
    "where l.[LessonId] = <%= id %>";
const LESSON_MSSQL_RESOURCE_REQ =
    "select r.[Id], r.[ResType], r.[FileName], r.[ResLanguageId], ll.[Language], l.[Name], l.[Description], l.[MetaData] from [Resource] r\n" +
    "  join[ResourceLng] l on l.[ResourceId] = r.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "  left join [Language] ll on ll.[Id] = r.[ResLanguageId]\n" +
    "where r.[LessonId] = <%= id %>";
const LESSON_MSSQL_TOC_REQ =
    "select e.[Id] Episode, t.[Id], t.[Number], l.[Topic], l.[StartTime] from [EpisodeToc] t\n" +
    "  join[EpisodeTocLng] l on l.[EpisodeTocId] = t.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "  join[Episode] e on e.[Id] = t.[EpisodeId]\n" +
    "  join [EpisodeLesson] pl on pl.[EpisodeId] = e.[Id]" +
    "where pl.[LessonId] = <%= id %>\n" +
    "order by e.[Id], t.[Number]";
const LESSON_MSSQL_CONTENT_REQ =
    "select e.[Id] Episode, t.[Id], l.[Audio], l.[AudioMeta], r.[Id] as [AssetId],\n" +
    "  t.[StartTime], t.[Content] from [EpisodeContent] t\n" +
    "  join[EpisodeLng] l on l.[Id] = t.[EpisodeLngId] and l.[LanguageId] = <%= languageId %>\n" +
    "  join[Episode] e on e.[Id] = l.[EpisodeId]\n" +
    "  join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "  join [EpisodeLesson] pl on pl.[EpisodeId] = e.[Id]" +
    "where pl.[LessonId] = <%= id %>\n" +
    "order by pl.[Number], e.[Id], t.[StartTime]";
const LESSON_MSSQL_ASSETS_REQ =
    "select r.[Id], r.[ResType], r.[FileName], r.[ResLanguageId], rl.[Name], rl.[Description], rl.[MetaData] from [EpisodeContent] t\n" +
    "  join[EpisodeLng] l on l.[Id] = t.[EpisodeLngId] and l.[LanguageId] = <%= languageId %>\n" +
    "  join[Episode] e on e.[Id] = l.[EpisodeId]\n" +
    "  join[Resource] r on t.[ResourceId] = r.[Id]\n" +
    "  join[ResourceLng] rl on rl.[ResourceId] = r.[Id] and l.[LanguageId] = <%= languageId %>\n" +
    "  join [EpisodeLesson] pl on pl.[EpisodeId] = e.[Id]" +
    "where pl.[LessonId] = <%= id %>";

const LESSON_MYSQL_EPISODE_REQ =
    "select e.`Id`, epl.`Name`, el.`Number`, epl.`State`, el.`Supp` from `EpisodeLesson` el\n" +
    "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
    "  join `EpisodeLng` epl on e.`Id` = epl.`EpisodeId` and epl.`LanguageId` = <%= languageId %>\n" +
    "where el.`LessonId` = <%= id %>";
const LESSON_MYSQL_REFERENCE_REQ =
    "select r.`Id`, r.`Description`, r.`Number`, r.`URL`, r.`Recommended` from `Reference` r\n" +
    "  join `LessonLng` l on l.`Id` = r.`LessonLngId`\n" +
    "where l.`LessonId` = <%= id %>";
const LESSON_MYSQL_RESOURCE_REQ =
    "select r.`Id`, r.`ResType`, r.`FileName`, r.`ResLanguageId`, ll.`Language`, l.`Name`, l.`Description`, l.`MetaData` from `Resource` r\n" +
    "  join`ResourceLng` l on l.`ResourceId` = r.`Id` and l.`LanguageId` = <%= languageId %>\n" +
    "  left join `Language` ll on ll.`Id` = r.`ResLanguageId`\n" +
    "where r.`LessonId` = <%= id %>";
const LESSON_MYSQL_TOC_REQ =
    "select e.`Id` Episode, t.`Id`, t.`Number`, l.`Topic`, l.`StartTime` from `EpisodeToc` t\n" +
    "  join`EpisodeTocLng` l on l.`EpisodeTocId` = t.`Id` and l.`LanguageId` = <%= languageId %>\n" +
    "  join`Episode` e on e.`Id` = t.`EpisodeId`\n" +
    "  join `EpisodeLesson` pl on pl.`EpisodeId` = e.`Id`" +
    "where pl.`LessonId` = <%= id %>\n" +
    "order by e.`Id`, t.`Number`";
const LESSON_MYSQL_CONTENT_REQ =
    "select e.`Id` Episode, t.`Id`, l.`Audio`, l.`AudioMeta`, r.`Id` as `AssetId`,\n" +
    "  t.`StartTime`, t.`Content` from `EpisodeContent` t\n" +
    "  join`EpisodeLng` l on l.`Id` = t.`EpisodeLngId` and l.`LanguageId` = <%= languageId %>\n" +
    "  join`Episode` e on e.`Id` = l.`EpisodeId`\n" +
    "  join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "  join `EpisodeLesson` pl on pl.`EpisodeId` = e.`Id`" +
    "where pl.`LessonId` = <%= id %>\n" +
    "order by pl.`Number`, e.`Id`, t.`StartTime`";
const LESSON_MYSQL_ASSETS_REQ =
    "select r.`Id`, r.`ResType`, r.`FileName`, r.`ResLanguageId`, rl.`Name`, rl.`Description`, rl.`MetaData` from `EpisodeContent` t\n" +
    "  join`EpisodeLng` l on l.`Id` = t.`EpisodeLngId` and l.`LanguageId` = <%= languageId %>\n" +
    "  join`Episode` e on e.`Id` = l.`EpisodeId`\n" +
    "  join`Resource` r on t.`ResourceId` = r.`Id`\n" +
    "  join`ResourceLng` rl on rl.`ResourceId` = r.`Id` and l.`LanguageId` = <%= languageId %>\n" +
    "  join `EpisodeLesson` pl on pl.`EpisodeId` = e.`Id`" +
    "where pl.`LessonId` = <%= id %>";

const EPISODE_MSSQL_DELETE_SCRIPT =
    [
        "delete ec from [Episode] e\n" +
        "  join [EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
        "  join [EpisodeContent] ec on el.[Id] = ec.[EpisodeLngId]\n" +
        "where e.[Id] = <%= id %>",
        "delete from [Episode] where [Id] = <%= id %>"
    ];

const EPISODE_MYSQL_DELETE_SCRIPT =
    [
        "delete ec from `Episode` e\n" +
        "  join `EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
        "  join `EpisodeContent` ec on el.`Id` = ec.`EpisodeLngId`\n" +
        "where e.`Id` = <%= id %>",
        "delete from `Episode` where `Id` = <%= id %>"
    ];

const LESSON_MSSQL_DELETE_SCRIPT =
    [
        "delete el from [Lesson] l\n" +
        "  join [EpisodeLesson] el on l.[Id] = el.[LessonId]\n" +
        "where l.[Id] = <%= id %>",
        "delete ec from [Lesson] l\n" +
        "  join[Episode] e on l.[Id] = e.[LessonId]\n" +
        "  join[EpisodeLng] el on e.[Id] = el.[EpisodeId]\n" +
        "  join[EpisodeContent] ec on el.[Id] = ec.[EpisodeLngId]\n" +
        "where l.[Id] = <%= id %>",
        "delete from[Lesson] where [Id] = <%= id %>"
    ];

const LESSON_MYSQL_DELETE_SCRIPT =
    [
        "delete el from `Lesson` l\n" +
        "  join `EpisodeLesson` el on l.`Id` = el.`LessonId`\n" +
        "where l.`Id` = <%= id %>",
        "delete ec from `Lesson` l\n" +
        "  join`Episode` e on l.`Id` = e.`LessonId`\n" +
        "  join`EpisodeLng` el on e.`Id` = el.`EpisodeId`\n" +
        "  join`EpisodeContent` ec on el.`Id` = ec.`EpisodeLngId`\n" +
        "where l.`Id` = <%= id %>",
        "delete from`Lesson` where `Id` = <%= id %>"
    ];

const DbLesson = class DbLesson extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression) {
        var exp = expression || LESSON_REQ_TREE;
        return super._getObjById(id, exp);
    }

    get(id, course_id, parent_id) {
        let lesson = {};
        let isNotFound = true;
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(LESSON_MYSQL_ID_REQ)({ languageId: LANGUAGE_ID, id: id, courseId: course_id }),
                        mssql: _.template(LESSON_MSSQL_ID_REQ)({ languageId: LANGUAGE_ID, id: id, courseId: course_id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1)) {
                            lesson = result.detail[0];
                            isNotFound = false;
                        }
                        if (!isNotFound)
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_EPISODE_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                    mssql: _.template(LESSON_MSSQL_EPISODE_REQ)({ languageId: LANGUAGE_ID, id: id })
                                }
                            }, {});
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let episodes = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach((elem) => {
                                    if (typeof (elem.Supp) === "number")
                                        elem.Supp = elem.Supp === 0 ? false : true;    
                                    episodes.push(elem);
                                })
                            }
                            lesson.Episodes = episodes;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_REFERENCE_REQ)({ id: id }),
                                    mssql: _.template(LESSON_MSSQL_REFERENCE_REQ)({ id: id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let references = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                result.detail.forEach((elem) => {
                                    if (typeof (elem.Recommended) === "number")
                                        elem.Recommended = elem.Recommended === 0 ? false : true;
                                    references.push(elem);
                                })
                            }
                            lesson.References = references;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_CHLD_REQ)({ languageId: LANGUAGE_ID, id: id, courseId: course_id }),
                                    mssql: _.template(LESSON_MSSQL_CHLD_REQ)({ languageId: LANGUAGE_ID, id: id, courseId: course_id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let childs = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                childs = result.detail;
                            }
                            lesson.Childs = childs;
                            return $data.execSql({
                                dialect: {
                                    mysql: _.template(LESSON_MYSQL_RESOURCE_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                    mssql: _.template(LESSON_MSSQL_RESOURCE_REQ)({ languageId: LANGUAGE_ID, id: id })
                                }
                            }, {});
                        }
                    })
                    .then((result) => {
                        if (!isNotFound) {
                            let resources = [];
                            if (result && result.detail && (result.detail.length > 0)) {
                                resources = result.detail;
                            }
                            lesson.Resources = resources;
                        }
                        return lesson;
                    })
            );
        })
    }

    getResources(id) {
        let resources = [];
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(LESSON_MYSQL_RESOURCE_REQ)({ languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(LESSON_MSSQL_RESOURCE_REQ)({ languageId: LANGUAGE_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            resources = result.detail;
                        }
                        return resources;
                    })
            );
        })
    }

    getPlayerData(id) {
        let data = { assets: [], episodes: [] };
        let epi_list = {};
        let assets_list = {};

        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(LESSON_MYSQL_ASSETS_REQ)({ languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(LESSON_MSSQL_ASSETS_REQ)({ languageId: LANGUAGE_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (!assets_list[elem.Id]) {
                                    let asset = {
                                        id: elem.Id,
                                        file: elem.FileName,
                                        info: JSON.parse(elem.MetaData)
                                    };
                                    if (elem.Name)
                                        asset.title = elem.Name;    
                                    if (elem.Description)
                                        asset.title2 = elem.Description;    
                                    assets_list[elem.Id] = asset;
                                    data.assets.push(asset);
                                }
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_CONTENT_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                mssql: _.template(LESSON_MSSQL_CONTENT_REQ)({ languageId: LANGUAGE_ID, id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        if (result && result.detail && (result.detail.length > 0)) {
                            let curr_id = -1;
                            let curr_episode = null;;
                            
                            result.detail.forEach((elem) => {
                                let assetId = elem.AssetId;
                                if (curr_id !== elem.Episode) {
                                    curr_episode = {
                                        id: elem.Episode,
                                        elements: [],
                                        audio: {
                                            file: elem.Audio,
                                            info: JSON.parse(elem.AudioMeta)
                                        },
                                        contents: []
                                    };
                                    data.episodes.push(curr_episode);
                                    epi_list[elem.Episode] = curr_episode;
                                    curr_id = elem.Episode;
                                }
                                let curr_elem = {
                                    id: elem.Id,
                                    assetId: assetId,
                                    start: elem.StartTime/ 1000.,
                                    content: JSON.parse(elem.Content),
                                };
                                curr_episode.elements.push(curr_elem);
                                if (!assets_list[assetId])
                                    throw new Error("Unknown asset (Id=" + assetId + ") in episode (Id=" + elem.Episode+").");    
                            });
                        }
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(LESSON_MYSQL_TOC_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                mssql: _.template(LESSON_MSSQL_TOC_REQ)({ languageId: LANGUAGE_ID, id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let curr_id = -1;
                        let curr_episode = null;;
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                if (curr_id !== elem.Episode) {
                                    curr_episode = epi_list[elem.Episode];
                                    if (!curr_episode)
                                        throw new Error("Unknown episode (Id=" + elem.Episode + ") in lesson (Id=" + id + ").");    
                                }
                                curr_episode.contents.push({
                                    id: elem.Id,
                                    title: elem.Topic,
                                    begin: elem.StartTime / 1000.
                                });
                            });
                        }
                        return data;
                    })
            );
        })
    }

    del(id, course_id, parent_id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let lesson_obj = null;
            let course_obj = null;
            let ls_course_collection = null;
            let ls_course_obj = null;
            let lesson_number;

            let transactionId = null;
            let hasParent = typeof (parent_id) === "number";
            let curr_parent_id;
            let lc_parent_id;

            let lsn_to_delete = [];
            resolve(
                this._getObjById(course_id, COURSE_REQ_TREE)
                    .then((result) => {
                        ls_course_collection = result.getCol("DataElements");
                        if (ls_course_collection.count() != 1)
                            throw new Error("Course (Id = " + course_id + ") doesn't exist.");
                        course_obj = ls_course_collection.get(0);
                        ls_course_collection = course_obj.getDataRoot("LessonCourse").getCol("DataElements");
                        for (let i = 0; i < ls_course_collection.count(); i++) {
                            if (ls_course_collection.get(i).lessonId() === id) {
                                ls_course_obj = ls_course_collection.get(i);
                                lesson_number = ls_course_obj.number();
                                break;
                            }
                        }
                        if (!ls_course_obj)
                            throw new Error("Lesson (Id = " + id + ") doesn't belong to course (Id = " + course_id + ").");

                        lc_parent_id = ls_course_obj.parentId();
                        if (hasParent) {
                            for (let i = 0; i < ls_course_collection.count(); i++) {
                                if (ls_course_collection.get(i).id() === lc_parent_id)
                                    curr_parent_id = ls_course_collection.get(i).lessonId();
                            }
                            if (curr_parent_id !== parent_id)
                                throw new Error("Lesson (Id = " + id + ") doesn't belong to parent (Id = " + parent_id +
                                    ") in course (Id = " + course_id + ") context.");
                        }

                        return course_obj.edit()
                            .then(() => {
                                return this._getObjById(id, {
                                    expr: {
                                        model: {
                                            name: "Lesson",
                                            childs: [
                                                {
                                                    dataObject: {
                                                        name: "Lesson"
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                });
                            })
                    })
                    .then((result) => {
                        root_obj = result;
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + id + ") doesn't exist.");

                        let lesson_obj = collection.get(0);
                        if (lesson_obj.courseId() === course_id) {
                            // We need to remove whole lesson here    
                            lsn_to_delete.push(lesson_obj.id());
                            let ch_collection = lesson_obj.getDataRoot("Lesson").getCol("DataElements");
                            for (let i = 0; i < ch_collection.count(); i++)
                                lsn_to_delete.unshift(ch_collection.get(i).id());
                        }

                        // Removing lesson reference from course
                        let ch_to_del = [];
                        for (let i = 0; i < ls_course_collection.count(); i++) {
                            let lsn = ls_course_collection.get(i);
                            if (ls_course_obj.id() === lsn.parentId())
                                ch_to_del.push(lsn);
                        }
                        ch_to_del.forEach((elem) => {
                            ls_course_collection._del(elem);
                        });
                        ls_course_collection._del(ls_course_obj);
                        for (let i = 0; i < ls_course_collection.count(); i++) {
                            let lsn = ls_course_collection.get(i);
                            if ((hasParent && (lsn.parentId() === lc_parent_id)) || ((!hasParent) && (!lsn.parentId())))
                                if (lsn.number() > lesson_number)
                                    lsn.number(lsn.number() - 1);
                        }

                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                                return course_obj.save(opts);
                            })
                            .then(() => {
                                if (lsn_to_delete.length > 0)
                                    return Utils.seqExec(lsn_to_delete, (id) => {
                                        let mysql_script = [];
                                        LESSON_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                            mysql_script.push(_.template(elem)({ id: id }));
                                        });
                                        let mssql_script = [];
                                        LESSON_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                            mssql_script.push(_.template(elem)({ id: id }));
                                        });
                                        return DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                                    });
                            });
                   })
                    .then(() => {
                        console.log("Lesson deleted: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (course_obj)
                            this._db._deleteRoot(course_obj.getRoot());
                        if (isErr) {
                            result = result.then(() => {
                                if (res instanceof Error)
                                    throw res
                                else
                                    throw new Error("Error: " + JSON.stringify(res));
                            });
                        }
                        else
                            result = result.then(() => { return res; })
                        return result;
                    })
            );
        })
    }

    update(id, course_id, data, parent_id) {
        let self = this;
        return new Promise((resolve, reject) => {
            let course_obj;
            let lsn_obj;
            let lsn_lng_obj;
            let root_ch;
            let root_res;
            let root_ref;
            let root_epi;
            let ch_collection;
            let ch_own_collection;
            let res_collection;
            let ref_collection;
            let epi_collection;
            let epi_own_collection;
            let ch_list = {};
            let res_list = {};
            let ref_list = {};
            let epi_list = {};
            let opts = {};
            let inpFields = data || {};
            
            let ch_new = [];
            let res_new = [];
            let ref_new = [];
            let epi_new = [];

            let needToDeleteOwn = false;
            let needToDeleteOwnCh = false;
            let transactionId = null;

            let ls_course_obj = null;
            let hasParent = typeof (parent_id) === "number";

            resolve(
                this._getObjById(course_id, COURSE_REQ_TREE)
                    .then((result) => {
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + course_id + ") doesn't exist.");
                        course_obj = collection.get(0);

                        return course_obj.edit()
                            .then(() => {
                                return this._getObjById(id, LESSON_UPD_TREE);
                            })
                    })
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + id + ") doesn't exist.");
                        lsn_obj = collection.get(0);

                        root_ch = course_obj.getDataRoot("LessonCourse");
                        ch_collection = root_ch.getCol("DataElements");
                        for (let i = 0; i < ch_collection.count(); i++){
                            if (ch_collection.get(i).lessonId() === id) {
                                ls_course_obj = ch_collection.get(i);
                                break;
                            }
                        }
                        if (!ls_course_obj)
                            throw new Error("Lesson (Id = " + id + ") doesn't belong to course (Id = " + course_id + ").");

                        collection = lsn_obj.getDataRoot("LessonLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Lesson (Id = " + id + ") has inconsistent \"LNG\" part.");
                        lsn_lng_obj = collection.get(0);

                        ch_own_collection = lsn_obj.getDataRoot("Lesson").getCol("DataElements");
                        root_res = lsn_obj.getDataRoot("Resource");
                        res_collection = root_res.getCol("DataElements");
                        root_ref = lsn_lng_obj.getDataRoot("Reference");
                        ref_collection = root_ref.getCol("DataElements");
                        root_epi = lsn_obj.getDataRoot("EpisodeLesson");
                        epi_collection = root_epi.getCol("DataElements");
                        epi_own_collection = lsn_obj.getDataRoot("Episode").getCol("DataElements");

                        if ((!hasParent) && inpFields.Childs && (typeof (inpFields.Childs.length) === "number")) {
                            let lc_parent_id = ls_course_obj.id();
                            for (let i = 0; i < ch_collection.count(); i++) {
                                let obj = ch_collection.get(i);
                                if (obj.parentId() === lc_parent_id)
                                ch_list[obj.lessonId()] = { deleted: true, isOwner: false, obj: obj };
                            }

                            for (let i = 0; i < ch_own_collection.count(); i++) {
                                let obj = ch_own_collection.get(i);
                                if (!ch_list[obj.id()])
                                    throw new Error("Unknown own child lesson (Id = " + obj.id() + ").");
                                ch_list[obj.id()].isOwner = true;
                                ch_list[obj.id()].ownObj = obj;
                            }

                            let Number = 1;
                            inpFields.Childs.forEach((elem) => {
                                let data = {
                                    ParentId: lc_parent_id,
                                    LessonId: elem.Id,
                                    Number: Number++,
                                    State: elem.State
                                };
                                if (typeof (elem.ReadyDate) !== "undefined")
                                    data.ReadyDate = elem.ReadyDate;
                                if (ch_list[elem.Id]) {
                                    ch_list[elem.Id].deleted = false;
                                    ch_list[elem.Id].data = data;
                                }
                                else
                                    ch_new.push(data);
                            })
                        }

                        if (inpFields.Resources && (typeof (inpFields.Resources.length) === "number")) {
                            for (let i = 0; i < res_collection.count(); i++) {
                                let obj = res_collection.get(i);
                                let collection = obj.getDataRoot("ResourceLng").getCol("DataElements");
                                if (collection.count() != 1)
                                    throw new Error("Resource (Id = " + obj.id() + ") has inconsistent \"LNG\" part.");
                                let lng_obj = collection.get(0);
                                res_list[obj.id()] = { deleted: true, obj: obj, lngObj: lng_obj };
                            }

                            inpFields.Resources.forEach((elem) => {
                                let data = {
                                    res: {
                                        ResType: elem.ResType ? elem.ResType : "P",
                                        FileName: elem.FileName
                                    },
                                    lng: {
                                        Name: elem.Name ? elem.Name : "",
                                        LanguageId: LANGUAGE_ID
                                    }
                                };
                                if (typeof (elem.ResLanguageId) !== "undefined")
                                    data.res.ResLanguageId = elem.ResLanguageId;
                                if (typeof (elem.Description) !== "undefined")
                                    data.lng.Description = elem.Description;
                                if (typeof (elem.Id) === "number") {
                                    if (res_list[elem.Id]) {
                                        res_list[elem.Id].deleted = false;
                                        res_list[elem.Id].data = data;
                                    }
                                    else {
                                        delete elem.Id;
                                        res_new.push(data);
                                    }
                                }
                                else
                                    res_new.push(data);
                            })
                        }

                        if (inpFields.References && (typeof (inpFields.References.length) === "number")) {
                            for (let i = 0; i < ref_collection.count(); i++) {
                                let obj = ref_collection.get(i);
                                ref_list[obj.id()] = { deleted: true, obj: obj };
                            }

                            let Number = 1;
                            let NumberRec = 1;
                            inpFields.References.forEach((elem) => {
                                let data = {
                                    Number: elem.Recommended ? NumberRec++ : Number++,
                                    Description: elem.Description,
                                    Recommended: elem.Recommended
                                };
                                if (typeof (elem.URL) !== "undefined")
                                    data.URL = elem.URL;
                                if (typeof (elem.AuthorComment) !== "undefined")
                                    data.AuthorComment = elem.AuthorComment;
                                if (typeof (elem.Id) === "number") {
                                    if (ref_list[elem.Id]) {
                                        ref_list[elem.Id].deleted = false;
                                        ref_list[elem.Id].data = data;
                                    }
                                    else {
                                        //throw new Error("Unknown reference item (Id = " + elem.Id + ").");
                                        delete elem.Id;
                                        ref_new.push(data);
                                    }
                                }
                                else
                                    ref_new.push(data);
                            })
                        }

                        if (inpFields.Episodes && (typeof (inpFields.Episodes.length) === "number")) {
                            for (let i = 0; i < epi_collection.count(); i++) {
                                let obj = epi_collection.get(i);
                                epi_list[obj.episodeId()] = { deleted: true, isOwner: false, obj: obj };
                            }

                            for (let i = 0; i < epi_own_collection.count(); i++) {
                                let obj = epi_own_collection.get(i);
                                if (!epi_list[obj.id()])
                                    throw new Error("Unknown own episode (Id = " + obj.id() + ").");
                                epi_list[obj.id()].isOwner = true;
                                epi_list[obj.id()].ownObj = obj;
                            }

                            let Number = 1;
                            let NumberSupp = 1;
                            inpFields.Episodes.forEach((elem) => {
                                let data = {
                                    EpisodeId: elem.Id,
                                    Number: elem.Supp ? NumberSupp++ : Number++,
                                    Supp: elem.Supp
                                };
                                if (epi_list[elem.Id]) {
                                    epi_list[elem.Id].deleted = false;
                                    epi_list[elem.Id].data = data;
                                }
                                else
                                    epi_new.push(data);
                            })
                        }

                        return lsn_obj.edit()
                    })
                    .then(() => {

                        if (typeof (inpFields["AuthorId"]) !== "undefined")
                            lsn_obj.authorId(inpFields["AuthorId"]);
                        if (typeof (inpFields["LessonType"]) !== "undefined")
                            lsn_obj.lessonType(inpFields["LessonType"]);
                        if (typeof (inpFields["Cover"]) !== "undefined")
                            lsn_obj.cover(inpFields["Cover"]);
                        if (typeof (inpFields["URL"]) !== "undefined")
                            lsn_obj.uRL(inpFields["URL"]);

                        if (typeof (inpFields["State"]) !== "undefined")
                            lsn_lng_obj.state(inpFields["State"]);
                        if (typeof (inpFields["Name"]) !== "undefined")
                            lsn_lng_obj.name(inpFields["Name"]);
                        if (typeof (inpFields["ShortDescription"]) !== "undefined")
                            lsn_lng_obj.shortDescription(inpFields["ShortDescription"]);
                        if (typeof (inpFields["FullDescription"]) !== "undefined")
                            lsn_lng_obj.fullDescription(inpFields["FullDescription"]);

                        if (typeof (inpFields["State"]) !== "undefined") {
                            ls_course_obj.state(inpFields["State"]);
                            if (lsn_obj.id() === course_id)
                                lsn_lng_obj.state(inpFields["State"]);
                        }
                        if (typeof (inpFields["ReadyDate"]) !== "undefined")
                            ls_course_obj.readyDate(inpFields["ReadyDate"]);
                        
                        for (let key in ch_list)
                            if (ch_list[key].deleted) {
                                if (ch_list[key].isOwner)
                                    needToDeleteOwnCh = true;
                                ch_collection._del(ch_list[key].obj);
                            }
                            else {
                                for (let field in ch_list[key].data)
                                    ch_list[key].obj[self._genGetterName(field)](ch_list[key].data[field]);
                            }

                        for (let key in res_list)
                            if (res_list[key].deleted)
                                res_collection._del(res_list[key].obj)
                            else {
                                for (let field in res_list[key].data.res)
                                    res_list[key].obj[self._genGetterName(field)](res_list[key].data.res[field]);
                                for (let field in res_list[key].data.lng)
                                    res_list[key].lngObj[self._genGetterName(field)](res_list[key].data.lng[field]);
                            }

                        for (let key in ref_list)
                            if (ref_list[key].deleted)
                                ref_collection._del(ref_list[key].obj)
                            else {
                                for (let field in ref_list[key].data)
                                    ref_list[key].obj[self._genGetterName(field)](ref_list[key].data[field]);    
                            }
                        
                        for (let key in epi_list)
                            if (epi_list[key].deleted) {
                                if (epi_list[key].isOwner)
                                    needToDeleteOwn = true;
                                epi_collection._del(epi_list[key].obj);
                            }
                            else {
                                for (let field in epi_list[key].data)
                                    epi_list[key].obj[self._genGetterName(field)](epi_list[key].data[field]);    
                            }
                    })
                    .then(() => {
                        if (ch_new && (ch_new.length > 0)) {
                            return Utils.seqExec(ch_new, (elem) => {
                                return root_ch.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (res_new && (res_new.length > 0)) {
                            return Utils.seqExec(res_new, (elem) => {
                                return root_res.newObject({
                                    fields: elem.res
                                }, opts)
                                    .then((result) => {
                                        let new_res_obj = this._db.getObj(result.newObject);
                                        let root_res_lng = new_res_obj.getDataRoot("ResourceLng");
                                        return root_res_lng.newObject({
                                            fields: elem.lng
                                        }, opts);
                                    });
                            });
                        }
                    })
                    .then(() => {
                        if (ref_new && (ref_new.length > 0)) {
                            return Utils.seqExec(ref_new, (elem) => {
                                return root_ref.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (epi_new && (epi_new.length > 0)) {
                            return Utils.seqExec(epi_new, (elem) => {
                                return root_epi.newObject({
                                    fields: elem
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                                return lsn_obj.save(opts)
                                    .then(() => {
                                        return course_obj.save(opts);
                                    });
                            });
                    })
                    .then(() => {
                        if (needToDeleteOwnCh)
                            return Utils.seqExec(ch_list, (elem) => {
                                let rc = Promise.resolve();
                                if (elem.deleted && elem.isOwner) {
                                    let id = elem.ownObj.id();
                                    let mysql_script = [];
                                    LESSON_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                        mysql_script.push(_.template(elem)({ id: id }));
                                    });
                                    let mssql_script = [];
                                    LESSON_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                        mssql_script.push(_.template(elem)({ id: id }));
                                    });
                                    rc = DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                                }
                                return rc;
                            });
                    })
                    .then(() => {
                        if (needToDeleteOwn)
                            return Utils.seqExec(epi_list, (elem) => {
                                let rc = Promise.resolve();
                                if (elem.deleted && elem.isOwner) {
                                    let id = elem.ownObj.id();
                                    let mysql_script = [];
                                    EPISODE_MYSQL_DELETE_SCRIPT.forEach((elem) => {
                                        mysql_script.push(_.template(elem)({ id: id }));
                                    });
                                    let mssql_script = [];
                                    EPISODE_MSSQL_DELETE_SCRIPT.forEach((elem) => {
                                        mssql_script.push(_.template(elem)({ id: id }));
                                    });
                                    rc = DbUtils.execSqlScript(mysql_script, mssql_script, opts);
                                }
                                return rc;
                            });
                    })
                    .then(() => {
                        console.log("Lesson updated: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (lsn_obj)
                            this._db._deleteRoot(lsn_obj.getRoot());
                        if (isErr) {
                            result = result.then(() => {
                                if (res instanceof Error)
                                    throw res
                                else
                                    throw new Error("Error: " + JSON.stringify(res));
                            });
                        }
                        else
                            result = result.then(() => { return res;})    
                        return result;
                    })
            );
        })
    }

    insert(data, course_id, parent_id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let course_obj;
            let opts = {};
            let newId = null;
            let new_obj = null;
            let new_lng_obj = null;
            let inpFields = data || {};
            let transactionId = null;
            let hasParent = typeof (parent_id) === "number";
            resolve(
                this._getObjById(course_id, COURSE_REQ_TREE)
                    .then((result) => {
                        let collection = result.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + course_id + ") doesn't exist.");
                        course_obj = collection.get(0);

                        return course_obj.edit()
                            .then(() => {
                                return this._getObjById(-1);
                            })
                    })
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { CourseId: course_id };
                        if (typeof (inpFields["AuthorId"]) !== "undefined")
                            fields["AuthorId"] = inpFields["AuthorId"];
                        if (typeof (inpFields["LessonType"]) !== "undefined")
                            fields["LessonType"] = inpFields["LessonType"];
                        if (typeof (inpFields["Cover"]) !== "undefined")
                            fields["Cover"] = inpFields["Cover"];
                        if (typeof (inpFields["URL"]) !== "undefined")
                            fields["URL"] = inpFields["URL"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("LessonLng");

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (typeof (inpFields["State"]) !== "undefined")
                            fields["State"] = inpFields["State"];
                        if (typeof (inpFields["Name"]) !== "undefined")
                            fields["Name"] = inpFields["Name"];
                        if (typeof (inpFields["ShortDescription"]) !== "undefined")
                            fields["ShortDescription"] = inpFields["ShortDescription"];
                        if (typeof (inpFields["FullDescription"]) !== "undefined")
                            fields["FullDescription"] = inpFields["FullDescription"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        new_lng_obj = this._db.getObj(result.newObject);
                        let root_epl = new_obj.getDataRoot("EpisodeLesson");
                        if (inpFields.Episodes && (inpFields.Episodes.length > 0)) {
                            let Number = 1;
                            let NumberSupp = 1;
                            return Utils.seqExec(inpFields.Episodes, (elem) => {
                                let fields = {};
                                if (typeof (elem["Id"]) !== "undefined")
                                    fields["EpisodeId"] = elem["Id"];
                                if (typeof (elem["Supp"]) !== "undefined") {
                                    fields["Supp"] = elem["Supp"];
                                    if (!fields.Supp)
                                        fields.Number = Number++
                                    else
                                        fields.Number = NumberSupp++;
                                }
                                return root_epl.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_ref = new_lng_obj.getDataRoot("Reference");
                        if (inpFields.References && (inpFields.References.length > 0)) {
                            let Number = 1;
                            let NumberRec = 1;
                            return Utils.seqExec(inpFields.References, (elem) => {
                                let fields = {};
                                if (typeof (elem["Description"]) !== "undefined")
                                    fields["Description"] = elem["Description"];
                                if (typeof (elem["URL"]) !== "undefined")
                                    fields["URL"] = elem["URL"];
                                if (typeof (elem["Recommended"]) !== "undefined") {
                                    fields["Recommended"] = elem["Recommended"];
                                    if (!fields.Recommended)
                                        fields.Number = Number++
                                    else
                                        fields.Number = NumberRec++;
                                }
                                if (typeof (elem["AuthorComment"]) !== "undefined")
                                    fields["AuthorComment"] = elem["AuthorComment"];
                                return root_ref.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_res = new_lng_obj.getDataRoot("Resource");
                        if (inpFields.Resources && (inpFields.Resources.length > 0)) {
                            return Utils.seqExec(inpFields.Resources, (elem) => {
                                let fields = { ResType: "P" };
                                if (typeof (elem["ResType"]) !== "undefined")
                                    fields["ResType"] = elem["ResType"];
                                if (typeof (elem["FileName"]) !== "undefined")
                                    fields["FileName"] = elem["FileName"];
                                if (typeof (elem["ResLanguageId"]) !== "undefined")
                                    fields["ResLanguageId"] = elem["ResLanguageId"];
                                return root_res.newObject({
                                    fields: fields
                                }, opts)
                                    .then((result) => {
                                        new_res_obj = this._db.getObj(result.newObject);
                                        let root_res_lng = new_res_obj.getDataRoot("ResourceLng");
                                        let fields = { Name: "", LanguageId: LANGUAGE_ID };
                                        if (typeof (elem["Name"]) !== "undefined")
                                            fields["Name"] = elem["Name"];
                                        if (typeof (elem["Description"]) !== "undefined")
                                            fields["Description"] = elem["Description"];
                                        return root_res_lng.newObject({
                                            fields: fields
                                        }, opts);
                                    });
                            });
                        }
                    })
                    .then(() => {
                        let root_lsn = course_obj.getDataRoot("LessonCourse");
                        let collection = root_lsn.getCol("DataElements");
                        let Number = collection.count() + 1;
                        let parent_lc_id = -1;
                        if (hasParent) {
                            for (let i = 0; i < collection.count(); i++){
                                if (collection.get(i).lessonId() === parent_id) {
                                    parent_lc_id = collection.get(i).id();
                                    break;
                                }
                            }
                            if (parent_lc_id === -1)
                                throw new Error("Parent lesson (Id=" + parent_id + ") doesn't belong to a course (Id=" + course_id + ").");
                            Number = 1;
                            for (let i = 0; i < collection.count(); i++) {
                                if (collection.get(i).parentId() === parent_lc_id)
                                    Number++;
                            }
                        }
                        let fields = { LessonId: newId, State: inpFields.State, Number: Number };
                        if (parent_lc_id !== -1)
                            fields.ParentId = parent_lc_id;
                        if (typeof (inpFields["ReadyDate"]) !== "undefined")
                            fields["ReadyDate"] = inpFields["ReadyDate"];
                        return root_lsn.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        let parent_lc_id = result.keyValue;
                        if ((!hasParent) && inpFields.Childs && (inpFields.Childs.length > 0)) {
                            let Number = 1;
                            let root_lsn = course_obj.getDataRoot("LessonCourse");
                            return Utils.seqExec(inpFields.Childs, (elem) => {
                                let fields = { LessonId: elem.Id, ParentId: parent_lc_id, State: elem.State, Number: Number++ };
                                if (typeof (inpFields["ReadyDate"]) !== "undefined")
                                    fields["ReadyDate"] = inpFields["ReadyDate"];
                                return root_lsn.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        return $data.tranStart({})
                            .then((result) => {
                                transactionId = result.transactionId;
                                opts = { transactionId: transactionId };
                                return root_obj.save(opts);
                            })
                            .then(() => {
                                return course_obj.save(opts);
                            });
                    })
                    .then(() => {
                        console.log("Lesson added: Id=" + newId + ".");
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (course_obj)
                            this._db._deleteRoot(course_obj.getRoot());
                        if (isErr) {
                            result = result.then(() => {
                                if (res instanceof Error)
                                    throw res
                                else
                                    throw new Error("Error: " + JSON.stringify(res));
                            });
                        }
                        else
                            result = result.then(() => { return res; })
                        return result;
                    })
            );
        })
    }
};

let dbLesson = null;
exports.LessonsService = () => {
    return dbLesson ? dbLesson : dbLesson = new DbLesson();
}
