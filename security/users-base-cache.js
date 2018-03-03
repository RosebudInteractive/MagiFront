'use strict'
const TOKEN_EXP_TIME = 24 * 3600 * 1000;
const TOKEN_UPD_TIME = 1 * 3600 * 1000;
const USER_UPD_TIME = (1 * 3600 + 15 * 60) * 1000;

exports.UsersBaseCache = class UsersBaseCache {
    constructor(userFields, opts) {
        this._users = {};
        this._userFields = userFields || ["Id"];
        let options = opts || {};
        this._tokenExpTime = options.tokenExpTime ? options.tokenExpTime : TOKEN_EXP_TIME;
        this._tokenUpdTime = options.tokenUpdTime ? options.tokenUpdTime : TOKEN_UPD_TIME;
        this._userUpdTime = options.userUpdTime ? options.userUpdTime : USER_UPD_TIME;
        this._convUserDataFn = typeof (options.convUserDataFn) === "function" ? options.convUserDataFn : null;
    }

    authUser(login, password) {
        return $dbUser.checkUser(login, password, this._userFields)
            .then(((result) => {
                let res = this._convUserDataFn ? this._convUserDataFn(result.fields) : result.fields;
                return this._storeUser(res);
            }).bind(this));
    }

    getUserInfoById(id) {
        return new Promise((resolve) => { resolve(this._getUser(id)) })
            .then((user) => {
                if (!user)
                    user = $dbUser.getUser(id, this._userFields)
                        .then(((result) => {
                            let res = this._convUserDataFn ? this._convUserDataFn(result) : result;
                            return this._storeUser(res);
                        }).bind(this));
                return user;
            });
    }

    checkToken(token, isNew) {
        return this._checkToken(token, isNew);
    }

    _storeUser(user) {
        Promise.reject(new Error("UsersBaseCache::_storeUser should be implemented in descendant."));
    }

    _getUser(id) {
        Promise.reject(new Error("UsersBaseCache::_getUser should be implemented in descendant."));
    }

    _checkToken(token, isNew) {
        Promise.reject(new Error("UsersBaseCache::_checkToken should be implemented in descendant."));
    }
}
