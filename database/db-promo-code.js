'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { Accounting } = require('../const/accounting');
const { Product } = require('../const/product');
const { roundNumber } = require('../utils');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const PROMO_REQ_TREE = {
    expr: {
        model: {
            name: "PromoCode",
            childs: [
                {
                    dataObject: {
                        name: "PromoCodeProduct"
                    }
                }
            ]
        }
    }
};

const RECEIVE_PROMO_MSSQL =
    "update [PromoCode] set [Rest] = [Rest] - 1 where ([Id] = <%= id %>) and (coalesce([Counter], 0)> 0) and (coalesce([Rest], 0)> 0)";

const RECEIVE_PROMO_MYSQL =
    "update `PromoCode` set `Rest` = `Rest` - 1 where (`Id` = <%= id %>) and (coalesce(`Counter`, 0)> 0) and (coalesce(`Rest`, 0)> 0)";

const GET_PROMO_MSSQL =
    "select c.[Id], c.[Code], c.[Description], c.[Perc], c.[Counter], c.[Rest], c.[FirstDate], c.[LastDate],\n" +
    "  p.[Id] as [pId], p.[ProductId]\n" +
    "from [PromoCode] c\n" +
    "  left join [PromoCodeProduct] p on p.[PromoCodeId] = c.[Id]<%= where %>\n" +
    "order by c.[Id]";

const GET_PROMO_MYSQL =
    "select c.`Id`, c.`Code`, c.`Description`, c.`Perc`, c.`Counter`, c.`Rest`, c.`FirstDate`, c.`LastDate`,\n" +
    "  p.`Id` as `pId`, p.`ProductId`\n" +
    "from `PromoCode` c\n" +
    "  left join `PromoCodeProduct` p on p.`PromoCodeId` = c.`Id`<%= where %>\n" +
    "order by c.`Id`";

const WHERE_PROMO_MSSQL = "\nwhere c.[<%= field %>] =  <%= value %>";
const WHERE_PROMO_MYSQL = "\nwhere c.`<%= field %>` =  <%= value %>";

const DbPromoCode = class DbPromoCode extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || PROMO_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    async receive(id, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};

        await $data.execSql({
            dialect: {
                mysql: _.template(RECEIVE_PROMO_MYSQL)({ id: id }),
                mssql: _.template(RECEIVE_PROMO_MSSQL)({ id: id })
            }
        }, dbOpts);
    }

    async get(options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let promo = [];

        let where_mssql = "";
        let where_mysql = "";
        if (opts.id) {
            where_mysql = _.template(WHERE_PROMO_MYSQL)({ field: "Id", value: opts.id });
            where_mssql = _.template(WHERE_PROMO_MSSQL)({ field: "Id", value: opts.id });
        }
        else
            if (opts.code) {
                where_mysql = _.template(WHERE_PROMO_MYSQL)({ field: "Code", value: `'${opts.code}'` });
                where_mssql = _.template(WHERE_PROMO_MSSQL)({ field: "Code", value: `'${opts.code}'` });
            }
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_PROMO_MYSQL)({ where: where_mysql}),
                mssql: _.template(GET_PROMO_MSSQL)({ where: where_mssql})
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length > 0)) {
            let currId = -1;
            let currObj;
            result.detail.forEach(elem => {
                if (currId !== elem.Id) {
                    currObj = { Products: opts.prodList ? null : [] };
                    currObj.Id = currId = elem.Id;
                    currObj.Code = elem.Code;
                    currObj.Description = elem.Description;
                    currObj.Perc = elem.Perc;
                    currObj.Counter = elem.Counter;
                    currObj.Rest = elem.Rest;
                    currObj.FirstDate = elem.FirstDate;
                    currObj.LastDate = elem.LastDate;
                    promo.push(currObj);
                }
                if (elem.pId) {
                    if (opts.prodList) {
                        if (!currObj.Products)
                            currObj.Products = {};
                        currObj.Products[elem.ProductId] = true
                    }
                    else
                        currObj.Products.push(elem.ProductId);
                }
            });
        };
        return promo;
    }

    async update(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let promoObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find promo code (Id = ${id}).`);

                    promoObj = col.get(0);
                    await root_obj.edit();

                    if (typeof (inpFields.Code) !== "undefined")
                        promoObj.code(inpFields.Code);

                    if (typeof (inpFields.Description) !== "undefined")
                        promoObj.description(inpFields.Description);

                    if (typeof (inpFields.Perc) !== "undefined") {
                        promoObj.perc(+inpFields.Perc);
                        if ((typeof (promoObj.perc()) !== "number") || (promoObj.perc() <= 0) || (promoObj.perc() > 100))
                            throw new Error(`Invalid field value "Perc": ${promoObj.perc()}`);
                    }

                    if (typeof (inpFields.Counter) !== "undefined") {
                        let old_counter = promoObj.counter();
                        promoObj.counter(+inpFields.Counter);
                        if ((typeof (promoObj.counter()) !== "number") || (promoObj.counter() <= 0) && (promoObj.counter() > 1000000))
                            throw new Error(`Invalid field value "Counter": ${promoObj.counter()}`);
                        let new_rest = promoObj.rest() + promoObj.counter() - old_counter;
                        promoObj.rest(new_rest > 0 ? new_rest : 0);
                    }

                    if (inpFields.FirstDate) {
                        if (inpFields.FirstDate instanceof Date)
                            promoObj.firstDate(inpFields.FirstDate)
                        else
                            if (typeof (inpFields.FirstDate) === "string")
                                promoObj.firstDate(new Date(inpFields.FirstDate))
                            else
                                throw new Error(`Invalid field value "FirstDate": "${inpFields.FirstDate}".`);
                    }

                    if (inpFields.LastDate) {
                        if (inpFields.LastDate instanceof Date)
                            promoObj.lastDate(inpFields.LastDate)
                        else
                            if (typeof (inpFields.LastDate) === "string")
                                promoObj.lastDate(new Date(inpFields.LastDate))
                            else
                                throw new Error(`Invalid field value "LastDate": "${inpFields.LastDate}".`);
                    }

                    if ((!promoObj.firstDate()) && (!promoObj.lastDate())) {
                        if (!promoObj.counter())
                            throw new Error(`Field "Counter" can't be empty when "FistaDate" and "LastDate" are empty.`);
                    }
                    else {
                        if (!promoObj.firstDate())
                            throw new Error(`Field "FirstDate" can't be empty when "LastDate" isn't empty.`);
                        if ((promoObj.lastDate()) && (promoObj.lastDate() <= promoObj.firstDate()))
                            throw new Error(`Invalid date range: ["${promoObj.firstDate()}".."${promoObj.lastDate()}"].`);
                    }

                    if (inpFields.Products) {
                        let root_prod = promoObj.getDataRoot("PromoCodeProduct");
                        let prod_col = root_prod.getCol("DataElements");
                        let prodList = {};
                        inpFields.Products.forEach(elem => { prodList[elem] = true; });
                        let toDelete = [];
                        for (let i = 0; i < prod_col.count(); i++) {
                            let prod = prod_col.get(i);
                            if (!prodList[prod.productId()])
                                toDelete.push(prod)
                            else
                                delete prodList[prod.productId()];
                        }
                        toDelete.forEach(elem => {
                            prod_col._del(elem);
                        })
                        for (let prodId in prodList) {
                            let fld = { ProductId: +prodId };
                            await root_prod.newObject({ fields: fld }, dbOpts);
                        }
                    }
                    await root_obj.save(dbOpts);
                })
        }, memDbOptions)
            .then(async () => {
                let result = await this.get({ id: id });
                if (result && (result.length === 1))
                    return result[0]
                else
                    throw new Error(`PromoCode Id = ${newId} doesn't exist.`);
            });
    }

    async insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    let fields = {
                        PriceListId: Product.DefaultPriceListId,
                        Counter: 0,
                        Rest: 0
                    };

                    if (typeof (inpFields.Code) !== "undefined")
                        fields.Code = inpFields.Code
                    else
                        throw new Error(`Missing field "Code"`);

                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description;

                    if (typeof (inpFields.Perc) !== "undefined") {
                        let perc = +inpFields.Perc;
                        if ((typeof (perc) === "number") && (perc > 0) && (perc <= 100))
                            fields.Perc = perc
                        else
                            throw new Error(`Invalid field value "Perc": ${perc}`);
                    }
                    else
                        throw new Error(`Missing field "Perc"`);

                    if (typeof (inpFields.Counter) !== "undefined") {
                        let counter = +inpFields.Counter;
                        if ((typeof (counter) === "number") && (counter > 0) && (counter <= 1000000)) {
                            fields.Counter = fields.Rest = counter
                        }
                        else
                            throw new Error(`Invalid field value "Counter": ${counter}`);
                    }

                    if (inpFields.FirstDate) {
                        if (inpFields.FirstDate instanceof Date)
                            fields.FirstDate = inpFields.FirstDate
                        else
                            if (typeof (inpFields.FirstDate) === "string")
                                fields.FirstDate = new Date(inpFields.FirstDate)
                            else
                                throw new Error(`Invalid field value "FirstDate": "${inpFields.FirstDate}".`);
                    }

                    if (inpFields.LastDate) {
                        if (inpFields.LastDate instanceof Date)
                            fields.LastDate = inpFields.LastDate
                        else
                            if (typeof (inpFields.LastDate) === "string")
                                fields.LastDate = new Date(inpFields.LastDate)
                            else
                                throw new Error(`Invalid field value "LastDate": "${inpFields.LastDate}".`);
                    }

                    if ((!fields.FirstDate) && (!fields.LastDate)) {
                        if (!fields.Counter)
                            throw new Error(`Field "Counter" can't be empty when "FistaDate" and "LastDate" are empty.`);
                    }
                    else {
                        if (!fields.FirstDate)
                            throw new Error(`Field "FirstDate" can't be empty when "LastDate" isn't empty.`);
                        if ((fields.LastDate) && (fields.LastDate <= fields.FirstDate))
                            throw new Error(`Invalid date range: ["${fields.FirstDate}".."${fields.LastDate}"].`);
                    }

                    let newHandler = await root_obj.newObject({ fields: fields }, dbOpts);

                    newId = newHandler.keyValue;
                    let promoObj = this._db.getObj(newHandler.newObject);

                    if (inpFields.Products && (inpFields.Products.length > 0)) {
                        let root_prod = promoObj.getDataRoot("PromoCodeProduct");
                        for (let i = 0; i < inpFields.Products.length; i++){
                            let fld = { ProductId: +inpFields.Products[i] };
                            await root_prod.newObject({ fields: fld }, dbOpts);
                        }
                    }
                    await root_obj.save(dbOpts);
                })
        }, memDbOptions)
            .then(async () => {
                let result = await this.get({ id: newId });
                if (result && (result.length === 1))
                    return result[0]
                else
                    throw new Error(`PromoCode Id = ${newId} doesn't exist.`);
            });
    }

    async del(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let promoObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find promo code (Id = ${id}).`);

                    promoObj = col.get(0);
                    await root_obj.edit();
                    col._del(promoObj);

                    await root_obj.save(dbOpts);
                    return ({ result: "OK" });
                })
        }, memDbOptions);
    }
}

let dbPromoCode = null;
exports.PromoCodeService = () => {
    return dbPromoCode ? dbPromoCode : dbPromoCode = new DbPromoCode();
}
