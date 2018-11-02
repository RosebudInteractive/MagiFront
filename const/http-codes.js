'use strict';

let HttpCode = {
    OK: 200,
    ERR_BAD_REQ: 400,
    ERR_UNAUTH: 401,
    ERR_PAYMENT_REQUIRED: 402,
    ERR_FORBIDDEN: 403,
    ERR_NOT_FOUND: 404,
    ERR_CONFLICT: 409,
    ERR_TOO_LARGE: 413,
    ERR_TOO_MANY_REQ: 429,
    ERR_INTERNAL: 500,
    ERR_NIMPL: 501
};

let HttpMessage = {};

HttpMessage[HttpCode.OK] = "OK";
HttpMessage[HttpCode.ERR_BAD_REQ] = "Bad Request";
HttpMessage[HttpCode.ERR_UNAUTH] = "Unauthorized";
HttpMessage[HttpCode.ERR_PAYMENT_REQUIRED] = "Payment Required";
HttpMessage[HttpCode.ERR_FORBIDDEN] = "Forbidden";
HttpMessage[HttpCode.ERR_NOT_FOUND] = "Not Found";
HttpMessage[HttpCode.ERR_CONFLICT] = "Conflict";
HttpMessage[HttpCode.ERR_TOO_LARGE] = "Payload Too Large";
HttpMessage[HttpCode.ERR_TOO_MANY_REQ] = "Too Many Requests";
HttpMessage[HttpCode.ERR_INTERNAL] = "Internal Server Error";
HttpMessage[HttpCode.ERR_NIMPL] = "Not Implemented";

exports.HttpCode = HttpCode;
exports.HttpMessage = HttpMessage;
