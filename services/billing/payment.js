const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const _ = require('lodash');
const config = require('config');
const randomstring = require('randomstring');
const { buildLogString, validateEmail } = require('../../utils');
const { SendMail } = require('../../mail');
const { DbObject } = require('../../database/db-object');
const { ProductService } = require('../../database/db-product');
const { InvoiceService } = require('../../database/db-invoice');
const { UsersService } = require('../../database/db-user');
const { Accounting } = require('../../const/accounting');
const { Product } = require('../../const/product');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { UsersCache } = require("../../security/users-cache");
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const { sendEvent: mrktSendEvent } = require('../../database/mrkt-system');
const PURCHASE_MAILING_PATH = "mailing/purchase-course";
const PROMO_MAILING_PATH = "mailing/purchase-promo";

const PROMO_MAIL_CFG_NAME = "promoCourse";
const PURCHASE_MAIL_CFG_NAME = "purchaseCourse";
const PROMO_CODE_LENGTH = 13;

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
    "  c.[ReceiptEmail], c.[ReceiptPhone],\n" +
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
    "  c.`ReceiptEmail`, c.`ReceiptPhone`,\n" +
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
const DFLT_CHEQUE_PENDING_PERIOD = 15 * 60; // cheque pending period in sec - 15 min

const IGNORE_PENDING_PAYMENTS = true;

exports.Payment = class Payment extends DbObject {

    get chequePendingPeriod() {
        return this._chequePendingPeriod;
    }

    get paymentType() {
        return Accounting.PaymentSystem.Unknown;
    }

    constructor(options) {
        let opts = _.cloneDeep(options || {});
        opts.cache = opts.cache ? opts.cache : {};
        if (!opts.cache.prefix)
            opts.cache.prefix = PAYMENT_CACHE_PREFIX;

        super(opts);
        this._chequePendingPeriod = DFLT_CHEQUE_PENDING_PERIOD;
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

    _onGetPaymentReceipt(paymentId, chequeTypeId) {
        return new Promise(reject => {
            reject(new Error(`Payment::_onGetPaymentReceipt isn't implemented. You shouldn't invoke this method of base class.`));
        })
    }

    async _createStrikePromo(chequeObj) {
        let result = {};
        if (config.has("billing.strikePromo")) {
            let opts = config.get("billing.strikePromo");
            let promoService = this.getService("promo");
            if (promoService && Array.isArray(opts.values) && (opts.values.length > 0)) {
                let prefix = opts.prefix ? opts.prefix : "STP";
                let key = opts.key ? opts.key : "STRIKE_PROMO";
                let durationInHours = opts.durationInHours ? opts.durationInHours : 49;

                let curr_idx = 0;
                let promo_id = chequeObj.promoCodeId();
                if (promo_id) {
                    let promo = await promoService.get({ id: promo_id });
                    if (promo.length === 1) {
                        let data = promo[0];
                        if (data.Description === key) {
                            curr_idx = -1;
                            for (let i = 0; i < opts.values.length; i++){
                                if (data.Perc === opts.values[i].value) {
                                    curr_idx = i + 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                if ((curr_idx >= 0) && (curr_idx < opts.values.length)) {
                    if ((PROMO_CODE_LENGTH - prefix.length) > 0) {
                        let code = `${prefix}` +
                            `${randomstring.generate({
                                length: (PROMO_CODE_LENGTH - prefix.length),
                                charset: "alphanumeric",
                                capitalization: "uppercase"
                            })}`;
                        let first_date = new Date();
                        let last_date = new Date(first_date);
                        last_date.setHours(last_date.getHours() + durationInHours);
                        let promo_data = {
                            Code: code,
                            Perc: opts.values[curr_idx].value,
                            Counter: 1,
                            Description: key,
                            FirstDate: first_date,
                            LastDate: last_date,
                            IsVisible: false
                        };

                        let promo_res = await promoService.insert(promo_data, opts);
                        result.promo = promo_res.Code;
                        result.subject = `Вы получили скидку ${promo_res.Perc}% на следующий курс`;
                        result.lvl = curr_idx + 1;
                    }
                }
            }
        }
        return result;
    }

    async _sendPurchaseEventToMrktSystem(user, course_id, chequeObj, options) {
        let result = null;
        try {
            let opts = options || {};
            let courseService = this.getService("courses");
            let course = await courseService.getPublic(course_id);
            let category = course.Categories && Array.isArray(course.Categories)
                && (course.Categories.length > 0) ? course.Categories[0].Name : "";
            let author = course.Authors && Array.isArray(course.Authors)
                && (course.Authors.length > 0) ? `${course.Authors[0].FirstName} ${course.Authors[0].LastName}` : "";
            let event = {
                type: "purchase",
                id: chequeObj ? chequeObj.id() : 0,
                user_id: user.Id,
                revenue: chequeObj ? chequeObj.sum() : 0,
                coupon: chequeObj && chequeObj.promoCode()? chequeObj.promoCode() : null,
                products: [
                    {
                        id: course_id,
                        name: course.Name,
                        category: category,
                        brand: author
                    }
                ]
            }
            result = await mrktSendEvent(event, opts);
        }
        catch (err) {
            console.error(buildLogString(`Payment::_sendPurchaseEventToMrktSystem: ${err}`));
            result = err;
        }
        return result;
    }

    async _sendEmailPurchaseNotification(dataObj, is_gift, course_id, options) {
        let result = null;
        try {
            let email = typeof (dataObj) === "string" ? dataObj : dataObj.receiptEmail();
            if (config.has(`mail.${PURCHASE_MAIL_CFG_NAME}`)) {
                let opts = options || {};
                let dbOpts = opts.dbOpts ? opts.dbOpts : {};
                let user_name = opts.userName && (!validateEmail(opts.userName)) ? opts.userName : null;
                let params = { username: user_name };
                let subject;
                if ((!is_gift) && (typeof (dataObj.promoCode) === "function")) {
                    let promo_params = await this._createStrikePromo(dataObj);
                    if (promo_params.subject) {
                        subject = promo_params.subject;
                        delete promo_params.subject;
                    }
                    params = _.defaultsDeep(params, promo_params);
                }
                let courseService = this.getService("courses");
                let { body, subject: crs_subject } = await courseService.courseMailData(course_id, PURCHASE_MAILING_PATH, {
                    params: params,
                    mailCfg: config.get(`mail.${PURCHASE_MAIL_CFG_NAME}`),
                    dbOpts: dbOpts
                });
                let mailOptions = {
                    disableUrlAccess: false,
                    from: config.mail[PURCHASE_MAIL_CFG_NAME].sender, // sender address
                    to: email, // list of receivers
                    subject: subject ? subject:crs_subject, // Subject line
                    html: body // html body
                };
                let mailResult = await SendMail(PURCHASE_MAIL_CFG_NAME, mailOptions);
                if (mailResult && mailResult.msgUrl)
                    console.error(buildLogString(`### Course purchase email: ${mailResult.msgUrl}`));
                result = mailResult;
            }
        }
        catch (err) {
            console.error(buildLogString(`Payment::_sendEmailPurchaseNotification: ${err}`));
            result = err;
        }
        return result;
    }
    
    async _sendPromoCodeViaEmail(email, promo_product, options) {
        let result = null;
        try {
            if (config.has(`mail.${PROMO_MAIL_CFG_NAME}`)) {
                let opts = options || {};
                let dbOpts = opts.dbOpts ? opts.dbOpts : {};
                let user_name = opts.userName && (!validateEmail(opts.userName)) ? opts.userName : null;
                let courseService = this.getService("courses");
                let { body, subject } = await courseService.courseMailData(promo_product.courseId, PROMO_MAILING_PATH, {
                    params: { username: user_name, promo: promo_product.promoCode },
                    mailCfg: config.get(`mail.${PROMO_MAIL_CFG_NAME}`),
                    dbOpts: dbOpts
                });
                let mailOptions = {
                    disableUrlAccess: false,
                    from: config.mail[PROMO_MAIL_CFG_NAME].sender, // sender address
                    to: email, // list of receivers
                    subject: subject, // Subject line
                    html: body // html body
                };
                let mailResult = await SendMail(PROMO_MAIL_CFG_NAME, mailOptions);
                if (mailResult && mailResult.msgUrl)
                    console.error(buildLogString(`### Promo-code email: ${mailResult.msgUrl}`));
                result = mailResult;
            }
        }
        catch (err) {
            console.error(buildLogString(`Payment::_sendPromoCodeViaEmail: ${err}`));
            result = err;
        }
        return result;
    }

    async _createPromoProduct(orig_product, options) {
        let opts = options || {};
        let code = randomstring.generate({ length: PROMO_CODE_LENGTH, charset: "alphanumeric", capitalization: "uppercase" });

        let courseData;
        let courseService = this.getService("courses");
        if (orig_product.ExtFields && orig_product.ExtFields.courseId)
            courseData = await courseService.get(orig_product.ExtFields.courseId, opts)
        else
            throw new Error(`Payment::_createPromoProduct: Missing "courseId" field.`);
        
        let prodData = {
            ProductTypeId: Product.ProductTypes.CoursePromoCode,
            VATTypeId: orig_product.VATTypeId,
            Code: `PROMO-${code}`,
            Name: `Промокод "${code}", курс "${courseData.Name}".`,
            AccName: orig_product.AccName,
            Price: orig_product.Price,
            ExtFields: orig_product.ExtFields
        };
        prodData.ExtFields.courseName = courseData.Name;
        let res = await ProductService().insert(prodData, opts);
        
        let promo_data = {
            Code: code,
            Perc: 100,
            Counter: 1,
            FirstDate: new Date(),
            IsVisible: false,
            PromoProductId: res.id,
            Products: [orig_product.Id]
        };

        let promoService = this.getService("promo");
        let promo_res = await promoService.insert(promo_data, opts);
        prodData.ExtFields.promoCode = promo_res.Code;
        prodData.ExtFields.promoId = promo_res.Id;
        await ProductService().update(res.id, { ExtFields: prodData.ExtFields }, opts);
        return { ProductId: res.id, Code: prodData.Code };
    }

    async _subsProducts(data, options) {
        let inv_data = _.cloneDeep(data);
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        if (inv_data.Items && Array.isArray(inv_data.Items)) {
            let new_items = [];
            for (let i = 0; i < inv_data.Items.length; i++){
                let elem = inv_data.Items[i];
                if (elem.GenPromo) {
                    let field;
                    let reqParam;
                    if (elem.ProductId) {
                        field = "ProductId";
                        reqParam = "Ids";
                    }
                    else
                        if (elem.Code) {
                            field = "Code";
                            reqParam = "Codes";
                        }
                    if (!field)
                        throw new Error(`Missing field "ProductId" or "Code" in "Items" array.`);
                    let reqArr = [elem[field]];
                    let request = { dbOptions: dbOpts, Detail: true };
                    request[reqParam] = reqArr;
                    let orig_prod = await ProductService().get(request);
                    if (orig_prod && Array.isArray(orig_prod) && (orig_prod.length > 0)) {
                        let promo_prod = await this._createPromoProduct(orig_prod[0], opts);
                        let itm = { Price: elem.Price };
                        itm[field] = promo_prod[field];
                        new_items.push(itm); 
                    }
                    else
                        throw new Error(`Missing product in "Items" array: "${field}":${elem[field]}.`);
                }
                else
                    new_items.push(elem);
            }
            inv_data.Items = new_items;
        }
        return inv_data;
    }

    _getOrCreateInvoice(data, options) {
        let opts = options || {};
        return new Promise(resolve => {
            let rc;
            if (data.InvoiceId)
                rc = { result: "OK", id: data.InvoiceId }
            else
                rc = this._subsProducts(data, opts)
                    .then(inv => {
                        return InvoiceService().insert(inv, opts);
                    });
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
                            currObj.ReceiptEmail = elem.ReceiptEmail;
                            currObj.ReceiptPhone = elem.ReceiptPhone;
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

    async _cachePendingCheque(id, cheque, raw_data) {
        if (!IGNORE_PENDING_PAYMENTS)
            if (raw_data && raw_data.confirmationUrl) {
                await this.cacheSet(`cheque:${id}`, { url: raw_data.confirmationUrl },
                    { json: true, ttlInSec: this.chequePendingPeriod });
            }
    }

    async _getPendingChequeFromCache(id) {
        return await this.cacheGet(`cheque:${id}`, { json: true });
    }

    async _delPendingChequeFromCache(id) {
        await this.cacheDel(`cheque:${id}`);
    }

    _updateChequeState(req_result, root_obj, cheque, dbOpts, memDbOptions, invoice_data, options) {
        let chequeObj = cheque.chequeObj;
        let parentCheque = cheque.parentCheque;
        let invoiceData = invoice_data;
        let self = this;
        let opts = options || {};
        let purchaseEmailNotification = typeof (opts.purchaseEmailNotification) === "boolean" ? opts.purchaseEmailNotification : true;

        let updateState = async (reqResult) => {
            let dbOptsInt;
            let root_item;
            let isStateChanged = false;
            let rc = root_obj.edit()
                .then(() => {
                    if (parentCheque)
                        return parentCheque.edit();
                })
                .then(async () => {
                    isStateChanged = chequeObj.stateId() !== reqResult.cheque.chequeState;
                    chequeObj.stateId(reqResult.cheque.chequeState);
                    if (isStateChanged && (chequeObj.chequeTypeId() === Accounting.ChequeType.Payment)) {
                        if (chequeObj.stateId() === Accounting.ChequeState.Pending)
                            await this._cachePendingCheque(chequeObj.id(), chequeObj, reqResult)
                        else
                            await this._delPendingChequeFromCache(chequeObj.id());
                    }
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
                    if (reqResult.cheque.ReceiptDate)
                        chequeObj.receiptDate(reqResult.cheque.ReceiptDate);
                    if (reqResult.cheque.ReceiptData)
                        chequeObj.receiptData(JSON.stringify(reqResult.cheque.ReceiptData));
                    chequeObj.chequeData(JSON.stringify(reqResult.result));
                    if (reqResult.operation) {
                        root_item = chequeObj.getDataRoot("ChequeLog");
                        let fields = {
                            ResultCode: HttpCode.OK,
                            Operation: reqResult.operation.operation,
                            Request: JSON.stringify(reqResult.req),
                            Response: JSON.stringify(reqResult.result)
                        };
                        if (reqResult.isError)
                            fields.ResultCode = reqResult.statusCode ? reqResult.statusCode :
                                (reqResult.result && reqResult.result.statusCode ? reqResult.result.statusCode : HttpCode.ERR_INTERNAL);
                        return root_item.newObject({
                            fields: fields
                        }, dbOpts);
                    }
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
                .then(async () => {
                    if (!isRefund) {
                        let promoId = chequeObj.promoCodeId();
                        let promoService = self.getService("promo", true);
                        if (promoId && promoService)
                            await promoService.receive(promoId);
                    }
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
                        let promoProducts = [];
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
                                    case Product.ProductTypes.CoursePromoCode:
                                        promoProducts.push(itm.ExtFields.prod)
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
                            if (!isRefund)
                                for (let i = 0; i < paidCourses.length; i++) {
                                    // we shouldn't "await" here !!! we don't care about a result
                                    if (purchaseEmailNotification)
                                        self._sendEmailPurchaseNotification(chequeObj, false,
                                            paidCourses[i], { userName: user.DisplayName, dbOpts: dbOpts });
                                    self._sendPurchaseEventToMrktSystem(user, paidCourses[i], chequeObj, { dbOpts: dbOpts });
                                }
                        }
                        if (promoProducts.length > 0) {
                            if (!isRefund) {
                                for (let i = 0; i < promoProducts.length; i++)
                                    // we shouldn't "await" here !!! we don't care about a result
                                    self._sendPromoCodeViaEmail(chequeObj.receiptEmail(),
                                        promoProducts[i], { userName: user.DisplayName, dbOpts: dbOpts });
                            }
                            else {
                                let promoService = self.getService("promo", true);
                                if (promoService) {
                                    for (let i = 0; i < promoProducts.length; i++)
                                        await promoService.rollbackPurchase(promoProducts[i].promoId);
                                }
                            }
                        }
                    }
                    if (Object.keys(fields).length > 0)
                        await UsersCache().editUser(user.Id, { alter: fields }, dbOpts);
                })
            return rci;
        }

        let iniState = chequeObj.stateId();
        let capturingObjKeys = [];

        async function _releaseLocks(locks) {
            while (locks.length > 0)
                await self.cacheDel(locks.pop());
        }

        async function _setInvoiceLocks(invoice_data, locks) {
            let result = true;
            if (invoice_data.Items && (invoice_data.Items.length > 0)) {
                let inv_courses = [];
                for (let i = 0; i < invoice_data.Items.length; i++) {
                    let item = invoice_data.Items[i];
                    if (item.ExtFields && (item.ExtFields.prodType === Product.ProductTypes.CourseOnLine)
                        && item.ExtFields.prod && item.ExtFields.prod.courseId) {
                        inv_courses.push(item.ExtFields.prod.courseId);
                    }
                }
                inv_courses.sort((a, b) => {
                    return a > b ? 1 : (a < b ? -1 : 0);
                });
                for (let i = 0; i < inv_courses.length; i++){
                    let key = `capturing:user:${invoice_data.UserId}:crs:${inv_courses[i]}`;
                    let lockRes = await self.cacheSet(key, "1", { nx: true });
                    if (lockRes === "OK")
                        locks.push(key)
                    else {
                        await _releaseLocks(locks);
                        result = false;
                        break;
                    }
                }
            }
            return result;
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
                        then(async () => {
                            await getInvoiceData(dbOpts);
                            let needToCancel = false;
                            if (invoiceData) {
                                // Trying to lock invoice objects
                                needToCancel = !(await _setInvoiceLocks(invoiceData, capturingObjKeys));
                                if (!needToCancel) {
                                    let check = await this._preCheckInvoice(invoiceData, { isSilent: true, checkForBought: true });
                                    needToCancel = check.isBought;
                                }
                            }
                            return needToCancel ?
                                this._onCancelPayment(chequeObj.chequeNum()) : // Cancel payment
                                this._onCapturePayment(chequeObj.chequeNum()); // Capture payment
                        })
                        .then(result => {
                            // Set status "Paid" to cheque and invoice OR cancel cheque
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
                            await this._setPendingObjects(chequeObj, invoiceData, flag);
                        }
                    }
                }
                await _releaseLocks(capturingObjKeys);
                return result;
            })
            .catch(async (err) => {
                await _releaseLocks(capturingObjKeys);
                throw err;
            });
    }

    async getReceipt(id, options, chequeNum, chequeTypeId) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let chequeObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getCheque(id, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new Error(`Cheque ("id" = "${id}") doesn't exist.`);
                    chequeObj = collection.get(0);
                    
                    await chequeObj.edit();

                    let tp = chequeTypeId ? chequeTypeId : chequeObj.chequeTypeId(); // chequeTypeId- debug parameter
                    let num = chequeNum ? chequeNum : chequeObj.chequeNum(); // chequeNum- debug parameter
                    let receipt_list = await this._onGetPaymentReceipt(num, tp);

                    if (receipt_list.cheque.ReceiptDate)
                        chequeObj.receiptDate(receipt_list.cheque.ReceiptDate);
                    chequeObj.lastTrialTs(new Date());
                    chequeObj.trialNum((chequeObj.trialNum() ? chequeObj.trialNum() : 0) + 1);
                    if (!receipt_list.isError)
                        chequeObj.receiptData(JSON.stringify(receipt_list.result));

                    let root_item = chequeObj.getDataRoot("ChequeLog");
                    let fields = {
                        ResultCode: HttpCode.OK,
                        Operation: receipt_list.operation.operation,
                        Request: JSON.stringify(receipt_list.req),
                        Response: JSON.stringify(receipt_list.result)
                    };
                    if (receipt_list.isError)
                        fields.ResultCode = receipt_list.statusCode ? receipt_list.statusCode :
                            (receipt_list.result && receipt_list.result.statusCode ? receipt_list.result.statusCode : HttpCode.ERR_INTERNAL);
                    await root_item.newObject({
                        fields: fields
                    }, dbOpts);
                    await chequeObj.save(dbOpts);
                    return receipt_list.result;
                })
        }, memDbOptions);
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
        let chequeTypeId;
        let refundInvoiceId;
        let isRefund = false;
        let campaignId = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                let rc;

                campaignId = data && data.campaignId ? data.campaignId : null;

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
                            if ((!data.Refund.phone) && parentCheque.receiptPhone())
                                data.Refund.phone = parentCheque.receiptPhone();
                            if ((!data.Refund.email) && parentCheque.receiptEmail())
                                data.Refund.email = parentCheque.receiptEmail();
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

                    root_obj = await this._getObjById(-1, null, dbOpts);
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    if ((!isRefund) && invoiceData && (invoiceData.Sum === 0) && data.Promo && data.Promo.Id) {
                        let giftCourses = [];
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
                                        giftCourses.push(itm.ExtFields.prod.courseId)
                                        break;
                                }
                            }
                        }
                        if (giftCourses.length > 0) {
                            for (let i = 0; i < giftCourses.length; i++)
                                await UsersService().insBookmark(invoiceData.UserId, giftCourses[i]);
                            await UsersCache().giftCourses(invoiceData.UserId,
                                { added: giftCourses }, data.Promo.Id, data.Promo.PromoSum, dbOpts);
                            if (opts.user){
                                for (let i = 0; i < giftCourses.length; i++) {
                                    // we shouldn't "await" here !!! we don't care about a result
                                    this._sendEmailPurchaseNotification(data.Payment && data.Payment.email ? data.Payment.email : opts.user.Email,
                                        true, giftCourses[i], { userName: opts.user.DisplayName, dbOpts: dbOpts });
                                    // this._sendPurchaseEventToMrktSystem(opts.user, giftCourses[i], null, { dbOpts: dbOpts });
                                }
                            }
                        }
                            
                        return { result: { isGift: true } };
                    }
                    else {
                        await root_obj.edit();

                        let fields = { IsSaved: false, RefundSum: 0, CampaignId: campaignId, SendStatus: 0, PaymentType: this.paymentType };
                        if ((!isRefund) && data.Promo) {
                            fields.PromoCodeId = data.Promo.Id ? data.Promo.Id : null;
                            fields.PromoCode = data.Promo.PromoCode ? data.Promo.PromoCode : null;
                            fields.PromoSum = data.Promo.PromoSum ? data.Promo.PromoSum : 0;
                        }
                        let result = await root_obj.newObject({
                            fields: fields
                        }, dbOpts);

                        newId = result.keyValue;
                        chequeObj = this._db.getObj(result.newObject);
                        result = await this._onPreparePaymentFields(chequeObj.id(), chequeTypeId,
                            data.Payment ? data.Payment : data.Refund, invoiceData, invoiceData ? invoiceData.UserId : data.UserId, options);
                    
                        if (parentCheque)
                            chequeObj.parentId(parentCheque.id());
                        chequeObj.chequeNum(DRAFT_CHEQUE_ID);
                        chequeObj.stateId(Accounting.ChequeState.Draft);
                        for (let key in result.fields) {
                            chequeObj[this._genGetterName(key)](result.fields[key]);
                        }
                        await root_obj.save(dbOpts);

                        result = await (chequeTypeId === Accounting.ChequeType.Payment ?
                            this._onCreatePayment(result.paymentObject) : this._onCreateRefund(result.paymentObject));

                        return this._updateChequeState(result, root_obj, { chequeObj: chequeObj, parentCheque: parentCheque }, dbOpts, memDbOptions);
                    }
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
                                        console.error(buildLogString(`Error in "InvoiceService().rollbackRefund" call: ` +
                                            `${err && err.message ? err.message : JSON.stringify(err)}`));
                                    });
                        })
                        .then(() => {
                            result.result.newId = newId;
                            throw result.result;
                        });
                }
                else {
                    rc = opts.fullResult ? result.result : (result.confirmationUrl ? { confirmationUrl: result.confirmationUrl } :
                        (opts.debug ? result.result : {}));
                }
                return rc;
            });
    }

    async getPendingObjects(user_id) {
        let key = `crs:${user_id}`;
        let userPending = await this.cacheGet(key, { json: true });
        return userPending ? userPending : {};
    }

    async _getCheckueIdOfPendingCourse(user_id, course_id) {
        let currList = await this.getPendingObjects(user_id);
        let crs = currList[course_id];
        return crs && crs.chequeId ? crs.chequeId : null;
    }

    async checkPendingCourse(user_id, course_id) {
        let result;
        let chequeId = await this._getCheckueIdOfPendingCourse(user_id, course_id);
        if (chequeId) {
            await this.checkAndChangeState(chequeId, null, { dbOptions: { userId: user_id } });
            let currList = await this.getPendingObjects(user_id);
            let crs = currList[course_id];
            if (crs && crs.chequeId) {
                let cheque = await this._getPendingChequeFromCache(crs.chequeId);
                result = cheque ? { confirmationUrl: cheque.url } : null;
            }
        }
        if (!result) {
            let bought = {};
            let userService = this.getService("users", true);
            if (userService)
                bought = await userService.getPaidCourses(user_id, false, { is_list: true });
            if (bought[course_id])
                throw new HttpError(HttpCode.ERR_CONFLICT, `Course "${course_id}" has been already bought.`)
            else
                throw new HttpError(HttpCode.ERR_NOT_FOUND, `Pending course "${course_id}" doesn't exist.`);
        }
        return result;           
    }

    async _preCheckInvoice(invoice_data, options) {
        let opts = options || {};
        let isSilent = typeof (opts.isSilent) === "boolean" ? opts.isSilent : false;
        let checkForPending = typeof (opts.checkForPending) === "boolean" ? opts.checkForPending : true;
        let checkForBought = typeof (opts.checkForBought) === "boolean" ? opts.checkForBought : true;
        let result = {};
        if (checkForPending || checkForBought) {
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
                    let pending = checkForPending ? await this.getPendingObjects(invoice_data.UserId) : {};
                    let bought = {};
                    let userService = this.getService("users", true);
                    if (userService && checkForBought)
                        bought = await userService.getPaidCourses(invoice_data.UserId, false, { paid: true, gift: true, is_list: true });
                    for (let i = 0; i < inv_courses.length; i++) {
                        let crs = inv_courses[i];
                        if (bought[crs.id])
                            if (isSilent) {
                                result.isBought = true;
                                break;
                            }
                            else
                                throw new Error(`${crs.name} уже доступен для использования.`);
                        if (pending[crs.id])
                            if (isSilent) {
                                result.isPending = true;
                                break;
                            }
                            else
                                throw new Error(`${crs.name} ожидает завершения операции оплаты.`);
                    }
                }
            }
        }
        return result;
    }

    async _setPendingObjects(chequeObj, invoice_data, flag) {
        if (!IGNORE_PENDING_PAYMENTS) {
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

            let isMdf = false;
            if (invoice_data.Items && (invoice_data.Items.length > 0)) {
                for (let i = 0; i < invoice_data.Items.length; i++) {
                    let item = invoice_data.Items[i];
                    if (item.ExtFields && (item.ExtFields.prodType === Product.ProductTypes.CourseOnLine)
                        && item.ExtFields.prod && item.ExtFields.prod.courseId) {
                        await getCurrent();
                        let exists = currList[item.ExtFields.prod.courseId] ? true : false;
                        isMdf = isMdf || ((!exists) && flag) || (exists && (!flag));
                        if (flag)
                            currList[item.ExtFields.prod.courseId] = { chequeId: chequeObj.id() }
                        else
                            delete currList[item.ExtFields.prod.courseId];
                    }
                }
                if (isMdf)
                    if (Object.keys(currList).length > 0)
                        await this.cacheSet(key, currList, { json: true, ttlInSec: this.chequePendingPeriod })
                    else
                        await this.cacheDel(key);
            }
        }
    }
}