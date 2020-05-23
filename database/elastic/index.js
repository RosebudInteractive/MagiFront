const _ = require('lodash');
const config = require('config');
const { DbObject } = require('../db-object');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");
const { getTimeStr, buildLogString } = require('../../utils');
const { ElasticConWrapper } = require('../providers/elastic/elastic-connections');
const { importProc } = require('./import');

const DbElastic = class DbElastic extends DbObject {

    constructor(options) {
        super(options);
    }

    async import(options) {
        let result = ElasticConWrapper(async conn => {
            return importProc(conn, options);
        }, true);
        return result;
    }
};

let dbElastic = null;
exports.ElasticService = () => {
    return dbElastic ? dbElastic : dbElastic = new DbElastic();
}
