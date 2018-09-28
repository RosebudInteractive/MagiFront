'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const PRODUCT_REQ_TREE = {
    expr: {
        model: {
            name: "Product"
        }
    }
};

const GET_PROD_MSSQL =
    "select p.[Id], p.[Code], p.[Name], p.[Picture], p.[PictureMeta], p.[Description], p.[ExtFields], p.[ProductTypeId]\n" +
    "from[Product] p\n" +
    "where p.[<%= field %>] <%= cond %>";

const GET_PROD_DETAIL_MSSQL =
    "select p.[Id], p.[Code], p.[Name], p.[Picture], p.[PictureMeta], p.[Description], p.[ExtFields],\n" +
    "  p.[ProductTypeId], pt.[Code] as [TypeCode], p.[VATTypeId], vt.[Code] as [VatCode], pl.[Id] as [PListId],\n" +
    "  pl.[Code] as [PListCode], vt.[ExtFields] as [VtExt], vr.[ExtFields] as [VrExt], vr.[Rate], pr.[Price],\n" +
    "  pl.[CurrencyId], c.[Code] as [Currency]\n" +
    "from[Product] p\n" +
    "  join[ProductType] pt on pt.[Id] = p.[ProductTypeId]\n" +
    "  join[Price] pr on pr.[ProductId] = p.[Id]\n" +
    "  join[PriceList] pl on pl.[Id] = pr.[PriceListId]\n" +
    "  join[Currency] c on c.[Id] = pl.[CurrencyId]\n" +
    "  join[VATType] vt on vt.[Id] = p.[VATTypeId]\n" +
    "  join[VATRate] vr on vr.[VATTypeId] = vt.[Id]\n" +
    "where(p.[<%= field %>] <%= cond %>) and(pl.[Code] = '<%= priceList %>') and(pr.FirstDate <= convert(datetime, '<%= dt %>')\n" +
    "  and((pr.LastDate > convert(datetime, '<%= dt %>')) or(pr.LastDate is NULL)))\n" +
    "  and(vr.FirstDate <= convert(datetime, '<%= dt %>')\n" +
    "  and((vr.LastDate > convert(datetime, '<%= dt %>')) or(vr.LastDate is NULL)))";

const GET_PROD_DETAIL_MYSQL =
    "select p.`Id`, p.`Code`, p.`Name`, p.`Picture`, p.`PictureMeta`, p.`Description`, p.`ExtFields`,\n" +
    "  p.`ProductTypeId`, pt.`Code` as `TypeCode`, p.`VATTypeId`, vt.`Code` as `VatCode`, pl.`Id` as `PListId`,\n" +
    "  pl.`Code` as `PListCode`, vt.`ExtFields` as `VtExt`, vr.`ExtFields` as `VrExt`, vr.`Rate`, pr.`Price`,\n" +
    "  pl.`CurrencyId`, c.`Code` as `Currency`\n" +
    "from`Product` p\n" +
    "  join`ProductType` pt on pt.`Id` = p.`ProductTypeId`\n" +
    "  join`Price` pr on pr.`ProductId` = p.`Id`\n" +
    "  join`PriceList` pl on pl.`Id` = pr.`PriceListId`\n" +
    "  join`Currency` c on c.`Id` = pl.`CurrencyId`\n" +
    "  join`VATType` vt on vt.`Id` = p.`VATTypeId`\n" +
    "  join`VATRate` vr on vr.`VATTypeId` = vt.`Id`\n" +
    "where(p.`<%= field %>` <%= cond %>) and(pl.`Code` = '<%= priceList %>') and(pr.FirstDate <= '<%= dt %>'\n" +
    "  and((pr.LastDate > '<%= dt %>') or(pr.LastDate is NULL)))\n" +
    "  and(vr.FirstDate <= '<%= dt %>'\n" +
    "  and((vr.LastDate > '<%= dt %>') or(vr.LastDate is NULL)))";

const GET_PROD_MYSQL =
    "select p.`Id`, p.`Code`, p.`Name`, p.`Picture`, p.`PictureMeta`, p.`Description`, p.`ExtFields`, p.`ProductTypeId`\n" +
    "from`Product` p\n" +
    "where p.`<%= field %>` <%= cond %>";


const DEFAUL_PRICE_LIST_CODE = "MAIN";

const DbProduct = class DbProduct extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || PRODUCT_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    get(options) {
        let opts = options || {};
        let dbOpts = {};
        let products = [];
        let dt;
        return new Promise(resolve => {
            let ids;
            let codes;
            let field = "Id";
            let cond;
            if (opts.transactionId)
                dbOpts.transactionId = opts.transactionId;
            let priceList = opts.priceList ? opts.priceList : DEFAUL_PRICE_LIST_CODE;
            if ((opts.detail === "true") || (opts.detail === true)) {
                dt = new Date();
                if (opts.date) {
                    let ms = Date.parse(opts.date);
                    if (isNaN(ms))
                        throw new Error(`Invalid date format: "${opts.date}".`);
                    dt = new Date(ms);
                }
            }
            if (opts.id) {
                let id = parseInt(opts.id);
                if (isNaN(id))
                    throw new Error(`Invalid parameter "id": "${opts.id}".`);
                cond = `= ${id}`;
            }
            else
                if (opts.code) {
                    field = "Code";
                    cond = `= '${opts.code}'`;
                }
                else
                    if (opts.ids) {
                        if (typeof (opts.ids) === "string") {
                            let arr = opts.ids.split(",");
                            ids = [];
                            arr.forEach(element => {
                                let val = parseInt(element);
                                if (isNaN(val))
                                    throw new Error(`Invalid element in "ids": "${element}".`);
                                ids.push(val);
                            });
                            if (ids.length === 0)
                                throw new Error(`Invalid parameter "ids": ${opts.ids}.`);
                        }
                        else {
                            if (!Array.isArray(opts.ids))
                                throw new Error(`Invalid parameter "ids": ${JSON.stringify(opts.ids)}.`);
                            ids = opts.ids;
                        }
                        cond = `in (${ids.join()})`;
                    }
                    else
                        if (opts.codes) {
                            field = "Code";
                            if (typeof (opts.codes) === "string") {
                                let arr = opts.codes.split(",");
                                codes = [];
                                arr.forEach(element => {
                                    codes.push("'" + element + "'");
                                });
                                if (codes.length === 0)
                                    throw new Error(`Invalid parameter "codes": ${opts.codes}.`);
                            }
                            else {
                                if (!Array.isArray(opts.codes))
                                    throw new Error(`Invalid parameter "codes": ${JSON.stringify(opts.codes)}.`);
                                codes = opts.codes;
                            }
                            cond = `in (${codes.join()})`;
                        };
            if (!cond)
                throw new Error(`Invalid parameters: Missing "id" or "code" or "ids" or "codes".`);

            let sql = dt ?
                {
                    dialect: {
                        mysql: _.template(GET_PROD_DETAIL_MYSQL)({ field: field, cond: cond, priceList: priceList, dt: this._dateToString(dt) }),
                        mssql: _.template(GET_PROD_DETAIL_MSSQL)({ field: field, cond: cond, priceList: priceList, dt: this._dateToString(dt) })
                    }
                } :
                {
                    dialect: {
                        mysql: _.template(GET_PROD_MYSQL)({ field: field, cond: cond }),
                        mssql: _.template(GET_PROD_MSSQL)({ field: field, cond: cond })
                    }
                };

            resolve($data.execSql(sql, dbOpts));
        })
            .then(result => {
                if (result && result.detail && (result.detail.length > 0)) {
                    result.detail.forEach(elem => {
                        if (elem.ExtFields)
                            elem.ExtFields = JSON.parse(elem.ExtFields);
                        if (elem.VtExt) {
                            let ext = JSON.parse(elem.VtExt);
                            delete elem.VtExt;
                            if (elem.VrExt) {
                                ext = this._mergeVatFields(ext, JSON.parse(elem.VrExt));
                                delete elem.VrExt;
                            }
                            elem.VatExtFields = ext;
                        }
                        products.push(elem);
                    });
                }
                return products;
            });
    }

    _mergeVatFields(type, rate) {
        let result = _.defaultsDeep({}, rate, type);
        return result;
    }

    insert(data, options) {
        let self = this;
        let memDbOptions = { dbRoots: [] };
        let root_obj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
        }, memDbOptions);
    }
}

let dbProduct = null;
exports.ProductService = () => {
    return dbProduct ? dbProduct : dbProduct = new DbProduct();
}
