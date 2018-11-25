const { DbObject } = require('./db-object');
const _ = require('lodash');
const config = require('config');
const { getTimeStr, buildLogString } = require('../utils');
const logModif = config.has("admin.logModif") ? config.get("admin.logModif") : false;

const LANGUAGE_REQ_TREE = {
    expr: {
        model: {
            name: "Language"
        }
    }
};

const LANGUAGE_MSSQL_ALL_REQ =
    "select [Id], [Code], [ShortName], [LangTag], [Language] from [Language]";

const LANGUAGE_MYSQL_ALL_REQ =
    "select `Id`, `Code`, `ShortName`, `LangTag`, `Language` from `Language`";

const LANGUAGE_MSSQL_ID_REQ = LANGUAGE_MSSQL_ALL_REQ + "\nwhere [Id] = <%= id %>";
const LANGUAGE_MYSQL_ID_REQ = LANGUAGE_MYSQL_ALL_REQ + "\nwhere `Id` = <%= id %>";

const DbLanguage = class DbLanguage extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression) {
        var exp = expression || LANGUAGE_REQ_TREE;
        return super._getObjById(id, exp);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: LANGUAGE_MYSQL_ALL_REQ,
                        mssql: LANGUAGE_MSSQL_ALL_REQ
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
                        mysql: _.template(LANGUAGE_MYSQL_ID_REQ)({ id: id }),
                        mssql: _.template(LANGUAGE_MSSQL_ID_REQ)({ id: id })
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
                            throw new Error("Language (Id = " + id + ") doesn't exist.");
                        return result.edit()
                    })
                    .then(() => {
                        collection._del(collection.get(0));
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Language deleted: Id="${id}".`));
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

    update(id, data) {
        return new Promise((resolve, reject) => {
            let lng_obj;
            let opts = {};
            let newId = null;
            let inpFields = data || {};
            resolve(
                this._getObjById(id)
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Language (Id = " + id + ") doesn't exist.");
                        lng_obj = collection.get(0);
                        return lng_obj.edit()
                    })
                    .then(() => {
                        if (inpFields["Code"])
                            lng_obj.code(inpFields["Code"]);
                        if (inpFields["Language"])
                            ctg_lng_obj.language(inpFields["Language"]);
                        return lng_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Language updated: Id="${id}".`));
                        return { result: "OK" };
                    })
                    .finally((isErr, res) => {
                        if (lng_obj)
                            this._db._deleteRoot(lng_obj.getRoot());
                        if (isErr)
                            throw res;
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
                        let fields = {};
                        if (inpFields["Code"])
                            fields["Code"] = inpFields["Code"];
                        if (inpFields["Language"])
                            fields["Language"] = inpFields["Language"];
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        if (logModif)
                            console.log(buildLogString(`Language added: Id="${newId}".`));
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

let dbLanguage = null;
exports.LanguagesService = () => {
    return dbLanguage ? dbLanguage : dbLanguage = new DbLanguage();
}
