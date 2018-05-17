'use strict';

class ErrorWithCode extends Error {
    get code() {
        return this._code;
    }
    constructor(code, message) {
        if ((typeof (code) === "undefined") || (typeof (message) === "undefined"))
            throw new Error("ErrorWithCode::constructor: Invalig arguments.");
        super(message);
        this._code = code;
    }
}

exports.UserLoginError = class UserLoginError extends ErrorWithCode {
    static get REG_EXPIRED() { return { code: "REG_EXPIRED", message: "Registration period has expired." }; }
    static get REG_BLOCKED() { return { code: "REG_BLOCKED", message: "User is blocked." }; }
    static get REG_OLDSTYLE() { return { code: "REG_OLDSTYLE", message: "\"Old style\" user." }; }
    static get AUTH_FAIL() { return { code: "AUTH_FAIL", message: "Incorrect user name or password." }; }
    get info() {
        return { code: this._code, message: this.message };
    }
    constructor(code, message) {
        if (code && code.code && code.message)
            super(code.code, code.message)
        else
            super(code, message);
    }
}