'use strict';
const _ = require('lodash');
const config = require('config');
const request = require('request');
const { HttpMessage, HttpCode } = require("../../const/http-codes");
const { HttpError } = require('../../errors/http-error');
const { DbObject } = require('../db-object');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const MRKT_REQ_TREE = {
    expr: {
        model: {
            name: "MrktSysLog"
        }
    }
};

class MrktBase extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || MRKT_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    async _writeToLog(options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOpts || {};
        let root_obj = null;
        let inpFields = opts.fields || {};
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();

                    if (typeof (inpFields.OpDate) === "undefined")
                        inpFields.OpDate = new Date();
                    if (typeof (inpFields.Trial) === "undefined")
                        inpFields.Trial = 1;
                    if (typeof (inpFields.Order) === "undefined")
                        inpFields.Order = 1;

                    let newHandler = await root_obj.newObject({ fields: inpFields }, dbOpts);

                    newId = newHandler.keyValue;
                    await root_obj.save(dbOpts);
                })
        }, memDbOptions);
    }

    async _postData(url, data, options) {
        let result = await new Promise(resolve => {
            request.post(
                {
                    url: url,
                    json: true,
                    body: data
                }, (error, response, body) => {
                    try {
                        if (error)
                            resolve({ isError: true, error: error });
                        else {
                            resolve({ isError: false, statusCode: response.statusCode, body: body });
                        }
                    }
                    catch (err) {
                        resolve({ isError: true, error: err });
                    }
                });
        });

        let opts = _.defaultsDeep(options || { fields: {} });
        opts.fields.Request = JSON.stringify({
            method: "POST",
            url: url,
            body: data
        });
        opts.fields.Succeeded = result.isError;
        if (result.isError)
            opts.fields.Response = JSON.stringify(result.error)
        else {
            opts.fields.Response = JSON.stringify(result.body);
            opts.fields.HttpStatus = result.statusCode;
            opts.fields.Succeeded = result.statusCode === HttpCode.OK;
        }
        await this._writeToLog(opts);

        if (result.isError)
            throw new Error(result.error);
        return result;
    }
}

exports.MrktBase = MrktBase;