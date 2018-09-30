'use strict';
const _ = require('lodash');
const { DbObject } = require('./db-object');
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const PRICE_REQ_TREE = {
    expr: {
        model: {
            name: "PriceList",
            childs: [
                {
                    dataObject: {
                        name: "Price"
                    }
                }
            ]
        }
    }
};

const DbPrice = class DbPrice extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || PRICE_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    get(id, options) {
        return new Promise(resolve => { resolve() });
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

let dbPrice = null;
exports.VatService = () => {
    return dbPrice ? dbPrice : dbPrice = new DbPrice();
}
