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

const convertToInt = (val) => {
    let rc;
    switch (typeof (val)) {
        case "string":
            rc = parseInt(val);
            break;
        case "number":
            rc = val;
            break;
    };
    return rc;
}

const GET_INVOICE_MSSQL =
    "select i.[Id], i.[UserId], i.[ParentId], i.[InvoiceTypeId], i.[StateId], i.[CurrencyId], c.[Code] as [CCode], i.[ChequeId], i.[Name],\n" +
    "  i.[Description], i.[InvoiceNum], i.[InvoiceDate], i.[Sum], i.[RefundSum], it.[Id] as [ItemId], it.[ProductId],\n" +
    "  it.[VATTypeId], it.[Code], it.[Name] as [ItemName], it.[VATRate], it.[Price], it.[Qty], it.[RefundQty], it.[ExtFields]\n" +
    "from[Invoice] i\n" +
    "  join[Currency] c on c.[Id] = i.[CurrencyId]\n" +
    "  left join[InvoiceItem] it on it.[InvoiceId] = i.[Id]<%= filter %>\n" +
    "order by i.[InvoiceDate] desc, i.[Id]";

const GET_INVOICE_FILTER_MSSQL = {
    id: { field: "id", cond: "i.[Id] = <%= id %>" },
    state_id: { field: "state_id", cond: "i.[StateId] = <%= state_id %>", conv: convertToInt },
    user_id: { field: "user_id", cond: "i.[UserId] = <%= user_id %>", conv: convertToInt }
};

const GET_INVOICE_MYSQL =
    "select i.`Id`, i.`UserId`, i.`ParentId`, i.`InvoiceTypeId`, i.`StateId`, i.`CurrencyId`, c.`Code` as `CCode`, i.`ChequeId`, i.`Name`,\n" +
    "  i.`Description`, i.`InvoiceNum`, i.`InvoiceDate`, i.`Sum`, i.`RefundSum`, it.`Id` as `ItemId`, it.`ProductId`,\n" +
    "  it.`VATTypeId`, it.`Code`, it.`Name` as `ItemName`, it.`VATRate`, it.`Price`, it.`Qty`, it.`RefundQty`, it.`ExtFields`\n" +
    "from`Invoice` i\n" +
    "  join`Currency` c on c.`Id` = i.`CurrencyId`\n" +
    "  left join`InvoiceItem` it on it.`InvoiceId` = i.`Id`<%= filter %>\n" +
    "order by i.`InvoiceDate` desc, i.`Id`";

const GET_INVOICE_FILTER_MYSQL = {
    id: { field: "id", cond: "i.`Id` = <%= id %>" },
    state_id: { field: "state_id", cond: "i.`StateId` = <%= state_id %>", conv: convertToInt },
    user_id: { field: "user_id", cond: "i.`UserId` = <%= user_id %>", conv: convertToInt }
};

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
        let filter = options && options.filter ? _.cloneDeep(options.filter) : {};
        let dbOpts = opts.dbOptions || {};
        let filter_mysql = "";
        let filter_mssql = "";
        return new Promise(resolve => {
            let ncond_mysql = 0;
            let ncond_mssql = 0;
            if ((typeof (id) === "number") && (id > 0) && (!isNaN(id)))
                filter.id = id;
            for (let key in filter) {
                if (GET_INVOICE_FILTER_MYSQL[key]) {
                    if (!ncond_mysql)
                        filter_mysql = "\nwhere "
                    else
                        filter_mysql += "\n  and ";
                    ncond_mysql++;
                    let data = {}
                    let conv = GET_INVOICE_FILTER_MYSQL[key].conv;
                    data[GET_INVOICE_FILTER_MYSQL[key].field] = conv ? conv(filter[key]) : filter[key];
                    filter_mysql += "(" + _.template(GET_INVOICE_FILTER_MYSQL[key].cond)(data) + ")";
                }
                if (GET_INVOICE_FILTER_MSSQL[key]) {
                    if (!ncond_mssql)
                        filter_mssql = "\nwhere "
                    else
                        filter_mssql += "\n  and ";
                    ncond_mssql++;
                    let data = {}
                    let conv = GET_INVOICE_FILTER_MSSQL[key].conv;
                    data[GET_INVOICE_FILTER_MSSQL[key].field] = conv ? conv(filter[key]) : filter[key];
                    filter_mssql += "(" + _.template(GET_INVOICE_FILTER_MSSQL[key].cond)(data) + ")";
                }
            }
            let rc = $data.execSql({
                dialect: {
                    mysql: _.template(GET_INVOICE_MYSQL)({ filter: filter_mysql }),
                    mssql: _.template(GET_INVOICE_MSSQL)({ filter: filter_mssql })
                }
            }, dbOpts);
            resolve(rc);
        })
            .then(result => {
                let inv = { data: null };
                if (result && result.detail && (result.detail.length > 0)) {
                    inv.data = [];
                    let invoice;
                    let currId = -1;
                    result.detail.forEach(elem => {
                        if (currId !== elem.Id) {
                            currId = elem.Id;
                            invoice = {};
                            inv.data.push(invoice);
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
                        if (typeof (elem.ItemId) === "number")
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
                        if ((currStateId === Accounting.InvoiceState.Canceled) || (currStateId === Accounting.InvoiceState.Paid))
                            throw new Error(`Can't change field "StateId" from "${this._stateIdToString(currStateId)}" to "${this._stateIdToString(newStateId)}".`);
                    if (typeof (inpFields.CurrencyId) !== "undefined")
                        if (currStateId === Accounting.InvoiceState.Draft)
                            invoiceObj.currencyId(inpFields.CurrencyId)
                        else
                            throw new Error(`Can't modify field "StateId" in state "${this._stateIdToString(currStateId)}".`);
                    if (typeof (inpFields.ChequeId) !== "undefined")
                        if ((currStateId !== Accounting.InvoiceState.Paid) && (currStateId !== Accounting.InvoiceState.Canceled))
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

                    if (inpFields.Items && (invoiceObj.invoiceTypeId() !== Accounting.InvoiceType.Refund))
                        throw new Error(`Can't modify "Items" in "Purchase return" invoice.`);

                    if (inpFields.Items && (currStateId !== Accounting.InvoiceState.Draft))
                        throw new Error(`Can't modify "Items" in a state "${this._stateIdToString(currStateId)}".`);

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
        let root_parent = null;
        let inpFields = data || {};
        let invoiceObj = null;
        let newId;
        let root_item = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, null, dbOpts));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    let fields = {
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
                        fields.InvoiceTypeId = inpFields.InvoiceTypeId
                    else
                        throw new Error(`Missing field "InvoiceTypeId"`);
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
                    root_item = invoiceObj.getDataRoot("InvoiceItem");

                    switch (invoiceObj.invoiceTypeId()) {
                        case Accounting.InvoiceType.Purchase:
                            if (!invoiceObj.invoiceNum())
                                invoiceObj.invoiceNum(newId + "/" + invoiceObj.userId());
                            if (!invoiceObj.name()) {
                                let name = `Заказ №${invoiceObj.invoiceNum()}`;
                                invoiceObj.name(name);
                            }
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
                                if (!field)
                                    throw new Error(`Missing field "ProductId" or "Code" in "item" array.`);
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
                                return rc;
                            }
                            break;

                        case Accounting.InvoiceType.Refund:
                            if (!invoiceObj.parentId())
                                throw new Error(`Field "ParenId" is missing.`);
                            let parentInvoice = null;
                            let parent_item_collection = null;
                            return this._getObjById(invoiceObj.parentId(), null, dbOpts)
                                .then(result => {
                                    root_parent = result;
                                    memDbOptions.dbRoots.push(root_parent); // Remember DbRoot to delete it finally in editDataWrapper
                                    let collection = root_parent.getCol("DataElements");
                                    if (collection.count() !== 1)
                                        throw new Error("Invoice (Id = " + invoiceObj.parentId() + ") doesn't exist.");
                                    parentInvoice = collection.get(0);
                                    parent_item_collection = parentInvoice.getDataRoot("InvoiceItem").getCol("DataElements");
                                    return root_parent.edit();
                                })
                                .then(() => {
                                    if (parentInvoice.stateId() !== Accounting.InvoiceState.Paid)
                                        throw new Error(`Invoice "${parentInvoice.name()}" should be payed.`);
                                        
                                    invoiceObj.userId(parentInvoice.userId());
                                    if (!invoiceObj.invoiceNum())
                                        invoiceObj.invoiceNum(newId + "/" + invoiceObj.userId());
                                    if (!invoiceObj.name()) {
                                        let name = `Возврат №${invoiceObj.invoiceNum()}`;
                                        invoiceObj.name(name);
                                    }
                                    let item_list = {};
                                    let item_array = [];
                                    for (let i = 0; i < parent_item_collection.count(); i++) {
                                        let itm = parent_item_collection.get(i);
                                        let qty = itm.qty() - itm.refundQty();
                                        if (qty > 0) {
                                            let obj = { Qty: qty, obj: itm };
                                            item_list[itm.id()] = obj
                                            item_array.push(obj);
                                        }
                                    }
                                    if (inpFields.Items && (inpFields.Items.length > 0)) {
                                        item_array = [];
                                        inpFields.Items.forEach(elem => {
                                            let id = elem.Id;
                                            if (!id)
                                                throw new Error(`Missing or invalid field "Id" in "Items" array.`);
                                            let obj = item_list[id];
                                            if (!obj)
                                                throw new Error(`Missing item "Id=${id}" in "${parentInvoice.name()}".`);
                                            if (elem.Qty) {
                                                if (elem.Qty > obj.Qty)
                                                    throw new Error(`Can't return "Qty=${elem.Qty}". Max allowed: ${obj.Qty}, item: "${obj.name()}".`);
                                                obj.Qty = elem.Qty;
                                            }
                                            item_array.push(obj);
                                        })
                                    }
                                    if (item_array.length === 0)
                                        throw new Error(`There are no items to return in "${parentInvoice.name()}".`);
                                    
                                    return Utils.seqExec(item_array, (elem) => {
                                        let fields = { RefundQty: 0 };
                                        fields.ParentId = elem.obj.id();
                                        fields.ProductId = elem.obj.productId();
                                        fields.VATTypeId = elem.obj.vATTypeId();
                                        fields.Code = elem.obj.code();
                                        fields.Name = elem.obj.name();
                                        fields.VATRate = elem.obj.vATRate();
                                        fields.Price = elem.obj.price();
                                        fields.Qty = elem.Qty;
                                        elem.obj.refundQty(elem.obj.refundQty() + elem.Qty);
                                        let sum = fields.Price * fields.Qty;
                                        invoiceObj.sum(invoiceObj.sum() + sum);
                                        parentInvoice.refundSum(parentInvoice.refundSum() + sum);
                                        fields.ExtFields = elem.obj.extFields();
                                        return root_item.newObject({
                                            fields: fields
                                        }, dbOpts);
                                    });
                                })
                            break;

                        default:
                            throw new Error(`Unknown "InvoiceTypeId": ${invoiceObj.invoiceTypeId()}.`);
                    }
                })
                .then(() => {
                    let dbOptsInt;
                    return $data.tranStart(dbOpts)
                        .then(result => {
                            dbOptsInt = _.cloneDeep(dbOpts);
                            dbOptsInt.transactionId = result.transactionId;
                            memDbOptions.transactionId = result.transactionId; // set transaction to editDataWrapper
                        })
                        .then(() => {
                            return root_obj.save(dbOptsInt);
                        })
                        .then(() => {
                            if (root_parent)
                                return root_parent.save(dbOptsInt);
                        })
                })
                .then(() => {
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);
    }

    rollbackRefund(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let root_parent = null;
        let invoiceObj = null;
        let invId;
        let root_item = null;

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
                    if (invoiceObj.invoiceTypeId() !== Accounting.InvoiceType.Refund)
                        throw new Error("Invoice (Id = " + invId + ") isn't of \"Refund\" type.");
                    if (!invoiceObj.parentId())
                        throw new Error(`Field "ParenId" is missing.`);
                    if (invoiceObj.stateId() !== Accounting.InvoiceState.Draft)
                        throw new Error(`Invoice "${invoiceObj.name()}" should be in "\Draft\" state.`);
                    let parentInvoice = null;
                    let parent_item_collection = null;
                    let item_collection = root_item.getCol("DataElements");
                    return this._getObjById(invoiceObj.parentId(), null, dbOpts)
                        .then(result => {
                            root_parent = result;
                            memDbOptions.dbRoots.push(root_parent); // Remember DbRoot to delete it finally in editDataWrapper
                            let collection = root_parent.getCol("DataElements");
                            if (collection.count() !== 1)
                                throw new Error("Invoice (Id = " + invoiceObj.parentId() + ") doesn't exist.");
                            parentInvoice = collection.get(0);
                            parent_item_collection = parentInvoice.getDataRoot("InvoiceItem").getCol("DataElements");
                            return root_parent.edit();
                        })
                        .then(() => {
                            if (parentInvoice.stateId() !== Accounting.InvoiceState.Paid)
                                throw new Error(`Invoice "${parentInvoice.name()}" should be payed.`);

                            if (invoiceObj.sum() > parentInvoice.refundSum())
                                throw new Error(`Invalid \"RefundSum\" in "${parentInvoice.name()}" or \"Sum\" in "${invoiceObj.name()}".`);
                            parentInvoice.refundSum(parentInvoice.refundSum() - invoiceObj.sum());

                            let item_list = {};
                            let item_array = [];
                            for (let i = 0; i < parent_item_collection.count(); i++) {
                                let itm = parent_item_collection.get(i);
                                let qty = itm.refundQty();
                                if (qty > 0)
                                    item_list[itm.id()] = itm;
                            }
                            for (let i = 0; i < item_collection.count(); i++) {
                                let itm = item_collection.get(i);
                                let obj = item_list[itm.parentId()];
                                if (!obj)
                                    throw new Error(`Missing item "Id=${itm.parentId()}" in "${parentInvoice.name()}".`);

                                let qty = obj.refundQty()-itm.qty();
                                if (qty >= 0)
                                    obj.refundQty(qty)
                                else
                                    throw new Error(`Invalid \"RefundQty\" - item "Id=${itm.parentId()}" in "${parentInvoice.name()}".`);
                            }
                        })
                })
                .then(() => {
                    return root_parent.save(dbOpts);
                })
                .then(() => {
                    return { result: "OK", id: invId };
                })
        }, memDbOptions);
    }
}

let dbInvoice = null;
exports.InvoiceService = () => {
    return dbInvoice ? dbInvoice : dbInvoice = new DbInvoice();
}
