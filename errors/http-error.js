'use strict';

exports.HttpError = class HttpError extends Error {

    get statusCode() {
        return this._statusCode;
    }

    constructor(statusCode, message) {
        super(message);
        this._statusCode = statusCode;
    }
}