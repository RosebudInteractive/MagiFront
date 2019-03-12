'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const { PartnerLink } = require('../utils/partner-link');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const BOOK_REQ_TREE = {
    expr: {
        model: {
            name: "Book",
            childs: [
                {
                    dataObject: {
                        name: "BookAuthor"
                    }
                }
            ]
        }
    }
};

const GET_BOOKS_MSSQL =
    "select b.[Id], b.[Name], b.[Description], b.[CourseId], b.[OtherAuthors], b.[OtherCAuthors],\n" +
    "  b.[Cover], b.[CoverMeta], b.[Order], b.[ExtLinks], a.[Id] as [AId], a.[AuthorId], a.[Tp], a.[TpView]\n" +
    "from[Book] b\n" +
    "  left join[BookAuthor] a on a.[BookId] = b.[Id]\n" +
    "order by b.[Order]";

const GET_BOOKS_MYSQL =
    "select b.`Id`, b.`Name`, b.`Description`, b.`CourseId`, b.`OtherAuthors`, b.`OtherCAuthors`,\n" +
    "  b.`Cover`, b.`CoverMeta`, b.`Order`, b.`ExtLinks`, a.`Id` as `AId`, a.`AuthorId`, a.`Tp`, a.`TpView`\n" +
    "from`Book` b\n" +
    "  left join`BookAuthor` a on a.`BookId` = b.`Id`\n" +
    "order by b.`Order`";

const DbBook = class DbBook extends DbObject {

    constructor(options) {
        super(options);
        this._partnerLink = new PartnerLink();
    }

    _getObjById(id, expression, options) {
        var exp = expression || BOOK_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    get(id, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        return new Promise(resolve => {
            let rc = $data.execSql({
                dialect: {
                    mysql: _.template(GET_BOOKS_MYSQL)(),
                    mssql: _.template(GET_BOOKS_MSSQL)()
                }
            }, dbOpts);
            resolve(rc);
        })
            .then(result => {
                let books = [];
                if (result && result.detail && (result.detail.length > 0)) {
                    let book;
                    let currId = -1;
                    result.detail.forEach(elem => {
                        if (currId !== elem.Id) {
                            currId = elem.Id;
                            book = {};
                            books.push(book);
                            book.Id = elem.Id;
                            book.Name = elem.Name;
                            book.Description = elem.Description;
                            book.CourseId = elem.CourseId;
                            book.OtherAuthors = elem.OtherAuthors;
                            book.OtherCAuthors = elem.OtherCAuthors;
                            book.Cover = elem.Cover;
                            book.CoverMeta = elem.CoverMeta;
                            book.Order = elem.Order;
                            book.ExtLinks = elem.ExtLinks;
                            book.Authors = [];
                        }
                        if (typeof (elem.AId) === "number")
                            book.Authors.push({
                                Id: elem.AId,
                                AuthorId: elem.AuthorId,
                                Tp: elem.Tp,
                                TpView: elem.TpView
                            });
                    })
                }
                return books;
            });
    }

    async _addNewAuthor(book, data, dbOpts) {
        let root = book.getDataRoot("BookAuthor");
        return Utils.seqExec(data, (elem) => {
            let fields = { Tp: 1, TpView: 1 };
            if (typeof (elem.AuthorId) !== "undefined")
                fields.AuthorId = elem.AuthorId;
            if (typeof (elem.Tp) !== "undefined")
                fields.Tp = elem.Tp;
            if (typeof (elem.TpView) !== "undefined")
                fields.TpView = elem.TpView;
            return root.newObject({
                fields: fields
            }, dbOpts);
        });
    }

    update(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let bookCollection = null;
        let bookList = {};
        let bookData = data || [];

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjects(BOOK_REQ_TREE, null, dbOpts));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    bookCollection = root_obj.getCol("DataElements");
                    for (let i = 0; i < bookCollection.count(); i++) {
                        let book = bookCollection.get(i);
                        bookList[book.id()] = { book: book, deleted: true };
                    }
                    return root_obj.edit();
                })
                .then(() => {

                    let newBooks = [];
                    let newAuthors = [];
                    let order = 0;
                    bookData.forEach(elem => {
                        elem.Order = ++order;
                        let bookElem = bookList[elem.Id];
                        if (bookElem) {
                            let book = bookElem.book;
                            bookElem.deleted = false;
                            for (let fn in elem)
                                switch (fn) {
                                    case "Id":
                                        break;
                                    
                                    case "Authors":
                                        let authList = {};
                                        let newElems = [];
                                        let collection = book.getDataRoot("BookAuthor").getCol("DataElements");
                                        for (let i = 0; i < collection.count(); i++) {
                                            let auth = collection.get(i);
                                            authList[auth.id()] = { auth: auth, deleted: true };
                                        }
                                        let authors = elem[fn];
                                        authors.forEach(auth => {
                                            let authElem = authList[auth.Id];
                                            if (authElem) {
                                                authElem.deleted = false;
                                                if (typeof (auth.AuthorId) !== "undefined")
                                                    authElem.auth.authorId(auth.AuthorId);
                                                if (typeof (auth.Tp) !== "undefined")
                                                    authElem.auth.tp(auth.Tp);
                                                if (typeof (auth.TpView) !== "undefined")
                                                    authElem.auth.tpView(auth.TpView);
                                            }
                                            else
                                                newElems.push(auth);
                                        });
                                        if (newElems.length > 0)
                                            newAuthors.push({ book: book, items: newElems});
                                        for (let id in authList) {
                                            if (authList[id].deleted) {
                                                let auth = authList[id].auth;
                                                collection._del(auth);
                                            }
                                        }
                                        break;
                                    
                                    default:
                                        if (typeof (book[this._genGetterName(fn)]) === "function")
                                            if (fn === "ExtLinks")
                                                book[this._genGetterName(fn)](this._partnerLink.processLinks(elem[fn]))
                                            else
                                                book[this._genGetterName(fn)](elem[fn]);
                                }
                        }
                        else
                            newBooks.push(elem);
                    })

                    for (let id in bookList) {
                        if (bookList[id].deleted) {
                            let book = bookList[id].book;
                            bookCollection._del(book);
                        }                     
                    }

                    if (newBooks.length > 0)
                        return Utils.seqExec(newBooks, (elem) => {
                            let fields = { Order: elem.Order };
                            if (typeof (elem.Name) !== "undefined")
                                fields.Name = elem.Name
                            else
                                throw new HttpError(HttpCode.ERR_UNPROC_ENTITY, `Field "Name" can't be empty.`);
                            if (typeof (elem.Name) !== "undefined")
                                fields.Name = elem.Name;
                            if (typeof (elem.Description) !== "undefined")
                                fields.Description = elem.Description;
                            if (typeof (elem.CourseId) !== "undefined")
                                fields.CourseId = elem.CourseId;
                            if (typeof (elem.OtherAuthors) !== "undefined")
                                fields.OtherAuthors = elem.OtherAuthors;
                            if (typeof (elem.OtherCAuthors) !== "undefined")
                                fields.OtherCAuthors = elem.OtherCAuthors;
                            if (typeof (elem.Cover) !== "undefined")
                                if (typeof (elem.Cover) !== "string")
                                    fields.Cover = JSON.stringify(elem.Cover)
                                else
                                    fields.Cover = elem.Cover;
                            if (typeof (elem.CoverMeta) !== "undefined")
                                fields.CoverMeta = elem.CoverMeta;
                            if (typeof (elem.ExtLinks) !== "undefined")
                                fields.ExtLinks = this._partnerLink.processLinks(elem.ExtLinks);
                            return root_obj.newObject({
                                fields: fields
                            }, dbOpts)
                                .then(result => {
                                    if (elem.Authors && (elem.Authors.length > 0)) {
                                        let newObj = this._db.getObj(result.newObject);
                                        return this._addNewAuthor(newObj, elem.Authors, dbOpts);
                                    }
                                });
                        });

                    if (newAuthors.length > 0)
                        return Utils.seqExec(newAuthors, (elem) => {
                            return this._addNewAuthor(elem.book, elem.items, dbOpts);
                        });
                })
                .then(() => {
                    return root_obj.save(dbOpts);
                })
                .then(() => { return { result: "OK" } })
        }, memDbOptions);
    }
}

let dbBook = null;
exports.BookService = () => {
    return dbBook ? dbBook : dbBook = new DbBook();
}
