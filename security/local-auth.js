'use strict'
const config = require('config');
const passport = require("passport");
const passportLocal = require("passport-local");
const { HttpCode } = require("../const/http-codes");
const { UsersMemCache } = require("./users-mem-cache");
const { UsersRedisCache } = require("./users-redis-cache");
const { UserRegister } = require("./user-register");
const { UserActivate } = require("./user-activate");
const { UserPwdRecovery } = require("./user-pwd-recovery");
const { UserLoginError } = require("./errors");

const serialize = require('./serialize');

let usersCache = null;

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
                usernameField: 'login',
                passwordField: 'password',
                passReqToCallback: true,
                session: true
            };

        usersCache = this._usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode

        serialize(this._usersCache);

        const strategy = new LocalStrategy(localOptions,
            ((req, login, password, done) => {
                this._usersCache.authUser(login, password)
                    .then((user) => {
                        done(null, user);
                    })
                    .catch((err) => {
                        if (err instanceof UserLoginError)
                            done(null, false, err.info)
                        else
                            if (typeof (err) === "string")
                                done(null, false, { message: err })
                            else
                                done(err);
                    });
            }).bind(this));

        passport.use(strategy);

        app.post("/api/login", StdLoginProcessor('local'));

        app.get("/api/logout", (req, res) => {
            AuthLocal.destroySession(req)
                .then(() => {
                    res.status(HttpCode.OK).json({ message: "OK" });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        });

        app.get(config.authentication.activationRoute + "/:activationKey", (req, res) => {
            UserActivate(req.params.activationKey, this._usersCache)
                .then((user) => {
                    StdLogin(req, res, user, { message: "Activation key has expired." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });

        app.get("/api/recovery/:email", (req, res) => {
            UserPwdRecovery({ key: { Email: req.params.email } }, this._usersCache)
                .then((user) => {
                    res.json(user);
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });

        app.post("/api/pwdrecovery", (req, res) => {
            let activationKey = req.body.activationKey;
            let password = req.body.password;
            this._usersCache.userPwdRecovery({ key: { ActivationKey: activationKey }, Password: password })
                .then((user) => {
                    StdLogin(req, res, user, { message: "User Password Recovery: Unknown error." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });

        app.post("/api/register", (req, res) => {
            let data = { Login: req.body.login };
            let password = req.body.password;
            UserRegister(password, data, this._usersCache)
                .then((user) => {
                    StdLogin(req, res, user, { message: "User Register: Unknown error." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });
    }
};

let StdLogin = (req, res, user, info) => {
    if (!user) {
        AuthLocal.destroySession(req)
            .then(() => {
                res.status(HttpCode.ERR_UNAUTH).json(info);
            })
            .catch((err) => {
                res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
            });
    }
    else
        req.logIn(user, (err) => {
            if (err) {
                res.status(HttpCode.ERR_INTERNAL).json(
                    {
                        message: err instanceof Error ? err.message : err.toString()
                    });
            }
            res.json(usersCache.userToClientJSON(user));
        });
}

let StdLoginProcessor = (strategy) => {
    return (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {
            if (err || !user) {
                AuthLocal.destroySession(req)
                    .then(() => {
                        if (err) { return res.status(HttpCode.ERR_UNAUTH).json({ message: err.toString() }); }
                        if (!user) { return res.status(HttpCode.ERR_UNAUTH).json(info); }
                    })
                    .catch((err) => {
                        res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                    });
            }
            else
                StdLogin(req, res, user);    
        })(req, res, next);
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
exports.StdLoginProcessor = StdLoginProcessor;
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