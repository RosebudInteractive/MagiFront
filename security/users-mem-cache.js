'use strict'
const TOKEN_EXP_TIME = 24 * 3600 * 1000;
const TOKEN_UPD_TIME = 1 * 3600 * 1000;

exports.UsersMemCache = class UsersMemCache {
    constructor(userFields, opts) {
        this._users = {};
        this._userFields = userFields || ["Id"];
        let options = opts || {};
        this._tokenExpTime = options.tokenExpTime ? options.tokenExpTime : TOKEN_EXP_TIME;
        this._tokenUpdTime = options.tokenUpdTime ? options.tokenUpdTime : TOKEN_UPD_TIME;
        this._convUserDataFn = typeof (options.convUserDataFn) === "function" ? options.convUserDataFn : null;
    }

    authUser(login, password) {
        return $dbUser.checkUser(login, password, this._userFields)
            .then(((result) => {
                let res = this._convUserDataFn ? this._convUserDataFn(result.fields) : result.fields;
                this._users["uid:" + res.Id] = res;
                return res;
            }).bind(this));
    }

    getUserInfoById(id) {
        return new Promise((resolve, reject) => {
            let uid = "uid:" + id;
            let user = this._users[uid];
            if (!user)
                user = $dbUser.getUser(id, this._userFields)
                    .then(((result) => {
                        let res = this._convUserDataFn ? this._convUserDataFn(result) : result;
                        this._users[uid] = res;
                        return res;
                    }).bind(this));
            resolve(user);
        });
    }

    checkToken(token, isNew) {
        return new Promise((resolve, reject) => {
            let res = this._users[token];
            let now = (new Date()) - 0;
            if (!res && isNew)
                res = this._users[token] = { exp: now + this._tokenExpTime, last: now }
            else
                if (res) {
                    if (now > res.exp) {
                        delete this._users[token];
                        res = null;
                    }
                    else
                        if ((now - res.last) >= this._tokenUpdTime) {
                            res.exp = now + this._tokenExpTime;
                            res.last = now;
                        }
                }
            resolve(res ? true : false);
        });
    }
}
