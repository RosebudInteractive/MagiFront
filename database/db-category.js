const _ = require('lodash');
const config = require('config');
const { DbObject } = require('./db-object');
const { LANGUAGE_ID, ACCOUNT_ID } = require('../const/sql-req-common');
const { getTimeStr, buildLogString } = require('../utils');
const { splitArray } = require('../utils');
const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;

const CATEGORY_REQ_TREE = {
    expr: {
        model: {
            name: "Category",
            childs: [
                {
                    dataObject: {
                        name: "CategoryLng"
                    }
                }
            ]
        }
    }
};

const CATEGORY_MSSQL_ALL_REQ =
    "select c.[Id], c.[ParentId], c.[URL], l.[Name], lp.[Name] as [ParentName] from [Category] c\n" +
    "  join [CategoryLng] l on c.[Id] = l.[CategoryId]\n"+
    "  left join [CategoryLng] lp on c.[ParentId] = lp.[CategoryId] and lp.[LanguageId] = l.[LanguageId]\n" +
    "where c.[AccountId] = <%= accountId %>";

const CATEGORY_MYSQL_ALL_REQ =
    "select c.`Id`, c.`ParentId`, c.`URL`, l.`Name`, lp.`Name` as `ParentName` from `Category` c\n" +
    "  join `CategoryLng` l on c.`Id` = l.`CategoryId`\n" +
    "  left join `CategoryLng` lp on c.`ParentId` = lp.`CategoryId` and lp.`LanguageId` = l.`LanguageId`\n" +
    "where c.`AccountId` = <%= accountId %>";

const GET_CATEGORIES_BY_COURSE_IDS_MSSQL =
    "select c.[Id], cc.[CourseId], c.[URL], cl.[Name] from [Category] c\n" +
    "  join[CategoryLng] cl on cl.[CategoryId] = c.[Id]\n" +
    "  join[CourseCategory] cc on cc.[CategoryId] = c.[Id]\n" +
    "where cc.[CourseId] in (<%= courseIds %>)";

const GET_CATEGORIES_BY_COURSE_IDS_MYSQL =
    "select c.`Id`, cc.`CourseId`, c.`URL`, cl.`Name` from `Category` c\n" +
    "  join`CategoryLng` cl on cl.`CategoryId` = c.`Id`\n" +
    "  join`CourseCategory` cc on cc.`CategoryId` = c.`Id`\n" +
    "where cc.`CourseId` in (<%= courseIds %>)";

const CATEGORY_MSSQL_ID_REQ = CATEGORY_MSSQL_ALL_REQ + " and c.[Id] = <%= id %>";
const CATEGORY_MYSQL_ID_REQ = CATEGORY_MYSQL_ALL_REQ + " and c.`Id` = <%= id %>";
const MAX_COURSES_REQ_NUM = 10;

const { ElasticConWrapper } = require('./providers/elastic/elastic-connections');
const { IdxCourseService } = require('./elastic/indices/idx-course');

const DbCategory = class DbCategory extends DbObject {

    constructor(options) {
        super(options);
    }

    async _updateSearchIndex(id) {
        let result = ElasticConWrapper(async conn => {
            await IdxCourseService().importData(conn, { categoryId: id, page: 10, refresh: "true" });
        }, true);
        return result;
    }

    _getObjById(id, expression, options) {
        var exp = expression || CATEGORY_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    async getCourseCategories(courseIds, isAbsPath, dbOpts) {
        let arrayOfIds = splitArray(courseIds, MAX_COURSES_REQ_NUM);
        let result = { Categories: {}, Courses: {} };
        for (let i = 0; i < arrayOfIds.length; i++) {
            let cats = await this.reqCourseCategories(arrayOfIds[i], dbOpts);
            if (cats && cats.detail && (cats.detail.length > 0)) {
                cats.detail.forEach((elem) => {
                    let category = {
                        Id: elem.Id,
                        URL: isAbsPath ? this._absCategoryUrl + elem.URL : elem.URL,
                        Name: elem.Name
                    };
                    result.Categories[elem.Id] = category;
                    let course = result.Courses[elem.CourseId];
                    if (!course)
                        result.Courses[elem.CourseId] = course = { Categories: [] };
                    course.Categories.push(elem.Id);
                })
            }
        }
        return result;
    }

    async reqCourseCategories(course_ids, dbOpts) {
        return $data.execSql({
            dialect: {
                mysql: _.template(GET_CATEGORIES_BY_COURSE_IDS_MYSQL)({ courseIds: course_ids.join() }),
                mssql: _.template(GET_CATEGORIES_BY_COURSE_IDS_MSSQL)({ courseIds: course_ids.join() })
            }
        }, dbOpts ? dbOpts : {});
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(CATEGORY_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID }),
                        mssql: _.template(CATEGORY_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID })
                    }
                }, {})
                    .then((result) => {
                        return result.detail;
                    })
            );
        })
    }

    get(id) {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(CATEGORY_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id }),
                        mssql: _.template(CATEGORY_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, id: id })
                    }
                }, {})
                    .then((result) => {
                        let author = {};
                        if (result && result.detail && (result.detail.length === 1))
                            author = result.detail[0];
                        return author;
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
                this._getObjById(id)
                    .then((result) => {
                        root_obj = result;
                        collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Category (Id = " + id + ") doesn't exist.");
                        return result.edit()
                    })
                    .then(() => {
                        collection._del(collection.get(0));
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Category deleted: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            throw res;
                        return res;
                    })
            );
        })
    }

    update(id, data, options) {
        return new Promise((resolve, reject) => {
            let ctg_obj;
            let ctg_lng_obj;
            let opts = options || {};
            let inpFields = data || {};
            let isNameChanged = false;
            let make_name = () => {
                return `${ctg_lng_obj.name()}|${ctg_obj.uRL()}`
            };
            resolve(
                this._getObjById(id)
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Category (Id = " + id + ") doesn't exist.");
                        ctg_obj = collection.get(0);
                        collection = ctg_obj.getDataRoot("CategoryLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Category (Id = " + id + ") has inconsistent \"LNG\" part.");
                        ctg_lng_obj = collection.get(0);
                        return ctg_obj.edit()
                    })
                    .then(() => {
                        let old_name = make_name();
                        if (typeof (inpFields["ParentId"]) !== "undefined")
                            ctg_obj.parentId(inpFields["ParentId"]);
                        if (typeof (inpFields["URL"]) !== "undefined")
                            ctg_obj.uRL(inpFields["URL"]);
                        if (typeof (inpFields["Name"]) !== "undefined")
                            ctg_lng_obj.name(inpFields["Name"]);
                        isNameChanged = old_name !== make_name();
                        return ctg_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Category updated: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (ctg_obj)
                            this._db._deleteRoot(ctg_obj.getRoot());
                        if (isErr)
                            throw res;
                        return res;
                    })
                    .then(async (result) => {
                        if (isNameChanged)
                            await this._updateSearchIndex(id);
                        return result;
                    })
            );
        })
    }

    insert(data, options) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = options || {};
            let newId = null;
            let inpFields = data || {};
            resolve(
                this._getObjById(-1)
                    .then((result) => {
                        root_obj = result;
                        return result.edit()
                    })
                    .then(() => {
                        let fields = { AccountId: ACCOUNT_ID };
                        if (typeof (inpFields["ParentId"]) !== "undefined")
                            fields["ParentId"] = inpFields["ParentId"];
                        if (typeof (inpFields["URL"]) !== "undefined")
                            fields["URL"] = inpFields["URL"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        let new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("CategoryLng");

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (typeof (inpFields["LanguageId"]) !== "undefined")
                            fields["LanguageId"] = inpFields["LanguageId"];
                        if (typeof (inpFields["Name"]) !== "undefined")
                            fields["Name"] = inpFields["Name"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Category added: Id="${newId}".`));
                        return { id: newId };
                    })
                    .finally((isErr, res) => {
                        if (root_obj)
                            this._db._deleteRoot(root_obj.getRoot());
                        if (isErr)
                            throw res;
                        return res;
                    })
            );
        })
    }
};

let dbCategory = null;
exports.CategoriesService = () => {
    return dbCategory ? dbCategory : dbCategory = new DbCategory();
}
