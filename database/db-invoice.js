'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { ProductService } = require('./db-product');
const { Accounting } = require('../const/accounting');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const INVOICE_REQ_TREE = {
    expr: {
        model: {
            name: "Invoice",
            childs: [
                {
                    dataObject: {
                        name: "InvoiceItem"
                    }
                }
            ]
        }
    }
};

const GET_INVOICE_MSSQL =
    "select i.[Id], i.[UserId], i.[ParentId], i.[InvoiceTypeId], i.[StateId], i.[CurrencyId], c.[Code] as [CCode], i.[ChequeId], i.[Name],\n" +
    "  i.[Description], i.[InvoiceNum], i.[InvoiceDate], i.[Sum], i.[RefundSum], it.[Id] as [ItemId], it.[ProductId],\n" +
    "  it.[VATTypeId], it.[Code], it.[Name] as [ItemName], it.[VATRate], it.[Price], it.[Qty], it.[RefundQty], it.[ExtFields]\n" +
    "from[Invoice] i\n" +
    "  join[Currency] c on c.[Id] = i.[CurrencyId]\n" +
    "  join[InvoiceItem] it on it.[InvoiceId] = i.[Id]\n" +
    "where i.[Id] = <%= id %>";

const GET_INVOICE_MYSQL =
    "select i.`Id`, i.`UserId`, i.`ParentId`, i.`InvoiceTypeId`, i.`StateId`, i.`CurrencyId`, c.`Code` as `CCode`, i.`ChequeId`, i.`Name`,\n" +
    "  i.`Description`, i.`InvoiceNum`, i.`InvoiceDate`, i.`Sum`, i.`RefundSum`, it.`Id` as `ItemId`, it.`ProductId`,\n" +
    "  it.`VATTypeId`, it.`Code`, it.`Name` as `ItemName`, it.`VATRate`, it.`Price`, it.`Qty`, it.`RefundQty`, it.`ExtFields`\n" +
    "from`Invoice` i\n" +
    "  join`Currency` c on c.`Id` = i.`CurrencyId`\n" +
    "  join`InvoiceItem` it on it.`InvoiceId` = i.`Id`\n" +
    "where i.`Id` = <%= id %>";

const DbInvoice = class DbInvoice extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || INVOICE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    get(id, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        return new Promise(resolve => {
            resolve(
                $data.execSql({
                    dialect: {
                        mysql: _.template(GET_INVOICE_MYSQL)({ id: id }),
                        mssql: _.template(GET_INVOICE_MSSQL)({ id: id })
                    }
                }, dbOpts)
            );
        })
            .then(result => {
                let inv = { data: null };
                if (result && result.detail && (result.detail.length > 0)) {
                    let invoice = inv.data = {};
                    let isFirst = true;
                    result.detail.forEach(elem => {
                        if (isFirst) {
                            isFirst = false;
                            invoice.Id = elem.Id;
                            invoice.UserId = elem.UserId;
                            invoice.ParentId = elem.ParentId;
                            invoice.InvoiceTypeId = elem.InvoiceTypeId;
                            invoice.StateId = elem.StateId;
                            invoice.CurrencyId = elem.CurrencyId;
                            invoice.CurrencyCode = elem.CCode;
                            invoice.ChequeId = elem.ChequeId;
                            invoice.Name = elem.Name;
                            invoice.Description = elem.Description;
                            invoice.InvoiceNum = elem.InvoiceNum;
                            invoice.InvoiceDate = elem.InvoiceDate;
                            invoice.Sum = elem.Sum;
                            invoice.RefundSum = elem.RefundSum;
                            invoice.Items = [];
                        }
                        invoice.Items.push({
                            Id: elem.ItemId,
                            ProductId: elem.ProductId,
                            VATTypeId: elem.VATTypeId,
                            Code: elem.Code,
                            Name: elem.ItemName,
                            VATRate: elem.VATRate,
                            Price: elem.Price,
                            Qty: elem.Qty,
                            RefundQty: elem.RefundQty,
                            ExtFields: JSON.parse(elem.ExtFields)
                        });
                    })
                }
                return inv;
            });
    }

    _stateIdToString(stateId) {
        let rc = "Unknown";
        switch (stateId) {
            case 1:
                rc = "Черновик";
                break;
            case 2:
                rc = "Подтвержден";
                break;
            case 3:
                rc = "Оплачен";
                break;
            case 4:
                rc = "Отменен";
                break;
        }
    }

    update(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let invoiceObj = null;
        let root_item = null;
        let itm_list = {};
        let itm_new = [];
        let invId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new Error("Invoice (Id = " + id + ") doesn't exist.");
                    invoiceObj = collection.get(0);
                    invId = invoiceObj.id();
                    root_item = invoiceObj.getDataRoot("InvoiceItem");
                    return root_obj.edit();
                })
                .then(() => {
                    let currStateId = invoiceObj.stateId();
                    let newStateId = currStateId;
                    if (typeof (inpFields.InvoiceTypeId) !== "undefined")
                        throw new Error(`Can't update field "InvoiceTypeId".`);
                    if (typeof (inpFields.ParentId) !== "undefined")
                        throw new Error(`Can't update field "ParentId".`);
                    if (typeof (inpFields.StateId) !== "undefined")
                        newStateId = invoiceObj.stateId(inpFields.StateId);
                    if (currStateId !== newStateId)
                        if ((currStateId === Accounting.InvoiceState.Canceled) || (currStateId === Accounting.InvoiceState.Payed))
                            throw new Error(`Can't change field "StateId" from "${this._stateIdToString(currStateId)}" to "${this._stateIdToString(newStateId)}".`);
                    if (typeof (inpFields.CurrencyId) !== "undefined")
                        if (currStateId === Accounting.InvoiceState.Draft)
                            invoiceObj.currencyId(inpFields.CurrencyId)
                        else
                            throw new Error(`Can't modify field "StateId" in state "${this._stateIdToString(currStateId)}".`);
                    if (typeof (inpFields.ChequeId) !== "undefined")
                        if ((currStateId !== Accounting.InvoiceState.Payed) && (currStateId !== Accounting.InvoiceState.Canceled))
                            invoiceObj.chequeId(inpFields.ChequeId)
                        else
                            if (invoiceObj.chequeId() !== inpFields.ChequeId)
                                throw new Error(`Can't modify field "ChequeId" in state "${this._stateIdToString(currStateId)}".`);
                    if (typeof (inpFields.Name) !== "undefined")
                        if (currStateId === Accounting.InvoiceState.Draft)
                            invoiceObj.name(inpFields.Name)
                        else
                            throw new Error(`Can't modify field "Name" in state "${this._stateIdToString(currStateId)}".`);
                    if (typeof (inpFields.Description) !== "undefined")
                        if (currStateId === Accounting.InvoiceState.Draft)
                            invoiceObj.description(inpFields.Description)
                        else
                            throw new Error(`Can't modify field "Description" in state "${this._stateIdToString(currStateId)}".`);
                    if (typeof (inpFields.InvoiceNum) !== "undefined")
                        if (currStateId === Accounting.InvoiceState.Draft)
                            invoiceObj.invoiceNum(inpFields.InvoiceNum)
                        else
                            throw new Error(`Can't modify field "InvoiceNum" in state "${this._stateIdToString(currStateId)}".`);
                    if (typeof (inpFields.InvoiceDate) !== "undefined")
                        if (currStateId === Accounting.InvoiceState.Draft)
                            invoiceObj.invoiceDate(inpFields.InvoiceDate)
                        else
                            throw new Error(`Can't modify field "InvoiceDate" in state "${this._stateIdToString(currStateId)}".`);

                    if (inpFields.Items && (currStateId !== Accounting.InvoiceState.Draft))
                        throw new Error(`Can't modify "Items" in state "${this._stateIdToString(currStateId)}".`);

                    if (inpFields.Items && Array.isArray(inpFields.Items)) {
                        let itm_collection = root_item.getCol("DataElements");
                        for (let i = 0; i < itm_collection.count(); i++) {
                            let obj = itm_collection.get(i);
                            itm_list[obj.id()] = { deleted: true, obj: obj };
                        }

                        inpFields.Items.forEach((elem) => {
                            let data = {};
                            if (typeof (elem.ProductId) !== "undefined")
                                data.ProductId = elem.ProductId;
                            if (typeof (elem.VATTypeId) !== "undefined")
                                data.VATTypeId = elem.VATTypeId;
                            if (typeof (elem.Code) !== "undefined")
                                data.Code = elem.Code;
                            if (typeof (elem.Name) !== "undefined")
                                data.Name = elem.Name;
                            if (typeof (elem.VATRate) !== "undefined")
                                data.VATRate = elem.VATRate;
                            if (typeof (elem.Price) !== "undefined")
                                data.Price = elem.Price;
                            if (typeof (elem.Qty) !== "undefined")
                                data.Qty = elem.Qty;
                            if (typeof (elem.Id) === "number") {
                                if (itm_list[elem.Id]) {
                                    itm_list[elem.Id].deleted = false;
                                    itm_list[elem.Id].data = data;
                                }
                                else {
                                    delete elem.Id;
                                    itm_new.push(data);
                                }
                            }
                            else
                                itm_new.push(data);
                        })

                        for (let key in itm_list)
                            if (itm_list[key].deleted)
                                itm_collection._del(itm_list[key].obj)
                            else {
                                for (let field in itm_list[key].data)
                                    itm_list[key].obj[this._genGetterName(field)](itm_list[key].data[field]);
                            }

                        invoiceObj.sum(0);
                        for (let i = 0; i < itm_collection.count(); i++) {
                            let obj = itm_collection.get(i);
                            invoiceObj.sum(invoiceObj.sum() + obj.price() * obj.qty());
                        }
                    }
                    if (itm_new.length > 0) {
                        let rc = Promise.resolve();
                        let field;
                        let fieldSrc;
                        let reqParam;
                        let item = itm_new[0];
                        if (item.ProductId) {
                            field = "ProductId";
                            fieldSrc = "Id";
                            reqParam = "Ids";
                        }
                        else
                            if (item.Code) {
                                field = "Code";
                                fieldSrc = "Code";
                                reqParam = "Codes";
                            }
                            else
                                if (item.Id && (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Refund)) {
                                    field = "Id";
                                    fieldSrc = "Id";
                                }
                        if (!field)
                            throw new Error(`Missing field "ProductId" or "Code" or "Id" in "item" array.`);
                        if (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Purchase) {
                            let reqArr = [];
                            itm_new.forEach(elem => {
                                reqArr.push(elem[field]);
                            });
                            let request = { Detail: true };
                            request[reqParam] = reqArr;
                            rc = rc.then(() => {
                                return ProductService().get(request);
                            })
                                .then((prods => {
                                    let productList = {};
                                    prods.forEach(elem => {
                                        productList[elem[fieldSrc]] = elem;
                                    });
                                    return Utils.seqExec(itm_new, (elem) => {
                                        let fields = { RefundQty: 0 };
                                        let p = productList[elem[field]];
                                        if (!p)
                                            throw new Error(`Product "${field}" = "${elem[field]}" doesn't exist.`);
                                        fields.ProductId = elem.ProductId ? elem.ProductId : p.Id;
                                        fields.VATTypeId = elem.VATTypeId ? elem.VATTypeId : p.VATTypeId;
                                        fields.Code = elem.Code ? elem.Code : p.Code;
                                        fields.Name = elem.Name ? elem.Name : p.Name;
                                        fields.VATRate = elem.VATRate ? elem.VATRate : p.Rate;
                                        fields.Price = typeof (elem.Price) === "number" ? elem.Price : p.Price;
                                        fields.Qty = elem.Qty ? elem.Qty : 1;
                                        let sum = invoiceObj.sum() + fields.Price * fields.Qty;
                                        invoiceObj.sum(sum);
                                        let ext = {
                                            prodType: p.ProductTypeId,
                                            prod: p.ExtFields,
                                            vat: p.VatExtFields
                                        };
                                        fields.ExtFields = JSON.stringify(ext);
                                        return root_item.newObject({
                                            fields: fields
                                        }, dbOpts);
                                    });
                                }));
                            return rc;
                        }
                        else
                            if (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Refund) {
                                throw new Error(`Refunds aren't implemented yet!`);
                            }
                            else
                                throw new Error(`Unknown "InvoiceTypeId": ${invoiceObj.invoiceTypeId()}.`);
                        
                    }
                })
                .then(() => {
                    return root_obj.save(dbOpts);
                })
                .then(() => {
                    return { result: "OK", id: invId };
                })
        }, memDbOptions);
    }

    insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let invoiceObj = null;
        let newId;
        let root_item = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    let fields = {
                        InvoiceTypeId: Accounting.InvoiceType.Purchase,
                        StateId: Accounting.InvoiceState.Draft,
                        CurrencyId: Accounting.DfltCurrencyId,
                        InvoiceDate: new Date(),
                        Sum: 0,
                        RefundSum: 0
                    };
                    if (typeof (inpFields.UserId) !== "undefined")
                        fields.UserId = inpFields.UserId;
                    if (typeof (inpFields.ParentId) !== "undefined")
                        fields.ParentId = inpFields.ParentId;
                    if (typeof (inpFields.InvoiceTypeId) !== "undefined")
                        fields.InvoiceTypeId = inpFields.InvoiceTypeId;
                    if (typeof (inpFields.StateId) !== "undefined")
                        fields.StateId = inpFields.StateId;
                    if (typeof (inpFields.CurrencyId) !== "undefined")
                        fields.CurrencyId = inpFields.CurrencyId;
                    if (typeof (inpFields.ChequeId) !== "undefined")
                        fields.ChequeId = inpFields.ChequeId;
                    if (typeof (inpFields.Name) !== "undefined")
                        fields.Name = inpFields.Name;
                    if (typeof (inpFields.Description) !== "undefined")
                        fields.Description = inpFields.Description;
                    if (typeof (inpFields.InvoiceNum) !== "undefined")
                        fields.InvoiceNum = inpFields.InvoiceNum;
                    if (typeof (inpFields.InvoiceDate) !== "undefined")
                        fields.InvoiceDate = inpFields.InvoiceDate;

                    return root_obj.newObject({
                        fields: fields
                    }, dbOpts);
                })
                .then((result) => {
                    newId = result.keyValue;
                    invoiceObj = this._db.getObj(result.newObject);
                    if (!invoiceObj.invoiceNum())
                        invoiceObj.invoiceNum(newId + "/" + invoiceObj.userId());
                    if (!invoiceObj.name()) {
                        let name = (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Purchase ? "Заказ" : "Возврат") +
                            " №" + invoiceObj.invoiceNum();
                        invoiceObj.name(name);
                    }
                    root_item = invoiceObj.getDataRoot("InvoiceItem");
                    if (inpFields.Items && (inpFields.Items.length > 0)) {
                        let rc = Promise.resolve();
                        let field;
                        let fieldSrc;
                        let reqParam;
                        let item = inpFields.Items[0];
                        if (item.ProductId) {
                            field = "ProductId";
                            fieldSrc = "Id";
                            reqParam = "Ids";
                        }
                        else
                            if (item.Code) {
                                field = "Code";
                                fieldSrc = "Code";
                                reqParam = "Codes";
                            }
                            else
                                if (item.Id && (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Refund)) {
                                    field = "Id";
                                    fieldSrc = "Id";
                                }
                        if (!field)
                            throw new Error(`Missing field "ProductId" or "Code" or "Id" in "item" array.`);
                        if (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Purchase) {
                            let reqArr = [];
                            inpFields.Items.forEach(elem => {
                                reqArr.push(elem[field]);
                            });
                            let request = { Detail: true };
                            request[reqParam] = reqArr;
                            rc = rc.then(() => {
                                return ProductService().get(request);
                            })
                                .then((prods => {
                                    let productList = {};
                                    prods.forEach(elem => {
                                        productList[elem[fieldSrc]] = elem;
                                    });
                                    return Utils.seqExec(inpFields.Items, (elem) => {
                                        let fields = { RefundQty: 0 };
                                        let p = productList[elem[field]];
                                        if (!p)
                                            throw new Error(`Product "${field}" = "${elem[field]}" doesn't exist.`);
                                        fields.ProductId = elem.ProductId ? elem.ProductId : p.Id;
                                        fields.VATTypeId = elem.VATTypeId ? elem.VATTypeId : p.VATTypeId;
                                        fields.Code = elem.Code ? elem.Code : p.Code;
                                        fields.Name = elem.Name ? elem.Name : p.Name;
                                        fields.VATRate = elem.VATRate ? elem.VATRate : p.Rate;
                                        fields.Price = typeof (elem.Price) === "number" ? elem.Price : p.Price;
                                        fields.Qty = elem.Qty ? elem.Qty : 1;
                                        let sum = invoiceObj.sum() + fields.Price * fields.Qty;
                                        invoiceObj.sum(sum);
                                        let ext = {
                                            prodType: p.ProductTypeId,
                                            prod: p.ExtFields,
                                            vat: p.VatExtFields
                                        };
                                        fields.ExtFields = JSON.stringify(ext);
                                        return root_item.newObject({
                                            fields: fields
                                        }, dbOpts);
                                    });
                                }));
                        }
                        else
                            if (invoiceObj.invoiceTypeId() === Accounting.InvoiceType.Refund) {
                                throw new Error(`Refunds aren't implemented yet!`);
                            }
                            else
                                throw new Error(`Unknown "InvoiceTypeId": ${invoiceObj.invoiceTypeId()}.`);
                        return rc;
                    }
                })
                .then(() => {
                    return root_obj.save(dbOpts);
                })
                .then(() => {
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);
    }
}

let dbInvoice = null;
exports.InvoiceService = () => {
    return dbInvoice ? dbInvoice : dbInvoice = new DbInvoice();
}
