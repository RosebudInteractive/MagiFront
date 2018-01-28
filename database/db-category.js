const { DbObject } = require('./db-object');
const _ = require('lodash');
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

const ACCOUNT_ID = 1;
const LANGUAGE_ID = 1;

const CATEGORY_MSSQL_ALL_REQ =
    "select c.[Id], c.[ParentId], c.[URL], l.[Name], lp.[Name] as [ParentName] from [Category] c\n" +
    "  join [CategoryLng] l on c.[Id] = l.[CategoryId] and l.[LanguageId] = <%= languageId %>\n"+
    "  left join [CategoryLng] lp on c.[ParentId] = lp.[CategoryId] and lp.[LanguageId] = <%= languageId %>\n" +
    "where c.[AccountId] = <%= accountId %>";

const CATEGORY_MYSQL_ALL_REQ =
    "select c.`Id`, c.`ParentId`, c.`URL`, l.`Name`, lp.`Name` as `ParentName` from `Category` c\n" +
    "  join `CategoryLng` l on c.`Id` = l.`CategoryId` and l.`LanguageId` = <%= languageId %>\n" +
    "  left join `CategoryLng` lp on c.`ParentId` = lp.`CategoryId` and lp.`LanguageId` = <%= languageId %>\n" +
    "where c.`AccountId` = <%= accountId %>";

const CATEGORY_MSSQL_ID_REQ = CATEGORY_MSSQL_ALL_REQ + " and c.[Id] = <%= id %>";
const CATEGORY_MYSQL_ID_REQ = CATEGORY_MYSQL_ALL_REQ + " and c.`Id` = <%= id %>";

const DbCategory = class DbCategory extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression) {
        var exp = expression || CATEGORY_REQ_TREE;
        return super._getObjById(id, exp);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(CATEGORY_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID }),
                        mssql: _.template(CATEGORY_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID })
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
                        mysql: _.template(CATEGORY_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(CATEGORY_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id })
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
                        console.log("Category deleted: Id=" + id + ".");
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
            let ctg_obj;
            let ctg_lng_obj;
            let opts = {};
            let newId = null;
            let inpFields = data || {};
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
                        if (inpFields["ParentId"])
                            ctg_obj.parentId(inpFields["ParentId"]);
                        if (inpFields["URL"])
                            ctg_obj.uRL(inpFields["URL"]);
                        if (inpFields["Name"])
                            ctg_lng_obj.name(inpFields["Name"]);
                        return ctg_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Category updated: Id=" + id + ".");
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (ctg_obj)
                            this._db._deleteRoot(ctg_obj.getRoot());
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

    insert(data) {
        return new Promise((resolve, reject) => {
            let root_obj;
            let opts = {};
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
                        if (inpFields["ParentId"])
                            fields["ParentId"] = inpFields["ParentId"];
                        if (inpFields["URL"])
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
                        if (inpFields["Name"])
                            fields["Name"] = inpFields["Name"];

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Category added: Id=" + newId + ".");
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

let dbCategory = null;
exports.CategoriesService = () => {
    return dbCategory ? dbCategory : dbCategory = new DbCategory();
}
