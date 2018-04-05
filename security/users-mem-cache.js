'use strict'
const { UsersBaseCache }= require('./users-base-cache');

class UsersMemCache extends UsersBaseCache {

    constructor(opts) {
        super(opts);
        this._users = {};
    }

    _storeUser(user) {
        return new Promise(((resolve) => {
            this._users["uid:" + user.Id] = user;
            resolve(user);
        }).bind(this));
    }

    _getUser(id) {
        return new Promise(((resolve) => {
            resolve(this._users["uid:" + id]);
        }).bind(this));
    }

    _checkToken(token, isNew) {
        return new Promise(((resolve, reject) => {
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
        }).bind(this));
    }

    _destroyToken(token) {
        return new Promise((resolve)=>{
            delete this._users[token];
            resolve();
        })
    }
}

let usersMemCache = null;
exports.UsersMemCache = (opts) => {
    return usersMemCache ? usersMemCache : new UsersMemCache(opts);
}