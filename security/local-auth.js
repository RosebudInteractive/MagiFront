'use strict'
const config = require('config');
const passport = require("passport");
const passportLocal = require("passport-local");
const { HttpCode } = require("../const/http-codes");
const { UsersMemCache } = require("./users-mem-cache");
const { UsersRedisCache } = require("./users-redis-cache");
const serialize = require('./serialize');

class AuthLocal {

    static destroySession(req) {
        return new Promise((resolve, reject) => {
            if (req.session)
                req.session.destroy((err) => {
                    if (err) reject(err)
                    else resolve();
                });
            else
                resolve();
        })
    }

    constructor(app) {
        const LocalStrategy = passportLocal.Strategy;
        const localOptions =
            {
                usernameField: 'name',
                passwordField: 'password',
                passReqToCallback: true,
                session: true
            };
        const convUserDataFn = (rawUser) => {
            try {
                rawUser.PData = JSON.parse(rawUser.PData);
            }
            catch (e) { rawUser.PData = {}; }
            return rawUser;
        };

        this._usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode

        serialize(this._usersCache);

        const strategy = new LocalStrategy(localOptions,
            ((req, login, password, done) => {
                this._usersCache.authUser(login, password)
                    .then((user) => {
                        done(null, user);
                    })
                    .catch((err) => {
                        if (typeof (err) === "string")
                            done(null, false, { message: err })
                        else
                            done(err, null, { message: err.toString() });
                    });
            }).bind(this));

        passport.use(strategy);

        app.post("/api/login",
            (req, res, next) => {
                passport.authenticate('local', (err, user, info) => {
                    if (err || !user) {
                        AuthLocal.destroySession(req)
                            .then(() => {
                                if (err) { return res.status(HttpCode.ERR_UNAUTH).json(info); }
                                if (!user) { return res.status(HttpCode.ERR_UNAUTH).json(info); }
                            })
                            .catch((err) => {
                                res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                            });
                    }
                    else
                        req.logIn(user, (err) => {
                            if (err) {
                                return res.status(HttpCode.ERR_INTERNAL).json(
                                    {
                                        message: err instanceof Error ? err.message : err.toString()
                                    });
                            }
                            return res.json({ userId: user.Id, userName: user.Name });
                        });
                })(req, res, next);
            });
    }
};

const isFeatureEnabled = config.get('authentication.enabled');
let authLocal = null;
let AuthLocalInit = (app) => {
    if ((!authLocal) && isFeatureEnabled)
        authLocal = new AuthLocal(app);
};

exports.AuthLocalInit = AuthLocalInit;
exports.DestroySession = AuthLocal.destroySession;
exports.AuthenticateLocal = (app, isAuthRequired) => {
    AuthLocalInit(app);
    return (req, res, next) => {
        if (!isFeatureEnabled) { return next(); }
        if (isAuthRequired && !req.user)
            return res.status(HttpCode.ERR_UNAUTH).json({ message: "Authorization required" })
        else
            next();    
    };
};