const _ = require('lodash');
const { DbObject } = require('../../database/db-object');
const { InvoiceService } = require('../../database/db-invoice');
const { Accounting } = require('../../const/accounting');
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

const DRAFT_CHEQUE_ID = "00000000-0000-0000-0000-000000000000";
const GUID_REG_EXP = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

exports.Payment = class Payment extends DbObject {
    
    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || CHEQUE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    _onPreparePaymentFields(id, payment, invoice, userId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onPreparePaymentFields isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onGetPayment(paymentId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onGetPayment isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onCapturePayment(paymentId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onCapturePayment isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    _onCreatePayment(payment, invoice) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onCreatePayment isn't implemented. You shouldn't invoke this method of base class.`));
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

    _getChequeByIdOrCode(id, dbOpts) {
        let rc;
        let searchField = "Id";
        if (typeof (id) === "string") {
            if (id.match(GUID_REG_EXP)) {
                searchField = "ChequeNum";
                rc = this._getObjects(CHEQUE_REQ_TREE, { field: searchField, op: "=", value: id }, dbOpts)
            }
            else {
                let n = parseInt(id);
                if (isNaN(n))
                    throw new Error(`Invalig arg "id": ${JSON.stringify(id)}.`);
                rc = this._getObjById(n, null, dbOpts);
            }
        }
        else
            if (typeof (id) === "number")
                rc = this._getObjById(n, null, dbOpts)
            else
                throw new Error(`Invalig arg "id": ${JSON.stringify(id)}.`);
        return rc;
    }

    checkAndChangeState(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let inpData = data || {};
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let chequeObj = null;
        let isDone = false;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getChequeByIdOrCode(id, dbOpts));
            })
                .then(result => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new Error(`Cheque (${searchField} = "${id}") doesn't exist.`);
                    chequeObj = collection.get(0);
                    isDone = (typeof (inpData.CheckueStateId) === "number") && (chequeObj.stateId() !== inpData.CheckueStateId);
                    if (!isDone) {
                        return this._onGetPayment(chequeObj.chequeNum());
                    }
                })
                .then(result => {
                    let rc = {};
                    if (!isDone) {
                        rc = this._updateChequeState(result, root_obj, chequeObj, dbOpts, memDbOptions);
                    }
                    return rc;
                })
        }, memDbOptions)        
            .then(result => {
                if (result.isError)
                    throw result.result;
                return result.result;
            });
    }

    _updateChequeState(req_result, root_obj, chequeObj, dbOpts, memDbOptions, invoiceData) {

        function updateState(reqResult) {
            let dbOptsInt;
            let root_item;
            let isStateChanged = false;
            let rc = root_obj.edit()
                .then(() => {
                    isStateChanged = chequeObj.stateId() !== reqResult.cheque.chequeState;
                    chequeObj.stateId(reqResult.cheque.chequeState);
                    if (reqResult.cheque.chequeDate)
                        chequeObj.chequeDate(reqResult.cheque.chequeDate);
                    if (reqResult.cheque.id)
                        chequeObj.chequeNum(reqResult.cheque.id);
                    if (reqResult.cheque.isSaved)
                        chequeObj.isSaved(reqResult.cheque.isSaved);
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
                                    Accounting.InvoiceState.Payed : Accounting.InvoiceState.Approved
                            };
                            return InvoiceService().update(chequeObj.invoiceId(), data, { dbOptions: dbOptsInt });
                        });
                    return rc.then(() => {
                        return root_obj.save(dbOptsInt);
                    });
                });
            return rc.then(() => reqResult);
        }

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
                            return this._updateChequeState(result, root_obj, chequeObj, dbOpts, memDbOptions);
                        })
                        .then(result => {
                            //
                            // Set subscription data and saved payment
                            //
                            let rci = Promise.resolve();
                            if (memDbOptions.transactionId) {
                                // Commit internal transaction
                                let transactionId = memDbOptions.transactionId;
                                delete memDbOptions.transactionId;
                                rci = $data.tranCommit(transactionId);
                            };
                            if (!invoiceData) {
                                rci = rci
                                    .then(() => {
                                        return InvoiceService().get(chequeObj.invoiceId(), { dbOptions: dbOpts });
                                    })
                                    .then(invoice => {
                                        invoiceData = invoice.data;
                                    });
                            }
                            rci = rci
                                .then(() => {
                                    return UsersCache().getUserInfoById(chequeObj.userId(), true);
                                })
                                .then(user => {
                                    let fields = {};
                                    if (chequeObj.isSaved())
                                        fields.SubsAutoPayId = chequeObj.id();
                                    if (invoiceData) {
                                        // Calculate new subscription duration
                                        //
                                        let duration = null;
                                        let prod = null;
                                        for (let i = 0; i < invoiceData.Items.length; i++){
                                            let itm = prod = invoiceData.Items[i];
                                            if (itm.ExtFields && itm.ExtFields.prod &&
                                                (itm.ExtFields.prodType === Accounting.SubsProdType)) {
                                                duration = itm.ExtFields.prod;
                                                break;
                                            }
                                        }
                                        if (duration) {
                                            let current = user.SubsExpDate ? user.SubsExpDate : (new Date());
                                            switch (duration.units) {
                                                case "d":
                                                    current.setDate(current.getDate() + duration.duration);
                                                    break;

                                                case "m":
                                                    current.setMonth(current.getMonth() + duration.duration);
                                                    break;

                                                case "y":
                                                    current.setFullYear(current.getFullYear() + duration.duration);
                                                    break;

                                                default:
                                                    throw new Error(`Invalid "unit": "${duration.units}".`);
                                            }
                                            fields.SubsExpDate = current;
                                            fields.SubsProductId = prod.ProductId;
                                        }
                                    }
                                    if (Object.keys(fields).length > 0) {
                                        return UsersCache().editUser(user.Id, { alter: fields }, dbOpts);
                                    }
                                })
                            return rci.then(() => result);
                        });
                    return rc;
                }
                else
                    return result;
            })
    }

    insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let invoiceData = null;
        let chequeObj = null;
        let newId;
        let dbOptsInt;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                let rc;
                if (!data.Payment)
                    throw new Error(`Missing "Payment" object.`);
                if (data.Invoice)
                    rc = this._getOrCreateInvoice(data.Invoice, opts);
                resolve(rc);
            })
                .then(invoice => {
                    if (invoice && invoice.data)
                        invoiceData = invoice.data;
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
                    return this._onPreparePaymentFields(chequeObj.id(),
                        data.Payment, invoiceData, invoiceData ? invoiceData.UserId : data.UserId);
                })
                .then(result => {
                    chequeObj.chequeNum(DRAFT_CHEQUE_ID);
                    chequeObj.stateId(Accounting.ChequeState.Draft);
                    for (let key in result.fields) {
                        chequeObj[this._genGetterName(key)](result.fields[key]);
                    }
                    return root_obj.save(dbOpts)
                        .then(() => result.paymentObject);
                })
                .then(paymentObject => {
                    return this._onCreatePayment(paymentObject);
                })
                .then(result => {
                    return this._updateChequeState(result, root_obj, chequeObj, dbOpts, memDbOptions);
                })
        }, memDbOptions)
            .then(result => {
                if (result.isError)
                    throw result.result;
                let rc = result.confirmationUrl ? { confirmationUrl: result.confirmationUrl } : result.result;
                return rc;
            });
    }
}