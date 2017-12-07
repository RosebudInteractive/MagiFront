const { DbObject } = require('./db-object');
const _ = require('lodash');
const AUTHOR_REQ_TREE = {
    expr: {
        model: {
            name: "Author",
            childs: [
                {
                    dataObject: {
                        name: "AuthorLng"
                    }
                }
            ]
        }
    }
};

const ACCOUNT_ID = 1;
const LANGUAGE_ID = 1;

const AUTHOR_MSSQL_ALL_REQ =
    "select a.[Id], l.[FirstName], l.[LastName], a.[Portrait], l.[Description] from [Author] a\n" +
    "  join [AuthorLng] l on a.[Id] = l.[AuthorId] and a.[AccountId] = <%= accountId %> and l.[LanguageId] = <%= languageId %>";

const AUTHOR_MYSQL_ALL_REQ =
    "select a.`Id`, l.`FirstName`, l.`LastName`, a.`Portrait`, l.`Description` from `Author` a\n" +
    "  join `AuthorLng` l on a.`Id` = l.`AuthorId` and a.`AccountId` = <%= accountId %> and l.`LanguageId` = <%= languageId %>";

const AUTHOR_MSSQL_ID_REQ = AUTHOR_MSSQL_ALL_REQ + "\nwhere a.[Id] = <%= id %>";
const AUTHOR_MYSQL_ID_REQ = AUTHOR_MYSQL_ALL_REQ + "\nwhere a.`Id` = <%= id %>";

exports.AuthorsService = class DbAuthor extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression) {
        var exp = expression || AUTHOR_REQ_TREE;
        return super._getObjById(id, exp);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(AUTHOR_MYSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID }),
                        mssql: _.template(AUTHOR_MSSQL_ALL_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID })
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
                        mysql: _.template(AUTHOR_MYSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id }),
                        mssql: _.template(AUTHOR_MSSQL_ID_REQ)({ accountId: ACCOUNT_ID, languageId: LANGUAGE_ID, id: id })
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
                            throw new Error("Author (Id = " + id + ") doesn't exist.");
                        return result.edit()
                    })
                    .then(() => {
                        collection._del(collection.get(0));
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Author deleted: Id=" + id + ".");
                        return { result: "OK" };
                    })
            );
        })
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            let auth_obj;
            let auth_lng_obj;
            let opts = {};
            let newId = null;
            let inpFields = data || {};
            resolve(
                this._getObjById(id)
                    .then((result) => {
                        let root_obj = result;
                        let collection = root_obj.getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Author (Id = " + id + ") doesn't exist.");
                        auth_obj = collection.get(0);
                        collection = auth_obj.getDataRoot("AuthorLng").getCol("DataElements");
                        if (collection.count() != 1)
                            throw new Error("Author (Id = " + id + ") has inconsistent \"LNG\" part.");
                        auth_lng_obj = collection.get(0);
                        return auth_obj.edit()
                    })
                    .then(() => {
                        let fields = { AccountId: ACCOUNT_ID };
                        if (inpFields["Portrait"])
                            auth_obj.portrait(inpFields["Portrait"]);
                        if (inpFields["FirstName"])
                            auth_lng_obj.firstName(inpFields["FirstName"]);
                        if (inpFields["LastName"])
                            auth_lng_obj.lastName(inpFields["LastName"]);
                        if (inpFields["Description"])
                            auth_lng_obj.description(inpFields["Description"]);
                        return auth_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Author updated: Id=" + id + ".");
                        return { result: "OK" };
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
                        if (inpFields["Portrait"])
                            fields["Portrait"] = inpFields["Portrait"];    
                        return root_obj.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then((result) => {
                        newId = result.keyValue;
                        let new_obj = this._db.getObj(result.newObject);
                        let root_lng = new_obj.getDataRoot("AuthorLng");

                        let fields = { LanguageId: LANGUAGE_ID };
                        if (inpFields["FirstName"])
                            fields["FirstName"] = inpFields["FirstName"];    
                        if (inpFields["LastName"])
                            fields["LastName"] = inpFields["LastName"];    
                        if (inpFields["Description"])
                            fields["Description"] = inpFields["Description"];    

                        return root_lng.newObject({
                            fields: fields
                        }, opts);
                    })
                    .then(() => {
                        return root_obj.save(opts);
                    })
                    .then(() => {
                        console.log("Author added: Id=" + newId + ".");
                        return { id: newId };
                    })
            );
        })
    }
}
