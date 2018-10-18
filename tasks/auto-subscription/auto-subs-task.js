'use strict';
const path = require('path');
const _ = require('lodash');
const config = require('config');
const sharp = require('sharp');
const { URL, URLSearchParams } = require('url');
const fs = require('fs');

const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const mkdirAsync = promisify(fs.mkdir);

const { SubscriptionService } = require('../../services/mail-subscription');
const { Task } = require('../lib/task');
const { HttpCode } = require('../../const/http-codes');
const { SendMail } = require('../../mail');
const { UsersCache } = require("../../security/users-cache");
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const GET_SUBS_MSSQL =
    "select u.[SysParentId] as [Id], u.[Email], u.[DisplayName], u.[SubsAutoPay], u.[SubsExpDate], u.[SubsAutoPayId], u.[SubsProductId],\n" +
    "  c.[ChequeNum], c.[ChequeData], p.[Name], p.[ExtFields], pr.[Price], cr.[Symbol], c.[ReceiptEmail], c.[ReceiptPhone]\n" +
    "from[User] u\n" +
    "  join[Cheque] c on c.[Id] = u.[SubsAutoPayId]\n" +
    "  join[Product] p on p.[Id] = u.[SubsProductId]\n" +
    "  join[Price] pr on pr.[ProductId] = p.[Id]\n" +
    "  join[PriceList] pl on pl.[Id] = pr.[PriceListId]\n" +
    "  join[Currency] cr on cr.[Id] = pl.[CurrencyId]\n" +
    "  left join[AutoSubscription] a on a.[UserId] = u.[SysParentId] and a.[SubsExpDate] = u.[SubsExpDate]\n" +
    "where(not u.[SubsAutoPayId] is NULL) and(a.[Id] is NULL)\n" +
    "  and(u.[SubsExpDate] <= GETDATE()) and (u.[SubsAutoPay] = 1)\n" +
    "  and(pl.[Code] = '<%= price_list %>')\n" +
    "  and((pr.[FirstDate] <= GETDATE()) and((pr.[LastDate] > GETDATE()) or(pr.[LastDate] is NULL)))";

const GET_SUBS_MYSQL =
    "select u.`SysParentId` as `Id`, u.`Email`, u.`DisplayName`, u.`SubsAutoPay`, u.`SubsExpDate`, u.`SubsAutoPayId`, u.`SubsProductId`,\n" +
    "  c.`ChequeNum`, c.`ChequeData`, p.`Name`, p.`ExtFields`, pr.`Price`, cr.`Symbol`, c.`ReceiptEmail`, c.`ReceiptPhone`\n" +
    "from`User` u\n" +
    "  join`Cheque` c on c.`Id` = u.`SubsAutoPayId`\n" +
    "  join`Product` p on p.`Id` = u.`SubsProductId`\n" +
    "  join`Price` pr on pr.`ProductId` = p.`Id`\n" +
    "  join`PriceList` pl on pl.`Id` = pr.`PriceListId`\n" +
    "  join`Currency` cr on cr.`Id` = pl.`CurrencyId`\n" +
    "  left join`AutoSubscription` a on a.`UserId` = u.`SysParentId` and a.`SubsExpDate` = u.`SubsExpDate`\n" +
    "where(not u.`SubsAutoPayId` is NULL) and(a.`Id` is NULL)\n" +
    "  and(u.`SubsExpDate` <= NOW()) and (u.`SubsAutoPay` = 1)\n" +
    "  and(pl.`Code` = '<%= price_list %>')\n" +
    "  and((pr.`FirstDate` <= NOW()) and((pr.`LastDate` > NOW()) or(pr.`LastDate` is NULL)))";

const dfltSettings = {
    priceListCode: "MAIN"
};

const IMG_WIDTH = 360;
const IMG_HEIGHT = 283;

exports.AutoSubsTask = class AutoSubsTask extends Task {

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        this._settings = _.defaultsDeep(opts, dfltSettings);
        if (config.billing.enabled && config.has("billing.module")) {
            const { PaymentObject } = require(config.billing.module);
            this._paymentServise = PaymentObject();
        }
        else
            throw new Error(`Billing isn't configured.`);
    }

    _autoSubscribe() {
        let errors = [];
        return new Promise(resolve => {
            resolve($data.execSql({
                dialect: {
                    mysql: _.template(GET_SUBS_MYSQL)({ price_list: this._settings.priceListCode }),
                    mssql: _.template(GET_SUBS_MSSQL)({ price_list: this._settings.priceListCode })
                }
            }, {}));
        })
            .then(result => {
                if (result && result.detail && (result.detail.length > 0)) {
                    return Utils.seqExec(result.detail, (elem) => {
                        let payment = {
                            Payment: {
                                cheque_id: elem.SubsAutoPayId
                            },
                            Invoice: {
                                UserId: elem.Id,
                                InvoiceTypeId: 1,
                                Name: "Автоподписка от " + (new Date()).toISOString(),
                                Items: [
                                    { ProductId: elem.SubsProductId }
                                ]
                            }
                        }
                        if (elem.ReceiptPhone)
                            payment.Payment.phone = elem.ReceiptPhone
                        else
                            if (elem.ReceiptEmail)
                                payment.Payment.email = elem.ReceiptEmail;
                        let dbOptions = { dbRoots: [] };
                        let root_obj;
                        let db = $memDataBase;

                        let newId;
                        let new_obj;
                        let err_obj = { UserId: elem.Id, Email: elem.Email, Name: elem.DisplayName };

                        return Utils.editDataWrapper(() => {
                            return new MemDbPromise(db, (resolve, reject) => {
                                var predicate = new Predicate(db, {});
                                predicate
                                    .addCondition({ field: "Id", op: "=", value: -1 });
                                let exp =
                                {
                                    expr: {
                                        model: {
                                            name: "AutoSubscription"
                                        },
                                        predicate: predicate.serialize(true)
                                    }
                                };
                                db._deleteRoot(predicate.getRoot());
                                resolve(db.getData(Utils.guid(), null, null, exp, {}));
                            })
                                .then((result) => {
                                    if (result && result.guids && (result.guids.length === 1)) {
                                        root_obj = db.getObj(result.guids[0]);
                                        if (!root_obj)
                                            throw new Error("Object doesn't exist: " + result.guids[0]);
                                    }
                                    else
                                        throw new Error("Invalid result of \"getData\": " + JSON.stringify(result));

                                    dbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                    return root_obj.edit();
                                })
                                .then(() => {

                                    let fields = {
                                        UserId: elem.Id,
                                        SubsExpDate: elem.SubsExpDate,
                                        NextSubsExpDate: elem.SubsExpDate,
                                        ProductId: elem.SubsProductId,
                                        Succeeded: false
                                    };

                                    return root_obj.newObject({
                                        fields: fields
                                    }, {});
                                })
                                .then((result) => {
                                    newId = result.keyValue;
                                    new_obj = db.getObj(result.newObject);
                                    return root_obj.save();
                                })
                                .then(() => {
                                    return new_obj.edit();
                                })
                                .then(() => {
                                    return this._paymentServise.insert(payment, { fullResult: true });
                                })
                                .then(result => {
                                    let meta = this._paymentServise.getMeta(result);
                                    if (meta && meta.ChequeId)
                                        new_obj.chequeId(meta.ChequeId);
                                    if (this._paymentServise.isChequePaid(result)) {
                                        new_obj.succeeded(true);
                                        return UsersCache().getUserInfoById(elem.Id)
                                            .then(user => {
                                                new_obj.nextSubsExpDate(user.SubsExpDate);
                                            });
                                    }
                                    else {
                                        new_obj.error(JSON.stringify(result));
                                        err_obj.error = result;
                                        errors.push(err_obj);
                                    }
                                }, err => {
                                    if (err instanceof Error) {
                                        new_obj.error(err.message);
                                        err_obj.error = { message: err.message };
                                    }
                                    else {
                                        if (err.newId)
                                            new_obj.chequeId(err.newId);
                                        new_obj.error(JSON.stringify(err));
                                        err_obj.error = err;
                                    }
                                    errors.push(err_obj);
                                })
                                .then(() => {
                                    return new_obj.save();
                                });
                        }, dbOptions);
                    });
                }
            })
            .catch(err => {
                let err_obj = {};
                err_obj.error = (err instanceof Error) ? { message: err.message } : err;
                errors.push(err_obj);
            })
            .then(() => {
                if (this._settings.errRecipients && (errors.length > 0)) {
                    return this._sendMail(errors, this._settings.errRecipients);
                };
            })
            .then(msg => {
                if (msg && msg.msgUrl)
                    console.error(`Error message URL: ${msg.msgUrl}`);
            });
    }

    _sendMail(errors, recipients) {
        let mailOptions = {
            disableUrlAccess: false,
            from: config.mail.mailing.sender, // sender address
            to: recipients // list of receivers
        };
        mailOptions.subject = `Ошибки при выполнении автоподписки ( ${(new Date()).toISOString()} ).`;
        mailOptions.html = `<b>Список ошибок</b><br>: ${JSON.stringify(errors, null, 2).replace(/\n/g, "<br>")}<br>`;
        return SendMail("mailing", mailOptions);
    }

    run(fireDate) {
        let options = { result: {} };
        let rc = Promise.resolve();
        return rc
            .then(() => {
                if (this._settings.autoPay)
                    return this._autoSubscribe();
            });
    }
};
