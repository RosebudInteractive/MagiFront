const _ = require('lodash');
const { DbObject } = require('../../database/db-object');
const { InvoiceService } = require('../../database/db-invoice');
const { UsersService } = require('../../database/db-user');
const { Accounting } = require('../../const/accounting');
const { Product } = require('../../const/product');
const { HttpCode } = require("../../const/http-codes");
const { UsersCache } = require("../../security/users-cache");
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const CHEQUE_REQ_TREE = {
    expr: {
        model: {
            name: "Cheque",
            childs: [
                {
                    dataObject: {
                        name: "ChequeLog"
                    }
                }
            ]
        }
    }
};

const GET_CHEQUE_MSSQL =
    "select c.[Id], c.[UserId], c.[ParentId], c.[ChequeTypeId], ct.[Name] as [TypeName], c.[StateId], cs.[Name] as [StateName], c.[CurrencyId], c.[InvoiceId],\n" +
    "  c.[ReceiptStateId], rs.[Name] as [RcpName], c.[Name], c.[ChequeNum], c.[ChequeDate], c.[ChequeData], c.[IsSaved], c.[Sum], c.[RefundSum],\n" +
    "  cl.[Id] as [LogId], cl.[ResultCode], cl.[Operation], cl.[Request], cl.[Response], cl.[TimeCr]\n" +
    "from[Cheque] c\n" +
    "  left join[ChequeLog] cl on cl.[ChequeId] = c.[Id]\n" +
    "  join[ChequeState] cs on cs.[Id] = c.[StateId]\n" +
    "  join[ChequeType] ct on ct.[Id] = c.[ChequeTypeId]\n" +
    "  left join[ReceiptState] rs on rs.[Id] = c.[ReceiptStateId]\n" +
    "where c.[<%= field %>] = <%= value %>\n" +
    "order by c.[Id], cl.[Id]";

const GET_CHEQUE_MYSQL =
    "select c.`Id`, c.`UserId`, c.`ParentId`, c.`ChequeTypeId`, ct.`Name` as `TypeName`, c.`StateId`, cs.`Name` as `StateName`, c.`CurrencyId`, c.`InvoiceId`,\n" +
    "  c.`ReceiptStateId`, rs.`Name` as `RcpName`, c.`Name`, c.`ChequeNum`, c.`ChequeDate`, c.`ChequeData`, c.`IsSaved`, c.`Sum`, c.`RefundSum`,\n" +
    "  cl.`Id` as `LogId`, cl.`ResultCode`, cl.`Operation`, cl.`Request`, cl.`Response`, cl.`TimeCr`\n" +
    "from`Cheque` c\n" +
    "  left join`ChequeLog` cl on cl.`ChequeId` = c.`Id`\n" +
    "  join`ChequeState` cs on cs.`Id` = c.`StateId`\n" +
    "  join`ChequeType` ct on ct.`Id` = c.`ChequeTypeId`\n" +
    "  left join`ReceiptState` rs on rs.`Id` = c.`ReceiptStateId`\n" +
    "where c.`<%= field %>` = <%= value %>\n" +
    "order by c.`Id`, cl.`Id`";

const DRAFT_CHEQUE_ID = "00000000-0000-0000-0000-000000000000";
const GUID_REG_EXP = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const PAYMENT_CACHE_PREFIX = "pay:";
const CHEQUE_PENDING_PERIOD = 15 * 60; // cheque pending period in sec - 15 min

exports.Payment = class Payment extends DbObject {
    
    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = PAYMENT_CACHE_PREFIX;
        super(opts);
    }

    _getObjById(id, expression, options) {
        var exp = expression || CHEQUE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    _onPreparePaymentFields(id, payment, invoice, userId, options) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onPreparePaymentFields isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onGetPayment(paymentId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onGetPayment isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onCancelPayment(paymentId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onCancelPayment isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onGetRefund(refundId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onGetRefund isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onCapturePayment(paymentId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onCapturePayment isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onCreatePayment(payment) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onCreatePayment isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onCreateRefund(refund) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onCreateRefund isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _getOrCreateInvoice(data, options) {
        let opts = options || {};
        return new Promise(resolve => {
            let rc;
            if (data.InvoiceId)
                rc = { result: "OK", id: data.InvoiceId }
            else
                rc = InvoiceService().insert(data, opts);
            resolve(rc);
        })
            .then(result => {
                return InvoiceService().get(result.id, opts);
            });  
    }

    _getChequeByIdOrCode(id, strFieldFunc, numFieldFunc, dbOpts) {
        return new Promise(resolve => {
            let rc;
            if (typeof (id) === "string") {
                if (id.match(GUID_REG_EXP)) {
                    rc = strFieldFunc(id, dbOpts)
                }
                else {
                    let n = parseInt(id);
                    if (isNaN(n))
                        throw new Error(`Invalig arg "id": ${JSON.stringify(id)}.`);
                    rc = numFieldFunc(n, dbOpts);
                }
            }
            else
                if ((typeof (id) === "number") && (!isNaN(id)))
                    rc = numFieldFunc(id, dbOpts)
                else
                    throw new Error(`Invalig arg "id": ${JSON.stringify(id)}.`);
            resolve(rc);
        });
    }

    _getCheque(id, dbOpts) {
        return this._getChequeByIdOrCode(id,
            (id, dbOpts) => {
                return this._getObjects(CHEQUE_REQ_TREE, { field: "ChequeNum", op: "=", value: id }, dbOpts);
            },
            (id, dbOpts) => {
                return this._getObjById(id, null, dbOpts);
            }, dbOpts);
    }

    get(id, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};

        return new Promise(resolve => {
            let rc = this._getChequeByIdOrCode(id,
                (id, dbOpts) => {
                    return $data.execSql({
                        dialect: {
                            mysql: _.template(GET_CHEQUE_MYSQL)({ field: "ChequeNum", value: `'${id}'` }),
                            mssql: _.template(GET_CHEQUE_MSSQL)({ field: "ChequeNum", value: `'${id}'` })
                        }
                    }, dbOpts);
                },
                (id, dbOpts) => {
                    return $data.execSql({
                        dialect: {
                            mysql: _.template(GET_CHEQUE_MYSQL)({ field: "Id", value: id }),
                            mssql: _.template(GET_CHEQUE_MSSQL)({ field: "Id", value: id })
                        }
                    }, dbOpts);
                }, dbOpts);

            resolve(rc);
        })
            .then(result => {
                let data = [];
                if (result && result.detail && (result.detail.length > 0)) {
                    let currObj = { Id: 0 };
                    result.detail.forEach(elem => {
                        if (currObj.Id !== elem.Id) {
                            currObj = { Id: elem.Id };
                            data.push(currObj);
                            currObj.UserId = elem.UserId;
                            currObj.ParentId = elem.ParentId;
                            currObj.ChequeTypeId = elem.ChequeTypeId;
                            currObj.TypeName = elem.TypeName;
                            currObj.StateId = elem.StateId;
                            currObj.StateName = elem.StateName;
                            currObj.CurrencyId = elem.CurrencyId;
                            currObj.InvoiceId = elem.InvoiceId;
                            currObj.ReceiptStateId = elem.ReceiptStateId;
                            currObj.RcpName = elem.RcpName;
                            currObj.Name = elem.Name;
                            currObj.ChequeNum = elem.ChequeNum;
                            currObj.ChequeDate = elem.ChequeDate;
                            currObj.IsSaved = elem.IsSaved ? true : false;
                            currObj.Sum = elem.Sum;
                            currObj.RefundSum = elem.RefundSum;
                            currObj.ChequeData = elem.ChequeData;
                            if (currObj.ChequeData)
                                try {
                                    currObj.ChequeData = JSON.parse(elem.ChequeData);
                                } catch (err) {
                                    currObj.ChequeData = { error: err.toString(), data: elem.ChequeData };
                                };
                            currObj.Log = [];
                        }
                        let logElem = {};
                        logElem.Id = elem.LogId;
                        logElem.TimeCr = elem.TimeCr;
                        logElem.ResultCode = elem.ResultCode;
                        logElem.Operation = elem.Operation;
                        try {
                            logElem.Request = JSON.parse(elem.Request);
                        } catch (err) {
                            logElem.Request = { error: err.toString(), data: elem.Request };
                        }
                        try {
                            logElem.Response = JSON.parse(elem.Response);
                        } catch (err) {
                            logElem.Response = { error: err.toString(), data: elem.Response };
                        }
                        currObj.Log.push(logElem);
                    });
                }
                return { data: data };
            });
    }

    isChequePaid(chequeData) {
        throw new Error(`Payment::isChequePaid isn't implemented. You shouldn't invoke this method of base class.`);
    }

    getMeta(chequeData) {
        throw new Error(`Payment::getMeta isn't implemented. You shouldn't invoke this method of base class.`);
    }

    cancel(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let inpData = data || {};
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let chequeObj = null;
        let wrongState = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getCheque(id, dbOpts));
            })
                .then(result => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new Error(`Cheque ("id" = "${id}") doesn't exist.`);
                    chequeObj = collection.get(0);
                    if (chequeObj.chequeTypeId() === Accounting.ChequeType.Refund)
                        throw new Error(`Can't cancel refund cheque".`);
                    return this._onGetPayment(chequeObj.chequeNum());
                })
                .then(result => {
                    let res = result;
                    if (!(result && result.cheque && (result.cheque.chequeState === Accounting.ChequeState.WaitForCapture)))
                        wrongState = result.cheque.chequeState
                    else
                        res = this._onCancelPayment(chequeObj.chequeNum());
                    return res;
                })
                .then(result => {
                    return this._updateChequeState(result, root_obj, { chequeObj: chequeObj }, dbOpts, memDbOptions);
                })
        }, memDbOptions)
            .then(result => {
                if (result.isError)
                    throw result.result;
                if (wrongState)
                    throw new Error(`Can't cancel cheque because it's not in "WaitForCapture" state ("StateId" = ${wrongState}).`);
                return inpData.debug ? result.result : { result: "OK" };
            });
    }

    checkAndChangeState(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let inpData = data || {};
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let chequeObj = null;
        let isDone = false;
        let parentCheque = null;
        let isRefund = false;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getCheque(id, dbOpts));
            })
                .then(result => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new Error(`Cheque ("id" = "${id}") doesn't exist.`);
                    chequeObj = collection.get(0);
                    isDone = (typeof (inpData.CheckueStateId) === "number") && (chequeObj.stateId() !== inpData.CheckueStateId);
                    if (!isDone) {
                        isRefund = chequeObj.chequeTypeId() === Accounting.ChequeType.Refund;
                        let rc;
                        if (isRefund) {
                            if (chequeObj.parentId())
                                rc = this._getCheque(chequeObj.parentId(), dbOpts)
                                    .then(result => {
                                        let parent_root = result;
                                        memDbOptions.dbRoots.push(parent_root); // Remember DbRoot to delete it finally in editDataWrapper
                                        let collection = parent_root.getCol("DataElements");
                                        if (collection.count() !== 1)
                                            throw new Error(`Cheque ("payment_id" = "${id}") doesn't exist.`);
                                        parentCheque = collection.get(0);
                                    })
                                    .then(() => {
                                        return this._onGetRefund(chequeObj.chequeNum());
                                    });
                        }
                        else
                            rc = this._onGetPayment(chequeObj.chequeNum());
                        return rc;
                    }
                })
                .then(result => {
                    let rc = {};
                    if (!isDone) {
                        rc = this._updateChequeState(result, root_obj, { chequeObj: chequeObj, parentCheque: parentCheque }, dbOpts, memDbOptions);
                    }
                    return rc;
                })
        }, memDbOptions)        
            .then(result => {
                if (result.isError)
                    throw result.result;
                return inpData.debug ? result.result : { result: "OK" };
            });
    }

    _updateChequeState(req_result, root_obj, cheque, dbOpts, memDbOptions, invoice_data) {
        let chequeObj = cheque.chequeObj;
        let parentCheque = cheque.parentCheque;
        let invoiceData = invoice_data;

        function updateState(reqResult) {
            let dbOptsInt;
            let root_item;
            let isStateChanged = false;
            let rc = root_obj.edit()
                .then(() => {
                    if (parentCheque)
                        return parentCheque.edit();
                })
                .then(() => {
                    isStateChanged = chequeObj.stateId() !== reqResult.cheque.chequeState;
                    chequeObj.stateId(reqResult.cheque.chequeState);
                    if (parentCheque && isStateChanged && (chequeObj.stateId() === Accounting.ChequeState.Succeeded))
                        parentCheque.refundSum(parentCheque.refundSum() + chequeObj.sum());
                    if (reqResult.cheque.chequeDate)
                        chequeObj.chequeDate(reqResult.cheque.chequeDate);
                    if (reqResult.cheque.id)
                        chequeObj.chequeNum(reqResult.cheque.id);
                    if (reqResult.cheque.isSaved)
                        chequeObj.isSaved(reqResult.cheque.isSaved);
                    if (reqResult.cheque.ReceiptStateId)
                        chequeObj.receiptStateId(reqResult.cheque.ReceiptStateId);
                    chequeObj.chequeData(JSON.stringify(reqResult.result));
                    root_item = chequeObj.getDataRoot("ChequeLog");
                    let fields = {
                        ResultCode: HttpCode.OK,
                        Operation: reqResult.operation.operation,
                        Request: JSON.stringify(reqResult.req),
                        Response: JSON.stringify(reqResult.result)
                    };
                    if (reqResult.isErr)
                        fields.ResultCode = reqResult.statusCode ? reqResult.statusCode : HttpCode.ERR_INTERNAL;
                    return root_item.newObject({
                        fields: fields
                    }, dbOpts);
                })
                .then(() => {
                    return $data.tranStart(dbOpts)
                        .then(result => {
                            dbOptsInt = _.cloneDeep(dbOpts);
                            dbOptsInt.transactionId = result.transactionId;
                            memDbOptions.transactionId = result.transactionId; // set transaction to editDataWrapper
                        });
                })
                .then(() => {
                    let rc = Promise.resolve();
                    if (isStateChanged && chequeObj.invoiceId() && (chequeObj.stateId() !== Accounting.ChequeState.Error))
                        rc = rc.then(() => {
                            let data = {
                                ChequeId: chequeObj.id(),
                                StateId: chequeObj.stateId() === Accounting.ChequeState.Succeeded ?
                                    Accounting.InvoiceState.Paid :
                                    (chequeObj.stateId() === Accounting.ChequeState.Canceled ?
                                        Accounting.InvoiceState.Canceled : Accounting.InvoiceState.Approved)
                            };
                            return InvoiceService().update(chequeObj.invoiceId(), data, { dbOptions: dbOptsInt });
                        });
                    return rc
                        .then(() => {
                            return root_obj.save(dbOptsInt);
                        })
                        .then(() => {
                            if (parentCheque)
                                return parentCheque.save(dbOptsInt);
                        });
                });
            return rc.then(() => reqResult);
        }

        async function getInvoiceData(currDbOpts){
            if (!invoiceData) {
                return Promise.resolve()
                    .then(() => {
                        return InvoiceService().get(chequeObj.invoiceId(), { dbOptions: currDbOpts ? currDbOpts : dbOpts });
                    })
                    .then(invoice => {
                        invoiceData = invoice.data && (invoice.data.length === 1) ? invoice.data[0] : null;
                    });
            }
        }

        function updateUserSubscription() {
            //
            // Set subscription data and saved payment
            //
            let rci = Promise.resolve();
            let isRefund = chequeObj.chequeTypeId() === Accounting.ChequeType.Refund;

            if (memDbOptions.transactionId) {
                // Commit internal transaction
                let transactionId = memDbOptions.transactionId;
                delete memDbOptions.transactionId;
                rci = $data.tranCommit(transactionId);
            };
            rci = rci
                .then(() => {
                    return getInvoiceData();
                })
                .then(() => {
                    return UsersCache().getUserInfoById(chequeObj.userId(), true);
                })
                .then(async (user) => {
                    let fields = {};
                    if (chequeObj.isSaved())
                        fields.SubsAutoPayId = chequeObj.id();
                    if (invoiceData) {
                        // Calculate new subscription duration and paid courses list
                        //
                        let duration = null;
                        let prod = null;
                        let paidCourses = [];
                        for (let i = 0; i < invoiceData.Items.length; i++) {
                            let itm = invoiceData.Items[i];
                            if (itm.ExtFields && itm.ExtFields.prod) {
                                switch (itm.ExtFields.prodType) {
                                    case Product.ProductTypes.Subscription:
                                        if (!duration) {
                                            duration = itm.ExtFields.prod;
                                            prod = itm;
                                        }
                                        break;
                                    case Product.ProductTypes.CourseOnLine:
                                        paidCourses.push(itm.ExtFields.prod.courseId)
                                        break;
                                }
                            }
                        }
                        if (duration) {
                            let now = new Date();
                            let current = user.SubsExpDateExt && (user.SubsExpDateExt > now) ? user.SubsExpDate : new Date(now);
                            let sign = isRefund ? -1 : 1;
                            switch (duration.units) {
                                case "d":
                                    current.setDate(current.getDate() + sign * duration.duration);
                                    break;

                                case "m":
                                    current.setMonth(current.getMonth() + sign * duration.duration);
                                    break;

                                case "y":
                                    current.setFullYear(current.getFullYear() + sign * duration.duration);
                                    break;

                                default:
                                    throw new Error(`Invalid "unit": "${duration.units}".`);
                            }
                            fields.SubsExpDate = current > now ? current : null;
                            fields.SubsProductId = fields.SubsExpDate ? prod.ProductId : null;
                        }
                        if (paidCourses.length > 0) {
                            if (!isRefund)
                                for (let i = 0; i < paidCourses.length; i++)
                                    await UsersService().insBookmark(user.Id, paidCourses[i]);
                            let data = {};
                            data[isRefund ? "deleted" : "added"] = paidCourses;
                            await UsersCache().paidCourses(user.Id, data, dbOpts);
                        }
                    }
                    if (Object.keys(fields).length > 0)
                        await UsersCache().editUser(user.Id, { alter: fields }, dbOpts);
                })
            return rci;
        }

        let iniState = chequeObj.stateId();
        return updateState(req_result)
            .then(result => {
                if (chequeObj.stateId() === Accounting.ChequeState.WaitForCapture) {
                    let rc = Promise.resolve();
                    if (memDbOptions.transactionId) {
                        // Commit internal transaction
                        let transactionId = memDbOptions.transactionId;
                        delete memDbOptions.transactionId;
                        rc = $data.tranCommit(transactionId);
                    }
                    rc = rc.
                        then(() => {
                            // Capture payment
                            return this._onCapturePayment(chequeObj.chequeNum());
                        })
                        .then(result => {
                            // Set status "Paid" to cheque and invoice
                            return this._updateChequeState(result, root_obj, cheque, dbOpts, memDbOptions);
                        })
                        .then(result => {
                            iniState = chequeObj.stateId(); // !!! Prevent to invoke "updateUserSubscription" twice
                            return result;
                        });
                    return rc;
                }
                else
                    return result;
            })
            .then(result => {
                let changeUserSubs = (chequeObj.stateId() === Accounting.ChequeState.Succeeded)
                    && (chequeObj.stateId() !== iniState);
                let rc = changeUserSubs ? updateUserSubscription() : Promise.resolve();
                return rc.then(() => result);
            })
            .then(async (result) => {
                if (!result.isError) {
                    // create or remove pending objects
                    let isRefund = chequeObj.chequeTypeId() === Accounting.ChequeType.Refund;
                    if (!isRefund) {
                        let currDbOpts = null;
                        if (memDbOptions.transactionId)
                            currDbOpts = { transactionId: memDbOptions.transactionId };
                        await getInvoiceData(currDbOpts);
                        if (invoiceData) {
                            let flag = chequeObj.stateId() === Accounting.ChequeState.Pending;
                            await this._setPendingObjects(invoiceData, flag);
                        }
                    }
                }
                return result;
            });
    }

    insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let parent_root = null;
        let invoiceData = null;
        let chequeObj = null;
        let parentCheque = null;
        let newId;
        let dbOptsInt;
        let chequeTypeId;
        let refundInvoiceId;
        let isRefund = false;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                let rc;
                if (!(data.Payment || data.Refund))
                    throw new Error(`Missing "Payment" or "Refund" object.`);
                
                chequeTypeId = data.Payment ? Accounting.ChequeType.Payment : Accounting.ChequeType.Refund;

                if (data.Refund) {
                    isRefund = true;
                    if (!data.Refund.payment_id)
                        throw new Error(`Missing argument "payment_id" of "Refund" object.`);
                    rc = this._getCheque(data.Refund.payment_id, dbOpts)
                        .then(result => {
                            parent_root = result;
                            memDbOptions.dbRoots.push(parent_root); // Remember DbRoot to delete it finally in editDataWrapper
                            let collection = parent_root.getCol("DataElements");
                            if (collection.count() !== 1)
                                throw new Error(`Cheque ("payment_id" = "${data.Refund.payment_id}") doesn't exist.`);
                            parentCheque = collection.get(0);
                            data.Refund.payment_id = parentCheque.chequeNum();
                            if (parentCheque.stateId() !== Accounting.ChequeState.Succeeded)
                                throw new Error(`To create refund cheque "${parentCheque.id()}" should be in "Succeeded" state.`);
                            if (parentCheque.invoiceId()) {
                                let inv = { ParentId: parentCheque.invoiceId(), InvoiceTypeId: Accounting.InvoiceType.Refund };
                                if (data.Invoice && data.Invoice.Items)
                                    inv.Items = _.cloneDeep(data.Invoice.Items);
                                return this._getOrCreateInvoice(inv, opts);
                            }
                        })
                }
                else {
                    if (data.Invoice)
                        rc = this._getOrCreateInvoice(data.Invoice, opts);
                }
                resolve(rc);
            })
                .then(async (invoice) => {
                    if (invoice && invoice.data && (invoice.data.length === 1)) {
                        invoiceData = invoice.data[0];
                        if (isRefund)
                            refundInvoiceId = invoiceData.Id
                        else
                            await this._preCheckInvoice(invoiceData);
                    }
                    return this._getObjById(-1, null, dbOpts);
                })
                .then(result => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    return root_obj.newObject({
                        fields: { IsSaved: false, RefundSum: 0 }
                    }, dbOpts);
                })
                .then(result => {
                    newId = result.keyValue;
                    chequeObj = this._db.getObj(result.newObject);
                    return this._onPreparePaymentFields(chequeObj.id(), chequeTypeId,
                        data.Payment ? data.Payment : data.Refund, invoiceData, invoiceData ? invoiceData.UserId : data.UserId, options);
                })
                .then(result => {
                    if (parentCheque)
                        chequeObj.parentId(parentCheque.id());
                    chequeObj.chequeNum(DRAFT_CHEQUE_ID);
                    chequeObj.stateId(Accounting.ChequeState.Draft);
                    for (let key in result.fields) {
                        chequeObj[this._genGetterName(key)](result.fields[key]);
                    }
                    return root_obj.save(dbOpts)
                        .then(() => result.paymentObject);
                })
                .then(paymentObject => {
                    return chequeTypeId === Accounting.ChequeType.Payment ?
                        this._onCreatePayment(paymentObject) : this._onCreateRefund(paymentObject);
                })
                .then(result => {
                    return this._updateChequeState(result, root_obj, { chequeObj: chequeObj, parentCheque: parentCheque }, dbOpts, memDbOptions);
                })
        }, memDbOptions)
            .then(async (result) => {
                let rc;
                if (result.isError) {
                    rc = Promise.resolve()
                        .then(() => {
                            if (refundInvoiceId)
                                return InvoiceService().rollbackRefund(refundInvoiceId)
                                    .catch(err => {
                                        console.error(`Error in "InvoiceService().rollbackRefund" call: ` +
                                            `${err && err.message ? err.message : JSON.stringify(err)}`);
                                    });
                        })
                        .then(() => {
                            result.result.newId = newId;
                            throw result.result;
                        });
                }
                else {
                    rc = opts.fullResult ? result.result : (result.confirmationUrl ? { confirmationUrl: result.confirmationUrl } :
                        (opts.debug ? result.result : { result: "OK" }));
                }
                return rc;
            });
    }

    async getPendingObjects(user_id) {
        let key = `crs:${user_id}`;
        let userPending = await this.cacheGet(key, { json: true });
        return userPending ? userPending : {};
    }

    async _preCheckInvoice(invoice_data) {
        if (invoice_data.Items && (invoice_data.Items.length > 0)) {
            let inv_courses = [];
            for (let i = 0; i < invoice_data.Items.length; i++) {
                let item = invoice_data.Items[i];
                if (item.ExtFields && (item.ExtFields.prodType === Product.ProductTypes.CourseOnLine)
                    && item.ExtFields.prod && item.ExtFields.prod.courseId) {
                    inv_courses.push({
                        id: item.ExtFields.prod.courseId,
                        name: item.Name
                    });
                }
            }
            if (inv_courses.length > 0) {
                let pending = await this.getPendingObjects(invoice_data.UserId);
                let bought = {};
                    let userService = this.getService("users", true);
                if (userService)
                    bought = await userService.getPaidCourses(invoice_data.UserId, false, { is_list: true });
                for (let i = 0; i < inv_courses.length; i++){
                    let crs = inv_courses[i];
                    if (bought[crs.id])
                        throw new Error(`${crs.name} уже куплен.`);
                    if (pending[crs.id])
                        throw new Error(`${crs.name} ожидает завершения операции оплаты.`);
                }
           }
        }
    }

    async _setPendingObjects(invoice_data, flag) {
        let currList = null;
        let key = `crs:${invoice_data.UserId}`;
        let self = this;

        async function getCurrent() {
            if (!currList) {
                let userPending = await self.cacheGet(key, { json: true });
                currList = userPending ? userPending : {};
            }
            return currList;
        }

        if (invoice_data.Items && (invoice_data.Items.length > 0)) {
            for (let i = 0; i < invoice_data.Items.length; i++) {
                let item = invoice_data.Items[i];
                if (item.ExtFields && (item.ExtFields.prodType === Product.ProductTypes.CourseOnLine)
                    && item.ExtFields.prod && item.ExtFields.prod.courseId) {
                    await getCurrent();
                    if (flag)
                        currList[item.ExtFields.prod.courseId] = 1
                    else
                        delete currList[item.ExtFields.prod.courseId];
                }
            }
            if (currList)
                if (Object.keys(currList).length > 0)
                    await this.cacheSet(key, currList, { json: true, ttlInSec: CHEQUE_PENDING_PERIOD })
                else
                    await this.cacheDel(key);
        }
    }
}