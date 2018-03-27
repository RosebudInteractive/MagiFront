'use strict'
const TOKEN_EXP_TIME = 24 * 3600 * 1000;
const TOKEN_UPD_TIME = 1 * 3600 * 1000;
const USER_UPD_TIME = (1 * 3600 + 15 * 60) * 1000;

const USER_FIELDS = ["Id", "Name", "PData"];
const CONV_USER_DATA_FN = (rawUser) => {
    try {
        rawUser.PData = JSON.parse(rawUser.PData);
    }
    catch (e) { rawUser.PData = {}; }
    return rawUser;
};

exports.UsersBaseCache = class UsersBaseCache {
    constructor(opts) {
        let options = opts || {};
        this._userFields = options.userFields || USER_FIELDS;
        this._tokenExpTime = options.tokenExpTime ? options.tokenExpTime : TOKEN_EXP_TIME;
        this._tokenUpdTime = options.tokenUpdTime ? options.tokenUpdTime : TOKEN_UPD_TIME;
        this._userUpdTime = options.userUpdTime ? options.userUpdTime : USER_UPD_TIME;
        this._convUserDataFn = typeof (options.convUserDataFn) === "function" ? options.convUserDataFn : CONV_USER_DATA_FN;
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

    destroyToken(token) {
        return this._destroyToken(token);
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

    _destroyToken(token) {
        Promise.reject(new Error("UsersBaseCache::_destroyToken should be implemented in descendant."));
    }
}
