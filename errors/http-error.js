'use strict';

exports.HttpError = class HttpError extends Error {

    get statusCode() {
        return this._statusCode;
    }

    get errObject() {
        return this._errObject;
    }

    constructor(statusCode, message) {
        let errObject = { message: "" };
        if (typeof (message) === "string") {
            errObject.message = message;
        }
        else {
            for (let attr in message)
                errObject[attr] = message[attr];
        }
        super(errObject.message);
        this._errObject = errObject;
        this._statusCode = statusCode;
    }
}