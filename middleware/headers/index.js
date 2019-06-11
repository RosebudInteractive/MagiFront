'use strict';
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../const/http-codes");
const { buildLogString } = require('../../utils');

module.exports = (options) => {

    async function _processor(req, res, next) {
        try {
            if (options && options.headers) {
                for (let header in options.headers)
                    res.append(header, options.headers[header]);
            }
            next();
        }
        catch (err) {
            next(err);
        }
    }

    return function (req, res, next) {
        _processor(req, res, next);
    };
};
