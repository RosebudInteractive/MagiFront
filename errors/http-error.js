'use strict';
const _ = require('lodash');

exports.HttpError = class HttpError extends Error {

    get statusCode() {
        return this._statusCode;
    }

    get errObject() {
        return this._errObject;
    }

    constructor(statusCode, message) {
        let errObject = { statusCode: statusCode, message: "" };
        if (typeof (message) === "string") {
            errObject.message = message;
        }
        else {
            errObject = _.defaultsDeep(message, errObject);
        }
        super(errObject.message);
        this._errObject = errObject;
        this._statusCode = statusCode;
    }
}