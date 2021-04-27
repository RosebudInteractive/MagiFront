'use strict'
const { UsersBaseCache }= require('./users-base-cache');
const { TokenType } = require('../../const/common');

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

    _checkToken(token, isNew, options) {
        return new Promise(((resolve, reject) => {
            let opts = options || {};
            let ttype = opts.type ? opts.type : TokenType.Renewable;
            let expTime = opts.expTime ? opts.expTime : this._tokenExpTime;
            let res = this._users[token] ? this._users[token].ttype : 0;
            let now = (new Date()) - 0;
            if (!res && isNew) {
                this._users[token] = { exp: now + expTime, last: now, type: ttype }
                res = ttype;
            }
            else {
                let tdata = this._users[token];
                if (tdata) {
                    if (now > tdata.exp) {
                        delete this._users[token];
                        res = 0;
                    }
                    else
                        if ((tdata.type === TokenType.Renewable) && ((now - tdata.last) >= this._tokenUpdTime)) {
                            tdata.exp = now + this._tokenExpTime;
                            tdata.last = now;
                        }
                }
            }
            resolve(res);
        }).bind(this));
    }

    _setToken(token, data, options) {
        return Promise.resolve();
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
    return usersMemCache = (usersMemCache ? usersMemCache : new UsersMemCache(opts));
}