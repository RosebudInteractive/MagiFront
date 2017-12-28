const { DbObject } = require('./db-object');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const _ = require('lodash');

const COURSE_REQ_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "CourseLng"
                    }
                },
                {
                    dataObject: {
                        name: "CourseCategory"
                    }
                },
                {
                    dataObject: {
                        name: "LessonCourse"
                    }
                },
                {
                    dataObject: {
                        name: "AuthorToCourse"
                    }
                }
            ]
        }
    }
};

const COURSE_UPD_TREE = {
    expr: {
        model: {
            name: "Course",
            childs: [
                {
                    dataObject: {
                        name: "Lesson",
                        childs: [
                            {
                                dataObject: {
                                    name: "EpisodeLesson"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
                        name: "CourseLng"
                    }
                },
                {
                    dataObject: {
                        name: "CourseCategory"
                    }
                },
                {
                    dataObject: {
                        name: "LessonCourse"
                    }
                },
                {
                    dataObject: {
                        name: "AuthorToCourse"
                    }
                }
            ]
        }
    }
};

const ACCOUNT_ID = 1;
const LANGUAGE_ID = 1;

const COURSE_MSSQL_ALL_REQ =
    "select c.[Id], c.[Color], c.[Cover], c.[State], c.[LanguageId], l.[Language] as [LanguageName], c.[URL], cl.[Name], cl.[Description] from [Course] c\n" +
    "  join [CourseLng] cl on c.[Id] = cl.[CourseId] and c.[AccountId] = <%= accountId %> and cl.[LanguageId] = <%= languageId %>\n" +
    "  left join [Language] l on c.[LanguageId] = l.[Id]";

const COURSE_MYSQL_ALL_REQ =
    "select c.`Id`, c.`Color`, c.`Cover`, c.`State`, c.`LanguageId`, l.`Language` as `LanguageName`, c.`URL`, cl.`Name`, cl.`Description` from `Course` c\n" +
    "  join `CourseLng` cl on c.`Id` = cl.`CourseId` and c.`AccountId` = <%= accountId %> and cl.`LanguageId` = <%= languageId %>\n" +
    "  left join `Language` l on c.`LanguageId` = l.`Id`";

const COURSE_MSSQL_ID_REQ = COURSE_MSSQL_ALL_REQ + "\nwhere c.[Id] = <%= id %>";
const COURSE_MYSQL_ID_REQ = COURSE_MYSQL_ALL_REQ + "\nwhere c.`Id` = <%= id %>";

const COURSE_MSSQL_AUTHOR_REQ =
    "select a.[Id], l.[FirstName], l.[LastName] from [AuthorToCourse] ac\n" +
    "  join [Author] a on a.[Id] = ac.[AuthorId]\n" +
    "  join [AuthorLng] l on a.[Id] = l.[AuthorId] and l.[LanguageId] = <%= languageId %>\n" +
    "where ac.[CourseId] = <%= id %>";
const COURSE_MSSQL_CATEGORY_REQ =
    "select [CategoryId] as [Id] from [CourseCategory] where [CourseId] = <%= id %>";
const COURSE_MSSQL_LESSON_REQ =
    "select ls.[Id], lsl.[Name], lsl.[ShortDescription], lsl.[FullDescription], lc.[Number], lc.[ReadyDate], lc.[State], l.[Language] as [LanguageName] from [Lesson] ls\n" +
    "  join [LessonLng] lsl on ls.[Id] = lsl.[LessonId]\n" +
    "  join [Language] l on lsl.[LanguageId] = l.[Id]\n" +
    "  join [LessonCourse] lc on lc.[LessonId] = ls.[Id]\n" +
    "where (lc.[CourseId] = <%= id %>) and (lc.[ParentId] is NULL)\n"+
    "order by lc.[Number]";

const COURSE_MYSQL_AUTHOR_REQ =
    "select a.`Id`, l.`FirstName`, l.`LastName` from `AuthorToCourse` ac\n" +
    "  join `Author` a on a.`Id` = ac.`AuthorId`\n" +
    "  join `AuthorLng` l on a.`Id` = l.`AuthorId` and l.`LanguageId` = <%= languageId %>\n" +
    "where ac.`CourseId` = <%= id %>";
const COURSE_MYSQL_CATEGORY_REQ =
    "select `CategoryId` as `Id` from `CourseCategory` where `CourseId` = <%= id %>";
const COURSE_MYSQL_LESSON_REQ =
    "select ls.`Id`, lc.`CourseId`, lsl.`Name`, lsl.`ShortDescription`, lsl.`FullDescription`, lc.`Number`, lc.`ReadyDate`, lc.`State`, l.`Language` as `LanguageName` from `Lesson` ls\n" +
    "  join `LessonLng` lsl on ls.`Id` = lsl.`LessonId`\n" +
    "  join `Language` l on lsl.`LanguageId` = l.`Id`\n" +
    "  join `LessonCourse` lc on lc.`LessonId` = ls.`Id`\n" +
    "where (lc.`CourseId` = <%= id %>) and (lc.`ParentId` is NULL)\n" +
    "order by lc.`Number`";

const DbCourse = class DbCourse extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression) {
        var exp = expression || COURSE_REQ_TREE;
        return super._getObjById(id, exp);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID }),
                        mssql: _.template(COURSE_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID })
                    }
                }, {})
                    .then((result) => {
                        return result.detail;
                    })
            );
        })
    }

    getAuthors(id) {
        let course = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ languageId:LANGUAGE_ID, id: id }),
                        mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id })
                    }
                }, {})
                .then((result) => {
                    let authors = [];
                    if (result && result.detail && (result.detail.length > 0))
                        authors = result.detail;
                    return authors;
                })
            );    
        })
    }

    get(id) {
        let course = {};
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(COURSE_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(COURSE_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        if (result && result.detail && (result.detail.length === 1))
                            course = result.detail[0];
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id }),
                                mssql: _.template(COURSE_MSSQL_AUTHOR_REQ)({ languageId: LANGUAGE_ID, id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let authors = [];
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach(function(element) {
                                authors.push(element.Id);
                            });
                        }
                        course.Authors = authors;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_CATEGORY_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_CATEGORY_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        let categories = [];
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach(function (element) {
                                categories.push(element.Id);
                            });
                        }
                        course.Categories = categories;
                        return $data.execSql({
                            dialect: {
                                mysql: _.template(COURSE_MYSQL_LESSON_REQ)({ id: id }),
                                mssql: _.template(COURSE_MSSQL_LESSON_REQ)({ id: id })
                            }
                        }, {});
                    })
                    .then((result) => {
                        course.Lessons = [];
                        if (result && result.detail && (result.detail.length > 0))
                            course.Lessons = result.detail;
                        return course;
                    })
            );
        })
    }

    del(id) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let newId = null;
            let collection = null;
            resolve(
                this._getObjById(id, {
                    expr: {
                        model: {
                            name: "Course",
                            childs: [
                                {
                                    dataObject: {
                                        name: "Lesson",
                                        childs: [
                                            {
                                                dataObject: {
                                                    name: "EpisodeLesson"
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    dataObject: {
                                        name: "LessonCourse"
                                    }
                                }
                            ]
                        }
                    }
                })
                .then((result) => {
                    root_obj = result;
                    collection = root_obj.getCol("DataElements");
                    if (collection.count() != 1)
                        throw new Error("Course (Id = " + id + ") doesn't exist.");
                    return result.edit()
                })
                .then(() => {
                    collection._del(collection.get(0));
                    return root_obj.save(opts);
                })
                .then(() => {
                    console.log("Course deleted: Id=" + id + ".");
                    return { result: "OK" };
                })
                .finally((isErr, res) => {
                    if (root_obj)
                        this._db._deleteRoot(root_obj.getRoot());
                    if (isErr)
                        if (res instanceof Error)
                            throw res
                        else
                            throw new Error("Error: " + JSON.stringify(res));
                    return res;
                })
            );
        })
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            let crs_obj;
            let crs_lng_obj;
            let root_auth;
            let root_ctg;
            let root_ls;
            let auth_collection;
            let ls_collection;
            let ls_own_collection;
            let ctg_collection;
            let auth_list = {};
            let ctg_list = {};
            let ls_list = {};
            let opts = {};
            let inpFields = data || {};
            
            let auth_new = [];
            let ctg_new = [];
            let ls_new = [];

            let needToDeleteOwn = false;
            let transactionId = null;

            resolve(
                this._getObjById(id, COURSE_UPD_TREE)
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + id + ") doesn't exist.");
                        crs_obj = collection.get(0);
                        collection = crs_obj.getDataRoot("CourseLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Course (Id = " + id + ") has inconsistent \"LNG\" part.");
                        crs_lng_obj = collection.get(0);

                        root_auth = crs_obj.getDataRoot("AuthorToCourse");
                        auth_collection = root_auth.getCol("DataElements");
                        root_ctg = crs_obj.getDataRoot("CourseCategory");
                        ctg_collection = root_ctg.getCol("DataElements");
                        root_ls = crs_obj.getDataRoot("LessonCourse");
                        ls_collection = root_ls.getCol("DataElements");
                        ls_own_collection = crs_obj.getDataRoot("Lesson").getCol("DataElements");

                        if (inpFields.Authors && (inpFields.Authors.length > 0)) {
                            for (let i = 0; i < auth_collection.count(); i++) {
                                let obj = auth_collection.get(i);
                                auth_list[obj.authorId()] = { deleted: true, obj: obj };
                            }

                            inpFields.Authors.forEach((elem) => {
                                if (auth_list[elem])
                                    delete auth_list[elem]
                                else
                                    auth_new.push(elem);
                            })
                        }

                        if (inpFields.Categories && (inpFields.Categories.length > 0)) {
                            for (let i = 0; i < ctg_collection.count(); i++) {
                                let obj = ctg_collection.get(i);
                                ctg_list[obj.categoryId()] = { deleted: true, obj: obj };
                            }

                            inpFields.Categories.forEach((elem) => {
                                if (ctg_list[elem])
                                    delete ctg_list[elem]
                                else
                                    ctg_new.push(elem);
                            })
                        }

                        if (inpFields.Lessons && (inpFields.Lessons.length > 0)) {
                            for (let i = 0; i < ls_collection.count(); i++) {
                                let obj = ls_collection.get(i);
                                ls_list[obj.lessonId()] = { deleted: true, isOwner: false, obj: obj };
                            }

                            for (let i = 0; i < ls_own_collection.count(); i++) {
                                let obj = ls_own_collection.get(i);
                                if (!ls_list[obj.id()])
                                    throw new Error("Unknown own lesson (Id = " + obj.id() + ").");
                                ls_list[obj.id()].isOwner = true;
                                ls_list[obj.id()].ownObj = obj;
                            }

                            let Number = 1;
                            inpFields.Lessons.forEach((elem) => {
                                let data = {
                                    LessonId: elem.LessonId,
                                    Number: Number++,
                                    ReadyDate: elem.ReadyDate ? elem.ReadyDate : null,
                                    State: elem.State
                                };
                                if (ls_list[elem.LessonId]) {
                                    ls_list[elem.LessonId].deleted = false;
                                    ls_list[elem.LessonId].data = data;
                                }
                                else
                                    ls_new.push(data);
                            })
                        }

                        return crs_obj.edit()
                    })
                    .then(() => {

                        if (inpFields["Color"])
                            crs_obj.color(inpFields["Color"]);
                        if (inpFields["Cover"])
                            crs_obj.cover(inpFields["Cover"]);
                        if (inpFields["State"])
                            crs_obj.state(inpFields["State"]);
                        if (inpFields["LanguageId"])
                            crs_obj.languageId(inpFields["LanguageId"]);
                        if (inpFields["URL"])
                            crs_obj.uRL(inpFields["URL"]);

                        crs_obj.oneLesson(false);
                        if (typeof (inpFields["OneLesson"]) === "boolean")
                            crs_obj.oneLesson(inpFields["OneLesson"]);
                        
                        if (inpFields["State"])
                            crs_lng_obj.state(inpFields["State"] === "P" ? "R" : inpFields["State"]);
                        if (inpFields["Name"])
                            crs_lng_obj.name(inpFields["Name"]);
                        if (inpFields["Description"])
                            crs_lng_obj.description(inpFields["Description"]);

                        for (let key in auth_list)
                            auth_collection._del(auth_list[key].obj);
                        
                        for (let key in ctg_list)
                            ctg_collection._del(ctg_list[key].obj);

                        for (let key in ls_list)
                            if (ls_list[key].deleted) {
                                if (ls_list[key].isOwner)
                                    needToDeleteOwn = true
                                ls_collection._del(ls_list[key].obj);
                            }
                            else {
                                ls_list[key].obj.number(ls_list[key].data.Number);
                                ls_list[key].obj.readyDate(ls_list[key].data.ReadyDate);
                                ls_list[key].obj.state(ls_list[key].data.State);
                            }
                    })
                    .then(() => {
                        if (auth_new && (auth_new.length > 0)) {
                            return Utils.seqExec(auth_new, (elem) => {
                                return root_auth.newObject({
                                    fields: { AuthorId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (ctg_new && (ctg_new.length > 0)) {
                            return Utils.seqExec(ctg_new, (elem) => {
                                return root_ctg.newObject({
                                    fields: { CategoryId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        if (ls_new && (ls_new.length > 0)) {
                            return Utils.seqExec(ls_new, (elem) => {
                                let fields = { LessonId: elem.LessonId, State: elem.State, Number: elem.Number };
                                if (elem["ReadyDate"])
                                    fields["ReadyDate"] = elem["ReadyDate"];
                                return root_ls.newObject({
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
                                return crs_obj.save(opts);
                            });
                    })
                    .then(() => {
                        if (needToDeleteOwn)
                            return crs_obj.edit();
                    })
                    .then(() => {
                        if (needToDeleteOwn) {
                            for (let key in ls_list)
                                if (ls_list[key].deleted) {
                                    if (ls_list[key].isOwner)
                                        ls_own_collection._del(ls_list[key].ownObj);
                                }
                            return crs_obj.save(opts);
                        }
                    })
                    .then(() => {
                        console.log("Course updated: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        let result = transactionId ?
                            (isErr ? $data.tranRollback(transactionId) : $data.tranCommit(transactionId)) : Promise.resolve();
                        if (crs_obj)
                            this._db._deleteRoot(crs_obj.getRoot());
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

    insert(data) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
            let newId = null;
            let new_obj = null;
            let inpFields = data || {};
            resolve(
                this._getObjById(-1)
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { AccountId: ACCOUNT_ID };
                        if (inpFields["Color"])
                            fields["Color"] = inpFields["Color"];
                        if (inpFields["Cover"])
                            fields["Cover"] = inpFields["Cover"];
                        if (inpFields["State"])
                            fields["State"] = inpFields["State"];
                        if (inpFields["LanguageId"])
                            fields["LanguageId"] = inpFields["LanguageId"];
                        if (inpFields["URL"])
                            fields["URL"] = inpFields["URL"];
                        fields["OneLesson"] = false;
                        if (typeof (inpFields["OneLesson"]) === "boolean")
                            fields["OneLesson"] = inpFields["OneLesson"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("CourseLng");

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (inpFields["State"])
                            fields["State"] = inpFields["State"] === "P" ? "R" : inpFields["State"];

                        if (inpFields["Name"])
                            fields["Name"] = inpFields["Name"];
                        if (inpFields["Description"])
                            fields["Description"] = inpFields["Description"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        let root_auth = new_obj.getDataRoot("AuthorToCourse");
                        if (inpFields.Authors && (inpFields.Authors.length > 0)) {
                            return Utils.seqExec(inpFields.Authors, (elem) => {
                                return root_auth.newObject({
                                    fields: { AuthorId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_ctg = new_obj.getDataRoot("CourseCategory");
                        if (inpFields.Categories && (inpFields.Categories.length > 0)) {
                            return Utils.seqExec(inpFields.Categories, (elem) => {
                                return root_ctg.newObject({
                                    fields: { CategoryId: elem }
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        let root_lsn = new_obj.getDataRoot("LessonCourse");
                        if (inpFields.Lessons && (inpFields.Lessons.length > 0)) {
                            let Number = 1;
                            return Utils.seqExec(inpFields.Lessons, (elem) => {
                                let fields = { LessonId: elem.LessonId, State: elem.State, Number: Number++ };
                                if (elem["ReadyDate"])
                                    fields["ReadyDate"] = elem["ReadyDate"];
                                return root_lsn.newObject({
                                    fields: fields
                                }, opts);
                            });
                        }
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Course added: Id=" + newId + ".");
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            if (res instanceof Error)
                                throw res
                            else
                                throw new Error("Error: " + JSON.stringify(res));
                        return res;
                    })
            );
        })
    }
};

let dbCourse = null;
exports.CoursesService = () => {
    return dbCourse ? dbCourse : dbCourse = new DbCourse();
}
