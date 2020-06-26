'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { VatService } = require('./db-vat');
const { Accounting } = require('../const/accounting');
const { Product } = require('../const/product');
const { roundNumber } = require('../utils');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const PRODUCT_REQ_TREE = {
    expr: {
        model: {
            name: "Product",
            childs: [
                {
                    dataObject: {
                        name: "Price"
                    }
                },
                {
                    dataObject: {
                        name: "Discount"
                    }
                }
            ]
        }
    }
};

const GET_PROD_MSSQL =
    "select p.[Id], p.[Code], p.[Name], p.[AccName], p.[Discontinued], p.[Picture], p.[PictureMeta], p.[Description], p.[ExtFields], p.[ProductTypeId]\n" +
    "from[Product] p\n" +
    "where (<%= alias %>.[<%= field %>] <%= cond %>)<%= discontinued %>";

const GET_PROD_DETAIL_MSSQL =
    "select p.[Id], p.[Code], p.[Name], p.[AccName], p.[Discontinued], p.[Picture], p.[PictureMeta], p.[Description], p.[ExtFields],\n" +
    "  p.[ProductTypeId], pt.[Code] as [TypeCode], pt.[ExtFields] as [TpExt], p.[VATTypeId], vt.[Code] as [VatCode], pl.[Id] as [PListId],\n" +
    "  pl.[Code] as [PListCode], vt.[ExtFields] as [VtExt], vr.[ExtFields] as [VrExt], vr.[Rate], pr.[Price],\n" +
    "  pl.[CurrencyId], c.[Code] as [Currency], d.[Perc], d.[FirstDate], d.[LastDate], d.[Description] as [DDescription],\n" +
    "  d.[Id] as [DiscountId], d.[DiscountTypeId], d.[Code] as [DCode], d.[TtlMinutes]\n" +
    "from[Product] p\n" +
    "  join[ProductType] pt on pt.[Id] = p.[ProductTypeId]\n" +
    "  join[Price] pr on pr.[ProductId] = p.[Id]\n" +
    "  join[PriceList] pl on pl.[Id] = pr.[PriceListId]\n" +
    "  join[Currency] c on c.[Id] = pl.[CurrencyId]\n" +
    "  join[VATType] vt on vt.[Id] = p.[VATTypeId]\n" +
    "  join[VATRate] vr on vr.[VATTypeId] = vt.[Id]\n" +
    "  left join[Discount] d on d.[ProductId] = p.[Id] and pl.[Id] = d.[PriceListId]\n" +
    "    and (d.[UserId] is NULL) and (d.[ProductTypeId] is NULL)\n" +
    "    and ((1 = <%= always_show_discount %>) or\n" +
    "    ((d.[FirstDate] <= convert(datetime, '<%= dt %>') and((d.[LastDate] > convert(datetime, '<%= dt %>')) or(d.[LastDate] is NULL)))))\n" +
    "where(<%= alias %>.[<%= field %>] <%= cond %>) and(pl.[Code] = '<%= priceList %>') and(pr.[FirstDate] <= convert(datetime, '<%= dt %>')\n" +
    "  and((pr.[LastDate] > convert(datetime, '<%= dt %>')) or(pr.[LastDate] is NULL)))\n" +
    "  and(vr.[FirstDate] <= convert(datetime, '<%= dt %>')\n" +
    "  and((vr.[LastDate] > convert(datetime, '<%= dt %>')) or(vr.[LastDate] is NULL)))<%= discontinued %>";

const GET_PROD_DETAIL_MYSQL =
    "select p.`Id`, p.`Code`, p.`Name`, p.`AccName`, p.`Discontinued`, p.`Picture`, p.`PictureMeta`, p.`Description`, p.`ExtFields`,\n" +
    "  p.`ProductTypeId`, pt.`Code` as `TypeCode`, pt.`ExtFields` as `TpExt`, p.`VATTypeId`, vt.`Code` as `VatCode`, pl.`Id` as `PListId`,\n" +
    "  pl.`Code` as `PListCode`, vt.`ExtFields` as `VtExt`, vr.`ExtFields` as `VrExt`, vr.`Rate`, pr.`Price`,\n" +
    "  pl.`CurrencyId`, c.`Code` as `Currency`, d.`Perc`, d.`FirstDate`, d.`LastDate`, d.`Description` as `DDescription`,\n" +
    "  d.`Id` as `DiscountId`, d.`DiscountTypeId`, d.`Code` as `DCode`, d.`TtlMinutes`\n" +
    "from`Product` p\n" +
    "  join`ProductType` pt on pt.`Id` = p.`ProductTypeId`\n" +
    "  join`Price` pr on pr.`ProductId` = p.`Id`\n" +
    "  join`PriceList` pl on pl.`Id` = pr.`PriceListId`\n" +
    "  join`Currency` c on c.`Id` = pl.`CurrencyId`\n" +
    "  join`VATType` vt on vt.`Id` = p.`VATTypeId`\n" +
    "  join`VATRate` vr on vr.`VATTypeId` = vt.`Id`\n" +
    "  left join`Discount` d on d.`ProductId` = p.`Id` and pl.`Id` = d.`PriceListId`\n" +
    "    and (d.`UserId` is NULL) and (d.`ProductTypeId` is NULL)\n" +
    "    and ((1 = <%= always_show_discount %>) or\n" +
    "    ((d.`FirstDate` <= '<%= dt %>' and((d.`LastDate` > '<%= dt %>') or(d.`LastDate` is NULL)))))\n" +
    "where(<%= alias %>.`<%= field %>` <%= cond %>) and(pl.`Code` = '<%= priceList %>') and(pr.`FirstDate` <= '<%= dt %>'\n" +
    "  and((pr.`LastDate` > '<%= dt %>') or(pr.`LastDate` is NULL)))\n" +
    "  and(vr.`FirstDate` <= '<%= dt %>'\n" +
    "  and((vr.`LastDate` > '<%= dt %>') or(vr.`LastDate` is NULL)))<%= discontinued %>";

const GET_PROD_MYSQL =
    "select p.`Id`, p.`Code`, p.`Name`, p.`AccName`, p.`Discontinued`, p.`Picture`, p.`PictureMeta`, p.`Description`, p.`ExtFields`, p.`ProductTypeId`\n" +
    "from`Product` p\n" +
    "where (<%= alias %>.`<%= field %>` <%= cond %>)<%= discontinued %>";


const DEFAUL_PRICE_LIST_CODE = "MAIN";
const DEFAUL_PRICE_LIST_ID = 1;

const DbProduct = class DbProduct extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || PRODUCT_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    calcDPrice(price, perc, truncate) {
        let dprice = price * (1 - perc / 100);
        let prec = Accounting.SumPrecision;
        let trunc_flag = (truncate === "true") || (truncate === true) ? true : false;
        let isDone = false;
        if (trunc_flag) {
            dprice = Math.trunc(dprice / 10) * 10;
            isDone = true;
        }
        else {
            let p = +opts.Prec;
            if ((typeof (p) === "number") && (!isNaN(p)))
                prec = p;
        }
        if (!isDone)
            dprice = roundNumber(dprice, prec);
        return dprice;
    }

    get(options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let products = [];
        let dt;
        let always_show_discount;
        return new Promise(resolve => {
            let ids;
            let codes;
            let field = "Id";
            let alias = "p";
            let discontinued = "";
            let cond;
            let priceList = opts.PriceList ? opts.PriceList : Product.DefaultPriceListCode;
            if ((opts.Detail === "true") || (opts.Detail === true)) {
                dt = new Date();
                if (opts.date) {
                    let ms = Date.parse(opts.date);
                    if (isNaN(ms))
                        throw new Error(`Invalid date format: "${opts.date}".`);
                    dt = new Date(ms);
                }
                dt = new Date(Math.round((dt - 0) / 1000) * 1000); // round ms
            }
            always_show_discount = ((opts.AlwaysShowDiscount === "true") || (opts.AlwaysShowDiscount === "1")
                || (opts.AlwaysShowDiscount === true) || (opts.AlwaysShowDiscount === 1)) ? 1 : 0;
            if (opts.Id) {
                let id = typeof (opts.Id) === "number" ? opts.Id : parseInt(opts.Id);
                if (isNaN(id))
                    throw new Error(`Invalid parameter "Id": "${opts.Id}".`);
                cond = `= ${id}`;
            }
            else
                if (opts.Code) {
                    field = "Code";
                    cond = `= '${opts.Code}'`;
                }
                else
                    if (opts.Ids) {
                        if (typeof (opts.Ids) === "string") {
                            let arr = opts.Ids.split(",");
                            ids = [];
                            arr.forEach(element => {
                                let val = parseInt(element);
                                if (isNaN(val))
                                    throw new Error(`Invalid element in "Ids": "${element}".`);
                                ids.push(val);
                            });
                            if (ids.length === 0)
                                throw new Error(`Invalid parameter "Ids": ${opts.Ids}.`);
                        }
                        else {
                            if (!Array.isArray(opts.Ids))
                                throw new Error(`Invalid parameter "Ids": ${JSON.stringify(opts.Ids)}.`);
                            ids = opts.Ids;
                        }
                        cond = `in (${ids.join()})`;
                    }
                    else
                        if (opts.Codes) {
                            field = "Code";
                            if (typeof (opts.Codes) === "string") {
                                let arr = opts.Codes.split(",");
                                codes = [];
                                arr.forEach(element => {
                                    codes.push("'" + element + "'");
                                });
                                if (codes.length === 0)
                                    throw new Error(`Invalid parameter "Codes": ${opts.Codes}.`);
                            }
                            else {
                                if (!Array.isArray(opts.Codes))
                                    throw new Error(`Invalid parameter "Codes": ${JSON.stringify(opts.Codes)}.`);
                                codes = opts.Codes;
                            }
                            cond = `in (${codes.join()})`;
                        }
                        else
                            if (opts.TypeCode) {
                                if (dt) {
                                    alias = "pt";
                                    field = "Code";
                                    cond = `= '${opts.TypeCode}'`;
                                }
                            }
            if (opts.Discontinued) {
                let val = opts.Discontinued;
                discontinued = " and (p.Discontinued = " +
                    (((val === "true") || (val === true) || (val === "1") || (val === 1)) ? "1" : "0") + ")";
            }

            if (!cond)
                throw new Error(`Invalid parameters: Missing "Id" or "Code" or "Ids" or "Codes".`);

            let params = dt ?
                {
                    always_show_discount: always_show_discount,
                    discontinued: discontinued,
                    alias: alias,
                    field: field,
                    cond: cond,
                    priceList: priceList,
                    dt: this._dateToString(dt, true, false)
                } :
                { discontinued: discontinued, alias: alias, field: field, cond: cond };
            let sql = dt ?
                {
                    dialect: {
                        mysql: _.template(GET_PROD_DETAIL_MYSQL)(params),
                        mssql: _.template(GET_PROD_DETAIL_MSSQL)(params)
                    }
                } :
                {
                    dialect: {
                        mysql: _.template(GET_PROD_MYSQL)(params),
                        mssql: _.template(GET_PROD_MSSQL)(params)
                    }
                };

            resolve($data.execSql(sql, dbOpts));
        })
            .then(result => {
                if (result && result.detail && (result.detail.length > 0)) {
                    let prod_list = {};
                    result.detail.forEach(elem => {
                        let curr_prod = prod_list[elem.Id];
                        if (!curr_prod) {
                            if (elem.ExtFields)
                                elem.ExtFields = JSON.parse(elem.ExtFields);
                            if (elem.TpExt)
                                elem.TpExt = JSON.parse(elem.TpExt);
                            if (elem.VtExt) {
                                let ext = JSON.parse(elem.VtExt);
                                delete elem.VtExt;
                                if (elem.VrExt) {
                                    ext = VatService().mergeVatFields(ext, JSON.parse(elem.VrExt));
                                    delete elem.VrExt;
                                }
                                elem.VatExtFields = ext;
                            }
                            elem.DPrice = elem.Price;
                            curr_prod = prod_list[elem.Id] = _.clone(elem);
                            delete curr_prod.Perc;
                            delete curr_prod.FirstDate;
                            delete curr_prod.LastDate;
                            delete curr_prod.DDescription;
                            delete curr_prod.DiscountId;
                            delete curr_prod.DiscountTypeId;
                            delete curr_prod.DCode;
                            delete curr_prod.TtlMinutes;
                            curr_prod.DynDiscounts = {};
                            products.push(curr_prod);
                        }
                        if (typeof (elem.Perc) === "number") {
                            if (elem.DiscountTypeId === Product.DiscountTypes.DynCoursePercId) {
                                if (elem.DCode)
                                    curr_prod.DynDiscounts[elem.DCode] = {
                                        Id: elem.DiscountId,
                                        DiscountTypeId: elem.DiscountTypeId,
                                        Description: elem.DDescription,
                                        Perc: elem.Perc,
                                        TtlMinutes: elem.TtlMinutes,
                                        FirstDate: elem.FirstDate,
                                        LastDate: elem.LastDate,
                                        DPrice: this.calcDPrice(elem.Price, elem.Perc, opts.Truncate)
                                    }
                            }
                            else {
                                let d = curr_prod.Discount = {
                                    Id: elem.DiscountId,
                                    DiscountTypeId: elem.DiscountTypeId,
                                    Description: elem.DDescription,
                                    Perc: elem.Perc,
                                    FirstDate: elem.FirstDate,
                                    LastDate: elem.LastDate
                                };
                                curr_prod.DPrice = this.calcDPrice(elem.Price, d.Perc, opts.Truncate);
                            }
                        }
                    });
                }
                return products;
            });
    }

    _mergeVatFields(type, rate) {
        let result = _.defaultsDeep({}, rate, type);
        return result;
    }

    async _setPrice(root, price, dbOpts) {
        let result = true;
        let firstDate = new Date();
        let priceObj = { Price: price };

        if (priceObj.FirstDate) {
            if (priceObj.FirstDate instanceof Date)
                firstDate = priceObj.FirstDate
            else
                if (typeof (priceObj.FirstDate) === "string")
                    firstDate = new Date(priceObj.FirstDate)
                else
                    throw new Error(`Invalid priceObj "FirstDate": "${priceObj.FirstDate}".`);
        };
        if ((!priceObj.Price) || (typeof (priceObj.Price) !== "number") || (isNaN(priceObj.Price)) || (priceObj.Price <= 0))
            throw new Error(`Invalid priceObj: "${priceObj.Price}".`);
        let priceListId = priceObj.PriceListId ? priceObj.PriceListId : Product.DefaultPriceListId;

        let fields = { PriceListId: priceListId, FirstDate: firstDate, Price: priceObj.Price };
        let col = root.getCol("DataElements");
        let activePrice = null;
        for (let i = 0; i < col.count(); i++){
            let p = col.get(i);
            if ((p.priceListId() === priceListId) && (!p.lastDate())) {
                activePrice = p;
                if (p.firstDate() >= fields.FirstDate)
                    throw new Error(`Invalid date range: ["${p.firstDate()}".."${fields.FirstDate}"].`);
                if (p.price() === fields.Price) {
                    result = false
                }
                break;
            }
        }
        if (result) {
            if (activePrice)
                activePrice.lastDate(fields.FirstDate);
            await root.newObject({
                fields: fields
            }, dbOpts);
        }
        return result;
    }

    _checkDiscountFields(discount) {
        let firstDate = null;
        let lastDate = null;
        if (!discount.DiscountTypeId)
            throw new Error(`Invalid or missing DiscountTypeId: "${discount.DiscountTypeId}".`);
        if (discount.FirstDate) {
            if (discount.FirstDate instanceof Date)
                firstDate = discount.FirstDate
            else
                if (typeof (discount.FirstDate) === "string")
                    firstDate = new Date(discount.FirstDate)
                else
                    throw new Error(`Invalid discount "FirstDate": "${discount.FirstDate}".`);
        }
        else
            throw new Error(`Invalid discount "FirstDate": "${discount.FirstDate}".`);
        if (discount.LastDate) {
            if (discount.LastDate instanceof Date)
                lastDate = discount.LastDate
            else
                if (typeof (discount.LastDate) === "string")
                    lastDate = new Date(discount.LastDate)
                else
                    throw new Error(`Invalid discount "LastDate": "${discount.LastDate}".`);
        }
        else
            throw new Error(`Invalid discount "LastDate": "${discount.LastDate}".`);

        if (lastDate && (lastDate <= firstDate))
            throw new Error(`Invalid date range: ["${firstDate}".."${lastDate}"].`);

        if ((!discount.Perc) || (typeof (discount.Perc) !== "number") || (isNaN(discount.Perc)) || (discount.Perc > 100))
            throw new Error(`Invalid discount: "${discount.Perc}".`);

        switch (discount.DiscountTypeId) {
            case Product.DiscountTypes.DynCoursePercId:
                if ((!discount.TtlMinutes) || (typeof (discount.TtlMinutes) !== "number") || (isNaN(discount.TtlMinutes)) || (discount.TtlMinutes <= 0))
                    throw new Error(`Invalid discount: "${discount.TtlMinutes}".`);
                break;
        }

        return { firstDate: firstDate, lastDate: lastDate };
    }

    async _setDiscount(root, discount, dyn_discount, dbOpts) {
        let result = true;
        let firstDate = null;
        let lastDate = null;

        let clearFlag = discount.Perc === null; // if null - remove current discount
        if (!clearFlag) {
            let dates = this._checkDiscountFields(discount);
            firstDate = dates.firstDate;
            lastDate = dates.lastDate;
        }
        let fields = {
            DiscountTypeId: discount.DiscountTypeId,
            PriceListId: discount.PriceListId ? discount.PriceListId : Product.DefaultPriceListId,
            Description: typeof (discount.Description) === "string" ? discount.Description : null,
            FirstDate: firstDate,
            LastDate: lastDate,
            Perc: discount.Perc
        };
        let col = root.getCol("DataElements");
        let activePrice = null;
        for (let i = 0; i < col.count(); i++) {
            let p = col.get(i);
            if ((p.priceListId() === fields.PriceListId) && (p.discountTypeId() === fields.DiscountTypeId)
                && (!p.productTypeId()) && (!p.userId())) {
        
                activePrice = p;
                if ((!clearFlag) &&  (p.perc() === fields.Perc) && (p.description() === fields.Description) &&
                    (Math.abs(p.firstDate() - fields.FirstDate) < 500) && (Math.abs(p.lastDate() - fields.LastDate) < 500)) {
                    result = false;
                }
                break;
            }
        }
        if (result) {
            if (clearFlag) {
                if (activePrice)
                    col._del(activePrice)
                else
                    result = false;
            }
            else
                if (activePrice) {
                    activePrice.description(fields.Description);
                    activePrice.firstDate(fields.FirstDate);
                    activePrice.lastDate(fields.LastDate);
                    activePrice.perc(fields.Perc)
                }
                else
                    await root.newObject({
                        fields: fields
                    }, dbOpts);
        }
        if (dyn_discount) {
            let items_to_del = [];
            let dyn_list = {};
            let dyn_new = [];
            for (let key in dyn_discount) {
                if (key.indexOf(":") !== -1)
                    throw new Error(`Dynamic discount code "${key}" containts symbol ":".`);
                let dscnt = _.defaultsDeep(dyn_discount[key], { Code: key, PriceListId: Product.DefaultPriceListId });
                dscnt.DiscountTypeId = Product.DiscountTypes.DynCoursePercId;
                dscnt.Description = typeof (dscnt.Description) === "string" ? dscnt.Description : null;
                let dates = this._checkDiscountFields(dscnt);
                dscnt.FirstDate = dates.firstDate;
                dscnt.LastDate = dates.lastDate;
                if ((typeof (dscnt.Id) === "number") && (dscnt.Id > 0))
                    dyn_list[dscnt.Id] = dscnt
                else {
                    delete dscnt.Id;
                    dyn_new.push(dscnt);
                }
            }
            let upd_flag = false;
            for (let i = 0; i < col.count(); i++) {
                let p = col.get(i);
                if ((p.discountTypeId() === Product.DiscountTypes.DynCoursePercId) && (!p.productTypeId()) && (!p.userId())) {
                    let upd_item = dyn_list[p.id()];
                    if (upd_item) {
                        if ((p.priceListId() !== upd_item.PriceListId) || (p.perc() !== upd_item.Perc) ||
                            (p.description() !== upd_item.Description) || (p.code() !== upd_item.Code) || (p.ttlMinutes() !== upd_item.TtlMinutes) ||
                            (Math.abs(p.firstDate() - upd_item.FirstDate) > 500) || (Math.abs(p.lastDate() - upd_item.LastDate) > 500)) {
                            
                            p.priceListId(upd_item.PriceListId);
                            p.perc(upd_item.Perc);
                            p.description(upd_item.Description);
                            p.code(upd_item.Code);
                            p.ttlMinutes(upd_item.TtlMinutes);
                            p.firstDate(upd_item.FirstDate);
                            p.lastDate(upd_item.LastDate);
                            upd_flag = true;
                        }
                    }
                    else
                        items_to_del.push(p);
                }
            }

            for (let i = 0; i < items_to_del.length; i++)
                col._del(items_to_del[i]);

            for (let i = 0; i < dyn_new.length; i++)
                await root.newObject({
                    fields: dyn_new[i]
                }, dbOpts);
            
            result = result || upd_flag || (dyn_new.length > 0) || (items_to_del.length > 0);
        }
        return result;
    }

    update(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let productObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find product (Id = ${id}).`);
                    
                    productObj = col.get(0);
                    await root_obj.edit();

                    if (typeof (inpFields.VATTypeId) !== "undefined")
                        productObj.vATTypeId(inpFields.VATTypeId);
                    if (typeof (inpFields.Code) !== "undefined")
                        productObj.code(inpFields.Code);
                    if (typeof (inpFields.Name) !== "undefined")
                        productObj.name(inpFields.Name);
                    if (typeof (inpFields.AccName) === "string")
                        productObj.accName(inpFields.AccName);
                    if (typeof (inpFields.Picture) !== "undefined")
                        productObj.picture(inpFields.Picture);
                    if (typeof (inpFields.PictureMeta) !== "undefined")
                        productObj.pictureMeta(typeof (inpFields.PictureMeta) === "string" ? inpFields.PictureMeta
                            : JSON.stringify(inpFields.PictureMeta));
                    if (typeof (inpFields.Description) !== "undefined")
                        productObj.description(inpFields.Description);
                    if (typeof (inpFields.Discontinued) !== "undefined")
                        productObj.discontinued(inpFields.Discontinued);
                    if (typeof (inpFields.ExtFields) !== "undefined")
                        productObj.extFields(typeof (inpFields.ExtFields) === "string" ? inpFields.ExtFields
                            : JSON.stringify(inpFields.ExtFields));

                    let ver = productObj.ver();
                    let isDetMdf = false;
                    if (typeof (inpFields.Price) === "number") {
                        let root_price = productObj.getDataRoot("Price");
                        let flag = await this._setPrice(root_price, inpFields.Price, dbOpts);
                        isDetMdf = isDetMdf || flag;
                    }
                    if (inpFields.Discount || inpFields.DynDiscounts) {
                        let root_discount = productObj.getDataRoot("Discount");
                        let flag = await this._setDiscount(root_discount, inpFields.Discount, inpFields.DynDiscounts, dbOpts);
                        isDetMdf = isDetMdf || flag;
                    }
                    if (isDetMdf)
                        productObj.ver(++ver);
                    let res = await root_obj.save(dbOpts);
                    let isModified = res && res.detail && (res.detail.length > 0);
                    return { result: "OK", isModified: isModified };
                })
        }, memDbOptions);
    }

    insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let productObj = null;
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
                        Discontinued: false,
                        Ver: 1
                    };

                    if (typeof (inpFields.ProductTypeId) !== "undefined")
                        fields.ProductTypeId = inpFields.ProductTypeId
                    else
                        throw new Error(`Missing field "ProductTypeId"`);
                    if (typeof (inpFields.VATTypeId) !== "undefined")
                        fields.VATTypeId = inpFields.VATTypeId
                    else
                        throw new Error(`Missing field "VATTypeId"`);
                    if (typeof (inpFields.Code) !== "undefined")
                        fields.Code = inpFields.Code
                    else
                        throw new Error(`Missing field "Code"`);
                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name
                    else
                        throw new Error(`Missing field "Name"`);
                    fields.AccName = fields.Name;
                    if (typeof (inpFields.AccName) === "string")
                        fields.AccName = inpFields.AccName;
                    if (typeof (inpFields.Picture) !== "undefined")
                        fields.Picture = inpFields.Picture;
                    if (typeof (inpFields.PictureMeta) !== "undefined")
                        fields.PictureMeta = typeof (inpFields.PictureMeta) === "string" ? inpFields.PictureMeta
                            : JSON.stringify(inpFields.PictureMeta);
                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description;
                    if (typeof (inpFields.Discontinued) !== "undefined")
                        fields.Discontinued = inpFields.Discontinued;
                    if (typeof (inpFields.ExtFields) !== "undefined")
                        fields.ExtFields = typeof (inpFields.ExtFields) === "string" ? inpFields.ExtFields
                            : JSON.stringify(inpFields.ExtFields);

                    let newHandler = await root_obj.newObject({
                        fields: fields
                    }, dbOpts);

                    newId = newHandler.keyValue;
                    productObj = this._db.getObj(newHandler.newObject);

                    if (typeof (inpFields.Price) === "number") {
                        let root_price = productObj.getDataRoot("Price");
                        await this._setPrice(root_price, inpFields.Price, dbOpts)
                    }
                    if (inpFields.Discount || inpFields.DynDiscounts) {
                        let root_discount = productObj.getDataRoot("Discount");
                        await this._setDiscount(root_discount, inpFields.Discount, inpFields.DynDiscounts, dbOpts);
                    }
                    await root_obj.save(dbOpts);
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);
    }
}

let dbProduct = null;
exports.ProductService = () => {
    return dbProduct ? dbProduct : dbProduct = new DbProduct();
}
