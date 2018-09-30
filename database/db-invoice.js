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
    "select i.[Id], i.[UserId], i.[ParentId], i.[InvoiceTypeId], i.[StateId], i.[CurrencyId], i.[ChequeId], i.[Name],\n" +
    "  i.[Description], i.[InvoiceNum], i.[InvoiceDate], i.[Sum], i.[RefundSum], it.[Id] as [ItemId], it.[ProductId],\n" +
    "  it.[VATTypeId], it.[Code], it.[Name] as [ItemName], it.[VATRate], it.[Price], it.[Qty], it.[RefundQty], it.[ExtFields]\n" +
    "from[Invoice] i\n" +
    "  join[InvoiceItem] it on it.[InvoiceId] = i.[Id]\n" +
    "where i.[Id] = <%= id %>";

const GET_INVOICE_MYSQL =
    "select i.`Id`, i.`UserId`, i.`ParentId`, i.`InvoiceTypeId`, i.`StateId`, i.`CurrencyId`, i.`ChequeId`, i.`Name`,\n" +
    "  i.`Description`, i.`InvoiceNum`, i.`InvoiceDate`, i.`Sum`, i.`RefundSum`, it.`Id` as `ItemId`, it.`ProductId`,\n" +
    "  it.`VATTypeId`, it.`Code`, it.`Name` as `ItemName`, it.`VATRate`, it.`Price`, it.`Qty`, it.`RefundQty`, it.`ExtFields`\n" +
    "from`Invoice` i\n" +
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

    insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
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
                    }, opts);
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
                                        }, opts);
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
                    return root_obj.save(opts);
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
